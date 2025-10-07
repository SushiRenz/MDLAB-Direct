import React, { useState, useEffect } from 'react';
import '../design/Dashboard.css';
import { userAPI, financeAPI, logsAPI, servicesAPI, mobileLabAPI } from '../services/api';

function Dashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  
  // Dashboard Overview State
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalMedTech: 0,
    totalRevenue: 0,
    pendingBills: 0,
    recentTransactions: [],
    monthlyRevenue: [],
    topServices: []
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  
  // User management state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // Finance management state
  const [financeStats, setFinanceStats] = useState(null);
  const [bills, setBills] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [billingRates, setBillingRates] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState('');

  // Bill management modals
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [showViewBillModal, setShowViewBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Patient view modal
  const [showViewPatientModal, setShowViewPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // MedTech view modal
  const [showViewMedTechModal, setShowViewMedTechModal] = useState(false);
  const [selectedMedTech, setSelectedMedTech] = useState(null);

  // Receptionist view modal
  const [showViewReceptionistModal, setShowViewReceptionistModal] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);

  // Pathologist view modal
  const [showViewPathologistModal, setShowViewPathologistModal] = useState(false);
  const [selectedPathologist, setSelectedPathologist] = useState(null);

  // Schedule edit modal for medtech
  const [showScheduleEditModal, setShowScheduleEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState('Regular');

  // Certification management modal for pathologist
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [pathologistCertifications, setPathologistCertifications] = useState([]);
  const [editingCertification, setEditingCertification] = useState(null);
  const [certificationName, setCertificationName] = useState('');
  const [certificationDate, setCertificationDate] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('Active');

  // Transaction management modals
  const [showCreateTransactionModal, setShowCreateTransactionModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('payment');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionPatientName, setTransactionPatientName] = useState('');
  const [transactionPaymentMethod, setTransactionPaymentMethod] = useState('cash');
  const [transactionStatus, setTransactionStatus] = useState('pending');
  const [transactionNotes, setTransactionNotes] = useState('');

  // Payment management modals
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPatientName, setPaymentPatientName] = useState('');
  const [paymentBillId, setPaymentBillId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Track if edit modal is opened from a view modal (for z-index layering)
  const [editModalFromView, setEditModalFromView] = useState(false);

  // Billing Rates modal states
  const [showCreateBillingRateModal, setShowCreateBillingRateModal] = useState(false);
  const [showEditBillingRateModal, setShowEditBillingRateModal] = useState(false);
  const [showViewBillingRateModal, setShowViewBillingRateModal] = useState(false);
  const [selectedBillingRate, setSelectedBillingRate] = useState(null);
  
  // Billing Rates form data
  const [billingRateServiceName, setBillingRateServiceName] = useState('');
  const [billingRateServiceCode, setBillingRateServiceCode] = useState('');
  const [billingRateCategory, setBillingRateCategory] = useState('hematology');
  const [billingRatePrice, setBillingRatePrice] = useState('');
  const [billingRateTurnaroundTime, setBillingRateTurnaroundTime] = useState('');
  const [billingRateSampleType, setBillingRateSampleType] = useState('');
  const [billingRateDescription, setBillingRateDescription] = useState('');
  const [billingRateIsPackage, setBillingRateIsPackage] = useState(false);
  const [billingRatePackageItems, setBillingRatePackageItems] = useState([]);
  const [billingRatePackageSavings, setBillingRatePackageSavings] = useState('');
  const [billingRateEmergencyRate, setBillingRateEmergencyRate] = useState('');
  
  // Billing Rates tab management
  const [activeBillingTab, setActiveBillingTab] = useState('laboratory');

  // Reports Management State
  const [reportsData, setReportsData] = useState({
    dailySales: [],
    weeklyRevenue: [],
    monthlyFinancial: [],
    outstandingBills: [],
    paymentMethods: [],
    overdueAccounts: []
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportType, setReportType] = useState('');
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [reportSummary, setReportSummary] = useState({
    totalRevenue: 0,
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    overdueAmount: 0,
    collectionRate: 0
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportExportFormat, setReportExportFormat] = useState('pdf');
  const [reportViewMode, setReportViewMode] = useState('summary'); // 'summary', 'detailed', 'chart'

  // Logs Management State
  const [logs, setLogs] = useState([]);
  const [logStats, setLogStats] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logFilters, setLogFilters] = useState({
    level: '',
    category: '',
    userEmail: '',
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [activeLogTab, setActiveLogTab] = useState('all');
  const [logPagination, setLogPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    limit: 50
  });

  // Services Management State
  const [services, setServices] = useState([]);
  const [serviceStats, setServiceStats] = useState(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [serviceFilters, setServiceFilters] = useState({
    category: '',
    isActive: '',
    isPopular: '',
    search: ''
  });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [servicePagination, setServicePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalServices: 0,
    limit: 20
  });

  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    serviceId: '',
    serviceName: '',
    category: '',
    description: '',
    price: '',
    discountPrice: '',
    duration: '',
    sampleType: '',
    fastingRequired: false,
    ageRange: '',
    prerequisites: '',
    isActive: true,
    isPopular: false,
    homeVisitAvailable: false
  });

  const user = currentUser;

  // Dashboard data fetching
  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      // Fetch user statistics
      const userStatsResponse = await userAPI.getUserStats();
      
      // Fetch finance statistics  
      const financeStatsResponse = await financeAPI.getFinanceStats();
      
      // Fetch recent transactions
      const recentTransactionsResponse = await financeAPI.getTransactions({ limit: 5 });
      
      // Fetch services and calculate stats locally
      let serviceStats = { totalServices: 0, activeServices: 0, topServices: [] };
      try {
        const servicesResponse = await servicesAPI.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          const services = servicesResponse.data;
          serviceStats = {
            totalServices: services.length,
            activeServices: services.filter(s => s.isActive).length,
            topServices: services.filter(s => s.isPopular).slice(0, 5)
          };
        }
      } catch (error) {
        console.error('Error fetching services for stats:', error);
      }

      if (userStatsResponse.success && financeStatsResponse.success) {
        setDashboardStats({
          totalUsers: userStatsResponse.stats?.totalUsers || 0,
          totalPatients: userStatsResponse.stats?.totalPatients || 0,
          totalMedTech: userStatsResponse.stats?.totalMedTech || 0,
          activeUsers: userStatsResponse.stats?.activeUsers || 0,
          totalRevenue: financeStatsResponse.data?.totalRevenue || 0,
          pendingBills: financeStatsResponse.data?.pendingBills || 0,
          monthlyRevenue: financeStatsResponse.data?.monthlyRevenue || 0,
          completedPayments: financeStatsResponse.data?.completedPayments || 0,
          recentTransactions: recentTransactionsResponse.success ? (recentTransactionsResponse.data || []) : [],
          topServices: serviceStats.topServices || [],
          totalServices: serviceStats.totalServices || 0,
          activeServices: serviceStats.activeServices || 0
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for demo purposes
      setDashboardStats({
        totalUsers: 156,
        totalPatients: 89,
        totalMedTech: 23,
        activeUsers: 142,
        totalRevenue: 1250000,
        pendingBills: 45,
        monthlyRevenue: 850000,
        completedPayments: 128,
        recentTransactions: [
          {
            transactionId: 'TXN-2025-001',
            patientName: 'Maria Santos',
            amount: 2500,
            type: 'payment',
            status: 'completed',
            transactionDate: new Date().toISOString()
          },
          {
            transactionId: 'TXN-2025-002', 
            patientName: 'Carlos Rodriguez',
            amount: 1800,
            type: 'payment',
            status: 'pending',
            transactionDate: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        topServices: [
          { serviceName: 'Complete Blood Count', count: 45, revenue: 36000 },
          { serviceName: 'Lipid Profile', count: 32, revenue: 48000 },
          { serviceName: 'X-Ray Chest', count: 28, revenue: 33600 }
        ]
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Mobile Lab Management State
  const [mobileLabSchedules, setMobileLabSchedules] = useState([]);
  const [mobileLabStats, setMobileLabStats] = useState(null);
  const [mobileLabLoading, setMobileLabLoading] = useState(false);
  const [mobileLabError, setMobileLabError] = useState('');
  const [showMobileLabModal, setShowMobileLabModal] = useState(false);
  const [editingMobileLabSchedule, setEditingMobileLabSchedule] = useState(null);
  const [mobileLabFilters, setMobileLabFilters] = useState({
    dayOfWeek: '',
    status: '',
    municipality: '',
    barangay: '',
    isActive: '',
    search: ''
  });
  const [mobileLabPagination, setMobileLabPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSchedules: 0,
    limit: 20
  });

  // Mobile Lab Form State
  const [mobileLabFormData, setMobileLabFormData] = useState({
    dayOfWeek: 0,
    location: {
      name: '',
      address: '',
      barangay: '',
      municipality: ''
    },
    timeSlot: {
      startTime: '',
      endTime: '',
      timeDisplay: ''
    },
    status: 'Scheduled',
    availableServices: [],
    capacity: {
      maxPatients: 50,
      currentBookings: 0
    },
    notes: '',
    contactInfo: {
      phone: '',
      email: '',
      contactPerson: ''
    },
    assignedTeam: {
      medTech: '',
      driver: '',
      coordinator: ''
    },
    equipment: [],
    recurring: {
      isRecurring: true,
      frequency: 'Weekly',
      startDate: '',
      endDate: ''
    },
    weatherDependent: false,
    priority: 'Medium',
    isActive: true
  });

  // Load dashboard data on component mount
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleUserManagement = () => {
    setUserManagementOpen(!userManagementOpen);
  };

  const toggleFinance = () => {
    setFinanceOpen(!financeOpen);
  };

  const toggleLogs = () => {
    setLogsOpen(!logsOpen);
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

  // User Management Functions
  const fetchUsers = async (role = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (role) params.role = role;
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.isActive = filterStatus === 'active';
      
      const data = await userAPI.getUsers(params);
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const data = await userAPI.getUserStats();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const data = await userAPI.createUser(userData);
      if (data.success) {
        setShowUserModal(false);
        setEditingUser(null);
        fetchUsers(getCurrentRole());
        fetchUserStats();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const data = await userAPI.updateUser(userId, userData);
      if (data.success) {
        setShowUserModal(false);
        setEditingUser(null);
        fetchUsers(getCurrentRole());
        fetchUserStats();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const data = await userAPI.deleteUser(userId);
        if (data.success) {
          fetchUsers(getCurrentRole());
          fetchUserStats();
        } else {
          setError(data.message || 'Failed to delete user');
        }
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      const data = isActive 
        ? await userAPI.deactivateUser(userId)
        : await userAPI.activateUser(userId);
      
      if (data.success) {
        fetchUsers(getCurrentRole());
        fetchUserStats();
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const getCurrentRole = () => {
    switch (activeSection) {
      case 'patients': return 'patient';
      case 'medtech': return 'medtech';
      case 'pathologist': return 'pathologist';
      case 'receptionist': return 'receptionist';
      case 'admin': return 'admin';
      default: return '';
    }
  };

  const openUserModal = (user = null, fromView = false) => {
    setEditingUser(user);
    setShowUserModal(true);
    setEditModalFromView(fromView);
  };

  const closeUserModal = () => {
    setEditingUser(null);
    setShowUserModal(false);
    setEditModalFromView(false);
  };

  // Bill modal functions
  const openCreateBillModal = () => {
    setSelectedBill(null);
    setShowCreateBillModal(true);
  };

  const openEditBillModal = (bill) => {
    setSelectedBill(bill);
    setShowEditBillModal(true);
  };

  const openViewBillModal = (bill) => {
    setSelectedBill(bill);
    setShowViewBillModal(true);
  };

  const closeBillModals = () => {
    setSelectedBill(null);
    setShowCreateBillModal(false);
    setShowEditBillModal(false);
    setShowViewBillModal(false);
  };

  // Patient modal functions
  const openViewPatientModal = (patient) => {
    setSelectedPatient(patient);
    setShowViewPatientModal(true);
  };

  const closePatientModal = () => {
    setSelectedPatient(null);
    setShowViewPatientModal(false);
  };

  // MedTech modal functions
  const openViewMedTechModal = (medtech) => {
    setSelectedMedTech(medtech);
    setShowViewMedTechModal(true);
  };

  const closeMedTechModal = () => {
    setSelectedMedTech(null);
    setShowViewMedTechModal(false);
  };

  // Receptionist modal functions
  const openViewReceptionistModal = (receptionist) => {
    setSelectedReceptionist(receptionist);
    setShowViewReceptionistModal(true);
  };

  const closeReceptionistModal = () => {
    setSelectedReceptionist(null);
    setShowViewReceptionistModal(false);
  };

  // Pathologist modal functions
  const openViewPathologistModal = (pathologist) => {
    setSelectedPathologist(pathologist);
    setShowViewPathologistModal(true);
  };

  const closePathologistModal = () => {
    setSelectedPathologist(null);
    setShowViewPathologistModal(false);
  };

  // Transaction modal functions
  const openCreateTransactionModal = () => {
    setShowCreateTransactionModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionType(transaction.type);
    setTransactionAmount(transaction.amount.toString());
    setTransactionDescription(transaction.description);
    setTransactionPatientName(transaction.patientName);
    setTransactionPaymentMethod(transaction.paymentMethod);
    setTransactionStatus(transaction.status);
    setTransactionNotes(transaction.notes || '');
    setShowEditTransactionModal(true);
    
    // Check if this is opened from view modal
    if (showViewTransactionModal) {
      setEditModalFromView(true);
    }
  };

  const openViewTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewTransactionModal(true);
  };

  const closeTransactionModals = () => {
    setSelectedTransaction(null);
    setTransactionType('payment');
    setTransactionAmount('');
    setTransactionDescription('');
    setTransactionPatientName('');
    setTransactionPaymentMethod('cash');
    setTransactionStatus('pending');
    setTransactionNotes('');
    setShowCreateTransactionModal(false);
    setShowEditTransactionModal(false);
    setShowViewTransactionModal(false);
    setEditModalFromView(false);
  };

  // Payment modal functions
  const openCreatePaymentModal = () => {
    setShowCreatePaymentModal(true);
  };

  const openEditPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setPaymentAmount(payment.amountPaid?.toString() || '');
    setPaymentPatientName(payment.patientName);
    setPaymentBillId(payment.billId?.billId || payment.billId || '');
    setPaymentMethod(payment.paymentMethod);
    setPaymentStatus(payment.status);
    setPaymentReferenceNumber(payment.referenceNumber || '');
    setPaymentNotes(payment.notes || '');
    setShowEditPaymentModal(true);
    
    // Check if this is opened from view modal
    if (showViewPaymentModal) {
      setEditModalFromView(true);
    }
  };

  const openViewPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowViewPaymentModal(true);
  };

  const closePaymentModals = () => {
    setSelectedPayment(null);
    setPaymentAmount('');
    setPaymentPatientName('');
    setPaymentBillId('');
    setPaymentMethod('cash');
    setPaymentStatus('pending');
    setPaymentReferenceNumber('');
    setPaymentNotes('');
    setShowCreatePaymentModal(false);
    setShowEditPaymentModal(false);
    setShowViewPaymentModal(false);
    setEditModalFromView(false);
  };

  // Schedule edit modal functions
  const openScheduleEditModal = (scheduleData) => {
    setEditingSchedule(scheduleData);
    // Initialize form values based on schedule data
    if (scheduleData.shift.includes('8:00 AM')) {
      setScheduleStartTime('08:00');
    } else {
      setScheduleStartTime('');
    }
    if (scheduleData.shift.includes('5:00 PM')) {
      setScheduleEndTime('17:00');
    } else {
      setScheduleEndTime('');
    }
    setScheduleStatus(scheduleData.status || 'Regular');
    setShowScheduleEditModal(true);
  };

  const closeScheduleEditModal = () => {
    setEditingSchedule(null);
    setScheduleStartTime('');
    setScheduleEndTime('');
    setScheduleStatus('Regular');
    setShowScheduleEditModal(false);
  };

  // Certification modal functions
  const openCertificationModal = (pathologist) => {
    // Initialize with sample certifications (in real app, this would come from the pathologist's data)
    const sampleCertifications = [
      { id: 1, name: 'Board Certified Pathologist', date: '2020', status: 'Active' },
      { id: 2, name: 'Clinical Laboratory Certification', date: '2019', status: 'Active' },
      { id: 3, name: 'Hematology Subspecialty', date: '2021', status: 'Active' }
    ];
    setPathologistCertifications(sampleCertifications);
    setShowCertificationModal(true);
  };

  const closeCertificationModal = () => {
    setShowCertificationModal(false);
    setPathologistCertifications([]);
    setEditingCertification(null);
    setCertificationName('');
    setCertificationDate('');
    setCertificationStatus('Active');
  };

  const openAddCertification = () => {
    setEditingCertification(null);
    setCertificationName('');
    setCertificationDate('');
    setCertificationStatus('Active');
  };

  const openEditCertification = (cert) => {
    setEditingCertification(cert);
    setCertificationName(cert.name);
    setCertificationDate(cert.date);
    setCertificationStatus(cert.status);
  };

  const handleSaveCertification = () => {
    if (!certificationName || !certificationDate) {
      alert('Please fill in all required fields');
      return;
    }

    const certificationData = {
      id: editingCertification?.id || Date.now(),
      name: certificationName,
      date: certificationDate,
      status: certificationStatus
    };

    if (editingCertification) {
      // Update existing certification
      setPathologistCertifications(prev => 
        prev.map(cert => cert.id === editingCertification.id ? certificationData : cert)
      );
    } else {
      // Add new certification
      setPathologistCertifications(prev => [...prev, certificationData]);
    }

    // Reset form
    setEditingCertification(null);
    setCertificationName('');
    setCertificationDate('');
    setCertificationStatus('Active');
  };

  const handleDeleteCertification = (certId) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      setPathologistCertifications(prev => prev.filter(cert => cert.id !== certId));
    }
  };

  // Effect to fetch users when section changes
  useEffect(() => {
    if (['patients', 'medtech', 'pathologist', 'receptionist'].includes(activeSection)) {
      fetchUsers(getCurrentRole());
      fetchUserStats();
    }
    if (['bills', 'transaction', 'payments', 'billing-rates'].includes(activeSection)) {
      fetchFinanceData();
    }
    if (activeSection === 'logs') {
      fetchLogs();
      fetchLogStats();
    }
    if (activeSection === 'services') {
      fetchServices();
      fetchServiceStats();
    }
    if (activeSection === 'mobile-lab') {
      fetchMobileLabSchedules();
      fetchMobileLabStats();
    }
  }, [activeSection, searchTerm, filterStatus]);

  // Logs data fetching functions
  const fetchLogs = async (page = 1) => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const params = {
        page,
        limit: logPagination.limit,
        ...logFilters
      };

      // Apply tab-based filtering
      if (activeLogTab !== 'all') {
        switch (activeLogTab) {
          case 'user-actions':
            params.category = 'user_action';
            break;
          case 'system-events':
            params.category = 'system_event';
            break;
          case 'security':
            params.category = 'security';
            break;
          case 'errors':
            params.level = 'error';
            break;
        }
      }

      const data = await logsAPI.getLogs(params);
      if (data.success) {
        setLogs(data.data || []);
        setLogPagination(data.pagination || logPagination);
      } else {
        setLogsError(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setLogsError(err.message || 'Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchLogStats = async () => {
    try {
      const data = await logsAPI.getLogStats();
      if (data.success) {
        setLogStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch log stats:', err);
    }
  };

  const handleLogTabChange = (tab) => {
    setActiveLogTab(tab);
    // Reset filters when changing tabs
    setLogFilters({
      level: '',
      category: '',
      userEmail: '',
      status: '',
      search: '',
      startDate: '',
      endDate: ''
    });
    // Refetch logs with new tab
    setTimeout(() => fetchLogs(1), 100);
  };

  const handleLogFilterChange = (filterName, value) => {
    setLogFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    // Debounce the search
    setTimeout(() => fetchLogs(1), 500);
  };

  const handleLogPageChange = (page) => {
    fetchLogs(page);
  };

  const handleExportLogs = async (format = 'json') => {
    try {
      setLogsLoading(true);
      const params = {
        format,
        ...logFilters,
        limit: 1000 // Higher limit for export
      };

      if (activeLogTab !== 'all') {
        switch (activeLogTab) {
          case 'user-actions':
            params.category = 'user_action';
            break;
          case 'system-events':
            params.category = 'system_event';
            break;
          case 'security':
            params.category = 'security';
            break;
          case 'errors':
            params.level = 'error';
            break;
        }
      }

      if (format === 'csv') {
        const blob = await logsAPI.exportLogs(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await logsAPI.exportLogs(params);
        if (data.success) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs. Please try again.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to clear old logs?\n\n' +
      'This will permanently delete logs older than 90 days.\n' +
      'This action cannot be undone.'
    );

    if (confirmation) {
      try {
        setLogsLoading(true);
        const result = await logsAPI.cleanupLogs(90);
        if (result.success) {
          alert(`Successfully deleted ${result.deletedCount} old log entries.`);
          fetchLogs(1); // Refresh the logs
          fetchLogStats(); // Refresh stats
        }
      } catch (error) {
        console.error('Failed to clear logs:', error);
        alert('Failed to clear logs. Please try again.');
      } finally {
        setLogsLoading(false);
      }
    }
  };

  // Services data fetching functions
  const fetchServices = async (page = 1) => {
    setServicesLoading(true);
    setServicesError('');
    try {
      console.log('🔄 Fetching services for Dashboard...');
      const params = {
        page,
        limit: servicePagination.limit
      };
      
      // Only add non-empty filters
      Object.keys(serviceFilters).forEach(key => {
        const value = serviceFilters[key];
        if (value && value.trim() !== '') {
          params[key] = value;
        }
      });
      
      console.log('📋 Service fetch params:', params);
      console.log('📋 Service filters being applied:', JSON.stringify(serviceFilters, null, 2));
      console.log('📋 Service pagination limit:', servicePagination.limit);
      
      // Let's also log what URL will be constructed
      const urlParams = new URLSearchParams(params);
      console.log('🌐 Full API URL params:', urlParams.toString());

      const data = await servicesAPI.getServices(params);
      console.log('📦 Services API response:', data);
      console.log('📦 Response data array:', data.data);
      console.log('📦 Full response structure:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Services loaded successfully:', data.data?.length || 0, 'services');
        console.log('📋 Service names:', data.data?.map(s => s.serviceName) || []);
        setServices(data.data || []);
        setServicePagination(data.pagination || servicePagination);
      } else {
        console.error('❌ Services fetch failed:', data.message);
        setServicesError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('💥 Failed to fetch services:', err);
      setServicesError(err.message || 'Failed to fetch services');
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchServiceStats = async () => {
    try {
      const data = await servicesAPI.getServiceStats();
      if (data.success) {
        setServiceStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch service stats:', err);
    }
  };

  const handleCreateService = async (serviceData) => {
    try {
      const data = await servicesAPI.createService(serviceData);
      if (data.success) {
        setShowServiceModal(false);
        setEditingService(null);
        fetchServices();
        fetchServiceStats();
        alert('Service created successfully!');
      } else {
        setServicesError(data.message || 'Failed to create service');
      }
    } catch (err) {
      setServicesError(err.message || 'Failed to create service');
    }
  };

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      const data = await servicesAPI.updateService(serviceId, serviceData);
      if (data.success) {
        setShowServiceModal(false);
        setEditingService(null);
        fetchServices();
        fetchServiceStats();
        alert('Service updated successfully!');
      } else {
        setServicesError(data.message || 'Failed to update service');
      }
    } catch (err) {
      setServicesError(err.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to deactivate this service?')) {
      try {
        const data = await servicesAPI.deleteService(serviceId);
        if (data.success) {
          fetchServices();
          fetchServiceStats();
          alert('Service deactivated successfully');
        } else {
          setServicesError(data.message || 'Failed to delete service');
        }
      } catch (err) {
        setServicesError(err.message || 'Failed to delete service');
      }
    }
  };

  const handleToggleServiceStatus = async (serviceId) => {
    try {
      const data = await servicesAPI.toggleServiceStatus(serviceId);
      if (data.success) {
        fetchServices();
        fetchServiceStats();
        alert('Service status updated successfully');
      } else {
        setServicesError(data.message || 'Failed to toggle service status');
      }
    } catch (err) {
      setServicesError(err.message || 'Failed to toggle service status');
    }
  };

  const openServiceModal = (service = null) => {
    setSelectedService(service);
    setServiceModalOpen(true);
    
    // Pre-populate form if editing
    if (service) {
      setServiceFormData({
        serviceId: service.serviceId || '',
        serviceName: service.serviceName || '',
        category: service.category || '',
        description: service.description || '',
        price: service.price || '',
        discountPrice: service.discountPrice || '',
        duration: service.duration || '',
        sampleType: service.sampleType || '',
        fastingRequired: service.fastingRequired || false,
        ageRange: service.ageRange || '',
        prerequisites: service.prerequisites || '',
        isActive: service.isActive !== undefined ? service.isActive : true,
        isPopular: service.isPopular || false,
        homeVisitAvailable: service.homeVisitAvailable || false
      });
    } else {
      // Reset form for new service
      setServiceFormData({
        serviceId: '',
        serviceName: '',
        category: '',
        description: '',
        price: '',
        discountPrice: '',
        duration: '',
        sampleType: '',
        fastingRequired: false,
        ageRange: '',
        prerequisites: '',
        isActive: true,
        isPopular: false,
        homeVisitAvailable: false
      });
    }
  };

  const closeServiceModal = () => {
    setSelectedService(null);
    setServiceModalOpen(false);
    setServiceFormData({
      serviceId: '',
      serviceName: '',
      category: '',
      description: '',
      price: '',
      discountPrice: '',
      duration: '',
      sampleType: '',
      fastingRequired: false,
      ageRange: '',
      prerequisites: '',
      isActive: true,
      isPopular: false,
      homeVisitAvailable: false
    });
  };

  // Mobile Lab Management Functions
  const fetchMobileLabSchedules = async (page = 1) => {
    setMobileLabLoading(true);
    setMobileLabError('');
    try {
      const params = {
        page,
        limit: mobileLabPagination.limit,
        ...mobileLabFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const data = await mobileLabAPI.getMobileLabSchedules(params);
      if (data.success) {
        setMobileLabSchedules(data.data);
        setMobileLabPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalSchedules: data.pagination?.totalItems || 0,
          limit: data.pagination?.limit || 20
        });
      } else {
        setMobileLabError(data.message || 'Failed to fetch mobile lab schedules');
      }
    } catch (err) {
      setMobileLabError(err.message || 'Failed to fetch mobile lab schedules');
      console.error('Mobile lab fetch error:', err);
    } finally {
      setMobileLabLoading(false);
    }
  };

  const fetchMobileLabStats = async () => {
    try {
      const data = await mobileLabAPI.getMobileLabStats();
      if (data.success) {
        setMobileLabStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch mobile lab stats:', err);
    }
  };

  const handleCreateMobileLabSchedule = async (scheduleData) => {
    try {
      // Clean up the data before sending
      const cleanedData = {
        ...scheduleData,
        // Clean up timeSlot - remove empty timeDisplay to let backend auto-generate it
        timeSlot: {
          startTime: scheduleData.timeSlot.startTime,
          endTime: scheduleData.timeSlot.endTime,
          // Only include timeDisplay if it has a value
          ...(scheduleData.timeSlot.timeDisplay && scheduleData.timeSlot.timeDisplay.trim() !== '' && {
            timeDisplay: scheduleData.timeSlot.timeDisplay
          })
        },
        // Remove dayName field to let backend auto-generate it from dayOfWeek
        // Don't send dayName at all, let the pre-save hook handle it
        ...(scheduleData.dayName && { dayName: undefined }),
        // Remove empty strings for optional ObjectId fields
        assignedTeam: scheduleData.assignedTeam && Object.keys(scheduleData.assignedTeam).length > 0 ? {
          medTech: scheduleData.assignedTeam.medTech || undefined,
          driver: scheduleData.assignedTeam.driver || undefined,
          coordinator: scheduleData.assignedTeam.coordinator || undefined
        } : undefined,
        // Remove empty strings for optional date fields
        recurring: {
          isRecurring: scheduleData.recurring?.isRecurring !== false,
          frequency: scheduleData.recurring?.frequency || 'Weekly',
          startDate: scheduleData.recurring?.startDate || undefined,
          endDate: scheduleData.recurring?.endDate || undefined
        },
        // Remove empty strings for optional contact fields
        contactInfo: {
          phone: scheduleData.contactInfo?.phone || undefined,
          email: scheduleData.contactInfo?.email || undefined,
          contactPerson: scheduleData.contactInfo?.contactPerson || undefined
        }
      };

      console.log('Sending mobile lab schedule data:', JSON.stringify(cleanedData, null, 2));
      const data = await mobileLabAPI.createMobileLabSchedule(cleanedData);
      if (data.success) {
        setShowMobileLabModal(false);
        setEditingMobileLabSchedule(null);
        resetMobileLabForm();
        fetchMobileLabSchedules();
        fetchMobileLabStats();
        alert('Mobile lab schedule created successfully!');
      } else {
        console.error('API Error Response:', data);
        console.error('Validation errors:', data.errors);
        setMobileLabError(data.message || 'Failed to create mobile lab schedule');
        if (data.errors && Array.isArray(data.errors)) {
          console.error('Detailed validation errors:', data.errors.map(err => `${err.path}: ${err.msg}`));
        }
      }
    } catch (err) {
      console.error('Request Error:', err);
      setMobileLabError(err.message || 'Failed to create mobile lab schedule');
    }
  };

  const handleUpdateMobileLabSchedule = async (scheduleId, scheduleData) => {
    try {
      const data = await mobileLabAPI.updateMobileLabSchedule(scheduleId, scheduleData);
      if (data.success) {
        setShowMobileLabModal(false);
        setEditingMobileLabSchedule(null);
        resetMobileLabForm();
        fetchMobileLabSchedules();
        fetchMobileLabStats();
        alert('Mobile lab schedule updated successfully!');
      } else {
        setMobileLabError(data.message || 'Failed to update mobile lab schedule');
      }
    } catch (err) {
      setMobileLabError(err.message || 'Failed to update mobile lab schedule');
    }
  };

  const handleDeleteMobileLabSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this mobile lab schedule?')) {
      try {
        const data = await mobileLabAPI.deleteMobileLabSchedule(scheduleId);
        if (data.success) {
          fetchMobileLabSchedules();
          fetchMobileLabStats();
          alert('Mobile lab schedule deleted successfully');
        } else {
          setMobileLabError(data.message || 'Failed to delete mobile lab schedule');
        }
      } catch (err) {
        setMobileLabError(err.message || 'Failed to delete mobile lab schedule');
      }
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId, status) => {
    try {
      const data = await mobileLabAPI.updateScheduleStatus(scheduleId, status);
      if (data.success) {
        fetchMobileLabSchedules();
        fetchMobileLabStats();
        alert('Schedule status updated successfully');
      } else {
        setMobileLabError(data.message || 'Failed to update schedule status');
      }
    } catch (err) {
      setMobileLabError(err.message || 'Failed to update schedule status');
    }
  };

  const openMobileLabModal = (schedule = null) => {
    setEditingMobileLabSchedule(schedule);
    setShowMobileLabModal(true);
    
    // Pre-populate form if editing
    if (schedule) {
      setMobileLabFormData({
        dayOfWeek: schedule.dayOfWeek || 0,
        location: {
          name: schedule.location?.name || '',
          address: schedule.location?.address || '',
          barangay: schedule.location?.barangay || '',
          municipality: schedule.location?.municipality || '',
          coordinates: {
            lat: schedule.location?.coordinates?.lat || '',
            lng: schedule.location?.coordinates?.lng || ''
          }
        },
        timeSlot: {
          startTime: schedule.timeSlot?.startTime || '',
          endTime: schedule.timeSlot?.endTime || '',
          timeDisplay: schedule.timeSlot?.timeDisplay || ''
        },
        status: schedule.status || 'Scheduled',
        availableServices: schedule.availableServices || [],
        capacity: {
          maxPatients: schedule.capacity?.maxPatients || 50,
          currentBookings: schedule.capacity?.currentBookings || 0
        },
        notes: schedule.notes || '',
        contactInfo: {
          phone: schedule.contactInfo?.phone || '',
          email: schedule.contactInfo?.email || '',
          contactPerson: schedule.contactInfo?.contactPerson || ''
        },
        assignedTeam: {
          medTech: schedule.assignedTeam?.medTech || '',
          driver: schedule.assignedTeam?.driver || '',
          coordinator: schedule.assignedTeam?.coordinator || ''
        },
        equipment: schedule.equipment || [],
        recurring: {
          isRecurring: schedule.recurring?.isRecurring !== false,
          frequency: schedule.recurring?.frequency || 'Weekly',
          startDate: schedule.recurring?.startDate || '',
          endDate: schedule.recurring?.endDate || ''
        },
        weatherDependent: schedule.weatherDependent || false,
        priority: schedule.priority || 'Medium',
        isActive: schedule.isActive !== false
      });
    } else {
      resetMobileLabForm();
    }
  };

  const closeMobileLabModal = () => {
    setEditingMobileLabSchedule(null);
    setShowMobileLabModal(false);
    resetMobileLabForm();
  };

  const resetMobileLabForm = () => {
    setMobileLabFormData({
      dayOfWeek: 0,
      location: {
        name: '',
        address: '',
        barangay: '',
        municipality: 'Nueva Vizcaya'
      },
      timeSlot: {
        startTime: '',
        endTime: '',
        timeDisplay: ''
      },
      status: 'Scheduled',
      availableServices: [],
      capacity: {
        maxPatients: 50,
        currentBookings: 0
      },
      notes: '',
      contactInfo: {
        phone: '',
        email: '',
        contactPerson: ''
      },
      assignedTeam: {
        medTech: '',
        driver: '',
        coordinator: ''
      },
      equipment: [],
      recurring: {
        isRecurring: true,
        frequency: 'Weekly',
        startDate: '',
        endDate: ''
      },
      weatherDependent: false,
      priority: 'Medium',
      isActive: true
    });
  };

  // Finance data fetching functions
  const fetchFinanceData = async () => {
    setFinanceLoading(true);
    setFinanceError('');
    try {
      // Fetch finance stats for all finance sections
      const statsData = await financeAPI.getFinanceStats();
      if (statsData.success) {
        setFinanceStats(statsData.data);
      }

      // Fetch specific data based on active section
      switch (activeSection) {
        case 'bills':
          await fetchBills();
          break;
        case 'transaction':
          await fetchTransactions();
          break;
        case 'payments':
          await fetchPayments();
          break;
        case 'billing-rates':
          await fetchBillingRates();
          break;
      }
    } catch (err) {
      setFinanceError(err.message || 'Failed to fetch finance data');
      console.error('Finance data fetch error:', err);
    } finally {
      setFinanceLoading(false);
    }
  };

  const fetchBills = async (params = {}) => {
    try {
      const data = await financeAPI.getBills(params);
      if (data.success) {
        setBills(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    }
  };

  const fetchTransactions = async (params = {}) => {
    try {
      const data = await financeAPI.getTransactions(params);
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchPayments = async (params = {}) => {
    try {
      console.log('🔄 Fetching payments...');
      const data = await financeAPI.getPayments(params);
      console.log('📊 Payments API response:', data);
      if (data.success) {
        console.log('✅ Setting payments:', data.data || []);
        console.log('🔍 Payment structure sample:', data.data?.[0]);
        setPayments(data.data || []);
      }
    } catch (err) {
      console.error('❌ Failed to fetch payments:', err);
      // For testing purposes, set mock data if backend is not available
      console.log('🔧 Setting mock payment data for testing...');
      setPayments([
        {
          _id: '1',
          paymentId: 'PAY-2025-0001',
          billId: 'BL-2025-001',
          patientName: 'Maria Santos',
          amountPaid: 2500,
          paymentMethod: 'credit_card',
          status: 'pending',
          paymentDate: new Date().toISOString(),
          verifiedBy: null
        },
        {
          _id: '2',
          paymentId: 'PAY-2025-0002',
          billId: 'BL-2025-002',
          patientName: 'Carlos Rodriguez',
          amountPaid: 1400,
          paymentMethod: 'cash',
          status: 'verified',
          paymentDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          verifiedBy: 'Admin User'
        }
      ]);
    }
  };

  const fetchBillingRates = async (params = {}) => {
    try {
      console.log('🔄 Fetching billing rates...');
      const data = await financeAPI.getBillingRates(params);
      console.log('📊 Billing rates API response:', data);
      if (data.success) {
        console.log('✅ Setting billing rates:', data.data || []);
        setBillingRates(data.data || []);
      }
    } catch (err) {
      console.error('❌ Failed to fetch billing rates:', err);
      // For testing purposes, set mock data if backend is not available
      console.log('🔧 Setting mock billing rate data for testing...');
      setBillingRates([
        {
          _id: '1',
          serviceName: 'Complete Blood Count (CBC)',
          serviceCode: 'CBC-001',
          category: 'hematology',
          price: 800,
          turnaroundTime: '2-4 hours',
          sampleType: 'Blood',
          description: 'Complete blood count with differential',
          isPackage: false,
          isActive: true
        },
        {
          _id: '2',
          serviceName: 'Lipid Profile',
          serviceCode: 'LIPID-001',
          category: 'chemistry',
          price: 1500,
          turnaroundTime: '4-6 hours',
          sampleType: 'Blood (Fasting)',
          description: 'Complete lipid panel including cholesterol',
          isPackage: false,
          isActive: true
        },
        {
          _id: '3',
          serviceName: 'Basic Health Package',
          serviceCode: 'PKG-BASIC',
          category: 'package',
          price: 3500,
          turnaroundTime: '1 day',
          sampleType: 'Blood, Urine',
          description: 'CBC, Urinalysis, FBS, Lipid Profile',
          isPackage: true,
          packageItems: ['CBC', 'Urinalysis', 'FBS', 'Lipid Profile'],
          packageSavings: 500,
          isActive: true
        },
        {
          _id: '4',
          serviceName: 'Chest X-Ray',
          serviceCode: 'XRAY-CHEST',
          category: 'radiology',
          price: 1200,
          turnaroundTime: '30 minutes',
          sampleType: 'N/A',
          description: 'Digital chest X-ray examination',
          emergencyRate: 1800,
          isPackage: false,
          isActive: true
        }
      ]);
    }
  };

  // Finance Action Handlers
  const handleEditBill = (bill) => {
    console.log('Edit bill:', bill);
    openEditBillModal(bill);
  };

  const handleViewBill = (bill) => {
    console.log('View bill clicked:', bill);
    console.log('Bill data:', JSON.stringify(bill, null, 2));
    openViewBillModal(bill);
  };

  const handleSendBill = async (bill) => {
    try {
      console.log('Sending bill:', bill);
      // TODO: Implement actual email/SMS sending
      alert(`Bill ${bill.billId} sent to ${bill.patientName}\nAmount: ₱${bill.totalAmount?.toLocaleString()}`);
    } catch (error) {
      console.error('Failed to send bill:', error);
      alert('Failed to send bill. Please try again.');
    }
  };

  const handlePrintBill = (bill) => {
    console.log('Printing bill:', bill);
    // TODO: Implement actual printing
    const printContent = `
      MDLAB DIRECT - LABORATORY BILL
      ================================
      Bill ID: ${bill.billId}
      Patient: ${bill.patientName}
      Date Issued: ${new Date(bill.dateIssued).toLocaleDateString()}
      Due Date: ${new Date(bill.dueDate).toLocaleDateString()}
      
      Services:
      ${bill.services?.map(s => `- ${s.name}: ₱${s.price}`).join('\n') || 'No services listed'}
      
      Total Amount: ₱${bill.totalAmount?.toLocaleString()}
      Status: ${bill.status?.toUpperCase()}
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Bill ${bill.billId}</title></head>
        <body style="font-family: monospace; white-space: pre-line;">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintReceipt = (transaction) => {
    console.log('Printing receipt:', transaction);
    const receiptContent = `
      MDLAB DIRECT - PAYMENT RECEIPT
      ===============================
      Transaction ID: ${transaction.transactionId}
      Patient: ${transaction.patientName}
      Date: ${new Date(transaction.transactionDate).toLocaleDateString()}
      
      Description: ${transaction.description}
      Payment Method: ${transaction.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
      Amount: ₱${transaction.amount?.toLocaleString()}
      Status: ${transaction.status?.toUpperCase()}
      
      Thank you for your payment!
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Receipt ${transaction.transactionId}</title></head>
        <body style="font-family: monospace; white-space: pre-line;">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRefundTransaction = async (transaction) => {
    if (transaction.status !== 'completed') {
      alert('Only completed transactions can be refunded.');
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to refund this transaction?\n\n` +
      `Transaction ID: ${transaction.transactionId}\n` +
      `Patient: ${transaction.patientName}\n` +
      `Amount: ₱${transaction.amount?.toLocaleString()}\n\n` +
      `This action cannot be undone.`
    );

    if (confirmation) {
      try {
        console.log('Processing refund for:', transaction);
        // TODO: Implement actual refund API call
        alert(`Refund processed for Transaction ${transaction.transactionId}\nAmount: ₱${transaction.amount?.toLocaleString()}`);
        // Refresh transactions after refund
        fetchTransactions();
      } catch (error) {
        console.error('Failed to process refund:', error);
        alert('Failed to process refund. Please try again.');
      }
    }
  };

  const handlePrintPaymentReceipt = (payment) => {
    console.log('Printing payment receipt:', payment);
    const receiptContent = `
      MDLAB DIRECT - PAYMENT RECEIPT
      ===============================
      Payment ID: ${payment.paymentId}
      Bill ID: ${payment.billId?.billId || payment.billId || 'N/A'}
      Patient: ${payment.patientName}
      Date: ${new Date(payment.paymentDate).toLocaleDateString()}
      
      Amount: ₱${payment.amountPaid?.toLocaleString()}
      Payment Method: ${payment.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
      Reference: ${payment.referenceNumber || 'N/A'}
      Status: ${payment.status?.toUpperCase()}
      
      Thank you for your payment!
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Payment Receipt ${payment.paymentId}</title></head>
        <body style="font-family: monospace; white-space: pre-line;">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleVerifyPayment = async (payment) => {
    const confirmation = window.confirm(
      `Verify this payment?\n\n` +
      `Payment ID: ${payment.paymentId}\n` +
      `Patient: ${payment.patientName}\n` +
      `Amount: ₱${payment.amount?.toLocaleString()}\n` +
      `Method: ${payment.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}`
    );

    if (confirmation) {
      try {
        console.log('Verifying payment:', payment);
        // TODO: Call verify payment API
        const result = await financeAPI.verifyPayment(payment._id);
        if (result.success) {
          alert(`Payment ${payment.paymentId} verified successfully!`);
          // Refresh payments after verification
          fetchPayments();
        }
      } catch (error) {
        console.error('Failed to verify payment:', error);
        alert('Failed to verify payment. Please try again.');
      }
    }
  };

  const handleDisputePayment = (payment) => {
    const reason = prompt(
      `Dispute Payment ${payment.paymentId}\n\n` +
      `Patient: ${payment.patientName}\n` +
      `Amount: ₱${payment.amount?.toLocaleString()}\n\n` +
      `Please enter the reason for dispute:`
    );

    if (reason && reason.trim()) {
      try {
        console.log('Disputing payment:', payment, 'Reason:', reason);
        // TODO: Implement dispute API call
        alert(`Payment ${payment.paymentId} marked as disputed.\nReason: ${reason}`);
        // Refresh payments after dispute
        fetchPayments();
      } catch (error) {
        console.error('Failed to dispute payment:', error);
        alert('Failed to mark payment as disputed. Please try again.');
      }
    }
  };

  const handleCreateBill = () => {
    console.log('Create new bill');
    openCreateBillModal();
  };

  const handleDeleteBill = async (bill) => {
    // Security check: Only allow deletion of draft bills
    if (bill.status !== 'draft') {
      alert('Only draft bills can be deleted. Finalized bills must be kept for audit purposes.');
      return;
    }

    const confirmation = window.confirm(
      `⚠️ FINANCIAL RECORD DELETION ⚠️\n\n` +
      `Are you absolutely sure you want to delete this bill?\n\n` +
      `Bill ID: ${bill.billId}\n` +
      `Patient: ${bill.patientName}\n` +
      `Amount: ₱${bill.totalAmount?.toLocaleString()}\n` +
      `Status: ${bill.status}\n\n` +
      `⚠️ WARNING: This action cannot be undone!\n` +
      `This will permanently remove the financial record.\n\n` +
      `Only proceed if this is a test/duplicate record.`
    );

    if (confirmation) {
      const doubleConfirmation = window.confirm(
        `FINAL CONFIRMATION\n\n` +
        `Type reason for deletion:\n` +
        `• Test record\n` +
        `• Duplicate entry\n` +
        `• Data entry error\n\n` +
        `Click OK to proceed with deletion.`
      );

      if (doubleConfirmation) {
        setLoading(true);
        try {
          const result = await financeAPI.deleteBill(bill._id);
          if (result.success) {
            setBills(prev => prev.filter(b => b._id !== bill._id));
            alert(`Bill ${bill.billId} has been permanently deleted.`);
          }
        } catch (error) {
          console.error('Failed to delete bill:', error);
          alert('Failed to delete bill. Please try again or contact support.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleRecordPayment = () => {
    console.log('Record new payment');
    openCreatePaymentModal();
  };

  // Billing Rates CRUD Functions
  const handleCreateBillingRate = async (billingRateData) => {
    setLoading(true);
    try {
      const result = await financeAPI.createBillingRate(billingRateData);
      if (result.success) {
        setBillingRates(prev => [result.data, ...prev]);
        closeBillingRateModals();
        resetBillingRateForm();
        alert('Billing rate created successfully!');
      }
    } catch (err) {
      console.error('Failed to create billing rate:', err);
      alert(err.message || 'Failed to create billing rate');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBillingRate = async (billingRateId, billingRateData) => {
    setLoading(true);
    try {
      const result = await financeAPI.updateBillingRate(billingRateId, billingRateData);
      if (result.success) {
        setBillingRates(prev => prev.map(rate => 
          rate._id === billingRateId ? result.data : rate
        ));
        closeBillingRateModals();
        resetBillingRateForm();
        alert('Billing rate updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update billing rate:', err);
      alert(err.message || 'Failed to update billing rate');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBillingRate = async (billingRate) => {
    const confirmation = confirm(
      `⚠️ DELETE BILLING RATE\n\n` +
      `You are about to delete:\n` +
      `• Service: ${billingRate.serviceName}\n` +
      `• Code: ${billingRate.serviceCode}\n` +
      `• Price: ₱${billingRate.price}\n\n` +
      `This action is PERMANENT and cannot be undone.\n\n` +
      `Are you sure you want to proceed?`
    );

    if (!confirmation) return;

    const doubleConfirmation = confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `This will permanently delete the billing rate "${billingRate.serviceName}".\n\n` +
      `Reasons to keep this rate:\n` +
      `• Historical billing records\n` +
      `• Existing patient bills\n` +
      `• Audit requirements\n\n` +
      `Click OK to proceed with deletion.`
    );

    if (doubleConfirmation) {
      setLoading(true);
      try {
        const result = await financeAPI.deleteBillingRate(billingRate._id);
        if (result.success) {
          setBillingRates(prev => prev.filter(rate => rate._id !== billingRate._id));
          alert(`Billing rate "${billingRate.serviceName}" has been permanently deleted.`);
        }
      } catch (err) {
        console.error('Failed to delete billing rate:', err);
        alert(err.message || 'Failed to delete billing rate');
      } finally {
        setLoading(false);
      }
    }
  };

  // Billing Rates Modal Functions
  const openCreateBillingRateModal = () => {
    resetBillingRateForm();
    setShowCreateBillingRateModal(true);
  };

  const openEditBillingRateModal = (billingRate) => {
    setSelectedBillingRate(billingRate);
    setBillingRateServiceName(billingRate.serviceName || '');
    setBillingRateServiceCode(billingRate.serviceCode || '');
    setBillingRateCategory(billingRate.category || 'hematology');
    setBillingRatePrice(billingRate.price?.toString() || '');
    setBillingRateTurnaroundTime(billingRate.turnaroundTime || '');
    setBillingRateSampleType(billingRate.sampleType || '');
    setBillingRateDescription(billingRate.description || '');
    setBillingRateIsPackage(billingRate.isPackage || false);
    setBillingRatePackageItems(billingRate.packageItems || []);
    setBillingRatePackageSavings(billingRate.packageSavings?.toString() || '');
    setBillingRateEmergencyRate(billingRate.emergencyRate?.toString() || '');
    setShowEditBillingRateModal(true);
  };

  const openViewBillingRateModal = (billingRate) => {
    setSelectedBillingRate(billingRate);
    setShowViewBillingRateModal(true);
  };

  const closeBillingRateModals = () => {
    setShowCreateBillingRateModal(false);
    setShowEditBillingRateModal(false);
    setShowViewBillingRateModal(false);
    setSelectedBillingRate(null);
  };

  const resetBillingRateForm = () => {
    setBillingRateServiceName('');
    setBillingRateServiceCode('');
    setBillingRateCategory('hematology');
    setBillingRatePrice('');
    setBillingRateTurnaroundTime('');
    setBillingRateSampleType('');
    setBillingRateDescription('');
    setBillingRateIsPackage(false);
    setBillingRatePackageItems([]);
    setBillingRatePackageSavings('');
    setBillingRateEmergencyRate('');
  };

  const handleAddBillingRate = () => {
    openCreateBillingRateModal();
  };

  // Reports Management Functions
  const generateReport = async (type) => {
    setIsGeneratingReport(true);
    setReportType(type);
    
    try {
      // Simulate API call - in real implementation, this would call backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let reportData = [];
      let summary = { ...reportSummary };
      
      switch(type) {
        case 'daily-sales':
          reportData = generateDailySalesData();
          summary = calculateDailySalesSummary(reportData);
          break;
        case 'weekly-revenue':
          reportData = generateWeeklyRevenueData();
          summary = calculateWeeklyRevenueSummary(reportData);
          break;
        case 'monthly-financial':
          reportData = generateMonthlyFinancialData();
          summary = calculateMonthlyFinancialSummary(reportData);
          break;
        case 'outstanding-bills':
          reportData = generateOutstandingBillsData();
          summary = calculateOutstandingBillsSummary(reportData);
          break;
        case 'payment-methods':
          reportData = generatePaymentMethodsData();
          summary = calculatePaymentMethodsSummary(reportData);
          break;
        case 'overdue-accounts':
          reportData = generateOverdueAccountsData();
          summary = calculateOverdueAccountsSummary(reportData);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      setCurrentReport(reportData);
      setReportSummary(summary);
      setShowReportModal(true);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateDailySalesData = () => {
    const data = [];
    const startDate = new Date(reportDateRange.startDate);
    const endDate = new Date(reportDateRange.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const sales = Math.floor(Math.random() * 50000) + 10000;
      const transactions = Math.floor(Math.random() * 50) + 10;
      data.push({
        date: new Date(d).toISOString().split('T')[0],
        sales: sales,
        transactions: transactions,
        avgTransactionValue: Math.round(sales / transactions),
        cash: Math.round(sales * 0.45),
        card: Math.round(sales * 0.35),
        online: Math.round(sales * 0.20)
      });
    }
    return data;
  };

  const generateWeeklyRevenueData = () => {
    const weeks = [];
    const endDate = new Date(reportDateRange.endDate);
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(endDate);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const revenue = Math.floor(Math.random() * 200000) + 100000;
      weeks.push({
        week: `Week ${12 - i}`,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        revenue: revenue,
        growth: (Math.random() - 0.5) * 20,
        transactions: Math.floor(Math.random() * 200) + 100,
        newPatients: Math.floor(Math.random() * 30) + 10
      });
    }
    return weeks;
  };

  const generateMonthlyFinancialData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 0; i <= currentMonth; i++) {
      const revenue = Math.floor(Math.random() * 800000) + 400000;
      const expenses = Math.floor(revenue * (0.3 + Math.random() * 0.2));
      data.push({
        month: months[i],
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses,
        profitMargin: Math.round(((revenue - expenses) / revenue) * 100),
        tests: Math.floor(Math.random() * 1000) + 500,
        patients: Math.floor(Math.random() * 800) + 400
      });
    }
    return data;
  };

  const generateOutstandingBillsData = () => {
    const bills = [];
    const statuses = ['pending', 'overdue', 'partial'];
    const categories = ['Laboratory', 'Radiology', 'Package', 'Emergency'];
    
    for (let i = 1; i <= 50; i++) {
      const amount = Math.floor(Math.random() * 5000) + 500;
      const daysOld = Math.floor(Math.random() * 90);
      const issueDate = new Date();
      issueDate.setDate(issueDate.getDate() - daysOld);
      
      bills.push({
        billId: `BILL-${String(i).padStart(4, '0')}`,
        patientName: `Patient ${i}`,
        amount: amount,
        issueDate: issueDate.toISOString().split('T')[0],
        daysOutstanding: daysOld,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        contactInfo: `patient${i}@example.com`
      });
    }
    return bills;
  };

  const generatePaymentMethodsData = () => {
    return [
      { method: 'Cash', amount: 450000, percentage: 45, transactions: 320, avgAmount: 1406 },
      { method: 'Credit Card', amount: 350000, percentage: 35, transactions: 280, avgAmount: 1250 },
      { method: 'Debit Card', amount: 120000, percentage: 12, transactions: 150, avgAmount: 800 },
      { method: 'Online Transfer', amount: 80000, percentage: 8, transactions: 100, avgAmount: 800 }
    ];
  };

  const generateOverdueAccountsData = () => {
    const accounts = [];
    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    
    for (let i = 1; i <= 30; i++) {
      const amount = Math.floor(Math.random() * 10000) + 1000;
      const daysOverdue = Math.floor(Math.random() * 180) + 30;
      
      accounts.push({
        accountId: `ACC-${String(i).padStart(4, '0')}`,
        patientName: `Patient ${i}`,
        amount: amount,
        daysOverdue: daysOverdue,
        riskLevel: riskLevels[Math.min(Math.floor(daysOverdue / 45), 3)],
        lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        phone: `+63${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `patient${i}@example.com`
      });
    }
    return accounts.sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  const calculateDailySalesSummary = (data) => ({
    totalRevenue: data.reduce((sum, day) => sum + day.sales, 0),
    totalTransactions: data.reduce((sum, day) => sum + day.transactions, 0),
    avgDailySales: Math.round(data.reduce((sum, day) => sum + day.sales, 0) / data.length),
    avgTransactionValue: Math.round(data.reduce((sum, day) => sum + day.avgTransactionValue, 0) / data.length),
    cashPercentage: 45,
    cardPercentage: 35,
    onlinePercentage: 20
  });

  const calculateWeeklyRevenueSummary = (data) => ({
    totalRevenue: data.reduce((sum, week) => sum + week.revenue, 0),
    avgWeeklyRevenue: Math.round(data.reduce((sum, week) => sum + week.revenue, 0) / data.length),
    totalTransactions: data.reduce((sum, week) => sum + week.transactions, 0),
    totalNewPatients: data.reduce((sum, week) => sum + week.newPatients, 0),
    growthRate: Math.round(data.reduce((sum, week) => sum + week.growth, 0) / data.length * 100) / 100
  });

  const calculateMonthlyFinancialSummary = (data) => ({
    totalRevenue: data.reduce((sum, month) => sum + month.revenue, 0),
    totalExpenses: data.reduce((sum, month) => sum + month.expenses, 0),
    totalProfit: data.reduce((sum, month) => sum + month.profit, 0),
    avgProfitMargin: Math.round(data.reduce((sum, month) => sum + month.profitMargin, 0) / data.length),
    totalTests: data.reduce((sum, month) => sum + month.tests, 0),
    totalPatients: data.reduce((sum, month) => sum + month.patients, 0)
  });

  const calculateOutstandingBillsSummary = (data) => ({
    totalOutstanding: data.reduce((sum, bill) => sum + bill.amount, 0),
    totalBills: data.length,
    pendingBills: data.filter(bill => bill.status === 'pending').length,
    overdueBills: data.filter(bill => bill.status === 'overdue').length,
    avgDaysOutstanding: Math.round(data.reduce((sum, bill) => sum + bill.daysOutstanding, 0) / data.length),
    oldestBill: Math.max(...data.map(bill => bill.daysOutstanding))
  });

  const calculatePaymentMethodsSummary = (data) => ({
    totalAmount: data.reduce((sum, method) => sum + method.amount, 0),
    totalTransactions: data.reduce((sum, method) => sum + method.transactions, 0),
    mostPopularMethod: data.reduce((prev, current) => prev.transactions > current.transactions ? prev : current).method,
    highestValueMethod: data.reduce((prev, current) => prev.avgAmount > current.avgAmount ? prev : current).method
  });

  const calculateOverdueAccountsSummary = (data) => ({
    totalOverdue: data.reduce((sum, account) => sum + account.amount, 0),
    totalAccounts: data.length,
    criticalAccounts: data.filter(account => account.riskLevel === 'Critical').length,
    highRiskAccounts: data.filter(account => account.riskLevel === 'High').length,
    avgDaysOverdue: Math.round(data.reduce((sum, account) => sum + account.daysOverdue, 0) / data.length),
    oldestAccount: Math.max(...data.map(account => account.daysOverdue))
  });

  const closeReportModal = () => {
    setShowReportModal(false);
    setCurrentReport(null);
    setReportType('');
  };

  const exportReport = (format) => {
    try {
      setReportExportFormat(format);
      
      // Simulate export functionality
      const reportName = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(currentReport, reportName);
      } else if (format === 'pdf') {
        exportToPDF(currentReport, reportName);
      } else if (format === 'excel') {
        exportToExcel(currentReport, reportName);
      }
      
      alert(`Report exported as ${format.toUpperCase()}: ${reportName}.${format}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(field => row[field]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data, filename) => {
    // Simulate PDF export
    console.log('Exporting to PDF:', filename, data);
  };

  const exportToExcel = (data, filename) => {
    // Simulate Excel export
    console.log('Exporting to Excel:', filename, data);
  };

  const filterReportData = (data) => {
    if (!data) return [];
    
    return data.filter(item => {
      let matches = true;
      
      if (reportFilters.status !== 'all' && item.status) {
        matches = matches && item.status === reportFilters.status;
      }
      
      if (reportFilters.category !== 'all' && item.category) {
        matches = matches && item.category === reportFilters.category;
      }
      
      if (reportFilters.minAmount && item.amount) {
        matches = matches && item.amount >= parseFloat(reportFilters.minAmount);
      }
      
      if (reportFilters.maxAmount && item.amount) {
        matches = matches && item.amount <= parseFloat(reportFilters.maxAmount);
      }
      
      return matches;
    });
  };

  // Transaction CRUD Functions
  const handleCreateTransaction = async (transactionData) => {
    setLoading(true);
    try {
      const newTransaction = {
        ...transactionData,
        transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        processedBy: currentUser.username,
        processedAt: new Date()
      };

      const result = await financeAPI.createTransaction(newTransaction);
      if (result.success) {
        setTransactions(prev => [result.data, ...prev]);
        closeTransactionModals();
        alert('Transaction created successfully!');
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
      setError('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    setLoading(true);
    try {
      const result = await financeAPI.updateTransaction(selectedTransaction._id, transactionData);
      if (result.success) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction._id === selectedTransaction._id ? result.data : transaction
          )
        );
        closeTransactionModals();
        alert('Transaction updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      setError('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find(t => t._id === transactionId);
    
    // Security check: Only allow deletion of failed/cancelled transactions
    if (transaction && !['failed', 'cancelled'].includes(transaction.status)) {
      alert('Only failed or cancelled transactions can be deleted.\n\nCompleted transactions must be kept for audit purposes.\nUse "Refund" for completed transactions instead.');
      return;
    }

    const confirmation = window.confirm(
      `⚠️ FINANCIAL TRANSACTION DELETION ⚠️\n\n` +
      `Are you absolutely sure you want to delete this transaction?\n\n` +
      `Transaction ID: ${transaction?.transactionId}\n` +
      `Patient: ${transaction?.patientName}\n` +
      `Amount: ₱${transaction?.amount?.toLocaleString()}\n` +
      `Status: ${transaction?.status}\n` +
      `Type: ${transaction?.type}\n\n` +
      `⚠️ WARNING: This action cannot be undone!\n` +
      `This will permanently remove the financial record.\n\n` +
      `Only proceed if this is a failed/test transaction.`
    );

    if (confirmation) {
      const reasonConfirmation = prompt(
        `FINAL CONFIRMATION - Enter deletion reason:\n\n` +
        `Valid reasons:\n` +
        `• "test" - Test transaction\n` +
        `• "duplicate" - Duplicate entry\n` +
        `• "error" - Data entry error\n` +
        `• "failed" - Failed payment cleanup\n\n` +
        `Enter reason to confirm deletion:`
      );

      const validReasons = ['test', 'duplicate', 'error', 'failed'];
      if (reasonConfirmation && validReasons.includes(reasonConfirmation.toLowerCase().trim())) {
        setLoading(true);
        try {
          const result = await financeAPI.deleteTransaction(transactionId);
          if (result.success) {
            setTransactions(prev => prev.filter(transaction => transaction._id !== transactionId));
            alert(`Transaction ${transaction?.transactionId} has been permanently deleted.\nReason: ${reasonConfirmation}`);
          }
        } catch (error) {
          console.error('Failed to delete transaction:', error);
          setError('Failed to delete transaction. Please try again or contact support.');
        } finally {
          setLoading(false);
        }
      } else if (reasonConfirmation !== null) {
        alert('Invalid reason provided. Deletion cancelled for security.');
      }
    }
  };

  const handleViewTransaction = (transaction) => {
    console.log('View transaction:', transaction);
    openViewTransactionModal(transaction);
  };

  const handleNewTransaction = () => {
    console.log('Create new transaction');
    openCreateTransactionModal();
  };

  // Payment CRUD Functions
  const handleCreatePayment = async (paymentData) => {
    setLoading(true);
    try {
      const newPayment = {
        ...paymentData,
        paymentId: `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        verifiedBy: paymentData.status === 'verified' ? currentUser.username : null,
        verificationDate: paymentData.status === 'verified' ? new Date() : null
      };

      const result = await financeAPI.createPayment(newPayment);
      if (result.success) {
        setPayments(prev => [result.data, ...prev]);
        closePaymentModals();
        alert('Payment record created successfully!');
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      setError('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = async (paymentData) => {
    setLoading(true);
    try {
      const result = await financeAPI.updatePayment(selectedPayment._id, paymentData);
      if (result.success) {
        setPayments(prev => 
          prev.map(payment => 
            payment._id === selectedPayment._id ? result.data : payment
          )
        );
        closePaymentModals();
        alert('Payment updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
      setError('Failed to update payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const payment = payments.find(p => p._id === paymentId);
    
    // Security check: Only allow deletion of pending/disputed payments
    if (payment && !['pending', 'disputed'].includes(payment.status)) {
      alert('Only pending or disputed payment records can be deleted.\n\nVerified payments must be kept for audit purposes.');
      return;
    }

    const confirmation = window.confirm(
      `⚠️ PAYMENT RECORD DELETION ⚠️\n\n` +
      `Are you sure you want to delete this payment record?\n\n` +
      `Payment ID: ${payment?.paymentId}\n` +
      `Patient: ${payment?.patientName}\n` +
      `Amount: ₱${payment?.amountPaid?.toLocaleString()}\n` +
      `Status: ${payment?.status}\n\n` +
      `⚠️ WARNING: This action cannot be undone!\n` +
      `Only proceed if this is a duplicate/error record.`
    );

    if (confirmation) {
      setLoading(true);
      try {
        const result = await financeAPI.deletePayment(paymentId);
        if (result.success) {
          setPayments(prev => prev.filter(payment => payment._id !== paymentId));
          alert(`Payment record ${payment?.paymentId} has been deleted.`);
        }
      } catch (error) {
        console.error('Failed to delete payment:', error);
        setError('Failed to delete payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewPayment = (payment) => {
    console.log('View payment:', payment);
    openViewPaymentModal(payment);
  };

  const handleNewPayment = () => {
    console.log('Create new payment');
    openCreatePaymentModal();
  };

  const handleExportReport = () => {
    console.log('Export financial report');
    // TODO: Implement export functionality
    const reportData = {
      date: new Date().toISOString(),
      stats: financeStats,
      bills: bills.length,
      transactions: transactions.length,
      payments: payments.length
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mdlab-finance-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAdvancedFilter = () => {
    console.log('Open advanced filter');
    // TODO: Open advanced filter modal
    alert('Advanced Filter - Modal to be implemented');
  };

  const renderPageTitle = () => {
    switch (activeSection) {
      case 'patients': return 'Patient Management';
      case 'medtech': return 'MedTech Management';
      case 'pathologist': return 'Pathologist Management';
      case 'receptionist': return 'Receptionist Management';
      case 'admin': return 'Administrator Management';
      case 'bills': return 'Bills Management';
      case 'transaction': return 'Transaction History';
      case 'payments': return 'Payment Records';
      case 'billing-rates': return 'Billing Rates';
      case 'reports': return 'Financial Reports';
      case 'logs': return 'System Logs';
      case 'services': return 'Lab Services';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'patients': return renderPatientManagement();
      case 'medtech': return renderMedTechManagement();
      case 'pathologist': return renderPathologistManagement();
      case 'receptionist': return renderReceptionistManagement();
      case 'admin': return renderAdminManagement();
      case 'bills': return renderBillsManagement();
      case 'transaction': return renderTransactionHistory();
      case 'payments': return renderPaymentRecords();
      case 'billing-rates': return renderBillingRates();
      case 'reports': return renderFinancialReports();
      case 'logs': return renderSystemLogs();
      case 'services': return renderServices();
      case 'mobile-lab': return renderMobileLabManagement();
      default: return renderDashboardHome();
    }
  };

  // Mobile Lab Management Function
  const renderMobileLabManagement = () => (
    <div className="management-container mobile-lab-management">
      <div className="management-header">
        <div className="management-title">
          <h2>Mobile Lab Schedules</h2>
          <p>Manage monthly mobile laboratory visits to Nueva Vizcaya with special discounted rates</p>
        </div>
        <button className="add-btn" onClick={() => openMobileLabModal()}>
          + Add New Schedule
        </button>
      </div>

      <div className="management-stats mobile-lab-stats">
        <div className="stat-card mobile-lab-stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Schedules</div>
            <div className="stat-value">{mobileLabSchedules.length}</div>
          </div>
        </div>
        <div className="stat-card mobile-lab-stat-card">
          <div className="stat-info">
            <div className="stat-label">Active Schedules</div>
            <div className="stat-value">{mobileLabSchedules.filter(s => s.isActive).length}</div>
          </div>
        </div>
        <div className="stat-card mobile-lab-stat-card">
          <div className="stat-info">
            <div className="stat-label">Locations</div>
            <div className="stat-value">{new Set(mobileLabSchedules.map(s => s.location?.barangay)).size}</div>
          </div>
        </div>
        <div className="stat-card mobile-lab-stat-card">
          <div className="stat-info">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{mobileLabSchedules.filter(s => s.status === 'Active' || s.status === 'Scheduled').length}</div>
          </div>
        </div>
      </div>

      <div className="management-filters">
        <div className="filter-group">
          <select 
            value={mobileLabFilters.dayOfWeek} 
            onChange={(e) => setMobileLabFilters({...mobileLabFilters, dayOfWeek: e.target.value})}
          >
            <option value="">All Days</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>
        </div>
        <div className="filter-group">
          <select 
            value={mobileLabFilters.status} 
            onChange={(e) => setMobileLabFilters({...mobileLabFilters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Next Location">Next Location</option>
            <option value="On Call">On Call</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search municipality..."
            value={mobileLabFilters.municipality}
            onChange={(e) => setMobileLabFilters({...mobileLabFilters, municipality: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search barangay..."
            value={mobileLabFilters.barangay}
            onChange={(e) => setMobileLabFilters({...mobileLabFilters, barangay: e.target.value})}
          />
        </div>
        <button className="filter-btn" onClick={() => fetchMobileLabSchedules(1)}>
          Apply Filters
        </button>
        <button 
          className="clear-filters-btn" 
          onClick={() => {
            setMobileLabFilters({
              dayOfWeek: '',
              status: '',
              municipality: '',
              barangay: '',
              isActive: '',
              search: ''
            });
            fetchMobileLabSchedules(1);
          }}
        >
          Clear
        </button>
      </div>

      <div className="table-container">
        {mobileLabError && (
          <div className="error-message">{mobileLabError}</div>
        )}
        
        {mobileLabLoading ? (
          <div className="loading-state">Loading mobile lab schedules...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Team</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mobileLabSchedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    📋 No mobile lab schedules found
                    <br />
                    <small>Create your first schedule to get started</small>
                  </td>
                </tr>
              ) : (
                mobileLabSchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td>
                      <strong>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                      </strong>
                    </td>
                    <td>
                      <div className="location-details">
                        <div className="location-name">{schedule.location?.name}</div>
                        <div className="location-address">
                          {schedule.location?.barangay}
                          {schedule.location?.municipality && `, ${schedule.location?.municipality}`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {schedule.timeSlot?.timeDisplay || 
                         `${schedule.timeSlot?.startTime} - ${schedule.timeSlot?.endTime}`}
                      </strong>
                    </td>
                    <td>
                      <select 
                        value={schedule.status} 
                        onChange={(e) => handleUpdateScheduleStatus(schedule._id, e.target.value)}
                        className={`status-select status-${schedule.status?.toLowerCase().replace(' ', '-')}`}
                      >
                        <option value="Active">Active</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Next Location">Next Location</option>
                        <option value="On Call">On Call</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <div className="capacity-display">
                        <div className="capacity-numbers">
                          {schedule.capacity?.currentBookings || 0} / {schedule.capacity?.maxPatients || 0}
                        </div>
                        <div className="capacity-bar">
                          <div 
                            className="capacity-fill" 
                            style={{ 
                              width: `${schedule.capacity?.maxPatients > 0 
                                ? (schedule.capacity?.currentBookings || 0) / schedule.capacity?.maxPatients * 100
                                : 0}%` 
                            }}
                          />
                        </div>
                        <div className="capacity-percentage">
                          {schedule.capacity?.maxPatients > 0 
                            ? `${Math.round((schedule.capacity?.currentBookings || 0) / schedule.capacity?.maxPatients * 100)}% filled`
                            : '0% filled'
                          }
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-assignment">
                        {schedule.assignedTeam?.medTech && (
                          <div className="team-member">
                            <span className="team-member-role">MedTech:</span>
                            {schedule.assignedTeam.medTech}
                          </div>
                        )}
                        {schedule.assignedTeam?.driver && (
                          <div className="team-member">
                            <span className="team-member-role">Driver:</span>
                            {schedule.assignedTeam.driver}
                          </div>
                        )}
                        {!schedule.assignedTeam?.medTech && !schedule.assignedTeam?.driver && (
                          <div className="team-unassigned">Not assigned</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => openMobileLabModal(schedule)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteMobileLabSchedule(schedule._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {mobileLabPagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => fetchMobileLabSchedules(mobileLabPagination.currentPage - 1)}
              disabled={mobileLabPagination.currentPage === 1}
            >
              ← Previous
            </button>
            <span>
              Page {mobileLabPagination.currentPage} of {mobileLabPagination.totalPages}
            </span>
            <button 
              onClick={() => fetchMobileLabSchedules(mobileLabPagination.currentPage + 1)}
              disabled={mobileLabPagination.currentPage === mobileLabPagination.totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Mobile Lab Modal */}
      {showMobileLabModal && (
        <div className="modal-overlay" onClick={closeMobileLabModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingMobileLabSchedule ? 'Edit Mobile Lab Schedule' : 'Add New Mobile Lab Schedule'}
              </h3>
              <button className="modal-close" onClick={closeMobileLabModal}>×</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingMobileLabSchedule) {
                handleUpdateMobileLabSchedule(editingMobileLabSchedule._id, mobileLabFormData);
              } else {
                handleCreateMobileLabSchedule(mobileLabFormData);
              }
            }}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select 
                      value={mobileLabFormData.dayOfWeek}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData, 
                        dayOfWeek: parseInt(e.target.value)
                      })}
                      required
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Bayombong Community Center"
                      value={mobileLabFormData.location.name}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        location: { ...mobileLabFormData.location, name: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="e.g., National Highway, Bayombong"
                      value={mobileLabFormData.location.address}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        location: { ...mobileLabFormData.location, address: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Barangay</label>
                    <input
                      type="text"
                      placeholder="e.g., Poblacion"
                      value={mobileLabFormData.location.barangay}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        location: { ...mobileLabFormData.location, barangay: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Municipality</label>
                    <input
                      type="text"
                      placeholder="e.g., Bayombong (Nueva Vizcaya only)"
                      value={mobileLabFormData.location.municipality}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        location: { ...mobileLabFormData.location, municipality: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g., 8:00 AM, 8 AM, 8:30 in the morning"
                      value={mobileLabFormData.timeSlot.startTime}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        timeSlot: { ...mobileLabFormData.timeSlot, startTime: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="text"
                      placeholder="e.g., 12:00 PM, 12 PM, 12 noon"
                      value={mobileLabFormData.timeSlot.endTime}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        timeSlot: { ...mobileLabFormData.timeSlot, endTime: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Patients</label>
                    <input
                      type="number"
                      placeholder="e.g., 30 (monthly visit capacity)"
                      value={mobileLabFormData.capacity.maxPatients}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        capacity: { ...mobileLabFormData.capacity, maxPatients: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="100"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      placeholder="Special instructions, discounted packages available, or important reminders for this monthly visit..."
                      value={mobileLabFormData.notes}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        notes: e.target.value
                      })}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g., +63 912 345 6789"
                      value={mobileLabFormData.contactInfo.phone}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        contactInfo: { ...mobileLabFormData.contactInfo, phone: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g., Juan Dela Cruz"
                      value={mobileLabFormData.contactInfo.contactPerson}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        contactInfo: { ...mobileLabFormData.contactInfo, contactPerson: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mobileLabFormData.isActive}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        isActive: e.target.checked
                      })}
                    />
                    <span>Active Schedule</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mobileLabFormData.weatherDependent}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        weatherDependent: e.target.checked
                      })}
                    />
                    <span>Weather Dependent</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mobileLabFormData.recurring.isRecurring}
                      onChange={(e) => setMobileLabFormData({
                        ...mobileLabFormData,
                        recurring: { ...mobileLabFormData.recurring, isRecurring: e.target.checked }
                      })}
                    />
                    <span>Monthly Recurring</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeMobileLabModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={mobileLabLoading}>
                  {mobileLabLoading ? 'Saving...' : (editingMobileLabSchedule ? 'Update Schedule' : 'Create Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardHome = () => {
    if (dashboardLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading dashboard data...
        </div>
      );
    }

    return (
    <>
      {/* Top Row Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{dashboardStats.totalUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Active Patients</div>
            <div className="stat-value">{dashboardStats.activePatients}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₱{dashboardStats.totalRevenue?.toLocaleString() || '0'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Services</div>
            <div className="stat-value">{dashboardStats.totalServices}</div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="middle-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h3>Monthly Revenue</h3>
          </div>
          <div className="chart-placeholder">
            <div className="chart-content">
              <div className="chart-title">Revenue Trends</div>
              <div className="chart-mock">
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '45%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
                <div className="chart-bar" style={{height: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <h3>Financial Overview</h3>
          </div>
          <div className="card-content">
            <div className="overview-item">
              <span className="overview-label">Total Bills</span>
              <span className="overview-value">{dashboardStats.totalBills}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Payments</span>
              <span className="overview-value">{dashboardStats.totalPayments}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Transactions</span>
              <span className="overview-value">{dashboardStats.totalTransactions}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Revenue</span>
              <span className="overview-value">₱{dashboardStats.totalRevenue?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        <div className="quick-access-card">
          <div className="card-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Patients
            </h3>
          </div>
          <div className="quick-access-content">
            <div className="access-item">
              <span>Total Patients</span>
              <span className="access-count">{dashboardStats.totalPatients}</span>
            </div>
            <div className="access-item">
              <span>Active Patients</span>
              <span className="access-count">{dashboardStats.activePatients}</span>
            </div>
          </div>
        </div>

        <div className="quick-access-card">
          <div className="card-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              MedTech
            </h3>
          </div>
          <div className="quick-access-content">
            <div className="access-item">
              <span>Total MedTech</span>
              <span className="access-count">{dashboardStats.totalMedTech}</span>
            </div>
            <div className="access-item">
              <span>Active MedTech</span>
              <span className="access-count">{dashboardStats.totalMedTech}</span>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="card-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              System Analytics
            </h3>
          </div>
          <div className="activity-content">
            <div className="activity-chart">
              <div className="analytics-title">System Overview</div>
              <div className="activity-stats">
                <div className="activity-stat">
                  <span>Total Logs</span>
                  <span className="stat-number">{dashboardStats.totalLogs}</span>
                </div>
                <div className="activity-stat">
                  <span>Services</span>
                  <span className="stat-number">{dashboardStats.totalServices}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    );
  };

  const renderPatientManagement = () => {
    const patients = users.filter(user => user.role === 'patient');
    const patientStats = userStats?.byRole?.find(stat => stat._id === 'patient') || { count: 0, active: 0 };
    
    return (
      <div className="management-container">
        {error && (
          <div className="error-message" style={{
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <div className="management-header">
          <div className="management-title">
            <h2>Patient Management</h2>
            <p>Manage patient records, view appointments, and track medical history</p>
          </div>
          <button className="add-btn" onClick={() => openUserModal()}>
            + Add New Patient
          </button>
        </div>

        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">{patientStats.count}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Patients</div>
              <div className="stat-value">{patientStats.active}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">New This Month</div>
              <div className="stat-value">{
                users.filter(user => 
                  user.role === 'patient' && 
                  new Date(user.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Filtered Results</div>
              <div className="stat-value">{patients.length}</div>
            </div>
          </div>
        </div>

        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading patients...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>P{patient.id.slice(-6)}</td>
                        <td>{patient.firstName} {patient.lastName}</td>
                        <td>{
                          patient.dateOfBirth ? 
                          Math.floor((Date.now() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) :
                          'N/A'
                        }</td>
                        <td>{patient.gender || 'N/A'}</td>
                        <td>{patient.phone || 'N/A'}</td>
                        <td>{patient.email}</td>
                        <td>
                          <span className={`status ${patient.isActive ? 'active' : 'inactive'}`}>
                            {patient.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => openViewPatientModal(patient)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => openUserModal(patient)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteUser(patient.id)}
                            >
                              Delete
                            </button>
                            <button 
                              className={`btn-toggle ${patient.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleUserStatus(patient.id, patient.isActive)}
                            >
                              {patient.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMedTechManagement = () => {
    const medtech = users.filter(user => user.role === 'medtech');
    const medtechStats = userStats?.byRole?.find(stat => stat._id === 'medtech') || { count: 0, active: 0 };
    
    return (
      <div className="management-container">
        {error && (
          <div className="error-message" style={{
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <div className="management-header">
          <div className="management-title">
            <h2>MedTech Management</h2>
            <p>Manage medical technologists, schedules, and performance</p>
          </div>
          <button className="add-btn" onClick={() => openUserModal()}>
            + Add New MedTech
          </button>
        </div>

        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total MedTech</div>
              <div className="stat-value">{medtechStats.count}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active MedTech</div>
              <div className="stat-value">{medtechStats.active}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">New This Month</div>
              <div className="stat-value">{
                users.filter(user => 
                  user.role === 'medtech' && 
                  new Date(user.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Filtered Results</div>
              <div className="stat-value">{medtech.length}</div>
            </div>
          </div>
        </div>

        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input 
                type="text" 
                placeholder="Search medtech..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All MedTech</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading medtech...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>MedTech ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medtech.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No medtech found
                      </td>
                    </tr>
                  ) : (
                    medtech.map((member) => (
                      <tr key={member.id}>
                        <td>MT{member.id.slice(-6)}</td>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>Medical Technologist</td>
                        <td>{member.email}</td>
                        <td>{member.phone || 'N/A'}</td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${member.isActive ? 'active' : 'inactive'}`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => openViewMedTechModal(member)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => openUserModal(member)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteUser(member.id)}
                            >
                              Delete
                            </button>
                            <button 
                              className={`btn-toggle ${member.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleUserStatus(member.id, member.isActive)}
                            >
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReceptionistManagement = () => {
    const receptionists = users.filter(user => user.role === 'receptionist');
    const receptionistStats = userStats?.byRole?.find(stat => stat._id === 'receptionist') || { count: 0, active: 0 };
    
    return (
      <div className="management-container">
        {error && (
          <div className="error-message" style={{
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <div className="management-header">
          <div className="management-title">
            <h2>Receptionist Management</h2>
            <p>Manage reception staff, appointments, and patient interactions</p>
          </div>
          <button className="add-btn" onClick={() => openUserModal()}>
            + Add New Receptionist
          </button>
        </div>

        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Receptionists</div>
              <div className="stat-value">{receptionistStats.count}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Receptionists</div>
              <div className="stat-value">{receptionistStats.active}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Filtered Results</div>
              <div className="stat-value">{receptionists.length}</div>
            </div>
          </div>
        </div>

        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input 
                type="text" 
                placeholder="Search receptionists..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Receptionists</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading receptionists...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Receptionist ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receptionists.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No receptionists found
                      </td>
                    </tr>
                  ) : (
                    receptionists.map((member) => (
                      <tr key={member.id}>
                        <td>RC{member.id.slice(-6)}</td>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>Receptionist</td>
                        <td>{member.email}</td>
                        <td>{member.phone || 'N/A'}</td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${member.isActive ? 'active' : 'inactive'}`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => openViewReceptionistModal(member)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => openUserModal(member)}
                            >
                              Edit
                            </button>
                            <button 
                              className={`btn-toggle ${member.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleUserStatus(member.id, member.isActive)}
                            >
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPathologistManagement = () => {
    const pathologists = users.filter(user => user.role === 'pathologist');
    const pathologistStats = userStats?.byRole?.find(stat => stat._id === 'pathologist') || { count: 0, active: 0 };
    
    return (
      <div className="management-container">
        {error && (
          <div className="error-message" style={{
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <div className="management-header">
          <div className="management-title">
            <h2>Pathologist Management</h2>
            <p>Manage pathologists, specializations, and case assignments</p>
          </div>
          <button className="add-btn" onClick={() => openUserModal()}>
            + Add New Pathologist
          </button>
        </div>

        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Pathologists</div>
              <div className="stat-value">{pathologistStats.count}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Pathologists</div>
              <div className="stat-value">{pathologistStats.active}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">New This Month</div>
              <div className="stat-value">{
                users.filter(user => 
                  user.role === 'pathologist' && 
                  new Date(user.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Filtered Results</div>
              <div className="stat-value">{pathologists.length}</div>
            </div>
          </div>
        </div>

        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input 
                type="text" 
                placeholder="Search pathologists..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Pathologists</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading pathologists...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Pathologist ID</th>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pathologists.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No pathologists found
                      </td>
                    </tr>
                  ) : (
                    pathologists.map((pathologist) => (
                      <tr key={pathologist.id}>
                        <td>PATH{pathologist.id.slice(-4)}</td>
                        <td>{pathologist.firstName} {pathologist.lastName}</td>
                        <td>General Pathology</td>
                        <td>{pathologist.email}</td>
                        <td>{pathologist.phone || 'N/A'}</td>
                        <td>{new Date(pathologist.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${pathologist.isActive ? 'active' : 'inactive'}`}>
                            {pathologist.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => openViewPathologistModal(pathologist)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => openUserModal(pathologist)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteUser(pathologist.id)}
                            >
                              Delete
                            </button>
                            <button 
                              className={`btn-toggle ${pathologist.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleUserStatus(pathologist.id, pathologist.isActive)}
                            >
                              {pathologist.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdminManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Staff Management</h2>
          <p>Manage staff members and access permissions</p>
        </div>
        <button className="add-btn">+ Add New Staff Member</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Staff</div>
            <div className="stat-value">5</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Permission Groups</div>
            <div className="stat-value">4</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">System Actions</div>
            <div className="stat-value">127</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search staff..." className="search-input" />
            <select className="filter-select">
              <option>All Staff</option>
              <option>Administrators</option>
              <option>Lab Managers</option>
              <option>System Users</option>
              <option>Support Staff</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S001</td>
                <td>Sarah Johnson</td>
                <td>Lab Manager</td>
                <td>Full Access</td>
                <td>2024-09-01 08:30</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>S002</td>
                <td>Robert Chen</td>
                <td>System Administrator</td>
                <td>User Management, System</td>
                <td>2024-08-31 16:45</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>S003</td>
                <td>Linda Martinez</td>
                <td>Lab Administrator</td>
                <td>Lab Operations, Reports</td>
                <td>2024-09-01 07:15</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Finance Management Functions
  const renderBillsManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Bills Management</h2>
          <p>Monitor and manage patient billing, invoices, and payment tracking</p>
        </div>
        <button className="add-btn" onClick={handleCreateBill}>+ Create New Bill</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Outstanding</div>
            <div className="stat-value">₱{financeStats?.bills?.totalOutstanding?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Pending Bills</div>
            <div className="stat-value">{financeStats?.bills?.pendingBills || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Paid This Month</div>
            <div className="stat-value">{financeStats?.bills?.paidThisMonth || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{financeStats?.bills?.overdueBills || 0}</div>
          </div>
        </div>
      </div>

      {financeLoading ? (
        <div className="loading">Loading bills...</div>
      ) : financeError ? (
        <div className="error">Error: {financeError}</div>
      ) : (
        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input type="text" placeholder="Search bills..." className="search-input" />
              <select className="filter-select">
                <option>All Bills</option>
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient Name</th>
                  <th>Services</th>
                  <th>Amount</th>
                  <th>Date Issued</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? bills.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.billId}</td>
                    <td>{bill.patientName}</td>
                    <td>{bill.services?.map(s => s.name).join(', ')}</td>
                    <td>₱{bill.totalAmount?.toLocaleString()}</td>
                    <td>{new Date(bill.dateIssued).toLocaleDateString()}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td><span className={`status ${bill.status}`}>{bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-view" title="View" onClick={() => handleViewBill(bill)}>View</button>
                        <button className="btn-edit" title="Edit" onClick={() => handleEditBill(bill)}>Edit</button>
                        <button className="btn-send" title="Send" onClick={() => handleSendBill(bill)}>Send</button>
                        <button className="btn-print" title="Print" onClick={() => handlePrintBill(bill)}>Print</button>
                        {bill.status === 'draft' && (
                          <button className="btn-delete" title="Delete Draft" onClick={() => handleDeleteBill(bill)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactionHistory = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Transaction History</h2>
          <p>Complete record of all financial transactions and payments</p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={handleNewTransaction}>+ New Transaction</button>
          <button className="export-btn" onClick={handleExportReport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            Export Report
          </button>
          <button className="filter-btn" onClick={handleAdvancedFilter}>Advanced Filter</button>
        </div>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">₱{financeStats?.transactions?.todayRevenue?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">This Week</div>
            <div className="stat-value">₱{financeStats?.transactions?.weekRevenue?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Cash Payments</div>
            <div className="stat-value">₱{financeStats?.transactions?.cashPayments?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Card Payments</div>
            <div className="stat-value">₱{financeStats?.transactions?.cardPayments?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search transactions..." className="search-input" />
            <select className="filter-select">
              <option>All Transactions</option>
              <option>Cash</option>
              <option>Card</option>
              <option>Online</option>
              <option>Insurance</option>
            </select>
            <input type="date" className="date-filter" />
            <input type="date" className="date-filter" />
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Patient Name</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.transactionId}</td>
                  <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
                  <td>{transaction.patientName}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>₱{transaction.amount?.toLocaleString()}</td>
                  <td><span className={`status ${transaction.status}`}>{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" title="View Details" onClick={() => handleViewTransaction(transaction)}>View</button>
                      <button className="btn-edit" title="Edit Transaction" onClick={() => openEditTransactionModal(transaction)}>Edit</button>
                      <button className="btn-print" title="Print Receipt" onClick={() => handlePrintReceipt(transaction)}>Print</button>
                      {transaction.status === 'completed' && <button className="btn-refund" title="Refund" onClick={() => handleRefundTransaction(transaction)}>Refund</button>}
                      {(transaction.status === 'failed' || transaction.status === 'cancelled') && (
                        <button className="btn-delete" title="Delete Failed/Cancelled Transaction" onClick={() => handleDeleteTransaction(transaction._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPaymentRecords = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Payment Records</h2>
          <p>Detailed payment history and reconciliation records</p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={handleRecordPayment}>+ Record Payment</button>
          <button className="reconcile-btn" onClick={handleExportReport}>Reconcile</button>
        </div>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Collected</div>
            <div className="stat-value">₱{financeStats?.payments?.totalCollected?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Pending Verification</div>
            <div className="stat-value">{financeStats?.payments?.pendingVerification || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Refunds Processed</div>
            <div className="stat-value">{financeStats?.payments?.refundsProcessed || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Collection Rate</div>
            <div className="stat-value">{financeStats?.payments?.collectionRate || 0}%</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search payments..." className="search-input" />
            <select className="filter-select">
              <option>All Payments</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Disputed</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Bill Reference</th>
                <th>Patient Name</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Verified By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{String(payment.paymentId || '')}</td>
                  <td>{String(payment.billId?.billId || payment.billId || 'N/A')}</td>
                  <td>{String(payment.patientName || '')}</td>
                  <td>₱{Number(payment.amountPaid || 0).toLocaleString()}</td>
                  <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                  <td>{String(payment.paymentMethod || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>{String(payment.verifiedBy?.name || payment.verifiedBy || '-')}</td>
                  <td><span className={`status ${payment.status}`}>{String(payment.status || '').charAt(0).toUpperCase() + String(payment.status || '').slice(1)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" title="View Details" onClick={() => handleViewPayment(payment)}>View</button>
                      <button className="btn-edit" title="Edit Payment" onClick={() => openEditPaymentModal(payment)}>Edit</button>
                      <button className="btn-receipt" title="Receipt" onClick={() => handlePrintPaymentReceipt(payment)}>Receipt</button>
                      {payment.status === 'pending' && (
                        <>
                          <button className="btn-verify" title="Verify" onClick={() => handleVerifyPayment(payment)}>Verify</button>
                          <button className="btn-dispute" title="Dispute" onClick={() => handleDisputePayment(payment)}>Dispute</button>
                        </>
                      )}
                      {(payment.status === 'pending' || payment.status === 'disputed') && (
                        <button className="btn-delete" title="Delete Pending/Disputed Payment" onClick={() => handleDeletePayment(payment._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBillingRates = () => {
    const filteredRates = billingRates.filter(rate => {
      switch(activeBillingTab) {
        case 'laboratory':
          return rate.category === 'Hematology' || rate.category === 'Clinical Pathology' || 
                 rate.category === 'Chemistry' || rate.category === 'Microbiology';
        case 'imaging':
          return rate.category === 'Radiology' || rate.category === 'Ultrasound' || 
                 rate.category === 'CT Scan' || rate.category === 'MRI';
        case 'packages':
          return rate.isPackage === true;
        case 'emergency':
          return rate.emergencyRate > 0;
        default:
          return true;
      }
    });

    return (
      <div className="management-container">
        <div className="management-header">
          <div className="management-title">
            <h2>Billing Rates & Pricing</h2>
            <p>Manage test pricing, packages, and billing configurations</p>
          </div>
          <button className="add-btn" onClick={openCreateBillingRateModal}>+ Add New Rate</button>
        </div>

        <div className="billing-categories">
          <div className="category-tabs">
            <button 
              className={`tab-btn ${activeBillingTab === 'laboratory' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('laboratory')}
            >
              Laboratory Tests
            </button>
            <button 
              className={`tab-btn ${activeBillingTab === 'imaging' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('imaging')}
            >
              Imaging Services
            </button>
            <button 
              className={`tab-btn ${activeBillingTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('packages')}
            >
              Packages
            </button>
            <button 
              className={`tab-btn ${activeBillingTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('emergency')}
            >
              Emergency Rates
            </button>
          </div>

          <div className="rates-grid">
            {filteredRates.length === 0 ? (
              <div className="empty-state">
                <p>No billing rates found for this category.</p>
                <button className="add-btn" onClick={openCreateBillingRateModal}>
                  + Add New Rate
                </button>
              </div>
            ) : (
              filteredRates.map(rate => (
                <div key={rate._id || rate.id} className="rate-card">
                  <div className="rate-header">
                    <h3>{String(rate.serviceName || '')}</h3>
                    <span className="rate-category">{String(rate.category || '')}</span>
                  </div>
                  <div className="rate-details">
                    <div className="rate-price">₱{String(rate.price || '0')}</div>
                    <div className="rate-info">
                      <span>TAT: {String(rate.turnaroundTime || 'N/A')}</span>
                      <span>Sample: {String(rate.sampleType || 'N/A')}</span>
                      {rate.isPackage && (
                        <span className="package-badge">Package</span>
                      )}
                      {rate.emergencyRate > 0 && (
                        <span className="emergency-badge">Emergency: ₱{String(rate.emergencyRate)}</span>
                      )}
                    </div>
                  </div>
                  <div className="rate-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => openEditBillingRateModal(rate)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => openViewBillingRateModal(rate)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteBillingRate(rate._id || rate.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialReports = () => {
    // Calculate dynamic summary data
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const monthlyRevenue = Math.floor(Math.random() * 500000) + 1000000;
    const outstandingReceivables = Math.floor(Math.random() * 100000) + 200000;
    const collectionRate = Math.floor(Math.random() * 10) + 90;
    
    return (
      <div className="management-container">
        <div className="management-header">
          <div className="management-title">
            <h2>Financial Reports</h2>
            <p>Comprehensive financial analytics and reporting dashboard</p>
          </div>
          <div className="header-actions">
            <div className="date-range-picker">
              <label>From:</label>
              <input
                type="date"
                value={reportDateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setReportDateRange({
                  ...reportDateRange,
                  startDate: new Date(e.target.value)
                })}
              />
              <label>To:</label>
              <input
                type="date"
                value={reportDateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setReportDateRange({
                  ...reportDateRange,
                  endDate: new Date(e.target.value)
                })}
              />
            </div>
            <button className="generate-btn" onClick={() => generateReport('monthly-financial')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              Generate Custom Report
            </button>
          </div>
        </div>

        <div className="reports-overview">
          <div className="report-summary">
            <div className="summary-card">
              <h3>Monthly Revenue</h3>
              <div className="summary-value">₱{monthlyRevenue.toLocaleString()}</div>
              <div className="summary-change positive">+12.5% from last month</div>
            </div>
            <div className="summary-card">
              <h3>Outstanding Receivables</h3>
              <div className="summary-value">₱{outstandingReceivables.toLocaleString()}</div>
              <div className="summary-change negative">+5.2% from last month</div>
            </div>
            <div className="summary-card">
              <h3>Collection Rate</h3>
              <div className="summary-value">{collectionRate}%</div>
              <div className="summary-change positive">+2.1% from last month</div>
            </div>
            <div className="summary-card">
              <h3>Total Reports Generated</h3>
              <div className="summary-value">{Math.floor(Math.random() * 50) + 150}</div>
              <div className="summary-change positive">+8.3% from last month</div>
            </div>
          </div>

          <div className="report-charts">
            <div className="chart-container">
              <h3>Revenue Trend (Last 6 Months)</h3>
              <div className="chart-placeholder">
                <div className="revenue-chart">
                  <div className="chart-bars">
                    <div className="chart-bar" style={{height: '60%'}}><span>Apr</span></div>
                    <div className="chart-bar" style={{height: '75%'}}><span>May</span></div>
                    <div className="chart-bar" style={{height: '65%'}}><span>Jun</span></div>
                    <div className="chart-bar" style={{height: '80%'}}><span>Jul</span></div>
                    <div className="chart-bar" style={{height: '90%'}}><span>Aug</span></div>
                    <div className="chart-bar" style={{height: '100%'}}><span>Sep</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Report Activity</h3>
              <div className="chart-placeholder">
                <div className="activity-stats">
                  <div className="stat-item">
                    <span className="stat-label">Daily Reports</span>
                    <span className="stat-value">{Math.floor(Math.random() * 20) + 30}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Weekly Reports</span>
                    <span className="stat-value">{Math.floor(Math.random() * 10) + 15}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Monthly Reports</span>
                    <span className="stat-value">{Math.floor(Math.random() * 5) + 8}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Custom Reports</span>
                    <span className="stat-value">{Math.floor(Math.random() * 15) + 25}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-reports">
          <h3>Quick Reports</h3>
          <div className="report-buttons">
            <button 
              className="report-btn"
              onClick={() => generateReport('daily-sales')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                <polyline points="17,6 23,6 23,12"></polyline>
              </svg>
              {isGeneratingReport && reportType === 'daily-sales' ? 'Generating...' : 'Daily Sales Report'}
            </button>
            <button 
              className="report-btn"
              onClick={() => generateReport('weekly-revenue')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              {isGeneratingReport && reportType === 'weekly-revenue' ? 'Generating...' : 'Weekly Revenue Summary'}
            </button>
            <button 
              className="report-btn"
              onClick={() => generateReport('monthly-financial')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              {isGeneratingReport && reportType === 'monthly-financial' ? 'Generating...' : 'Monthly Financial Statement'}
            </button>
            <button 
              className="report-btn"
              onClick={() => generateReport('outstanding-bills')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              {isGeneratingReport && reportType === 'outstanding-bills' ? 'Generating...' : 'Outstanding Bills Report'}
            </button>
            <button 
              className="report-btn"
              onClick={() => generateReport('payment-methods')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4"></path>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M7 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {isGeneratingReport && reportType === 'payment-methods' ? 'Generating...' : 'Payment Method Analysis'}
            </button>
            <button 
              className="report-btn"
              onClick={() => generateReport('overdue-accounts')}
              disabled={isGeneratingReport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
              {isGeneratingReport && reportType === 'overdue-accounts' ? 'Generating...' : 'Overdue Accounts Report'}
            </button>
          </div>
        </div>

        {isGeneratingReport && (
          <div className="generating-overlay">
            <div className="generating-spinner">
              <div className="spinner"></div>
              <p>Generating {reportType.replace('-', ' ')} report...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // System Logs Function
  const renderSystemLogs = () => (
    <div className="management-container">
      {logsError && (
        <div className="error-message" style={{
          background: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px'
        }}>
          {logsError}
        </div>
      )}
      
      <div className="management-header">
        <div className="management-title">
          <h2>System Logs</h2>
          <p>Monitor system activities, user actions, and security events</p>
        </div>
        <div className="header-actions">
          <button 
            className="export-btn"
            onClick={() => handleExportLogs('json')}
            disabled={logsLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export JSON
          </button>
          <button 
            className="export-btn"
            onClick={() => handleExportLogs('csv')}
            disabled={logsLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </button>
          <button 
            className="clear-btn"
            onClick={handleClearLogs}
            disabled={logsLoading}
          >
            Clear Old Logs
          </button>
        </div>
      </div>

      <div className="logs-overview">
        <div className="log-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Events Today</div>
              <div className="stat-value">{logStats?.today?.totalEvents || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{logStats?.today?.activeUsers || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Security Alerts</div>
              <div className="stat-value">{logStats?.today?.securityAlerts || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">System Uptime</div>
              <div className="stat-value">{logStats?.today?.systemUptime || '0%'}</div>
            </div>
          </div>
        </div>

        <div className="log-categories">
          <div className="category-tabs">
            <button 
              className={`tab-btn ${activeLogTab === 'all' ? 'active' : ''}`}
              onClick={() => handleLogTabChange('all')}
            >
              All Logs
            </button>
            <button 
              className={`tab-btn ${activeLogTab === 'user-actions' ? 'active' : ''}`}
              onClick={() => handleLogTabChange('user-actions')}
            >
              User Actions
            </button>
            <button 
              className={`tab-btn ${activeLogTab === 'system-events' ? 'active' : ''}`}
              onClick={() => handleLogTabChange('system-events')}
            >
              System Events
            </button>
            <button 
              className={`tab-btn ${activeLogTab === 'security' ? 'active' : ''}`}
              onClick={() => handleLogTabChange('security')}
            >
              Security
            </button>
            <button 
              className={`tab-btn ${activeLogTab === 'errors' ? 'active' : ''}`}
              onClick={() => handleLogTabChange('errors')}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      <div className="logs-content">
        <div className="content-header">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="search-input" 
              value={logFilters.search}
              onChange={(e) => handleLogFilterChange('search', e.target.value)}
            />
            <select 
              className="filter-select"
              value={logFilters.level}
              onChange={(e) => handleLogFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
            <input 
              type="datetime-local" 
              className="date-filter" 
              value={logFilters.startDate}
              onChange={(e) => handleLogFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
            />
            <input 
              type="datetime-local" 
              className="date-filter" 
              value={logFilters.endDate}
              onChange={(e) => handleLogFilterChange('endDate', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="logs-table">
          {logsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading logs...</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>User</th>
                    <th>Action/Event</th>
                    <th>Details</th>
                    <th>IP Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr 
                        key={log._id} 
                        className={log.level === 'critical' ? 'security-alert' : ''}
                      >
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`log-level ${log.level}`}>
                            {log.level.toUpperCase()}
                          </span>
                        </td>
                        <td>{log.userEmail}</td>
                        <td>{log.action}</td>
                        <td>{log.details}</td>
                        <td>{log.ipAddress}</td>
                        <td>
                          <span className={`status ${log.status}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {logPagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handleLogPageChange(logPagination.currentPage - 1)}
                    disabled={logPagination.currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {logPagination.currentPage} of {logPagination.totalPages}
                    ({logPagination.totalLogs} total logs)
                  </span>
                  <button 
                    onClick={() => handleLogPageChange(logPagination.currentPage + 1)}
                    disabled={logPagination.currentPage === logPagination.totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Services Management Function
  const renderServices = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Lab Services</h2>
          <p>Manage laboratory services and test offerings</p>
        </div>
        <button className="add-btn" onClick={() => openServiceModal()}>
          + Add New Service
        </button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Services</div>
            <div className="stat-value">{services.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Active Services</div>
            <div className="stat-value">{dashboardStats.activeServices || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Service Categories</div>
            <div className="stat-value">{new Set(services.map(s => s.category)).size}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Popular Services</div>
            <div className="stat-value">{services.filter(s => s.isPopular).length}</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search services..." 
              className="search-input"
              value={serviceFilters.search}
              onChange={(e) => setServiceFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <select 
              className="filter-select"
              value={serviceFilters.category}
              onChange={(e) => setServiceFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="blood_tests">Blood Tests</option>
              <option value="urine_tests">Urine Tests</option>
              <option value="imaging">Imaging</option>
              <option value="pathology">Pathology</option>
              <option value="special_tests">Special Tests</option>
              <option value="package_deals">Package Deals</option>
              <option value="emergency_tests">Emergency Tests</option>
            </select>
            <select 
              className="filter-select"
              value={serviceFilters.isActive}
              onChange={(e) => setServiceFilters(prev => ({ ...prev, isActive: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicesLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#6c757d' }}>Loading services...</div>
                  </td>
                </tr>
              ) : servicesError ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#dc3545' }}>{servicesError}</div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#6c757d' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <path d="M9 9h6v6H9z"></path>
                      </svg>
                      <h3 style={{ margin: '0 0 8px 0', fontWeight: '500' }}>No Services Found</h3>
                      <p style={{ margin: '0', fontSize: '0.9rem' }}>Start by adding your first lab service to manage your offerings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service, index) => (
                  <tr key={service._id || index}>
                    <td>{service.serviceId}</td>
                    <td>
                      <div>
                        <strong>{service.serviceName}</strong>
                        {service.isPopular && (
                          <span style={{ 
                            backgroundColor: '#e74c3c', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            marginLeft: '8px' 
                          }}>
                            POPULAR
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px' 
                      }}>
                        {service.category?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>₱{service.price?.toLocaleString()}</strong>
                        {service.discountPrice && (
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            <span style={{ textDecoration: 'line-through' }}>₱{service.discountPrice.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{service.duration} min</td>
                    <td>
                      <span className={`status ${service.isActive ? 'active' : 'inactive'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          onClick={() => openServiceModal(service)}
                          title="Edit Service"
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn toggle"
                          onClick={() => handleToggleServiceStatus(service._id)}
                          title="Toggle Status"
                        >
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteService(service._id)}
                          title="Delete Service"
                        >
                          Delete
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
  );

  // User Modal Component
  const renderUserModal = () => {
    if (!showUserModal) return null;
    
    const isEditing = Boolean(editingUser);
    const currentRole = getCurrentRole() || 'patient';
    
    return (
      <div className={`modal-overlay ${editModalFromView ? 'edit-on-top' : ''}`} onClick={closeUserModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
            <button className="modal-close" onClick={closeUserModal}>×</button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
              firstName: formData.get('firstName'),
              lastName: formData.get('lastName'),
              email: formData.get('email'),
              username: formData.get('username'),
              phone: formData.get('phone'),
              role: formData.get('role') || currentRole,
              gender: formData.get('gender'),
              dateOfBirth: formData.get('dateOfBirth'),
              address: {
                street: formData.get('street'),
                city: formData.get('city'),
                province: formData.get('province'),
                zipCode: formData.get('zipCode')
              }
            };

            // Add role-specific fields
            const userRole = formData.get('role') || currentRole;
            
            if (userRole === 'pathologist') {
              userData.licenseNumber = formData.get('licenseNumber');
              userData.boardCertification = formData.get('boardCertification');
              userData.yearsExperience = formData.get('yearsExperience');
              const specializations = formData.get('specializations');
              userData.specializations = specializations ? specializations.split(',').map(s => s.trim()) : [];
            }
            
            if (userRole === 'medtech') {
              userData.employeeId = formData.get('employeeId');
              userData.department = formData.get('department');
              userData.shiftPreference = formData.get('shiftPreference');
              userData.certifications = formData.get('certifications');
            }
            
            if (!isEditing) {
              userData.password = formData.get('password');
            }
            
            if (isEditing) {
              handleUpdateUser(editingUser.id, userData);
            } else {
              handleCreateUser(userData);
            }
          }}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    defaultValue={editingUser?.firstName || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    defaultValue={editingUser?.lastName || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    defaultValue={editingUser?.email || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    required 
                    defaultValue={editingUser?.username || ''}
                  />
                </div>
                
                {!isEditing && (
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      required 
                      minLength="6"
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    defaultValue={editingUser?.phone || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" defaultValue={editingUser?.role || currentRole}>
                    <option value="patient">Patient</option>
                    <option value="medtech">Medical Technologist</option>
                    <option value="pathologist">Pathologist</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" defaultValue={editingUser?.gender || ''}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    defaultValue={editingUser?.dateOfBirth ? new Date(editingUser.dateOfBirth).toISOString().split('T')[0] : ''}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="street" 
                    defaultValue={editingUser?.address?.street || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    defaultValue={editingUser?.address?.city || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Province</label>
                  <input 
                    type="text" 
                    name="province" 
                    defaultValue={editingUser?.address?.province || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Zip Code</label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    defaultValue={editingUser?.address?.zipCode || ''}
                  />
                </div>
                
                {/* Role-Specific Fields */}
                {(editingUser?.role === 'pathologist' || (!isEditing && currentRole === 'pathologist')) && (
                  <>
                    <div className="form-group full-width">
                      <h4 className="section-title">Pathologist Information</h4>
                    </div>
                    
                    <div className="form-group">
                      <label>Medical License Number</label>
                      <input 
                        type="text" 
                        name="licenseNumber" 
                        placeholder="e.g., MD-12345-PH"
                        defaultValue={editingUser?.licenseNumber || ''}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Board Certification</label>
                      <input 
                        type="text" 
                        name="boardCertification" 
                        placeholder="e.g., American Board of Pathology"
                        defaultValue={editingUser?.boardCertification || ''}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Specializations (comma-separated)</label>
                      <input 
                        type="text" 
                        name="specializations" 
                        placeholder="e.g., Anatomical Pathology, Clinical Pathology, Hematology"
                        defaultValue={editingUser?.specializations?.join(', ') || ''}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input 
                        type="number" 
                        name="yearsExperience" 
                        min="0" 
                        max="50"
                        defaultValue={editingUser?.yearsExperience || ''}
                      />
                    </div>
                  </>
                )}
                
                {(editingUser?.role === 'medtech' || (!isEditing && currentRole === 'staff')) && (
                  <>
                    <div className="form-group full-width">
                      <h4 className="section-title">Staff Information</h4>
                    </div>
                    
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input 
                        type="text" 
                        name="employeeId" 
                        placeholder="e.g., EMP-001"
                        defaultValue={editingUser?.employeeId || ''}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Department</label>
                      <select name="department" defaultValue={editingUser?.department || ''}>
                        <option value="">Select Department</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="phlebotomy">Phlebotomy</option>
                        <option value="administration">Administration</option>
                        <option value="quality-control">Quality Control</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Shift Preference</label>
                      <select name="shiftPreference" defaultValue={editingUser?.shiftPreference || ''}>
                        <option value="">Select Shift</option>
                        <option value="morning">Morning (8:00 AM - 5:00 PM)</option>
                        <option value="afternoon">Afternoon (1:00 PM - 10:00 PM)</option>
                        <option value="night">Night (10:00 PM - 7:00 AM)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Certifications</label>
                      <input 
                        type="text" 
                        name="certifications" 
                        placeholder="e.g., Phlebotomy Certification, ASCP MLT"
                        defaultValue={editingUser?.certifications || ''}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeUserModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Bill Modal Components
  const renderCreateBillModal = () => {
    if (!showCreateBillModal) return null;
    
    return (
      <div className="modal-overlay" onClick={closeBillModals}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Create New Bill</h3>
            <button className="modal-close" onClick={closeBillModals}>×</button>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Get all service inputs
            const serviceNames = formData.getAll('serviceName');
            const servicePrices = formData.getAll('servicePrice');
            const services = serviceNames.map((name, index) => ({
              name: name,
              price: parseFloat(servicePrices[index]) || 0
            })).filter(service => service.name.trim() !== '');
            
            const billData = {
              patientId: formData.get('patientId'),
              patientName: formData.get('patientName'),
              services: services,
              totalAmount: parseFloat(formData.get('totalAmount')),
              dueDate: formData.get('dueDate'),
              notes: formData.get('notes')
            };
            
            try {
              const result = await financeAPI.createBill(billData);
              if (result.success) {
                closeBillModals();
                fetchBills(); // Refresh the bills list
                alert('Bill created successfully!');
              }
            } catch (error) {
              console.error('Error creating bill:', error);
              alert('Failed to create bill. Please try again.');
            }
          }}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient ID</label>
                  <input 
                    type="text" 
                    name="patientId" 
                    required 
                    placeholder="Enter patient ID"
                  />
                </div>
                
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    name="patientName" 
                    required 
                    placeholder="Enter patient name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Total Amount (₱)</label>
                  <input 
                    type="number" 
                    name="totalAmount" 
                    required 
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Services</label>
                  <div className="services-section">
                    <div className="service-row">
                      <div className="service-input-group">
                        <input 
                          type="text" 
                          name="serviceName" 
                          placeholder="Service name (e.g., Complete Blood Count)"
                          required
                        />
                        <input 
                          type="number" 
                          name="servicePrice" 
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="service-row">
                      <div className="service-input-group">
                        <input 
                          type="text" 
                          name="serviceName" 
                          placeholder="Service name (optional)"
                        />
                        <input 
                          type="number" 
                          name="servicePrice" 
                          placeholder="Price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="service-row">
                      <div className="service-input-group">
                        <input 
                          type="text" 
                          name="serviceName" 
                          placeholder="Service name (optional)"
                        />
                        <input 
                          type="number" 
                          name="servicePrice" 
                          placeholder="Price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Notes (Optional)</label>
                  <textarea 
                    name="notes" 
                    rows="2"
                    placeholder="Additional notes or instructions"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Bill
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditBillModal = () => {
    if (!showEditBillModal || !selectedBill) return null;
    
    // Prepare existing services for the form (ensure we have at least 3 slots)
    const existingServices = selectedBill.services || [];
    const serviceSlots = [...existingServices];
    while (serviceSlots.length < 3) {
      serviceSlots.push({ name: '', price: '' });
    }
    
    return (
      <div className="modal-overlay" onClick={closeBillModals}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Bill - {selectedBill.billId}</h3>
            <button className="modal-close" onClick={closeBillModals}>×</button>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Get all service inputs
            const serviceNames = formData.getAll('serviceName');
            const servicePrices = formData.getAll('servicePrice');
            const services = serviceNames.map((name, index) => ({
              name: name,
              price: parseFloat(servicePrices[index]) || 0
            })).filter(service => service.name.trim() !== '');
            
            const billData = {
              patientName: formData.get('patientName'),
              services: services,
              totalAmount: parseFloat(formData.get('totalAmount')),
              dueDate: formData.get('dueDate'),
              status: formData.get('status'),
              notes: formData.get('notes')
            };
            
            try {
              const result = await financeAPI.updateBill(selectedBill._id, billData);
              if (result.success) {
                closeBillModals();
                fetchBills(); // Refresh the bills list
                alert('Bill updated successfully!');
              }
            } catch (error) {
              console.error('Error updating bill:', error);
              alert('Failed to update bill. Please try again.');
            }
          }}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Bill ID (Read-only)</label>
                  <input 
                    type="text" 
                    value={selectedBill.billId}
                    readOnly
                    className="readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    name="patientName" 
                    required 
                    defaultValue={selectedBill.patientName}
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    required 
                    defaultValue={selectedBill.dueDate ? new Date(selectedBill.dueDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={selectedBill.status}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Total Amount (₱)</label>
                  <input 
                    type="number" 
                    name="totalAmount" 
                    required 
                    min="0"
                    step="0.01"
                    defaultValue={selectedBill.totalAmount}
                  />
                </div>
                
                <div className="form-group"></div>
                
                <div className="form-group full-width">
                  <label>Services</label>
                  <div className="services-section">
                    {serviceSlots.map((service, index) => (
                      <div key={index} className="service-row">
                        <div className="service-input-group">
                          <input 
                            type="text" 
                            name="serviceName" 
                            placeholder="Service name"
                            defaultValue={service.name}
                            required={index === 0}
                          />
                          <input 
                            type="number" 
                            name="servicePrice" 
                            placeholder="Price"
                            min="0"
                            step="0.01"
                            defaultValue={service.price}
                            required={index === 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea 
                    name="notes" 
                    rows="2"
                    defaultValue={selectedBill.notes || ''}
                    placeholder="Additional notes or instructions"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Bill
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderViewBillModal = () => {
    console.log('Rendering view modal, showViewBillModal:', showViewBillModal, 'selectedBill:', selectedBill);
    
    if (!showViewBillModal || !selectedBill) return null;
    
    // Add safety checks for the bill data
    const bill = selectedBill;
    const billId = bill.billId || 'N/A';
    const patientName = bill.patientName || 'Unknown Patient';
    // Handle patientId - it might be an object or string
    const patientId = bill.patientId ? 
      (typeof bill.patientId === 'object' ? bill.patientId.id || bill.patientId.email || 'N/A' : bill.patientId) 
      : 'N/A';
    const totalAmount = bill.totalAmount || 0;
    const status = bill.status || 'unknown';
    const services = bill.services || [];
    const notes = bill.notes || '';
    
    // Safe date handling
    const dateIssued = bill.dateIssued ? new Date(bill.dateIssued).toLocaleDateString() : 'N/A';
    const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';
    
    try {
      return (
        <div className="modal-overlay" onClick={closeBillModals}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bill Details - {billId}</h3>
              <button className="modal-close" onClick={closeBillModals}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Patient Information</h4>
                  <div className="info-row">
                    <span className="label">Patient Name:</span>
                    <span className="value">{patientName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Patient ID:</span>
                    <span className="value">{patientId}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Bill Information</h4>
                  <div className="info-row">
                    <span className="label">Bill ID:</span>
                    <span className="value">{billId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date Issued:</span>
                    <span className="value">{dateIssued}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Due Date:</span>
                    <span className="value">{dueDate}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Amount:</span>
                    <span className="value amount">₱{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Services</h4>
                  <div className="services-list">
                    {services && services.length > 0 ? (
                      services.map((service, index) => (
                        <div key={index} className="service-item">
                          <span className="service-name">{service.name || 'Unknown Service'}</span>
                          <span className="service-price">₱{(service.price || 0).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p>No services listed</p>
                    )}
                  </div>
                </div>
                
                {notes && (
                  <div className="info-section full-width">
                    <h4>Notes</h4>
                    <p className="notes">{notes}</p>
                  </div>
                )}
                
                <div className="info-section full-width">
                  <h4>Payment Tracking</h4>
                  <div className="payment-status">
                    <div className="status-indicator">
                      <span className={`indicator ${status}`}></span>
                      <span>Payment Status: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    {status === 'paid' && (
                      <div className="payment-info">
                        <p>✅ Payment received</p>
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="payment-info">
                        <p>⏳ Awaiting payment</p>
                      </div>
                    )}
                    {status === 'overdue' && (
                      <div className="payment-info">
                        <p>⚠️ Payment overdue - Follow up required</p>
                      </div>
                    )}
                    {status === 'unknown' && (
                      <div className="payment-info">
                        <p>❓ Payment status unknown</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillModals}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => handlePrintBill(selectedBill)}>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering view modal:', error);
      return (
        <div className="modal-overlay" onClick={closeBillModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading Bill</h3>
              <button className="modal-close" onClick={closeBillModals}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the bill details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillModals}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Transaction Modal Components
  const renderCreateTransactionModal = () => {
    if (!showCreateTransactionModal) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const transactionData = {
        type: transactionType,
        amount: parseFloat(transactionAmount),
        currency: 'PHP',
        description: transactionDescription,
        patientName: transactionPatientName,
        paymentMethod: transactionPaymentMethod,
        status: transactionStatus,
        notes: transactionNotes
      };

      handleCreateTransaction(transactionData);
    };

    return (
      <div className="modal-overlay" onClick={closeTransactionModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Create New Transaction</h3>
            <button className="modal-close" onClick={closeTransactionModals}>×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select 
                    value={transactionType} 
                    onChange={(e) => setTransactionType(e.target.value)}
                    required
                  >
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (PHP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    value={transactionPatientName}
                    onChange={(e) => setTransactionPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select 
                    value={transactionPaymentMethod} 
                    onChange={(e) => setTransactionPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select 
                    value={transactionStatus} 
                    onChange={(e) => setTransactionStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    placeholder="e.g., Payment for laboratory tests"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={transactionNotes}
                    onChange={(e) => setTransactionNotes(e.target.value)}
                    placeholder="Additional notes (optional)"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeTransactionModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditTransactionModal = () => {
    if (!showEditTransactionModal || !selectedTransaction) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const transactionData = {
        type: transactionType,
        amount: parseFloat(transactionAmount),
        description: transactionDescription,
        patientName: transactionPatientName,
        paymentMethod: transactionPaymentMethod,
        status: transactionStatus,
        notes: transactionNotes
      };

      handleEditTransaction(transactionData);
    };

    return (
      <div className={`modal-overlay ${editModalFromView ? 'edit-on-top' : ''}`} onClick={closeTransactionModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Transaction</h3>
            <button className="modal-close" onClick={closeTransactionModals}>×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    value={selectedTransaction.transactionId}
                    disabled
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select 
                    value={transactionType} 
                    onChange={(e) => setTransactionType(e.target.value)}
                    required
                  >
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (PHP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    value={transactionPatientName}
                    onChange={(e) => setTransactionPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select 
                    value={transactionPaymentMethod} 
                    onChange={(e) => setTransactionPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select 
                    value={transactionStatus} 
                    onChange={(e) => setTransactionStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={transactionNotes}
                    onChange={(e) => setTransactionNotes(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeTransactionModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderViewTransactionModal = () => {
    if (!showViewTransactionModal || !selectedTransaction) return null;

    const transaction = selectedTransaction;

    return (
      <div className="modal-overlay" onClick={closeTransactionModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Transaction Details</h3>
            <button className="modal-close" onClick={closeTransactionModals}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="info-grid">
              <div className="info-section">
                <h4>Transaction Information</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value">{transaction.transactionId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Type:</span>
                    <span className={`value badge badge-${transaction.type}`}>
                      {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={`value status ${transaction.status}`}>
                      {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Amount:</span>
                    <span className="value amount">₱{transaction.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Patient & Payment Details</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Patient Name:</span>
                    <span className="value">{transaction.patientName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">
                      {transaction.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Reference Number:</span>
                    <span className="value">{transaction.referenceNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Processed By:</span>
                    <span className="value">{transaction.processedBy}</span>
                  </div>
                </div>
              </div>

              <div className="info-section full-width">
                <h4>Transaction Details</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Description:</span>
                    <span className="value">{transaction.description}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Processed Date:</span>
                    <span className="value">
                      {transaction.processedAt ? new Date(transaction.processedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {transaction.notes && (
                    <div className="info-item">
                      <span className="label">Notes:</span>
                      <span className="value">{transaction.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeTransactionModals}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={() => openEditTransactionModal(transaction)}>
              Edit Transaction
            </button>
            <button type="button" className="btn-print" onClick={() => handlePrintReceipt(transaction)}>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment Modal Components
  const renderCreatePaymentModal = () => {
    if (!showCreatePaymentModal) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const paymentData = {
        amountPaid: parseFloat(paymentAmount),
        patientName: paymentPatientName,
        billId: paymentBillId,
        paymentMethod: paymentMethod,
        status: paymentStatus,
        referenceNumber: paymentReferenceNumber,
        notes: paymentNotes
      };

      handleCreatePayment(paymentData);
    };

    return (
      <div className="modal-overlay" onClick={closePaymentModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Record New Payment</h3>
            <button className="modal-close" onClick={closePaymentModals}>×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Amount Paid (PHP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    value={paymentPatientName}
                    onChange={(e) => setPaymentPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bill ID</label>
                  <input
                    type="text"
                    value={paymentBillId}
                    onChange={(e) => setPaymentBillId(e.target.value)}
                    placeholder="Optional - Link to specific bill"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select 
                    value={paymentStatus} 
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="verified">Verified</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={paymentReferenceNumber}
                    onChange={(e) => setPaymentReferenceNumber(e.target.value)}
                    placeholder="Check number, transaction ID, etc."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Additional payment details"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePaymentModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditPaymentModal = () => {
    if (!showEditPaymentModal || !selectedPayment) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const paymentData = {
        amountPaid: parseFloat(paymentAmount),
        patientName: paymentPatientName,
        billId: paymentBillId,
        paymentMethod: paymentMethod,
        status: paymentStatus,
        referenceNumber: paymentReferenceNumber,
        notes: paymentNotes
      };

      handleEditPayment(paymentData);
    };

    return (
      <div className={`modal-overlay ${editModalFromView ? 'edit-on-top' : ''}`} onClick={closePaymentModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Payment Record</h3>
            <button className="modal-close" onClick={closePaymentModals}>×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Payment ID</label>
                  <input
                    type="text"
                    value={selectedPayment.paymentId}
                    disabled
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label>Amount Paid (PHP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    value={paymentPatientName}
                    onChange={(e) => setPaymentPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bill ID</label>
                  <input
                    type="text"
                    value={paymentBillId}
                    onChange={(e) => setPaymentBillId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select 
                    value={paymentStatus} 
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="verified">Verified</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={paymentReferenceNumber}
                    onChange={(e) => setPaymentReferenceNumber(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePaymentModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderViewPaymentModal = () => {
    if (!showViewPaymentModal || !selectedPayment) return null;

    const payment = selectedPayment;

    return (
      <div className="modal-overlay" onClick={closePaymentModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Payment Record Details</h3>
            <button className="modal-close" onClick={closePaymentModals}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="info-grid">
              <div className="info-section">
                <h4>Payment Information</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Payment ID:</span>
                    <span className="value">{String(payment.paymentId || '')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={`value status ${payment.status}`}>
                      {String(payment.status || '').charAt(0).toUpperCase() + String(payment.status || '').slice(1)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Amount Paid:</span>
                    <span className="value amount">₱{Number(payment.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">
                      {String(payment.paymentMethod || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Patient & Bill Details</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Patient Name:</span>
                    <span className="value">{String(payment.patientName || '')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Bill Reference:</span>
                    <span className="value">{String(payment.billId?.billId || payment.billId || 'N/A')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Reference Number:</span>
                    <span className="value">{String(payment.referenceNumber || 'N/A')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Payment Date:</span>
                    <span className="value">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section full-width">
                <h4>Verification Details</h4>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Verified By:</span>
                    <span className="value">{String(payment.verifiedBy?.name || payment.verifiedBy || 'Not verified')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Verification Date:</span>
                    <span className="value">
                      {payment.verificationDate ? new Date(payment.verificationDate).toLocaleString() : 'Not verified'}
                    </span>
                  </div>
                  {payment.notes && (
                    <div className="info-item">
                      <span className="label">Notes:</span>
                      <span className="value">{String(payment.notes || '')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closePaymentModals}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={() => openEditPaymentModal(payment)}>
              Edit Payment
            </button>
            <button type="button" className="btn-print" onClick={() => handlePrintPaymentReceipt(payment)}>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Billing Rate Modal Components
  const renderCreateBillingRateModal = () => {
    if (!showCreateBillingRateModal) return null;

    return (
      <div className="modal-overlay" onClick={closeBillingRateModals}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add New Billing Rate</h3>
            <button className="modal-close" onClick={closeBillingRateModals}>×</button>
          </div>
          
          <form onSubmit={handleCreateBillingRate}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={billingRateServiceName}
                    onChange={(e) => setBillingRateServiceName(e.target.value)}
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Service Code</label>
                  <input
                    type="text"
                    value={billingRateServiceCode}
                    onChange={(e) => setBillingRateServiceCode(e.target.value)}
                    placeholder="e.g., CBC001"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={billingRateCategory}
                    onChange={(e) => setBillingRateCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Clinical Pathology">Clinical Pathology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input
                    type="number"
                    value={billingRatePrice}
                    onChange={(e) => setBillingRatePrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Turnaround Time</label>
                  <input
                    type="text"
                    value={billingRateTurnaroundTime}
                    onChange={(e) => setBillingRateTurnaroundTime(e.target.value)}
                    placeholder="e.g., 2-4 hours"
                  />
                </div>
                
                <div className="form-group">
                  <label>Sample Type</label>
                  <input
                    type="text"
                    value={billingRateSampleType}
                    onChange={(e) => setBillingRateSampleType(e.target.value)}
                    placeholder="e.g., Blood, Urine"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={billingRateDescription}
                    onChange={(e) => setBillingRateDescription(e.target.value)}
                    placeholder="Additional details about the test or service"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={billingRateIsPackage}
                        onChange={(e) => setBillingRateIsPackage(e.target.checked)}
                      />
                      This is a package deal
                    </label>
                  </div>
                </div>
                
                {billingRateIsPackage && (
                  <>
                    <div className="form-group full-width">
                      <label>Package Items</label>
                      <textarea
                        value={billingRatePackageItems}
                        onChange={(e) => setBillingRatePackageItems(e.target.value)}
                        placeholder="List the tests included in this package"
                        rows="2"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Package Savings (₱)</label>
                      <input
                        type="number"
                        value={billingRatePackageSavings}
                        onChange={(e) => setBillingRatePackageSavings(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label>Emergency Rate (₱)</label>
                  <input
                    type="number"
                    value={billingRateEmergencyRate}
                    onChange={(e) => setBillingRateEmergencyRate(e.target.value)}
                    placeholder="0.00 (if applicable)"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillingRateModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Billing Rate
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditBillingRateModal = () => {
    if (!showEditBillingRateModal || !selectedBillingRate) return null;

    return (
      <div className="modal-overlay" onClick={closeBillingRateModals}>
        <div className="modal-content large-modal edit-on-top" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Billing Rate</h3>
            <button className="modal-close" onClick={closeBillingRateModals}>×</button>
          </div>
          
          <form onSubmit={handleEditBillingRate}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={billingRateServiceName}
                    onChange={(e) => setBillingRateServiceName(e.target.value)}
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Service Code</label>
                  <input
                    type="text"
                    value={billingRateServiceCode}
                    onChange={(e) => setBillingRateServiceCode(e.target.value)}
                    placeholder="e.g., CBC001"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={billingRateCategory}
                    onChange={(e) => setBillingRateCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Clinical Pathology">Clinical Pathology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input
                    type="number"
                    value={billingRatePrice}
                    onChange={(e) => setBillingRatePrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Turnaround Time</label>
                  <input
                    type="text"
                    value={billingRateTurnaroundTime}
                    onChange={(e) => setBillingRateTurnaroundTime(e.target.value)}
                    placeholder="e.g., 2-4 hours"
                  />
                </div>
                
                <div className="form-group">
                  <label>Sample Type</label>
                  <input
                    type="text"
                    value={billingRateSampleType}
                    onChange={(e) => setBillingRateSampleType(e.target.value)}
                    placeholder="e.g., Blood, Urine"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={billingRateDescription}
                    onChange={(e) => setBillingRateDescription(e.target.value)}
                    placeholder="Additional details about the test or service"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={billingRateIsPackage}
                        onChange={(e) => setBillingRateIsPackage(e.target.checked)}
                      />
                      This is a package deal
                    </label>
                  </div>
                </div>
                
                {billingRateIsPackage && (
                  <>
                    <div className="form-group full-width">
                      <label>Package Items</label>
                      <textarea
                        value={billingRatePackageItems}
                        onChange={(e) => setBillingRatePackageItems(e.target.value)}
                        placeholder="List the tests included in this package"
                        rows="2"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Package Savings (₱)</label>
                      <input
                        type="number"
                        value={billingRatePackageSavings}
                        onChange={(e) => setBillingRatePackageSavings(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label>Emergency Rate (₱)</label>
                  <input
                    type="number"
                    value={billingRateEmergencyRate}
                    onChange={(e) => setBillingRateEmergencyRate(e.target.value)}
                    placeholder="0.00 (if applicable)"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeBillingRateModals}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Billing Rate
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderViewBillingRateModal = () => {
    if (!showViewBillingRateModal || !selectedBillingRate) return null;

    const rate = selectedBillingRate;

    return (
      <div className="modal-overlay" onClick={closeBillingRateModals}>
        <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Billing Rate Details - {String(rate.serviceName || '')}</h3>
            <button className="modal-close" onClick={closeBillingRateModals}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-group">
                <label>Service Name</label>
                <div className="detail-value">{String(rate.serviceName || 'N/A')}</div>
              </div>
              
              <div className="detail-group">
                <label>Service Code</label>
                <div className="detail-value">{String(rate.serviceCode || 'N/A')}</div>
              </div>
              
              <div className="detail-group">
                <label>Category</label>
                <div className="detail-value">{String(rate.category || 'N/A')}</div>
              </div>
              
              <div className="detail-group">
                <label>Price</label>
                <div className="detail-value price">₱{String(rate.price || '0')}</div>
              </div>
              
              <div className="detail-group">
                <label>Turnaround Time</label>
                <div className="detail-value">{String(rate.turnaroundTime || 'N/A')}</div>
              </div>
              
              <div className="detail-group">
                <label>Sample Type</label>
                <div className="detail-value">{String(rate.sampleType || 'N/A')}</div>
              </div>
              
              {rate.description && (
                <div className="detail-group full-width">
                  <label>Description</label>
                  <div className="detail-value">{String(rate.description)}</div>
                </div>
              )}
              
              {rate.isPackage && (
                <>
                  <div className="detail-group">
                    <label>Package Type</label>
                    <div className="detail-value">
                      <span className="badge package-badge">Package Deal</span>
                    </div>
                  </div>
                  
                  {rate.packageItems && (
                    <div className="detail-group full-width">
                      <label>Package Items</label>
                      <div className="detail-value">{String(rate.packageItems)}</div>
                    </div>
                  )}
                  
                  {rate.packageSavings > 0 && (
                    <div className="detail-group">
                      <label>Package Savings</label>
                      <div className="detail-value savings">₱{String(rate.packageSavings || '0')}</div>
                    </div>
                  )}
                </>
              )}
              
              {rate.emergencyRate > 0 && (
                <div className="detail-group">
                  <label>Emergency Rate</label>
                  <div className="detail-value emergency">₱{String(rate.emergencyRate)}</div>
                </div>
              )}
              
              <div className="detail-group">
                <label>Created Date</label>
                <div className="detail-value">
                  {rate.createdAt ? new Date(rate.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              
              <div className="detail-group">
                <label>Last Updated</label>
                <div className="detail-value">
                  {rate.updatedAt ? new Date(rate.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeBillingRateModals}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={() => openEditBillingRateModal(rate)}>
              Edit Rate
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Reports Modal Component
  const renderReportModal = () => {
    if (!showReportModal || !currentReport) return null;

    const getReportTitle = () => {
      switch(reportType) {
        case 'daily-sales': return 'Daily Sales Report';
        case 'weekly-revenue': return 'Weekly Revenue Summary';
        case 'monthly-financial': return 'Monthly Financial Statement';
        case 'outstanding-bills': return 'Outstanding Bills Report';
        case 'payment-methods': return 'Payment Method Analysis';
        case 'overdue-accounts': return 'Overdue Accounts Report';
        default: return 'Financial Report';
      }
    };

    const renderReportContent = () => {
      const filteredData = filterReportData(currentReport);

      switch(reportType) {
        case 'daily-sales':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Revenue</label>
                    <span>₱{reportSummary.totalRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Transactions</label>
                    <span>{reportSummary.totalTransactions}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Daily Sales</label>
                    <span>₱{reportSummary.avgDailySales?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Transaction Value</label>
                    <span>₱{reportSummary.avgTransactionValue?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Daily Breakdown</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Sales</th>
                        <th>Transactions</th>
                        <th>Avg Value</th>
                        <th>Cash</th>
                        <th>Card</th>
                        <th>Online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((day, index) => (
                        <tr key={index}>
                          <td>{day.date}</td>
                          <td>₱{day.sales?.toLocaleString()}</td>
                          <td>{day.transactions}</td>
                          <td>₱{day.avgTransactionValue?.toLocaleString()}</td>
                          <td>₱{day.cash?.toLocaleString()}</td>
                          <td>₱{day.card?.toLocaleString()}</td>
                          <td>₱{day.online?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case 'weekly-revenue':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Revenue</label>
                    <span>₱{reportSummary.totalRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Weekly Revenue</label>
                    <span>₱{reportSummary.avgWeeklyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Transactions</label>
                    <span>{reportSummary.totalTransactions}</span>
                  </div>
                  <div className="summary-item">
                    <label>Growth Rate</label>
                    <span>{reportSummary.growthRate}%</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Weekly Breakdown</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Period</th>
                        <th>Revenue</th>
                        <th>Growth</th>
                        <th>Transactions</th>
                        <th>New Patients</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((week, index) => (
                        <tr key={index}>
                          <td>{week.week}</td>
                          <td>{week.startDate} to {week.endDate}</td>
                          <td>₱{week.revenue?.toLocaleString()}</td>
                          <td className={week.growth >= 0 ? 'positive' : 'negative'}>
                            {week.growth >= 0 ? '+' : ''}{week.growth?.toFixed(1)}%
                          </td>
                          <td>{week.transactions}</td>
                          <td>{week.newPatients}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case 'monthly-financial':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Revenue</label>
                    <span>₱{reportSummary.totalRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Expenses</label>
                    <span>₱{reportSummary.totalExpenses?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Profit</label>
                    <span>₱{reportSummary.totalProfit?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Profit Margin</label>
                    <span>{reportSummary.avgProfitMargin}%</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Monthly Breakdown</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                        <th>Expenses</th>
                        <th>Profit</th>
                        <th>Margin</th>
                        <th>Tests</th>
                        <th>Patients</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((month, index) => (
                        <tr key={index}>
                          <td>{month.month}</td>
                          <td>₱{month.revenue?.toLocaleString()}</td>
                          <td>₱{month.expenses?.toLocaleString()}</td>
                          <td>₱{month.profit?.toLocaleString()}</td>
                          <td>{month.profitMargin}%</td>
                          <td>{month.tests}</td>
                          <td>{month.patients}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case 'outstanding-bills':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Outstanding</label>
                    <span>₱{reportSummary.totalOutstanding?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Bills</label>
                    <span>{reportSummary.totalBills}</span>
                  </div>
                  <div className="summary-item">
                    <label>Overdue Bills</label>
                    <span>{reportSummary.overdueBills}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Days Outstanding</label>
                    <span>{reportSummary.avgDaysOutstanding} days</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Outstanding Bills</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Bill ID</th>
                        <th>Patient</th>
                        <th>Amount</th>
                        <th>Issue Date</th>
                        <th>Days Outstanding</th>
                        <th>Status</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((bill, index) => (
                        <tr key={index}>
                          <td>{bill.billId}</td>
                          <td>{bill.patientName}</td>
                          <td>₱{bill.amount?.toLocaleString()}</td>
                          <td>{bill.issueDate}</td>
                          <td>{bill.daysOutstanding}</td>
                          <td>
                            <span className={`status-badge ${bill.status}`}>
                              {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                            </span>
                          </td>
                          <td>{bill.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case 'payment-methods':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Amount</label>
                    <span>₱{reportSummary.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Transactions</label>
                    <span>{reportSummary.totalTransactions}</span>
                  </div>
                  <div className="summary-item">
                    <label>Most Popular Method</label>
                    <span>{reportSummary.mostPopularMethod}</span>
                  </div>
                  <div className="summary-item">
                    <label>Highest Value Method</label>
                    <span>{reportSummary.highestValueMethod}</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Payment Method Breakdown</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                        <th>Transactions</th>
                        <th>Average Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((method, index) => (
                        <tr key={index}>
                          <td>{method.method}</td>
                          <td>₱{method.amount?.toLocaleString()}</td>
                          <td>{method.percentage}%</td>
                          <td>{method.transactions}</td>
                          <td>₱{method.avgAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case 'overdue-accounts':
          return (
            <div className="report-content">
              <div className="report-summary-section">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Overdue</label>
                    <span>₱{reportSummary.totalOverdue?.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Accounts</label>
                    <span>{reportSummary.totalAccounts}</span>
                  </div>
                  <div className="summary-item">
                    <label>Critical Accounts</label>
                    <span>{reportSummary.criticalAccounts}</span>
                  </div>
                  <div className="summary-item">
                    <label>Average Days Overdue</label>
                    <span>{reportSummary.avgDaysOverdue} days</span>
                  </div>
                </div>
              </div>
              
              <div className="report-table-section">
                <h4>Overdue Accounts</h4>
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Account ID</th>
                        <th>Patient</th>
                        <th>Amount</th>
                        <th>Days Overdue</th>
                        <th>Risk Level</th>
                        <th>Last Contact</th>
                        <th>Contact Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((account, index) => (
                        <tr key={index}>
                          <td>{account.accountId}</td>
                          <td>{account.patientName}</td>
                          <td>₱{account.amount?.toLocaleString()}</td>
                          <td>{account.daysOverdue}</td>
                          <td>
                            <span className={`risk-badge ${account.riskLevel?.toLowerCase()}`}>
                              {account.riskLevel}
                            </span>
                          </td>
                          <td>{account.lastContact}</td>
                          <td>{account.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        default:
          return <div>Report type not supported</div>;
      }
    };

    return (
      <div className="modal-overlay" onClick={closeReportModal}>
        <div className="modal-content report-modal large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{getReportTitle()}</h3>
            <div className="report-actions">
              <div className="view-mode-toggles">
                <button 
                  className={`toggle-btn ${reportViewMode === 'summary' ? 'active' : ''}`}
                  onClick={() => setReportViewMode('summary')}
                >
                  Summary
                </button>
                <button 
                  className={`toggle-btn ${reportViewMode === 'detailed' ? 'active' : ''}`}
                  onClick={() => setReportViewMode('detailed')}
                >
                  Detailed
                </button>
              </div>
              <button className="modal-close" onClick={closeReportModal}>×</button>
            </div>
          </div>
          
          <div className="modal-body">
            <div className="report-filters">
              <div className="filter-group">
                <label>Date Range:</label>
                <span>{reportDateRange.startDate.toLocaleDateString()} - {reportDateRange.endDate.toLocaleDateString()}</span>
              </div>
              {(reportType === 'outstanding-bills' || reportType === 'overdue-accounts') && (
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={reportFilters.status} 
                    onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              )}
            </div>
            
            {renderReportContent()}
          </div>

          <div className="modal-footer">
            <div className="export-options">
              <label>Export as:</label>
              <select 
                value={reportExportFormat} 
                onChange={(e) => setReportExportFormat(e.target.value)}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
              <button 
                className="btn-export" 
                onClick={() => exportReport(reportExportFormat)}
              >
                Export Report
              </button>
            </div>
            <button type="button" className="btn-secondary" onClick={closeReportModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Patient View Modal Component
  const renderViewPatientModal = () => {
    if (!showViewPatientModal || !selectedPatient) return null;
    
    const patient = selectedPatient;
    const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
    const email = patient.email || 'N/A';
    const phone = patient.phone || 'N/A';
    const username = patient.username || 'N/A';
    const role = patient.role || 'patient';
    const gender = patient.gender || 'N/A';
    const dateOfBirth = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A';
    const isActive = patient.isActive !== undefined ? patient.isActive : true;
    const createdAt = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A';
    const lastLogin = patient.lastLogin ? new Date(patient.lastLogin).toLocaleDateString() : 'Never';
    
    // Handle address safely
    const address = patient.address || {};
    const fullAddress = [
      address.street,
      address.city,
      address.province,
      address.zipCode
    ].filter(Boolean).join(', ') || 'No address provided';

    try {
      return (
        <div className="modal-overlay" onClick={closePatientModal}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Patient Details - {patientName}</h3>
              <button className="modal-close" onClick={closePatientModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{patientName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date of Birth:</span>
                    <span className="value">{dateOfBirth}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Account Information</h4>
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{username}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value role-badge role-patient">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Created:</span>
                    <span className="value">{createdAt}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Login:</span>
                    <span className="value">{lastLogin}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Address</h4>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{fullAddress}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Medical Record Summary</h4>
                  <div className="patient-summary">
                    <div className="summary-item">
                      <span className="summary-label">Account Status:</span>
                      <span className={`summary-value ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active Patient' : 'Inactive Patient'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Registration:</span>
                      <span className="summary-value">Registered on {createdAt}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Contact:</span>
                      <span className="summary-value">{email} | {phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePatientModal}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => openUserModal(patient, true)}>
                Edit Patient
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering patient view modal:', error);
      return (
        <div className="modal-overlay" onClick={closePatientModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading Patient</h3>
              <button className="modal-close" onClick={closePatientModal}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the patient details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePatientModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // MedTech View Modal Component
  const renderViewMedTechModal = () => {
    if (!showViewMedTechModal || !selectedMedTech) return null;
    
    const medtech = selectedMedTech;
    const medtechName = `${medtech.firstName || ''} ${medtech.lastName || ''}`.trim() || 'Unknown MedTech';
    const email = medtech.email || 'N/A';
    const phone = medtech.phone || 'N/A';
    const username = medtech.username || 'N/A';
    const role = medtech.role || 'medtech';
    const gender = medtech.gender || 'N/A';
    const dateOfBirth = medtech.dateOfBirth ? new Date(medtech.dateOfBirth).toLocaleDateString() : 'N/A';
    const isActive = medtech.isActive !== undefined ? medtech.isActive : true;
    const createdAt = medtech.createdAt ? new Date(medtech.createdAt).toLocaleDateString() : 'N/A';
    const lastLogin = medtech.lastLogin ? new Date(medtech.lastLogin).toLocaleDateString() : 'Never';
    
    // Handle address safely
    const address = medtech.address || {};
    const fullAddress = [
      address.street,
      address.city,
      address.province,
      address.zipCode
    ].filter(Boolean).join(', ') || 'No address provided';

    // Sample schedule data (this would come from backend in real implementation)
    const sampleSchedule = [
      { day: 'Monday', shift: '8:00 AM - 5:00 PM', status: 'Regular' },
      { day: 'Tuesday', shift: '8:00 AM - 5:00 PM', status: 'Regular' },
      { day: 'Wednesday', shift: '8:00 AM - 5:00 PM', status: 'Regular' },
      { day: 'Thursday', shift: '8:00 AM - 5:00 PM', status: 'Regular' },
      { day: 'Friday', shift: '8:00 AM - 5:00 PM', status: 'Regular' },
      { day: 'Saturday', shift: 'OFF', status: 'Off' },
      { day: 'Sunday', shift: 'OFF', status: 'Off' }
    ];

    try {
      return (
        <div className="modal-overlay" onClick={closeMedTechModal}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>MedTech Details - {medtechName}</h3>
              <button className="modal-close" onClick={closeMedTechModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{medtechName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date of Birth:</span>
                    <span className="value">{dateOfBirth}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Employment Information</h4>
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{username}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value role-badge role-medtech">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Hired Date:</span>
                    <span className="value">{createdAt}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Login:</span>
                    <span className="value">{lastLogin}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Address</h4>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{fullAddress}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Weekly Schedule</h4>
                  <div className="schedule-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Shift Hours</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleSchedule.map((schedule, index) => (
                          <tr key={index}>
                            <td className="schedule-day">{schedule.day}</td>
                            <td className="schedule-shift">{schedule.shift}</td>
                            <td>
                              <span className={`schedule-status ${schedule.status.toLowerCase()}`}>
                                {schedule.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-edit-small"
                                onClick={() => openScheduleEditModal({...schedule, staffId: selectedStaff?.id, staffName: `${selectedStaff?.firstName || ''} ${selectedStaff?.lastName || ''}`.trim()})}
                                disabled={schedule.status === 'Off'}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Staff Summary</h4>
                  <div className="staff-summary">
                    <div className="summary-item">
                      <span className="summary-label">Employment Status:</span>
                      <span className={`summary-value ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active Employee' : 'Inactive Employee'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Employment Date:</span>
                      <span className="summary-value">Hired on {createdAt}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Contact:</span>
                      <span className="summary-value">{email} | {phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeStaffModal}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => openUserModal(staff, true)}>
                Edit Staff
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering medtech view modal:', error);
      return (
        <div className="modal-overlay" onClick={closeMedTechModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading MedTech</h3>
              <button className="modal-close" onClick={closeMedTechModal}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the medtech details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeMedTechModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Pathologist View Modal Component
  const renderViewPathologistModal = () => {
    if (!showViewPathologistModal || !selectedPathologist) return null;
    
    const pathologist = selectedPathologist;
    const pathologistName = `${pathologist.firstName || ''} ${pathologist.lastName || ''}`.trim() || 'Unknown Pathologist';
    const email = pathologist.email || 'N/A';
    const phone = pathologist.phone || 'N/A';
    const username = pathologist.username || 'N/A';
    const role = pathologist.role || 'pathologist';
    const gender = pathologist.gender || 'N/A';
    const dateOfBirth = pathologist.dateOfBirth ? new Date(pathologist.dateOfBirth).toLocaleDateString() : 'N/A';
    const isActive = pathologist.isActive !== undefined ? pathologist.isActive : true;
    const createdAt = pathologist.createdAt ? new Date(pathologist.createdAt).toLocaleDateString() : 'N/A';
    const lastLogin = pathologist.lastLogin ? new Date(pathologist.lastLogin).toLocaleDateString() : 'Never';
    
    // Handle address safely
    const address = pathologist.address || {};
    const fullAddress = [
      address.street,
      address.city,
      address.province,
      address.zipCode
    ].filter(Boolean).join(', ') || 'No address provided';

    // Sample pathologist specializations and certifications
    const specializations = [
      'Anatomical Pathology',
      'Clinical Pathology', 
      'Hematology',
      'Immunology',
      'Microbiology'
    ];

    const certifications = [
      { name: 'Board Certified Pathologist', date: '2020', status: 'Active' },
      { name: 'Clinical Laboratory Certification', date: '2019', status: 'Active' },
      { name: 'Hematology Subspecialty', date: '2021', status: 'Active' }
    ];

    try {
      return (
        <div className="modal-overlay" onClick={closePathologistModal}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pathologist Details - {pathologistName}</h3>
              <button className="modal-close" onClick={closePathologistModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{pathologistName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date of Birth:</span>
                    <span className="value">{dateOfBirth}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Professional Information</h4>
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{username}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value role-badge role-pathologist">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Joined Date:</span>
                    <span className="value">{createdAt}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Login:</span>
                    <span className="value">{lastLogin}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Address</h4>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{fullAddress}</span>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Specializations</h4>
                  <div className="specializations-list">
                    {specializations.map((spec, index) => (
                      <span key={index} className="specialization-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <div className="section-header">
                    <h4>Certifications & Licenses</h4>
                    <button 
                      className="btn-edit-small"
                      onClick={() => openCertificationModal(pathologist)}
                    >
                      Manage Certifications
                    </button>
                  </div>
                  <div className="certifications-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Certification</th>
                          <th>Date Obtained</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certifications.map((cert, index) => (
                          <tr key={index}>
                            <td className="cert-name">{cert.name}</td>
                            <td className="cert-date">{cert.date}</td>
                            <td>
                              <span className={`cert-status ${cert.status.toLowerCase()}`}>
                                {cert.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="info-section full-width">
                  <h4>Pathologist Summary</h4>
                  <div className="pathologist-summary">
                    <div className="summary-item">
                      <span className="summary-label">Professional Status:</span>
                      <span className={`summary-value ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active Pathologist' : 'Inactive Pathologist'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Service Date:</span>
                      <span className="summary-value">Joined on {createdAt}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Contact:</span>
                      <span className="summary-value">{email} | {phone}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Specialties:</span>
                      <span className="summary-value">General Pathology, Clinical Lab</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePathologistModal}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => openUserModal(pathologist, true)}>
                Edit Pathologist
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering pathologist view modal:', error);
      return (
        <div className="modal-overlay" onClick={closePathologistModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading Pathologist</h3>
              <button className="modal-close" onClick={closePathologistModal}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the pathologist details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePathologistModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Receptionist View Modal Component
  const renderViewReceptionistModal = () => {
    if (!showViewReceptionistModal || !selectedReceptionist) return null;
    
    const receptionist = selectedReceptionist;
    const receptionistName = `${receptionist.firstName || ''} ${receptionist.lastName || ''}`.trim() || 'Unknown Receptionist';
    const email = receptionist.email || 'N/A';
    const phone = receptionist.phone || 'N/A';
    const username = receptionist.username || 'N/A';
    const role = receptionist.role || 'receptionist';
    const gender = receptionist.gender || 'N/A';
    const dateOfBirth = receptionist.dateOfBirth ? new Date(receptionist.dateOfBirth).toLocaleDateString() : 'N/A';
    const isActive = receptionist.isActive !== undefined ? receptionist.isActive : true;
    const createdAt = receptionist.createdAt ? new Date(receptionist.createdAt).toLocaleDateString() : 'N/A';
    const lastLogin = receptionist.lastLogin ? new Date(receptionist.lastLogin).toLocaleDateString() : 'Never';
    
    // Handle address safely
    const address = receptionist.address || {};
    const fullAddress = [
      address.street,
      address.city,
      address.province,
      address.zipCode
    ].filter(Boolean).join(', ') || 'No address provided';

    try {
      return (
        <div className="modal-overlay" onClick={closeReceptionistModal}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receptionist Details - {receptionistName}</h3>
              <button className="modal-close" onClick={closeReceptionistModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{receptionistName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{username}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date of Birth:</span>
                    <span className="value">{dateOfBirth}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{fullAddress}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Account Information</h4>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value role-receptionist">Receptionist</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Account Created:</span>
                    <span className="value">{createdAt}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Login:</span>
                    <span className="value">{lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeReceptionistModal}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => openUserModal(receptionist, true)}>
                Edit Receptionist
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering receptionist view modal:', error);
      return (
        <div className="modal-overlay" onClick={closeReceptionistModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading Receptionist</h3>
              <button className="modal-close" onClick={closeReceptionistModal}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the receptionist details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeReceptionistModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Schedule Edit Modal Component
  const renderScheduleEditModal = () => {
    if (!showScheduleEditModal || !editingSchedule) return null;

    const schedule = editingSchedule;

    const handleSaveSchedule = () => {
      // Here you would typically save to backend
      const formattedShift = scheduleStatus === 'Off' ? 'OFF' : 
        `${formatTime(scheduleStartTime)} - ${formatTime(scheduleEndTime)}`;
      
      console.log('Saving schedule:', {
        staffId: schedule.staffId,
        day: schedule.day,
        shift: formattedShift,
        status: scheduleStatus
      });
      
      alert(`Schedule updated for ${schedule.day}: ${formattedShift} (${scheduleStatus})`);
      closeScheduleEditModal();
    };

    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
      <div className={`modal-overlay ${editModalFromView ? 'edit-on-top' : ''}`} onClick={closeScheduleEditModal}>
        <div className="modal-content schedule-edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Schedule - {schedule.day}</h3>
            <button className="modal-close" onClick={closeScheduleEditModal}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="schedule-edit-form">
              <div className="staff-info">
                <h4>Staff: {schedule.staffName}</h4>
                <p>Day: {schedule.day}</p>
              </div>

              <div className="form-group">
                <label htmlFor="scheduleStatus">Schedule Status:</label>
                <select 
                  id="scheduleStatus"
                  value={scheduleStatus} 
                  onChange={(e) => setScheduleStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="Regular">Regular</option>
                  <option value="Overtime">Overtime</option>
                  <option value="Off">Day Off</option>
                </select>
              </div>

              {scheduleStatus !== 'Off' && (
                <>
                  <div className="time-inputs">
                    <div className="form-group">
                      <label htmlFor="startTime">Start Time:</label>
                      <input
                        type="time"
                        id="startTime"
                        value={scheduleStartTime}
                        onChange={(e) => setScheduleStartTime(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endTime">End Time:</label>
                      <input
                        type="time"
                        id="endTime"
                        value={scheduleEndTime}
                        onChange={(e) => setScheduleEndTime(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="schedule-preview">
                    <h5>Preview:</h5>
                    <p className="preview-text">
                      {scheduleStartTime && scheduleEndTime ? 
                        `${formatTime(scheduleStartTime)} - ${formatTime(scheduleEndTime)} (${scheduleStatus})` : 
                        'Please set start and end times'
                      }
                    </p>
                  </div>
                </>
              )}

              {scheduleStatus === 'Off' && (
                <div className="day-off-info">
                  <p className="off-message">This day is set as a day off.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={closeScheduleEditModal}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSaveSchedule}
              disabled={scheduleStatus !== 'Off' && (!scheduleStartTime || !scheduleEndTime)}
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Certification Management Modal Component
  const renderCertificationModal = () => {
    if (!showCertificationModal) return null;

    return (
      <div className={`modal-overlay ${editModalFromView ? 'edit-on-top' : ''}`} onClick={closeCertificationModal}>
        <div className="modal-content certification-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Manage Certifications</h3>
            <button className="modal-close" onClick={closeCertificationModal}>×</button>
          </div>
          
          <div className="modal-body">
            {/* Certification Form */}
            <div className="certification-form">
              <div className="form-header">
                <h4>{editingCertification ? 'Edit Certification' : 'Add New Certification'}</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="certName">Certification Name</label>
                  <input
                    type="text"
                    id="certName"
                    value={certificationName}
                    onChange={(e) => setCertificationName(e.target.value)}
                    placeholder="e.g., Board Certified Pathologist"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="certDate">Date Obtained</label>
                  <input
                    type="text"
                    id="certDate"
                    value={certificationDate}
                    onChange={(e) => setCertificationDate(e.target.value)}
                    placeholder="e.g., 2020"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="certStatus">Status</label>
                  <select
                    id="certStatus"
                    value={certificationStatus}
                    onChange={(e) => setCertificationStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={openAddCertification}
                >
                  Clear Form
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleSaveCertification}
                  disabled={!certificationName || !certificationDate}
                >
                  {editingCertification ? 'Update' : 'Add'} Certification
                </button>
              </div>
            </div>

            {/* Certifications List */}
            <div className="certifications-list">
              <h4>Current Certifications</h4>
              {pathologistCertifications.length === 0 ? (
                <p className="no-certifications">No certifications added yet.</p>
              ) : (
                <div className="certifications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Certification</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pathologistCertifications.map((cert) => (
                        <tr key={cert.id}>
                          <td className="cert-name">{cert.name}</td>
                          <td className="cert-date">{cert.date}</td>
                          <td>
                            <span className={`cert-status ${cert.status.toLowerCase()}`}>
                              {cert.status}
                            </span>
                          </td>
                          <td>
                            <div className="cert-actions">
                              <button 
                                className="btn-edit-small"
                                onClick={() => openEditCertification(cert)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn-delete-small"
                                onClick={() => handleDeleteCertification(cert.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeCertificationModal}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={closeCertificationModal}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Service Modal Component
  const ServiceModal = () => {
    return serviceModalOpen ? (
      <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && closeServiceModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{selectedService ? 'Edit Service' : 'Add New Service'}</h3>
            <button className="modal-close" onClick={closeServiceModal}>&times;</button>
          </div>
          
          <form onSubmit={handleCreateService} className="modal-form">
            <div className="form-group">
              <label>Service Name *</label>
              <input
                type="text"
                value={serviceFormData.serviceName}
                onChange={(e) => setServiceFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                placeholder="e.g., Complete Blood Count"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Service Code *</label>
                <input
                  type="text"
                  value={serviceFormData.serviceId}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                  placeholder="e.g., CBC001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={serviceFormData.category}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="blood_tests">Blood Tests</option>
                  <option value="urine_tests">Urine Tests</option>
                  <option value="imaging">Imaging</option>
                  <option value="pathology">Pathology</option>
                  <option value="special_tests">Special Tests</option>
                  <option value="package_deals">Package Deals</option>
                  <option value="emergency_tests">Emergency Tests</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the service..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₱) *</label>
                <input
                  type="number"
                  value={serviceFormData.price}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={serviceFormData.duration}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Discount Price (₱)</label>
                <input
                  type="number"
                  value={serviceFormData.discountPrice}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, discountPrice: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Age Range</label>
                <input
                  type="text"
                  value={serviceFormData.ageRange}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                  placeholder="e.g., 18-65"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sample Type</label>
                <input
                  type="text"
                  value={serviceFormData.sampleType}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, sampleType: e.target.value }))}
                  placeholder="e.g., Blood, Urine"
                />
              </div>
              <div className="form-group">
                <label>Fasting Required</label>
                <select
                  value={serviceFormData.fastingRequired}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, fastingRequired: e.target.value === 'true' }))}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Prerequisites</label>
              <input
                type="text"
                value={serviceFormData.prerequisites}
                onChange={(e) => setServiceFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="Any special requirements..."
              />
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={serviceFormData.isActive}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <span>Active Service</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={serviceFormData.isPopular}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                />
                <span>Popular Service</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={serviceFormData.homeVisitAvailable}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, homeVisitAvailable: e.target.checked }))}
                />
                <span>Home Visit Available</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeServiceModal}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={servicesLoading}>
                {servicesLoading ? 'Saving...' : (selectedService ? 'Update Service' : 'Create Service')}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h2 className="dashboard-sidebar-title">MDLAB DIRECT</h2>
          <div className="dashboard-sidebar-subtitle">Owner Portal</div>
        </div>
        
        <nav className="dashboard-sidebar-nav">
          <div 
            className={`dashboard-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('dashboard')}
          >
            <span className="dashboard-nav-text">Dashboard</span>
          </div>

          <div className="dashboard-dropdown">
            <div className="dashboard-nav-item-header" onClick={toggleUserManagement}>
              <div className="dashboard-nav-item-main">
                <span className="dashboard-nav-text">User Management</span>
              </div>
              <span className={`dashboard-dropdown-arrow ${userManagementOpen ? 'open' : ''}`}>▼</span>
            </div>
            {userManagementOpen && (
              <div className="dashboard-nav-submenu">
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'patients' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('patients')}
                >
                  Patient
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'medtech' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('medtech')}
                >
                  MedTech
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'pathologist' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('pathologist')}
                >
                  Pathologist
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'receptionist' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('receptionist')}
                >
                  Receptionist
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-dropdown">
            <div className="dashboard-nav-item-header" onClick={toggleFinance}>
              <div className="dashboard-nav-item-main">
                <span className="dashboard-nav-text">Finance</span>
              </div>
              <span className={`dashboard-dropdown-arrow ${financeOpen ? 'open' : ''}`}>▼</span>
            </div>
            {financeOpen && (
              <div className="dashboard-nav-submenu">
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'bills' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('bills')}
                >
                  Bills
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'transaction' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('transaction')}
                >
                  Transaction
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'payments' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('payments')}
                >
                  Payments
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'billing-rates' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('billing-rates')}
                >
                  Billing Rates
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'reports' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('reports')}
                >
                  Reports
                </div>
              </div>
            )}
          </div>

          <div 
            className={`dashboard-nav-item ${activeSection === 'mobile-lab' ? 'active' : ''}`}
            onClick={() => handleSectionClick('mobile-lab')}
          >
            <span className="dashboard-nav-text">Mobile Lab</span>
          </div>

          <div className="dashboard-dropdown">
            <div className="dashboard-nav-item-header" onClick={toggleLogs}>
              <div className="dashboard-nav-item-main">
                <span className="dashboard-nav-text">System</span>
              </div>
              <span className={`dashboard-dropdown-arrow ${logsOpen ? 'open' : ''}`}>▼</span>
            </div>
            {logsOpen && (
              <div className="dashboard-nav-submenu">
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'logs' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('logs')}
                >
                  System Logs
                </div>
                <div 
                  className={`dashboard-nav-subitem ${activeSection === 'services' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('services')}
                >
                  Services
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'O'}
            </div>
            <div className="dashboard-user-details">
              <div className="dashboard-user-role">Owner</div>
              <div className="dashboard-user-email">{user?.email || 'owner@mdlab.com'}</div>
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
      
      {/* User Modal */}
      {renderUserModal()}
      
      {/* Bill Modals */}
      {renderCreateBillModal()}
      {renderEditBillModal()}
      {renderViewBillModal()}
      
      {/* Transaction Modals */}
      {renderCreateTransactionModal()}
      {renderEditTransactionModal()}
      {renderViewTransactionModal()}
      
      {/* Payment Modals */}
      {renderCreatePaymentModal()}
      {renderEditPaymentModal()}
      {renderViewPaymentModal()}
      
      {/* Billing Rate Modals */}
      {renderCreateBillingRateModal()}
      {renderEditBillingRateModal()}
      {renderViewBillingRateModal()}
      
      {/* Reports Modal */}
      {renderReportModal()}
      
      {/* Patient View Modal */}
      {renderViewPatientModal()}
      
      {/* MedTech View Modal */}
      {renderViewMedTechModal()}
      
      {/* Pathologist View Modal */}
      {renderViewPathologistModal()}
      
      {/* Receptionist View Modal */}
      {renderViewReceptionistModal()}
      
      {/* Schedule Edit Modal */}
      {renderScheduleEditModal()}
      
      {/* Certification Management Modal */}
      {renderCertificationModal()}
      
      {/* Service Modal */}
      {ServiceModal()}
    </div>
  );
}

export default Dashboard;
