import React, { useState, useEffect } from 'react';
import '../design/ReceptionistDashboard.css';
import { userAPI, financeAPI, servicesAPI } from '../services/api';

function ReceptionistDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('receptionist-dashboard');
  const [appointmentManagementOpen, setAppointmentManagementOpen] = useState(false);
  const [patientServicesOpen, setPatientServicesOpen] = useState(false);
  
  // Receptionist Dashboard Overview State
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    walkInPatients: 0,
    totalPatientsToday: 0,
    recentAppointments: [],
    upcomingAppointments: [],
    popularServices: []
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  
  // Appointment management state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Patient check-in/out state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Services state
  const [services, setServices] = useState([]);
  const [showServiceInfoModal, setShowServiceInfoModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Patient information state
  const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);

  // Walk-in registration state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInData, setWalkInData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    services: [],
    notes: '',
    urgency: 'regular'
  });

  // Bill generation state
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);

  const user = currentUser;

  // Dashboard data fetching for receptionist
  const fetchReceptionistDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      // Fetch appointment statistics for today
      const today = new Date().toISOString().split('T')[0];
      const appointmentStats = await fetchTodayAppointmentStats(today);
      
      // Fetch services statistics  
      const serviceStatsResponse = await servicesAPI.getServiceStats();

      setDashboardStats({
        todayAppointments: appointmentStats?.total || 0,
        pendingAppointments: appointmentStats?.pending || 0,
        completedToday: appointmentStats?.completed || 0,
        walkInPatients: appointmentStats?.walkIn || 0,
        totalPatientsToday: appointmentStats?.totalPatients || 0,
        recentAppointments: appointmentStats?.recent || [],
        upcomingAppointments: appointmentStats?.upcoming || [],
        popularServices: serviceStatsResponse.success ? (serviceStatsResponse.data?.popularServices || []) : []
      });
    } catch (err) {
      console.error('Receptionist dashboard data fetch error:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for demo purposes
      setDashboardStats({
        todayAppointments: 25,
        pendingAppointments: 8,
        completedToday: 17,
        walkInPatients: 6,
        totalPatientsToday: 31,
        recentAppointments: [
          {
            appointmentId: 'APT-2025-001',
            patientName: 'Maria Santos',
            service: 'Complete Blood Count',
            time: '9:00 AM',
            status: 'completed'
          },
          {
            appointmentId: 'APT-2025-002',
            patientName: 'Carlos Rodriguez',
            service: 'X-Ray Chest',
            time: '10:30 AM',
            status: 'in-progress'
          }
        ],
        upcomingAppointments: [
          {
            appointmentId: 'APT-2025-003',
            patientName: 'Ana Dela Cruz',
            service: 'Lipid Profile',
            time: '2:00 PM',
            status: 'confirmed'
          },
          {
            appointmentId: 'APT-2025-004',
            patientName: 'Juan Mendoza',
            service: 'Urinalysis',
            time: '3:30 PM',
            status: 'pending'
          }
        ],
        popularServices: [
          { serviceName: 'Complete Blood Count', count: 12, percentage: 35 },
          { serviceName: 'X-Ray Chest', count: 8, percentage: 23 },
          { serviceName: 'Lipid Profile', count: 6, percentage: 17 }
        ]
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchTodayAppointmentStats = async (date) => {
    // This would normally call an API endpoint for appointment stats
    // For now, return mock data
    return {
      total: 25,
      pending: 8,
      completed: 17,
      walkIn: 6,
      totalPatients: 31,
      recent: [],
      upcoming: []
    };
  };

  // Load dashboard data on component mount
  useEffect(() => {
    if (activeSection === 'receptionist-dashboard') {
      fetchReceptionistDashboardData();
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleAppointmentManagement = () => {
    setAppointmentManagementOpen(!appointmentManagementOpen);
  };

  const togglePatientServices = () => {
    setPatientServicesOpen(!patientServicesOpen);
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call the parent logout function
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      onLogout();
    }
  };

  // Appointment Management Functions
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      
      // This would call your appointment API
      // const data = await appointmentAPI.getAppointments(params);
      
      // Mock data for now
      const mockAppointments = [
        {
          _id: '1',
          appointmentId: 'APT-2025-001',
          patientName: 'Maria Santos',
          contactNumber: '+639123456789',
          email: 'maria.santos@email.com',
          service: 'Complete Blood Count',
          appointmentDate: new Date().toISOString(),
          appointmentTime: '9:00 AM',
          status: 'confirmed',
          notes: 'Regular checkup'
        },
        {
          _id: '2',
          appointmentId: 'APT-2025-002',
          patientName: 'Carlos Rodriguez',
          contactNumber: '+639987654321',
          email: 'carlos.rodriguez@email.com',
          service: 'X-Ray Chest',
          appointmentDate: new Date().toISOString(),
          appointmentTime: '10:30 AM',
          status: 'pending',
          notes: 'Follow-up examination'
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Patient check-in/out functions
  const handleCheckIn = (appointment) => {
    setSelectedPatient(appointment);
    setShowCheckInModal(true);
  };

  const handleCheckOut = (appointment) => {
    setSelectedPatient(appointment);
    setShowCheckOutModal(true);
  };

  const processCheckIn = async () => {
    try {
      // Update appointment status to 'checked-in' - receptionist functionality
      console.log('Receptionist checking in patient:', selectedPatient);
      // API call would go here for receptionist check-in
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === selectedPatient._id 
            ? { 
                ...apt, 
                status: 'checked-in',
                checkedInBy: currentUser.name || 'Receptionist',
                checkedInTime: new Date().toISOString()
              }
            : apt
        )
      );
      
      setShowCheckInModal(false);
      setSelectedPatient(null);
      alert(`Patient ${selectedPatient.patientName} checked in successfully by ${currentUser.name || 'Receptionist'}!`);
      
      // Update dashboard stats
      fetchReceptionistDashboardData();
    } catch (error) {
      console.error('Check-in error:', error);
      setError('Failed to check in patient');
    }
  };

  const processCheckOut = async () => {
    try {
      // Update appointment status to 'completed' - receptionist functionality
      console.log('Receptionist checking out patient:', selectedPatient);
      // API call would go here for receptionist check-out
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === selectedPatient._id 
            ? { 
                ...apt, 
                status: 'completed',
                checkedOutBy: currentUser.name || 'Receptionist',
                checkedOutTime: new Date().toISOString()
              }
            : apt
        )
      );
      
      setShowCheckOutModal(false);
      setSelectedPatient(null);
      alert(`Patient ${selectedPatient.patientName} checked out successfully by ${currentUser.name || 'Receptionist'}!`);
      
      // Update dashboard stats
      fetchReceptionistDashboardData();
    } catch (error) {
      console.error('Check-out error:', error);
      setError('Failed to check out patient');
    }
  };

  // Walk-in registration functions
  const handleWalkInRegistration = () => {
    setShowWalkInModal(true);
  };

  const processWalkInRegistration = async () => {
    try {
      console.log('Registering walk-in patient:', walkInData);
      // API call would go here for receptionist walk-in registration
      
      const newAppointment = {
        _id: Date.now().toString(),
        appointmentId: `WI-${Date.now()}`,
        patientName: walkInData.patientName,
        contactNumber: walkInData.contactNumber,
        email: walkInData.email,
        service: walkInData.services.join(', '),
        appointmentDate: new Date().toISOString(),
        appointmentTime: 'Walk-in',
        status: 'walk-in',
        notes: walkInData.notes,
        urgency: walkInData.urgency,
        registeredBy: currentUser.name || 'Receptionist'
      };
      
      setAppointments(prev => [newAppointment, ...prev]);
      setShowWalkInModal(false);
      setWalkInData({
        patientName: '',
        contactNumber: '',
        email: '',
        services: [],
        notes: '',
        urgency: 'regular'
      });
      alert(`Walk-in patient ${newAppointment.patientName} registered successfully by ${currentUser.name || 'Receptionist'}!`);
      
      // Update dashboard stats
      fetchReceptionistDashboardData();
    } catch (error) {
      console.error('Walk-in registration error:', error);
      setError('Failed to register walk-in patient');
    }
  };

  // Service information functions
  const handleViewServiceInfo = async (serviceName) => {
    try {
      // Fetch service details
      const serviceInfo = {
        serviceName: serviceName,
        description: 'Complete blood count test with differential',
        price: 800,
        duration: '30 minutes',
        preparation: 'No special preparation required',
        sampleType: 'Blood',
        turnaroundTime: '2-4 hours'
      };
      
      setSelectedService(serviceInfo);
      setShowServiceInfoModal(true);
    } catch (error) {
      console.error('Failed to fetch service info:', error);
    }
  };

  // Patient information functions
  const handleViewPatientInfo = async (patientName) => {
    try {
      // Fetch patient details
      const patientDetails = {
        name: patientName,
        email: 'patient@email.com',
        phone: '+639123456789',
        address: '123 Main St, City',
        dateOfBirth: '1990-01-01',
        gender: 'Female',
        emergencyContact: '+639987654321',
        medicalHistory: ['Hypertension', 'Diabetes'],
        lastVisit: '2025-01-15'
      };
      
      setPatientInfo(patientDetails);
      setShowPatientInfoModal(true);
    } catch (error) {
      console.error('Failed to fetch patient info:', error);
    }
  };

  // Bill generation functions - limited for receptionist
  const handleGenerateBill = (appointment) => {
    // Receptionists can view and generate basic billing information
    const bill = {
      appointmentId: appointment.appointmentId,
      patientName: appointment.patientName,
      service: appointment.service,
      amount: 800, // This would come from service pricing
      date: new Date().toLocaleDateString(),
      status: 'pending',
      generatedBy: currentUser.name || 'Receptionist',
      notes: 'Bill generated by receptionist for patient convenience'
    };
    
    setBillData(bill);
    setShowBillModal(true);
    console.log('Receptionist generated bill for:', appointment.patientName);
  };

  // Effect to fetch appointments when section changes
  useEffect(() => {
    if (activeSection === 'appointments') {
      fetchAppointments();
    }
  }, [activeSection, searchTerm, filterStatus, filterDate]);

  return (
    <div className="receptionist-dashboard-container">
      {/* Sidebar */}
      <div className="receptionist-dashboard-sidebar">
        <div className="receptionist-sidebar-header">
          <h2 className="receptionist-sidebar-title">RECEPTIONIST PORTAL</h2>
        </div>
        
        <nav className="receptionist-sidebar-nav">
          <div
            className={`receptionist-nav-item ${activeSection === 'receptionist-dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('receptionist-dashboard')}
          >
            <span className="receptionist-nav-text">Dashboard</span>
          </div>

          <div className="receptionist-dropdown">
            <div className="receptionist-nav-item-header" onClick={toggleAppointmentManagement}>
              <div className="receptionist-nav-item-main">
                <span className="receptionist-nav-text">Appointments</span>
              </div>
              <span className={`receptionist-dropdown-arrow ${appointmentManagementOpen ? 'open' : ''}`}>▼</span>
            </div>
            {appointmentManagementOpen && (
              <div className="receptionist-nav-submenu">
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'appointments' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('appointments')}
                >
                  View Appointments
                </div>
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'schedule-appointment' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('schedule-appointment')}
                >
                  Schedule Appointment
                </div>
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'walk-in-registration' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('walk-in-registration')}
                >
                  Walk-in Registration
                </div>
              </div>
            )}
          </div>

          <div className="receptionist-dropdown">
            <div className="receptionist-nav-item-header" onClick={togglePatientServices}>
              <div className="receptionist-nav-item-main">
                <span className="receptionist-nav-text">Patient Services</span>
              </div>
              <span className={`receptionist-dropdown-arrow ${patientServicesOpen ? 'open' : ''}`}>▼</span>
            </div>
            {patientServicesOpen && (
              <div className="receptionist-nav-submenu">
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'check-in-out' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('check-in-out')}
                >
                  Check-In/Check-Out
                </div>
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'patient-information' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('patient-information')}
                >
                  Patient Information
                </div>
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'service-information' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('service-information')}
                >
                  Service Information
                </div>
              </div>
            )}
          </div>

          <div
            className={`receptionist-nav-item ${activeSection === 'billing-support' ? 'active' : ''}`}
            onClick={() => handleSectionClick('billing-support')}
          >
            <span className="receptionist-nav-text">Billing Support</span>
          </div>
        </nav>

        <div className="receptionist-sidebar-footer">
          <div className="receptionist-user-info">
            <div className="receptionist-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div className="receptionist-user-details">
              <div className="receptionist-user-role">Receptionist</div>
              <div className="receptionist-user-email">{user?.email || 'receptionist@mdlab.com'}</div>
            </div>
            <button className="receptionist-logout-btn" onClick={handleLogout}>
              ⏻
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="receptionist-dashboard-main">
        <div className="receptionist-dashboard-header">
          <h1 className="receptionist-page-title">
            {activeSection === 'receptionist-dashboard' && 'Dashboard'}
            {activeSection === 'appointments' && 'Appointment Management'}
            {activeSection === 'schedule-appointment' && 'Schedule New Appointment'}
            {activeSection === 'walk-in-registration' && 'Walk-in Registration'}
            {activeSection === 'check-in-out' && 'Patient Check-In/Check-Out'}
            {activeSection === 'patient-information' && 'Patient Information'}
            {activeSection === 'service-information' && 'Service Information'}
            {activeSection === 'billing-support' && 'Billing Support'}
          </h1>
        </div>

        <div className="receptionist-dashboard-content">
          {/* Dashboard Overview */}
          {activeSection === 'receptionist-dashboard' && (
            <>
              {dashboardLoading ? (
                <div className="receptionist-loading">Loading dashboard data...</div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="receptionist-stats-grid">
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Today's Appointments</div>
                        <div className="receptionist-stat-value">{dashboardStats.todayAppointments}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Pending Appointments</div>
                        <div className="receptionist-stat-value">{dashboardStats.pendingAppointments}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Completed Today</div>
                        <div className="receptionist-stat-value">{dashboardStats.completedToday}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Walk-in Patients</div>
                        <div className="receptionist-stat-value">{dashboardStats.walkInPatients}</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="receptionist-middle-grid">
                    <div className="receptionist-chart-card">
                      <div className="receptionist-card-header">
                        <h3>Upcoming Appointments</h3>
                      </div>
                      <div className="receptionist-card-content">
                        {dashboardStats.upcomingAppointments.length === 0 ? (
                          <div className="receptionist-empty-state">
                            <p>No upcoming appointments</p>
                          </div>
                        ) : (
                          <div className="receptionist-appointment-list">
                            {dashboardStats.upcomingAppointments.map((appointment, index) => (
                              <div key={index} className="receptionist-appointment-item">
                                <div className="receptionist-appointment-time">{appointment.time}</div>
                                <div className="receptionist-appointment-details">
                                  <div className="receptionist-appointment-patient">{appointment.patientName}</div>
                                  <div className="receptionist-appointment-service">{appointment.service}</div>
                                </div>
                                <div className={`receptionist-appointment-status ${appointment.status}`}>
                                  {appointment.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="receptionist-info-card">
                      <div className="receptionist-card-header">
                        <h3>Popular Services Today</h3>
                      </div>
                      <div className="receptionist-card-content">
                        {dashboardStats.popularServices.map((service, index) => (
                          <div key={index} className="receptionist-overview-item">
                            <div className="receptionist-overview-label">{service.serviceName}</div>
                            <div className="receptionist-overview-value">{service.count} ({service.percentage}%)</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="receptionist-bottom-grid">
                    <div className="receptionist-quick-access-card">
                      <div className="receptionist-card-header">
                        <h3>Quick Actions</h3>
                      </div>
                      <div className="receptionist-quick-access-content">
                        <button className="receptionist-quick-btn" onClick={() => handleSectionClick('schedule-appointment')}>
                          Schedule Appointment
                        </button>
                        <button className="receptionist-quick-btn" onClick={handleWalkInRegistration}>
                          Register Walk-in
                        </button>
                        <button className="receptionist-quick-btn" onClick={() => handleSectionClick('check-in-out')}>
                          Patient Check-In
                        </button>
                        <button className="receptionist-quick-btn" onClick={() => handleSectionClick('service-information')}>
                          Service Info
                        </button>
                      </div>
                    </div>

                    <div className="receptionist-activity-card">
                      <div className="receptionist-card-header">
                        <h3>Today's Summary</h3>
                      </div>
                      <div className="receptionist-activity-stats">
                        <div className="receptionist-stat-item">
                          <div className="receptionist-stat-label">Total Patients</div>
                          <div className="receptionist-stat-value">{dashboardStats.totalPatientsToday}</div>
                        </div>
                        <div className="receptionist-stat-item">
                          <div className="receptionist-stat-label">Completed</div>
                          <div className="receptionist-stat-value">{dashboardStats.completedToday}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Appointment Management Section */}
          {activeSection === 'appointments' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Appointment Management</h2>
                  <p>View and manage patient appointments</p>
                </div>
                <button className="receptionist-add-btn" onClick={() => handleSectionClick('schedule-appointment')}>
                  + Schedule Appointment
                </button>
              </div>

              <div className="receptionist-search-filter">
                <input
                  type="text"
                  placeholder="Search appointments..."
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
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="receptionist-date-filter"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="receptionist-management-content">
                <div className="receptionist-data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Appointment ID</th>
                        <th>Patient Name</th>
                        <th>Service</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6">Loading appointments...</td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td colSpan="6">No appointments found</td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>{appointment.appointmentId}</td>
                            <td>{appointment.patientName}</td>
                            <td>{appointment.service}</td>
                            <td>
                              {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.appointmentTime}
                            </td>
                            <td>
                              <span className={`receptionist-status ${appointment.status}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <div className="receptionist-action-buttons">
                                <button 
                                  className="receptionist-btn-view" 
                                  onClick={() => handleViewPatientInfo(appointment.patientName)}
                                >
                                  View
                                </button>
                                {appointment.status === 'confirmed' && (
                                  <button 
                                    className="receptionist-btn-checkin" 
                                    onClick={() => handleCheckIn(appointment)}
                                  >
                                    Check In
                                  </button>
                                )}
                                {appointment.status === 'checked-in' && (
                                  <button 
                                    className="receptionist-btn-checkout" 
                                    onClick={() => handleCheckOut(appointment)}
                                  >
                                    Check Out
                                  </button>
                                )}
                                <button 
                                  className="receptionist-btn-bill" 
                                  onClick={() => handleGenerateBill(appointment)}
                                >
                                  Bill
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
            </div>
          )}

          {/* Other sections tailored for receptionist */}
          {activeSection === 'schedule-appointment' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Schedule New Appointment</h2>
                  <p>Book appointments for patients - Receptionist Portal</p>
                </div>
              </div>
              <div className="receptionist-form-container">
                <p>Receptionist appointment scheduling form would go here...</p>
                <div className="receptionist-quick-actions">
                  <button className="receptionist-btn-primary">Schedule Regular Appointment</button>
                  <button className="receptionist-btn-secondary">Schedule Follow-up</button>
                  <button className="receptionist-btn-secondary">Schedule Group Appointment</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'walk-in-registration' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Walk-in Registration</h2>
                  <p>Register walk-in patients quickly - Receptionist Function</p>
                </div>
              </div>
              <div className="receptionist-form-container">
                <button className="receptionist-add-btn" onClick={handleWalkInRegistration}>
                  + Register Walk-in Patient
                </button>
                <div className="receptionist-info-box">
                  <h4>Walk-in Registration Guidelines:</h4>
                  <ul>
                    <li>Collect basic patient information</li>
                    <li>Verify insurance or payment method</li>
                    <li>Assign urgency level based on condition</li>
                    <li>Notify medical staff of walk-in arrival</li>
                    <li>Generate temporary patient ID if new</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'check-in-out' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Patient Check-In/Check-Out</h2>
                  <p>Manage patient arrivals and departures - Receptionist Central Function</p>
                </div>
              </div>
              <div className="receptionist-management-content">
                <div className="receptionist-checkin-stats">
                  <div className="receptionist-stat-card">
                    <div className="receptionist-stat-info">
                      <div className="receptionist-stat-label">Patients Waiting</div>
                      <div className="receptionist-stat-value">{appointments.filter(apt => apt.status === 'checked-in').length}</div>
                    </div>
                  </div>
                  <div className="receptionist-stat-card">
                    <div className="receptionist-stat-info">
                      <div className="receptionist-stat-label">Ready for Check-in</div>
                      <div className="receptionist-stat-value">{appointments.filter(apt => apt.status === 'confirmed').length}</div>
                    </div>
                  </div>
                </div>
                <div className="receptionist-patient-queue">
                  <h4>Today's Patient Queue</h4>
                  {appointments.length === 0 ? (
                    <p>No patients scheduled for today</p>
                  ) : (
                    <div className="receptionist-queue-list">
                      {appointments.map((appointment) => (
                        <div key={appointment._id} className="receptionist-queue-item">
                          <div className="receptionist-patient-info">
                            <strong>{appointment.patientName}</strong>
                            <span>{appointment.service} - {appointment.appointmentTime}</span>
                          </div>
                          <div className="receptionist-queue-actions">
                            {appointment.status === 'confirmed' && (
                              <button 
                                className="receptionist-btn-checkin" 
                                onClick={() => handleCheckIn(appointment)}
                              >
                                Check In
                              </button>
                            )}
                            {appointment.status === 'checked-in' && (
                              <button 
                                className="receptionist-btn-checkout" 
                                onClick={() => handleCheckOut(appointment)}
                              >
                                Check Out
                              </button>
                            )}
                            <span className={`receptionist-status ${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'patient-information' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Patient Information</h2>
                  <p>View patient details and history - Receptionist Access</p>
                </div>
              </div>
              <div className="receptionist-form-container">
                <div className="receptionist-search-patient">
                  <input 
                    type="text" 
                    placeholder="Search patient by name, phone, or email..." 
                    className="receptionist-search-input"
                  />
                  <button className="receptionist-btn-primary">Search Patient</button>
                </div>
                <div className="receptionist-patient-actions">
                  <button className="receptionist-btn-secondary">View Patient History</button>
                  <button className="receptionist-btn-secondary">Update Contact Info</button>
                  <button className="receptionist-btn-secondary">Schedule Follow-up</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'service-information' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Service Information</h2>
                  <p>Laboratory services reference for patient inquiries</p>
                </div>
              </div>
              <div className="receptionist-services-grid">
                <div className="receptionist-service-category">
                  <h4>Hematology Tests</h4>
                  <ul>
                    <li onClick={() => handleViewServiceInfo('Complete Blood Count')}>Complete Blood Count - ₱800</li>
                    <li onClick={() => handleViewServiceInfo('Platelet Count')}>Platelet Count - ₱500</li>
                    <li onClick={() => handleViewServiceInfo('Blood Typing')}>Blood Typing - ₱400</li>
                  </ul>
                </div>
                <div className="receptionist-service-category">
                  <h4>Chemistry Tests</h4>
                  <ul>
                    <li onClick={() => handleViewServiceInfo('Lipid Profile')}>Lipid Profile - ₱1,500</li>
                    <li onClick={() => handleViewServiceInfo('Blood Sugar')}>Blood Sugar - ₱300</li>
                    <li onClick={() => handleViewServiceInfo('Liver Function')}>Liver Function - ₱2,000</li>
                  </ul>
                </div>
                <div className="receptionist-service-category">
                  <h4>Radiology</h4>
                  <ul>
                    <li onClick={() => handleViewServiceInfo('Chest X-Ray')}>Chest X-Ray - ₱1,200</li>
                    <li onClick={() => handleViewServiceInfo('Ultrasound')}>Ultrasound - ₱2,500</li>
                    <li onClick={() => handleViewServiceInfo('CT Scan')}>CT Scan - ₱8,000</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'billing-support' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Billing Support</h2>
                  <p>Assist patients with billing inquiries - Limited Access</p>
                </div>
              </div>
              <div className="receptionist-billing-tools">
                <div className="receptionist-billing-card">
                  <h4>Generate Bill Estimate</h4>
                  <p>Help patients estimate costs for services</p>
                  <button className="receptionist-btn-secondary">Calculate Estimate</button>
                </div>
                <div className="receptionist-billing-card">
                  <h4>Payment Information</h4>
                  <p>Provide payment method and policy information</p>
                  <button className="receptionist-btn-secondary">View Payment Options</button>
                </div>
                <div className="receptionist-billing-card">
                  <h4>Insurance Verification</h4>
                  <p>Basic insurance verification for patients</p>
                  <button className="receptionist-btn-secondary">Check Coverage</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals would go here - Check In, Check Out, Walk-in Registration, etc. */}
      {/* For brevity, I'm not including all modal implementations */}
    </div>
  );
}

export default ReceptionistDashboard;