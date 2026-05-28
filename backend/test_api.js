import axios from 'axios';

async function testApi() {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/mail/send', {
      to: 'yassinerou221@gmail.com',
      subject: 'Test API',
      text: 'Test message'
    });
    console.log("API Response:", res.data);
  } catch (err) {
    console.error("API Error:", err.response ? err.response.data : err.message);
  }
}

testApi();
