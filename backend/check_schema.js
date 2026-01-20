const pool = require('./src/config/database');
const fs = require('fs');

async function checkSchema() {
    try {
        const tables = ['master_eselon1', 'master_eselon2'];
        let output = '';

        for (const table of tables) {
            const [rows] = await pool.query(`DESCRIBE ${table}`);
            output += `Table: ${table}\n`;
            output += JSON.stringify(rows, null, 2) + '\n\n';
        }

        fs.writeFileSync('schema_output.txt', output);
        console.log('Schema saved to schema_output.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
