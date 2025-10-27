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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedTestForApproval, setSelectedTestForApproval] = useState(null);

  // Complete field definitions based on MDLAB system arrangement (not appointment system)
  const testFieldDefinitions = {
    // Clinical Chemistry/Immunology - Following MDLAB system arrangement
    chemistry: {
      title: 'CLINICAL CHEMISTRY',
      fields: [
        { key: 'fbs', label: 'Glucose (FBS/RBS)', normalRange: '3.89-5.83 mmol/L', group: 'glucose' },
        { key: 'cholesterol', label: 'Total Cholesterol', normalRange: '3.5-5.2 mmol/L', group: 'lipids' },
        { key: 'triglyceride', label: 'Triglycerides', normalRange: '<2.26 mmol/L', group: 'lipids' },
        { key: 'hdl', label: 'HDL Cholesterol', normalRange: '>1.05 mmol/L', group: 'lipids' },
        { key: 'ldl', label: 'LDL Cholesterol', normalRange: '<2.9 mmol/L', group: 'lipids' },
        { key: 'bua', label: 'Uric Acid', normalRange: '156-360 umol/L', group: 'kidney' },
        { key: 'bun', label: 'BUN (Blood Urea Nitrogen)', normalRange: '1.7-8.3 mmol/L', group: 'kidney' },
        { key: 'creatinine', label: 'Creatinine', normalRange: '53-97 umol/L', group: 'kidney' },
        { key: 'ast_sgot', label: 'AST/SGOT', normalRange: '<31 U/L', group: 'liver' },
        { key: 'alt_sgpt', label: 'ALT/SGPT', normalRange: '<34 U/L', group: 'liver' },
        { key: 'sodium', label: 'Sodium (Na)', normalRange: '136-150 mmol/L', group: 'electrolytes' },
        { key: 'potassium', label: 'Potassium (K)', normalRange: '3.5-5.0 mmol/L', group: 'electrolytes' },
        { key: 'chloride', label: 'Chloride (Cl)', normalRange: '94-110 mmol/L', group: 'electrolytes' },
        { key: 'magnesium', label: 'Magnesium (Mg)', normalRange: '0.70-1.05 mmol/L', group: 'electrolytes' },
        { key: 'phosphorus', label: 'Phosphorus (P)', normalRange: '0.85-1.50 mmol/L', group: 'electrolytes' },
        { key: 'fecalysis', label: 'Fecalysis', normalRange: 'See reference', group: 'other' }
      ]
    },
    // Serology/Immunology - Following MDLAB system
    immunology: {
      title: 'SEROLOGY/IMMUNOLOGY',
      fields: [
        { key: 'hepatitis_b', label: 'Hepatitis B Antigen (HbsAg)', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'hepatitis_c', label: 'Hepatitis C', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'hiv', label: 'HIV Screening', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'vdrl', label: 'VDRL (Syphilis)', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'dengue_ns1', label: 'Dengue NS1 Antigen', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igg', label: 'Dengue IgG Antibody', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igm', label: 'Dengue IgM Antibody', normalRange: 'Negative', group: 'dengue' },
        { key: 'salmonella_igg', label: 'Salmonella IgG', normalRange: 'Non-Reactive', group: 'salmonella' },
        { key: 'salmonella_igm', label: 'Salmonella IgM', normalRange: 'Non-Reactive', group: 'salmonella' },
        { key: 'hpylori_antigen', label: 'H. Pylori Antigen', normalRange: 'Negative', group: 'hpylori' },
        { key: 'hpylori_antibody', label: 'H. Pylori Antibody', normalRange: 'Negative', group: 'hpylori' },
        { key: 'psa', label: 'PSA (Prostate Specific Antigen)', normalRange: '<4.0 ng/mL', group: 'tumor_markers' },
        { key: 'crp', label: 'CRP (C-Reactive Protein)', normalRange: '<3.0 mg/L', group: 'inflammation' }
      ]
    },
    // Hematology - Following MDLAB system (including coagulation studies)
    hematology: {
      title: 'HEMATOLOGY',
      fields: [
        { key: 'hemoglobin', label: 'Hemoglobin', normalRange: '110-160 g/L', group: 'basic' },
        { key: 'hematocrit', label: 'Hematocrit', normalRange: '37-54%', group: 'basic' },
        { key: 'rbc', label: 'RBC Count', normalRange: '3.50-5.50 x10¹²/L', group: 'basic' },
        { key: 'platelets', label: 'Platelet Count', normalRange: '150-450 x10⁹/L', group: 'basic' },
        { key: 'wbc', label: 'WBC Count', normalRange: '4.0-10.0 x10⁹/L', group: 'basic' },
        { key: 'mcv', label: 'MCV', normalRange: '80-100 fL', group: 'indices' },
        { key: 'mch', label: 'MCH', normalRange: '27.0-34.0 pg', group: 'indices' },
        { key: 'mchc', label: 'MCHC', normalRange: '320-360 g/L', group: 'indices' },
        { key: 'neutrophils', label: 'Segmenters (Neutrophils)', normalRange: '2.0-7.0 x10⁹/L', group: 'differential' },
        { key: 'lymphocytes', label: 'Lymphocytes', normalRange: '0.8-4.0 x10⁹/L', group: 'differential' },
        { key: 'monocytes', label: 'Monocytes', normalRange: '0.1-1.5 x10⁩/L', group: 'differential' },
        { key: 'eosinophils', label: 'Eosinophils', normalRange: '0.0-0.4 x10⁹/L', group: 'differential' },
        { key: 'basophils', label: 'Basophils', normalRange: '0.0-0.1 x10⁹/L', group: 'differential' },
        { key: 'esr', label: 'ESR (Erythrocyte Sedimentation Rate)', normalRange: '<20 mm/hr', group: 'other' },
        { key: 'aptt', label: 'APTT (Activated Partial Thromboplastin Time)', normalRange: '25-35 seconds', group: 'coagulation' },
        { key: 'pt', label: 'PT (Prothrombin Time)', normalRange: '11-15 seconds', group: 'coagulation' },
        { key: 'inr', label: 'INR (International Normalized Ratio)', normalRange: '0.8-1.2', group: 'coagulation' },
        { key: 'bleeding_time', label: 'Bleeding Time', normalRange: '1-6 minutes', group: 'coagulation' },
        { key: 'clotting_time', label: 'Clotting Time', normalRange: '5-15 minutes', group: 'coagulation' }
      ]
    },
    // Clinical Microscopy/Urinalysis - Following MDLAB system
    urinalysis: {
      title: 'CLINICAL MICROSCOPY',
      fields: [
        // Urinalysis
        { key: 'color', label: 'Color', normalRange: 'Yellow', group: 'urine_physical' },
        { key: 'transparency', label: 'Transparency', normalRange: 'Clear', group: 'urine_physical' },
        { key: 'specificGravity', label: 'Specific Gravity', normalRange: '1.003-1.030', group: 'urine_physical' },
        { key: 'ph', label: 'pH', normalRange: '4.6-8.0', group: 'urine_chemical' },
        { key: 'protein', label: 'Protein', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'glucose', label: 'Glucose', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'ketones', label: 'Ketones', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'bilirubin', label: 'Bilirubin', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'urobilinogen', label: 'Urobilinogen', normalRange: 'Normal', group: 'urine_chemical' },
        { key: 'blood', label: 'Blood', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'leukocytes', label: 'Leukocytes', normalRange: 'Negative', group: 'urine_chemical' },
        { key: 'nitrites', label: 'Nitrites', normalRange: 'Negative', group: 'urine_chemical' },
        // Pregnancy Tests - grouped with Clinical Microscopy
        { key: 'pregnancy_test_urine', label: 'Pregnancy Test (Urine)', normalRange: 'Negative', group: 'pregnancy' },
        { key: 'pregnancy_test_serum', label: 'Pregnancy Test (Serum/β-HCG)', normalRange: 'Negative', group: 'pregnancy' }
      ]
    }
  };

  // Helper function to get test result value from MongoDB data
  const getTestFieldValue = (fieldKey, results) => {
    if (!results || !fieldKey) return null;
    
    try {
      // Handle regular objects (JSON-serialized from MongoDB)
      if (typeof results === 'object' && !(results instanceof Map)) {
        const value = results[fieldKey];
        
        // If the value is an object with a 'value' property, extract it
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value;
        }
        
        // If the value is an object with a 'result' property, extract it
        if (value && typeof value === 'object' && 'result' in value) {
          return value.result;
        }
        
        return value;
      }
      
      // Handle Map objects (direct MongoDB access)
      if (results instanceof Map) {
        const value = results.get(fieldKey);
        
        // Apply same nested extraction logic
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value;
        }
        if (value && typeof value === 'object' && 'result' in value) {
          return value.result;
        }
        
        return value;
      }
    } catch (error) {
      console.error(`❌ Error extracting field "${fieldKey}":`, error);
    }
    
    return null;
  };

  // Get all test results organized by category
  const getOrganizedTestResults = (modalTestData) => {
    if (!modalTestData?.results) {
      console.log('🔍 DEBUG: No results in modalTestData');
      return {};
    }
    
    console.log('🔍 DEBUG: Modal test data results:', modalTestData.results);
    console.log('🔍 DEBUG: Results type:', typeof modalTestData.results);
    console.log('🔍 DEBUG: Results keys:', Object.keys(modalTestData.results));
    
    // Show non-empty fields but exclude date and time performed as they're now in header
    const nonEmptyFields = Object.entries(modalTestData.results).filter(([key, value]) => 
      value !== null && value !== undefined && value !== '' &&
      !['date_performed', 'datePerformed', 'time_performed', 'timePerformed'].includes(key)
    );
    console.log('🔍 DEBUG: Non-empty fields (excluding date/time):', nonEmptyFields);
    
    const results = {};
    
    Object.entries(testFieldDefinitions).forEach(([category, config]) => {
      const categoryResults = {};
      let hasData = false;
      
      config.fields.forEach(field => {
        // Skip date and time performed fields as they're now in the header
        if (['date_performed', 'datePerformed', 'time_performed', 'timePerformed'].includes(field.key)) {
          return;
        }
        
        const value = getTestFieldValue(field.key, modalTestData.results);
        if (value !== null && value !== undefined && value !== '') {
          categoryResults[field.key] = {
            label: field.label || field.key,
            value: value,
            normalRange: field.normalRange || 'See reference',
            group: field.group || 'other'
          };
          hasData = true;
          console.log(`🔍 DEBUG: Found data for ${category} - ${field.key}: ${value}`);
        } else {
          // Check if field exists in results even if empty
          if (modalTestData.results.hasOwnProperty(field.key)) {
            console.log(`🔍 DEBUG: Empty field in ${category} - ${field.key}: "${value}"`);
          }
        }
      });
      
      if (hasData) {
        results[category] = {
          title: config.title || category.toUpperCase(),
          fields: categoryResults
        };
        console.log(`🔍 DEBUG: Added category ${category} with data`);
      }
    });
    
    // Check for remarks/comments ONLY - "OTHER RESULTS" is for remarks/comments only
    const commentsFields = {};
    
    try {
      const resultEntries = modalTestData.results instanceof Map 
        ? Array.from(modalTestData.results.entries()) 
        : Object.entries(modalTestData.results || {});
      
      resultEntries.forEach(([key, value]) => {
        // ONLY include remarks/comments in "OTHER RESULTS"
        const isCommentField = ['remarks', 'comments', 'comment', 'notes', 'observation', 'observations'].includes(key.toLowerCase());
        
        if (isCommentField) {
          // Extract actual value if nested
          let actualValue = value;
          if (value && typeof value === 'object') {
            actualValue = value.value || value.result || JSON.stringify(value);
          }
          
          if (actualValue !== null && actualValue !== undefined && actualValue !== '') {
            // Format the label nicely
            const formattedLabel = key
              .replace(/_/g, ' ')
              .replace(/([A-Z])/g, ' $1')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
              .trim();
            
            commentsFields[key] = {
              label: formattedLabel,
              value: actualValue,
              normalRange: '',
              group: 'comments'
            };
            console.log(`✅ Found comment/remark field: ${key} = "${actualValue}"`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error processing comment fields:', error);
    }
    
    // Only add "OTHER RESULTS" if there are actual remarks/comments
    if (Object.keys(commentsFields).length > 0) {
      results['other'] = {
        title: 'OTHER RESULTS',
        fields: commentsFields
      };
      console.log(`✅ Added "OTHER RESULTS" category with ${Object.keys(commentsFields).length} comment/remark fields`);
    }
    
    console.log('🔍 DEBUG: Final organized results:', results);
    return results;
  };

  // Load completed tests
  useEffect(() => {
    fetchCompletedTests();
  }, [filterStatus]);

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
        
        // Enhanced logging for debugging
        if (testResults.length > 0) {
          console.log('🔍 TEST RESULTS DETAILED LOGGING:');
          testResults.forEach((result, index) => {
            const hasAccountPatient = !!result.appointment?.patient;
            const patientName = result.patientInfo?.name || 
                              result.appointment?.patientName || 
                              (result.appointment?.patient?.firstName && result.appointment?.patient?.lastName 
                                ? `${result.appointment.patient.firstName} ${result.appointment.patient.lastName}`
                                : 'Unknown');
            
            console.log(`📋 Test Result #${index + 1} (ID: ${result._id}):`, {
              patientName,
              accountType: hasAccountPatient ? 'Account (Patient Created)' : 'Walk-in (Receptionist Created)',
              testType: result.testType,
              serviceName: result.serviceName,
              status: result.status,
              sampleId: result.sampleId,
              hasResults: !!result.results,
              resultsType: typeof result.results,
              resultsKeys: result.results ? Object.keys(result.results) : [],
              appointmentPatient: result.appointment?.patient,
              appointmentType: result.appointment?.type,
              fullResultsStructure: result.results,
              fullObject: result
            });
          });
        }
        
        setCompletedTests(testResults);
      } else {
        console.error('❌ Failed to load test results:', response.message);
        setError(response.message || 'Failed to load test results');
      }
    } catch (error) {
      console.error('❌ Error fetching test results:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening approve modal
  const handleApproveTest = (testResult) => {
    setSelectedTestForApproval(testResult);
    setShowApproveModal(true);
  };

  // Handle the actual approval process
  const handleConfirmApproval = async (options) => {
    if (!selectedTestForApproval) return;

    try {
      console.log('Approving test result:', selectedTestForApproval._id);
      console.log('Approval options:', options);
      
      // Determine the appropriate API call based on options
      let response;
      
      if (options.sendToAccount) {
        // If sending to patient account, use release endpoint to make results available to patients
        console.log('Releasing test result to patient account...');
        response = await testResultsAPI.releaseTestResult(selectedTestForApproval._id, {
          pathologistNotes: 'Results reviewed and approved for release to patient account'
        });
      } else {
        // Otherwise, just approve without releasing to patient
        response = await testResultsAPI.approveTestResult(selectedTestForApproval._id, {
          pathologistNotes: 'Results reviewed and approved'
        });
      }

      if (response.success) {
        // Show success message based on options
        let message = 'Test result approved successfully!';
        if (options.sendToAccount && options.print) {
          message += '\n• Results sent to patient account\n• Print job queued';
        } else if (options.sendToAccount) {
          message += '\n• Results sent to patient account';
        } else if (options.print) {
          message += '\n• Print job queued';
        }
        
        alert(message);
        setShowApproveModal(false);
        setSelectedTestForApproval(null);
        fetchCompletedTests(); // Refresh the list
        
        // Notify other components that a test result was approved/released
        window.dispatchEvent(new CustomEvent('testResultUpdated', {
          detail: { 
            action: options.sendToAccount ? 'released' : 'approved',
            testResultId: selectedTestForApproval._id 
          }
        }));
      } else {
        alert('Failed to approve test result: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving test:', error);
      alert('Failed to approve test result: ' + error.message);
    }
  };

  // Handle rejecting test result
  const handleRejectTest = async (testResult) => {
    const confirmed = window.confirm(
      'Are you sure you want to reject this test result?\n\n' +
      'This will send the test back to the MedTech for correction.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      console.log('Rejecting test result:', testResult._id);
      
      // Use the testResultsAPI to make the request with proper authentication
      const response = await testResultsAPI.rejectTestResult(testResult._id, {
        rejectionReason: 'Test result requires correction and resubmission'
      });

      if (response.success) {
        alert('Test result rejected and sent back to MedTech for correction!');
        fetchCompletedTests(); // Refresh the list
      } else {
        alert('Failed to reject test result: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting test:', error);
      alert('Failed to reject test result: ' + error.message);
    }
  };

  const handleViewDetails = (testResult) => {
    setTestData(testResult);
    setShowModal(true);
  };

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

        <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          Review completed test results and approve or reject them for final release.
        </div>

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
              <option value="completed">Completed Tests (Ready for Review)</option>
              <option value="reviewed">Approved Tests</option>
              <option value="rejected">Rejected Tests</option>
              <option value="pending">Pending Tests (MedTech Queue)</option>
            </select>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading test results...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Error loading test results</div>
            <div>{error}</div>
            <button 
              onClick={fetchCompletedTests}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#21AEA8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : completedTests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
              No test results available
            </div>
            <div style={{ color: '#999' }}>
              Test results will appear here once laboratory tests are completed
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {completedTests.map((testResult, index) => (
              <div 
                key={testResult._id || index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '20px',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                      {/* Handle different patient data structures */}
                      {typeof testResult.patientId === 'string' ? testResult.patientId :
                       testResult.patientId?.name || 
                       testResult.patient?.name || 
                       testResult.patientInfo?.name ||
                       testResult.appointment?.patientName ||
                       testResult.patientName ||
                       'Unknown Patient'}
                    </h4>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '5px' }}>
                      Test Type: <strong>{testResult.testType || 'N/A'}</strong>
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Date: {testResult.sampleDate ? new Date(testResult.sampleDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      backgroundColor: testResult.status === 'completed' ? '#e7f3ff' : 
                                       testResult.status === 'reviewed' ? '#e6f7e6' : 
                                       testResult.status === 'rejected' ? '#f8d7da' :
                                       testResult.status === 'pending' ? '#fff3cd' :
                                       '#f8f9fa',
                      color: testResult.status === 'completed' ? '#0066cc' : 
                             testResult.status === 'reviewed' ? '#28a745' : 
                             testResult.status === 'rejected' ? '#721c24' :
                             testResult.status === 'pending' ? '#856404' :
                             '#495057'
                    }}>
                      {testResult.status === 'reviewed' ? 'Approved' : (testResult.status || 'Pending')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleViewDetails(testResult)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      View Details
                    </button>
                    {testResult.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handleApproveTest(testResult)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTest(testResult)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {(testResult.status === 'reviewed' || testResult.status === 'rejected') && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: testResult.status === 'reviewed' ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${testResult.status === 'reviewed' ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '6px',
                    color: testResult.status === 'reviewed' ? '#155724' : '#721c24',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {testResult.status === 'reviewed' ? '✅ Result Approved' : 
                     testResult.status === 'rejected' ? `❌ Result Rejected: ${testResult.rejectionReason || 'Requires correction'}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Lab Report Modal */}
        {showModal && testData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>Laboratory Test Results</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Professional Lab Report Content */}
              <div style={{ padding: '25px' }}>
                {/* Patient Information */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '30px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div>
                    <strong>Patient:</strong> {/* Handle different patient data structures */}
                                               {typeof testData.patientId === 'string' ? testData.patientId :
                                                testData.patientId?.name || 
                                                testData.patient?.name || 
                                                testData.patientInfo?.name ||
                                                testData.appointment?.patientName ||
                                                testData.patientName ||
                                                'Unknown'}
                  </div>
                  <div>
                    <strong>Test Type:</strong> {testData.testType || 'N/A'}
                  </div>
                  <div>
                    <strong>Sample Date:</strong> {testData.sampleDate ? new Date(testData.sampleDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <strong>Date Performed:</strong> {testData.results?.date_performed || testData.results?.datePerformed || 'N/A'}
                  </div>
                  <div>
                    <strong>Time Performed:</strong> {testData.results?.time_performed || testData.results?.timePerformed || 'N/A'}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: testData.status === 'completed' ? '#d4edda' : 
                                       testData.status === 'reviewed' ? '#d1ecf1' :
                                       testData.status === 'rejected' ? '#f8d7da' :
                                       testData.status === 'pending' ? '#fff3cd' :
                                       '#f8f9fa',
                      color: testData.status === 'completed' ? '#155724' : 
                             testData.status === 'reviewed' ? '#0c5460' :
                             testData.status === 'rejected' ? '#721c24' :
                             testData.status === 'pending' ? '#856404' :
                             '#495057'
                    }}>
                      {testData.status === 'reviewed' ? 'Approved' : (testData.status || 'Pending')}
                    </span>
                  </div>
                </div>

                {/* Test Results by Category */}
                {(() => {
                  const organizedResults = getOrganizedTestResults(testData);
                  
                  console.log('🔍 DEBUG: Organized results keys:', Object.keys(organizedResults));
                  console.log('🔍 DEBUG: Organized results length:', Object.keys(organizedResults).length);
                  
                  if (Object.keys(organizedResults).length === 0) {
                    console.log('🔍 DEBUG: No organized results found, showing "No test results" message');
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No test results available for display.</p>
                      </div>
                    );
                  }

                  return Object.entries(organizedResults).map(([category, categoryData]) => (
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
                        {categoryData.title}
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
                          {Object.entries(categoryData.fields).map(([fieldKey, fieldData]) => (
                            <tr key={fieldKey}>
                              <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                                {fieldData.label}
                              </td>
                              <td style={{ 
                                border: '1px solid #ddd', 
                                padding: '12px', 
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: fieldData.value && (fieldData.value.includes('Positive') || fieldData.value.includes('Reactive')) ? '#e74c3c' : '#27ae60'
                              }}>
                                {fieldData.value || 'Pending'}
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                {fieldData.normalRange}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ));
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

        {/* Approval Modal */}
        {showApproveModal && selectedTestForApproval && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '0',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#21AEA8',
                color: 'white',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  ✅ Approve Test Results
                </h3>
                <button
                  onClick={() => setShowApproveModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'white',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <ApprovalModalContent 
                testResult={selectedTestForApproval}
                onConfirm={handleConfirmApproval}
                onCancel={() => setShowApproveModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Approval Modal Component
function ApprovalModalContent({ testResult, onConfirm, onCancel }) {
  // Determine if this is a walk-in or account appointment
  // Walk-in: no appointment OR appointment.patient is null (no user account linked)
  // Account: appointment.patient exists (user account linked)
  const isWalkIn = !testResult.appointment || !testResult.appointment.patient;
  
  const [selectedOptions, setSelectedOptions] = React.useState({
    sendToAccount: !isWalkIn, // Default to true for account patients, false for walk-ins
    print: false
  });

  const patientName = typeof testResult.patientId === 'string' ? testResult.patientId :
                      testResult.patientId?.name || 
                      testResult.patient?.name || 
                      testResult.patientInfo?.name ||
                      testResult.appointment?.patientName ||
                      testResult.patientName ||
                      'Unknown Patient';

  const handleOptionChange = (option, checked) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const handleConfirm = () => {
    // For walk-ins, only print option should be available and selected
    if (isWalkIn) {
      onConfirm({ sendToAccount: false, print: true });
    } else {
      // For account patients, use selected options
      onConfirm(selectedOptions);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Patient Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px' }}>
          Patient Information
        </h4>
        <p style={{ margin: '4px 0', color: '#6c757d' }}>
          <strong>Name:</strong> {patientName}
        </p>
        <p style={{ margin: '4px 0', color: '#6c757d' }}>
          <strong>Test Type:</strong> {testResult.testType || 'N/A'}
        </p>
        <p style={{ margin: '4px 0', color: '#6c757d' }}>
          <strong>Appointment Type:</strong> 
          <span style={{
            marginLeft: '8px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: isWalkIn ? '#fff3cd' : '#d1ecf1',
            color: isWalkIn ? '#856404' : '#0c5460'
          }}>
            {isWalkIn ? 'Walk-in (Receptionist Created)' : 'Account Appointment (Patient Created)'}
          </span>
        </p>
        <p style={{ margin: '4px 0', color: '#6c757d', fontSize: '11px' }}>
          <strong>Debug Info:</strong> 
          appointmentPatient: {testResult.appointment?.patient ? 'Has Account' : 'No Account'}, 
          appointmentType: {testResult.appointment?.type || 'N/A'}, 
          patientName: {testResult.appointment?.patient?.firstName || 'N/A'} {testResult.appointment?.patient?.lastName || ''}
        </p>
      </div>

      {/* Options */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '16px' }}>
          Approval Options
        </h4>
        
        {isWalkIn ? (
          // Walk-in patients - only print option
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🖨️</span>
              <span style={{ fontWeight: 'bold', color: '#856404' }}>Print Physical Copy</span>
            </div>
            <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
              Results will be printed for walk-in patient pickup.
            </p>
          </div>
        ) : (
          // Account holders - both options available
          <div style={{ space: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer',
              backgroundColor: selectedOptions.sendToAccount ? '#e8f5e8' : 'white',
              borderColor: selectedOptions.sendToAccount ? '#28a745' : '#e9ecef'
            }}
            onClick={() => handleOptionChange('sendToAccount', !selectedOptions.sendToAccount)}
            >
              <input
                type="checkbox"
                checked={selectedOptions.sendToAccount}
                onChange={(e) => handleOptionChange('sendToAccount', e.target.checked)}
                style={{ marginRight: '12px', transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>📱</span>
                  <span style={{ fontWeight: 'bold', color: '#495057' }}>Send to Patient Account</span>
                </div>
                <p style={{ margin: '0', fontSize: '13px', color: '#6c757d' }}>
                  Results will be available in the patient's online portal.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selectedOptions.print ? '#e8f5e8' : 'white',
              borderColor: selectedOptions.print ? '#28a745' : '#e9ecef'
            }}
            onClick={() => handleOptionChange('print', !selectedOptions.print)}
            >
              <input
                type="checkbox"
                checked={selectedOptions.print}
                onChange={(e) => handleOptionChange('print', e.target.checked)}
                style={{ marginRight: '12px', transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>🖨️</span>
                  <span style={{ fontWeight: 'bold', color: '#495057' }}>Print Physical Copy</span>
                </div>
                <p style={{ margin: '0', fontSize: '13px', color: '#6c757d' }}>
                  A printed copy will be prepared for pickup.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning for account holders if no option selected */}
      {!isWalkIn && !selectedOptions.sendToAccount && !selectedOptions.print && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#721c24' }}>
            ⚠️ Please select at least one delivery option to proceed.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        borderTop: '1px solid #e9ecef',
        paddingTop: '20px'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '2px solid #6c757d',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#6c757d',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isWalkIn && !selectedOptions.sendToAccount && !selectedOptions.print}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: (!isWalkIn && !selectedOptions.sendToAccount && !selectedOptions.print) 
              ? '#ccc' : '#28a745',
            color: 'white',
            fontWeight: 'bold',
            cursor: (!isWalkIn && !selectedOptions.sendToAccount && !selectedOptions.print) 
              ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          ✅ Approve & Process
        </button>
      </div>
    </div>
  );
}
export default ReviewResults;
