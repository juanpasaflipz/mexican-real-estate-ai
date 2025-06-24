require('dotenv').config();
const pool = require('../config/database');

async function testPropertiesQuery() {
  try {
    // Test basic properties query
    console.log('Testing basic properties query...');
    const result = await pool.query('SELECT id, city, state, price FROM properties LIMIT 5');
    console.log('Properties found:', result.rows.length);
    console.log('Sample properties:', result.rows);

    // Check table structure
    console.log('\nChecking properties table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties'
      ORDER BY ordinal_position
    `);
    console.log('Properties columns:', columns.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testPropertiesQuery();