import React, { useState } from 'react';
import '../design/MedTechDashboard.css';

function MedTechDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const user = currentUser;

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      case 'quality-control': return 'Quality Control';
      case 'result-entry': return 'Result Entry';
      case 'result-validation': return 'Result Validation';
      case 'analyzer-integration': return 'Analyzer Integration';
      case 'worklist': return 'Work List';
      case 'inventory': return 'Inventory Management';
      case 'maintenance': return 'Equipment Maintenance';
      case 'reports': return 'Lab Reports';
      case 'profile': return 'My Profile';
      default: return 'MedTech Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'sample-collection': return renderSampleCollection();
      case 'sample-processing': return renderSampleProcessing();
      case 'sample-tracking': return renderSampleTracking();
      case 'quality-control': return renderQualityControl();
      case 'result-entry': return renderResultEntry();
      case 'result-validation': return renderResultValidation();
      case 'analyzer-integration': return renderAnalyzerIntegration();
      case 'worklist': return renderWorklist();
      case 'inventory': return renderInventory();
      case 'maintenance': return renderMaintenance();
      case 'reports': return renderReports();
      case 'profile': return renderProfile();
      default: return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Top Row Stats */}
      <div className="medtech-stats-grid">
        <div className="medtech-stat-card urgent">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-label">Urgent Samples</div>
            <div className="stat-value">8</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-icon">🧪</div>
          <div className="stat-info">
            <div className="stat-label">Samples Today</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">23</div>
          </div>
        </div>

        <div className="medtech-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Completed</div>
            <div className="stat-value">67</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <div className="quick-action-card" onClick={() => handleSectionClick('sample-collection')}>
          <div className="action-icon">🧪</div>
          <div className="action-title">Collect Sample</div>
          <div className="action-description">Register and collect new samples</div>
        </div>

        <div className="quick-action-card" onClick={() => handleSectionClick('result-entry')}>
          <div className="action-icon">📝</div>
          <div className="action-title">Enter Results</div>
          <div className="action-description">Input test results manually</div>
        </div>

        <div className="quick-action-card" onClick={() => handleSectionClick('analyzer-integration')}>
          <div className="action-icon">🔬</div>
          <div className="action-title">Analyzer Data</div>
          <div className="action-description">Import from analyzers</div>
        </div>

        <div className="quick-action-card" onClick={() => handleSectionClick('quality-control')}>
          <div className="action-icon">🎯</div>
          <div className="action-title">Quality Control</div>
          <div className="action-description">Run QC tests and validation</div>
        </div>
      </div>

      {/* Work Lists */}
      <div className="worklist-section">
        <div className="worklist-header">
          <h3>Today's Work List</h3>
          <button className="refresh-btn" onClick={() => window.location.reload()}>🔄 Refresh</button>
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
            <div className="equipment-icon">🔬</div>
            <div className="equipment-info">
              <div className="equipment-name">Hematology Analyzer</div>
              <div className="equipment-status">Online</div>
            </div>
          </div>
          <div className="equipment-card status-online">
            <div className="equipment-icon">⚗️</div>
            <div className="equipment-info">
              <div className="equipment-name">Chemistry Analyzer</div>
              <div className="equipment-status">Online</div>
            </div>
          </div>
          <div className="equipment-card status-maintenance">
            <div className="equipment-icon">🧬</div>
            <div className="equipment-info">
              <div className="equipment-name">PCR Machine</div>
              <div className="equipment-status">Maintenance</div>
            </div>
          </div>
          <div className="equipment-card status-offline">
            <div className="equipment-icon">🦠</div>
            <div className="equipment-info">
              <div className="equipment-name">Microscope 3</div>
              <div className="equipment-status">Offline</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSampleCollection = () => (
    <div className="sample-collection-container">
      <div className="collection-header">
        <h2>Sample Collection</h2>
        <div className="collection-actions">
          <button className="btn-scan">📷 Scan Barcode</button>
          <button className="btn-manual">✏️ Manual Entry</button>
        </div>
      </div>

      <div className="collection-form">
        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="form-grid">
            <input type="text" placeholder="Patient ID" className="form-input" />
            <input type="text" placeholder="Patient Name" className="form-input" />
            <input type="date" placeholder="Date of Birth" className="form-input" />
            <select className="form-select">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Sample Details</h3>
          <div className="form-grid">
            <input type="text" placeholder="Sample ID" className="form-input" />
            <select className="form-select">
              <option>Select Sample Type</option>
              <option>Blood</option>
              <option>Urine</option>
              <option>Serum</option>
              <option>Plasma</option>
              <option>Other</option>
            </select>
            <input type="datetime-local" placeholder="Collection Time" className="form-input" />
            <select className="form-select">
              <option>Priority Level</option>
              <option>Routine</option>
              <option>Urgent</option>
              <option>STAT</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Tests Requested</h3>
          <div className="tests-grid">
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Complete Blood Count (CBC)</span>
            </label>
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Blood Glucose</span>
            </label>
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Liver Function Tests</span>
            </label>
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Kidney Function Tests</span>
            </label>
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Lipid Profile</span>
            </label>
            <label className="test-checkbox">
              <input type="checkbox" />
              <span>Thyroid Function</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-save">💾 Save Sample</button>
          <button className="btn-print">🖨️ Print Labels</button>
          <button className="btn-clear">🗑️ Clear Form</button>
        </div>
      </div>
    </div>
  );

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
              <button className="btn-receive">✅ Receive</button>
            </div>
            <div className="sample-item">
              <span className="sample-id">S002-2024</span>
              <span className="patient-name">Juan Cruz</span>
              <span className="sample-type">Urine</span>
              <button className="btn-receive">✅ Receive</button>
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
              <button className="btn-process">⚙️ Process</button>
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
              <button className="btn-test">🔬 Send to Testing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultEntry = () => {
    const [selectedSample, setSelectedSample] = useState(null);
    const [testResults, setTestResults] = useState({
      hemoglobin: '',
      hematocrit: '',
      wbc: '',
      rbc: '',
      platelets: ''
    });
    const [savedResults, setSavedResults] = useState([]);

    const pendingSamples = [
      { id: 'S001-2024', patient: 'Maria Santos', testType: 'Complete Blood Count', priority: 'Normal', patientId: 'patient1' },
      { id: 'S002-2024', patient: 'Juan Cruz', testType: 'Blood Glucose', priority: 'Urgent', patientId: 'patient2' },
      { id: 'S003-2024', patient: 'Pedro Garcia', testType: 'Lipid Profile', priority: 'Normal', patientId: 'patient3' }
    ];

    const handleSampleSelect = (sample) => {
      setSelectedSample(sample);
      setTestResults({
        hemoglobin: '',
        hematocrit: '',
        wbc: '',
        rbc: '',
        platelets: ''
      });
    };

    const handleResultChange = (field, value) => {
      setTestResults(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSaveResults = () => {
      if (!selectedSample) return;

      const resultData = {
        sampleId: selectedSample.id,
        patient: selectedSample.patient,
        patientId: selectedSample.patientId,
        testType: selectedSample.testType,
        results: testResults,
        date: new Date().toISOString(),
        status: 'completed',
        technician: currentUser?.username || 'medtech1'
      };

      // Save to localStorage for demo purposes
      const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      existingResults.push(resultData);
      localStorage.setItem('testResults', JSON.stringify(existingResults));

      setSavedResults([...savedResults, resultData]);
      alert(`Results saved for ${selectedSample.patient}!`);
      setSelectedSample(null);
      setTestResults({
        hemoglobin: '',
        hematocrit: '',
        wbc: '',
        rbc: '',
        platelets: ''
      });
    };

    return (
      <div className="result-entry-container">
        <div className="entry-header">
          <h2>Manual Result Entry</h2>
          <div className="entry-search">
            <input type="text" placeholder="Search by Sample ID or Patient Name" className="search-input" />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        {/* Pending Samples List */}
        <div className="pending-samples">
          <h3>Pending Samples</h3>
          <div className="samples-list">
            {pendingSamples.map(sample => (
              <div 
                key={sample.id} 
                className={`sample-item ${selectedSample?.id === sample.id ? 'selected' : ''}`}
                onClick={() => handleSampleSelect(sample)}
              >
                <span className="sample-id">{sample.id}</span>
                <span className="patient-name">{sample.patient}</span>
                <span className="test-type">{sample.testType}</span>
                <span className={`priority priority-${sample.priority.toLowerCase()}`}>{sample.priority}</span>
              </div>
            ))}
          </div>
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
                  <span>{selectedSample.patient}</span>
                </div>
                <div className="info-item">
                  <label>Test Type:</label>
                  <span>{selectedSample.testType}</span>
                </div>
                <div className="info-item">
                  <label>Priority:</label>
                  <span className={`priority-${selectedSample.priority.toLowerCase()}`}>{selectedSample.priority}</span>
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
                    value={testResults.hemoglobin}
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
                    value={testResults.hematocrit}
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
                    value={testResults.wbc}
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
                    value={testResults.rbc}
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
                    value={testResults.platelets}
                    onChange={(e) => handleResultChange('platelets', e.target.value)}
                  />
                  <span className="reference-range">150-400</span>
                </div>
              </div>

              <div className="result-actions">
                <button className="btn-save-results" onClick={handleSaveResults}>💾 Save Results</button>
                <button className="btn-validate">✅ Validate & Submit</button>
                <button className="btn-flag">🚩 Flag for Review</button>
              </div>
            </div>
          </div>
        )}

        {/* Recently Saved Results */}
        {savedResults.length > 0 && (
          <div className="saved-results">
            <h3>Recently Saved Results</h3>
            <div className="saved-list">
              {savedResults.map((result, index) => (
                <div key={index} className="saved-item">
                  <span>{result.sampleId}</span>
                  <span>{result.patient}</span>
                  <span>{result.testType}</span>
                  <span className="saved-time">{new Date(result.date).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQualityControl = () => (
    <div className="qc-container">
      <div className="qc-header">
        <h2>Quality Control Management</h2>
        <button className="btn-new-qc">+ New QC Run</button>
      </div>

      <div className="qc-dashboard">
        <div className="qc-stats">
          <div className="qc-stat-card qc-passed">
            <div className="stat-value">15</div>
            <div className="stat-label">Passed Today</div>
          </div>
          <div className="qc-stat-card qc-failed">
            <div className="stat-value">2</div>
            <div className="stat-label">Failed Today</div>
          </div>
          <div className="qc-stat-card qc-pending">
            <div className="stat-value">3</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="qc-controls">
          <h3>Daily QC Controls</h3>
          <div className="qc-table">
            <table>
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Level</th>
                  <th>Expected</th>
                  <th>Observed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Glucose Control</td>
                  <td>Level 1</td>
                  <td>100 ± 5 mg/dL</td>
                  <td>102 mg/dL</td>
                  <td><span className="status-passed">PASSED</span></td>
                  <td><button className="btn-view">👁️</button></td>
                </tr>
                <tr>
                  <td>Cholesterol Control</td>
                  <td>Level 2</td>
                  <td>200 ± 10 mg/dL</td>
                  <td>215 mg/dL</td>
                  <td><span className="status-failed">FAILED</span></td>
                  <td><button className="btn-rerun">🔄</button></td>
                </tr>
                <tr>
                  <td>CBC Control</td>
                  <td>Normal</td>
                  <td>12.5 ± 1.0 g/dL</td>
                  <td>-</td>
                  <td><span className="status-pending">PENDING</span></td>
                  <td><button className="btn-run">▶️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyzerIntegration = () => (
    <div className="analyzer-container">
      <div className="analyzer-header">
        <h2>Analyzer Integration</h2>
        <button className="btn-sync">🔄 Sync All</button>
      </div>

      <div className="analyzer-grid">
        <div className="analyzer-card connected">
          <div className="analyzer-info">
            <div className="analyzer-name">Hematology Analyzer</div>
            <div className="analyzer-model">XN-1000</div>
            <div className="analyzer-status">🟢 Connected</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import">📥 Import Results</button>
            <button className="btn-calibrate">⚙️ Calibrate</button>
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
            <div className="analyzer-status">🟢 Connected</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import">📥 Import Results</button>
            <button className="btn-calibrate">⚙️ Calibrate</button>
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
            <div className="analyzer-status">🟡 Maintenance</div>
          </div>
          <div className="analyzer-actions">
            <button className="btn-import" disabled>📥 Import Results</button>
            <button className="btn-maintenance">🔧 Maintenance</button>
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
                <td><button className="btn-view">👁️</button></td>
              </tr>
              <tr>
                <td>11:15 AM</td>
                <td>Chemistry Analyzer</td>
                <td>15 samples</td>
                <td><span className="status-success">Success</span></td>
                <td><button className="btn-view">👁️</button></td>
              </tr>
              <tr>
                <td>10:45 AM</td>
                <td>PCR Machine</td>
                <td>3 samples</td>
                <td><span className="status-error">Error</span></td>
                <td><button className="btn-retry">🔄</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWorklist = () => (
    <div className="worklist-container">
      <div className="worklist-header">
        <h2>Laboratory Work List</h2>
        <div className="worklist-filters">
          <select className="filter-select">
            <option>All Departments</option>
            <option>Hematology</option>
            <option>Chemistry</option>
            <option>Microbiology</option>
            <option>Immunology</option>
          </select>
          <select className="filter-select">
            <option>All Priorities</option>
            <option>STAT</option>
            <option>Urgent</option>
            <option>Routine</option>
          </select>
        </div>
      </div>

      <div className="worklist-table">
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Patient</th>
              <th>Test</th>
              <th>Priority</th>
              <th>Received</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="priority-stat">
              <td>S001-2024</td>
              <td>Emergency Patient</td>
              <td>Troponin</td>
              <td><span className="priority-stat">STAT</span></td>
              <td>11:45 AM</td>
              <td><span className="status-processing">Processing</span></td>
              <td>You</td>
              <td>
                <button className="btn-work">🔬 Work</button>
                <button className="btn-view">👁️</button>
              </td>
            </tr>
            <tr className="priority-urgent">
              <td>S002-2024</td>
              <td>Maria Santos</td>
              <td>Complete Blood Count</td>
              <td><span className="priority-urgent">Urgent</span></td>
              <td>10:30 AM</td>
              <td><span className="status-ready">Ready</span></td>
              <td>-</td>
              <td>
                <button className="btn-assign">👋 Take</button>
                <button className="btn-view">👁️</button>
              </td>
            </tr>
            <tr className="priority-routine">
              <td>S003-2024</td>
              <td>Juan Cruz</td>
              <td>Lipid Profile</td>
              <td><span className="priority-routine">Routine</span></td>
              <td>09:15 AM</td>
              <td><span className="status-pending">Pending</span></td>
              <td>Tech 2</td>
              <td>
                <button className="btn-view">👁️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button className="btn-request">📋 Request Supplies</button>
      </div>

      <div className="inventory-alerts">
        <div className="alert low-stock">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">5 items low in stock</span>
          <button className="alert-action">View</button>
        </div>
        <div className="alert expired">
          <span className="alert-icon">🚨</span>
          <span className="alert-text">2 items expired</span>
          <button className="alert-action">View</button>
        </div>
      </div>

      <div className="inventory-categories">
        <div className="category-card">
          <div className="category-title">Reagents</div>
          <div className="category-stats">
            <div className="stat-item">
              <span>Total Items:</span>
              <span>45</span>
            </div>
            <div className="stat-item">
              <span>Low Stock:</span>
              <span className="alert-text">3</span>
            </div>
          </div>
        </div>

        <div className="category-card">
          <div className="category-title">Consumables</div>
          <div className="category-stats">
            <div className="stat-item">
              <span>Total Items:</span>
              <span>78</span>
            </div>
            <div className="stat-item">
              <span>Low Stock:</span>
              <span className="alert-text">2</span>
            </div>
          </div>
        </div>

        <div className="category-card">
          <div className="category-title">Quality Controls</div>
          <div className="category-stats">
            <div className="stat-item">
              <span>Total Items:</span>
              <span>12</span>
            </div>
            <div className="stat-item">
              <span>Expiring Soon:</span>
              <span className="alert-text">1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Name</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="low-stock">
              <td>REG-001</td>
              <td>Glucose Reagent</td>
              <td>5 vials</td>
              <td>10 vials</td>
              <td>2024-12-15</td>
              <td><span className="status-low">Low Stock</span></td>
              <td><button className="btn-order">📦 Order</button></td>
            </tr>
            <tr className="normal">
              <td>CON-002</td>
              <td>Blood Collection Tubes</td>
              <td>250 pieces</td>
              <td>100 pieces</td>
              <td>2025-03-20</td>
              <td><span className="status-ok">OK</span></td>
              <td><button className="btn-view">👁️</button></td>
            </tr>
            <tr className="expired">
              <td>QC-003</td>
              <td>Cholesterol Control</td>
              <td>2 vials</td>
              <td>3 vials</td>
              <td>2024-08-30</td>
              <td><span className="status-expired">Expired</span></td>
              <td><button className="btn-dispose">🗑️ Dispose</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h2>Equipment Maintenance</h2>
        <button className="btn-schedule">📅 Schedule Maintenance</button>
      </div>

      <div className="maintenance-overview">
        <div className="maintenance-stats">
          <div className="stat-card">
            <div className="stat-value">15</div>
            <div className="stat-label">Equipment Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Due This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">1</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>

        <div className="equipment-list">
          <div className="equipment-item">
            <div className="equipment-details">
              <div className="equipment-name">Hematology Analyzer XN-1000</div>
              <div className="equipment-info">
                <span>Last Service: Aug 15, 2024</span>
                <span>Next Due: Sep 15, 2024</span>
              </div>
            </div>
            <div className="equipment-status">
              <span className="status-due">Due Soon</span>
            </div>
            <div className="equipment-actions">
              <button className="btn-service">🔧 Service</button>
              <button className="btn-log">📝 Log</button>
            </div>
          </div>

          <div className="equipment-item">
            <div className="equipment-details">
              <div className="equipment-name">Chemistry Analyzer AU-480</div>
              <div className="equipment-info">
                <span>Last Service: Jul 20, 2024</span>
                <span>Next Due: Oct 20, 2024</span>
              </div>
            </div>
            <div className="equipment-status">
              <span className="status-ok">OK</span>
            </div>
            <div className="equipment-actions">
              <button className="btn-service">🔧 Service</button>
              <button className="btn-log">📝 Log</button>
            </div>
          </div>

          <div className="equipment-item overdue">
            <div className="equipment-details">
              <div className="equipment-name">Microscope Station 1</div>
              <div className="equipment-info">
                <span>Last Service: Jun 01, 2024</span>
                <span>Next Due: Aug 01, 2024</span>
              </div>
            </div>
            <div className="equipment-status">
              <span className="status-overdue">Overdue</span>
            </div>
            <div className="equipment-actions">
              <button className="btn-urgent">⚡ Urgent</button>
              <button className="btn-log">📝 Log</button>
            </div>
          </div>
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
          <button className="btn-generate">📊 Generate Report</button>
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
            <div className="summary-item">
              <span>Quality Controls:</span>
              <span>15</span>
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

  const renderProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="btn-edit">✏️ Edit Profile</button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'M'}</span>
          </div>
          <div className="profile-details">
            <h3>{user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}</h3>
            <p>{user?.role?.toUpperCase()}</p>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span>Tests Completed Today:</span>
            <span>23</span>
          </div>
          <div className="stat-item">
            <span>Quality Controls Today:</span>
            <span>8</span>
          </div>
          <div className="stat-item">
            <span>Active Since:</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
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
            className={`medtech-nav-item ${activeSection === 'worklist' ? 'active' : ''}`}
            onClick={() => handleSectionClick('worklist')}
          >
            <span className="medtech-nav-text">Work List</span>
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'quality-control' ? 'active' : ''}`}
            onClick={() => handleSectionClick('quality-control')}
          >
            <span className="medtech-nav-text">Quality Control</span>
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
            onClick={() => handleSectionClick('inventory')}
          >
            <span className="medtech-nav-text">Inventory</span>
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'maintenance' ? 'active' : ''}`}
            onClick={() => handleSectionClick('maintenance')}
          >
            <span className="medtech-nav-text">Maintenance</span>
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => handleSectionClick('reports')}
          >
            <span className="medtech-nav-text">Reports</span>
          </div>

          <div 
            className={`medtech-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('profile')}
          >
            <span className="medtech-nav-text">My Profile</span>
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
              ⏻
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="medtech-dashboard-main">
        <div className="medtech-dashboard-header">
          <h1 className="medtech-page-title">{renderPageTitle()}</h1>
          <div className="medtech-header-actions">
            <button className="medtech-notification-btn">🔔</button>
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
