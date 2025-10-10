import React, { useState, useEffect } from 'react';
import '../design/Dashboard.css';

function MedTechDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sampleManagementOpen, setSampleManagementOpen] = useState(false);
  const [testingOpen, setTestingOpen] = useState(false);
  
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

  // Test Results State
  const [testResults, setTestResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

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
    if (['sample-collection', 'sample-tracking'].includes(activeSection)) {
      fetchSamples();
    }
    if (activeSection === 'result-entry') {
      fetchTestResults();
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleSampleManagement = () => {
    setSampleManagementOpen(!sampleManagementOpen);
  };

  const toggleTesting = () => {
    setTestingOpen(!testingOpen);
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
      default: return 'MedTech Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'sample-collection': return renderSampleCollection();
      case 'sample-tracking': return renderSampleTracking();
      case 'result-entry': return renderResultEntry();
      case 'quality-control': return renderQualityControl();
      default: return renderDashboardHome();
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
            className={`dashboard-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('dashboard')}
          >
            <span className="dashboard-nav-text">Dashboard</span>
          </div>

          <div className="dashboard-dropdown">
            <div className="dashboard-nav-item-header" onClick={toggleSampleManagement}>
              <div className="dashboard-nav-item-main">
                <span className="dashboard-nav-text">Sample Management</span>
              </div>
              <span className={`dashboard-dropdown-arrow ${sampleManagementOpen ? 'open' : ''}`}>▼</span>
            </div>
            {sampleManagementOpen && (
              <div className="dashboard-nav-submenu">
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'sample-collection' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('sample-collection')}
                >
                  Sample Collection
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'sample-tracking' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('sample-tracking')}
                >
                  Sample Tracking
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-dropdown">
            <div className="dashboard-nav-item-header" onClick={toggleTesting}>
              <div className="dashboard-nav-item-main">
                <span className="dashboard-nav-text">Testing & Results</span>
              </div>
              <span className={`dashboard-dropdown-arrow ${testingOpen ? 'open' : ''}`}>▼</span>
            </div>
            {testingOpen && (
              <div className="dashboard-nav-submenu">
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'result-entry' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('result-entry')}
                >
                  Result Entry
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'quality-control' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('quality-control')}
                >
                  Quality Control
                </div>
              </div>
            )}
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
    </div>
  );
}

export default MedTechDashboard;