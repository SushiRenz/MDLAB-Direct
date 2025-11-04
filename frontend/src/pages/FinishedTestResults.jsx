import React, { useState, useEffect } from 'react';
import { testResultsAPI } from '../services/api';
import '../design/ReceptionistDashboard.css';
import ReviewDSSSupport from '../components/ReviewDSSSupport';
import { analyzeReviewResults } from '../utils/reviewDSSHelper';

// Complete test field definitions matching ReviewResults
const testFieldDefinitions = {
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
  urinalysis: {
    title: 'CLINICAL MICROSCOPY',
    fields: [
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
      { key: 'pregnancy_test_urine', label: 'Pregnancy Test (Urine)', normalRange: 'Negative', group: 'pregnancy' },
      { key: 'pregnancy_test_serum', label: 'Pregnancy Test (Serum/β-HCG)', normalRange: 'Negative', group: 'pregnancy' }
    ]
  }
};

function FinishedTestResults({ currentUser }) {
  // State management
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDSSModal, setShowDSSModal] = useState(false);
  const [dssRecommendations, setDssRecommendations] = useState([]);

  // Helper function to get test result value from MongoDB data
  const getTestFieldValue = (fieldKey, results) => {
    if (!results || !fieldKey) return null;
    
    try {
      if (typeof results === 'object' && !(results instanceof Map)) {
        const value = results[fieldKey];
        
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value;
        }
        
        if (value && typeof value === 'object' && 'result' in value) {
          return value.result;
        }
        
        return value;
      }
      
      if (results instanceof Map) {
        const value = results.get(fieldKey);
        
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value;
        }
        if (value && typeof value === 'object' && 'result' in value) {
          return value.result;
        }
        
        return value;
      }
    } catch (error) {
      console.error(`Error extracting field "${fieldKey}":`, error);
    }
    
    return null;
  };

  // Get all test results organized by category - EXACT COPY from ReviewResults
  const getOrganizedTestResults = (modalTestData) => {
    if (!modalTestData?.results) {
      console.log('🔍 DEBUG: No results in modalTestData');
      return {};
    }
    
    console.log('🔍 DEBUG: Modal test data results:', modalTestData.results);
    console.log('🔍 DEBUG: Results type:', typeof modalTestData.results);
    console.log('🔍 DEBUG: Results keys:', Object.keys(modalTestData.results));
    
    const results = {};
    
    Object.entries(testFieldDefinitions).forEach(([category, config]) => {
      const categoryFields = {};
      let hasData = false;
      
      config.fields.forEach(field => {
        // Skip date and time performed fields as they're now in the header
        if (['date_performed', 'datePerformed', 'time_performed', 'timePerformed'].includes(field.key)) {
          return;
        }
        
        const value = getTestFieldValue(field.key, modalTestData.results);
        if (value !== null && value !== undefined && value !== '') {
          categoryFields[field.key] = {
            label: field.label || field.key,
            value: value,
            normalRange: field.normalRange || 'See reference',
            group: field.group || 'other'
          };
          hasData = true;
          console.log(`🔍 DEBUG: Found data for ${category} - ${field.key}: ${value}`);
        }
      });
      
      if (hasData) {
        results[category] = {
          title: config.title,
          fields: categoryFields  // Changed from 'results' to 'fields' for DSS compatibility
        };
      }
    });
    
    console.log('🔍 DEBUG: Final organized results:', results);
    return results;
  };

  // DSS Support Handler
  const handleDSSSupport = () => {
    console.log('🧠 DSS Support clicked');
    console.log('🧠 selectedResult:', selectedResult);
    console.log('🧠 selectedResult.results:', selectedResult?.results);
    
    // Analyze the current test data using the same organized results
    const organizedResults = getOrganizedTestResults(selectedResult);
    console.log('🧠 organizedResults:', organizedResults);
    console.log('🧠 organizedResults keys:', Object.keys(organizedResults));
    
    // Only analyze if we have results
    if (Object.keys(organizedResults).length === 0) {
      console.log('🧠 No results to analyze - showing empty state');
      setDssRecommendations([]);
      setShowDSSModal(true);
      return;
    }
    
    const recommendations = analyzeReviewResults(organizedResults);
    console.log('🧠 recommendations:', recommendations);
    
    setDssRecommendations(recommendations);
    setShowDSSModal(true);
  };

  // Fetch finished test results on component mount
  useEffect(() => {
    fetchFinishedResults();
  }, []);

  const fetchFinishedResults = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching finished/released test results...');
      
      const params = {
        status: 'completed,released,reviewed',
        limit: 100
      };
      
      if (searchTerm) params.search = searchTerm;
      
      console.log('🔍 REQUEST PARAMS:', params);
      const response = await testResultsAPI.getTestResults(params);
      console.log('✅ Finished results response:', response);
      console.log('📦 Response data array:', response.data);
      console.log('📊 Total results received:', response.data?.length);
      console.log('📄 Response message:', response.message);
      
      // Log first few results for debugging
      if (response.data && response.data.length > 0) {
        console.log('🔍 First 3 results:', response.data.slice(0, 3).map(r => ({
          sampleId: r.sampleId,
          patient: r.patientName || r.patient?.firstName,
          status: r.status,
          created: r.createdAt
        })));
      }
      
      if (response.success) {
        const results = response.data || [];
        console.log(`✅ Loaded ${results.length} finished test results`);
        setTestResults(results);
      } else {
        console.error('Backend validation error details:', response);
        throw new Error(response.message || 'Failed to fetch finished test results');
      }
    } catch (error) {
      console.error('❌ Fetch finished results error:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to fetch finished test results: ' + error.message);
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchFinishedResults();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Action handlers
  const handleView = (result) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleDeleteClick = (result) => {
    setSelectedResult(result);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedResult) return;

    try {
      setLoading(true);
      const response = await testResultsAPI.deleteTestResult(selectedResult._id);
      
      if (response.success) {
        alert('Test result deleted successfully');
        setShowDeleteModal(false);
        setSelectedResult(null);
        fetchFinishedResults();
      } else {
        throw new Error(response.message || 'Failed to delete test result');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete test result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getPatientType = (result) => {
    if (!result.patient) return 'Walk-in';
    if (typeof result.patient === 'object' && result.patient._id) {
      return 'With Account';
    }
    return 'Walk-in';
  };

  const getPatientName = (result) => {
    if (!result.patient) return 'N/A';
    
    if (typeof result.patient === 'object') {
      const firstName = result.patient.firstName || '';
      const lastName = result.patient.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
    
    return result.patient || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatServiceName = (result) => {
    if (!result.service && !result.testType) return 'N/A';
    
    if (typeof result.service === 'object' && result.service !== null && result.service.serviceName) {
      return result.service.serviceName;
    }
    
    return result.testType || 'N/A';
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'receptionist-badge receptionist-badge-completed';
      case 'released':
        return 'receptionist-badge receptionist-badge-released';
      default:
        return 'receptionist-badge receptionist-badge-secondary';
    }
  };

  return (
    <div className="receptionist-management-container">
      <div className="receptionist-management-header">
        <div className="receptionist-management-title">
          <h2>Finished Test Results</h2>
          <p>View and manage completed and released test results</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="receptionist-search-filter">
        <input
          type="text"
          placeholder="Search by sample ID, patient name..."
          className="receptionist-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="receptionist-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="reviewed">Reviewed</option>
          <option value="released">Released</option>
        </select>
        <input
          type="date"
          className="receptionist-date-filter"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Results Table */}
      <div className="receptionist-management-content">
        <div className="receptionist-data-table">
          <table>
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Patient Name</th>
                <th>Test Type</th>
                <th>Date Completed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading finished test results...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{color: '#e74c3c', textAlign: 'center', padding: '20px'}}>
                    {error}
                  </td>
                </tr>
              ) : testResults.length === 0 ? (
                <tr>
                  <td colSpan="6">No finished test results found</td>
                </tr>
              ) : (
                testResults
                  .filter(result => {
                    const matchesSearch = searchTerm === '' || 
                      getPatientName(result).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (result.sampleId || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = filterStatus === '' || 
                      (result.status || '').toLowerCase() === filterStatus.toLowerCase();
                    const matchesDate = filterDate === '' || 
                      (result.completedDate && new Date(result.completedDate).toISOString().split('T')[0] === filterDate) ||
                      (result.releasedDate && new Date(result.releasedDate).toISOString().split('T')[0] === filterDate);
                    return matchesSearch && matchesStatus && matchesDate;
                  })
                  .map((result) => (
                    <tr key={result._id}>
                      <td>{result.sampleId || 'N/A'}</td>
                      <td>{getPatientName(result)}</td>
                      <td>{formatServiceName(result)}</td>
                      <td>
                        {formatDate(result.completedDate || result.releasedDate)}
                      </td>
                      <td>
                        <span className={`receptionist-status ${(result.status || '').toLowerCase()}`}>
                          {result.status || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="receptionist-action-buttons">
                          <button 
                            className="receptionist-btn-view"
                            onClick={() => handleView(result)}
                          >
                            View
                          </button>
                          
                          {/* Red trash button for delete */}
                          <button 
                            className="receptionist-btn-delete"
                            onClick={() => handleDeleteClick(result)}
                            title="Delete"
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal - Exact copy from ReviewResults */}
      {showViewModal && selectedResult && (
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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleDSSSupport}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#21AEA8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1a8e8a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#21AEA8'}
                >
                  Support
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
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
                  <strong>Patient:</strong> {getPatientName(selectedResult)}
                </div>
                <div>
                  <strong>Test Type:</strong> {formatServiceName(selectedResult)}
                </div>
                <div>
                  <strong>Sample Date:</strong> {selectedResult.sampleDate ? new Date(selectedResult.sampleDate).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <strong>Date Performed:</strong> {selectedResult.results?.date_performed || selectedResult.results?.datePerformed || 'N/A'}
                </div>
                <div>
                  <strong>Time Performed:</strong> {selectedResult.results?.time_performed || selectedResult.results?.timePerformed || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: selectedResult.status === 'completed' ? '#d4edda' : 
                                     selectedResult.status === 'reviewed' ? '#d1ecf1' :
                                     selectedResult.status === 'rejected' ? '#f8d7da' :
                                     selectedResult.status === 'pending' ? '#fff3cd' :
                                     '#f8f9fa',
                    color: selectedResult.status === 'completed' ? '#155724' : 
                           selectedResult.status === 'reviewed' ? '#0c5460' :
                           selectedResult.status === 'rejected' ? '#721c24' :
                           selectedResult.status === 'pending' ? '#856404' :
                           '#495057'
                  }}>
                    {selectedResult.status === 'reviewed' ? 'reviewed' : (selectedResult.status || 'Pending')}
                  </span>
                </div>
              </div>

              {/* Test Results by Category */}
              {(() => {
                const organizedResults = getOrganizedTestResults(selectedResult);
                
                if (Object.keys(organizedResults).length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <p style={{ fontSize: '16px', marginBottom: '10px' }}>⚠️ No test results have been entered yet.</p>
                      <p style={{ fontSize: '14px', color: '#999' }}>
                        This test record exists but the laboratory values have not been filled in.
                      </p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResult && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with red accent */}
            <div style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              padding: '25px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Delete Test Result
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '15px',
                opacity: 0.95
              }}>
                Are you sure you want to delete this test result?
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: '30px' }}>
              {/* Test Details */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>Sample ID:</span>
                  <span style={{ 
                    marginLeft: '10px',
                    color: '#212529',
                    fontSize: '14px'
                  }}>{selectedResult.sampleId || 'N/A'}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>Patient:</span>
                  <span style={{ 
                    marginLeft: '10px',
                    color: '#212529',
                    fontSize: '14px'
                  }}>{getPatientName(selectedResult)}</span>
                </div>
                <div>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>Test Type:</span>
                  <span style={{ 
                    marginLeft: '10px',
                    color: '#212529',
                    fontSize: '14px'
                  }}>{formatServiceName(selectedResult)}</span>
                </div>
              </div>

              {/* Warning Message */}
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: 0,
                  color: '#856404',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  This action cannot be undone!
                </p>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div style={{
              padding: '20px 30px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  border: '2px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#f8f9fa')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'white')}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#c82333')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#dc3545')}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DSS Support Modal */}
      {showDSSModal && (
        <ReviewDSSSupport 
          recommendations={dssRecommendations}
          onClose={() => setShowDSSModal(false)}
        />
      )}
    </div>
  );
}

export default FinishedTestResults;
