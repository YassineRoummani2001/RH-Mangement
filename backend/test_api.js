const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8000/api/auth/login', { username: 'yassinerou221@gmail.com', password: 'password123' });
    const token = loginRes.data.token;
    const meRes = await axios.get('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log(JSON.stringify(meRes.data, null, 2));
  } catch (e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
