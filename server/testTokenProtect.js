const http = require('http');

// Step 1: Login to get token
const loginData = JSON.stringify({
  email: 'mealhub.mohan@gmail.com',
  password: 'admin123'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const loginRes = JSON.parse(body);
    const token = loginRes.token;
    console.log('Login Token Obtained:', token ? 'YES' : 'NO');

    // Step 2: Use Token to fetch /api/auth/me
    const meReq = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (meRes) => {
      let meBody = '';
      meRes.on('data', c => meBody += c);
      meRes.on('end', () => {
        console.log('/api/auth/me HTTP Status:', meRes.statusCode);
        console.log('/api/auth/me Response:', meBody);
        if (meRes.statusCode === 200) {
          console.log('✅ Token Verification & Protect Middleware PASSED!');
        } else {
          console.error('❌ Token Verification FAILED!');
        }
        process.exit(0);
      });
    });

    meReq.end();
  });
});

req.write(loginData);
req.end();
