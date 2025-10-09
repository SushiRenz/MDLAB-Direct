import React, { useState, useEffect } from 'react';
import '../design/MedTechDashboard.css';

function MedTechDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample Management State
  const [samples, setSamples] = useState([]);
  const [sampleStats, setSampleStats] = useState({
    totalSamples: 45,
    inProgress: 23,
    completed: 67,
    urgent: 8
  });
  const [selectedSample, setSelectedSample] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Test Results State
  const [testResults, setTestResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  // Form States
  const [sampleForm, setSampleForm] = useState({
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

  const [resultForm, setResultForm] = useState({
    hemoglobin: '',
    hematocrit: '',
    wbc: '',
    rbc: '',
    platelets: ''
  });

  // Filter States
  const [sampleFilters, setSampleFilters] = useState({
    sampleType: '',
    status: '',
    priority: '',
    search: ''
  });

  const [resultFilters, setResultFilters] = useState({
    status: '',
    testType: '',
    date: '',
    search: ''
  });

  const user = currentUser;

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
      setShowSampleModal(false);
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

  // Effect to fetch data when section changes
  useEffect(() => {
    if (['sample-collection', 'sample-processing', 'sample-tracking'].includes(activeSection)) {
      fetchSamples();
    }
    if (['result-entry', 'result-validation'].includes(activeSection)) {
      fetchTestResults();
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleSamples = () => {
    setSamplesOpen(!samplesOpen);
  };

  const toggleResults = () => {
    setResultsOpen(!resultsOpen);
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
      case 'sample-processing': return 'Sample Processing';
      case 'sample-tracking': return 'Sample Tracking';
      case 'result-entry': return 'Result Entry';
      case 'result-validation': return 'Result Validation';
      case 'analyzer-integration': return 'Analyzer Integration';
      case 'reports': return 'Lab Reports';
      default: return 'MedTech Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'sample-collection': return renderSampleCollection();
      case 'sample-processing': return renderSampleProcessing();
      case 'sample-tracking': return renderSampleTracking();
      case 'result-entry': return renderResultEntry();
      case 'result-validation': return renderResultValidation();
      case 'analyzer-integration': return renderAnalyzerIntegration();
      case 'reports': return renderReports();
      default: return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Top Row Stats */}
      <div className="medtech-stats-grid">
        <div className="medtech-stat-card urgent">
          <div className="stat-info">
            <div className="stat-label">Urgent Samples</div>
            <div className="stat-value">8</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-info">
            <div className="stat-label">Samples Today</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">23</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-info">
            <div className="stat-label">Completed</div>
            <div className="stat-value">67</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <div className="quick-action-card" onClick={() => handleSectionClick('sample-collection')}>
          <div className="action-title">Collect Sample</div>
          <div className="action-description">Register and collect new samples</div>
        </div>

        <div className="quick-action-card" onClick={() => handleSectionClick('result-entry')}>
          <div className="action-title">Enter Results</div>
          <div className="action-description">Input test results manually</div>
        </div>

        <div className="quick-action-card" onClick={() => handleSectionClick('analyzer-integration')}>
          <div className="action-title">Analyzer Data</div>
          <div className="action-description">Import from analyzers</div>
        </div>
      </div>

      {/* Work Lists */}
      <div className="worklist-section">
        <div className="worklist-header">
          <h3>Today's Work List</h3>
          <button className="refresh-btn" onClick={() => window.location.reload()}>Refresh</button>
        </div>

        <div className="worklist-grid">
          <div className="worklist-card">
            <div className="worklist-title">Pending Tests</div>
            <div className="worklist-content">
              <div className="test-item priority-high">
                <span className="test-code">CBC-001</span>
                <span className="patient-name">Maria Santos</span>
                <span className="test-type">Complete Blood Count</span>
                <span className="priority">HIGH</span>
              </div>
              <div className="test-item priority-normal">
                <span className="test-code">BG-002</span>
                <span className="patient-name">Juan Cruz</span>
                <span className="test-type">Blood Glucose</span>
                <span className="priority">NORMAL</span>
              </div>
              <div className="test-item priority-urgent">
                <span className="test-code">LFT-003</span>
                <span className="patient-name">Pedro Garcia</span>
                <span className="test-type">Liver Function</span>
                <span className="priority">URGENT</span>
              </div>
            </div>
          </div>

          <div className="worklist-card">
            <div className="worklist-title">Quality Control</div>
            <div className="worklist-content">
              <div className="qc-item qc-passed">
                <span className="qc-test">Chemistry QC Level 1</span>
                <span className="qc-status">PASSED</span>
                <span className="qc-time">08:30 AM</span>
              </div>
              <div className="qc-item qc-pending">
                <span className="qc-test">Hematology QC Level 2</span>
                <span className="qc-status">PENDING</span>
                <span className="qc-time">-</span>
              </div>
              <div className="qc-item qc-failed">
                <span className="qc-test">Immunology QC</span>
                <span className="qc-status">FAILED</span>
                <span className="qc-time">09:15 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="equipment-status">
        <h3>Equipment Status</h3>
        <div className="equipment-grid">
          <div className="equipment-card status-online">
            <div className="equipment-info">
              <div className="equipment-name">Hematology Analyzer</div>
              <div className="equipment-status">Online</div>
            </div>
          </div>
          <div className="equipment-card status-online">
            <div className="equipment-info">
              <div className="equipment-name">Chemistry Analyzer</div>
              <div className="equipment-status">Online</div>
            </div>
          </div>
          <div className="equipment-card status-maintenance">
            <div className="equipment-info">
              <div className="equipment-name">PCR Machine</div>
              <div className="equipment-status">Maintenance</div>
            </div>
          </div>
          <div className="equipment-card status-offline">
            <div className="equipment-info">
              <div className="equipment-name">Microscope 3</div>
              <div className="equipment-status">Offline</div>
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
      <div className="sample-collection-container">
        <div className="collection-header">
          <h2>Sample Collection</h2>
          <div className="collection-actions">
            <button className="btn-scan">Scan Barcode</button>
            <button className="btn-manual">Manual Entry</button>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing sample...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        <form className="collection-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Patient Information</h3>
            <div className="form-grid">
              <input 
                type="text" 
                placeholder="Patient ID" 
                className="form-input"
                value={sampleForm.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Patient Name *" 
                className="form-input"
                value={sampleForm.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                required
              />
              <input 
                type="date" 
                placeholder="Date of Birth" 
                className="form-input"
                value={sampleForm.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
              <select 
                className="form-select"
                value={sampleForm.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Sample Details</h3>
            <div className="form-grid">
              <input 
                type="text" 
                placeholder="Sample ID (Auto-generated)" 
                className="form-input"
                value={sampleForm.sampleId}
                onChange={(e) => handleInputChange('sampleId', e.target.value)}
              />
              <select 
                className="form-select"
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
                className="form-input"
                value={sampleForm.collectionTime}
                onChange={(e) => handleInputChange('collectionTime', e.target.value)}
              />
              <select 
                className="form-select"
                value={sampleForm.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Tests Requested *</h3>
            <div className="tests-grid">
              {[
                'Complete Blood Count (CBC)',
                'Blood Glucose',
                'Liver Function Tests',
                'Kidney Function Tests',
                'Lipid Profile',
                'Thyroid Function'
              ].map(test => (
                <label key={test} className="test-checkbox">
                  <input 
                    type="checkbox"
                    checked={sampleForm.testRequests.includes(test)}
                    onChange={() => handleTestToggle(test)}
                  />
                  <span>{test}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Sample'}
            </button>
            <button type="button" className="btn-print">Print Labels</button>
            <button type="button" className="btn-clear" onClick={handleClearForm}>Clear Form</button>
          </div>
        </form>

        {/* Recent Samples */}
        {samples.length > 0 && (
          <div className="recent-samples">
            <h3>Recent Collections ({samples.length})</h3>
            <div className="samples-list">
              {samples.slice(0, 5).map(sample => (
                <div key={sample.id} className="sample-item">
                  <span className="sample-id">{sample.id}</span>
                  <span className="patient-name">{sample.patientName}</span>
                  <span className="sample-type">{sample.sampleType}</span>
                  <span className={`status-${sample.status}`}>{sample.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSampleProcessing = () => (
    <div className="processing-container">
      <div className="processing-header">
        <h2>Sample Processing</h2>
        <div className="processing-filter">
          <select className="filter-select">
            <option>All Samples</option>
            <option>Blood</option>
            <option>Urine</option>
            <option>Serum</option>
          </select>
          <select className="filter-select">
            <option>All Status</option>
            <option>Received</option>
            <option>Processing</option>
            <option>Ready for Testing</option>
          </select>
        </div>
      </div>

      <div className="processing-workflow">
        <div className="workflow-step">
          <div className="step-header">1. Sample Reception</div>
          <div className="step-content">
            <div className="sample-item">
              <span className="sample-id">S001-2024</span>
              <span className="patient-name">Maria Santos</span>
              <span className="sample-type">Blood</span>
              <button className="btn-receive">Receive</button>
            </div>
            <div className="sample-item">
              <span className="sample-id">S002-2024</span>
              <span className="patient-name">Juan Cruz</span>
              <span className="sample-type">Urine</span>
              <button className="btn-receive">Receive</button>
            </div>
          </div>
        </div>

        <div className="workflow-step">
          <div className="step-header">2. Sample Preparation</div>
          <div className="step-content">
            <div className="sample-item processing">
              <span className="sample-id">S003-2024</span>
              <span className="patient-name">Pedro Garcia</span>
              <span className="sample-type">Serum</span>
              <button className="btn-process">Process</button>
            </div>
          </div>
        </div>

        <div className="workflow-step">
          <div className="step-header">3. Ready for Testing</div>
          <div className="step-content">
            <div className="sample-item ready">
              <span className="sample-id">S004-2024</span>
              <span className="patient-name">Ana Lopez</span>
              <span className="sample-type">Plasma</span>
              <button className="btn-test">Send to Testing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSampleTracking = () => (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Sample Tracking</h2>
        <div className="tracking-search">
          <input type="text" placeholder="Search by Sample ID or Patient Name" className="search-input" />
          <button className="search-btn">Search</button>
        </div>
      </div>

      <div className="tracking-stats">
        <div className="stat-card">
          <div className="stat-value">45</div>
          <div className="stat-label">Total Samples</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">23</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">15</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">7</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="tracking-table">
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Collection Date</th>
              <th>Current Status</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S001-2024</td>
              <td>Maria Santos</td>
              <td>Complete Blood Count</td>
              <td>Oct 9, 2025 08:30</td>
              <td><span className="status-processing">Processing</span></td>
              <td>Hematology Lab</td>
              <td><span className="priority-normal">Normal</span></td>
              <td>
                <button className="btn-track">Track</button>
                <button className="btn-update">Update</button>
              </td>
            </tr>
            <tr>
              <td>S002-2024</td>
              <td>Juan Cruz</td>
              <td>Blood Glucose</td>
              <td>Oct 9, 2025 09:15</td>
              <td><span className="status-completed">Completed</span></td>
              <td>Chemistry Lab</td>
              <td><span className="priority-urgent">Urgent</span></td>
              <td>
                <button className="btn-track">Track</button>
                <button className="btn-view">View</button>
              </td>
            </tr>
            <tr>
              <td>S003-2024</td>
              <td>Pedro Garcia</td>
              <td>Liver Function Tests</td>
              <td>Oct 9, 2025 10:00</td>
              <td><span className="status-pending">Pending</span></td>
              <td>Reception</td>
              <td><span className="priority-high">High</span></td>
              <td>
                <button className="btn-track">Track</button>
                <button className="btn-start">Start</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="tracking-timeline">
        <h3>Sample History Timeline</h3>
        <div className="timeline">
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-time">08:30 AM</div>
              <div className="timeline-title">Sample Collected</div>
              <div className="timeline-desc">Sample collected from patient</div>
            </div>
          </div>
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-time">08:45 AM</div>
              <div className="timeline-title">Sample Received</div>
              <div className="timeline-desc">Sample received at laboratory</div>
            </div>
          </div>
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-time">09:00 AM</div>
              <div className="timeline-title">Processing Started</div>
              <div className="timeline-desc">Sample processing initiated</div>
            </div>
          </div>
          <div className="timeline-item pending">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-time">Pending</div>
              <div className="timeline-title">Testing</div>
              <div className="timeline-desc">Awaiting test completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultValidation = () => (
    <div className="validation-container">
      <div className="validation-header">
        <h2>Result Validation</h2>
        <div className="validation-filters">
          <select className="filter-select">
            <option>All Results</option>
            <option>Pending Validation</option>
            <option>Validated</option>
            <option>Rejected</option>
          </select>
          <select className="filter-select">
            <option>All Departments</option>
            <option>Hematology</option>
            <option>Chemistry</option>
            <option>Microbiology</option>
          </select>
        </div>
      </div>

      <div className="validation-stats">
        <div className="stat-card">
          <div className="stat-value">12</div>
          <div className="stat-label">Pending Validation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">45</div>
          <div className="stat-label">Validated Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Flagged for Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">2</div>
          <div className="stat-label">Critical Values</div>
        </div>
      </div>

      <div className="validation-queue">
        <h3>Validation Queue</h3>
        <div className="queue-table">
          <table>
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Result Date</th>
                <th>Status</th>
                <th>Critical Values</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="priority-critical">
                <td>S001-2024</td>
                <td>Emergency Patient</td>
                <td>Troponin</td>
                <td>Oct 9, 2025 11:30</td>
                <td><span className="status-critical">Critical</span></td>
                <td><span className="critical-flag">High Troponin</span></td>
                <td>
                  <button className="btn-validate-critical">Validate Critical</button>
                  <button className="btn-view">View</button>
                </td>
              </tr>
              <tr>
                <td>S002-2024</td>
                <td>Maria Santos</td>
                <td>Complete Blood Count</td>
                <td>Oct 9, 2025 10:45</td>
                <td><span className="status-pending">Pending</span></td>
                <td>None</td>
                <td>
                  <button className="btn-validate">Validate</button>
                  <button className="btn-review">Review</button>
                </td>
              </tr>
              <tr>
                <td>S003-2024</td>
                <td>Juan Cruz</td>
                <td>Blood Glucose</td>
                <td>Oct 9, 2025 10:15</td>
                <td><span className="status-flagged">Flagged</span></td>
                <td><span className="abnormal-flag">Low Glucose</span></td>
                <td>
                  <button className="btn-validate">Validate</button>
                  <button className="btn-reject">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="validation-details">
        <h3>Validation Guidelines</h3>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <div className="guideline-title">Critical Value Protocol</div>
            <div className="guideline-content">
              <ul>
                <li>Immediately notify ordering physician</li>
                <li>Document notification time and recipient</li>
                <li>Verify result accuracy before release</li>
                <li>Follow up confirmation if required</li>
              </ul>
            </div>
          </div>
          <div className="guideline-card">
            <div className="guideline-title">Standard Validation</div>
            <div className="guideline-content">
              <ul>
                <li>Check results against reference ranges</li>
                <li>Review for transcription errors</li>
                <li>Verify patient demographics</li>
                <li>Confirm test methodology</li>
              </ul>
            </div>
          </div>
          <div className="guideline-card">
            <div className="guideline-title">Quality Control</div>
            <div className="guideline-content">
              <ul>
                <li>Ensure QC passed before validation</li>
                <li>Check instrument calibration status</li>
                <li>Review precision and accuracy</li>
                <li>Document any deviations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultEntry = () => {
    const handleSampleSelect = (sample) => {
      setSelectedSample(sample);
      setResultForm({
        hemoglobin: '',
        hematocrit: '',
        wbc: '',
        rbc: '',
        platelets: ''
      });
    };

    const handleResultChange = (field, value) => {
      setResultForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSaveResults = () => {
      if (!selectedSample) {
        alert('Please select a sample first');
        return;
      }

      const hasResults = Object.values(resultForm).some(value => value.trim() !== '');
      if (!hasResults) {
        alert('Please enter at least one test result');
        return;
      }

      handleResultSubmit(selectedSample.id, resultForm);
      setSelectedSample(null);
      setResultForm({
        hemoglobin: '',
        hematocrit: '',
        wbc: '',
        rbc: '',
        platelets: ''
      });
    };

    const pendingSamples = samples.filter(sample => 
      sample.status === 'pending' || sample.status === 'processing'
    );

    return (
      <div className="result-entry-container">
        <div className="entry-header">
          <h2>Manual Result Entry</h2>
          <div className="entry-search">
            <input 
              type="text" 
              placeholder="Search by Sample ID or Patient Name" 
              className="search-input"
              value={resultFilters.search}
              onChange={(e) => setResultFilters(prev => ({...prev, search: e.target.value}))}
            />
            <button className="search-btn">Search</button>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading samples...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {/* Pending Samples List */}
        <div className="pending-samples">
          <h3>Pending Samples ({pendingSamples.length})</h3>
          {pendingSamples.length === 0 ? (
            <div className="empty-state">
              <p>No pending samples found</p>
            </div>
          ) : (
            <div className="samples-list">
              {pendingSamples.map(sample => (
                <div 
                  key={sample.id} 
                  className={`sample-item ${selectedSample?.id === sample.id ? 'selected' : ''}`}
                  onClick={() => handleSampleSelect(sample)}
                >
                  <span className="sample-id">{sample.id}</span>
                  <span className="patient-name">{sample.patientName}</span>
                  <span className="test-type">{sample.testType}</span>
                  <span className={`priority priority-${sample.priority}`}>{sample.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSample && (
          <div className="result-form">
            <div className="sample-info">
              <h3>Sample Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Sample ID:</label>
                  <span>{selectedSample.id}</span>
                </div>
                <div className="info-item">
                  <label>Patient:</label>
                  <span>{selectedSample.patientName}</span>
                </div>
                <div className="info-item">
                  <label>Test Type:</label>
                  <span>{selectedSample.testType}</span>
                </div>
                <div className="info-item">
                  <label>Priority:</label>
                  <span className={`priority-${selectedSample.priority}`}>{selectedSample.priority}</span>
                </div>
              </div>
            </div>

            <div className="test-results">
              <h3>Test Results</h3>
              <div className="results-grid">
                <div className="result-field">
                  <label>Hemoglobin (g/dL)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="12.0-15.5" 
                    className="result-input"
                    value={resultForm.hemoglobin}
                    onChange={(e) => handleResultChange('hemoglobin', e.target.value)}
                  />
                  <span className="reference-range">12.0-15.5</span>
                </div>
                <div className="result-field">
                  <label>Hematocrit (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="36-46" 
                    className="result-input"
                    value={resultForm.hematocrit}
                    onChange={(e) => handleResultChange('hematocrit', e.target.value)}
                  />
                  <span className="reference-range">36-46</span>
                </div>
                <div className="result-field">
                  <label>WBC Count (×10³/μL)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="4.5-11.0" 
                    className="result-input"
                    value={resultForm.wbc}
                    onChange={(e) => handleResultChange('wbc', e.target.value)}
                  />
                  <span className="reference-range">4.5-11.0</span>
                </div>
                <div className="result-field">
                  <label>RBC Count (×10⁶/μL)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="4.2-5.4" 
                    className="result-input"
                    value={resultForm.rbc}
                    onChange={(e) => handleResultChange('rbc', e.target.value)}
                  />
                  <span className="reference-range">4.2-5.4</span>
                </div>
                <div className="result-field">
                  <label>Platelet Count (×10³/μL)</label>
                  <input 
                    type="number" 
                    step="1" 
                    placeholder="150-400" 
                    className="result-input"
                    value={resultForm.platelets}
                    onChange={(e) => handleResultChange('platelets', e.target.value)}
                  />
                  <span className="reference-range">150-400</span>
                </div>
              </div>

              <div className="result-actions">
                <button 
                  className="btn-save-results" 
                  onClick={handleSaveResults}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Results'}
                </button>
                <button className="btn-validate">Validate & Submit</button>
                <button className="btn-flag">Flag for Review</button>
              </div>
            </div>
          </div>
        )}

        {/* Recently Saved Results */}
        {testResults.length > 0 && (
          <div className="saved-results">
            <h3>Recent Results ({testResults.length})</h3>
            <div className="saved-list">
              {testResults.slice(0, 5).map((result, index) => (
                <div key={index} className="saved-item">
                  <span>{result.sampleId}</span>
                  <span>{result.patientName || 'Unknown Patient'}</span>
                  <span>{result.testType || 'Lab Test'}</span>
                  <span className="saved-time">{new Date(result.resultDate).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalyzerIntegration = () => (
    <div className="analyzer-container">
      <div className="analyzer-header">
        <h2>Analyzer Integration</h2>
        <button className="btn-sync">Sync All</button>
      </div>

      <div className="analyzer-grid">
        <div className="analyzer-card connected">
          <div className="analyzer-info">
            <div className="analyzer-name">Hematology Analyzer</div>
            <div className="analyzer-model">XN-1000</div>
            <div className="analyzer-status">Connected</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import">Import Results</button>
            <button className="btn-calibrate">Calibrate</button>
          </div>
          <div className="analyzer-data">
            <div className="data-item">
              <span>Pending Results:</span>
              <span className="data-value">5</span>
            </div>
            <div className="data-item">
              <span>Last Import:</span>
              <span className="data-value">10:30 AM</span>
            </div>
          </div>
        </div>

        <div className="analyzer-card connected">
          <div className="analyzer-info">
            <div className="analyzer-name">Chemistry Analyzer</div>
            <div className="analyzer-model">AU-480</div>
            <div className="analyzer-status">Connected</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import">Import Results</button>
            <button className="btn-calibrate">Calibrate</button>
          </div>
          <div className="analyzer-data">
            <div className="data-item">
              <span>Pending Results:</span>
              <span className="data-value">12</span>
            </div>
            <div className="data-item">
              <span>Last Import:</span>
              <span className="data-value">11:15 AM</span>
            </div>
          </div>
        </div>

        <div className="analyzer-card maintenance">
          <div className="analyzer-info">
            <div className="analyzer-name">PCR Machine</div>
            <div className="analyzer-model">Applied Biosystems</div>
            <div className="analyzer-status">Maintenance</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import" disabled>Import Results</button>
            <button className="btn-maintenance">Maintenance</button>
          </div>
          <div className="analyzer-data">
            <div className="data-item">
              <span>Next Service:</span>
              <span className="data-value">Sept 15</span>
            </div>
          </div>
        </div>
      </div>

      <div className="import-history">
        <h3>Recent Data Imports</h3>
        <div className="import-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Analyzer</th>
                <th>Samples</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>11:30 AM</td>
                <td>Hematology Analyzer</td>
                <td>8 samples</td>
                <td><span className="status-success">Success</span></td>
                <td><button className="btn-view">View</button></td>
              </tr>
              <tr>
                <td>11:15 AM</td>
                <td>Chemistry Analyzer</td>
                <td>15 samples</td>
                <td><span className="status-success">Success</span></td>
                <td><button className="btn-view">View</button></td>
              </tr>
              <tr>
                <td>10:45 AM</td>
                <td>PCR Machine</td>
                <td>3 samples</td>
                <td><span className="status-error">Error</span></td>
                <td><button className="btn-retry">Retry</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Laboratory Reports</h2>
        <div className="report-filters">
          <input type="date" className="date-input" />
          <select className="filter-select">
            <option>All Tests</option>
            <option>Hematology</option>
            <option>Chemistry</option>
            <option>Microbiology</option>
          </select>
          <button className="btn-generate">Generate Report</button>
        </div>
      </div>

      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-title">Daily Summary</div>
          <div className="summary-stats">
            <div className="summary-item">
              <span>Tests Completed:</span>
              <span>67</span>
            </div>
            <div className="summary-item">
              <span>Tests Pending:</span>
              <span>23</span>
            </div>
          </div>
        </div>

        <div className="reports-chart">
          <div className="chart-title">Tests by Department</div>
          <div className="chart-placeholder">
            <div className="chart-bar">
              <div className="bar hematology" style={{height: '80%'}}></div>
              <span>Hematology</span>
            </div>
            <div className="chart-bar">
              <div className="bar chemistry" style={{height: '60%'}}></div>
              <span>Chemistry</span>
            </div>
            <div className="chart-bar">
              <div className="bar microbiology" style={{height: '40%'}}></div>
              <span>Microbiology</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="medtech-dashboard-container">
      {/* Sidebar */}
      <div className="medtech-dashboard-sidebar">
        <div className="medtech-sidebar-header">
          <h2 className="medtech-sidebar-title">MDLAB DIRECT</h2>
          <div className="medtech-sidebar-subtitle">MedTech Portal</div>
        </div>
        
        <nav className="medtech-sidebar-nav">
          <div 
            className={`medtech-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('dashboard')}
          >
            <span className="medtech-nav-text">Dashboard</span>
          </div>

          <div className="medtech-dropdown">
            <div className="medtech-nav-item-header" onClick={toggleSamples}>
              <div className="medtech-nav-item-main">
                <span className="medtech-nav-text">Sample Management</span>
              </div>
              <span className={`medtech-dropdown-arrow ${samplesOpen ? 'open' : ''}`}>▼</span>
            </div>
            {samplesOpen && (
              <div className="medtech-nav-submenu">
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'sample-collection' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('sample-collection')}
                >
                  Collection
                </div>
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'sample-processing' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('sample-processing')}
                >
                  Processing
                </div>
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'sample-tracking' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('sample-tracking')}
                >
                  Tracking
                </div>
              </div>
            )}
          </div>

          <div className="medtech-dropdown">
            <div className="medtech-nav-item-header" onClick={toggleResults}>
              <div className="medtech-nav-item-main">
                <span className="medtech-nav-text">Results & Testing</span>
              </div>
              <span className={`medtech-dropdown-arrow ${resultsOpen ? 'open' : ''}`}>▼</span>
            </div>
            {resultsOpen && (
              <div className="medtech-nav-submenu">
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'result-entry' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('result-entry')}
                >
                  Result Entry
                </div>
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'result-validation' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('result-validation')}
                >
                  Validation
                </div>
                <div 
                  className={`medtech-nav-subitem ${activeSection === 'analyzer-integration' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('analyzer-integration')}
                >
                  Analyzer Integration
                </div>
              </div>
            )}
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => handleSectionClick('reports')}
          >
            <span className="medtech-nav-text">Reports</span>
          </div>
        </nav>

        <div className="medtech-sidebar-footer">
          <div className="medtech-user-info">
            <div className="medtech-user-avatar">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'M'}
            </div>
            <div className="medtech-user-details">
              <div className="medtech-user-role">MedTech</div>
              <div className="medtech-user-email">{user?.email || 'medtech@mdlab.com'}</div>
            </div>
            <button className="medtech-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="medtech-dashboard-main">
        <div className="medtech-dashboard-header">
          <h1 className="medtech-page-title">{renderPageTitle()}</h1>
          <div className="medtech-header-actions">
            <button className="medtech-notification-btn">Notifications</button>
            <div className="medtech-time-display">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="medtech-dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default MedTechDashboard;
