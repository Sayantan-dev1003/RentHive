const http = require('http');

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'password123',
  phone: '9876543210',
  role: 'customer'
};

const data = JSON.stringify(testUser);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing registration with:', testUser.email);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('📝 Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ REGISTRATION WORKS! User created successfully.');
        console.log('🎉 Your registration issue is FIXED!');
      } else {
        console.log('❌ Registration failed:', response.message);
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  console.log('💡 Make sure the server is running with: npm start');
});

req.write(data);
req.end();
