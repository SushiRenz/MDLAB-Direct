import React, { useState, useEffect } from 'react';
import BookAppointmentModal from './BookAppointmentModal';
import PatientProfile from './PatientProfile'; 
import MobileLabScheduleModal from './MobileLabScheduleModal';
import '../design/PatientDashboard.css';
import '../design/BookAppointmentModal.css';

function PatientDashboard(props) {
  const [activeSection, setActiveSection] = useState('overview');
  const [currentUser, setCurrentUser] = useState(props.currentUser);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isReschedulingModalOpen, setIsReschedulingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('3months');
  const [sortBy, setSortBy] = useState('date');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Test Results state - moved to component level
  const [testResults, setTestResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  // Sync currentUser state with props
  useEffect(() => {
    setCurrentUser(props.currentUser);
  }, [props.currentUser]);

  // Load test results from localStorage
  useEffect(() => {
    const loadResults = () => {
      try {
        const savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        
        // Add some default demo results if none exist
        const defaultResults = [
          {
            sampleId: 'S001-DEMO',
            patient: currentUser?.firstName + ' ' + currentUser?.lastName || 'Demo Patient',
            patientId: 'current-user',
            testType: 'Complete Blood Count (CBC)',
            results: {
              hemoglobin: '13.8',
              hematocrit: '41.2',
              wbc: '6.5',
              rbc: '4.2',
              platelets: '280'
            },
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            status: 'completed',
            technician: 'medtech1',
            isNew: true
          },
          {
            sampleId: 'S002-DEMO',
            patient: currentUser?.firstName + ' ' + currentUser?.lastName || 'Demo Patient',
            patientId: 'current-user',
            testType: 'Blood Sugar Test',
            results: {
              glucose: '95',
              hba1c: '5.4'
            },
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
            status: 'completed',
            technician: 'medtech1',
            isNew: false
          }
        ];

        // Filter results for current user (in real app, this would be done by backend)
        const currentUserResults = savedResults.filter(result => 
          result.patientId === 'current-user' || 
          result.patient === (currentUser?.firstName + ' ' + currentUser?.lastName)
        );

        const allResults = [...defaultResults, ...currentUserResults];
        setTestResults(allResults);
      } catch (error) {
        console.error('Error loading test results:', error);
        setTestResults([]);
      }
    };

    loadResults();
    
    // Set up interval to check for new results
    const interval = setInterval(loadResults, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Filter results based on current filters
  useEffect(() => {
    let filtered = [...testResults];

    // Apply test type filter
    if (testTypeFilter !== 'all') {
      filtered = filtered.filter(result => {
        const testType = result.testType.toLowerCase();
        switch (testTypeFilter) {
          case 'blood':
            return testType.includes('blood') || testType.includes('cbc') || testType.includes('glucose') || testType.includes('sugar');
          case 'urine':
            return testType.includes('urine');
          case 'xray':
            return testType.includes('x-ray') || testType.includes('xray');
          case 'ultrasound':
            return testType.includes('ultrasound');
          default:
            return true;
        }
      });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.date);
        const diffMonths = (now.getFullYear() - resultDate.getFullYear()) * 12 + (now.getMonth() - resultDate.getMonth());
        
        switch (timeFilter) {
          case '3months':
            return diffMonths <= 3;
          case '6months':
            return diffMonths <= 6;
          case '1year':
            return diffMonths <= 12;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'dateAsc':
          return new Date(a.date) - new Date(b.date);
        case 'type':
          return a.testType.localeCompare(b.testType);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }, [testResults, testTypeFilter, timeFilter, sortBy]);

  const handleSectionClick = (section) => setActiveSection(section);

  const handleLogout = async () => {
    // Show custom logout modal
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call the parent logout function
      props.onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      props.onLogout();
    }
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser({ ...updatedUser }); // Create a new object to force re-render
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      // Create a new appointment object
      const newAppointment = {
        id: Date.now(), // temporary ID for demo
        date: appointmentData.date,
        time: appointmentData.time,
        testType: appointmentData.testType,
        location: appointmentData.location === 'main' ? 'MDLAB Direct - Main Branch' : 'Mobile Lab Service',
        status: 'Confirmed',
        doctor: 'Dr. Maria Santos' // You can make this dynamic later
      };

      // Add the new appointment to the state
      setAppointments([...appointments, newAppointment]);
      
      // Close the modal
      setIsBookingModalOpen(false);
      
      // Show success message
      alert('Appointment booked successfully!');
      
      // TODO: Send appointment data to backend
      // const response = await axios.post('/api/appointments', appointmentData);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setIsReschedulingModalOpen(true);
  };

  const handleRescheduleSubmit = (updatedData) => {
    const updatedAppointments = appointments.map(apt => 
      apt.id === selectedAppointment.id 
        ? { 
            ...apt, 
            date: updatedData.date,
            time: updatedData.time,
            doctor: updatedData.doctor
          } 
        : apt
    );
    
    setAppointments(updatedAppointments);
    setIsReschedulingModalOpen(false);
    setSelectedAppointment(null);
    alert('Appointment rescheduled successfully!');
  };

  const handleCancel = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
      setAppointments(updatedAppointments);
      alert('Appointment cancelled successfully!');
    }
  };

  const renderPageTitle = () => {
    switch (activeSection) {
      case 'appointments': return 'My Appointments';
      case 'results': return 'Test Results';
      case 'mobile': return 'Mobile Lab Service';
      case 'profile': return 'My Profile';
      default: return 'Dashboard Overview';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'appointments':
        return renderAppointments();
      case 'results':
        return renderResults();
      case 'mobile':
        return renderMobileService();
      case 'profile':
        return <PatientProfile 
          user={currentUser} 
          onProfileUpdate={handleProfileUpdate}
        />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Welcome back, {currentUser?.firstName || currentUser?.username}!</h2>
            <p>Here's a quick overview of your health journey with MDLAB Direct</p>
          </div>
          <div className="welcome-stats">
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Upcoming Appointments</div>
              </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">New Results</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Total Tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          {/* Existing action cards */}
          <div className="action-card" onClick={() => handleSectionClick('appointments')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Book Appointment</h4>
              <p>Schedule your next lab test</p>
            </div>
          </div>
          <div className="action-card" onClick={() => handleSectionClick('results')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>View Results</h4>
              <p>Check your latest test results</p>
            </div>
          </div>
          <div className="action-card" onClick={() => handleSectionClick('mobile')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17h2m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h4m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2M3 12h1l2-4h12l2 4h1v3a1 1 0 01-1 1h-1m-14 0H4a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Mobile Lab</h4>
              <p>Check community visit schedule</p>
            </div>
          </div>
          {/* Add this for Profile */}
          <div className="action-card" onClick={() => handleSectionClick('profile')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>My Profile</h4>
              <p>View your profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Blood TestResults Available</div>
              <div className="activity-date">September 2, 2025</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Appointment Scheduled</div>
              <div className="activity-date">August 30, 2025</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17h2m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h4m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2M3 12h1l2-4h12l2 4h1v3a1 1 0 01-1 1h-1m-14 0H4a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Mobile Lab Service Completed</div>
              <div className="activity-date">August 25, 2025</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAppointments = () => (
    <div className="appointments-container">
      <div className="appointments-header">
        <div className="header-content">
          <h2>My Appointments</h2>
          <p>Manage your upcoming and past appointments</p>
        </div>
        <button 
          className="book-appointment-btn" 
          onClick={() => setIsBookingModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px', marginRight: '8px'}}>
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Book New Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="appointments-section">
        <h3>Upcoming Appointments</h3>
        <div className="appointments-grid">
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card upcoming">
              <div className="appointment-header">
                <div className="appointment-date">
                  <div className="date-day">
                    {new Date(appointment.date).getDate().toString().padStart(2, '0')}
                  </div>
                  <div className="date-month">
                    {new Date(appointment.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                  </div>
                </div>
                <div className="appointment-status">{appointment.status}</div>
              </div>
              <div className="appointment-details">
                <h4>{appointment.testType}</h4>
                <div className="appointment-time">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {appointment.time}
                </div>
                <div className="appointment-location">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {appointment.location}
                </div>
                <div className="appointment-doctor">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {appointment.doctor}
                </div>
              </div>
              <div className="appointment-actions">
                <button 
                  className="btn-reschedule"
                  onClick={() => handleReschedule(appointment)}
                >
                  Reschedule
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}

          {/* Show existing hardcoded appointments if needed */}
          {/* ...existing appointment cards... */}
        </div>
      </div>

      {/* Past Appointments */}
      <div className="appointments-section">
        <h3>Past Appointments</h3>
        <div className="appointments-list">
          <div className="appointment-item completed">
            <div className="appointment-info">
              <div className="appointment-name">Blood Sugar Test</div>
              <div className="appointment-meta">
                <span>August 25, 2025</span>
                <span>•</span>
                <span>Dr. Ana Cruz</span>
                <span>•</span>
                <span>Mobile Lab Service</span>
              </div>
            </div>
            <div className="appointment-result">
              <span className="result-status completed">Results Available</span>
            </div>
          </div>

          <div className="appointment-item completed">
            <div className="appointment-info">
              <div className="appointment-name">Urinalysis</div>
              <div className="appointment-meta">
                <span>August 15, 2025</span>
                <span>•</span>
                <span>Dr. Roberto Kim</span>
                <span>•</span>
                <span>Main Branch</span>
              </div>
            </div>
            <div className="appointment-result">
              <span className="result-status completed">Results Available</span>
            </div>
          </div>

          <div className="appointment-item completed">
            <div className="appointment-info">
              <div className="appointment-name">X-Ray Chest</div>
              <div className="appointment-meta">
                <span>July 30, 2025</span>
                <span>•</span>
                <span>Dr. Lisa Wong</span>
                <span>•</span>
                <span>Main Branch</span>
              </div>
            </div>
            <div className="appointment-result">
              <span className="result-status completed">Results Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rescheduling Modal - Add this section */}
      {isReschedulingModalOpen && (
        <BookAppointmentModal
          isOpen={isReschedulingModalOpen}
          onClose={() => {
            setIsReschedulingModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleRescheduleSubmit}
          initialData={selectedAppointment}
          isRescheduling={true}
        />
      )}
    </div>
  );

  const renderResults = () => {
    const formatResultValue = (key, value, testType) => {
      if (!value) return 'Not Available';
      
      // Define normal ranges
      const ranges = {
        hemoglobin: { min: 12.0, max: 15.5, unit: 'g/dL' },
        hematocrit: { min: 36, max: 46, unit: '%' },
        wbc: { min: 4.5, max: 11.0, unit: '×10³/μL' },
        rbc: { min: 4.2, max: 5.4, unit: '×10⁶/μL' },
        platelets: { min: 150, max: 400, unit: '×10³/μL' },
        glucose: { min: 70, max: 100, unit: 'mg/dL' },
        hba1c: { min: 4.0, max: 5.6, unit: '%' }
      };

      const range = ranges[key];
      if (range) {
        const numValue = parseFloat(value);
        const isNormal = numValue >= range.min && numValue <= range.max;
        return {
          value: `${value} ${range.unit}`,
          isNormal,
          status: isNormal ? 'Normal' : 'Abnormal'
        };
      }

      return {
        value: value,
        isNormal: true,
        status: 'Normal'
      };
    };

    const getOverallStatus = (results, testType) => {
      const resultKeys = Object.keys(results);
      let hasAbnormal = false;

      for (const key of resultKeys) {
        const formatted = formatResultValue(key, results[key], testType);
        if (!formatted.isNormal) {
          hasAbnormal = true;
          break;
        }
      }

      return hasAbnormal ? 'Has Abnormal Values' : 'Normal Results';
    };

    return (
      <div className="results-container">
        <div className="results-header">
          <div className="header-content">
            <h2>Test Results</h2>
            <p>View and download your laboratory test results</p>
          </div>
          <div className="results-filters">
            <div className="filter-group">
              <label>Test Type:</label>
              <select 
                className="filter-select"
                value={testTypeFilter}
                onChange={(e) => setTestTypeFilter(e.target.value)}
              >
                <option value="all">All Results</option>
                <option value="blood">Blood Tests</option>
                <option value="urine">Urine Tests</option>
                <option value="xray">X-Ray</option>
                <option value="ultrasound">Ultrasound</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Time Period:</label>
              <select 
                className="filter-select"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select 
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="type">Test Type</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        <div className="results-grid">
          {filteredResults.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📋</div>
              <h3>No Test Results Found</h3>
              <p>No test results match your current filters, or you haven't had any tests yet.</p>
              <button 
                className="btn-book-test"
                onClick={() => handleSectionClick('appointments')}
              >
                Book a Test
              </button>
            </div>
          ) : (
            filteredResults.map((result, index) => (
              <div key={index} className={`result-card ${result.isNew ? 'new' : ''}`}>
                <div className="result-header">
                  <div className="result-status">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                      {result.isNew ? (
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                      ) : (
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    {result.isNew ? 'New Result' : 'Available'}
                  </div>
                  <div className="result-date">{new Date(result.date).toLocaleDateString()}</div>
                </div>
                <div className="result-content">
                  <h4>{result.testType}</h4>
                  <div className="result-summary">
                    {Object.entries(result.results).map(([key, value]) => {
                      const formatted = formatResultValue(key, value, result.testType);
                      return (
                        <div key={key} className="summary-item">
                          <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                          <span className={formatted.isNormal ? 'normal' : 'abnormal'}>
                            {formatted.value} ({formatted.status})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="result-overall">
                    <span className={`overall-status ${getOverallStatus(result.results, result.testType).includes('Normal') ? 'normal' : 'abnormal'}`}>
                      Overall: {getOverallStatus(result.results, result.testType)}
                    </span>
                  </div>
                  {result.technician && (
                    <div className="result-tech">
                      <small>Processed by: {result.technician}</small>
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <button className="btn-view">View Full Report</button>
                  <button className="btn-download">Download PDF</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderMobileService = () => (
    <div className="mobile-service-container">
      <div className="mobile-header">
        <div className="header-content">
          <h2>Mobile Lab Service</h2>
          <p>Community laboratory testing in different barangays across Nueva Vizcaya</p>
        </div>
        <button 
          className="request-service-btn"
          onClick={() => setIsScheduleModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px', marginRight: '8px'}}>
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Check Schedule & Location
        </button>
      </div>

      {/* Service Information */}
      <div className="service-info">
        <div className="info-card">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 17h2m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h4m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2M3 12h1l2-4h12l2 4h1v3a1 1 0 01-1 1h-1m-14 0H4a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 10h2m4 0h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="info-content">
            <h3>What is Mobile Lab Service?</h3>
            <p>Our mobile laboratory unit visits different barangays and public spaces throughout Nueva Vizcaya on scheduled days. Community members can come to the designated location for professional lab testing without traveling to our main facility!</p>
          </div>
        </div>

        <div className="service-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="feature-text">Scheduled Community Visits</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-text">Professional Medical Staff</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="feature-text">Complete Lab Testing</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-text">Covers All Nueva Vizcaya</div>
          </div>
        </div>
      </div>

      {/* Service Schedule */}
      <div className="service-schedule">
        <h3>Weekly Community Visit Schedule</h3>
        <div className="schedule-grid">
          <div className="schedule-card">
            <div className="schedule-day">Monday</div>
            <div className="schedule-location">Bayombong Public Plaza</div>
            <div className="schedule-time">8:00 AM - 12:00 PM</div>
          </div>
          <div className="schedule-card">
            <div className="schedule-day">Tuesday</div>
            <div className="schedule-location">Solano Town Center</div>
            <div className="schedule-time">8:00 AM - 12:00 PM</div>
          </div>
          <div className="schedule-card">
            <div className="schedule-day">Wednesday</div>
            <div className="schedule-location">Bambang Barangay Hall</div>
            <div className="schedule-time">8:00 AM - 12:00 PM</div>
          </div>
          <div className="schedule-card">
            <div className="schedule-day">Thursday</div>
            <div className="schedule-location">Dupax Community Center</div>
            <div className="schedule-time">8:00 AM - 12:00 PM</div>
          </div>
          <div className="schedule-card">
            <div className="schedule-day">Friday</div>
            <div className="schedule-location">Kasibu Municipal Hall</div>
            <div className="schedule-time">8:00 AM - 12:00 PM</div>
          </div>
          <div className="schedule-card weekend">
            <div className="schedule-day">Saturday</div>
            <div className="schedule-location">Special Community Events</div>
            <div className="schedule-time">By Schedule</div>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div className="available-tests">
        <h3>Available Tests</h3>
        <div className="tests-grid">
          <div className="test-category">
            <h4>Blood Tests</h4>
            <ul>
              <li>Complete Blood Count (CBC)</li>
              <li>Blood Sugar/Glucose</li>
              <li>Lipid Profile</li>
              <li>Liver Function Tests</li>
              <li>Kidney Function Tests</li>
            </ul>
          </div>
          <div className="test-category">
            <h4>Urine Tests</h4>
            <ul>
              <li>Urinalysis</li>
              <li>Urine Culture</li>
              <li>24-Hour Urine Collection</li>
              <li>Pregnancy Test</li>
            </ul>
          </div>
          <div className="test-category">
            <h4>Other Services</h4>
            <ul>
              <li>ECG/EKG</li>
              <li>Blood Pressure Monitoring</li>
              <li>Wound Care</li>
              <li>Health Consultations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="contact-info">
        <h3>Mobile Lab Service Information</h3>
        <div className="contact-details">
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="contact-text">Inquiries: +63 912 345 6789</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="contact-text">Check our weekly schedule for locations</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="contact-text">Walk-in available during scheduled hours</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="patient-dashboard-container">
      {/* Sidebar */}
      <div className="patient-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <h2 className="sidebar-title">MDLAB DIRECT</h2>
            <span className="patient-label">Patient Portal</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => handleSectionClick('overview')}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="nav-text">Overview</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => handleSectionClick('appointments')}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="nav-text">Appointments</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'results' ? 'active' : ''}`}
            onClick={() => handleSectionClick('results')}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="nav-text">Test Results</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'mobile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('mobile')}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17h2m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h4m0 0a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2M3 12h1l2-4h12l2 4h1v3a1 1 0 01-1 1h-1m-14 0H4a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
            <span className="nav-text">Mobile Lab</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('profile')}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="nav-text">My Profile</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{currentUser?.firstName?.charAt(0) || currentUser?.username?.charAt(0) || 'P'}</span>
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser?.firstName} {currentUser?.lastName}</span>
              <span className="user-email">{currentUser?.email}</span>
              <span className="user-role">Patient</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="patient-main">
        <div className="patient-header">
          <h1 className="page-title">{renderPageTitle()}</h1>
          <button className="modern-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px', marginRight: '8px'}}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>

        <div className="patient-content">
          {renderContent()}
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
      />
      <MobileLabScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
      
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <div className="logout-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Confirm Logout</h3>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to log out?</p>
              <p className="logout-warning">You will need to log in again to access your account.</p>
            </div>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
