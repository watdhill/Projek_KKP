// Simple test for snapshot generation API
async function testSnapshotAPI() {
  console.log('🧪 Testing Snapshot Generation API...\n');
  
  try {
    const testData = {
      snapshot_name: "Test_Hierarchical_Export",
      snapshot_year: 2026,
      file_type: "excel",
      selectedFormat: "1", // abcd format
      description: "Test hierarchical archive export",
      filters: {},
      is_official: false,
    };
    
    console.log('📤 Sending request:', testData);
    
    const response = await fetch('http://localhost:5000/api/laporan/snapshots/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Snapshot generated successfully!');
      console.log('📊 Result:', result);
      
      // Try to download the file (optional)
      if (result.data && result.data.id) {
        console.log(`📥 File available for download via: http://localhost:5000/api/laporan/snapshots/${result.data.id}/download`);
      }
    } else {
      console.log('❌ Snapshot generation failed:', result.message);
    }
    
  } catch (error) {
    console.error('🚨 Error testing snapshot API:', error.message);
  }
}

// Run the test
testSnapshotAPI();