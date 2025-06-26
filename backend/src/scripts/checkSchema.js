require('dotenv').config();
const pool = require('../config/database');

async function checkSchema() {
  try {
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      ORDER BY ordinal_position
    `;
    
    const result = await pool.query(query);
    
    console.log('Properties table columns:');
    console.log('========================');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();