require('dotenv').config()

console.log('Checking database connection settings...')

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL

if (!dbUrl) {
  console.error('❌ No DATABASE_URL found in environment!')
  process.exit(1)
}

// Parse the connection string
try {
  const url = new URL(dbUrl)
  console.log('\nConnection details:')
  console.log('- Protocol:', url.protocol)
  console.log('- Host:', url.hostname)
  console.log('- Port:', url.port || '5432')
  console.log('- Database:', url.pathname.slice(1))
  console.log('- User:', url.username)
  console.log('- Password:', '***' + url.password.slice(-4))
  
  // Check if it's a Supabase URL
  if (url.hostname.includes('supabase.co')) {
    console.log('\n✓ This is a Supabase database')
    console.log('✓ SSL is required for Supabase connections')
    
    // Check if using pooler
    if (url.port === '6543') {
      console.log('✓ Using Supabase connection pooler (port 6543)')
    } else if (url.port === '5432' || !url.port) {
      console.log('⚠️  Using direct connection (port 5432)')
      console.log('   Consider using the pooler connection string instead')
    }
  }
  
  console.log('\n📋 Next steps:')
  console.log('1. Make sure your backend server is restarted')
  console.log('2. If still failing, try using the Supabase pooler URL')
  console.log('3. Check Supabase dashboard for connection string options')
  
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format:', error.message)
}