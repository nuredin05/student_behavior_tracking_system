const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const csv = require('csv-parser');

const getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.last_name, s.first_name
    `;
    const [students] = await db.query(query);
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
  console.log('Fetching full profile for student ID:', id);
  try {
    // 1. Get Student Info
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    console.log('Student query result rows:', student.length);

    if (student.length === 0) {
      console.warn('Student not found in DB for ID:', id);
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
  const officerId = req.user.id; // From authMiddleware

  if (!admission_number || !first_name || !last_name || !photo_url) {
    return res.status(400).json({ error: 'admission_number, first_name, last_name, and photo_url are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A student with this admission number already exists' });
    }

    const studentId = uuidv4();
    await db.query(`
      INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, class_id, photo_url, parent_phone, registered_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, admission_number, first_name, last_name, date_of_birth || null, gender || null, class_id || null, photo_url, parent_phone || null, officerId]);

    res.status(201).json({ 
      message: 'Student created successfully',
      student: { id: studentId, admission_number, first_name, last_name, photo_url }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

const bulkImportStudents = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required.' });
  }

  const officerId = req.user.id;
  const results = [];
  let successCount = 0;
  let skipCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          const { admission_number, first_name, last_name, gender, date_of_birth, class_id, parent_phone } = row;

          if (!admission_number || !first_name || !last_name) {
            skipCount++;
            continue;
          }

          const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
          if (existing.length > 0) {
            skipCount++;
            continue; // Skip duplicates
          }

          const studentId = uuidv4();
          await db.query(`
            INSERT INTO students (id, admission_number, first_name, last_name, gender, date_of_birth, class_id, parent_phone, registered_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            studentId, 
            admission_number, 
            first_name, 
            last_name, 
            gender || null, 
            date_of_birth || null, 
            class_id || null, 
            parent_phone || null,
            officerId
          ]);
          successCount++;
        }
        
        // Clean up temp file
        fs.unlink(req.file.path, (err) => { if(err) console.error(err); });

        res.status(200).json({ message: 'Import complete', successCount, skipCount });
      } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Bulk import logic failed' });
      }
    })
    .on('error', (err) => {
      console.error('CSV parse error:', err);
      res.status(500).json({ error: 'Failed to parse CSV' });
    });
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentFullProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents
};
