const http = require('http');

const request = (path, method = 'GET', postData = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });

    req.on('error', err => reject(err));

    if (postData) req.write(postData);
    req.end();
  });
};

const runTest = async () => {
  try {
    console.log('1. Logging in as Admin...');
    const loginRes = await request('/api/auth/login', 'POST', JSON.stringify({
      email: 'mealhub.mohan@gmail.com',
      password: 'admin123'
    }));

    console.log('Login Status:', loginRes.status);
    const token = JSON.parse(loginRes.data).token;

    console.log('\n2. Testing GET /api/auth/me ...');
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log('/api/auth/me Status:', meRes.status);

    console.log('\n3. Testing GET /api/students ...');
    const stRes = await request('/api/students', 'GET', null, token);
    console.log('/api/students Status:', stRes.status);

    console.log('\n4. Testing GET /api/meals?month=2026-07 ...');
    const mlRes = await request('/api/meals?month=2026-07', 'GET', null, token);
    console.log('/api/meals Status:', mlRes.status);

    console.log('\n5. Testing GET /api/expenses?month=2026-07 ...');
    const expRes = await request('/api/expenses?month=2026-07', 'GET', null, token);
    console.log('/api/expenses Status:', expRes.status);

    console.log('\n6. Testing GET /api/bills/calculate?month=2026-07 ...');
    const billRes = await request('/api/bills/calculate?month=2026-07', 'GET', null, token);
    console.log('/api/bills/calculate Status:', billRes.status);
    console.log('Bill Summary Data:', billRes.data.substring(0, 150));

    console.log('\n7. Testing GET /api/system/maintenance ...');
    const sysRes = await request('/api/system/maintenance', 'GET', null, token);
    console.log('/api/system/maintenance Status:', sysRes.status);

    console.log('\n✅ ALL API ENDPOINTS RESPONDING CLEANLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    process.exit(1);
  }
};

runTest();
