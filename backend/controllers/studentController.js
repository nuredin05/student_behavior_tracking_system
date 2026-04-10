const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const getAllStudents = async (req, res) => {
  const { role, id: userId } = req.user;
  try {
    let query = `
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
    `;
    let params = [];

    // If teacher, only show students from their assigned classes or homeroom
    if (role === 'teacher') {
      query += `
        WHERE s.class_id IN (
          SELECT id FROM classes WHERE teacher_id = ?
          UNION
          SELECT class_id FROM teacher_assignments WHERE teacher_id = ?
        )
      `;
      params.push(userId, userId);
    }

    query += ` ORDER BY s.last_name, s.first_name`;
    const [students] = await db.query(query, params);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStudentFullProfile = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get Student Info
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // 2. Get Behavior History (Ordered by date)
    const [history] = await db.query(`
      SELECT b.*, bc.name as category_name, bc.type as category_type, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name 
      FROM behavior_records b
      JOIN behavior_categories bc ON b.category_id = bc.id
      JOIN users u ON b.recorded_by = u.id
      WHERE b.student_id = ? AND b.status = 'approved'
      ORDER BY b.incident_date DESC, b.created_at DESC
    `, [id]);

    // 3. Get Active Interventions
    let interventions = [];
    try {
      const [rows] = await db.query(`
        SELECT i.*, u.first_name as creator_first_name, u.last_name as creator_last_name
        FROM interventions i
        JOIN users u ON i.created_by = u.id
        JOIN behavior_records b ON i.behavior_id = b.id
        WHERE b.student_id = ?
        ORDER BY i.created_at DESC
      `, [id]);
      interventions = rows;
    } catch (dbErr) {
      if (dbErr.code === 'ER_NO_SUCH_TABLE') {
        console.log('[SELF-HEAL] Creating missing interventions table...');
        await db.query(`
          CREATE TABLE IF NOT EXISTS interventions (
            id VARCHAR(255) PRIMARY KEY,
            behavior_id VARCHAR(255),
            action_taken TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            assigned_to VARCHAR(255),
            due_date DATE,
            notes TEXT,
            completed_at TIMESTAMP NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (behavior_id) REFERENCES behavior_records(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id)
          )
        `);
      } else {
        throw dbErr;
      }
    }

    res.json({
      student: student[0],
      history,
      interventions
    });
  } catch (error) {
    console.error('Error fetching student full profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new student (Officer task)
const createStudent = async (req, res) => {
  const { admission_number, first_name, last_name, date_of_birth, gender, class_id, photo_url, parent_phone } = req.body;
  const officerId = req.user.id;

  if (!admission_number || !first_name || !last_name || !photo_url) {
    return res.status(400).json({ error: 'admission_number, first_name, last_name, and photo_url are required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'A student with this admission number already exists' });
    }

    const studentId = uuidv4();
    await connection.query(`
      INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, class_id, photo_url, parent_phone, registered_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, admission_number, first_name, last_name, date_of_birth || null, gender || null, class_id || null, photo_url, parent_phone || null, officerId]);

    // --- Link Parent Logic ---
    if (parent_phone && parent_phone.trim() !== '') {
      const phone = parent_phone.trim();

      // 1. Find or Create Parent record (by phone)
      let [parents] = await connection.query('SELECT id FROM parents WHERE phone = ?', [phone]);
      let parentId;

      if (parents.length > 0) {
        parentId = parents[0].id;
      } else {
        parentId = uuidv4();
        await connection.query(`
          INSERT INTO parents (id, phone, first_name, last_name)
          VALUES (?, ?, ?, ?)
        `, [parentId, phone, 'Parent of', `${first_name} ${last_name}`]);
      }

      // 2. Link Student and Parent
      await connection.query(`
        INSERT IGNORE INTO student_parents (student_id, parent_id, relationship, is_primary)
        VALUES (?, ?, 'Parent', true)
      `, [studentId, parentId]);
    }

    await connection.commit();
    res.status(201).json({
      message: 'Student created and linked successfully',
      student: { id: studentId, admission_number, first_name, last_name, photo_url }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

// Update an existing student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth, gender, class_id, status } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE students 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          class_id = ?,
          status = COALESCE(?, status)
      WHERE id = ?
    `, [first_name, last_name, date_of_birth, gender, class_id || null, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found or no changes made' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM students WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const bulkImportStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Excel file is required.' });
  }

  const officerId = req.user.id;
  let successCount = 0;
  let skipCount = 0;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Use absolute path so xlsx.readFile works regardless of cwd
    const absolutePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(absolutePath);
    const sheetName = workbook.SheetNames[0];
    const results = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Fetch all classes for mapping Grade/Section to class_id
    const [classes] = await db.query('SELECT id, grade_level, section FROM classes');
    const classMap = {};
    classes.forEach(c => {
      // Map both "Grade-Section" and "GradeSection" formats
      const key = `${c.grade_level}${c.section}`.toLowerCase().replace(/\s/g, '');
      classMap[key] = c.id;
    });

    for (const rawRow of results) {
      // Normalize keys to lowercase with no spaces/underscores for robust matching
      const row = {};
      for (const key in rawRow) {
        if (key) {
          const normalizedKey = key.toLowerCase().replace(/[\s_]+/g, '');
          // Force all values to strings to handle numeric Excel cells
          row[normalizedKey] = rawRow[key] !== undefined && rawRow[key] !== null
            ? String(rawRow[key]).trim()
            : '';
        }
      }

      const admission_number = row.admissionnumber;
      const first_name = row.firstname;
      const last_name = row.lastname;
      const gender = (row.gender || 'male').toLowerCase();
      const parent_phone = row.parentphone || null;
      const grade = row.grade;
      const section = row.section;

      // Handle Excel date serial number → real date string
      let date_of_birth = null;
      if (row.dateofbirth) {
        // If it's a numeric serial (e.g., 44000), convert via xlsx utility
        const rawDob = rawRow[Object.keys(rawRow).find(k => k.toLowerCase().replace(/[\s_]+/g, '') === 'dateofbirth')];
        if (typeof rawDob === 'number') {
          const jsDate = xlsx.SSF.parse_date_code(rawDob);
          date_of_birth = `${jsDate.y}-${String(jsDate.m).padStart(2, '0')}-${String(jsDate.d).padStart(2, '0')}`;
        } else {
          date_of_birth = row.dateofbirth || null;
        }
      }

      if (!admission_number || !first_name || !last_name) {
        skipCount++;
        continue;
      }

      // Resolve class_id  
      let resolvedClassId = null;
      if (grade && section) {
        const classKey = `${grade}${section}`.toLowerCase().replace(/\s/g, '');
        resolvedClassId = classMap[classKey] || null;
      }

      // Check for existing admission number
      const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
      if (existing.length > 0) {
        skipCount++;
        continue;
      }

      const studentId = uuidv4();
      await connection.query(`
        INSERT INTO students (id, admission_number, first_name, last_name, gender, date_of_birth, class_id, parent_phone, registered_by, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        admission_number,
        first_name,
        last_name,
        ['male', 'female', 'other'].includes(gender) ? gender : 'male',
        date_of_birth,
        resolvedClassId,
        parent_phone,
        officerId,
        ''
      ]);

      // --- Link Parent Logic ---
      if (parent_phone && parent_phone.trim() !== '') {
        const phone = parent_phone.trim();

        // 1. Find or Create Parent record (by phone)
        let [parents] = await connection.query('SELECT id FROM parents WHERE phone = ?', [phone]);
        let parentId;
        if (parents.length > 0) {
          parentId = parents[0].id;
        } else {
          parentId = uuidv4();
          await connection.query(`
            INSERT INTO parents (id, phone, first_name, last_name)
            VALUES (?, ?, ?, ?)
          `, [parentId, phone, 'Parent of', `${first_name} ${last_name}`]);
        }

        // 2. Link Student and Parent
        await connection.query(`
          INSERT IGNORE INTO student_parents (student_id, parent_id, relationship, is_primary)
          VALUES (?, ?, 'Parent', true)
        `, [studentId, parentId]);
      }

      successCount++;
    }
    await connection.commit();

    // Clean up temp file
    fs.unlink(req.file.path, (err) => { if (err) console.error('Cleanup error:', err); });

    res.status(200).json({ message: 'Import complete and parents linked', successCount, skipCount });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Bulk import error:', error.message, error.stack);
    if (req.file && req.file.path) fs.unlink(req.file.path, () => { });
    res.status(500).json({ error: 'Bulk import failed: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
};

const getNextAdmissionNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `AMSS/${year}/`;

    // Find the highest sequence number for this year
    const [rows] = await db.query(`
      SELECT admission_number 
      FROM students 
      WHERE admission_number LIKE ? 
      ORDER BY admission_number DESC 
      LIMIT 1
    `, [`${prefix}%`]);

    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNumberStr = rows[0].admission_number.split('/').pop();
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const nextId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    res.json({ nextId });
  } catch (error) {
    console.error('Error generating next admission number:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const downloadStudentTemplate = async (req, res) => {
  try {
    const data = [
      {
        "Admission Number": "AMSS/001/2026",
        "First Name": "John",
        "Last Name": "Doe",
        "Gender": "male",
        "Date of Birth": "2010-05-15",
        "Parent Phone": "0911223344",
        "Grade": "9",
        "Section": "A"
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=student_enrollment_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
};

const getTopStudents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [students] = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.photo_url, s.current_points, 
             c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.status = 'active'
      ORDER BY s.current_points DESC, s.last_name ASC, s.first_name ASC
      LIMIT ?
    `, [limit]);
    res.json(students);
  } catch (error) {
    console.error('Error fetching top students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPublicStudentProfile = async (req, res) => {
  const { admission_number, parent_phone } = req.body;

  if (!admission_number || !parent_phone) {
    return res.status(400).json({ error: 'Admission number and parent phone are required' });
  }

  try {
    const trimmedAdmission = admission_number.trim();
    const trimmedPhone = parent_phone.trim();

    // Prevent search if phone is suspectly short (e.g. empty)
    if (trimmedPhone.length < 6) {
      return res.status(400).json({ error: 'Please provide a valid registered phone number.' });
    }

    // 1. Verify Student and Phone (Robust matching)
    // We use a combination of exact and suffix matching (last 9 digits) to handle +251 vs 09 formats
    const [student] = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.photo_url, s.current_points, s.admission_number,
             c.grade_level, c.section, s.parent_phone
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE LOWER(TRIM(s.admission_number)) = LOWER(?)
      AND (
        TRIM(s.parent_phone) = ? 
        OR (LENGTH(s.parent_phone) >= 9 AND RIGHT(TRIM(s.parent_phone), 9) = RIGHT(?, 9))
      )
    `, [trimmedAdmission, trimmedPhone, trimmedPhone]);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found or phone number mismatch' });
    }

    const studentId = student[0].id;

    // 2. Get Behavior History
    const [history] = await db.query(`
      SELECT b.incident_date, b.points_applied, b.comment, 
             bc.name as category_name, bc.type as category_type
      FROM behavior_records b
      JOIN behavior_categories bc ON b.category_id = bc.id
      WHERE b.student_id = ? AND b.status = 'approved'
      ORDER BY b.incident_date DESC, b.created_at DESC
    `, [studentId]);

    // 3. Get Active Interventions
    const [interventions] = await db.query(`
      SELECT i.action_taken, i.status, i.created_at
      FROM interventions i
      JOIN behavior_records b ON i.behavior_id = b.id
      WHERE b.student_id = ?
      ORDER BY i.created_at DESC
    `, [studentId]);

    res.json({
      student: student[0],
      history,
      interventions
    });
  } catch (error) {
    console.error('Error fetching public student profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getTopStudents,
  getPublicStudentProfile,
  getStudentFullProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getNextAdmissionNumber,
  downloadStudentTemplate
};
