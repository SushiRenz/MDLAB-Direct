const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('Testing server connection...');
    const response = await fetch('http://localhost:5000/api/health');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest();