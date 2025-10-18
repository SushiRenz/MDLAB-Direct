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
        // OGTT Tests
        { key: 'ogtt_fasting', label: 'OGTT Fasting', normalRange: '70-100 mg/dL', group: 'ogtt' },
        { key: 'ogtt_30min', label: 'OGTT 30 min', normalRange: '<180 mg/dL', group: 'ogtt' },
        { key: 'ogtt_60min', label: 'OGTT 60 min', normalRange: '<180 mg/dL', group: 'ogtt' },
        { key: 'ogtt_90min', label: 'OGTT 90 min', normalRange: '<155 mg/dL', group: 'ogtt' },
        { key: 'ogtt_120min', label: 'OGTT 120 min', normalRange: '<140 mg/dL', group: 'ogtt' }
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
        // Dengue Duo Components
        { key: 'dengue_ns1', label: 'Dengue NS1 Antigen', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igg', label: 'Dengue IgG Antibody', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igm', label: 'Dengue IgM Antibody', normalRange: 'Negative', group: 'dengue' },
        // Salmonella Components
        { key: 'salmonella_igg', label: 'Salmonella IgG', normalRange: 'Non-Reactive', group: 'salmonella' },
        { key: 'salmonella_igm', label: 'Salmonella IgM', normalRange: 'Non-Reactive', group: 'salmonella' },
        // H. pylori Components
        { key: 'hpylori_antigen', label: 'H. Pylori Antigen', normalRange: 'Negative', group: 'hpylori' },
        { key: 'hpylori_antibody', label: 'H. Pylori Antibody', normalRange: 'Negative', group: 'hpylori' },
        // Tumor Markers & Inflammation
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
        { key: 'monocytes', label: 'Monocytes', normalRange: '0.1-1.5 x10⁹/L', group: 'differential' },
        { key: 'eosinophils', label: 'Eosinophils', normalRange: '0.0-0.4 x10⁹/L', group: 'differential' },
        { key: 'basophils', label: 'Basophils', normalRange: '0.0-0.1 x10⁹/L', group: 'differential' },
        { key: 'esr', label: 'ESR (Erythrocyte Sedimentation Rate)', normalRange: '<20 mm/hr', group: 'other' },
        { key: 'aptt', label: 'APTT (Activated Partial Thromboplastin Time)', normalRange: '25-35 seconds', group: 'coagulation' },
        { key: 'pt', label: 'PT (Prothrombin Time)', normalRange: '11-15 seconds', group: 'coagulation' },
        { key: 'inr', label: 'INR (International Normalized Ratio)', normalRange: '0.8-1.2', group: 'coagulation' }
      ]
    },
    // Clinical Microscopy/Urinalysis - Following MDLAB system
    urinalysis: {
      title: 'CLINICAL MICROSCOPY',
      fields: [
        { key: 'urine_color', label: 'Color', normalRange: 'Yellow', group: 'physical' },
        { key: 'urine_transparency', label: 'Transparency', normalRange: 'Clear', group: 'physical' },
        { key: 'urine_specific_gravity', label: 'Specific Gravity', normalRange: '1.003-1.030', group: 'physical' },
        { key: 'urine_ph', label: 'pH', normalRange: '4.6-8.0', group: 'chemical' },
        { key: 'urine_glucose', label: 'Glucose', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_protein', label: 'Protein', normalRange: 'Negative', group: 'chemical' },
        { key: 'urobilinogen', label: 'Urobilinogen', normalRange: 'Normal', group: 'chemical' },
        { key: 'urine_ketones', label: 'Ketones', normalRange: 'Negative', group: 'chemical' },
        { key: 'bilirubin', label: 'Bilirubin', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_leukocytes', label: 'Leukocytes', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_nitrites', label: 'Nitrites', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_blood', label: 'Blood', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_wbc', label: 'WBC/hpf', normalRange: '0-5/hpf', group: 'microscopic' },
        { key: 'urine_rbc', label: 'RBC/hpf', normalRange: '0-2/hpf', group: 'microscopic' },
        { key: 'urine_epithelial', label: 'Epithelial Cells', normalRange: 'Few', group: 'microscopic' },
        { key: 'mucus_thread', label: 'Mucus Threads', normalRange: 'Few', group: 'microscopic' },
        { key: 'amorphous_urates', label: 'Amorphous Urates', normalRange: 'Few', group: 'microscopic' },
        { key: 'urine_bacteria', label: 'Bacteria', normalRange: 'Few', group: 'microscopic' },
        { key: 'urine_crystals', label: 'Crystals', normalRange: 'None', group: 'microscopic' },
        { key: 'urine_casts', label: 'Casts', normalRange: 'None', group: 'microscopic' },
        { key: 'urine_others', label: 'Others', normalRange: '-', group: 'microscopic' }
      ]
    },
    // Fecalysis - Following MDLAB system
    fecalysis: {
      title: 'FECALYSIS',
      fields: [
        { key: 'fecal_color', label: 'Color', normalRange: 'Brown', group: 'physical' },
        { key: 'fecal_consistency', label: 'Consistency', normalRange: 'Formed', group: 'physical' },
        { key: 'fecal_occult_blood', label: 'Occult Blood', normalRange: 'Negative', group: 'chemical' },
        { key: 'fecal_rbc', label: 'RBC/hpf', normalRange: '0-2/hpf', group: 'microscopic' },
        { key: 'fecal_wbc', label: 'WBC/hpf', normalRange: '0-5/hpf', group: 'microscopic' },
        { key: 'fecal_bacteria', label: 'Bacteria', normalRange: 'Few', group: 'microscopic' },
        { key: 'fecal_parasite_ova', label: 'Parasite/Ova', normalRange: 'None seen', group: 'microscopic' }
      ]
    },
    // Blood Typing - Following MDLAB system
    blood_typing: {
      title: 'BLOOD TYPING',
      fields: [
        { key: 'blood_type', label: 'ABO Blood Type', normalRange: 'A/B/AB/O', group: 'typing' },
        { key: 'rh_factor', label: 'Rh Factor', normalRange: 'Positive/Negative', group: 'typing' }
      ]
    },
    // Pregnancy Test - Following MDLAB system
    pregnancy_test: {
      title: 'PREGNANCY TEST',
      fields: [
        { key: 'pregnancy_test', label: 'Pregnancy Test (Urine)', normalRange: 'Negative', group: 'pregnancy' },
        { key: 'serum_pregnancy_test', label: 'Serum Pregnancy Test', normalRange: 'Negative', group: 'pregnancy' }
      ]
    },
    // Thyroid Function Tests - Following MDLAB system  
    thyroid: {
      title: 'THYROID FUNCTION TESTS',
      fields: [
        { key: 'tsh', label: 'TSH (Thyroid Stimulating Hormone)', normalRange: '0.3-4.2 mIU/L', group: 'thyroid' },
        { key: 'ft3', label: 'FT3 (Free Triiodothyronine)', normalRange: '2.3-4.2 pg/mL', group: 'thyroid' },
        { key: 'ft4', label: 'FT4 (Free Thyroxine)', normalRange: '0.8-1.8 ng/dL', group: 'thyroid' },
        { key: 't3', label: 'T3 (Total Triiodothyronine)', normalRange: '80-200 ng/dL', group: 'thyroid' },
        { key: 't4', label: 'T4 (Total Thyroxine)', normalRange: '5.1-14.1 μg/dL', group: 'thyroid' }
      ]
    }
  };

  // Helper function to get test result value from MongoDB data
  const getTestFieldValue = (fieldKey, results) => {
    if (!results || !fieldKey) return null;
    
    // Handle regular objects (JSON-serialized from MongoDB)
    if (typeof results === 'object' && !(results instanceof Map)) {
      return results[fieldKey];
    }
    
    // Handle Map objects (direct MongoDB access)
    if (results instanceof Map) {
      return results.get(fieldKey);
    }
    
    return null;
  };

  // Get all test results organized by category
  const getOrganizedTestResults = (modalTestData) => {
    if (!modalTestData?.results) return {};
    
    const results = {};
    
    Object.entries(testFieldDefinitions).forEach(([category, config]) => {
      const categoryResults = {};
      let hasData = false;
      
      config.fields.forEach(field => {
        const value = getTestFieldValue(field.key, modalTestData.results);
        if (value !== null && value !== undefined && value !== '') {
          categoryResults[field.key] = {
            label: field.label,
            value: value,
            normalRange: field.normalRange,
            group: field.group
          };
          hasData = true;
        }
      });
      
      if (hasData) {
        results[category] = {
          title: config.title,
          fields: categoryResults
        };
      }
    });
    
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
        setCompletedTests(testResults);
      } else {
        setError(response.message || 'Failed to load test results');
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
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
                      {testResult.patientId?.name || testResult.patientId || 'Unknown Patient'}
                    </h4>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '5px' }}>
                      Test Type: <strong>{testResult.testType || 'N/A'}</strong>
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Date: {testResult.sampleDate ? new Date(testResult.sampleDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      backgroundColor: testResult.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: testResult.status === 'completed' ? '#155724' : '#856404',
                      border: `1px solid ${testResult.status === 'completed' ? '#c3e6cb' : '#ffeaa7'}`
                    }}>
                      {testResult.status || 'Pending'}
                    </span>
                    <button
                      onClick={() => handleViewDetails(testResult)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#21AEA8',
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
                  </div>
                </div>
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
                    <strong>Patient:</strong> {testData.patientId?.name || testData.patientId || 'Unknown'}
                  </div>
                  <div>
                    <strong>Test Type:</strong> {testData.testType || 'N/A'}
                  </div>
                  <div>
                    <strong>Sample Date:</strong> {testData.sampleDate ? new Date(testData.sampleDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: testData.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: testData.status === 'completed' ? '#155724' : '#856404'
                    }}>
                      {testData.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Test Results by Category */}
                {(() => {
                  const organizedResults = getOrganizedTestResults(testData);
                  
                  if (Object.keys(organizedResults).length === 0) {
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
      </div>
    </div>
  );
}

export default ReviewResults;