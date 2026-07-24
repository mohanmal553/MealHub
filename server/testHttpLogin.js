const http = require('http');

const data = JSON.stringify({
  email: 'mealhub.mohan@gmail.com',
  password: 'admin123'
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status Code:', res.statusCode);
    console.log('Response Body:', body);
    if (res.statusCode === 200) {
      console.log('✅ HTTP Admin Login Test PASSED!');
    } else {
      console.error('❌ HTTP Admin Login Test FAILED!');
    }
  });
});

req.on('error', (error) => {
  console.error('HTTP Request Error:', error.message);
});

req.write(data);
req.end();
