require('dotenv').config();
const pool = require('../config/database');

async function monitorProgress() {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coords,
        COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coords
      FROM properties
      WHERE address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    const percentage = ((stats.with_coords / stats.total) * 100).toFixed(1);
    
    console.clear();
    console.log('🌍 Geocoding Progress Monitor');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total properties: ${parseInt(stats.total).toLocaleString()}`);
    console.log(`With coordinates: ${parseInt(stats.with_coords).toLocaleString()} (${percentage}%)`);
    console.log(`Without coordinates: ${parseInt(stats.without_coords).toLocaleString()}`);
    console.log('\nProgress bar:');
    
    const barLength = 50;
    const filled = Math.round((stats.with_coords / stats.total) * barLength);
    const empty = barLength - filled;
    console.log('[' + '█'.repeat(filled) + '░'.repeat(empty) + ']');
    
    console.log('\nPress Ctrl+C to exit');
    
    // Update every 5 seconds
    setTimeout(() => monitorProgress(), 5000);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

monitorProgress();