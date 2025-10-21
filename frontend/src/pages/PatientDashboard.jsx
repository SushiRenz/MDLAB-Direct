import React, { useState, useEffect } from 'react';
import BookAppointmentModal from './BookAppointmentModal';
import PatientProfile from './PatientProfile'; 
import MobileLabScheduleModal from './MobileLabScheduleModal';
import { appointmentAPI, servicesAPI, testResultsAPI, mobileLabAPI } from '../services/api';
import '../design/PatientDashboard.css';
import '../design/BookAppointmentModal.css';

function PatientDashboard(props) {
  const [activeSection, setActiveSection] = useState('overview');
  const [currentUser, setCurrentUser] = useState(props.currentUser);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [isReschedulingModalOpen, setIsReschedulingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('3months');
  const [sortBy, setSortBy] = useState('date');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Services state
  const [availableServices, setAvailableServices] = useState([]);
  
  // Test Results state - moved to component level
  const [testResults, setTestResults] = useState([]);
  
  // Modal state for test results
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);

  // Mobile Lab state
  const [mobileLabSchedules, setMobileLabSchedules] = useState([]);
  const [currentActiveLocation, setCurrentActiveLocation] = useState(null);
  const [nextLocation, setNextLocation] = useState(null);
  const [mobileLabLoading, setMobileLabLoading] = useState(false);
  const [mobileLabError, setMobileLabError] = useState('');

  // Separate appointments into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today && !['cancelled', 'completed', 'no-show'].includes(appointment.status);
  });
  
  const pastAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today || ['cancelled', 'completed', 'no-show'].includes(appointment.status);
  });

  // Sync currentUser state with props - CRITICAL for profile data visibility
  useEffect(() => {
    console.log('PatientDashboard - props.currentUser changed:', props.currentUser);
    if (props.currentUser) {
      setCurrentUser(props.currentUser);
    }
  }, [props.currentUser]);

  // Load test results from localStorage
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        // For patients, get their own released test results
        const response = await testResultsAPI.getMyTestResults();
        
        if (response.success) {
          console.log('✅ Patient test results loaded:', {
            count: response.count,
            data: response.data
          });
          
          // Transform API data to match component format
          const transformedResults = response.data.map(result => ({
            sampleId: result.sampleId,
            patient: result.patientName || `${currentUser?.firstName} ${currentUser?.lastName}` || 'Patient',
            patientId: result.patient,
            testType: result.testType || result.serviceName,
            results: result.results || {},
            date: result.sampleDate,
            status: result.status,
            technician: result.medTech?.firstName ? `${result.medTech.firstName} ${result.medTech.lastName}` : 'medtech',
            isNew: result.isNew,
            isAbnormal: result.isAbnormal,
            isCritical: result.isCritical,
            _id: result._id
          }));
          setTestResults(transformedResults);
        } else {
          console.error('Failed to fetch test results:', response.message);
          setTestResults([]);
        }
      } catch (error) {
        console.error('Error loading test results:', error);
        setTestResults([]);
      }
    };

    if (currentUser) {
      fetchTestResults();
    }
  }, [currentUser]);  // Filter results based on current filters
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

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      const response = await appointmentAPI.getAppointments({
        patientId: currentUser._id || currentUser.id
      });
      
      if (response.success) {
        // Transform API data to match component format
        const transformedAppointments = response.data.map(apt => ({
          id: apt._id,
          _id: apt._id, // Keep original ID for API calls
          date: apt.appointmentDate,
          time: apt.appointmentTime,
          testType: apt.service?.serviceName || apt.serviceName || 'Lab Test',
          location: 'MDLAB Direct - Main Branch',
          status: apt.status,
          appointmentId: apt.appointmentId,
          notes: apt.notes || ''
        }));
        setAppointments(transformedAppointments);
      } else {
        throw new Error(response.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointmentsError(error.message || 'Failed to load appointments');
      // Don't set fallback data - show empty state instead
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Fetch available services
  const fetchServices = async () => {
    console.log('🔄 Starting fetchServices...');
    try {
      console.log('📡 Calling servicesAPI.getServices()...');
      const response = await servicesAPI.getServices({ limit: 100 }); // Request all services
      console.log('✅ Services API response received:', response); // Debug log
      if (response.success) {
        // API returns services directly in response.data (array)
        console.log('✅ Setting available services:', response.data); // Debug log
        setAvailableServices(response.data || []);
      } else {
        console.error('❌ API response indicates failure:', response);
        throw new Error(response.message || 'API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error in fetchServices:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Set fallback services
      console.log('🔄 Setting fallback services...');
      setAvailableServices([
        { _id: '507f1f77bcf86cd799439011', serviceName: 'Complete Blood Count (CBC)', price: 800 },
        { _id: '507f1f77bcf86cd799439012', serviceName: 'Blood Sugar Test', price: 300 },
        { _id: '507f1f77bcf86cd799439013', serviceName: 'Lipid Profile', price: 1500 },
        { _id: '507f1f77bcf86cd799439014', serviceName: 'Urinalysis', price: 400 },
        { _id: '507f1f77bcf86cd799439015', serviceName: 'X-Ray Chest', price: 1200 }
      ]);
    }
  };

  // Fetch mobile lab schedules (public API)
  const fetchMobileLabSchedules = async () => {
    setMobileLabLoading(true);
    setMobileLabError('');
    try {
      const response = await mobileLabAPI.getCurrentWeekSchedule();
      if (response.success) {
        setMobileLabSchedules(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch mobile lab schedules');
      }
    } catch (error) {
      console.error('Error fetching mobile lab schedules:', error);
      setMobileLabError(error.message || 'Failed to load mobile lab schedules');
      setMobileLabSchedules([]);
    } finally {
      setMobileLabLoading(false);
    }
  };

  // Fetch current active location
  const fetchCurrentActiveLocation = async () => {
    try {
      const response = await mobileLabAPI.getCurrentActiveLocation();
      if (response.success) {
        setCurrentActiveLocation(response.data);
      }
    } catch (error) {
      console.error('Error fetching current active location:', error);
      setCurrentActiveLocation(null);
    }
  };

  // Fetch next location
  const fetchNextLocation = async () => {
    try {
      const response = await mobileLabAPI.getNextLocation();
      if (response.success) {
        setNextLocation(response.data);
      }
    } catch (error) {
      console.error('Error fetching next location:', error);
      setNextLocation(null);
    }
  };

  // Load data on component mount and when user changes
  useEffect(() => {
    console.log('🔍 useEffect triggered, currentUser:', currentUser);
    console.log('🔍 currentUser._id:', currentUser?._id);
    console.log('🔍 currentUser.id:', currentUser?.id);
    
    if (currentUser && currentUser._id) {
      console.log('🔄 Loading services and appointments for user:', currentUser._id);
      fetchAppointments();
      fetchServices();
      fetchMobileLabSchedules();
      fetchCurrentActiveLocation();
      fetchNextLocation();
    } else if (currentUser && currentUser.id) {
      console.log('🔄 Loading services and appointments for user (using .id):', currentUser.id);
      fetchAppointments();
      fetchServices();
      fetchMobileLabSchedules();
      fetchCurrentActiveLocation();
      fetchNextLocation();
    } else {
      console.log('❌ currentUser is missing _id or id, not loading services');
    }
  }, [currentUser]);

  // Debug: log availableServices whenever it changes
  useEffect(() => {
    console.log('📋 Available services updated:', availableServices);
    console.log('📋 Services count:', availableServices.length);
    if (availableServices.length > 0) {
      console.log('📋 Service names:', availableServices.map(s => s.serviceName));
    }
  }, [availableServices]);

  const handleLogout = async () => {
    // Show custom logout modal
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear local storage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
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
    console.log('PatientDashboard - Profile updated:', updatedUser);
    
    // Update local state
    setCurrentUser({ ...updatedUser });
    
    // Update sessionStorage so other components can access the updated data
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    
    // If the parent component (App.jsx) has an onUserUpdate callback, call it
    if (props.onUserUpdate) {
      props.onUserUpdate(updatedUser);
    }
  };

  // Helper function to parse and display multiple tests
  const parseTestNames = (testTypeString) => {
    if (!testTypeString) return [];
    
    // Split by comma and clean up each test name
    const tests = testTypeString.split(',').map(test => test.trim());
    
    return tests;
  };

  // Helper function to get test count display
  const getTestDisplayInfo = (testTypeString) => {
    const tests = parseTestNames(testTypeString);
    
    if (tests.length <= 1) {
      return {
        mainTitle: tests[0] || 'Lab Test',
        hasMultiple: false,
        testCount: tests.length,
        allTests: tests
      };
    }
    
    return {
      mainTitle: `${tests.length} Laboratory Tests`,
      hasMultiple: true,
      testCount: tests.length,
      allTests: tests
    };
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      console.log('=== APPOINTMENT SUBMISSION DEBUG ===');
      console.log('appointmentData:', appointmentData);
      console.log('appointmentData.selectedTests:', appointmentData.selectedTests);
      
      // Handle multiple tests - create single appointment with all tests
      const selectedTests = appointmentData.selectedTests || [];
      
      if (selectedTests.length === 0) {
        alert('Please select at least one test.');
        return;
      }

      console.log('✅ Selected tests:', selectedTests);
      console.log('Number of tests:', selectedTests.length);

      // Validate required fields
      if (!appointmentData.date) {
        console.error('❌ No date selected!');
        alert('Please select a date for your appointment.');
        return;
      }

      // Since patients can come anytime, use a default time
      const timeString = appointmentData.time || 'Any time during clinic hours';
      
      // Fix timezone issue - format date in local timezone
      const year = appointmentData.date.getFullYear();
      const month = String(appointmentData.date.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentData.date.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      
      console.log('Local date string (fixed):', localDateString);

      // Create ONE appointment with all selected tests
      const testNames = selectedTests.map(test => test.serviceName).join(', ');
      const testIds = selectedTests.map(test => test._id);
      const totalPrice = selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
      
      console.log('Creating single appointment with multiple tests:', testNames);
      
      // Create appointment data for API
      const apiAppointmentData = {
        patientId: currentUser._id || currentUser.id,
        patientName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Patient',
        contactNumber: currentUser.phone || currentUser.contactNumber || '09123456789',
        email: currentUser.email || '',
        address: currentUser.address?.street || currentUser.address || '',
        age: currentUser.age || null,
        sex: (() => {
          const userGender = currentUser.gender || currentUser.sex || null;
          if (!userGender) return null;
          
          // Capitalize first letter to match validation requirements
          return userGender.charAt(0).toUpperCase() + userGender.slice(1).toLowerCase();
        })(),
        serviceIds: testIds, // Array of service IDs
        serviceName: testNames, // Combined service names
        appointmentDate: localDateString,
        appointmentTime: timeString,
        type: 'scheduled',
        priority: 'regular',
        totalPrice: totalPrice, // Fixed: changed from 'price' to 'totalPrice'
        notes: `Patient booking - Multiple tests: ${testNames}`,
        reasonForVisit: `Multiple tests - Patient self-booking (${selectedTests.length} tests)`
      };

      console.log('🧑‍⚕️ PATIENT APPOINTMENT DEBUG - Frontend:');
      console.log('   Current user data:', currentUser);
      console.log('   User age:', currentUser.age);
      console.log('   User gender/sex (raw):', currentUser.gender, currentUser.sex);
      console.log('   User gender/sex (processed):', apiAppointmentData.sex);
      console.log('   User address:', currentUser.address);
      console.log('Creating single appointment with data:', apiAppointmentData);
      
      const response = await appointmentAPI.createAppointment(apiAppointmentData);
      console.log('📦 Received response:', response);
      
      if (response.success) {
        // Transform API response to match component format
        const newAppointment = {
          id: response.data._id,
          _id: response.data._id,
          date: new Date(response.data.appointmentDate),
          time: response.data.appointmentTime,
          testType: response.data.serviceName,
          location: 'MDLAB Direct - Main Branch',
          status: response.data.status,
          appointmentId: response.data.appointmentId,
          notes: response.data.notes || '',
          price: response.data.price || totalPrice
        };

        console.log('✅ Single appointment created successfully!', newAppointment);
        
        // Add new appointment to the state
        setAppointments([...appointments, newAppointment]);
        setIsBookingModalOpen(false);
        
        // Refresh appointments list to ensure data is up-to-date
        if (typeof fetchAppointments === 'function') {
          fetchAppointments();
        }
        
        alert(`Appointment booked successfully! Your appointment ID is: ${newAppointment.appointmentId}. Services: ${testNames}`);
      } else {
        console.error('❌ Appointment creation failed:', response.message);
        throw new Error(`Failed to create appointment: ${response.message}`);
      }
      
    } catch (error) {
      console.error('Error booking appointments:', error);
      alert('Failed to book appointments: ' + (error.message || 'Please try again'));
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setIsReschedulingModalOpen(true);
  };

  const handleRescheduleSubmit = async (updatedData) => {
    try {
      // Use the API ID for the backend call
      const apiId = selectedAppointment._id || selectedAppointment.id;
      
      const updatePayload = {
        appointmentDate: updatedData.date,
        appointmentTime: updatedData.time,
        status: 'confirmed' // Ensure rescheduled appointment is confirmed
      };

      const result = await appointmentAPI.updateAppointment(apiId, updatePayload);
      
      if (result.success) {
        // Update local state with the updated appointment
        const updatedAppointments = appointments.map(apt => 
          apt.id === selectedAppointment.id 
            ? { 
                ...apt, 
                date: updatedData.date,
                time: updatedData.time,
                status: 'confirmed',
                updatedAt: new Date()
              } 
            : apt
        );
        
        setAppointments(updatedAppointments);
        setIsReschedulingModalOpen(false);
        setSelectedAppointment(null);
        alert('Appointment rescheduled successfully!');
      } else {
        throw new Error(result.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert(error.message || 'Failed to reschedule appointment. Please try again.');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Find the appointment to get the correct API ID
        const appointment = appointments.find(apt => apt.id === appointmentId);
        const apiId = appointment._id || appointmentId;
        
        const result = await appointmentAPI.cancelAppointment(apiId, 'Cancelled by patient');
        
        if (result.success) {
          // Update local state by removing the cancelled appointment or updating its status
          const updatedAppointments = appointments.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled', cancelledAt: new Date() }
              : apt
          );
          
          setAppointments(updatedAppointments);
          alert('Appointment cancelled successfully!');
        } else {
          throw new Error(result.message || 'Failed to cancel appointment');
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert(error.message || 'Failed to cancel appointment. Please try again.');
      }
    }
  };

  // Handle viewing full test report
  const handleViewFullReport = (testResult) => {
    setSelectedTestResult(testResult);
    setShowResultModal(true);
  };

  // Helper function to get test result value from MongoDB data (same as ReviewResults)
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

  // Function to organize test results for display in modal (similar to ReviewResults)
  const getOrganizedTestResults = (testData) => {
    if (!testData?.results) {
      return {};
    }

    const results = testData.results;
    const testType = testData.testType?.toLowerCase() || '';
    
    // Define test categories based on test type
    if (testType.includes('cbc') || testType.includes('blood')) {
      return {
        hematology: {
          title: 'HEMATOLOGY',
          fields: {
            wbc: { label: 'White Blood Cell Count', value: getTestFieldValue('wbc', results) || getTestFieldValue('whiteBloodCells', results), normalRange: '4.0-11.0 x10³/µL' },
            rbc: { label: 'Red Blood Cell Count', value: getTestFieldValue('rbc', results) || getTestFieldValue('redBloodCells', results), normalRange: '4.5-5.5 x10⁶/µL' },
            hemoglobin: { label: 'Hemoglobin', value: getTestFieldValue('hemoglobin', results) || getTestFieldValue('hgb', results), normalRange: '12.0-16.0 g/dL' },
            hematocrit: { label: 'Hematocrit', value: getTestFieldValue('hematocrit', results) || getTestFieldValue('hct', results), normalRange: '36-46%' },
            platelets: { label: 'Platelet Count', value: getTestFieldValue('platelets', results) || getTestFieldValue('plateletCount', results), normalRange: '150-450 x10³/µL' }
          }
        }
      };
    } else if (testType.includes('urine')) {
      return {
        urinalysis: {
          title: 'URINALYSIS',
          fields: {
            color: { label: 'Color', value: getTestFieldValue('color', results), normalRange: 'Yellow' },
            transparency: { label: 'Transparency', value: getTestFieldValue('transparency', results), normalRange: 'Clear' },
            specificGravity: { label: 'Specific Gravity', value: getTestFieldValue('specificGravity', results), normalRange: '1.010-1.025' },
            protein: { label: 'Protein', value: getTestFieldValue('protein', results), normalRange: 'Negative' },
            glucose: { label: 'Glucose', value: getTestFieldValue('glucose', results), normalRange: 'Negative' }
          }
        }
      };
    } else {
      // Generic results display
      const genericFields = {};
      Object.entries(results).forEach(([key, value]) => {
        const fieldValue = getTestFieldValue(key, results);
        if (fieldValue) {
          genericFields[key] = {
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            value: fieldValue,
            normalRange: 'See reference'
          };
        }
      });
      
      return {
        general: {
          title: testData.testType || 'TEST RESULTS',
          fields: genericFields
        }
      };
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
              <div className="stat-number">{upcomingAppointments.length}</div>
              <div className="stat-label">Upcoming Appointments</div>
              </div>
            <div className="stat-item">
              <div className="stat-number">{pastAppointments.length}</div>
              <div className="stat-label">Past Appointments</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{appointments.length}</div>
              <div className="stat-label">Total Appointments</div>
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
          {appointmentsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading appointments...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No upcoming appointments. Book one to get started!
            </div>
          ) : (
            upcomingAppointments.map(appointment => {
              const testInfo = getTestDisplayInfo(appointment.testType);
              
              return (
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
                  <h4 className="appointment-title">{testInfo.mainTitle}</h4>
                  
                  {testInfo.hasMultiple && (
                    <div className="multiple-tests-info">
                      <div className="tests-summary">
                        <span className="test-count-badge">{testInfo.testCount} tests</span>
                      </div>
                      <div className="tests-list">
                        {testInfo.allTests.map((test, index) => (
                          <div key={index} className="test-item">
                            <span className="test-bullet">•</span>
                            <span className="test-name">{test}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
              );
            })
          )}
        </div>
      </div>

      {/* Past Appointments */}
      <div className="appointments-section">
        <h3>Past Appointments</h3>
        <div className="appointments-list">
          {appointmentsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading past appointments...
            </div>
          ) : pastAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No past appointments found.
            </div>
          ) : (
            pastAppointments.map(appointment => (
              <div key={appointment.id} className="appointment-item completed">
                <div className="appointment-info">
                  <div className="appointment-name">{appointment.testType}</div>
                  <div className="appointment-meta">
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span>•</span>
                    <span>{appointment.time}</span>
                    <span>•</span>
                    <span>{appointment.location}</span>
                  </div>
                </div>
                <div className="appointment-result">
                  <span className={`result-status ${appointment.status?.toLowerCase() || 'completed'}`}>
                    {appointment.status === 'completed' ? 'Results Available' : appointment.status || 'Completed'}
                  </span>
                </div>
              </div>
            ))
          )}
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
          availableServices={availableServices}
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
                  <div className="result-info">
                    <div className="info-item">
                      <span className="label">Sample ID:</span>
                      <span className="value">{result.sampleId || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className={`value status-${result.status}`}>{result.status || 'Completed'}</span>
                    </div>
                    {result.technician && (
                      <div className="info-item">
                        <span className="label">Processed by:</span>
                        <span className="value">{result.technician}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="result-actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleViewFullReport(result)}
                  >
                    View Full Report
                  </button>
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
        <h3>Mobile Lab Schedule</h3>
        {mobileLabLoading ? (
          <div className="loading-state">Loading mobile lab schedules...</div>
        ) : mobileLabError ? (
          <div className="error-state">
            <p>Unable to load mobile lab schedules: {mobileLabError}</p>
            <button onClick={fetchMobileLabSchedules} className="retry-btn">Retry</button>
          </div>
        ) : mobileLabSchedules.length === 0 ? (
          <div className="empty-state">
            <p>No mobile lab schedules are currently available.</p>
            <p>Please check back later or contact us for more information.</p>
          </div>
        ) : (
          <div className="schedule-grid">
            {mobileLabSchedules.map((schedule) => (
              <div key={schedule._id} className="schedule-card">
                <div className="schedule-day">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                </div>
                <div className="schedule-location">{schedule.location?.name}</div>
                <div className="schedule-time">
                  {schedule.timeSlot?.startTime} - {schedule.timeSlot?.endTime}
                </div>
                <div className="schedule-address">
                  {schedule.location?.barangay}
                  {schedule.location?.municipality && `, ${schedule.location?.municipality}`}
                </div>
                <div className={`schedule-status ${schedule.status?.toLowerCase().replace(' ', '-')}`}>
                  {schedule.status}
                </div>
              </div>
            ))}
          </div>
        )}
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
      {/* Modern Navigation Header */}
      <header className="patient-navbar">
        <div className="navbar-brand">
          <div className="brand-logo">
            <div className="logo-icon">
              <img src="/src/assets/mdlab-logo.png" alt="MDLAB Direct Logo" />
            </div>
            <div className="brand-text">
              <h2 className="brand-title">MDLAB DIRECT</h2>
              <span className="brand-subtitle">Patient Portal</span>
            </div>
          </div>
        </div>
        
        <nav className="navbar-nav">
          <div 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => handleSectionClick('overview')}
          >
            Dashboard
          </div>

          <div 
            className={`nav-item ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => handleSectionClick('appointments')}
          >
            Appointments
          </div>

          <div 
            className={`nav-item ${activeSection === 'results' ? 'active' : ''}`}
            onClick={() => handleSectionClick('results')}
          >
            Results
          </div>

          <div 
            className={`nav-item ${activeSection === 'mobile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('mobile')}
          >
            Mobile Lab
          </div>

          <div 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleSectionClick('profile')}
          >
            Profile
          </div>
        </nav>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              <span>{currentUser?.firstName?.charAt(0) || currentUser?.username?.charAt(0) || 'P'}</span>
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser?.firstName} {currentUser?.lastName}</span>
              <span className="user-role">Patient</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="patient-main">
        <div className="content-header">
          <div className="page-info">
            <h1 className="page-title">{renderPageTitle()}</h1>
            <p className="page-description">
              {activeSection === 'overview' && 'Welcome to your health dashboard'}
              {activeSection === 'appointments' && 'Schedule and manage your appointments'}
              {activeSection === 'results' && 'View your latest test results'}
              {activeSection === 'mobile' && 'Mobile laboratory services in your community'}
              {activeSection === 'profile' && 'Manage your personal information'}
            </p>
          </div>
        </div>

        <div className="patient-content">
          {renderContent()}
        </div>
      </main>

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
        availableServices={availableServices}
      />
      <MobileLabScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedules={mobileLabSchedules}
        currentActiveLocation={currentActiveLocation}
        nextLocation={nextLocation}
        loading={mobileLabLoading}
        error={mobileLabError}
      />
      
      {/* Test Results Modal */}
      {showResultModal && selectedTestResult && (
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
                onClick={() => setShowResultModal(false)}
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
                  <strong>Patient:</strong> {selectedTestResult.patient || `${currentUser?.firstName} ${currentUser?.lastName}` || 'Patient'}
                </div>
                <div>
                  <strong>Test Type:</strong> {selectedTestResult.testType || 'N/A'}
                </div>
                <div>
                  <strong>Sample Date:</strong> {selectedTestResult.date ? new Date(selectedTestResult.date).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <strong>Sample ID:</strong> {selectedTestResult.sampleId || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: '#d4edda',
                    color: '#155724'
                  }}>
                    Released
                  </span>
                </div>
              </div>

              {/* Test Results by Category */}
              {(() => {
                const organizedResults = getOrganizedTestResults(selectedTestResult);
                
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
                              color: fieldData.value && (fieldData.value.toString().includes('Positive') || fieldData.value.toString().includes('Reactive')) ? '#e74c3c' : '#27ae60'
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
                  <div style={{ fontWeight: 'bold' }}>GIDEON M. RAMOS, MD</div>
                  <div>License#0108071</div>
                  <div>PATHOLOGIST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
