const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Debug: log connection config (without password)
console.log('Database config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database
});

const pool = mysql.createPool(config);

module.exports = pool;
