import React, { useState, useEffect } from 'react';
import '../design/Dashboard.css';
import { appointmentAPI, testResultsAPI, servicesAPI } from '../services/api';
import ReviewResults from './ReviewResults';
import FinishedTestResults from './FinishedTestResults';

function MedTechDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('testing-queue');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Testing Queue State - now fetches real checked-in appointments
  const [testingQueue, setTestingQueue] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // View mode state for completed tests
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  
  // Rejection reason modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionData, setSelectedRejectionData] = useState(null);

  // Result form state - comprehensive laboratory test results
  const [resultForm, setResultForm] = useState({
    // Blood Chemistry
    fbs: '',
    bua: '',
    bun: '',
    creatinine: '',
    cholesterol: '',
    triglyceride: '',
    hdl: '',
    ldl: '',
    ast_sgot: '',
    alt_sgpt: '',
    
    // Electrolytes
    sodium: '',
    potassium: '',
    chloride: '',
    magnesium: '',
    phosphorus: '',
    
    // OGTT (Oral Glucose Tolerance Test)
    ogtt_fasting: '',
    ogtt_30min: '',
    ogtt_60min: '',
    ogtt_90min: '',
    ogtt_120min: '',
    
    // Hematology/CBC
    wbc: '',
    rbc: '',
    hemoglobin: '',
    hematocrit: '',
    platelets: '',
    esr: '',
    
    // RBC Indices
    mcv: '',
    mch: '',
    mchc: '',
    
    // Differential Count
    lymphocytes: '',
    neutrophils: '',
    monocytes: '',
    eosinophils: '',
    basophils: '',
    
    // Coagulation Studies
    aptt: '',
    pt: '',
    inr: '',
    
    // Clinical Microscopy - Urinalysis
    urine_color: '',
    urine_transparency: '',
    urine_specific_gravity: '',
    urine_ph: '',
    urine_protein: '',
    urine_glucose: '',
    urine_ketones: '',
    urine_blood: '',
    urine_leukocytes: '',
    urine_nitrites: '',
    urine_urobilinogen: '',
    urine_bilirubin: '',
    urine_rbc: '',
    urine_wbc: '',
    urine_epithelial: '',
    urine_bacteria: '',
    urine_crystals: '',
    urine_casts: '',
    urine_mucus_thread: '',
    urine_amorphous_urates: '',
    urine_others: '',
    
    // Clinical Microscopy - Fecalysis
    fecal_color: '',
    fecal_consistency: '',
    fecal_occult_blood: '',
    fecal_rbc: '',
    fecal_wbc: '',
    fecal_bacteria: '',
    fecal_parasite_ova: '',
    
    // Pregnancy Test
    pregnancy_test_serum: '',
    pregnancy_test_urine: '',
    
    // Immunology & Serology
    blood_type: '',
    rh_factor: '',
    hepatitis_b: '',
    hepatitis_c: '',
    hiv: '',
    vdrl: '',
    dengue_duo: '',
    dengue_ns1: '',
    dengue_igg: '',
    dengue_igm: '',
    salmonella: '',
    salmonella_igg: '',
    salmonella_igm: '',
    hpylori_antigen: '',
    hpylori_antibody: '',
    psa: '',
    crp: '',
    
    // Thyroid Tests
    tsh: '',
    ft3: '',
    ft4: '',
    t3: '',
    t4: '',
    
    // Additional fields
    remarks: '',
    technician: '',
    datePerformed: new Date().toISOString().split('T')[0],
    timePerformed: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  // Filter States
  const [sampleFilters, setSampleFilters] = useState({
    sampleType: '',
    status: '',
    priority: '',
    search: ''
  });

  // Test category state for results entry
  const [activeTestCategory, setActiveTestCategory] = useState('Blood Chemistry');

  const [resultFilters, setResultFilters] = useState({
    status: '',
    testType: '',
    date: '',
    search: ''
  });

  const user = currentUser;

  // Draft management state
  const [savedDrafts, setSavedDrafts] = useState(new Map()); // appointmentId -> draft data
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedForm, setLastSavedForm] = useState(null);

  // Handle result form changes
  const handleResultChange = (fieldName, value) => {
    setResultForm(prev => {
      const newForm = {
        ...prev,
        [fieldName]: value
      };
      
      // Check if form has changed from last saved state
      const formChanged = JSON.stringify(newForm) !== JSON.stringify(lastSavedForm);
      setHasUnsavedChanges(formChanged);
      
      return newForm;
    });
  };

  // Data fetching functions
  const fetchSamples = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSamples = [
        {
          id: 'S001-2024',
          patientName: 'Maria Santos',
          sampleType: 'Blood',
          status: 'processing',
          priority: 'normal',
          collectionDate: new Date().toISOString(),
          testType: 'Complete Blood Count'
        },
        {
          id: 'S002-2024',
          patientName: 'Juan Cruz',
          sampleType: 'Urine',
          status: 'completed',
          priority: 'urgent',
          collectionDate: new Date().toISOString(),
          testType: 'Blood Glucose'
        },
        {
          id: 'S003-2024',
          patientName: 'Pedro Garcia',
          sampleType: 'Serum',
          status: 'pending',
          priority: 'high',
          collectionDate: new Date().toISOString(),
          testType: 'Liver Function Tests'
        }
      ];
      
      setSamples(mockSamples);
    } catch (err) {
      setError('Failed to fetch samples: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResults = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = [
        {
          id: 'R001-2024',
          sampleId: 'S001-2024',
          patientName: 'Maria Santos',
          testType: 'Complete Blood Count',
          status: 'completed',
          results: {
            hemoglobin: '12.5',
            hematocrit: '38.5',
            wbc: '7.2',
            rbc: '4.5',
            platelets: '250'
          },
          referenceRanges: {
            hemoglobin: { min: 12.0, max: 15.5, unit: 'g/dL' },
            hematocrit: { min: 36, max: 46, unit: '%' },
            wbc: { min: 4.5, max: 11.0, unit: '×10³/μL' },
            rbc: { min: 4.2, max: 5.4, unit: '×10⁶/μL' },
            platelets: { min: 150, max: 400, unit: '×10³/μL' }
          },
          resultDate: new Date().toISOString()
        }
      ];
      
      setTestResults(mockResults);
    } catch (err) {
      setError('Failed to fetch test results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sample handling functions
  const handleSampleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSample = {
        id: `S${Date.now()}-2024`,
        ...formData,
        status: 'pending',
        collectionDate: new Date().toISOString()
      };
      
      setSamples(prev => [newSample, ...prev]);
      setSampleForm({
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: '',
        sampleId: '',
        sampleType: '',
        collectionTime: '',
        priority: 'routine',
        testRequests: []
      });
      alert('Sample saved successfully!');
    } catch (err) {
      setError('Failed to save sample: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResultSubmit = async (sampleId, resultData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newResult = {
        id: `R${Date.now()}-2024`,
        sampleId: sampleId,
        results: resultData,
        status: 'completed',
        resultDate: new Date().toISOString(),
        technician: currentUser?.username || 'medtech1'
      };
      
      setTestResults(prev => [newResult, ...prev]);
      
      // Update sample status
      setSamples(prev => 
        prev.map(sample => 
          sample.id === sampleId 
            ? { ...sample, status: 'completed' }
            : sample
        )
      );
      
      alert('Results saved successfully!');
    } catch (err) {
      setError('Failed to save results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch testing queue - gets checked-in appointments ready for testing
  const fetchTestingQueue = async () => {
    setLoading(true);
    setError('');
    try {
      // Remove excessive debugging - keeping essential ones only
      console.log('Token from sessionStorage:', sessionStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Try lowercase first
      let response = await appointmentAPI.getAppointments({
        status: 'checked-in',
        limit: 50,
        sortBy: 'appointmentDate',
        sortOrder: 'asc'
      });

      console.log('Testing queue API response (lowercase):', response);
      console.log('Response data structure:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length,
        firstItem: response.data?.[0]
      });

      // If no results with lowercase, try uppercase
      if (response.success && (!response.data || response.data.length === 0)) {
        console.log('No lowercase results, trying uppercase CHECKED-IN');
        response = await appointmentAPI.getAppointments({
          status: 'CHECKED-IN',
          limit: 50,
          sortBy: 'appointmentDate',
          sortOrder: 'asc'
        });
        console.log('Testing queue API response (uppercase):', response);
      }

      if (response.success) {
        console.log('Found appointments:', response.data);
        console.log('Setting testing queue with:', response.data);
        // The API returns data directly as an array
        setTestingQueue(response.data || []);
        
        // Check for existing test results/drafts for all appointments
        await checkExistingDrafts(response.data || []);
      } else {
        console.error('API returned error:', response.message);
        throw new Error(response.message || 'Failed to fetch testing queue');
      }
    } catch (error) {
      console.error('Failed to fetch testing queue:', error);
      setError('Failed to load testing queue: ' + error.message);
      setTestingQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle showing rejection reason
  const handleShowRejectionReason = (appointment) => {
    // Find the test result data that contains rejection info
    const testData = savedDrafts.get(appointment._id);
    if (testData && testData.rejectionReason) {
      setSelectedRejectionData({
        patientName: appointment.patientName,
        serviceName: appointment.serviceName,
        rejectionReason: testData.rejectionReason,
        rejectedBy: testData.rejectedBy,
        rejectedDate: testData.rejectedDate
      });
      setShowRejectionModal(true);
    }
  };

  // Effect to fetch data when section changes
  useEffect(() => {
    if (activeSection === 'testing-queue') {
      fetchTestingQueue();
    }
  }, [activeSection]);

  // Listen for test result updates from other components (like ReviewResults)
  useEffect(() => {
    const handleTestResultUpdate = (event) => {
      console.log('🔄 Test result updated, refreshing Testing Queue...', event.detail);
      // Always refresh when test results are updated, regardless of current section
      fetchTestingQueue();
    };

    window.addEventListener('testResultUpdated', handleTestResultUpdate);
    return () => window.removeEventListener('testResultUpdated', handleTestResultUpdate);
  }, []); // Remove activeSection dependency to always listen

  const handleSectionClick = async (section) => {
    // Protect navigation when in enter-results mode with unsaved changes
    if (activeSection === 'enter-results') {
      const canNavigate = await handleNavigateAway(section);
      if (!canNavigate) {
        return;
      }
    }
    
    // If leaving enter-results, reset appointment selection
    if (activeSection === 'enter-results' && section !== 'enter-results') {
      setSelectedAppointment(null);
      
      // Reset form only if no saved draft exists
      if (!selectedAppointment || !savedDrafts.has(selectedAppointment._id)) {
        resetResultForm();
      }
    }
    
    setActiveSection(section);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const renderPageTitle = () => {
    switch (activeSection) {
      case 'sample-collection': return 'Sample Collection';
      case 'sample-tracking': return 'Sample Tracking';
      case 'result-entry': return 'Result Entry';
      case 'quality-control': return 'Quality Control';
      case 'testing-queue': return 'Testing Queue';
      case 'enter-results': return 'Enter Results';
      case 'review': return 'Review Results';
      case 'finished-results': return 'Finished Test Results';
      default: return 'MedTech Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'testing-queue': return renderTestingQueue();
      case 'enter-results': return renderEnterResults();
      case 'review': return renderReview();
      case 'finished-results': return <FinishedTestResults currentUser={currentUser} />;
      default: return renderTestingQueue(); // Default to testing queue
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Samples</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">23</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Completed</div>
            <div className="stat-value">67</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Urgent</div>
            <div className="stat-value">8</div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="middle-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3>Sample Processing Overview</h3>
          </div>
          <div className="chart-placeholder">
            <div className="chart-content">
              <div className="chart-mock">
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '45%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="overview-item" style={{cursor: 'pointer'}} onClick={() => handleSectionClick('sample-collection')}>
              <span className="overview-label">Collect Sample</span>
              <span className="overview-value">→</span>
            </div>
            <div className="overview-item" style={{cursor: 'pointer'}} onClick={() => handleSectionClick('result-entry')}>
              <span className="overview-label">Enter Results</span>
              <span className="overview-value">→</span>
            </div>
            <div className="overview-item" style={{cursor: 'pointer'}} onClick={() => handleSectionClick('sample-tracking')}>
              <span className="overview-label">Track Samples</span>
              <span className="overview-value">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        <div className="quick-access-card">
          <div className="card-header">
            <h3>Recent Samples</h3>
          </div>
          <div className="quick-access-content">
            <div className="access-item">
              <span>S001-2024 - Maria Santos</span>
              <span style={{color: '#21AEA8', fontWeight: '600'}}>Processing</span>
            </div>
            <div className="access-item">
              <span>S002-2024 - Juan Cruz</span>
              <span style={{color: '#28a745', fontWeight: '600'}}>Completed</span>
            </div>
            <div className="access-item">
              <span>S003-2024 - Pedro Garcia</span>
              <span style={{color: '#dc3545', fontWeight: '600'}}>Urgent</span>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="card-header">
            <h3>Today's Tasks</h3>
          </div>
          <div className="activity-content">
            <div className="access-item">
              <span>Blood samples to process</span>
              <span style={{color: '#21AEA8', fontWeight: '600'}}>12</span>
            </div>
            <div className="access-item">
              <span>Results pending entry</span>
              <span style={{color: '#ffc107', fontWeight: '600'}}>8</span>
            </div>
            <div className="access-item">
              <span>Urgent samples</span>
              <span style={{color: '#dc3545', fontWeight: '600'}}>3</span>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="card-header">
            <h3>System Status</h3>
          </div>
          <div className="activity-content">
            <div className="access-item">
              <span>Analyzer Status</span>
              <span style={{color: '#28a745', fontWeight: '600'}}>Online</span>
            </div>
            <div className="access-item">
              <span>Quality Control</span>
              <span style={{color: '#28a745', fontWeight: '600'}}>Passed</span>
            </div>
            <div className="access-item">
              <span>Equipment Check</span>
              <span style={{color: '#21AEA8', fontWeight: '600'}}>OK</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSampleCollection = () => {
    const handleInputChange = (field, value) => {
      setSampleForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleTestToggle = (testName) => {
      setSampleForm(prev => ({
        ...prev,
        testRequests: prev.testRequests.includes(testName)
          ? prev.testRequests.filter(test => test !== testName)
          : [...prev.testRequests, testName]
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!sampleForm.patientName.trim()) {
        alert('Patient name is required');
        return;
      }
      
      if (!sampleForm.sampleType) {
        alert('Please select a sample type');
        return;
      }
      
      if (sampleForm.testRequests.length === 0) {
        alert('Please select at least one test');
        return;
      }

      handleSampleSubmit(sampleForm);
    };

    const handleClearForm = () => {
      setSampleForm({
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: '',
        sampleId: '',
        sampleType: '',
        collectionTime: '',
        priority: 'routine',
        testRequests: []
      });
    };

    return (
      <div style={{background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
        <div style={{marginBottom: '25px'}}>
          <h2 style={{color: '#2c3e50', marginBottom: '10px'}}>Sample Collection</h2>
          <p style={{color: '#6c757d', margin: '0'}}>Register and collect new laboratory samples</p>
        </div>

        {loading && (
          <div style={{textAlign: 'center', padding: '20px', color: '#6c757d'}}>
            <p>Processing sample...</p>
          </div>
        )}

        {error && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px'}}>
            <p style={{margin: '0'}}>{error}</p>
            <button onClick={() => setError('')} style={{background: 'none', border: 'none', color: '#721c24', textDecoration: 'underline', cursor: 'pointer'}}>Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display: 'grid', gap: '20px'}}>
          <div>
            <h3 style={{color: '#2c3e50', marginBottom: '15px', fontSize: '1.1rem'}}>Patient Information</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
              <input 
                type="text" 
                placeholder="Patient ID" 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Patient Name *" 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                required
              />
              <input 
                type="date" 
                placeholder="Date of Birth" 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
              <select 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <h3 style={{color: '#2c3e50', marginBottom: '15px', fontSize: '1.1rem'}}>Sample Details</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
              <input 
                type="text" 
                placeholder="Sample ID (Auto-generated)" 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.sampleId}
                onChange={(e) => handleInputChange('sampleId', e.target.value)}
              />
              <select 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.sampleType}
                onChange={(e) => handleInputChange('sampleType', e.target.value)}
                required
              >
                <option value="">Select Sample Type *</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="serum">Serum</option>
                <option value="plasma">Plasma</option>
                <option value="other">Other</option>
              </select>
              <input 
                type="datetime-local" 
                placeholder="Collection Time" 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.collectionTime}
                onChange={(e) => handleInputChange('collectionTime', e.target.value)}
              />
              <select 
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                value={sampleForm.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
          </div>

          <div>
            <h3 style={{color: '#2c3e50', marginBottom: '15px', fontSize: '1.1rem'}}>Tests Requested *</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px'}}>
              {[
                'Complete Blood Count (CBC)',
                'Blood Glucose',
                'Liver Function Tests',
                'Kidney Function Tests',
                'Lipid Profile',
                'Thyroid Function'
              ].map(test => (
                <label key={test} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer'}}>
                  <input 
                    type="checkbox"
                    checked={sampleForm.testRequests.includes(test)}
                    onChange={() => handleTestToggle(test)}
                    style={{margin: '0'}}
                  />
                  <span style={{fontSize: '0.9rem'}}>{test}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{display: 'flex', gap: '10px', paddingTop: '10px'}}>
            <button 
              type="submit" 
              style={{background: '#21AEA8', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Sample'}
            </button>
            <button 
              type="button" 
              style={{background: '#6c757d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer'}}
            >
              Print Labels
            </button>
            <button 
              type="button" 
              style={{background: '#dc3545', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer'}}
              onClick={handleClearForm}
            >
              Clear Form
            </button>
          </div>
        </form>

        {samples.length > 0 && (
          <div style={{marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '4px'}}>
            <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Recent Collections ({samples.length})</h3>
            <div style={{display: 'grid', gap: '8px'}}>
              {samples.slice(0, 5).map(sample => (
                <div key={sample.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '4px'}}>
                  <span style={{fontWeight: '600'}}>{sample.id}</span>
                  <span>{sample.patientName}</span>
                  <span style={{color: '#6c757d'}}>{sample.sampleType}</span>
                  <span style={{color: sample.status === 'completed' ? '#28a745' : '#21AEA8', fontWeight: '600'}}>{sample.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSampleTracking = () => (
    <div style={{background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
      <div style={{marginBottom: '25px'}}>
        <h2 style={{color: '#2c3e50', marginBottom: '10px'}}>Sample Tracking</h2>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search by Sample ID or Patient Name" 
            style={{flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
          />
          <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer'}}>
            Search
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{marginBottom: '25px'}}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Samples</div>
            <div className="stat-value">45</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">23</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Completed</div>
            <div className="stat-value">15</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Pending</div>
            <div className="stat-value">7</div>
          </div>
        </div>
      </div>

      <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '25px'}}>
        <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Sample List</h3>
        <div style={{display: 'grid', gap: '10px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '120px 150px 180px 140px 120px 100px 1fr', gap: '15px', padding: '10px', background: '#21AEA8', color: 'white', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem'}}>
            <span>Sample ID</span>
            <span>Patient</span>
            <span>Test Type</span>
            <span>Collection Date</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Actions</span>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 150px 180px 140px 120px 100px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>S001-2024</span>
            <span>Maria Santos</span>
            <span>Complete Blood Count</span>
            <span style={{color: '#6c757d'}}>Oct 9, 2025</span>
            <span style={{color: '#21AEA8', fontWeight: '600'}}>Processing</span>
            <span style={{color: '#ffc107', fontWeight: '600'}}>Normal</span>
            <div style={{display: 'flex', gap: '5px'}}>
              <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Track</button>
              <button style={{background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Update</button>
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 150px 180px 140px 120px 100px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>S002-2024</span>
            <span>Juan Cruz</span>
            <span>Blood Glucose</span>
            <span style={{color: '#6c757d'}}>Oct 9, 2025</span>
            <span style={{color: '#28a745', fontWeight: '600'}}>Completed</span>
            <span style={{color: '#dc3545', fontWeight: '600'}}>Urgent</span>
            <div style={{display: 'flex', gap: '5px'}}>
              <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Track</button>
              <button style={{background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>View</button>
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 150px 180px 140px 120px 100px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>S003-2024</span>
            <span>Pedro Garcia</span>
            <span>Liver Function Tests</span>
            <span style={{color: '#6c757d'}}>Oct 9, 2025</span>
            <span style={{color: '#ffc107', fontWeight: '600'}}>Pending</span>
            <span style={{color: '#fd7e14', fontWeight: '600'}}>High</span>
            <div style={{display: 'flex', gap: '5px'}}>
              <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Track</button>
              <button style={{background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Start</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px'}}>
        <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Sample Timeline</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div style={{width: '12px', height: '12px', background: '#28a745', borderRadius: '50%'}}></div>
            <div>
              <div style={{fontWeight: '600', color: '#2c3e50'}}>08:30 AM - Sample Collected</div>
              <div style={{color: '#6c757d', fontSize: '0.9rem'}}>Sample collected from patient</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div style={{width: '12px', height: '12px', background: '#28a745', borderRadius: '50%'}}></div>
            <div>
              <div style={{fontWeight: '600', color: '#2c3e50'}}>08:45 AM - Sample Received</div>
              <div style={{color: '#6c757d', fontSize: '0.9rem'}}>Sample received at laboratory</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div style={{width: '12px', height: '12px', background: '#21AEA8', borderRadius: '50%'}}></div>
            <div>
              <div style={{fontWeight: '600', color: '#2c3e50'}}>09:00 AM - Processing Started</div>
              <div style={{color: '#6c757d', fontSize: '0.9rem'}}>Sample processing initiated</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div style={{width: '12px', height: '12px', background: '#e9ecef', borderRadius: '50%'}}></div>
            <div>
              <div style={{fontWeight: '600', color: '#6c757d'}}>Pending - Testing</div>
              <div style={{color: '#6c757d', fontSize: '0.9rem'}}>Awaiting test completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to get reference ranges
  const getReferenceRange = (test) => {
    const ranges = {
      // Blood Chemistry
      fbs: '70-100 mg/dL',
      bua: '3.5-7.0 mg/dL',
      bun: '7-18 mg/dL',
      creatinine: '0.6-1.2 mg/dL',
      cholesterol: '<200 mg/dL',
      triglyceride: '<150 mg/dL',
      hdl: '>40 mg/dL (M), >50 mg/dL (F)',
      ldl: '<100 mg/dL',
      ast_sgot: '10-40 U/L',
      alt_sgpt: '7-35 U/L',
      
      // Electrolytes
      sodium: '135-145 mEq/L',
      potassium: '3.5-5.1 mEq/L',
      chloride: '98-107 mEq/L',
      magnesium: '1.7-2.2 mg/dL',
      phosphorus: '2.5-4.5 mg/dL',
      
      // Hematology
      wbc: '4.5-11.0 x10³/µL',
      rbc: '4.2-5.4 x10⁶/µL (M), 3.6-5.0 x10⁶/µL (F)',
      hemoglobin: '14-18 g/dL (M), 12-16 g/dL (F)',
      hematocrit: '42-52% (M), 37-47% (F)',
      platelets: '150-400 x10³/µL',
      esr: '0-15 mm/hr (M), 0-20 mm/hr (F)',
      
      // RBC Indices
      mcv: '80.0-100.0 fL',
      mch: '27.0-34.0 pg',
      mchc: '320-360 g/L',
      
      // Differential Count
      lymphocytes: '20-40%',
      neutrophils: '50-70%',
      monocytes: '2-8%',
      eosinophils: '1-4%',
      basophils: '0.5-1%',
      
      // Coagulation Studies
      aptt: '25-35 seconds',
      pt: '11-15 seconds',
      inr: '0.8-1.2',
      
      // Urinalysis
      urine_specific_gravity: '1.003-1.030',
      urine_ph: '4.6-8.0',
      urine_protein: 'Negative',
      urine_glucose: 'Negative',
      urine_ketones: 'Negative',
      urine_blood: 'Negative',
      urine_leukocytes: 'Negative',
      urine_nitrites: 'Negative',
      urine_urobilinogen: 'Normal',
      urine_bilirubin: 'Negative',
      urine_rbc: '0-3/hpf',
      urine_wbc: '0-5/hpf',
      urine_epithelial: 'Few',
      urine_bacteria: 'Few',
      urine_mucus_thread: 'Few',
      urine_amorphous_urates: 'Few',
      urine_others: '',
      
      // Fecalysis
      fecal_rbc: '0/hpf',
      fecal_wbc: '0-5/hpf',
      fecal_occult_blood: 'Negative',
      fecal_bacteria: 'Few',
      fecal_parasite_ova: 'None seen',
      
      // Pregnancy Test
      pregnancy_test_serum: 'Negative',
      pregnancy_test_urine: 'Negative',
      
      // Thyroid Tests
      tsh: '0.4-4.0 mIU/L',
      ft3: '2.3-4.2 pg/mL',
      ft4: '0.8-1.8 ng/dL',
      t3: '80-200 ng/dL',
      t4: '4.5-12.0 µg/dL',
      
      // Tumor Markers & Inflammation
      psa: '<4.0 ng/mL',
      crp: '<3.0 mg/L',
      
      // OGTT Reference Ranges
      ogtt_fasting: '70-100 mg/dL',
      ogtt_30min: '<180 mg/dL',
      ogtt_60min: '<180 mg/dL',
      ogtt_90min: '<155 mg/dL',
      ogtt_120min: '<140 mg/dL'
    };
    return ranges[test] || '';
  };

  // ===== TEST ENABLEMENT SYSTEM =====
  
  // Service-to-Test Category Mapping
  const getTestCategoriesFromServices = () => {
    if (!selectedAppointment) {
      return [];
    }

    // Extract service names from appointment - handle both services array and serviceName string
    let serviceNames = [];
    
    // Check if appointment has services array (individual service objects)
    if (selectedAppointment.services && Array.isArray(selectedAppointment.services)) {
      serviceNames = selectedAppointment.services.map(service => {
        if (typeof service === 'string') return service;
        if (service?.name || service?.serviceName) return service.name || service.serviceName;
        return '';
      }).filter(name => name);
    }
    
    // If no services array or it's empty, use the combined serviceName string
    if (serviceNames.length === 0 && selectedAppointment.serviceName) {
      // Split the combined service names string by comma and clean up
      serviceNames = selectedAppointment.serviceName
        .split(',')
        .map(name => name.trim())
        .filter(name => name);
    }

    // Map services to test categories
    const enabledCategories = new Set();
    
    serviceNames.forEach(serviceName => {
      const normalizedService = serviceName.toLowerCase().trim();
      const initialSize = enabledCategories.size;
      
      // Blood Chemistry mapping - Comprehensive coverage based on MDLAB system arrangement
      if (normalizedService.includes('blood chemistry') || normalizedService.includes('clinical chemistry') ||
          normalizedService.includes('chem 10') || normalizedService.includes('chemistry panel') ||
          normalizedService.includes('fbs') || normalizedService.includes('rbs') ||
          normalizedService.includes('glucose') || normalizedService.includes('blood sugar') ||
          normalizedService.includes('fasting blood sugar') ||
          normalizedService.includes('cholesterol') || normalizedService.includes('total cholesterol') ||
          normalizedService.includes('triglycerides') || normalizedService.includes('triglyceride') ||
          normalizedService.includes('hdl') || normalizedService.includes('hdl cholesterol') ||
          normalizedService.includes('ldl') || normalizedService.includes('ldl cholesterol') ||
          normalizedService.includes('lipid') || normalizedService.includes('lipid profile') ||
          normalizedService.includes('liver function') || normalizedService.includes('lft') ||
          normalizedService.includes('kidney function') || normalizedService.includes('kft') ||
          normalizedService.includes('basic metabolic') || normalizedService.includes('bmp') ||
          normalizedService.includes('uric acid') ||
          normalizedService.includes('creatinine') ||
          normalizedService.includes('bun') || normalizedService.includes('blood urea nitrogen') ||
          normalizedService.includes('ast') || normalizedService.includes('sgot') ||
          normalizedService.includes('alt') || normalizedService.includes('sgpt') ||
          normalizedService.includes('magnesium') || normalizedService.includes('phosphorus') ||
          normalizedService.includes('electrolytes') || normalizedService.includes('sodium') || 
          normalizedService.includes('potassium') || normalizedService.includes('chloride') ||
          normalizedService.includes('hba1c') || normalizedService.includes('glycated hemoglobin') ||
          normalizedService.includes('ogtt') || normalizedService.includes('oral glucose tolerance')) {
        enabledCategories.add('blood_chemistry');
        console.log(`  ✅ Matched blood_chemistry for: "${serviceName}"`);
      }
      
      // Hematology/CBC mapping (including coagulation studies)
      if (normalizedService.includes('cbc') || 
          normalizedService.includes('complete blood count') ||
          normalizedService.includes('hematology') ||
          normalizedService.includes('blood count') ||
          normalizedService.includes('esr') || normalizedService.includes('erythrocyte sedimentation') ||
          normalizedService.includes('aptt') || normalizedService.includes('activated partial thromboplastin') ||
          normalizedService.includes('pt') || normalizedService.includes('prothrombin') ||
          normalizedService.includes('coagulation') || normalizedService.includes('bleeding time')) {
        enabledCategories.add('hematology');
        console.log(`  ✅ Matched hematology for: "${serviceName}"`);
      }
      
      // Clinical Microscopy/Urinalysis mapping
      if (normalizedService.includes('urinalysis') || 
          normalizedService.includes('urine') ||
          normalizedService.includes('urine examination') ||
          normalizedService.includes('complete urine examination') ||
          normalizedService.includes('clinical microscopy') ||
          normalizedService.includes('pregnancy test (urine)')) {
        enabledCategories.add('urinalysis');
        console.log(`  ✅ Matched urinalysis for: "${serviceName}"`);
      }
      
      // Fecalysis mapping
      if (normalizedService.includes('fecalysis') || 
          normalizedService.includes('stool') ||
          normalizedService.includes('stool examination') ||
          normalizedService.includes('sputum') ||
          normalizedService.includes('fobt') || normalizedService.includes('fecal occult blood')) {
        enabledCategories.add('fecalysis');
        console.log(`  ✅ Matched fecalysis for: "${serviceName}"`);
      }
      
      // Pregnancy Test mapping
      if (normalizedService.includes('pregnancy test') || normalizedService.includes('serum pregnancy') ||
          normalizedService.includes('beta hcg') || normalizedService.includes('pregnancy')) {
        // Check if it's specifically serum pregnancy test for immunology
        if (normalizedService.includes('serum') || normalizedService.includes('beta hcg')) {
          enabledCategories.add('immunology');
          console.log(`  ✅ Matched immunology (serum pregnancy) for: "${serviceName}"`);
        }
        // Always enable urinalysis for pregnancy tests (includes urine pregnancy test)
        enabledCategories.add('urinalysis');
        console.log(`  ✅ Matched urinalysis (pregnancy test) for: "${serviceName}"`);
      }
      
      // Blood Typing mapping
      if (normalizedService.includes('blood typing') || 
          normalizedService.includes('blood type') || normalizedService.includes('abo rh')) {
        enabledCategories.add('blood_typing');
        console.log(`  ✅ Matched blood_typing for: "${serviceName}"`);
      }
      
      // Serology/Immunology mapping - Following MDLAB system grouping
      if (normalizedService.includes('hepatitis') || normalizedService.includes('hbsag') ||
          normalizedService.includes('hepatitis b surface antigen') || normalizedService.includes('hepatitis b antigen') ||
          normalizedService.includes('hiv') || normalizedService.includes('anti hcv') || normalizedService.includes('hiv screening') ||
          normalizedService.includes('vdrl') || normalizedService.includes('syphilis') ||
          normalizedService.includes('dengue') || normalizedService.includes('ns1') || normalizedService.includes('dengue duo') ||
          normalizedService.includes('salmonella') || normalizedService.includes('typhoid') ||
          normalizedService.includes('h. pylori') || normalizedService.includes('helicobacter') ||
          normalizedService.includes('rapid antigen') || normalizedService.includes('covid') ||
          normalizedService.includes('psa') || normalizedService.includes('prostate specific') ||
          normalizedService.includes('immunology') ||
          normalizedService.includes('serology')) {
        enabledCategories.add('immunology');
        console.log(`  ✅ Matched immunology for: "${serviceName}"`);
      }
      
      // Thyroid Function Tests mapping
      if (normalizedService.includes('thyroid') || 
          normalizedService.includes('thyroid function') || normalizedService.includes('tft') ||
          normalizedService.includes('tsh') || normalizedService.includes('thyroid stimulating') ||
          normalizedService.includes('ft3') || normalizedService.includes('free triiodothyronine') ||
          normalizedService.includes('ft4') || normalizedService.includes('free thyroxine') ||
          normalizedService.includes('t3') || normalizedService.includes('triiodothyronine') ||
          normalizedService.includes('t4') || normalizedService.includes('thyroxine')) {
        enabledCategories.add('thyroid');
        console.log(`  ✅ Matched thyroid for: "${serviceName}"`);
      }
      
      // Check if no category was matched for this service
      if (enabledCategories.size === initialSize) {
        console.log(`  ❌ No category matched for: "${serviceName}"`);
      }
    });

    const categoriesArray = Array.from(enabledCategories);
    console.log('✅ Enabled test categories:', categoriesArray);
    return categoriesArray;
  };

  // Check if a test category is enabled
  const isTestCategoryEnabled = (category) => {
    if (!selectedAppointment) return false; // Disable all by default
    
    const enabledCategories = getTestCategoriesFromServices();
    return enabledCategories.includes(category);
  };

  // Get overlay styles for disabled sections
  const getTestSectionStyles = (category, isEnabled = null) => {
    const enabled = isEnabled !== null ? isEnabled : isTestCategoryEnabled(category);
    
    return {
      position: 'relative',
      opacity: enabled ? 1 : 0.6,
      pointerEvents: enabled ? 'auto' : 'none',
      filter: enabled ? 'none' : 'grayscale(50%)',
      transition: 'all 0.3s ease'
    };
  };

  // Get disabled overlay component
  const DisabledOverlay = ({ category, testName }) => {
    const enabled = isTestCategoryEnabled(category);
    
    if (enabled) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(1px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderRadius: '8px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 107, 107, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          ❌ {testName} Not Selected
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
            Patient hasn't paid for this test
          </div>
        </div>
      </div>
    );
  };

  // Render Blood Chemistry Form
  const renderBloodChemistryForm = () => (
    <div style={getTestSectionStyles('blood_chemistry')}>
      <DisabledOverlay category="blood_chemistry" testName="Blood Chemistry" />
      
      <h3 style={{ marginBottom: '20px', color: '#21AEA8', borderBottom: '2px solid #21AEA8', paddingBottom: '10px' }}>
        Blood Chemistry Panel
      </h3>
      
      {/* Regular Blood Chemistry Tests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
          { key: 'fbs', label: 'FBS/Glucose', unit: 'mg/dL' },
          { key: 'bua', label: 'BUA (Uric Acid)', unit: 'mg/dL' },
          { key: 'bun', label: 'BUN', unit: 'mg/dL' },
          { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL' },
          { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL' },
          { key: 'triglyceride', label: 'Triglyceride', unit: 'mg/dL' },
          { key: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL' },
          { key: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL' },
          { key: 'ast_sgot', label: 'AST/SGOT', unit: 'U/L' },
          { key: 'alt_sgpt', label: 'ALT/SGPT', unit: 'U/L' },
          { key: 'magnesium', label: 'Magnesium (Mg)', unit: 'mg/dL' },
          { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'mg/dL' }
        ].map(test => (
          <div key={test.key} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              {test.label} ({test.unit})
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder={`Enter ${test.label.toLowerCase()}`}
              disabled={isViewOnlyMode}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '14px',
                backgroundColor: isViewOnlyMode ? '#f8f9fa' : '#fff',
                color: isViewOnlyMode ? '#6c757d' : '#333',
                cursor: isViewOnlyMode ? 'not-allowed' : 'text'
              }}
              value={resultForm[test.key]}
              onChange={(e) => handleResultChange(test.key, e.target.value)}
            />
            <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
              Reference: {getReferenceRange(test.key)}
            </span>
          </div>
        ))}
      </div>

      {/* Electrolytes Section - Grouped in a Box */}
      <div style={{ 
        border: '2px solid #21AEA8', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#f8fcfc',
        marginTop: '20px',
        ...getTestSectionStyles('blood_chemistry')
      }}>
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#21AEA8', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Electrolytes
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { key: 'sodium', label: 'Sodium (Na+)', unit: 'mEq/L' },
            { key: 'potassium', label: 'Potassium (K+)', unit: 'mEq/L' },
            { key: 'chloride', label: 'Chloride (Cl-)', unit: 'mEq/L' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} ({test.unit})
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder={`Enter ${test.label.toLowerCase()}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #21AEA8', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* OGTT Section - Grouped in a Box */}
      <div style={{ 
        border: '2px solid #3498db', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#f0f9ff',
        marginTop: '20px',
        ...getTestSectionStyles('blood_chemistry')
      }}>
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#3498db', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          OGTT (Oral Glucose Tolerance Test)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { key: 'ogtt_fasting', label: 'Fasting', unit: 'mg/dL' },
            { key: 'ogtt_30min', label: '30 minutes', unit: 'mg/dL' },
            { key: 'ogtt_60min', label: '60 minutes', unit: 'mg/dL' },
            { key: 'ogtt_90min', label: '90 minutes', unit: 'mg/dL' },
            { key: 'ogtt_120min', label: '120 minutes', unit: 'mg/dL' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} ({test.unit})
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder={`Enter ${test.label.toLowerCase()}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #3498db', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#3498db', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Hematology Form
  const renderHematologyForm = () => (
    <div style={getTestSectionStyles('hematology')}>
      <DisabledOverlay category="hematology" testName="Hematology (CBC)" />
      
      <h3 style={{ marginBottom: '20px', color: '#21AEA8', borderBottom: '2px solid #21AEA8', paddingBottom: '10px' }}>
        Complete Blood Count (CBC) & Hematology
      </h3>
      
      {/* Basic CBC Tests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
          { key: 'wbc', label: 'WBC Count', unit: 'x10³/µL' },
          { key: 'rbc', label: 'RBC Count', unit: 'x10⁶/µL' },
          { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
          { key: 'hematocrit', label: 'Hematocrit', unit: '%' },
          { key: 'platelets', label: 'Platelet Count', unit: 'x10³/µL' },
          { key: 'esr', label: 'ESR', unit: 'mm/hr' }
        ].map(test => (
          <div key={test.key} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              {test.label} ({test.unit})
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder={`Enter ${test.label.toLowerCase()}`}
              disabled={isViewOnlyMode}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '14px',
                backgroundColor: isViewOnlyMode ? '#f8f9fa' : '#fff',
                color: isViewOnlyMode ? '#6c757d' : '#333',
                cursor: isViewOnlyMode ? 'not-allowed' : 'text'
              }}
              value={resultForm[test.key]}
              onChange={(e) => handleResultChange(test.key, e.target.value)}
            />
            <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
              Reference: {getReferenceRange(test.key)}
            </span>
          </div>
        ))}
      </div>

      {/* RBC Indices Section - Grouped in a Box */}
      <div style={{ 
        border: '2px solid #21AEA8', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#f8fcfc',
        marginTop: '20px' 
      }}>
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#21AEA8', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          RBC Indices
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { key: 'mcv', label: 'MCV', unit: 'fL' },
            { key: 'mch', label: 'MCH', unit: 'pg' },
            { key: 'mchc', label: 'MCHC', unit: 'g/L' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} ({test.unit})
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder={`Enter ${test.label}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #21AEA8', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Differential Count Section - Grouped in a Box */}
      <div style={{ 
        border: '2px solid #21AEA8', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#f8fcfc',
        marginTop: '20px' 
      }}>
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#21AEA8', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Differential Count
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { key: 'lymphocytes', label: 'Lymphocytes', unit: '%' },
            { key: 'neutrophils', label: 'Neutrophils', unit: '%' },
            { key: 'monocytes', label: 'Monocytes', unit: '%' },
            { key: 'eosinophils', label: 'Eosinophils', unit: '%' },
            { key: 'basophils', label: 'Basophils', unit: '%' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} ({test.unit})
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder={`Enter ${test.label.toLowerCase()}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #21AEA8', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coagulation Studies Section - New Addition */}
      <div style={{ 
        border: '2px solid #dc3545', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#fdf2f2',
        marginTop: '20px' 
      }}>
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#dc3545', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Coagulation Studies
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { key: 'aptt', label: 'APTT (Activated Partial Thromboplastin Time)', unit: 'seconds' },
            { key: 'pt', label: 'PT (Prothrombin Time)', unit: 'seconds' },
            { key: 'inr', label: 'INR (International Normalized Ratio)', unit: '' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} {test.unit && `(${test.unit})`}
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder={`Enter ${test.label.split('(')[0].trim()}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #dc3545', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#dc3545', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404'
        }}>
          <strong>📝 Sample Collection Note:</strong> Coagulation tests require citrated plasma (Blue top tube). 
          Patient should inform of any anticoagulant medications (Warfarin, Heparin, etc.).
        </div>
      </div>
    </div>
  );

  // Render Clinical Microscopy Form
  const renderClinicalMicroscopyForm = () => (
    <div>
      <h3 style={{ marginBottom: '20px', color: '#21AEA8', borderBottom: '2px solid #21AEA8', paddingBottom: '10px' }}>
        Clinical Microscopy (Urinalysis & Fecalysis)
      </h3>
      
      {/* Urinalysis Section */}
      <div style={{ 
        marginBottom: '30px',
        ...getTestSectionStyles('urinalysis')
      }}>
        <DisabledOverlay category="urinalysis" testName="Urinalysis" />
        
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>Urinalysis</h4>
        
        {/* Physical Examination */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6c757d', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Physical Examination</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Color</label>
              <select 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm.urine_color}
                onChange={(e) => handleResultChange('urine_color', e.target.value)}
              >
                <option value="">Select color</option>
                <option value="Yellow">Yellow</option>
                <option value="Light Yellow">Light Yellow</option>
                <option value="Dark Yellow">Dark Yellow</option>
                <option value="Amber">Amber</option>
                <option value="Red">Red</option>
                <option value="Brown">Brown</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Transparency</label>
              <select 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm.urine_transparency}
                onChange={(e) => handleResultChange('urine_transparency', e.target.value)}
              >
                <option value="">Select transparency</option>
                <option value="Clear">Clear</option>
                <option value="Slightly Turbid">Slightly Turbid</option>
                <option value="Turbid">Turbid</option>
                <option value="Cloudy">Cloudy</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Specific Gravity</label>
              <input 
                type="number"
                step="0.001"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm.urine_specific_gravity}
                onChange={(e) => handleResultChange('urine_specific_gravity', e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange('urine_specific_gravity')}</span>
            </div>
          </div>
        </div>

        {/* Chemical Examination */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6c757d', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Chemical Examination</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>pH</label>
              <input 
                type="number"
                step="0.1"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm.urine_ph}
                onChange={(e) => handleResultChange('urine_ph', e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange('urine_ph')}</span>
            </div>

            {/* Chemical Tests with dropdown options */}
            {[
              'urine_protein', 'urine_glucose', 'urine_ketones', 'urine_blood', 
              'urine_leukocytes', 'urine_nitrites', 'urine_urobilinogen', 'urine_bilirubin'
            ].map(test => (
              <div key={test}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  {test.replace('urine_', '').replace('_', ' ').toUpperCase()}
                </label>
                <select 
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#333'
                  }}
                  value={resultForm[test]}
                  onChange={(e) => handleResultChange(test, e.target.value)}
                >
                  <option value="">Select result</option>
                  <option value="Negative">Negative</option>
                  <option value="Trace">Trace</option>
                  <option value="1+">1+</option>
                  <option value="2+">2+</option>
                  <option value="3+">3+</option>
                  <option value="4+">4+</option>
                  {test === 'urine_urobilinogen' && <option value="Normal">Normal</option>}
                </select>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange(test)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Microscopic Examination */}
        <div>
          <h5 style={{ color: '#6c757d', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Microscopic Examination</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {/* Cellular Elements */}
            {[
              { key: 'urine_rbc', label: 'RBC' },
              { key: 'urine_wbc', label: 'WBC' },
              { key: 'urine_epithelial', label: 'Epithelial Cells' }
            ].map(test => (
              <div key={test.key}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>{test.label}</label>
                <input 
                  type="text"
                  placeholder={getReferenceRange(test.key)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#333'
                  }}
                  value={resultForm[test.key]}
                  onChange={(e) => handleResultChange(test.key, e.target.value)}
                />
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange(test.key)}</span>
              </div>
            ))}

            {/* Other Microscopic Elements */}
            {[
              { key: 'urine_bacteria', label: 'Bacteria' },
              { key: 'urine_crystals', label: 'Crystals' },
              { key: 'urine_casts', label: 'Casts' },
              { key: 'urine_mucus_thread', label: 'Mucus Thread' },
              { key: 'urine_amorphous_urates', label: 'Amorphous Urates' }
            ].map(test => (
              <div key={test.key}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>{test.label}</label>
                <select 
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#333'
                  }}
                  value={resultForm[test.key]}
                  onChange={(e) => handleResultChange(test.key, e.target.value)}
                >
                  <option value="">Select result</option>
                  <option value="None">None</option>
                  <option value="Few">Few</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Many">Many</option>
                  <option value="Rare">Rare</option>
                  <option value="Occasional">Occasional</option>
                  {test.key === 'urine_bacteria' && <option value="Negative">Negative</option>}
                  {test.key === 'urine_casts' && <option value="Negative">Negative</option>}
                </select>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange(test.key)}</span>
              </div>
            ))}

            {/* Others - for additional findings */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Others</label>
              <input 
                type="text"
                placeholder="Enter any additional findings..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm.urine_others}
                onChange={(e) => handleResultChange('urine_others', e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#6c757d' }}>Additional findings not covered by standard parameters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fecalysis Section */}
      <div style={getTestSectionStyles('fecalysis')}>
        <DisabledOverlay category="fecalysis" testName="Fecalysis" />
        
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>Fecalysis</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Color</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.fecal_color}
              onChange={(e) => handleResultChange('fecal_color', e.target.value)}
            >
              <option value="">Select color</option>
              <option value="Brown">Brown</option>
              <option value="Dark Brown">Dark Brown</option>
              <option value="Light Brown">Light Brown</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
              <option value="Black">Black</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Consistency</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.fecal_consistency}
              onChange={(e) => handleResultChange('fecal_consistency', e.target.value)}
            >
              <option value="">Select consistency</option>
              <option value="Formed">Formed</option>
              <option value="Semi-formed">Semi-formed</option>
              <option value="Soft">Soft</option>
              <option value="Watery">Watery</option>
              <option value="Mucoid">Mucoid</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Occult Blood</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.fecal_occult_blood}
              onChange={(e) => handleResultChange('fecal_occult_blood', e.target.value)}
            >
              <option value="">Select result</option>
              <option value="Negative">Negative</option>
              <option value="Positive">Positive</option>
            </select>
            <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange('fecal_occult_blood')}</span>
          </div>

          {['fecal_rbc', 'fecal_wbc', 'fecal_bacteria', 'fecal_parasite_ova'].map(test => (
            <div key={test}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                {test === 'fecal_parasite_ova' 
                  ? 'PARASITE/OVA' 
                  : test.replace('fecal_', '').replace('_', ' ').toUpperCase()
                }
              </label>
              <input 
                type="text"
                placeholder={getReferenceRange(test)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test]}
                onChange={(e) => handleResultChange(test, e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange(test)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pregnancy Tests Section - Both Urine and Serum */}
      <div style={getTestSectionStyles('urinalysis')}>
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>Pregnancy Tests</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {/* Pregnancy Test (Urine) */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pregnancy Test (Urine)</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.pregnancy_test_urine}
              onChange={(e) => handleResultChange('pregnancy_test_urine', e.target.value)}
            >
              <option value="">Select result</option>
              <option value="Negative">Negative</option>
              <option value="Positive">Positive</option>
            </select>
            <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange('pregnancy_test_urine')}</span>
          </div>

          {/* Pregnancy Test (Serum/β-HCG) */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pregnancy Test (Serum/β-HCG)</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.pregnancy_test_serum}
              onChange={(e) => handleResultChange('pregnancy_test_serum', e.target.value)}
            >
              <option value="">Select result</option>
              <option value="Negative">Negative</option>
              <option value="Positive">Positive</option>
            </select>
            <span style={{ fontSize: '11px', color: '#6c757d' }}>Ref: {getReferenceRange('pregnancy_test_serum')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Immunology & Serology Form
  const renderImmunologyForm = () => (
    <div>
      <h3 style={{ marginBottom: '20px', color: '#21AEA8', borderBottom: '2px solid #21AEA8', paddingBottom: '10px' }}>
        Immunology & Serology Tests
      </h3>
      
      {/* Blood Typing Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px',
        ...getTestSectionStyles('blood_typing')
      }}>
        <DisabledOverlay category="blood_typing" testName="Blood Typing" />
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Blood Type</label>
          <select 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#333'
            }}
            value={resultForm.blood_type}
            onChange={(e) => handleResultChange('blood_type', e.target.value)}
          >
            <option value="">Select blood type</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Rh Factor</label>
          <select 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#333'
            }}
            value={resultForm.rh_factor}
            onChange={(e) => handleResultChange('rh_factor', e.target.value)}
          >
            <option value="">Select Rh factor</option>
            <option value="Positive">Positive (+)</option>
            <option value="Negative">Negative (-)</option>
          </select>
        </div>
      </div>

      {/* Serology Tests Section */}
      <div style={{ 
        marginBottom: '30px',
        ...getTestSectionStyles('immunology')
      }}>
        <DisabledOverlay category="immunology" testName="Serology Tests" />
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>Serology Tests</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Tests with Reactive/Non-Reactive options */}
          {[
            { key: 'hepatitis_b', label: 'Hepatitis B (HBsAg)' },
            { key: 'hepatitis_c', label: 'Hepatitis C' },
            { key: 'hiv', label: 'HIV' },
            { key: 'vdrl', label: 'VDRL (Syphilis)' }
          ].map(test => (
            <div key={test.key}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label}
              </label>
              <select 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              >
                <option value="">Select result</option>
                <option value="Reactive">Reactive</option>
                <option value="Non-Reactive">Non-Reactive</option>
              </select>
            </div>
          ))}

          {/* Salmonella with IgG and IgM sub-components */}
          <div style={{ 
            border: '2px solid #f39c12', 
            borderRadius: '8px', 
            padding: '15px', 
            backgroundColor: '#fffbf0'
          }}>
            <h5 style={{ 
              marginTop: '0', 
              marginBottom: '15px', 
              color: '#f39c12', 
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Salmonella Typhi
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {[
                { key: 'salmonella_igg', label: 'IgG' },
                { key: 'salmonella_igm', label: 'IgM' }
              ].map(test => (
                <div key={test.key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    {test.label}
                  </label>
                  <select 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #f39c12', 
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '14px'
                    }}
                    value={resultForm[test.key]}
                    onChange={(e) => handleResultChange(test.key, e.target.value)}
                  >
                    <option value="">Select result</option>
                    <option value="Reactive">Reactive</option>
                    <option value="Non-Reactive">Non-Reactive</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* H.pylori with Antigen and Antibody sub-components */}
          <div style={{ 
            border: '2px solid #9b59b6', 
            borderRadius: '8px', 
            padding: '15px', 
            backgroundColor: '#faf5ff'
          }}>
            <h5 style={{ 
              marginTop: '0', 
              marginBottom: '15px', 
              color: '#9b59b6', 
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              H. pylori
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {[
                { key: 'hpylori_antigen', label: 'Antigen' },
                { key: 'hpylori_antibody', label: 'Antibody' }
              ].map(test => (
                <div key={test.key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    {test.label}
                  </label>
                  <select 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #9b59b6', 
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '14px'
                    }}
                    value={resultForm[test.key]}
                    onChange={(e) => handleResultChange(test.key, e.target.value)}
                  >
                    <option value="">Select result</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* PSA Test */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              PSA (Prostate Specific Antigen) (ng/mL)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter PSA value"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #21AEA8', 
                borderRadius: '4px', 
                fontSize: '14px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.psa}
              onChange={(e) => handleResultChange('psa', e.target.value)}
            />
            <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
              Reference: {getReferenceRange('psa')}
            </span>
          </div>

          {/* CRP Test */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              CRP (C-Reactive Protein) (mg/L)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter CRP value"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #21AEA8', 
                borderRadius: '4px', 
                fontSize: '14px',
                backgroundColor: '#fff',
                color: '#333'
              }}
              value={resultForm.crp}
              onChange={(e) => handleResultChange('crp', e.target.value)}
            />
            <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
              Reference: {getReferenceRange('crp')}
            </span>
          </div>

          {/* Dengue Duo with NS1, IgG, IgM sub-components */}
          <div style={{ 
            border: '2px solid #e74c3c', 
            borderRadius: '8px', 
            padding: '15px', 
            backgroundColor: '#fff5f5'
          }}>
            <h5 style={{ 
              marginTop: '0', 
              marginBottom: '15px', 
              color: '#e74c3c', 
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Dengue Duo
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {[
                { key: 'dengue_ns1', label: 'NS1 Antigen' },
                { key: 'dengue_igg', label: 'IgG Antibody' },
                { key: 'dengue_igm', label: 'IgM Antibody' }
              ].map(test => (
                <div key={test.key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    {test.label}
                  </label>
                  <select 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #e74c3c', 
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '14px'
                    }}
                    value={resultForm[test.key]}
                    onChange={(e) => handleResultChange(test.key, e.target.value)}
                  >
                    <option value="">Select result</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thyroid Tests Section - Grouped in a Box */}
      <div style={{ 
        border: '2px solid #21AEA8', 
        borderRadius: '8px', 
        padding: '20px', 
        backgroundColor: '#f8fcfc',
        marginTop: '20px',
        ...getTestSectionStyles('thyroid')
      }}>
        <DisabledOverlay category="thyroid" testName="Thyroid Function Tests" />
        
        <h4 style={{ 
          marginTop: '0', 
          marginBottom: '20px', 
          color: '#21AEA8', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Thyroid Tests
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { key: 'tsh', label: 'TSH', unit: 'mIU/L' },
            { key: 'ft3', label: 'FT3', unit: 'pg/mL' },
            { key: 'ft4', label: 'FT4', unit: 'ng/dL' },
            { key: 't3', label: 'T3', unit: 'ng/dL' },
            { key: 't4', label: 'T4', unit: 'µg/dL' }
          ].map(test => (
            <div key={test.key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                {test.label} ({test.unit})
              </label>
              <input 
                type="number" 
                step="0.01"
                placeholder={`Enter ${test.label.toLowerCase()}`}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #21AEA8', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333'
                }}
                value={resultForm[test.key]}
                onChange={(e) => handleResultChange(test.key, e.target.value)}
              />
              <span style={{ fontSize: '12px', color: '#21AEA8', fontStyle: 'italic', fontWeight: '500' }}>
                Reference: {getReferenceRange(test.key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render test category forms
  const renderTestCategoryForm = () => {
    switch (activeTestCategory) {
      case 'Blood Chemistry':
        return renderBloodChemistryForm();
      case 'Hematology':
        return renderHematologyForm();
      case 'Clinical Microscopy':
        return renderClinicalMicroscopyForm();
      case 'Immunology & Serology':
        return renderImmunologyForm();
      default:
        return renderBloodChemistryForm();
    }
  };

  // Handle saving results (draft)
  const handleSaveResults = async () => {
    if (!selectedAppointment) {
      alert('No appointment selected');
      return;
    }

    try {
      setLoading(true);
      
      // Get the service ID for the test type
      let serviceId = null;
      if (selectedAppointment.service && selectedAppointment.service._id) {
        serviceId = selectedAppointment.service._id;
      } else {
        // If service is not populated, try to find it by name
        console.log('Service lookup needed for:', selectedAppointment.serviceName);
        const servicesResponse = await servicesAPI.getServices({ limit: 100 });
        if (servicesResponse.success) {
          console.log('Available services:', servicesResponse.data.map(s => s.serviceName));
          
          // Try multiple matching strategies
          let service = servicesResponse.data.find(s => 
            selectedAppointment.serviceName.includes(s.serviceName)
          );
          
          // If not found with includes, try exact match on each service in the appointment
          if (!service) {
            const appointmentServices = selectedAppointment.serviceName.split(',').map(s => s.trim());
            console.log('Appointment services array:', appointmentServices);
            
            for (const appointmentService of appointmentServices) {
              service = servicesResponse.data.find(s => 
                s.serviceName === appointmentService ||
                appointmentService.includes(s.serviceName) ||
                s.serviceName.includes(appointmentService)
              );
              if (service) {
                console.log('Found matching service:', service.serviceName);
                break;
              }
            }
          }
          
          serviceId = service?._id;
          console.log('Selected serviceId:', serviceId);
        }
      }

      if (!serviceId) {
        console.error('Service lookup failed for:', selectedAppointment.serviceName);
        alert('Unable to find service information. Please try again.');
        return;
      }

        // Debug and validate patient information
        console.log('Selected appointment structure:', selectedAppointment);
        console.log('Patient data:', selectedAppointment.patient);
        
        let patientId = null;
        if (selectedAppointment.patient) {
          if (typeof selectedAppointment.patient === 'string') {
            patientId = selectedAppointment.patient;
          } else if (selectedAppointment.patient._id) {
            patientId = selectedAppointment.patient._id;
          }
        }
        
        // If no patient ID but we have patientName, use the patient name for walk-in
        if (!patientId && selectedAppointment.patientName) {
          console.warn('No patient ID found, but patient name exists. Using patient name as ID for walk-in');
          patientId = selectedAppointment.patientName;
        }
        
        if (!patientId) {
          console.error('No valid patient ID found in appointment:', selectedAppointment);
          alert('Unable to find patient information. Please try selecting the appointment again.');
          return;
        }

        console.log('🔍 Final extracted patient ID:', patientId, 'Type:', typeof patientId);
        
      // Prepare test result data
      const testResultData = {
        patientId: patientId,
        appointmentId: selectedAppointment._id,
        serviceId: serviceId,
        testType: selectedAppointment.serviceName,
        results: { ...resultForm },
        status: 'in-progress',
        medTechNotes: resultForm.remarks || '',
        sampleDate: new Date().toISOString()
      };

      console.log('Saving results as draft:', testResultData);
      console.log('Patient ID type:', typeof testResultData.patientId, testResultData.patientId);
      console.log('Appointment ID type:', typeof testResultData.appointmentId, testResultData.appointmentId);
      console.log('Service ID type:', typeof testResultData.serviceId, testResultData.serviceId);

      // Debug authentication
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      console.log('Auth debug - Token exists:', !!token);
      console.log('Auth debug - User exists:', !!user);
      console.log('Auth debug - Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          console.log('Auth debug - User role:', parsedUser.role);
          console.log('Auth debug - User ID:', parsedUser._id);
        } catch (e) {
          console.log('Auth debug - User parse error:', e.message);
        }
      }

      // Try to save to database - first check if a test result already exists
      let response;
      try {
        // Try to create new test result
        response = await testResultsAPI.createTestResult(testResultData);
        console.log('Create response:', response);
      } catch (createError) {
        console.log('Create failed, might already exist. Trying to find existing...', createError);
        
        // If create failed, try to find existing test result and update it
        try {
          const existingResults = await testResultsAPI.getTestResults({
            appointmentId: selectedAppointment._id,
            limit: 1
          });
          
          if (existingResults.success && existingResults.data.length > 0) {
            const existingResult = existingResults.data[0];
            console.log('Found existing test result, updating...', existingResult._id);
            
            // Update existing test result
            response = await testResultsAPI.updateTestResult(existingResult._id, {
              results: { ...resultForm },
              status: 'in-progress',
              medTechNotes: resultForm.remarks || ''
            });
          } else {
            // No existing result found, re-throw the original create error
            throw createError;
          }
        } catch (updateError) {
          console.error('Both create and update failed:', { createError, updateError });
          throw createError; // Throw the original create error
        }
      }
      
      if (response.success) {
        // Save draft locally for quick access
        setSavedDrafts(prev => new Map(prev.set(selectedAppointment._id, { ...resultForm })));
        setLastSavedForm({ ...resultForm });
        setHasUnsavedChanges(false);
        
        alert('Results saved as draft successfully!');
      } else {
        console.error('API response error:', response);
        throw new Error(response.message || 'Failed to save results');
      }
    } catch (error) {
      console.error('Error saving results:', error);
      console.error('Error details:', error.message);
      alert(`Failed to save results: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation with unsaved changes protection
  const handleNavigateAway = async (targetSection) => {
    if (hasUnsavedChanges && selectedAppointment) {
      const confirmed = window.confirm(
        'You have unsaved changes. Would you like to save them as a draft before leaving?'
      );
      if (confirmed) {
        // Auto-save as draft before navigating
        try {
          console.log('🔄 Auto-saving draft before navigation...');
          await handleSaveResults();
          console.log('✅ Draft auto-saved successfully');
        } catch (error) {
          console.error('❌ Failed to auto-save draft:', error);
          const proceedAnyway = window.confirm(
            'Failed to save draft. Do you want to leave anyway? Your changes will be lost.'
          );
          if (!proceedAnyway) {
            return false;
          }
        }
      } else {
        // User chose not to save, confirm they want to lose changes
        const confirmLose = window.confirm(
          'Are you sure you want to leave without saving? Your changes will be lost.'
        );
        if (!confirmLose) {
          return false;
        }
      }
      // Clear unsaved changes since we've handled them
      setHasUnsavedChanges(false);
    }
    return true;
  };

  // Load saved draft for an appointment
  // Check for existing test results for all appointments (to show draft indicators)
  const checkExistingDrafts = async (appointments) => {
    try {
      console.log('Checking existing drafts for', appointments.length, 'appointments');
      
      // Get all test results for this medtech
      const response = await fetch('/api/test-results?limit=100', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('All test results:', data);
        
        const testResults = data.data || data.testResults || [];
        const draftsMap = new Map();
        
        console.log('Found', testResults.length, 'test results in database');
        console.log('First few test results:', testResults.slice(0, 3));
        console.log('Checking against', appointments.length, 'appointments');
        console.log('First few appointments:', appointments.slice(0, 3).map(a => ({ id: a._id, name: a.patientName })));
        
        // For each appointment, check if there's a saved test result
        appointments.forEach(appointment => {
          console.log('Checking appointment:', appointment._id, 'for patient:', appointment.patientName);
          
          // Find ALL test results for this appointment
          const appointmentResults = testResults.filter(result => {
            // Handle both cases: appointment as object or as string ID
            const resultAppointmentId = typeof result.appointment === 'object' 
              ? result.appointment?._id 
              : result.appointment;
            
            return resultAppointmentId === appointment._id;
          });
          
          console.log(`Found ${appointmentResults.length} test results for appointment ${appointment._id}`);
          
          if (appointmentResults.length > 0) {
            // Get the LATEST test result (most recent by creation date)
            const existingResult = appointmentResults.reduce((latest, current) => {
              const latestDate = new Date(latest.createdAt || latest.sampleDate || 0);
              const currentDate = new Date(current.createdAt || current.sampleDate || 0);
              return currentDate > latestDate ? current : latest;
            });
            
            console.log('✅ Found existing result for appointment:', appointment._id, 'patient:', appointment.patientName, 'status:', existingResult.status, 'created:', existingResult.createdAt);
            console.log(`   Using latest of ${appointmentResults.length} results`);
            
            // Check if this is a rejected test that needs complete re-entry
            if (existingResult.status === 'pending' && (existingResult.rejectionReason || existingResult.isRejected)) {
              // This is a rejected test - treat as fresh start but store rejection info
              console.log('📋 Found rejected test - treating as fresh start');
              draftsMap.set(appointment._id, {
                hasSavedResult: false, // No saved draft - fresh start
                isCompleted: false,
                isRejected: true,
                rejectionReason: existingResult.rejectionReason,
                rejectedBy: existingResult.rejectedBy,
                rejectedDate: existingResult.rejectedDate,
                testResultData: existingResult
              });
            } else if (existingResult.status === 'completed' || existingResult.status === 'reviewed' || existingResult.status === 'released') {
              // Completed, reviewed (approved), or released test
              draftsMap.set(appointment._id, { 
                hasSavedResult: true, 
                isCompleted: true,
                testResultData: existingResult 
              });
            } else {
              // Regular draft or other status
              draftsMap.set(appointment._id, { 
                hasSavedResult: true, 
                isCompleted: false,
                testResultData: existingResult 
              });
            }
          } else {
            console.log('❌ No existing result found for appointment:', appointment._id, 'patient:', appointment.patientName);
          }
        });
        
        // Update the saved drafts map
        setSavedDrafts(prev => {
          const newMap = new Map(prev);
          draftsMap.forEach((value, key) => {
            newMap.set(key, value);
          });
          return newMap;
        });
        
        console.log('Updated savedDrafts map with', draftsMap.size, 'entries');
        
        // Note: Rejection reason buttons only appear for tests that have been rejected from the Review section
        console.log('💡 Note: Rejection buttons only show for tests rejected by reviewers with rejection reasons');
      }
    } catch (error) {
      console.error('Error checking existing drafts:', error);
    }
  };

  const loadSavedDraft = async (appointmentId) => {
    console.log('📋 LOAD SAVED DRAFT CALLED for appointment:', appointmentId);
    
    // First check local drafts
    const savedDraft = savedDrafts.get(appointmentId);
    console.log('📋 Local draft check result:', savedDraft ? 'Found local draft' : 'No local draft');
    
    if (savedDraft && savedDraft.hasSavedResult !== true) {
      // Only use local draft if it contains actual form data, not just the indicator flag
      console.log('📋 Using local draft with form data:', savedDraft);
      setResultForm({ ...savedDraft });
      setLastSavedForm({ ...savedDraft });
      setHasUnsavedChanges(false);
      return true;
    } else if (savedDraft && savedDraft.hasSavedResult === true) {
      console.log('📋 Found indicator flag, need to fetch actual data from database');
    }
    
    // If no local draft, check if there's a saved test result in the database
    try {
      const response = await fetch(`/api/test-results?appointmentId=${appointmentId}&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API response for appointmentId', appointmentId, ':', data);
        
        // Look for test result with matching appointment ID
        const existingResult = data.data?.find(result => {
          const resultAppointmentId = typeof result.appointment === 'object' 
            ? result.appointment?._id 
            : result.appointment;
          return resultAppointmentId === appointmentId;
        }) || data.testResults?.find(result => {
          const resultAppointmentId = typeof result.appointment === 'object' 
            ? result.appointment?._id 
            : result.appointment;
          return resultAppointmentId === appointmentId;
        });
        
        if (existingResult) {
          console.log('Found existing test result for appointment:', appointmentId, existingResult);
          console.log('Existing result structure:', JSON.stringify(existingResult, null, 2));
          
          // Handle results field - it might be a Map, Object, or other format
          let results = existingResult.results || {};
          console.log('Raw results field type and content:', typeof results, results);
          
          // If results is a Map or has special structure, convert it to a plain object
          if (results && typeof results === 'object') {
            // Handle case where results might be a Map-like object with entries
            if (results.constructor && results.constructor.name === 'Map') {
              console.log('Results is a Map, converting to object');
              results = Object.fromEntries(results);
            } else if (results._bsontype || results.toObject) {
              console.log('Results is a MongoDB document, converting to object');
              results = results.toObject ? results.toObject() : results;
            }
          }
          
          console.log('Converted results:', results);
          console.log('Sample field values:', {
            fbs: results.fbs,
            hemoglobin: results.hemoglobin,
            wbc: results.wbc
          });
          
          // Convert the existing result back to form format
          const formData = {
            fbs: results.fbs || '',
            bua: results.bua || '',
            bun: results.bun || '',
            creatinine: results.creatinine || '',
            cholesterol: results.cholesterol || '',
            triglyceride: results.triglyceride || '',
            hdl: results.hdl || '',
            ldl: results.ldl || '',
            ast_sgot: results.ast_sgot || '',
            alt_sgpt: results.alt_sgpt || '',
            sodium: results.sodium || '',
            potassium: results.potassium || '',
            chloride: results.chloride || '',
            magnesium: results.magnesium || '',
            phosphorus: results.phosphorus || '',
            ogtt_fasting: results.ogtt_fasting || '',
            ogtt_30min: results.ogtt_30min || '',
            ogtt_60min: results.ogtt_60min || '',
            ogtt_90min: results.ogtt_90min || '',
            ogtt_120min: results.ogtt_120min || '',
            wbc: results.wbc || '',
            rbc: results.rbc || '',
            hemoglobin: results.hemoglobin || '',
            hematocrit: results.hematocrit || '',
            platelets: results.platelets || '',
            esr: results.esr || '',
            mcv: results.mcv || '',
            mch: results.mch || '',
            mchc: results.mchc || '',
            lymphocytes: results.lymphocytes || '',
            neutrophils: results.neutrophils || '',
            monocytes: results.monocytes || '',
            eosinophils: results.eosinophils || '',
            basophils: results.basophils || '',
            aptt: results.aptt || '',
            pt: results.pt || '',
            inr: results.inr || '',
            urine_color: results.urine_color || '',
            urine_transparency: results.urine_transparency || '',
            urine_specific_gravity: results.urine_specific_gravity || '',
            urine_ph: results.urine_ph || '',
            urine_protein: results.urine_protein || '',
            urine_glucose: results.urine_glucose || '',
            urine_ketones: results.urine_ketones || '',
            urine_blood: results.urine_blood || '',
            urine_leukocytes: results.urine_leukocytes || '',
            urine_nitrites: results.urine_nitrites || '',
            urine_urobilinogen: results.urine_urobilinogen || results.urobilinogen || '',
            urine_bilirubin: results.urine_bilirubin || results.bilirubin || '',
            urine_rbc: results.urine_rbc || '',
            urine_wbc: results.urine_wbc || '',
            urine_epithelial: results.urine_epithelial || '',
            urine_bacteria: results.urine_bacteria || '',
            urine_crystals: results.urine_crystals || '',
            urine_casts: results.urine_casts || '',
            urine_mucus_thread: results.urine_mucus_thread || results.mucus_thread || '',
            urine_amorphous_urates: results.urine_amorphous_urates || results.amorphous_urates || '',
            urine_others: results.urine_others || '',
            fecal_color: results.fecal_color || '',
            fecal_consistency: results.fecal_consistency || '',
            fecal_occult_blood: results.fecal_occult_blood || '',
            fecal_rbc: results.fecal_rbc || '',
            fecal_wbc: results.fecal_wbc || '',
            fecal_bacteria: results.fecal_bacteria || '',
            fecal_parasite_ova: results.fecal_parasite_ova || '',
            pregnancy_test_serum: results.pregnancy_test_serum || '',
            pregnancy_test_urine: results.pregnancy_test_urine || results.pregnancy_test || '', // Backward compatibility
            blood_type: results.blood_type || '',
            rh_factor: results.rh_factor || '',
            hepatitis_b: results.hepatitis_b || '',
            hepatitis_c: results.hepatitis_c || '',
            hiv: results.hiv || '',
            vdrl: results.vdrl || '',
            dengue_duo: results.dengue_duo || '',
            dengue_ns1: results.dengue_ns1 || '',
            dengue_igg: results.dengue_igg || '',
            dengue_igm: results.dengue_igm || '',
            salmonella: results.salmonella || '',
            salmonella_igg: results.salmonella_igg || '',
            salmonella_igm: results.salmonella_igm || '',
            hpylori_antigen: results.hpylori_antigen || '',
            hpylori_antibody: results.hpylori_antibody || '',
            psa: results.psa || '',
            crp: results.crp || '',
            tsh: results.tsh || '',
            ft3: results.ft3 || '',
            ft4: results.ft4 || '',
            t3: results.t3 || '',
            t4: results.t4 || '',
            remarks: existingResult.notes || '',
            technician: existingResult.medTech?.name || existingResult.medTechNotes || '',
            datePerformed: existingResult.sampleDate ? existingResult.sampleDate.split('T')[0] : new Date().toISOString().split('T')[0],
            timePerformed: existingResult.sampleDate ? new Date(existingResult.sampleDate).toTimeString().split(' ')[0].substring(0, 5) : new Date().toTimeString().split(' ')[0].substring(0, 5)
          };
          
          console.log('Generated formData object:', formData);
          console.log('Sample formData values:', {
            fbs: formData.fbs,
            hemoglobin: formData.hemoglobin,
            wbc: formData.wbc,
            pregnancy_test_serum: formData.pregnancy_test_serum,
            pregnancy_test_urine: formData.pregnancy_test_urine,
            remarks: formData.remarks
          });
          
          console.log('📋 About to call setResultForm with formData...');
          setResultForm(formData);
          console.log('📋 setResultForm called - checking if form state updated...');
          
          // Add a small delay to check if the state actually updated
          setTimeout(() => {
            console.log('📋 Form state after setResultForm (current resultForm):', {
              fbs: resultForm.fbs,
              hemoglobin: resultForm.hemoglobin,
              wbc: resultForm.wbc,
              pregnancy_test_serum: resultForm.pregnancy_test_serum,
              pregnancy_test_urine: resultForm.pregnancy_test_urine,
              remarks: resultForm.remarks
            });
          }, 100);
          
          setLastSavedForm({ ...formData });
          setHasUnsavedChanges(false);
          
          // Also save to local drafts for faster access
          savedDrafts.set(appointmentId, formData);
          console.log('📋 Draft saved to local cache for appointment:', appointmentId);
          
          return true;
        } else {
          console.log('No existing test result found for appointment:', appointmentId);
          console.log('Available test results:', data.data || data.testResults);
        }
      } else {
        console.error('Failed to fetch test results. Response status:', response.status);
        const errorText = await response.text();
        console.error('Response error:', errorText);
      }
    } catch (error) {
      console.error('Error loading existing test result:', error);
    }
    
    return false;
  };

  // Handle going back to queue
  const handleBackToQueue = async () => {
    // Always show confirmation dialog when going back to queue
    const confirmed = window.confirm('Are you sure you want to go back to the testing queue?');
    if (!confirmed) {
      return;
    }
    
    const canNavigate = await handleNavigateAway('testing-queue');
    if (canNavigate) {
      setSelectedAppointment(null);
      setActiveSection('testing-queue');
      setIsViewOnlyMode(false); // Reset view-only mode
      
      // Reset form only if no saved draft exists
      if (!selectedAppointment || !savedDrafts.has(selectedAppointment._id)) {
        resetResultForm();
      }
    }
  };

  // Reset result form to initial state
  const resetResultForm = () => {
    setResultForm({
      fbs: '', bua: '', bun: '', creatinine: '', cholesterol: '', triglyceride: '',
      hdl: '', ldl: '', ast_sgot: '', alt_sgpt: '', sodium: '', potassium: '', chloride: '',
      magnesium: '', phosphorus: '', wbc: '', rbc: '', hemoglobin: '',
      hematocrit: '', platelets: '', esr: '', mcv: '', mch: '', mchc: '', lymphocytes: '', neutrophils: '', monocytes: '',
      eosinophils: '', basophils: '', aptt: '', pt: '', inr: '', ogtt_fasting: '', ogtt_30min: '', ogtt_60min: '', ogtt_90min: '', ogtt_120min: '', urine_color: '', urine_transparency: '',
      urine_specific_gravity: '', urine_ph: '', urine_protein: '', urine_glucose: '',
      urine_ketones: '', urine_blood: '', urine_leukocytes: '', urine_nitrites: '',
      urine_urobilinogen: '', urine_bilirubin: '', urine_rbc: '', urine_wbc: '', urine_epithelial: '', urine_bacteria: '',
      urine_crystals: '', urine_casts: '', urine_mucus_thread: '', urine_amorphous_urates: '', urine_others: '', fecal_color: '', fecal_consistency: '',
      fecal_occult_blood: '', fecal_rbc: '', fecal_wbc: '', fecal_bacteria: '', fecal_parasite_ova: '', 
      pregnancy_test_serum: '', pregnancy_test_urine: '', blood_type: '', rh_factor: '', hepatitis_b: '', hepatitis_c: '',
      hiv: '', vdrl: '', dengue_duo: '', dengue_ns1: '', dengue_igg: '', dengue_igm: '', 
      salmonella: '', salmonella_igg: '', salmonella_igm: '', hpylori_antigen: '', hpylori_antibody: '', psa: '', crp: '', 
      tsh: '', ft3: '', ft4: '', t3: '', t4: '',
      remarks: '', technician: '',
      datePerformed: new Date().toISOString().split('T')[0],
      timePerformed: new Date().toTimeString().split(' ')[0].substring(0, 5)
    });
    setLastSavedForm(null);
    setHasUnsavedChanges(false);
  };

  // Handle completing and submitting results
  const handleCompleteTest = async () => {
    if (!selectedAppointment) {
      alert('No appointment selected');
      return;
    }

    try {
      setLoading(true);
      
      // Get the service ID for the test type
      let serviceId = null;
      if (selectedAppointment.service && selectedAppointment.service._id) {
        serviceId = selectedAppointment.service._id;
      } else {
        // If service is not populated, try to find it by name
        const servicesResponse = await servicesAPI.getServices({ limit: 100 });
        if (servicesResponse.success) {
          const service = servicesResponse.data.find(s => 
            selectedAppointment.serviceName.includes(s.serviceName)
          );
          serviceId = service?._id;
        }
      }

      if (!serviceId) {
        alert('Unable to find service information. Please try again.');
        return;
      }

      // Extract patient ID properly for completion
      let patientId = null;
      if (selectedAppointment.patient) {
        if (typeof selectedAppointment.patient === 'string') {
          patientId = selectedAppointment.patient;
        } else if (selectedAppointment.patient._id) {
          patientId = selectedAppointment.patient._id;
        } else if (typeof selectedAppointment.patient === 'object') {
          // If patient is an object but no _id, use email or name for walk-in
          console.warn('Patient is object without _id for completion, might be walk-in patient data:', selectedAppointment.patient);
          patientId = selectedAppointment.patient.email || selectedAppointment.patient.fullName || selectedAppointment.patientName;
        }
      }
      
      // Fallback to patient name for walk-ins
      if (!patientId && selectedAppointment.patientName) {
        console.warn('No patient ID found for completion, using patient name as ID for walk-in');
        patientId = selectedAppointment.patientName;
      }
      
      if (!patientId) {
        console.error('No valid patient ID found in appointment for completion:', selectedAppointment);
        alert('Unable to find patient information. Please try selecting the appointment again.');
        return;
      }

      console.log('🔍 Final extracted patient ID for completion:', patientId, 'Type:', typeof patientId);

      // First, try to find existing test result for this appointment
      console.log('Looking for existing test result for appointment:', selectedAppointment.appointmentId);
      
      let existingTestResults = null;
      try {
        const existingResponse = await testResultsAPI.getTestResultsByAppointment(selectedAppointment.appointmentId);
        if (existingResponse.success && existingResponse.data && existingResponse.data.length > 0) {
          existingTestResults = existingResponse.data;
          console.log('Found existing test results:', existingTestResults.length);
        }
      } catch (error) {
        console.log('No existing test results found or error fetching:', error.message);
      }

      // Prepare test result data for completion
      const testResultData = {
        patientId: patientId,
        appointmentId: selectedAppointment._id,
        serviceId: serviceId,
        testType: selectedAppointment.serviceName || selectedAppointment.services?.[0]?.serviceName,
        results: { ...resultForm },
        status: 'completed', // Mark as completed for review
        medTechNotes: resultForm.remarks || '',
        sampleDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        isWalkInPatient: !selectedAppointment.patient?._id,
        patientInfo: selectedAppointment.patient?._id ? undefined : {
          name: selectedAppointment.patientName,
          age: selectedAppointment.age,
          gender: selectedAppointment.gender || selectedAppointment.sex,
          sex: selectedAppointment.sex,
          contactNumber: selectedAppointment.contactNumber,
          email: selectedAppointment.email
        }
      };

      console.log('Completing test with results:', testResultData);

      let testResultResponse;
      
      if (existingTestResults && existingTestResults.length > 0) {
        // Update the existing test result (use the most recent one)
        const existingTestResult = existingTestResults[0]; // Most recent due to sort
        console.log('Updating existing test result:', existingTestResult._id);
        
        testResultResponse = await testResultsAPI.updateTestResult(existingTestResult._id, {
          results: testResultData.results,
          status: testResultData.status,
          medTechNotes: testResultData.medTechNotes,
          completedDate: testResultData.completedDate,
          medTech: currentUser._id
        });
      } else {
        // No existing test result, create a new one
        console.log('No existing test result found, creating new one');
        testResultResponse = await testResultsAPI.createTestResult(testResultData);
      }
      
      if (!testResultResponse.success) {
        throw new Error(testResultResponse.message || 'Failed to save test results');
      }

      // Update appointment status to completed
      if (selectedAppointment._id) {
        const appointmentResponse = await appointmentAPI.updateAppointment(
          selectedAppointment._id, 
          { status: 'completed' }
        );
        
        if (!appointmentResponse.success) {
          console.warn('Test results saved but failed to update appointment status');
        }
      }

      alert(`Test completed successfully for ${selectedAppointment.patientName}!`);
      
      // Clear saved draft since test is completed
      if (selectedAppointment._id && savedDrafts.has(selectedAppointment._id)) {
        setSavedDrafts(prev => {
          const newDrafts = new Map(prev);
          newDrafts.delete(selectedAppointment._id);
          return newDrafts;
        });
      }
      
      // Reset form and go back to queue
      setResultForm({
        fbs: '', bua: '', bun: '', creatinine: '', cholesterol: '', triglyceride: '',
        hdl: '', ldl: '', ast_sgot: '', alt_sgpt: '', sodium: '', potassium: '', chloride: '',
        magnesium: '', phosphorus: '', wbc: '', rbc: '', hemoglobin: '',
        hematocrit: '', platelets: '', esr: '', mcv: '', mch: '', mchc: '', lymphocytes: '', neutrophils: '', monocytes: '',
        eosinophils: '', basophils: '', aptt: '', pt: '', inr: '', ogtt_fasting: '', ogtt_30min: '', ogtt_60min: '', ogtt_90min: '', ogtt_120min: '', urine_color: '', urine_transparency: '',
        urine_specific_gravity: '', urine_ph: '', urine_protein: '', urine_glucose: '',
        urine_ketones: '', urine_blood: '', urine_leukocytes: '', urine_nitrites: '',
        urine_urobilinogen: '', urine_bilirubin: '', urine_rbc: '', urine_wbc: '', urine_epithelial: '', urine_bacteria: '',
        urine_crystals: '', urine_casts: '', urine_mucus_thread: '', urine_amorphous_urates: '', urine_others: '', fecal_color: '', fecal_consistency: '',
        fecal_occult_blood: '', fecal_rbc: '', fecal_wbc: '', fecal_bacteria: '', fecal_parasite_ova: '', 
        pregnancy_test_serum: '', pregnancy_test_urine: '', blood_type: '', rh_factor: '', hepatitis_b: '', hepatitis_c: '',
        hiv: '', vdrl: '', dengue_duo: '', dengue_ns1: '', dengue_igg: '', dengue_igm: '', 
        salmonella: '', salmonella_igg: '', salmonella_igm: '', hpylori_antigen: '', hpylori_antibody: '', psa: '', crp: '', 
        tsh: '', ft3: '', ft4: '', t3: '', t4: '',
        remarks: '', technician: '',
        datePerformed: new Date().toISOString().split('T')[0],
        timePerformed: new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
      
      setLastSavedForm(null);
      setHasUnsavedChanges(false);
      setSelectedAppointment(null);
      setActiveSection('testing-queue');
      
      // Refresh the testing queue
      fetchTestingQueue();
      
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Failed to complete test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResultEntry = () => {
    const pendingSamples = samples.filter(sample => 
      sample.status === 'pending' || sample.status === 'processing'
    );

    return (
      <div style={{background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
        <div style={{marginBottom: '25px'}}>
          <h2 style={{color: '#2c3e50', marginBottom: '10px'}}>Manual Result Entry</h2>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input 
              type="text" 
              placeholder="Search by Sample ID or Patient Name" 
              style={{flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
              value={resultFilters.search}
              onChange={(e) => setResultFilters(prev => ({...prev, search: e.target.value}))}
            />
            <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer'}}>
              Search
            </button>
          </div>
        </div>

        {loading && (
          <div style={{textAlign: 'center', padding: '20px', color: '#6c757d'}}>
            <p>Loading samples...</p>
          </div>
        )}

        {error && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px'}}>
            <p style={{margin: '0'}}>{error}</p>
            <button onClick={() => setError('')} style={{background: 'none', border: 'none', color: '#721c24', textDecoration: 'underline', cursor: 'pointer'}}>Dismiss</button>
          </div>
        )}

        <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '25px'}}>
          <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Pending Samples ({pendingSamples.length})</h3>
          {pendingSamples.length === 0 ? (
            <div style={{textAlign: 'center', color: '#6c757d', padding: '20px'}}>
              <p>No pending samples found</p>
            </div>
          ) : (
            <div style={{display: 'grid', gap: '8px'}}>
              {pendingSamples.map(sample => (
                <div 
                  key={sample.id} 
                  style={{
                    display: 'grid', 
                    gridTemplateColumns: '120px 150px 180px 100px', 
                    gap: '15px', 
                    padding: '12px', 
                    background: selectedSample?.id === sample.id ? '#e8f5e8' : 'white', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    border: selectedSample?.id === sample.id ? '2px solid #21AEA8' : '1px solid #e9ecef',
                    alignItems: 'center',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => handleSampleSelect(sample)}
                >
                  <span style={{fontWeight: '600'}}>{sample.id}</span>
                  <span>{sample.patientName}</span>
                  <span style={{color: '#6c757d'}}>{sample.testType}</span>
                  <span style={{color: sample.priority === 'urgent' ? '#dc3545' : '#21AEA8', fontWeight: '600'}}>{sample.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSample && (
          <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '25px'}}>
            <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Sample Information</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px'}}>
              <div>
                <label style={{fontWeight: '600', color: '#2c3e50'}}>Sample ID:</label>
                <span style={{marginLeft: '10px'}}>{selectedSample.id}</span>
              </div>
              <div>
                <label style={{fontWeight: '600', color: '#2c3e50'}}>Patient:</label>
                <span style={{marginLeft: '10px'}}>{selectedSample.patientName}</span>
              </div>
              <div>
                <label style={{fontWeight: '600', color: '#2c3e50'}}>Test Type:</label>
                <span style={{marginLeft: '10px'}}>{selectedSample.testType}</span>
              </div>
              <div>
                <label style={{fontWeight: '600', color: '#2c3e50'}}>Priority:</label>
                <span style={{marginLeft: '10px', color: selectedSample.priority === 'urgent' ? '#dc3545' : '#21AEA8', fontWeight: '600'}}>{selectedSample.priority}</span>
              </div>
            </div>

            <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Test Results</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50'}}>Hemoglobin (g/dL)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="12.0-15.5" 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                  value={resultForm.hemoglobin}
                  onChange={(e) => handleResultChange('hemoglobin', e.target.value)}
                />
                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>Reference: 12.0-15.5</span>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50'}}>Hematocrit (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="36-46" 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                  value={resultForm.hematocrit}
                  onChange={(e) => handleResultChange('hematocrit', e.target.value)}
                />
                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>Reference: 36-46</span>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50'}}>WBC Count (×10³/μL)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="4.5-11.0" 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                  value={resultForm.wbc}
                  onChange={(e) => handleResultChange('wbc', e.target.value)}
                />
                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>Reference: 4.5-11.0</span>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50'}}>RBC Count (×10⁶/μL)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="4.2-5.4" 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                  value={resultForm.rbc}
                  onChange={(e) => handleResultChange('rbc', e.target.value)}
                />
                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>Reference: 4.2-5.4</span>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50'}}>Platelet Count (×10³/μL)</label>
                <input 
                  type="number" 
                  step="1" 
                  placeholder="150-400" 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem'}}
                  value={resultForm.platelets}
                  onChange={(e) => handleResultChange('platelets', e.target.value)}
                />
                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>Reference: 150-400</span>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                style={{background: '#21AEA8', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}
                onClick={handleSaveResults}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Results'}
              </button>
              <button style={{background: '#28a745', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer'}}>
                Validate & Submit
              </button>
              <button style={{background: '#ffc107', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer'}}>
                Flag for Review
              </button>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px'}}>
            <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Recent Results ({testResults.length})</h3>
            <div style={{display: 'grid', gap: '8px'}}>
              {testResults.slice(0, 5).map((result, index) => (
                <div key={index} style={{display: 'grid', gridTemplateColumns: '120px 150px 180px 120px', gap: '15px', padding: '8px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
                  <span style={{fontWeight: '600'}}>{result.sampleId}</span>
                  <span>{result.patientName || 'Unknown Patient'}</span>
                  <span style={{color: '#6c757d'}}>{result.testType || 'Lab Test'}</span>
                  <span style={{color: '#6c757d'}}>{new Date(result.resultDate).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQualityControl = () => (
    <div style={{background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
      <div style={{marginBottom: '25px'}}>
        <h2 style={{color: '#2c3e50', marginBottom: '10px'}}>Quality Control</h2>
        <p style={{color: '#6c757d', margin: '0'}}>Monitor and manage quality control procedures</p>
      </div>

      {/* QC Status Grid */}
      <div className="stats-grid" style={{marginBottom: '25px'}}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">QC Tests Today</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">QC Passed</div>
            <div className="stat-value">11</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">QC Failed</div>
            <div className="stat-value">1</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">QC Pending</div>
            <div className="stat-value">3</div>
          </div>
        </div>
      </div>

      {/* QC Results Table */}
      <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '25px'}}>
        <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Recent QC Results</h3>
        <div style={{display: 'grid', gap: '10px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '120px 180px 120px 120px 150px 1fr', gap: '15px', padding: '10px', background: '#21AEA8', color: 'white', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem'}}>
            <span>QC ID</span>
            <span>Test Type</span>
            <span>Level</span>
            <span>Status</span>
            <span>Run Date</span>
            <span>Actions</span>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 180px 120px 120px 150px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>QC001</span>
            <span>Complete Blood Count</span>
            <span style={{color: '#21AEA8'}}>Level 1</span>
            <span style={{color: '#28a745', fontWeight: '600'}}>Passed</span>
            <span style={{color: '#6c757d'}}>Oct 10, 2025</span>
            <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>View</button>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 180px 120px 120px 150px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>QC002</span>
            <span>Blood Glucose</span>
            <span style={{color: '#ffc107'}}>Level 2</span>
            <span style={{color: '#dc3545', fontWeight: '600'}}>Failed</span>
            <span style={{color: '#6c757d'}}>Oct 10, 2025</span>
            <button style={{background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Review</button>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '120px 180px 120px 120px 150px 1fr', gap: '15px', padding: '12px', background: 'white', borderRadius: '4px', alignItems: 'center', fontSize: '0.9rem'}}>
            <span style={{fontWeight: '600'}}>QC003</span>
            <span>Liver Function Tests</span>
            <span style={{color: '#fd7e14'}}>Level 3</span>
            <span style={{color: '#ffc107', fontWeight: '600'}}>Pending</span>
            <span style={{color: '#6c757d'}}>Oct 10, 2025</span>
            <button style={{background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer'}}>Run</button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
        <button style={{background: '#21AEA8', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}>
          Run QC Test
        </button>
        <button style={{background: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}>
          View QC Reports
        </button>
        <button style={{background: '#6c757d', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}>
          QC Settings
        </button>
      </div>
    </div>
  );

  const renderTestingQueue = () => {
    const readyForTesting = testingQueue.filter(apt => apt.status === 'checked-in');
    const inProgress = testingQueue.filter(apt => apt.status === 'in-progress');

    const handleInputResults = async (appointmentId) => {
      // Check for unsaved changes before navigating
      const canNavigate = await handleNavigateAway('enter-results');
      if (!canNavigate) {
        return;
      }
      
      // Find and select the appointment
      const appointment = testingQueue.find(apt => apt._id === appointmentId);
      setSelectedAppointment(appointment);
      
      // Check if this test is completed
      const savedData = savedDrafts.get(appointmentId);
      const isCompleted = savedData?.isCompleted;
      
      if (isCompleted) {
        // For completed tests, load the results in view-only mode
        console.log('🔍 Loading completed test results for viewing');
        setIsViewOnlyMode(true);
        const completedTestData = savedData.testResultData;
        
        if (completedTestData && completedTestData.results) {
          // Convert Map back to object if needed
          const resultsData = completedTestData.results instanceof Map 
            ? Object.fromEntries(completedTestData.results)
            : completedTestData.results;
          
          setResultForm(resultsData);
          console.log('📋 Loaded completed test data:', resultsData);
        }
      } else {
        // For draft tests, enable editing mode
        setIsViewOnlyMode(false);
        // Try to load saved draft for this appointment
        try {
          console.log('🔄 Attempting to load draft for appointment:', appointmentId);
          const hasDraft = await loadSavedDraft(appointmentId);
          console.log('🔄 Load draft result:', hasDraft);
          if (!hasDraft) {
            // No saved draft, start with clean form
            console.log('🔄 No draft found, resetting form');
            resetResultForm();
          } else {
            console.log('🔄 Draft loaded successfully');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          resetResultForm();
        }
      }
      
      setActiveSection('enter-results');
    };

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#21AEA8', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>Testing Queue</h2>
          <button
            onClick={() => {
              fetchTestingQueue();
              console.log('Manual refresh triggered');
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px',
              fontSize: '14px'
            }}
          >
            🔄 Refresh Queue
          </button>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{readyForTesting.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Ready for Testing</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{inProgress.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>In Progress</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffeb3b' }}>
                {testingQueue.filter(apt => apt.isUrgent).length}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Urgent</div>
            </div>
          </div>
        </div>

        {readyForTesting.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#21AEA8', marginBottom: '15px' }}>
              Ready for Testing ({readyForTesting.length})
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {readyForTesting.map((appointment) => (
                <div 
                  key={appointment._id} 
                  style={{
                    background: appointment.isUrgent ? '#fff3cd' : 'white',
                    border: appointment.isUrgent ? '2px solid #ffc107' : '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                        {appointment.patientName}
                        {appointment.isUrgent && <span style={{ color: '#dc3545', marginLeft: '10px' }}>URGENT</span>}
                        {savedDrafts.has(appointment._id) && (
                          <>
                            {savedDrafts.get(appointment._id)?.isCompleted ? (
                              <span style={{ 
                                color: '#17a2b8', 
                                marginLeft: '10px', 
                                fontSize: '12px',
                                background: '#d1ecf1',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                border: '1px solid #bee5eb'
                              }}>
                                ✅ COMPLETED
                              </span>
                            ) : savedDrafts.get(appointment._id)?.isRejected ? (
                              <span style={{ 
                                color: '#dc3545', 
                                marginLeft: '10px', 
                                fontSize: '12px',
                                background: '#f8d7da',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                border: '1px solid #f5c6cb'
                              }}>
                                ❌ REJECTED
                              </span>
                            ) : savedDrafts.get(appointment._id)?.hasSavedResult ? (
                              <span style={{ 
                                color: '#28a745', 
                                marginLeft: '10px', 
                                fontSize: '12px',
                                background: '#d4edda',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                border: '1px solid #c3e6cb'
                              }}>
                                💾 DRAFT SAVED
                              </span>
                            ) : null}
                          </>
                        )}
                      </h4>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        <div>Service: {appointment.serviceName}</div>
                        <div>Phone: {appointment.contactNumber}</div>
                        <div>Email: {appointment.email}</div>
                        {appointment.age && <div>Age: {appointment.age} years old</div>}
                        {appointment.sex && <div>Sex: {appointment.sex}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <div><strong>Appointment:</strong> {appointment.appointmentDate}</div>
                      <div><strong>Time:</strong> {appointment.appointmentTime}</div>
                      <div><strong>Status:</strong> {appointment.status}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleInputResults(appointment._id)}
                        style={{
                          background: savedDrafts.has(appointment._id) && savedDrafts.get(appointment._id)?.isCompleted 
                            ? '#17a2b8' 
                            : savedDrafts.has(appointment._id) && savedDrafts.get(appointment._id)?.hasSavedResult
                              ? '#28a745' 
                              : '#21AEA8',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {(() => {
                          const savedData = savedDrafts.get(appointment._id);
                          console.log(`🔍 Button logic for ${appointment.patientName}:`, {
                            hasData: savedDrafts.has(appointment._id),
                            isCompleted: savedData?.isCompleted,
                            hasSavedResult: savedData?.hasSavedResult,
                            isRejected: savedData?.isRejected,
                            status: savedData?.testResultData?.status
                          });
                          
                          if (savedDrafts.has(appointment._id) && savedDrafts.get(appointment._id)?.isCompleted) {
                            return 'View Results';
                          } else if (savedDrafts.has(appointment._id) && savedDrafts.get(appointment._id)?.hasSavedResult) {
                            return 'Continue Draft';
                          } else if (savedDrafts.has(appointment._id) && savedDrafts.get(appointment._id)?.isRejected) {
                            return 'Re-enter Results';
                          } else {
                            return 'Input Results';
                          }
                        })()}
                      </button>
                      
                      {/* Rejection reason button - only show if test was rejected */}
                      {savedDrafts.has(appointment._id) && 
                       savedDrafts.get(appointment._id)?.isRejected && (
                        <button
                          onClick={() => handleShowRejectionReason(appointment)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="View rejection reason"
                        >
                          ☰
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inProgress.length > 0 && (
          <div>
            <h3 style={{ color: '#21AEA8', marginBottom: '15px' }}>
              Tests in Progress ({inProgress.length})
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {inProgress.map((appointment) => (
                <div 
                  key={appointment._id} 
                  style={{
                    background: '#e8f5e8',
                    border: '2px solid #21AEA8',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                        {appointment.patientInfo?.firstName} {appointment.patientInfo?.lastName}
                      </h4>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        <div>Services: {appointment.services?.map(s => s.name).join(', ')}</div>
                        <div>Started: {appointment.testStartTime ? 
                          new Date(appointment.testStartTime).toLocaleString() : 
                          'Just now'
                        }</div>
                        {appointment.age && <div>Age: {appointment.age} years old</div>}
                        {appointment.sex && <div>Sex: {appointment.sex}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <div><strong>Status:</strong> Testing in progress</div>
                      <div><strong>MedTech:</strong> {currentUser?.name || 'Current user'}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setActiveSection('enter-results');
                      }}
                      style={{
                        background: '#21AEA8',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Continue Testing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {testingQueue.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f8f9fa', borderRadius: '10px', color: '#6c757d' }}>
            <h3>No Tests in Queue</h3>
            <p>All patients have been processed. Great work!</p>
          </div>
        )}
      </div>
    );
  };

  const renderEnterResults = () => {
    if (!selectedAppointment) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>No Patient Selected</h3>
          <p>Please select a patient from the testing queue to enter results.</p>
          <button
            onClick={handleBackToQueue}
            style={{
              background: '#21AEA8',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Testing Queue
          </button>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Patient Header */}
        <div style={{ 
          background: '#21AEA8', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0' }}>Laboratory Test Results</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Patient: {selectedAppointment.patientName}
              {selectedAppointment.age && ` | Age: ${selectedAppointment.age} years`}
              {selectedAppointment.sex && ` | Sex: ${selectedAppointment.sex}`}
              <br />
              Service: {selectedAppointment.serviceName}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '14px' }}>
            {(() => {
              const testResult = savedDrafts.get(selectedAppointment._id)?.testResultData;
              const status = testResult?.status || 'pending';
              const statusColors = {
                'pending': { bg: '#fff3cd', color: '#856404' },
                'completed': { bg: '#d4edda', color: '#155724' },
                'reviewed': { bg: '#d1ecf1', color: '#0c5460' },
                'released': { bg: '#d4edda', color: '#155724' },
                'rejected': { bg: '#f8d7da', color: '#721c24' }
              };
              const statusColor = statusColors[status] || statusColors.pending;
              
              return (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      backgroundColor: statusColor.bg, 
                      color: statusColor.color,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {status}
                    </span>
                  </div>
                  <div>Date Performed: {resultForm.datePerformed}</div>
                  <div>Time Performed: {resultForm.timePerformed}</div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>You have unsaved changes. Remember to save your work before leaving.</span>
          </div>
        )}

        {/* Draft Status Indicator */}
        {selectedAppointment && savedDrafts.has(selectedAppointment._id) && !hasUnsavedChanges && (
          <div style={{
            background: '#d1ecf1',
            border: '1px solid #b3d4fc',
            color: '#0c5460',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>💾</span>
            <span>Draft loaded - you can continue working on this test.</span>
          </div>
        )}

        {/* Test Categories Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #e9ecef'
        }}>
          {['Blood Chemistry', 'Hematology', 'Clinical Microscopy', 'Immunology & Serology'].map(category => (
            <button
              key={category}
              onClick={() => setActiveTestCategory(category)}
              style={{
                background: activeTestCategory === category ? '#21AEA8' : 'transparent',
                color: activeTestCategory === category ? 'white' : '#21AEA8',
                border: `2px solid #21AEA8`,
                padding: '10px 20px',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Test Results Forms */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          {renderTestCategoryForm()}
          
          {/* Remarks Section */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
              Remarks/Comments
            </label>
            <textarea
              placeholder="Enter any additional remarks or observations..."
              disabled={isViewOnlyMode}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                backgroundColor: isViewOnlyMode ? '#f8f9fa' : '#fff',
                color: isViewOnlyMode ? '#6c757d' : '#333',
                cursor: isViewOnlyMode ? 'not-allowed' : 'text'
              }}
              value={resultForm.remarks}
              onChange={(e) => handleResultChange('remarks', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          marginTop: '30px' 
        }}>
          <button
            onClick={handleBackToQueue}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Back to Queue
          </button>
          
          {!isViewOnlyMode ? (
            <>
              <button
                onClick={handleSaveResults}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Saving...' : 'Save Results'}
              </button>
              <button
                onClick={handleCompleteTest}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : '#21AEA8',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Completing...' : 'Complete & Submit'}
              </button>
            </>
          ) : (
            <div style={{
              padding: '15px 30px',
              background: '#d1ecf1',
              border: '1px solid #bee5eb',
              borderRadius: '6px',
              color: '#0c5460',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ✅ Test Completed - View Only
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    return (
      <div className="dashboard-content-area">
        <ReviewResults 
          currentUser={currentUser}
          isViewOnly={false}
        />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h2 className="dashboard-sidebar-title">MDLAB DIRECT</h2>
          <div className="dashboard-sidebar-subtitle">MedTech Portal</div>
        </div>
        
        <nav className="dashboard-sidebar-nav">
          <div 
            className={`dashboard-nav-item ${activeSection === 'testing-queue' ? 'active' : ''}`}
            onClick={() => handleSectionClick('testing-queue')}
          >
            <span className="dashboard-nav-text">Testing Queue</span>
          </div>

          <div 
            className={`dashboard-nav-item ${activeSection === 'enter-results' ? 'active' : ''}`}
            onClick={() => handleSectionClick('enter-results')}
          >
            <span className="dashboard-nav-text">Enter Results</span>
          </div>

          <div 
            className={`dashboard-nav-item ${activeSection === 'review' ? 'active' : ''}`}
            onClick={() => handleSectionClick('review')}
          >
            <span className="dashboard-nav-text">Review</span>
          </div>

          <div 
            className={`dashboard-nav-item ${activeSection === 'finished-results' ? 'active' : ''}`}
            onClick={() => handleSectionClick('finished-results')}
          >
            <span className="dashboard-nav-text">Finished Results</span>
          </div>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'M'}
            </div>
            <div className="dashboard-user-details">
              <div className="dashboard-user-role">MedTech</div>
              <div className="dashboard-user-email">{user?.email || 'medtech@mdlab.com'}</div>
            </div>
            <button className="dashboard-logout-btn" onClick={handleLogout}>
              ⏻
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-page-title">{renderPageTitle()}</h1>
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionModal && selectedRejectionData && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowRejectionModal(false);
                setSelectedRejectionData(null);
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
            
            <h3 style={{ 
              color: '#dc3545', 
              marginBottom: '20px',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '10px'
            }}>
              Test Result Rejection Details
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Patient:</strong> {selectedRejectionData.patientName}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Service:</strong> {selectedRejectionData.serviceName}
            </div>
            
            {selectedRejectionData.rejectedDate && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Rejected Date:</strong> {new Date(selectedRejectionData.rejectedDate).toLocaleString()}
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Rejection Reason:</strong>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '12px',
                marginTop: '8px',
                fontStyle: 'italic',
                color: '#495057'
              }}>
                {selectedRejectionData.rejectionReason}
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowRejectionModal(false);
                setSelectedRejectionData(null);
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedTechDashboard;