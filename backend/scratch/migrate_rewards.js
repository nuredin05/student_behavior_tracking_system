const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Migrating: Creating rewards table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS rewards (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                point_cost INT NOT NULL,
                stock INT DEFAULT -1,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Success: rewards table created.');

        console.log('Migrating: Creating reward_redemptions table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reward_redemptions (
                id VARCHAR(255) PRIMARY KEY,
                reward_id VARCHAR(255),
                student_id VARCHAR(255),
                status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending',
                redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_by VARCHAR(255),
                FOREIGN KEY (reward_id) REFERENCES rewards(id),
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        `);
        console.log('Success: reward_redemptions table created.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
