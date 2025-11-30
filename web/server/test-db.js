const pool = require('./config/database');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('✓ Database connection successful!');
        console.log('Test query result:', rows[0].result);
        
        // Test repos table
        const [reposCount] = await pool.query('SELECT COUNT(*) as count FROM repos');
        console.log(`✓ Repos table: ${reposCount[0].count} records`);
        
        // Test authors table
        const [authorsCount] = await pool.query('SELECT COUNT(*) as count FROM authors');
        console.log(`✓ Authors table: ${authorsCount[0].count} records`);
        
        process.exit(0);
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
