const mongoose = require('mongoose');

// Import models
const TestResult = require('./models/TestResult');
const Appointment = require('./models/Appointment');

async function checkRealTestResultsData() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
        console.log('✅ Connected to MongoDB');
        
        // Check what appointments exist
        console.log('\n📋 Checking appointments...');
        const appointments = await Appointment.find({});
        console.log(`Found ${appointments.length} appointments`);
        
        appointments.forEach((apt, index) => {
            console.log(`${index + 1}. ${apt.appointmentId} - ${apt.patientName} - Status: ${apt.status}`);
        });
        
        // Check what test results exist
        console.log('\n🧪 Checking test results...');
        const testResults = await TestResult.find({}).limit(5).populate('appointment');
        console.log(`Found ${testResults.length} test results`);
        
        testResults.forEach((result, index) => {
            console.log(`\n${index + 1}. Test Result ID: ${result._id}`);
            console.log(`   - Test Type: ${result.testType}`);
            console.log(`   - Status: ${result.status}`);
            console.log(`   - Appointment: ${result.appointment?.appointmentId || 'No appointment'}`);
            console.log(`   - Results Type: ${typeof result.results} (${result.results instanceof Map ? 'Map' : 'Object'})`);
            
            if (result.results) {
                if (result.results instanceof Map) {
                    console.log(`   - Results Map Keys: [${Array.from(result.results.keys()).join(', ')}]`);
                    
                    // Show specific values
                    const sampleKeys = ['hemoglobin', 'hematocrit', 'fbs', 'cholesterol'];
                    sampleKeys.forEach(key => {
                        const value = result.results.get(key);
                        if (value !== undefined) {
                            console.log(`     * ${key}: ${value}`);
                        }
                    });
                } else {
                    console.log(`   - Results Object Keys: [${Object.keys(result.results).join(', ')}]`);
                    
                    // Show specific values
                    const sampleKeys = ['hemoglobin', 'hematocrit', 'fbs', 'cholesterol'];
                    sampleKeys.forEach(key => {
                        if (result.results[key] !== undefined) {
                            console.log(`     * ${key}: ${result.results[key]}`);
                        }
                    });
                }
            }
        });
        
        // Check specific appointments from our test data
        console.log('\n🎯 Checking specific test appointments...');
        const testAppointments = ['APT-HEMATOLOGY-001', 'APT-CHEMISTRY-001', 'APT-COMBINED-001'];
        
        for (const aptId of testAppointments) {
            const appointment = await Appointment.findOne({ appointmentId: aptId });
            if (appointment) {
                console.log(`\n✅ Found appointment: ${aptId}`);
                console.log(`   - Patient: ${appointment.patientName}`);
                console.log(`   - Status: ${appointment.status}`);
                
                // Find test results for this appointment
                const aptTestResults = await TestResult.find({ appointment: appointment._id });
                console.log(`   - Test Results Count: ${aptTestResults.length}`);
                
                aptTestResults.forEach((result, i) => {
                    console.log(`   - Test ${i + 1}: ${result.testType} (Status: ${result.status})`);
                    if (result.results instanceof Map) {
                        console.log(`     Results: ${Object.fromEntries(result.results)}`);
                    } else {
                        console.log(`     Results:`, result.results);
                    }
                });
            } else {
                console.log(`❌ Appointment not found: ${aptId}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

checkRealTestResultsData();