import React, { useState, useEffect } from 'react';
import '../design/ReceptionistDashboard.css';
import { userAPI, financeAPI, servicesAPI, appointmentAPI } from '../services/api';

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

  // Schedule appointment state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentType, setAppointmentType] = useState('scheduled'); // 'scheduled', 'follow-up', 'walk-in'
  const [scheduleData, setScheduleData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    serviceId: '',
    serviceName: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    reasonForVisit: '',
    followUpFor: '', // For follow-up appointments
    groupSize: 1, // For group appointments
    groupMembers: [] // For group appointments
  });

  const user = currentUser;

  // Dashboard data fetching for receptionist
  const fetchReceptionistDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      // Fetch appointment statistics for today
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching appointment stats for:', today);
      
      const appointmentStatsResponse = await appointmentAPI.getAppointmentStats(today, 'day');
      console.log('Appointment stats response:', appointmentStatsResponse);

      if (appointmentStatsResponse.success) {
        const stats = appointmentStatsResponse.data;
        console.log('Processing stats:', stats);
        
        setDashboardStats({
          todayAppointments: stats.total || 0,
          pendingAppointments: stats.pending || 0,
          completedToday: stats.completed || 0,
          walkInPatients: stats.walkIn || 0,
          totalPatientsToday: stats.total || 0,
          recentAppointments: stats.recent ? stats.recent.slice(0, 5).map(apt => ({
            appointmentId: apt._id || apt.appointmentId,
            patientName: apt.patientName || apt.patient?.name || 'Unknown Patient',
            service: apt.serviceName || apt.service?.serviceName || 'Unknown Service',
            time: apt.appointmentTime,
            status: apt.status
          })) : [],
          upcomingAppointments: stats.upcoming ? stats.upcoming.slice(0, 5).map(apt => ({
            appointmentId: apt._id || apt.appointmentId,
            patientName: apt.patientName || apt.patient?.name || 'Unknown Patient', 
            service: apt.serviceName || apt.service?.serviceName || 'Unknown Service',
            time: apt.appointmentTime,
            status: apt.status
          })) : [],
          popularServices: []
        });
        
        console.log('Dashboard stats set successfully');
      } else {
        throw new Error(appointmentStatsResponse.message || 'Failed to load appointment data');
      }
    } catch (err) {
      console.error('Receptionist dashboard data fetch error:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for demo purposes - but try to keep it minimal since we want real data
      setDashboardStats({
        todayAppointments: 0,
        pendingAppointments: 0,
        completedToday: 0,
        walkInPatients: 0,
        totalPatientsToday: 0,
        recentAppointments: [],
        upcomingAppointments: [],
        popularServices: []
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Appointment Management Functions
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.patientName = searchTerm;
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.appointmentDate = filterDate;
      
      console.log('Fetching appointments with params:', params);
      const response = await appointmentAPI.getAppointments(params);
      console.log('Appointments response:', response);
      
      if (response.success) {
        setAppointments(response.data || []);
        console.log('Appointments loaded:', response.data?.length || 0, 'appointments');
      } else {
        throw new Error(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
      setError(err.message || 'Failed to fetch appointments');
      
      // Set empty array instead of mock data to show real situation
      setAppointments([]);
    } finally {
      setLoading(false);
    }
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
      const response = await appointmentAPI.checkInPatient(selectedPatient._id);
      
      if (response.success) {
        // Update local state with the response data
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === selectedPatient._id 
              ? { ...response.data }
              : apt
          )
        );
        
        setShowCheckInModal(false);
        setSelectedPatient(null);
        alert(`Patient ${selectedPatient.patientName} checked in successfully by ${currentUser.name || 'Receptionist'}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to check in patient');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setError('Failed to check in patient: ' + error.message);
      alert('Failed to check in patient: ' + error.message);
    }
  };

  const processCheckOut = async () => {
    try {
      const response = await appointmentAPI.checkOutPatient(selectedPatient._id, 'completed');
      
      if (response.success) {
        // Update local state with the response data
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === selectedPatient._id 
              ? { ...response.data }
              : apt
          )
        );
        
        setShowCheckOutModal(false);
        setSelectedPatient(null);
        alert(`Patient ${selectedPatient.patientName} checked out successfully by ${currentUser.name || 'Receptionist'}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to check out patient');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setError('Failed to check out patient: ' + error.message);
      alert('Failed to check out patient: ' + error.message);
    }
  };

  // Walk-in registration functions
  const handleWalkInRegistration = () => {
    setShowWalkInModal(true);
  };

  const processWalkInRegistration = async () => {
    try {
      // Get the service ID - for demo, we'll use a mock service ID
      // In real implementation, this would come from a service selection
      const mockServiceId = '507f1f77bcf86cd799439011'; // Replace with actual service selection
      
      const walkInAppointmentData = {
        patientName: walkInData.patientName,
        contactNumber: walkInData.contactNumber,
        email: walkInData.email,
        serviceId: mockServiceId,
        serviceName: walkInData.services.join(', ') || 'Walk-in Service',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: 'Walk-in',
        type: 'walk-in',
        priority: walkInData.urgency,
        notes: walkInData.notes,
        reasonForVisit: 'Walk-in patient registration'
      };

      const response = await appointmentAPI.createAppointment(walkInAppointmentData);
      
      if (response.success) {
        // Update local appointments list
        setAppointments(prev => [response.data, ...prev]);
        
        setShowWalkInModal(false);
        setWalkInData({
          patientName: '',
          contactNumber: '',
          email: '',
          services: [],
          notes: '',
          urgency: 'regular'
        });
        
        alert(`Walk-in patient ${response.data.patientName} registered successfully by ${currentUser.name || 'Receptionist'}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to register walk-in patient');
      }
    } catch (error) {
      console.error('Walk-in registration error:', error);
      setError('Failed to register walk-in patient: ' + error.message);
      alert('Failed to register walk-in patient: ' + error.message);
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

  // Validate appointment form data
  const validateAppointmentForm = () => {
    const errors = [];

    // Required field validation
    if (!scheduleData.patientName.trim()) {
      errors.push('Patient name is required');
    }
    
    if (!scheduleData.contactNumber.trim()) {
      errors.push('Contact number is required');
    } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(scheduleData.contactNumber)) {
      errors.push('Please enter a valid contact number');
    }
    
    if (!scheduleData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(scheduleData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!scheduleData.serviceId) {
      errors.push('Please select a service');
    }
    
    if (!scheduleData.appointmentDate) {
      errors.push('Appointment date is required');
    } else {
      const selectedDate = new Date(scheduleData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push('Appointment date cannot be in the past');
      }
    }
    
    if (!scheduleData.appointmentTime) {
      errors.push('Please select an appointment time slot');
    }
    
    if (!scheduleData.reasonForVisit.trim()) {
      errors.push('Reason for visit is required');
    }

    // Appointment type specific validation
    if (appointmentType === 'group' && scheduleData.groupSize < 1) {
      errors.push('Group size must be at least 1');
    }

    return errors;
  };

  // Handle appointment form submission
  const handleScheduleSubmit = async () => {
    try {
      // Validate form
      const validationErrors = validateAppointmentForm();
      if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
        return;
      }

      // Prepare appointment data based on type
      const appointmentData = {
        patientId: null, // Explicitly null for walk-in patients
        patientName: scheduleData.patientName,
        contactNumber: scheduleData.contactNumber,
        email: scheduleData.email,
        serviceId: scheduleData.serviceId,
        serviceName: scheduleData.serviceName,
        appointmentDate: scheduleData.appointmentDate,
        appointmentTime: scheduleData.appointmentTime,
        type: appointmentType, // 'scheduled', 'follow-up', 'walk-in', 'emergency'
        priority: 'regular', // Default priority
        notes: scheduleData.notes,
        reasonForVisit: scheduleData.reasonForVisit,
        receptionistNotes: `Scheduled via receptionist portal by ${user.name || user.email || 'Receptionist'}`
      };

      // Add type-specific data
      if (appointmentType === 'follow-up' && scheduleData.followUpFor) {
        appointmentData.followUpFor = scheduleData.followUpFor;
      }
      
      if (appointmentType === 'group') {
        appointmentData.groupSize = scheduleData.groupSize;
        appointmentData.groupMembers = scheduleData.groupMembers;
      }

      const response = await appointmentAPI.createAppointment(appointmentData);
      
      if (response.success) {
        // Update local appointments list
        setAppointments(prev => [response.data, ...prev]);
        
        setShowScheduleModal(false);
        setScheduleData({
          patientName: '',
          contactNumber: '',
          email: '',
          serviceId: '',
          serviceName: '',
          appointmentDate: '',
          appointmentTime: '',
          notes: '',
          reasonForVisit: '',
          followUpFor: '',
          groupSize: 1,
          groupMembers: []
        });
        setError(''); // Clear any previous errors
        
        alert(`${appointmentType === 'scheduled' ? 'Scheduled' : appointmentType === 'follow-up' ? 'Follow-up' : appointmentType === 'walk-in' ? 'Walk-in' : 'Emergency'} appointment scheduled successfully for ${response.data.patientName}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        // Handle API response with errors
        let errorMessage = response.message || 'Failed to schedule appointment';
        
        if (response.errors && Array.isArray(response.errors)) {
          const validationErrors = response.errors.map(err => err.msg || err.message || err).join('\n');
          errorMessage = `Validation failed:\n${validationErrors}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Schedule appointment error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to schedule appointment';
      
      // Check if it's a validation error with specific errors array
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError('Failed to schedule appointment: ' + errorMessage);
      alert('Failed to schedule appointment:\n' + errorMessage);
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

  // Schedule appointment functions
  const handleScheduleAppointment = () => {
    setShowScheduleModal(true);
  };

  const processScheduleAppointment = async () => {
    try {
      if (!scheduleData.patientName || !scheduleData.contactNumber || !scheduleData.email || 
          !scheduleData.serviceId || !scheduleData.appointmentDate || !scheduleData.appointmentTime) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await appointmentAPI.createAppointment({
        patientName: scheduleData.patientName,
        contactNumber: scheduleData.contactNumber,
        email: scheduleData.email,
        serviceId: scheduleData.serviceId,
        serviceName: scheduleData.serviceName,
        appointmentDate: scheduleData.appointmentDate,
        appointmentTime: scheduleData.appointmentTime,
        type: 'scheduled',
        priority: scheduleData.priority,
        notes: scheduleData.notes,
        reasonForVisit: scheduleData.reasonForVisit
      });
      
      if (response.success) {
        // Update local appointments list
        setAppointments(prev => [response.data, ...prev]);
        
        setShowScheduleModal(false);
        setScheduleData({
          patientName: '',
          contactNumber: '',
          email: '',
          serviceId: '',
          serviceName: '',
          appointmentDate: '',
          appointmentTime: '',
          priority: 'regular',
          notes: '',
          reasonForVisit: ''
        });
        
        alert(`Appointment scheduled successfully for ${response.data.patientName}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Schedule appointment error:', error);
      setError('Failed to schedule appointment: ' + error.message);
      alert('Failed to schedule appointment: ' + error.message);
    }
  };

  // Load services for dropdown
  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServices();
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    }
  };

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

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
                        <button className="receptionist-quick-btn" onClick={handleScheduleAppointment}>
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
                <button className="receptionist-add-btn" onClick={handleScheduleAppointment}>
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
                            <td>{appointment.serviceName}</td>
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
                            <span>{appointment.serviceName} - {appointment.appointmentTime}</span>
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

      {/* Modals */}
      
      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="receptionist-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Schedule New Appointment</h3>
              <button className="receptionist-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  value={scheduleData.patientName}
                  onChange={(e) => setScheduleData({...scheduleData, patientName: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    value={scheduleData.contactNumber}
                    onChange={(e) => setScheduleData({...scheduleData, contactNumber: e.target.value})}
                    placeholder="+639XXXXXXXXX"
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={scheduleData.email}
                    onChange={(e) => setScheduleData({...scheduleData, email: e.target.value})}
                    placeholder="patient@email.com"
                  />
                </div>
              </div>
              <div className="receptionist-form-group">
                <label>Service *</label>
                <select
                  value={scheduleData.serviceId}
                  onChange={(e) => {
                    const selectedService = services.find(s => s._id === e.target.value);
                    setScheduleData({
                      ...scheduleData, 
                      serviceId: e.target.value,
                      serviceName: selectedService?.serviceName || ''
                    });
                  }}
                >
                  <option value="">Select Service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.serviceName} - ₱{service.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    value={scheduleData.appointmentDate}
                    onChange={(e) => setScheduleData({...scheduleData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Appointment Time *</label>
                  <select
                    value={scheduleData.appointmentTime}
                    onChange={(e) => setScheduleData({...scheduleData, appointmentTime: e.target.value})}
                  >
                    <option value="">Select Time</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="receptionist-form-group">
                <label>Priority</label>
                <select
                  value={scheduleData.priority}
                  onChange={(e) => setScheduleData({...scheduleData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="regular">Regular</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="receptionist-form-group">
                <label>Reason for Visit</label>
                <input
                  type="text"
                  value={scheduleData.reasonForVisit}
                  onChange={(e) => setScheduleData({...scheduleData, reasonForVisit: e.target.value})}
                  placeholder="Brief description"
                />
              </div>
              <div className="receptionist-form-group">
                <label>Notes</label>
                <textarea
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </button>
              <button className="receptionist-btn-primary" onClick={processScheduleAppointment}>
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Registration Modal */}
      {showWalkInModal && (
        <div className="receptionist-modal-overlay" onClick={() => setShowWalkInModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Walk-in Patient Registration</h3>
              <button className="receptionist-modal-close" onClick={() => setShowWalkInModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData({...walkInData, patientName: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    value={walkInData.contactNumber}
                    onChange={(e) => setWalkInData({...walkInData, contactNumber: e.target.value})}
                    placeholder="+639XXXXXXXXX"
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={walkInData.email}
                    onChange={(e) => setWalkInData({...walkInData, email: e.target.value})}
                    placeholder="patient@email.com"
                  />
                </div>
              </div>
              <div className="receptionist-form-group">
                <label>Services Required</label>
                <textarea
                  value={walkInData.services.join(', ')}
                  onChange={(e) => setWalkInData({...walkInData, services: e.target.value.split(', ').filter(s => s)})}
                  placeholder="List services needed (comma separated)"
                  rows="2"
                />
              </div>
              <div className="receptionist-form-group">
                <label>Urgency</label>
                <select
                  value={walkInData.urgency}
                  onChange={(e) => setWalkInData({...walkInData, urgency: e.target.value})}
                >
                  <option value="regular">Regular</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="receptionist-form-group">
                <label>Notes</label>
                <textarea
                  value={walkInData.notes}
                  onChange={(e) => setWalkInData({...walkInData, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowWalkInModal(false)}>
                Cancel
              </button>
              <button className="receptionist-btn-primary" onClick={processWalkInRegistration}>
                Register Walk-in Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Confirmation Modal */}
      {showCheckInModal && selectedPatient && (
        <div className="receptionist-modal-overlay" onClick={() => setShowCheckInModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Check-in Patient</h3>
              <button className="receptionist-modal-close" onClick={() => setShowCheckInModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <p>Are you sure you want to check in the following patient?</p>
              <div className="receptionist-patient-details">
                <p><strong>Patient:</strong> {selectedPatient.patientName}</p>
                <p><strong>Service:</strong> {selectedPatient.serviceName}</p>
                <p><strong>Time:</strong> {selectedPatient.appointmentTime}</p>
                <p><strong>Appointment ID:</strong> {selectedPatient.appointmentId}</p>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowCheckInModal(false)}>
                Cancel
              </button>
              <button className="receptionist-btn-primary" onClick={processCheckIn}>
                Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Confirmation Modal */}
      {showCheckOutModal && selectedPatient && (
        <div className="receptionist-modal-overlay" onClick={() => setShowCheckOutModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Check-out Patient</h3>
              <button className="receptionist-modal-close" onClick={() => setShowCheckOutModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <p>Are you sure you want to check out the following patient?</p>
              <div className="receptionist-patient-details">
                <p><strong>Patient:</strong> {selectedPatient.patientName}</p>
                <p><strong>Service:</strong> {selectedPatient.serviceName}</p>
                <p><strong>Time:</strong> {selectedPatient.appointmentTime}</p>
                <p><strong>Appointment ID:</strong> {selectedPatient.appointmentId}</p>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowCheckOutModal(false)}>
                Cancel
              </button>
              <button className="receptionist-btn-primary" onClick={processCheckOut}>
                Confirm Check-out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Information Modal */}
      {showServiceInfoModal && selectedService && (
        <div className="receptionist-modal-overlay" onClick={() => setShowServiceInfoModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Service Information</h3>
              <button className="receptionist-modal-close" onClick={() => setShowServiceInfoModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-service-details">
                <h4>{selectedService.serviceName}</h4>
                <p><strong>Price:</strong> ₱{selectedService.price}</p>
                <p><strong>Description:</strong> {selectedService.description}</p>
                <p><strong>Duration:</strong> {selectedService.duration}</p>
                <p><strong>Preparation:</strong> {selectedService.preparation}</p>
                <p><strong>Sample Type:</strong> {selectedService.sampleType}</p>
                <p><strong>Turnaround Time:</strong> {selectedService.turnaroundTime}</p>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-primary" onClick={() => setShowServiceInfoModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information Modal */}
      {showPatientInfoModal && patientInfo && (
        <div className="receptionist-modal-overlay" onClick={() => setShowPatientInfoModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Patient Information</h3>
              <button className="receptionist-modal-close" onClick={() => setShowPatientInfoModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-patient-details">
                <h4>{patientInfo.name}</h4>
                <p><strong>Email:</strong> {patientInfo.email}</p>
                <p><strong>Phone:</strong> {patientInfo.phone}</p>
                <p><strong>Address:</strong> {patientInfo.address}</p>
                <p><strong>Date of Birth:</strong> {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Gender:</strong> {patientInfo.gender}</p>
                <p><strong>Emergency Contact:</strong> {patientInfo.emergencyContact}</p>
                <p><strong>Last Visit:</strong> {new Date(patientInfo.lastVisit).toLocaleDateString()}</p>
                <div>
                  <strong>Medical History:</strong>
                  <ul>
                    {patientInfo.medicalHistory.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-primary" onClick={() => setShowPatientInfoModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Scheduling Modal */}
      {showScheduleModal && (
        <div className="receptionist-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="receptionist-modal-content receptionist-large-modal" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Schedule {appointmentType === 'scheduled' ? 'Scheduled' : appointmentType === 'follow-up' ? 'Follow-up' : appointmentType === 'walk-in' ? 'Walk-in' : 'Emergency'} Appointment</h3>
              <button className="receptionist-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              
              {/* Patient Details for Walk-in */}
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    value={scheduleData.patientName}
                    onChange={(e) => setScheduleData({...scheduleData, patientName: e.target.value})}
                    placeholder="Enter patient name"
                    required
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    value={scheduleData.contactNumber}
                    onChange={(e) => setScheduleData({...scheduleData, contactNumber: e.target.value})}
                    placeholder="+639XXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="receptionist-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={scheduleData.email}
                  onChange={(e) => setScheduleData({...scheduleData, email: e.target.value})}
                  placeholder="patient@email.com"
                  required
                />
              </div>

              {/* Service Selection */}
              <div className="receptionist-form-group">
                <label>Service *</label>
                <select
                  value={scheduleData.serviceId}
                  onChange={(e) => {
                    const selectedService = services.find(s => s._id === e.target.value);
                    setScheduleData({
                      ...scheduleData,
                      serviceId: e.target.value,
                      serviceName: selectedService ? selectedService.serviceName : ''
                    });
                  }}
                  required
                >
                  <option value="">Select a service...</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.serviceName} - ₱{service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    value={scheduleData.appointmentDate}
                    onChange={(e) => setScheduleData({...scheduleData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Appointment Time *</label>
                  <select
                    value={scheduleData.appointmentTime}
                    onChange={(e) => setScheduleData({...scheduleData, appointmentTime: e.target.value})}
                    required
                  >
                    <option value="">Select time slot...</option>
                    <option value="7:00 AM - 10:00 AM">7:00 AM - 10:00 AM (Morning - Fasting Tests)</option>
                    <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM (Afternoon - After Lunch)</option>
                  </select>
                </div>
              </div>

              {/* Follow-up specific fields */}
              {appointmentType === 'follow-up' && (
                <div className="receptionist-form-group">
                  <label>Follow-up for (Previous Appointment ID)</label>
                  <input
                    type="text"
                    value={scheduleData.followUpFor}
                    onChange={(e) => setScheduleData({...scheduleData, followUpFor: e.target.value})}
                    placeholder="Enter previous appointment ID"
                  />
                </div>
              )}

              {/* Group appointment specific fields */}
              {appointmentType === 'group' && (
                <div className="receptionist-form-group">
                  <label>Group Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={scheduleData.groupSize}
                    onChange={(e) => setScheduleData({...scheduleData, groupSize: parseInt(e.target.value)})}
                  />
                </div>
              )}

              {/* Reason for Visit */}
              <div className="receptionist-form-group">
                <label>Reason for Visit *</label>
                <textarea
                  value={scheduleData.reasonForVisit}
                  onChange={(e) => setScheduleData({...scheduleData, reasonForVisit: e.target.value})}
                  placeholder="Describe the reason for this appointment"
                  rows="3"
                  required
                />
              </div>

              {/* Notes */}
              <div className="receptionist-form-group">
                <label>Additional Notes</label>
                <textarea
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  placeholder="Any additional information or special instructions"
                  rows="2"
                />
              </div>

            </div>
            <div className="receptionist-modal-footer">
              <button 
                className="receptionist-btn-secondary" 
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="receptionist-btn-primary"
                onClick={handleScheduleSubmit}
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Generation Modal */}
      {showBillModal && billData && (
        <div className="receptionist-modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Bill Information</h3>
              <button className="receptionist-modal-close" onClick={() => setShowBillModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-bill-details">
                <h4>Bill Summary</h4>
                <p><strong>Appointment ID:</strong> {billData.appointmentId}</p>
                <p><strong>Patient:</strong> {billData.patientName}</p>
                <p><strong>Service:</strong> {billData.service}</p>
                <p><strong>Amount:</strong> ₱{billData.amount}</p>
                <p><strong>Date:</strong> {billData.date}</p>
                <p><strong>Status:</strong> {billData.status}</p>
                <p><strong>Generated by:</strong> {billData.generatedBy}</p>
                <p><strong>Notes:</strong> {billData.notes}</p>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowBillModal(false)}>
                Close
              </button>
              <button className="receptionist-btn-primary">
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistDashboard;