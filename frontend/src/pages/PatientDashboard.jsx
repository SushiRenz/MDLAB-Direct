import React, { useState } from 'react';
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

  const handleSectionClick = (section) => setActiveSection(section);

  const handleLogout = async () => {
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
              <div className="stat-number">3</div>
              <div className="stat-label">Upcoming Appointments</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2</div>
              <div className="stat-label">New Results</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">12</div>
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
            <div className="action-icon">📅</div>
            <div className="action-content">
              <h4>Book Appointment</h4>
              <p>Schedule your next lab test</p>
            </div>
          </div>
          <div className="action-card" onClick={() => handleSectionClick('results')}>
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h4>View Results</h4>
              <p>Check your latest test results</p>
            </div>
          </div>
          <div className="action-card" onClick={() => handleSectionClick('mobile')}>
            <div className="action-icon">🚐</div>
            <div className="action-content">
              <h4>Mobile Lab</h4>
              <p>Check community visit schedule</p>
            </div>
          </div>
          {/* Add this for Profile */}
          <div className="action-card" onClick={() => handleSectionClick('profile')}>
            <div className="action-icon">👤</div>
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
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <div className="activity-title">Blood Test Results Available</div>
              <div className="activity-date">September 2, 2025</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📅</div>
            <div className="activity-content">
              <div className="activity-title">Appointment Scheduled</div>
              <div className="activity-date">August 30, 2025</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🚐</div>
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
          📅 Book New Appointment
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
                <div className="appointment-time">⏰ {appointment.time}</div>
                <div className="appointment-location">📍 {appointment.location}</div>
                <div className="appointment-doctor">👨‍⚕️ {appointment.doctor}</div>
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
              <span className="result-status completed">✅ Results Available</span>
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
              <span className="result-status completed">✅ Results Available</span>
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
              <span className="result-status completed">✅ Results Available</span>
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

  const renderResults = () => (
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
        <div className="result-card new">
          <div className="result-header">
            <div className="result-status">🆕 New Result</div>
            <div className="result-date">September 2, 2025</div>
          </div>
          <div className="result-content">
            <h4>Complete Blood Count (CBC)</h4>
            <div className="result-summary">
              <div className="summary-item">
                <span>White Blood Cells:</span>
                <span className="normal">6,500/µL (Normal)</span>
              </div>
              <div className="summary-item">
                <span>Red Blood Cells:</span>
                <span className="normal">4.2 million/µL (Normal)</span>
              </div>
              <div className="summary-item">
                <span>Hemoglobin:</span>
                <span className="normal">13.8 g/dL (Normal)</span>
              </div>
            </div>
            <div className="result-overall">
              <span className="overall-status normal">✅ Overall: Normal Results</span>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn-view">👁️ View Full Report</button>
            <button className="btn-download">⬇️ Download PDF</button>
          </div>
        </div>

        <div className="result-card">
          <div className="result-header">
            <div className="result-status">📋 Available</div>
            <div className="result-date">August 25, 2025</div>
          </div>
          <div className="result-content">
            <h4>Blood Sugar Test</h4>
            <div className="result-summary">
              <div className="summary-item">
                <span>Fasting Glucose:</span>
                <span className="normal">95 mg/dL (Normal)</span>
              </div>
              <div className="summary-item">
                <span>HbA1c:</span>
                <span className="normal">5.4% (Normal)</span>
              </div>
            </div>
            <div className="result-overall">
              <span className="overall-status normal">✅ Overall: Normal Results</span>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn-view">👁️ View Full Report</button>
            <button className="btn-download">⬇️ Download PDF</button>
          </div>
        </div>

        <div className="result-card">
          <div className="result-header">
            <div className="result-status">📋 Available</div>
            <div className="result-date">August 15, 2025</div>
          </div>
          <div className="result-content">
            <h4>Urinalysis</h4>
            <div className="result-summary">
              <div className="summary-item">
                <span>Specific Gravity:</span>
                <span className="normal">1.020 (Normal)</span>
              </div>
              <div className="summary-item">
                <span>Protein:</span>
                <span className="normal">Negative (Normal)</span>
              </div>
              <div className="summary-item">
                <span>Glucose:</span>
                <span className="normal">Negative (Normal)</span>
              </div>
            </div>
            <div className="result-overall">
              <span className="overall-status normal">✅ Overall: Normal Results</span>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn-view">👁️ View Full Report</button>
            <button className="btn-download">⬇️ Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );

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
          🗓️ Check Schedule & Location
        </button>
      </div>

      {/* Service Information */}
      <div className="service-info">
        <div className="info-card">
          <div className="info-icon">🚐</div>
          <div className="info-content">
            <h3>What is Mobile Lab Service?</h3>
            <p>Our mobile laboratory unit visits different barangays and public spaces throughout Nueva Vizcaya on scheduled days. Community members can come to the designated location for professional lab testing without traveling to our main facility!</p>
          </div>
        </div>

        <div className="service-features">
          <div className="feature-item">
            <div className="feature-icon">📍</div>
            <div className="feature-text">Scheduled Community Visits</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👨‍⚕️</div>
            <div className="feature-text">Professional Medical Staff</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔬</div>
            <div className="feature-text">Complete Lab Testing</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🏘️</div>
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
            <div className="contact-icon">📞</div>
            <div className="contact-text">Inquiries: +63 912 345 6789</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">�</div>
            <div className="contact-text">Check our weekly schedule for locations</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">⏰</div>
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
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Overview</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => handleSectionClick('appointments')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Appointments</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'results' ? 'active' : ''}`}
            onClick={() => handleSectionClick('results')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Test Results</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'mobile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('mobile')}
          >
            <span className="nav-icon">🚐</span>
            <span className="nav-text">Mobile Lab</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('profile')}
          >
            <span className="nav-icon">👤</span>
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
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="patient-main">
        <div className="patient-header">
          <h1 className="page-title">{renderPageTitle()}</h1>
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
    </div>
  );
}

export default PatientDashboard;
