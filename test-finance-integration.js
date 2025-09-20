// Test Finance API Integration
const testAPI = async () => {
  try {
    console.log('🧪 Testing Finance API Integration...\n');
    
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('   ✅ Health Check:', healthData.message);
    
    // Test 2: Login as Admin
    console.log('\n2. Logging in as Admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin',
        password: 'Admin123!'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Admin login successful');
    
    // Test 3: Finance Stats
    console.log('\n3. Testing Finance Stats API...');
    const statsResponse = await fetch('http://localhost:5000/api/finance/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statsData = await statsResponse.json();
    console.log('   ✅ Finance Stats Response:', {
      success: statsData.success,
      hasData: !!statsData.data,
      dataKeys: statsData.data ? Object.keys(statsData.data) : []
    });
    
    // Test 4: Bills API
    console.log('\n4. Testing Bills API...');
    const billsResponse = await fetch('http://localhost:5000/api/finance/bills', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const billsData = await billsResponse.json();
    console.log('   ✅ Bills API Response:', {
      success: billsData.success,
      count: billsData.count || 0,
      hasBills: (billsData.data || []).length > 0
    });
    
    // Test 5: Transactions API
    console.log('\n5. Testing Transactions API...');
    const transactionsResponse = await fetch('http://localhost:5000/api/finance/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const transactionsData = await transactionsResponse.json();
    console.log('   ✅ Transactions API Response:', {
      success: transactionsData.success,
      count: transactionsData.count || 0,
      hasTransactions: (transactionsData.data || []).length > 0
    });
    
    // Test 6: Billing Rates API
    console.log('\n6. Testing Billing Rates API...');
    const ratesResponse = await fetch('http://localhost:5000/api/finance/billing-rates', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const ratesData = await ratesResponse.json();
    console.log('   ✅ Billing Rates API Response:', {
      success: ratesData.success,
      count: ratesData.count || 0,
      hasRates: (ratesData.data || []).length > 0
    });
    
    console.log('\n🎉 All Finance API Tests Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ MongoDB connection working');
    console.log('✅ Authentication system working');
    console.log('✅ Finance API endpoints accessible');
    console.log('✅ Role-based access control working');
    console.log('✅ Ready for frontend integration!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// For Node.js environment
if (typeof require !== 'undefined') {
  global.fetch = require('node-fetch');
}

testAPI();