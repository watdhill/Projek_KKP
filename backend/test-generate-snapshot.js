const pool = require('./src/config/database');

async function testGenerateSnapshot() {
  try {
    console.log('Testing generate snapshot...\n');
    
    const testData = {
      snapshot_name: "Test_Laporan_2026",
      snapshot_year: 2026,
      file_type: "excel",
      description: "Test snapshot",
      filters: {},
      is_official: false
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/laporan/snapshots/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    console.log('\n=== RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Snapshot created:', data.data?.snapshot_name);
    } else {
      console.log('\n❌ FAILED:', data.message);
      if (data.error) {
        console.log('Error details:', data.error);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(() => {
  testGenerateSnapshot();
}, 2000);
