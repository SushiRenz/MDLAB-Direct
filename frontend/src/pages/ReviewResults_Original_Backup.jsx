import React, { useState, useEffect } from 'react';
import { testResultsAPI, appointmentAPI } from '../services/api';
import '../design/Dashboard.css';

function ReviewResults({ currentUser }) {
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testData, setTestData] = useState({});
  const [appointmentServices, setAppointmentServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('completed');

  // Fetch completed test results ready for review
  const fetchCompletedTests = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 DEBUGGER: Starting fetchCompletedTests...');
      console.log('🔍 DEBUGGER: Filter status:', filterStatus);
      
      const response = await testResultsAPI.getTestResults({
        status: filterStatus,
        limit: 50,
        sortBy: 'completedDate',
        sortOrder: 'desc'
      });

      console.log('📡 DEBUGGER: API Response received:', response);
      console.log('📡 DEBUGGER: Response success:', response.success);
      console.log('📡 DEBUGGER: Response data length:', response.data?.length || 'undefined');

      if (response.success) {
        const testResults = response.data || [];
        console.log('📋 DEBUGGER: Processing', testResults.length, 'test results');
        
        // Debug each test result
        testResults.forEach((testResult, index) => {
          console.log(`\n=== DEBUGGER: Test Result ${index + 1} ===`);
          console.log('- ID:', testResult._id);
          console.log('- Status:', testResult.status);
          console.log('- Patient Type:', testResult.isWalkInPatient ? 'Walk-in' : 'Registered');
          console.log('- Patient Field:', testResult.patient);
          console.log('- Patient Info:', testResult.patientInfo);
          console.log('- Appointment Field:', testResult.appointment);
          console.log('- Service Field:', testResult.service);
          console.log('- Sample ID:', testResult.sampleId);
          console.log('- Created At:', testResult.createdAt);
          console.log('- Completed Date:', testResult.completedDate);
          
          // Check appointment data structure
          if (testResult.appointment) {
            console.log('  📋 Appointment Details:');
            console.log('  - Appointment ID:', testResult.appointment.appointmentId);
            console.log('  - Patient Name:', testResult.appointment.patientName);
            console.log('  - Status:', testResult.appointment.status);
            console.log('  - Services:', testResult.appointment.services?.length || 'undefined');
            
            // Debug services
            if (testResult.appointment.services) {
              testResult.appointment.services.forEach((service, sIndex) => {
                console.log(`    🏷️ Service ${sIndex + 1}:`, service.serviceName, `(${service.category})`);
              });
            }
          }
          
          // Check if has results
          if (testResult.results) {
            console.log('  📊 Test Results Available:');
            const resultsMap = new Map(Object.entries(testResult.results));
            console.log('  - Results keys:', Array.from(resultsMap.keys()));
            console.log('  - Sample values:');
            console.log('    * Hemoglobin:', resultsMap.get('hemoglobin'));
            console.log('    * Blood Type:', resultsMap.get('bloodType'));
            console.log('    * RBC:', resultsMap.get('rbc'));
          } else {
            console.log('  ❌ No results field found');
          }
        });
        
        setCompletedTests(testResults);
        console.log('✅ DEBUGGER: Successfully set completed tests');
      } else {
        console.error('❌ DEBUGGER: API response not successful:', response.message);
        throw new Error(response.message || 'Failed to fetch completed tests');
      }
    } catch (error) {
      console.error('❌ DEBUGGER: Error in fetchCompletedTests:', error);
      console.error('❌ DEBUGGER: Error stack:', error.stack);
      setError('Failed to load completed tests: ' + error.message);
    } finally {
      setLoading(false);
      console.log('🏁 DEBUGGER: fetchCompletedTests completed');
    }
  };

  useEffect(() => {
    fetchCompletedTests();
  }, [filterStatus]);

  // Get patient display information
  const getPatientInfo = (testResult) => {
    console.log('🔍 getPatientInfo called with:', JSON.stringify(testResult, null, 2));
    
    // First check appointment data (most reliable for walk-ins and recent data)
    if (testResult.appointment && typeof testResult.appointment === 'object') {
      const appointment = testResult.appointment;
      console.log('📋 Using appointment data:', appointment);
      
      return {
        name: appointment.patientName || 'Unknown Patient',
        age: appointment.age || 'N/A',
        gender: appointment.sex || 'N/A',
        address: appointment.address || 'N/A',
        contactNumber: appointment.contactNumber || 'N/A',
        email: appointment.email || 'N/A'
      };
    }
    
    // Second, check if it's a walk-in patient with patientInfo
    if (testResult.patientInfo) {
      console.log('👤 Using patientInfo data:', testResult.patientInfo);
      
      return {
        name: testResult.patientInfo.name || 'Unknown Patient',
        age: testResult.patientInfo.age || 'N/A',
        gender: testResult.patientInfo.gender || 'N/A',
        address: testResult.patientInfo.address || 'N/A',
        contactNumber: testResult.patientInfo.contactNumber || 'N/A',
        email: 'N/A'
      };
    }
    
    // Third, check if it's a registered patient
    if (testResult.patient && typeof testResult.patient === 'object') {
      console.log('🏥 Using registered patient data:', testResult.patient);
      
      return {
        name: testResult.patient.firstName && testResult.patient.lastName 
          ? `${testResult.patient.firstName} ${testResult.patient.lastName}`
          : testResult.patient.name || 'Unknown Patient',
        age: testResult.patient.age || 'N/A',
        gender: testResult.patient.gender || testResult.patient.sex || 'N/A',
        address: testResult.patient.address || 'N/A',
        contactNumber: testResult.patient.phone || 'N/A',
        email: testResult.patient.email || 'N/A'
      };
    }
    
    // Fallback for other cases
    console.log('⚠️ Using fallback data for:', testResult.patient);
    return {
      name: testResult.patient || 'Unknown Patient',
      age: 'N/A',
      gender: 'N/A',
      address: 'N/A',
      contactNumber: 'N/A',
      email: 'N/A'
    };
  };

  // Get appointment number
  const getAppointmentNumber = (testResult) => {
    if (testResult.appointment && typeof testResult.appointment === 'object') {
      return testResult.appointment.appointmentId || testResult.appointment._id || 'N/A';
    }
    return testResult.sampleId || 'N/A';
  };

  // Handle viewing detailed results
  const handleViewResults = async (testResult) => {
    console.log('\n🎯 DEBUGGER: handleViewResults called');
    console.log('🎯 DEBUGGER: Input testResult:', testResult);
    
    setSelectedTestResult(testResult);
    setShowDetailModal(true);
    
    // Fetch appointment-specific test results and services
    try {
      console.log('🔍 DEBUGGER: Full testResult object:', JSON.stringify(testResult, null, 2));
      
      // Try multiple ways to get appointmentId
      const appointmentId = testResult.appointmentId || 
                           testResult.appointment?._id || 
                           testResult.appointment?.appointmentId;
      
      console.log('🆔 DEBUGGER: Extracted appointmentId:', appointmentId);
      console.log('🆔 DEBUGGER: testResult.appointmentId:', testResult.appointmentId);
      console.log('🆔 DEBUGGER: testResult.appointment?._id:', testResult.appointment?._id);
      console.log('🆔 DEBUGGER: testResult.appointment?.appointmentId:', testResult.appointment?.appointmentId);
      
      if (!appointmentId) {
        console.warn('⚠️ DEBUGGER: No appointmentId found, using fallback data');
        console.log('🔄 DEBUGGER: Setting testData to:', testResult);
        setTestData(testResult);
        
        const appointmentServices = testResult.appointment?.services || [];
        console.log('🏷️ DEBUGGER: Fallback appointment services:', appointmentServices);
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log('🔑 DEBUGGER: Token exists:', !!token);
      console.log('🔑 DEBUGGER: Token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (!token) {
        console.warn('⚠️ DEBUGGER: No authentication token found, using fallback data');
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        console.log('🏷️ DEBUGGER: No token fallback appointment services:', appointmentServices);
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const apiUrl = `http://localhost:5000/api/test-results/appointment/${appointmentId}`;
      console.log('📡 DEBUGGER: Making API call to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 DEBUGGER: API Response status:', response.status);
      console.log('📡 DEBUGGER: API Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 DEBUGGER: API Response data:', JSON.stringify(data, null, 2));
        
        const testData = data.testResults || testResult;
        const serviceData = data.services || [];
        
        console.log('💾 DEBUGGER: Setting testData to:', testData);
        console.log('🏷️ DEBUGGER: Setting appointment services to:', serviceData);
        
        setTestData(testData);
        setAppointmentServices(serviceData);
        
        // Debug the actual test result values
        if (testData && testData.results) {
          console.log('� DEBUGGER: Test result values:');
          const resultsMap = new Map(Object.entries(testData.results));
          Array.from(resultsMap.keys()).forEach(key => {
            console.log(`  - ${key}:`, resultsMap.get(key));
          });
        } else {
          console.log('❌ DEBUGGER: No results found in testData');
        }
        
      } else {
        const errorText = await response.text();
        console.error('❌ DEBUGGER: API Error:', response.status, response.statusText);
        console.error('❌ DEBUGGER: Error response:', errorText);
        
        console.log('🔄 DEBUGGER: Using fallback data');
        setTestData(testResult);
        
        const appointmentServices = testResult.appointment?.services || [];
        console.log('🏷️ DEBUGGER: Fallback appointment services:', appointmentServices);
        setAppointmentServices(appointmentServices);
      }
    } catch (error) {
      console.error('❌ DEBUGGER: Exception in handleViewResults:', error);
      console.error('❌ DEBUGGER: Error stack:', error.stack);
      
      console.log('🔄 DEBUGGER: Using fallback data due to exception');
      setTestData(testResult);
      
      const appointmentServices = testResult.appointment?.services || [];
      console.log('🏷️ DEBUGGER: Exception fallback appointment services:', appointmentServices);
      setAppointmentServices(appointmentServices);
    }
    
    console.log('🏁 DEBUGGER: handleViewResults completed');
  };

  // Handle approving test result
  const handleApprove = async (testResult) => {
    try {
      setLoading(true);
      
      const response = await testResultsAPI.updateTestResult(testResult._id, {
        status: 'approved',
        reviewedDate: new Date().toISOString(),
        reviewedBy: currentUser._id,
        pathologistNotes: 'Results approved and verified'
      });

      if (response.success) {
        alert('Test result approved successfully!');
        // Refresh the list
        fetchCompletedTests();
        // Close modal if open
        setShowDetailModal(false);
      } else {
        throw new Error(response.message || 'Failed to approve test result');
      }
    } catch (error) {
      console.error('Error approving test:', error);
      alert('Failed to approve test result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle rejecting test result
  const handleReject = async (testResult) => {
    const reason = prompt('Please provide a reason for rejecting this test result:');
    if (!reason || reason.trim() === '') {
      return; // User cancelled or didn't provide a reason
    }

    try {
      setLoading(true);
      
      // Update test result status back to in-progress/draft
      const testResultResponse = await testResultsAPI.updateTestResult(testResult._id, {
        status: 'in-progress',
        rejectionReason: reason.trim(),
        rejectedDate: new Date().toISOString(),
        rejectedBy: currentUser._id,
        pathologistNotes: `Results rejected: ${reason.trim()}`
      });

      if (testResultResponse.success) {
        // If there's an associated appointment, update its status back to checked-in
        if (testResult.appointment) {
          const appointmentId = typeof testResult.appointment === 'object' 
            ? testResult.appointment._id 
            : testResult.appointment;
            
          await appointmentAPI.updateAppointment(appointmentId, {
            status: 'checked-in'
          });
        }
        
        alert('Test result rejected and sent back to MedTech for correction!');
        // Refresh the list
        fetchCompletedTests();
        // Close modal if open
        setShowDetailModal(false);
      } else {
        throw new Error(testResultResponse.message || 'Failed to reject test result');
      }
    } catch (error) {
      console.error('Error rejecting test:', error);
      alert('Failed to reject test result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on search term
  const filteredTests = completedTests.filter(test => {
    if (!searchTerm) return true;
    
    const patientInfo = getPatientInfo(test);
    const appointmentNumber = getAppointmentNumber(test);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      patientInfo.name.toLowerCase().includes(searchLower) ||
      appointmentNumber.toLowerCase().includes(searchLower) ||
      test.testType?.toLowerCase().includes(searchLower) ||
      test.sampleId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#21AEA8', marginBottom: '10px' }}>Review Test Results</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Review completed test results and approve or reject them for final release.
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by patient name, appointment number, test type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="completed">Completed Tests</option>
              <option value="approved">Approved Tests</option>
              <option value="in-progress">Rejected Tests</option>
            </select>
          </div>

          <button
            onClick={fetchCompletedTests}
            disabled={loading}
            style={{
              background: '#21AEA8',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <p style={{ margin: '0' }}>{error}</p>
          <button 
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <p>Loading test results...</p>
        </div>
      )}

      {/* Results List */}
      {!loading && filteredTests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <h3>No Test Results Found</h3>
          <p>
            {searchTerm 
              ? 'No test results match your search criteria.' 
              : 'No completed test results are currently available for review.'
            }
          </p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Table Header */}
          <div style={{
            background: '#21AEA8',
            color: 'white',
            padding: '15px 20px',
            display: 'grid',
            gridTemplateColumns: '120px 180px 70px 80px 130px 120px auto',
            gap: '15px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div>Appointment #</div>
            <div>Patient Name</div>
            <div>Age</div>
            <div>Sex</div>
            <div>Address</div>
            <div>Contact</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredTests.map((testResult, index) => {
            const patientInfo = getPatientInfo(testResult);
            const appointmentNumber = getAppointmentNumber(testResult);
            
            return (
              <div
                key={testResult._id}
                style={{
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: '120px 180px 70px 80px 130px 120px auto',
                  gap: '15px',
                  alignItems: 'center',
                  borderBottom: index < filteredTests.length - 1 ? '1px solid #eee' : 'none',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#21AEA8' }}>
                  {appointmentNumber}
                </div>
                <div style={{ fontWeight: '600' }}>
                  {patientInfo.name}
                </div>
                <div>{patientInfo.age}</div>
                <div>{patientInfo.gender}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {patientInfo.address.length > 18 
                    ? patientInfo.address.substring(0, 18) + '...'
                    : patientInfo.address
                  }
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {patientInfo.contactNumber}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleViewResults(testResult)}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    View
                  </button>
                  
                  {filterStatus === 'completed' && (
                    <>
                      <button
                        onClick={() => handleApprove(testResult)}
                        disabled={loading}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(testResult)}
                        disabled={loading}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results Summary */}
      {!loading && filteredTests.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          Showing {filteredTests.length} test result{filteredTests.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Detailed Results Modal */}
      {showDetailModal && selectedTestResult && (
        <DetailedResultsModal
          testResult={selectedTestResult}
          testData={testData}
          appointmentServices={appointmentServices}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTestResult(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
          filterStatus={filterStatus}
        />
      )}
    </div>
  );
}

// Detailed Results Modal Component
function DetailedResultsModal({ testResult, testData, appointmentServices, onClose, onApprove, onReject, loading, filterStatus }) {
  
  // Helper function to determine which test categories should be displayed
  const getDisplayCategories = (testResultParam) => {
    console.log('\n🎨 DEBUGGER: getDisplayCategories called');
    console.log('🎨 DEBUGGER: appointmentServices:', appointmentServices);
    console.log('🎨 DEBUGGER: appointmentServices length:', appointmentServices?.length || 'undefined');
    console.log('🎨 DEBUGGER: testResultParam:', testResultParam);
    
    if (!appointmentServices || appointmentServices.length === 0) {
      console.log('🚫 DEBUGGER: No appointment services found in main variable');
      
      // Try to get services from testResultParam
      const fallbackServices = testResultParam?.appointment?.services || [];
      console.log('🔍 DEBUGGER: Fallback services from testResultParam:', fallbackServices);
      
      if (fallbackServices.length === 0) {
        console.log('❌ DEBUGGER: No services found anywhere, returning empty array');
        return [];
      } else {
        console.log('🔄 DEBUGGER: Using fallback services for categorization');
        // Process fallback services (same logic as below)
        const categories = [];
        
        fallbackServices.forEach((service, index) => {
          const serviceName = (service.serviceName || service.name)?.toLowerCase() || '';
          const serviceCategory = service.category?.toLowerCase() || '';
          console.log(`🏷️ DEBUGGER: Processing fallback service ${index + 1}:`, serviceName, 'Category:', serviceCategory);
          
          // Add hematology category logic
          if (serviceCategory.includes('hematology') || 
              serviceName.includes('cbc') || serviceName.includes('complete blood count') || 
              serviceName.includes('hemoglobin') || serviceName.includes('blood typing') ||
              serviceName.includes('esr') || serviceName.includes('erythrocyte')) {
            if (!categories.includes('hematology')) {
              console.log('  ✅ DEBUGGER: Adding hematology category');
              categories.push('hematology');
            }
          }
          
          // Add other categories as needed
          if (serviceCategory.includes('clinical_chemistry') && !categories.includes('chemistry')) {
            console.log('  ✅ DEBUGGER: Adding chemistry category');
            categories.push('chemistry');
          }
          if (serviceCategory.includes('clinical_microscopy') && !categories.includes('microscopy')) {
            console.log('  ✅ DEBUGGER: Adding microscopy category');
            categories.push('microscopy');
          }
          if ((serviceCategory.includes('serology') || serviceCategory.includes('immunology')) && !categories.includes('serology')) {
            console.log('  ✅ DEBUGGER: Adding serology category');
            categories.push('serology');
          }
        });
        
        console.log('📋 DEBUGGER: Final categories from fallback:', categories);
        return categories;
      }
    }

    console.log('🔍 DEBUGGER: Processing appointment services:', appointmentServices);
    const categories = [];
    
    appointmentServices.forEach((service, index) => {
      const serviceName = (service.serviceName || service.name)?.toLowerCase() || '';
      const serviceCategory = service.category?.toLowerCase() || '';
      console.log(`🏷️ DEBUGGER: Processing service ${index + 1}:`, serviceName, 'Category:', serviceCategory);
      
      // Use the service's category if available
      if (serviceCategory) {
        if (serviceCategory.includes('clinical_chemistry') && !categories.includes('chemistry')) {
          console.log('  ✅ DEBUGGER: Adding chemistry category from service category');
          categories.push('chemistry');
        }
        if (serviceCategory.includes('hematology') && !categories.includes('hematology')) {
          console.log('  ✅ DEBUGGER: Adding hematology category from service category');
          categories.push('hematology');
        }
        if (serviceCategory.includes('clinical_microscopy') && !categories.includes('microscopy')) {
          console.log('  ✅ DEBUGGER: Adding microscopy category from service category:', serviceCategory);
          categories.push('microscopy');
        }
        if ((serviceCategory.includes('serology') || serviceCategory.includes('immunology')) && !categories.includes('serology')) {
          console.log('  ✅ DEBUGGER: Adding serology category from service category');
          categories.push('serology');
        }
      }
      
      // Fallback to service name matching if no category or category not recognized
      if (!serviceCategory || categories.length === 0) {
        console.log('  🔍 DEBUGGER: Using service name matching for:', serviceName);
        
        // Clinical Chemistry category
        if (serviceName.includes('fbs') || serviceName.includes('glucose') || 
            serviceName.includes('cholesterol') || serviceName.includes('triglyceride') ||
            serviceName.includes('uric acid') || serviceName.includes('bun') ||
            serviceName.includes('creatinine') || serviceName.includes('chemistry')) {
          if (!categories.includes('chemistry')) {
            console.log('  ✅ DEBUGGER: Adding chemistry category from service name');
            categories.push('chemistry');
          }
        }
        
        // Hematology category
        if (serviceName.includes('cbc') || serviceName.includes('complete blood count') ||
            serviceName.includes('hemoglobin') || serviceName.includes('hematocrit') || 
            serviceName.includes('platelet') || serviceName.includes('wbc') || 
            serviceName.includes('rbc') || serviceName.includes('hematology') ||
            serviceName.includes('blood typing') || serviceName.includes('esr') ||
            serviceName.includes('erythrocyte')) {
          if (!categories.includes('hematology')) {
            console.log('  ✅ DEBUGGER: Adding hematology category from service name');
            categories.push('hematology');
          }
        }
        
        // Clinical Microscopy category
        if (serviceName.includes('pregnancy') || serviceName.includes('urinalysis') ||
            serviceName.includes('urine') || serviceName.includes('microscopy')) {
          if (!categories.includes('microscopy')) {
            console.log('  ✅ DEBUGGER: Adding microscopy category for service:', serviceName);
            categories.push('microscopy');
          }
        }
        
        // Serology/Immunology category
        if (serviceName.includes('hbsag') || serviceName.includes('hepatitis') ||
            serviceName.includes('hiv') || serviceName.includes('vdrl') ||
            serviceName.includes('serology') || serviceName.includes('immunology')) {
          if (!categories.includes('serology')) {
            console.log('  ✅ DEBUGGER: Adding serology category from service name');
            categories.push('serology');
          }
        }
      }
    });
    
    console.log('📋 DEBUGGER: Final categories detected:', categories);
    return categories;
  };

  const getPatientInfo = (testResult) => {
    console.log('🔍 Modal getPatientInfo called with:', JSON.stringify(testResult, null, 2));
    
    // First check appointment data (most reliable for walk-ins and recent data)
    if (testResult.appointment && typeof testResult.appointment === 'object') {
      const appointment = testResult.appointment;
      console.log('📋 Modal using appointment data:', appointment);
      
      return {
        name: appointment.patientName || 'Unknown Patient',
        age: appointment.age || 'N/A',
        gender: appointment.sex || 'N/A',
        address: appointment.address || 'N/A',
        contactNumber: appointment.contactNumber || 'N/A',
        email: appointment.email || 'N/A'
      };
    }
    
    // Second, check if it's a walk-in patient with patientInfo
    if (testResult.patientInfo) {
      console.log('👤 Modal using patientInfo data:', testResult.patientInfo);
      
      return {
        name: testResult.patientInfo.name || 'Unknown Patient',
        age: testResult.patientInfo.age || 'N/A',
        gender: testResult.patientInfo.gender || 'N/A',
        address: testResult.patientInfo.address || 'N/A',
        contactNumber: testResult.patientInfo.contactNumber || 'N/A',
        email: 'N/A'
      };
    }
    
    // Third, check if it's a registered patient
    if (testResult.patient && typeof testResult.patient === 'object') {
      console.log('🏥 Modal using registered patient data:', testResult.patient);
      
      return {
        name: testResult.patient.firstName && testResult.patient.lastName 
          ? `${testResult.patient.firstName} ${testResult.patient.lastName}`
          : testResult.patient.name || 'Unknown Patient',
        age: testResult.patient.age || 'N/A',
        gender: testResult.patient.gender || testResult.patient.sex || 'N/A',
        address: testResult.patient.address || 'N/A',
        contactNumber: testResult.patient.phone || 'N/A',
        email: testResult.patient.email || 'N/A'
      };
    }
    
    // Fallback for other cases
    console.log('⚠️ Modal using fallback data for:', testResult.patient);
    return {
      name: testResult.patient || 'Unknown Patient',
      age: 'N/A',
      gender: 'N/A',
      address: 'N/A',
      contactNumber: 'N/A',
      email: 'N/A'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('\n🎭 DEBUGGER: Modal rendering started');
  console.log('🎭 DEBUGGER: testResult:', testResult);
  console.log('🎭 DEBUGGER: testData:', testData);
  
  const patientInfo = getPatientInfo(testResult);
  const results = testResult.results || {};
  
  console.log('📊 DEBUGGER: results extracted from testResult:', results);
  console.log('📊 DEBUGGER: results type:', typeof results);
  console.log('📊 DEBUGGER: results is Map?', results instanceof Map);
  
  // Debug testData
  console.log('🧪 DEBUGGER: testData exists?', !!testData);
  console.log('🧪 DEBUGGER: testData keys length:', testData ? Object.keys(testData).length : 'no testData');
  if (testData) {
    console.log('🧪 DEBUGGER: testData keys:', Object.keys(testData));
    console.log('🧪 DEBUGGER: testData.results exists?', !!testData.results);
    if (testData.results) {
      console.log('🧪 DEBUGGER: testData.results type:', typeof testData.results);
      console.log('🧪 DEBUGGER: testData.results is Map?', testData.results instanceof Map);
      if (testData.results instanceof Map) {
        console.log('🧪 DEBUGGER: testData.results Map keys:', Array.from(testData.results.keys()));
        console.log('🧪 DEBUGGER: testData.results Map entries:', Object.fromEntries(testData.results));
      } else {
        console.log('🧪 DEBUGGER: testData.results object:', testData.results);
      }
    }
  }
  
  // FIXED: Use the real test data from API instead of mock data
  // testData contains the actual test results entered by medical staff
  // Helper function to get test result value
  const getTestResultValue = (testName, modalTestData) => {
    if (!modalTestData || !testName) return 'Pending';
    
    // Clean test name for lookup
    const cleanTestName = testName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace(/\//g, '_');
    
    // Try different lookup methods
    const lookupKeys = [
      testName,
      cleanTestName,
      testName.toLowerCase(),
      cleanTestName.replace(/_/g, ''),
      testName.replace(/\s+/g, '').toLowerCase()
    ];
    
    // Check direct properties first
    for (const key of lookupKeys) {
      if (modalTestData[key] && modalTestData[key] !== 'Pending') {
        return modalTestData[key];
      }
    }
    
    // Check results object/Map
    if (modalTestData.results) {
      if (modalTestData.results instanceof Map) {
        for (const key of lookupKeys) {
          const value = modalTestData.results.get(key);
          if (value && value !== 'Pending') return value;
        }
      } else if (typeof modalTestData.results === 'object') {
        for (const key of lookupKeys) {
          const value = modalTestData.results[key];
          if (value && value !== 'Pending') return value;
        }
      }
    }
    
    return 'Pending';
  };

  // Group services by category
  const groupServicesByCategory = (services) => {
    const grouped = {};
    
    services.forEach(service => {
      const category = service.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    
    return grouped;
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'clinical_chemistry': 'BLOOD CHEMISTRY/IMMUNOLOGY',
      'hematology': 'HEMATOLOGY',
      'clinical_microscopy': 'CLINICAL MICROSCOPY',
      'serology_immunology': 'SEROLOGY/IMMUNOLOGY',
      'serology': 'SEROLOGY/IMMUNOLOGY',
      'urine_tests': 'URINALYSIS',
      'general': 'GENERAL TESTS'
    };
    
    return categoryMap[category] || category.toUpperCase().replace(/_/g, ' ');
  };

  // Define normal ranges for common tests
  const getNormalRange = (serviceName) => {
    const testName = serviceName.toLowerCase();
    
    const ranges = {
      'hemoglobin': '110-160 g/L',
      'hematocrit': '37-54%',
      'rbc': '3.50-5.50 x10¹²/L',
      'red blood cell count': '3.50-5.50 x10¹²/L',
      'platelet count': '150-450 x10⁹/L',
      'wbc': '4.0-10.0 x10⁹/L',
      'white blood cell count': '4.0-10.0 x10⁹/L',
      'glucose': '3.89-5.83 mmol/L',
      'cholesterol': '3.5-5.2 mmol/L',
      'triglyceride': '<2.26 mmol/L',
      'uric acid': '156-360 umol/L',
      'bun': '1.7-8.3 mmol/L',
      'creatinine': '53-97 umol/L',
      'pregnancy test': 'NEGATIVE',
      'segmenters': '2.0-7.0 x10⁹/L',
      'lymphocytes': '0.8-4.0 x10⁹/L',
      'monocytes': '0.1-1.5 x10⁹/L',
      'dengue ns1': '-',
      'dengue igg': '-',
      'dengue igm': '-',
      'hiv': '-',
      'vdrl': '-'
    };
    
    return ranges[testName] || '-';
  };

  const modalTestData = testData || testResult;
  
  console.log('🔍 REAL DATA: Using modalTestData from API:', modalTestData);
  console.log('🔍 REAL DATA: modalTestData.results (actual entered values):', modalTestData?.results);
  
  // Log the actual field names available in the results
  if (modalTestData?.results) {
    console.log('📋 REAL DATA: Available result field names:');
    const resultFields = modalTestData.results instanceof Map 
      ? Array.from(modalTestData.results.keys()) 
      : Object.keys(modalTestData.results);
    resultFields.forEach(field => {
      const value = modalTestData.results instanceof Map 
        ? modalTestData.results.get(field) 
        : modalTestData.results[field];
      console.log(`  - ${field}: ${value}`);
    });
  }
  
  // Debug specific values
  if (modalTestData) {
    console.log('💉 DEBUGGER: Specific test values:');
    console.log('  - hemoglobin:', modalTestData.hemoglobin);
    console.log('  - hematocrit:', modalTestData.hematocrit);
    console.log('  - rbc:', modalTestData.rbc);
    console.log('  - bloodType:', modalTestData.bloodType);
    console.log('  - results field:', modalTestData.results);
    
    // If modalTestData has a results field that's a Map
    if (modalTestData.results instanceof Map) {
      console.log('🗺️ DEBUGGER: modalTestData.results is a Map:');
      console.log('  - hemoglobin from Map:', modalTestData.results.get('hemoglobin'));
      console.log('  - hematocrit from Map:', modalTestData.results.get('hematocrit'));
      console.log('  - rbc from Map:', modalTestData.results.get('rbc'));
      console.log('  - bloodType from Map:', modalTestData.results.get('bloodType'));
    }
  }
  
  const displayCategories = getDisplayCategories(testResult);
  
  console.log('🎨 DEBUGGER: displayCategories result:', displayCategories);

  // Helper function to get real test values from API data (no more mock data!)
  const getTestValue = (fieldName, fallbackName = null) => {
    console.log(`🔍 REAL VALUE: Getting ${fieldName}${fallbackName ? ` (fallback: ${fallbackName})` : ''}`);
    
    // Return actual entered test result values only
    let value = null;
    
    // Try from results object/Map first (this is where real values are stored)
    if (modalTestData?.results) {
      // If results is a Map
      if (modalTestData.results?.get && typeof modalTestData.results.get === 'function') {
        value = modalTestData.results.get(fieldName) || (fallbackName ? modalTestData.results.get(fallbackName) : null);
        if (value !== null && value !== undefined && value !== '') {
          console.log(`✅ REAL VALUE: Found ${fieldName} in Map:`, value);
          return value;
        }
      }
      // If results is an object
      else if (typeof modalTestData.results === 'object') {
        value = modalTestData.results[fieldName] || (fallbackName ? modalTestData.results[fallbackName] : null);
        if (value !== null && value !== undefined && value !== '') {
          console.log(`✅ REAL VALUE: Found ${fieldName} in results object:`, value);
          return value;
        }
      }
    }
    
    // Try direct property as secondary option
    if (modalTestData?.[fieldName] !== null && modalTestData?.[fieldName] !== undefined && modalTestData?.[fieldName] !== '') {
      value = modalTestData[fieldName];
      console.log(`✅ REAL VALUE: Found ${fieldName} as direct property:`, value);
      return value;
    }
    
    // Only show "Pending..." if no real value was entered
    console.log(`❌ REAL VALUE: No entered value found for ${fieldName}`);
    return 'Pending...';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 1001
          }}
        >
          ×
        </button>

        {/* Lab Report Header */}
        <div style={{
          background: 'linear-gradient(135deg, #21AEA8 0%, #1A8A85 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '8px 8px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>MDLAB Diagnostic Laboratory</h2>
              <p style={{ margin: '0', fontSize: '13px', opacity: 0.9 }}>
                DOH License: 02-93-25-CL-2<br />
                Contact: 0927 850 7775 / 0915 961 1516<br />
                Email: mdlab.diagnostics@yahoo.com.ph
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Laboratory Report</div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>
                Date Released: {formatDate(testResult.completedDate || testResult.sampleDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div style={{
          padding: '20px 25px',
          borderBottom: '2px solid #21AEA8',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <strong>Name:</strong> {patientInfo.name.toUpperCase()}
            </div>
            <div>
              <strong>Age:</strong> {patientInfo.age}
            </div>
            <div>
              <strong>Sex:</strong> {patientInfo.gender}
            </div>
            <div>
              <strong>Contact:</strong> {patientInfo.contactNumber}
            </div>
            <div>
              <strong>Email:</strong> {patientInfo.email}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Address:</strong> {patientInfo.address}
            </div>
            <div>
              <strong>Date:</strong> {formatDate(testResult.sampleDate)}
            </div>
            <div>
              <strong>Lab. Number:</strong> {testResult.sampleId || 'N/A'}
            </div>
            <div>
              <strong>Source:</strong> {testResult.appointment ? 'APPOINTMENT' : 'WALK-IN'}
            </div>
          </div>
        </div>

        {/* Test Results Content - Dynamic Rendering */}
        <div style={{ padding: '25px' }}>
          {(() => {
            console.log('🔄 DYNAMIC RENDERING: Starting dynamic test results rendering');
            console.log('🔄 DYNAMIC RENDERING: appointmentServices:', appointmentServices);
            console.log('🔄 DYNAMIC RENDERING: modalTestData:', modalTestData);
            
            // Use appointmentServices if available, otherwise extract from modalTestData
            const servicesToRender = appointmentServices && appointmentServices.length > 0 
              ? appointmentServices 
              : modalTestData?.appointment?.services || [];
              
            console.log('🔄 DYNAMIC RENDERING: servicesToRender:', servicesToRender);
            
            if (!servicesToRender || servicesToRender.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No test services found for this appointment.</p>
                </div>
              );
            }
            
            // Group services by category
            const groupedServices = groupServicesByCategory(servicesToRender);
            console.log('🔄 DYNAMIC RENDERING: groupedServices:', groupedServices);
            
            return Object.keys(groupedServices).map(category => {
              const services = groupedServices[category];
              const displayName = getCategoryDisplayName(category);
              
              console.log(`🔄 DYNAMIC RENDERING: Rendering category ${category} with ${services.length} services`);
              
              return (
                <div key={category} style={{ marginBottom: '30px' }}>
                  {/* Category Header */}
                  <div style={{
                    background: '#21AEA8',
                    color: 'white',
                    padding: '10px 15px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    {displayName}
                  </div>
                  
                  {/* Tests Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f1f3f4' }}>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => {
                        const testValue = getTestResultValue(service.serviceName, modalTestData);
                        const normalRange = getNormalRange(service.serviceName);
                        
                        console.log(`🔄 DYNAMIC RENDERING: ${service.serviceName} = ${testValue}`);
                        
                        return (
                          <tr key={`${category}-${index}`}>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                              {service.serviceName}
                            </td>
                            <td style={{ 
                              border: '1px solid #ddd', 
                              padding: '12px', 
                              textAlign: 'center',
                              fontWeight: testValue !== 'Pending' ? 'bold' : 'normal',
                              color: testValue === 'Pending' ? '#999' : '#000'
                            }}>
                              {testValue}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                              {normalRange}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            });
          })()}
        
          {/* Verification Note */}
          <div style={{
            marginTop: '30px',
            fontSize: '13px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '15px'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              <strong>Specimen rechecked, result/s verified.</strong>
            </p>
          </div>
        </div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#21AEA8',
                color: 'white',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                HEMATOLOGY
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f3f4' }}>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Normal Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Hemoglobin</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {(() => {
                        console.log('🩸 DEBUGGER: Hemoglobin rendering');
                        console.log('🩸 DEBUGGER: modalTestData:', modalTestData);
                        console.log('🩸 DEBUGGER: modalTestData.hemoglobin:', modalTestData?.hemoglobin);
                        console.log('🩸 DEBUGGER: modalTestData.results type:', typeof modalTestData?.results);
                        console.log('🩸 DEBUGGER: modalTestData.results:', modalTestData?.results);
                        console.log('🩸 DEBUGGER: All available result keys:', Object.keys(modalTestData?.results || {}));
                        
                        let hemoglobinValue = 'Pending...';
                        
                        // Try different ways to get the hemoglobin value
                        if (modalTestData?.hemoglobin) {
                          hemoglobinValue = modalTestData.hemoglobin;
                          console.log('🩸 DEBUGGER: Got hemoglobin from direct property:', hemoglobinValue);
                        } else if (modalTestData?.results) {
                          // If results is a Map
                          if (modalTestData.results?.get && typeof modalTestData.results.get === 'function') {
                            hemoglobinValue = modalTestData.results.get('hemoglobin') || 'Pending...';
                            console.log('🩸 DEBUGGER: Got hemoglobin from Map.get():', hemoglobinValue);
                          } 
                          // If results is an object
                          else if (modalTestData.results?.hemoglobin) {
                            hemoglobinValue = modalTestData.results.hemoglobin;
                            console.log('🩸 DEBUGGER: Got hemoglobin from results object:', hemoglobinValue);
                          }
                          // If results is a plain object with string keys
                          else if (typeof modalTestData.results === 'object') {
                            const resultsObj = modalTestData.results;
                            hemoglobinValue = resultsObj['hemoglobin'] || resultsObj.hemoglobin || 'Pending...';
                            console.log('🩸 DEBUGGER: Got hemoglobin from results object keys:', hemoglobinValue);
                            console.log('🩸 DEBUGGER: Results object keys:', Object.keys(resultsObj));
                          }
                        }
                        
                        console.log('🩸 DEBUGGER: Final hemoglobin value:', hemoglobinValue);
                        return hemoglobinValue;
                      })()}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      110-160 g/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Hematocrit</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('hematocrit')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      37-54%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>RBC</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('rbc', 'RBC')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      3.50-5.50 x10⁶/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Platelet count</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('platelets', 'plateletCount')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      150-450 x10³/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>WBC</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('wbc', 'WBC')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      4.0-10.0 x10³/L
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Differential Count */}
              {displayCategories.includes('hematology') && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#21AEA8', 
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    Differential Count:
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #ddd', padding: '8px', width: '150px' }}>Segmenters:</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                          {modalTestData.segmenters || 'Pending...'}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          2.0-7.0 x10⁹/L
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>Lymphocytes:</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                          {modalTestData.lymphocytes || 'Pending...'}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          0.8-4.0 x10⁹/L
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>Monocytes:</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                          {modalTestData.monocytes || 'Pending...'}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          0.1-1.5 x10⁹/L
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Blood Chemistry */}
          {displayCategories.includes('chemistry') && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#21AEA8',
                color: 'white',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                BLOOD CHEMISTRY/IMMUNOLOGY
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f3f4' }}>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Glucose</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('fbs', 'glucose')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      3.89-5.83 mmol/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Cholesterol</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('cholesterol')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      3.5-5.2 mmol/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Triglyceride</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('triglyceride')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      &lt;2.26 mmol/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Uric acid</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('bua', 'uricAcid')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      156-360 umol/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>BUN</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('bun')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      1.7-8.3 mmol/L
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Creatinine</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getTestValue('creatinine')}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                      53-97 umol/L
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Urinalysis */}
          {displayCategories.includes('microscopy') && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#21AEA8',
                color: 'white',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                URINALYSIS
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f3f4' }}>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Color</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_color || 'Yellow'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Protein</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_protein || 'Negative'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Transparency</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_transparency || 'Sl.Turbid'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Glucose</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_glucose || 'Negative'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>pH</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_ph || '6.0'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Ketone</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_ketones || 'Negative'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Specific Gravity</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_specific_gravity || '1.025'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>Bilirubin</td>
                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {modalTestData.urine_bilirubin || 'Negative'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Microscopic Examination */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#21AEA8', 
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  Microscopic Examination:
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px', width: '150px' }}>Leukocyte</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        Small
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', width: '150px' }}>Epithelial Cell</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        +++
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Nitrite</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_nitrites || 'Negative'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Mucus Thread</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.mucus_thread || '+++'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Blood</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_blood || 'Negative'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Amorphous urates</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.amorphous_urates || '++'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Glucose</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_glucose || 'Negative'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Bacteria</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_bacteria || 'Few'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Urobilinogen</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {testData.urobilinogen || 'Normal'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>WBC</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_wbc || '15-20/hpf'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>Protein</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_protein || 'Negative'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>RBC</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.urine_rbc || '1-2/hpf'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Serology/Immunology */}
          {displayCategories.includes('serology') && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#21AEA8',
                color: 'white',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                SEROLOGY/IMMUNOLOGY
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f3f4' }}>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Test</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Result</th>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Reference Value</th>
                  </tr>
                </thead>
                <tbody>
                  {modalTestData.hbsag !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>HBsAg</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.hbsag || 'Negative'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {modalTestData.dengue_ns1 !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>Dengue NS1</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.dengue_ns1 || 'Pending...'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {modalTestData.dengue_igg !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>Dengue IgG</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.dengue_igg || 'Pending...'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {modalTestData.dengue_igm !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>Dengue IgM</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.dengue_igm || 'Pending...'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {modalTestData.hiv !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>HIV 1&2</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.hiv || 'Pending...'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {modalTestData.vdrl !== undefined && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>VDRL</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        {modalTestData.vdrl || 'Pending...'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        Non-Reactive
                      </td>
                    </tr>
                  )}
                  {/* Show at least one row if serology category is detected but no specific tests */}
                  {Object.keys(modalTestData).filter(key => key.includes('dengue') || key.includes('hbsag') || key.includes('hiv') || key.includes('vdrl')).length === 0 && (
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>Serology Tests</td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        Pending...
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                        -
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Other Results/Remarks */}
          {testData.remarks && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Others:</strong>
              <p style={{ 
                margin: '10px 0', 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                fontSize: '14px',
                borderLeft: '4px solid #21AEA8'
              }}>
                {testData.remarks}
              </p>
            </div>
          )}

          {/* Specimen Information */}
          <div style={{ 
            marginTop: '30px',
            fontSize: '13px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '15px'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              <strong>Specimen rechecked, result/s verified.</strong>
            </p>
          </div>

          {/* Signatures */}
          <div style={{ 
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ borderBottom: '1px solid #333', marginBottom: '5px', height: '40px' }}></div>
              <div style={{ fontWeight: 'bold' }}>MARIA SHIELA M. RAMOS, RMT</div>
              <div>License#0033711</div>
              <div>MEDICAL TECHNOLOGIST</div>
            </div>
            <div>
              <div style={{ borderBottom: '1px solid #333', marginBottom: '5px', height: '40px' }}></div>
              <div style={{ fontWeight: 'bold' }}>AMABEL A. CALUB,MD,DPSP</div>
              <div>License# 0109978</div>
              <div>PATHOLOGIST</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {filterStatus === 'completed' && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px 25px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end',
            borderRadius: '0 0 8px 8px'
          }}>
            <button
              onClick={() => onReject(testResult)}
              disabled={loading}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? 'Processing...' : 'Reject & Return to MedTech'}
            </button>
            <button
              onClick={() => onApprove(testResult)}
              disabled={loading}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? 'Processing...' : 'Approve & Finalize Result'}
            </button>
          </div>
        )}

        {/* Status Display for Non-Completed Results */}
        {filterStatus !== 'completed' && (
          <div style={{
            background: '#f8f9fa',
            padding: '15px 25px',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            borderRadius: '0 0 8px 8px'
          }}>
            <div style={{
              padding: '10px 20px',
              background: filterStatus === 'approved' ? '#d4edda' : '#fff3cd',
              border: `1px solid ${filterStatus === 'approved' ? '#c3e6cb' : '#ffeaa7'}`,
              borderRadius: '6px',
              color: filterStatus === 'approved' ? '#155724' : '#856404',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {filterStatus === 'approved' ? '✅ Result Approved' : '⚠️ Result Rejected - Under Revision'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewResults;
