const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/audit-log?page=1&pageSize=20',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n--- Response Body ---');
    console.log(data.substring(0, 1000));
    
    // Try to parse JSON
    try {
      const json = JSON.parse(data);
      console.log('\n✓ Valid JSON!');
      console.log(JSON.stringify(json, null, 2).substring(0, 500));
    } catch (e) {
      console.log('\n✗ Invalid JSON:', e.message);
      console.log('First 200 chars:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

setTimeout(() => {
  req.end();
}, 2000);
