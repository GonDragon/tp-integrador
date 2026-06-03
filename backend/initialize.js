const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'mysql_db',
            user: 'root',
            password: 'root',
            port: 3306
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS `autoservicio_gym`;');

        await connection.end();
        
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

initializeDatabase();