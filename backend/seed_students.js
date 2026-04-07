const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const studentNames = [
  "Ameterhman Oumer Kassahun",
  "Aya Nurhussen Taha",
  "Elham Abduljelil Reshad",
  "Eman Jemal Awol",
  "Eneb Mohammednur Redwan",
  "Hanan Ahmedin Redi",
  "Hanif Nejmudin Ahmed",
  "Hanifa Said Ahmed",
  "Hareem Mohammed Abdella",
  "Mahmud Bekri Mohammed",
  "Mohammed Abdulwehab Abdurahman",
  "Mohammed Kalied Mohammed",
  "Mohammed Mustefa Ahmedin",
  "Muhammed Mustepha Seid",
  "Nebil Abdulwahid Yasin",
  "Newara Jafar Abamecha",
  "Nurhan Ayub Getachew",
  "Obaid Ibrahim Hassen",
  "Ousman Mohialdin Ousman",
  "Sebrina Neja Wudmatas",
  "Sumeya Mohammed Basha",
  "Wildan Mohammed Osman",
  "Zekerya Seid Ayub"
];

async function seed() {
  try {
    console.log('Starting seed process...');
    
    // 1. Ensure Class 9A exists
    let classId;
    const [classes] = await db.query('SELECT id FROM classes WHERE grade_level = 9 AND section = "A"');
    
    if (classes.length > 0) {
      classId = classes[0].id;
      console.log('Class 9A found.');
    } else {
      classId = uuidv4();
      await db.query(`
        INSERT INTO classes (id, grade_level, section, academic_year)
        VALUES (?, ?, ?, ?)
      `, [classId, 9, 'A', '2023/2024']);
      console.log('Class 9A created.');
    }

    // 2. Insert Students
    for (let i = 0; i < studentNames.length; i++) {
      const fullName = studentNames[i];
      const parts = fullName.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      
      const adminNo = `AM/9A/${String(i + 1).padStart(3, '0')}`;
      const studentId = uuidv4();
      const photoUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&size=512`;

      await db.query(`
        INSERT INTO students (id, admission_number, first_name, last_name, class_id, photo_url, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `, [studentId, adminNo, firstName, lastName, classId, photoUrl]);
      
      console.log(`Inserted: ${fullName} (${adminNo})`);
    }

    console.log('\n✅ Successfully inserted 23 students into Grade 9A!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
