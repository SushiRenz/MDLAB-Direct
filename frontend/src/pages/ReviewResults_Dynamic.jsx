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

  // Fetch completed test results ready for review
  const fetchCompletedTests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await testResultsAPI.getTestResults({
        status: filterStatus,
        limit: 50,
        sortBy: 'completedDate',
        sortOrder: 'desc'
      });

      if (response.success) {
        const testResults = response.data || [];
        setCompletedTests(testResults);
      } else {
        throw new Error(response.message || 'Failed to fetch completed tests');
      }
    } catch (error) {
      setError('Failed to load completed tests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing test details
  const handleViewResults = async (testResult) => {
    setSelectedTestResult(testResult);
    setShowDetailModal(true);
    
    try {
      const appointmentId = testResult.appointmentId || 
                           testResult.appointment?._id || 
                           testResult.appointment?.appointmentId;
      
      if (!appointmentId) {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const apiUrl = `http://localhost:5000/api/test-results/appointment/${appointmentId}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const testData = data.testResults || testResult;
        const serviceData = data.services || [];
        
        setTestData(testData);
        setAppointmentServices(serviceData);
      } else {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
      }
    } catch (error) {
      setTestData(testResult);
      const appointmentServices = testResult.appointment?.services || [];
      setAppointmentServices(appointmentServices);
    }
  };

  useEffect(() => {
    fetchCompletedTests();
  }, [filterStatus]);

  // Format date function
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

  const modalTestData = testData || selectedTestResult;

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="content-area" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: '#21AEA8', 
          borderBottom: '2px solid #21AEA8', 
          paddingBottom: '10px',
          marginBottom: '30px'
        }}>
          📋 Review Test Results
        </h2>

        {/* Filter Controls */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="completed">Completed Tests</option>
              <option value="approved">Approved Tests</option>
              <option value="rejected">Rejected Tests</option>
              <option value="pending">Pending Tests</option>
            </select>
            
            <button 
              onClick={fetchCompletedTests}
              style={{
                padding: '8px 16px',
                backgroundColor: '#21AEA8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            color: '#d73527', 
            backgroundColor: '#fef2f2', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div>Loading test results...</div>
          </div>
        )}

        {/* Test Results List */}
        {!loading && completedTests.length === 0 && (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '8px', 
            textAlign: 'center',
            color: '#666',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            No {filterStatus} test results found.
          </div>
        )}

        {!loading && completedTests.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#21AEA8', color: 'white' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Patient</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Test Type</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedTests.map((testResult, index) => (
                  <tr key={testResult._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {testResult.isWalkInPatient 
                          ? testResult.patientInfo?.name || testResult.appointment?.patientName || 'Walk-in Patient'
                          : testResult.patient?.firstName 
                            ? `${testResult.patient.firstName} ${testResult.patient.lastName}`
                            : testResult.appointment?.patientName || 'Unknown Patient'
                        }
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {testResult.appointment?.appointmentId || testResult.sampleId}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {testResult.testType || 'Multiple Tests'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: testResult.status === 'completed' ? '#e7f3ff' : testResult.status === 'approved' ? '#e6f7e6' : '#fff3cd',
                        color: testResult.status === 'completed' ? '#0066cc' : testResult.status === 'approved' ? '#28a745' : '#856404'
                      }}>
                        {testResult.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px' }}>
                      {formatDate(testResult.completedDate || testResult.sampleDate)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewResults(testResult)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#21AEA8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📋 View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && modalTestData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTestResult(null);
                  setTestData({});
                  setAppointmentServices([]);
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  zIndex: 1001
                }}
              >
                ×
              </button>

              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #21AEA8 0%, #17a2b8 100%)',
                color: 'white',
                padding: '25px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>MDLAB Diagnostic Laboratory</div>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
                    DOH License: 02-93-26-CL-2
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Contact: 0927 850 7775 / 0915 951 1516
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Email: mdlab.diagnostics@yahoo.com.ph
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Laboratory Report</div>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>
                    Date Released: {formatDate(modalTestData.completedDate || modalTestData.sampleDate)}
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
                    <strong>Name:</strong> {(modalTestData.isWalkInPatient 
                      ? modalTestData.patientInfo?.name || modalTestData.appointment?.patientName
                      : modalTestData.patient?.firstName 
                        ? `${modalTestData.patient.firstName} ${modalTestData.patient.lastName}`
                        : modalTestData.appointment?.patientName || 'Unknown Patient').toUpperCase()}
                  </div>
                  <div>
                    <strong>Age:</strong> {modalTestData.patientInfo?.age || modalTestData.patient?.age || modalTestData.appointment?.age || 'N/A'}
                  </div>
                  <div>
                    <strong>Sex:</strong> {modalTestData.patientInfo?.gender || modalTestData.patient?.gender || modalTestData.appointment?.sex || 'N/A'}
                  </div>
                  <div>
                    <strong>Contact:</strong> {modalTestData.patientInfo?.contactNumber || modalTestData.patient?.phone || modalTestData.appointment?.contactNumber || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {modalTestData.patientInfo?.email || modalTestData.patient?.email || modalTestData.appointment?.email || 'N/A'}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Address:</strong> {modalTestData.patientInfo?.address || modalTestData.patient?.address || modalTestData.appointment?.address || 'N/A'}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(modalTestData.sampleDate)}
                  </div>
                  <div>
                    <strong>Lab. Number:</strong> {modalTestData.sampleId || 'N/A'}
                  </div>
                  <div>
                    <strong>Source:</strong> {modalTestData.appointment ? 'APPOINTMENT' : 'WALK-IN'}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewResults;