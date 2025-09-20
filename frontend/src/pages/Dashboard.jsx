import React, { useState, useEffect } from 'react';
import '../design/Dashboard.css';
import { userAPI, financeAPI } from '../services/api';

function Dashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  
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

  // Staff view modal
  const [showViewStaffModal, setShowViewStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Pathologist view modal
  const [showViewPathologistModal, setShowViewPathologistModal] = useState(false);
  const [selectedPathologist, setSelectedPathologist] = useState(null);

  // Schedule edit modal for staff
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

  // Track if edit modal is opened from a view modal (for z-index layering)
  const [editModalFromView, setEditModalFromView] = useState(false);

  const user = currentUser;

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleUserManagement = () => {
    setUserManagementOpen(!userManagementOpen);
  };

  const toggleFinance = () => {
    setFinanceOpen(!financeOpen);
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
      case 'patient': return 'patient';
      case 'staff': return 'medtech';
      case 'pathologist': return 'pathologist';
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

  // Staff modal functions
  const openViewStaffModal = (staff) => {
    setSelectedStaff(staff);
    setShowViewStaffModal(true);
  };

  const closeStaffModal = () => {
    setSelectedStaff(null);
    setShowViewStaffModal(false);
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
    if (['patient', 'staff', 'pathologist'].includes(activeSection)) {
      fetchUsers(getCurrentRole());
      fetchUserStats();
    }
    if (['bills', 'transaction', 'payments', 'billing-rates'].includes(activeSection)) {
      fetchFinanceData();
    }
  }, [activeSection, searchTerm, filterStatus]);

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
      const data = await financeAPI.getPayments(params);
      if (data.success) {
        setPayments(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  const fetchBillingRates = async (params = {}) => {
    try {
      const data = await financeAPI.getBillingRates(params);
      if (data.success) {
        setBillingRates(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch billing rates:', err);
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
      Bill ID: ${payment.billId}
      Patient: ${payment.patientName}
      Date: ${new Date(payment.paymentDate).toLocaleDateString()}
      
      Amount: ₱${payment.amount?.toLocaleString()}
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

  const handleRecordPayment = () => {
    console.log('Record new payment');
    // TODO: Open record payment modal
    alert('Record Payment - Modal to be implemented');
  };

  const handleAddBillingRate = () => {
    console.log('Add new billing rate');
    // TODO: Open add billing rate modal
    alert('Add New Billing Rate - Modal to be implemented');
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
      case 'patient': return 'Patient Management';
      case 'staff': return 'Staff Management';
      case 'pathologist': return 'Pathologist Management';
      case 'admin': return 'Staff Management';
      case 'bills': return 'Bills Management';
      case 'transaction': return 'Transaction History';
      case 'payments': return 'Payment Records';
      case 'billing-rates': return 'Billing Rates';
      case 'reports': return 'Financial Reports';
      case 'accounts': return 'Account Settings';
      case 'feedbacks': return 'Customer Feedback';
      case 'logs': return 'System Logs';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'patient': return renderPatientManagement();
      case 'staff': return renderStaffManagement();
      case 'pathologist': return renderPathologistManagement();
      case 'admin': return renderAdminManagement();
      case 'bills': return renderBillsManagement();
      case 'transaction': return renderTransactionHistory();
      case 'payments': return renderPaymentRecords();
      case 'billing-rates': return renderBillingRates();
      case 'reports': return renderFinancialReports();
      case 'accounts': return renderAccountSettings();
      case 'feedbacks': return renderCustomerFeedbacks();
      case 'logs': return renderSystemLogs();
      default: return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Top Row Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Pending Test Results</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Completed Reports</div>
            <div className="stat-value">892</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-label">Patient Visits</div>
            <div className="stat-value">567</div>
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
            <h3>Bills Overview</h3>
          </div>
          <div className="card-content">
            <div className="overview-item">
              <span className="overview-label">Pending Bills</span>
              <span className="overview-value">23</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Paid Bills</span>
              <span className="overview-value">156</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Overdue</span>
              <span className="overview-value">8</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Amount</span>
              <span className="overview-value">₱1,245,678</span>
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
              <span>Active Patients</span>
              <span className="access-count">342</span>
            </div>
            <div className="access-item">
              <span>New This Month</span>
              <span className="access-count">28</span>
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
              Staff
            </h3>
          </div>
          <div className="quick-access-content">
            <div className="access-item">
              <span>Total Staff</span>
              <span className="access-count">24</span>
            </div>
            <div className="access-item">
              <span>On Duty</span>
              <span className="access-count">18</span>
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
              Patient Visits
            </h3>
          </div>
          <div className="activity-content">
            <div className="activity-chart">
              <div className="analytics-title">Visit Analytics</div>
              <div className="activity-stats">
                <div className="activity-stat">
                  <span>Today</span>
                  <span className="stat-number">24</span>
                </div>
                <div className="activity-stat">
                  <span>This Week</span>
                  <span className="stat-number">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

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

  const renderStaffManagement = () => {
    const staff = users.filter(user => user.role === 'medtech');
    const staffStats = userStats?.byRole?.find(stat => stat._id === 'medtech') || { count: 0, active: 0 };
    
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
            <h2>Staff Management</h2>
            <p>Manage laboratory staff, schedules, and performance</p>
          </div>
          <button className="add-btn" onClick={() => openUserModal()}>
            + Add New Staff
          </button>
        </div>

        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Staff</div>
              <div className="stat-value">{staffStats.count}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Staff</div>
              <div className="stat-value">{staffStats.active}</div>
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
              <div className="stat-value">{staff.length}</div>
            </div>
          </div>
        </div>

        <div className="management-content">
          <div className="content-header">
            <div className="search-filter">
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Staff</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="data-table">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading staff...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Staff ID</th>
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
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No staff found
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.id}>
                        <td>S{member.id.slice(-6)}</td>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>Lab Technician</td>
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
                              onClick={() => openViewStaffModal(member)}
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
                      <button className="btn-print" title="Print Receipt" onClick={() => handlePrintReceipt(transaction)}>Print</button>
                      {transaction.status === 'completed' && <button className="btn-refund" title="Refund" onClick={() => handleRefundTransaction(transaction)}>Refund</button>}
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
                  <td>{payment.paymentId}</td>
                  <td>{payment.billId}</td>
                  <td>{payment.patientName}</td>
                  <td>₱{payment.amount?.toLocaleString()}</td>
                  <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                  <td>{payment.paymentMethod?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>{payment.verifiedBy || '-'}</td>
                  <td><span className={`status ${payment.status}`}>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-receipt" title="Receipt" onClick={() => handlePrintPaymentReceipt(payment)}>Receipt</button>
                      {payment.status === 'pending' && (
                        <>
                          <button className="btn-verify" title="Verify" onClick={() => handleVerifyPayment(payment)}>Verify</button>
                          <button className="btn-dispute" title="Dispute" onClick={() => handleDisputePayment(payment)}>Dispute</button>
                        </>
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

  const renderBillingRates = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Billing Rates & Pricing</h2>
          <p>Manage test pricing, packages, and billing configurations</p>
        </div>
        <button className="add-btn" onClick={handleAddBillingRate}>+ Add New Rate</button>
      </div>

      <div className="billing-categories">
        <div className="category-tabs">
          <button className="tab-btn active">Laboratory Tests</button>
          <button className="tab-btn">Imaging Services</button>
          <button className="tab-btn">Packages</button>
          <button className="tab-btn">Emergency Rates</button>
        </div>

        <div className="rates-grid">
          <div className="rate-card">
            <div className="rate-header">
              <h3>Complete Blood Count (CBC)</h3>
              <span className="rate-category">Hematology</span>
            </div>
            <div className="rate-details">
              <div className="rate-price">₱800</div>
              <div className="rate-info">
                <span>TAT: 2-4 hours</span>
                <span>Sample: Blood</span>
              </div>
            </div>
            <div className="rate-actions">
              <button className="btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button className="btn-history">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                History
              </button>
            </div>
          </div>

          <div className="rate-card">
            <div className="rate-header">
              <h3>Urinalysis</h3>
              <span className="rate-category">Clinical Pathology</span>
            </div>
            <div className="rate-details">
              <div className="rate-price">₱300</div>
              <div className="rate-info">
                <span>TAT: 1-2 hours</span>
                <span>Sample: Urine</span>
              </div>
            </div>
            <div className="rate-actions">
              <button className="btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button className="btn-history">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                History
              </button>
            </div>
          </div>

          <div className="rate-card">
            <div className="rate-header">
              <h3>X-Ray Chest PA</h3>
              <span className="rate-category">Radiology</span>
            </div>
            <div className="rate-details">
              <div className="rate-price">₱1,200</div>
              <div className="rate-info">
                <span>TAT: 30 minutes</span>
                <span>Type: Digital</span>
              </div>
            </div>
            <div className="rate-actions">
              <button className="btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button className="btn-history">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                History
              </button>
            </div>
          </div>

          <div className="rate-card">
            <div className="rate-header">
              <h3>Basic Health Package</h3>
              <span className="rate-category">Package Deal</span>
            </div>
            <div className="rate-details">
              <div className="rate-price">₱2,500</div>
              <div className="rate-savings">Save ₱700</div>
              <div className="rate-info">
                <span>Includes: CBC, Urinalysis, FBS</span>
                <span>Popular package</span>
              </div>
            </div>
            <div className="rate-actions">
              <button className="btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button className="btn-history">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialReports = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Financial Reports</h2>
          <p>Comprehensive financial analytics and reporting dashboard</p>
        </div>
        <div className="header-actions">
          <button className="generate-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            Generate Report
          </button>
          <button className="schedule-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Schedule Report
          </button>
        </div>
      </div>

      <div className="reports-overview">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Monthly Revenue</h3>
            <div className="summary-value">₱1,245,670</div>
            <div className="summary-change positive">+12.5% from last month</div>
          </div>
          <div className="summary-card">
            <h3>Outstanding Receivables</h3>
            <div className="summary-value">₱245,670</div>
            <div className="summary-change negative">+5.2% from last month</div>
          </div>
          <div className="summary-card">
            <h3>Collection Rate</h3>
            <div className="summary-value">94.5%</div>
            <div className="summary-change positive">+2.1% from last month</div>
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
            <h3>Payment Methods Distribution</h3>
            <div className="chart-placeholder">
              <div className="pie-chart">
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="legend-color cash"></span>
                    <span>Cash (45%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color card"></span>
                    <span>Card (35%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color online"></span>
                    <span>Online (20%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-reports">
        <h3>Quick Reports</h3>
        <div className="report-buttons">
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
              <polyline points="17,6 23,6 23,12"></polyline>
            </svg>
            Daily Sales Report
          </button>
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Weekly Revenue Summary
          </button>
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            Monthly Financial Statement
          </button>
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Outstanding Bills Report
          </button>
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4"></path>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="M7 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Payment Method Analysis
          </button>
          <button className="report-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
            </svg>
            Overdue Accounts Report
          </button>
        </div>
      </div>
    </div>
  );

  // Account Settings Function
  const renderAccountSettings = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Account Settings</h2>
          <p>Manage your profile, security settings, and system preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <button className="settings-nav-item active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile Information
            </button>
            <button className="settings-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Security & Privacy
            </button>
            <button className="settings-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Notifications
            </button>
            <button className="settings-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
              Appearance
            </button>
            <button className="settings-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              System Preferences
            </button>
            <button className="settings-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Laboratory Settings
            </button>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Profile Information</h3>
            <div className="profile-form">
              <div className="profile-avatar">
                <div className="avatar-display">
                  <span>{user?.firstName?.charAt(0) || 'A'}</span>
                </div>
                <button className="change-avatar-btn">Change Photo</button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={user?.firstName || ''} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={user?.lastName || ''} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={user?.phone || ''} />
                </div>
                <div className="form-group">
                  <label>Position/Title</label>
                  <input type="text" value="Laboratory Administrator" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" value="Administration" />
                </div>
              </div>
              
              <div className="form-actions">
                <button className="save-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Save Changes
                </button>
                <button className="cancel-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="security-options">
              <div className="security-item">
                <div className="security-info">
                  <h4>Change Password</h4>
                  <p>Update your account password</p>
                </div>
                <button className="security-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Change Password
                </button>
              </div>
              
              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="security-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Enable 2FA
                </button>
              </div>
              
              <div className="security-item">
                <div className="security-info">
                  <h4>Active Sessions</h4>
                  <p>Manage your logged-in devices</p>
                </div>
                <button className="security-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  View Sessions
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>System Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label>
                  <span>Language</span>
                  <select>
                    <option>English</option>
                    <option>Filipino</option>
                  </select>
                </label>
              </div>
              
              <div className="preference-item">
                <label>
                  <span>Timezone</span>
                  <select>
                    <option>Asia/Manila (UTC+8)</option>
                  </select>
                </label>
              </div>
              
              <div className="preference-item">
                <label>
                  <span>Date Format</span>
                  <select>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </label>
              </div>
              
              <div className="preference-item">
                <label>
                  <span>Currency</span>
                  <select>
                    <option>Philippine Peso (₱)</option>
                    <option>US Dollar ($)</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Customer Feedbacks Function
  const renderCustomerFeedbacks = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Customer Feedbacks</h2>
          <p>Monitor patient satisfaction and feedback analytics</p>
        </div>
        <div className="header-actions">
          <button className="add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Send Survey
          </button>
          <button className="analytics-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            Feedback Analytics
          </button>
        </div>
      </div>

      <div className="feedback-overview">
        <div className="feedback-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Average Rating</div>
              <div className="stat-value">4.8/5.0</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Reviews</div>
              <div className="stat-value">1,247</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Satisfaction Rate</div>
              <div className="stat-value">96.3%</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Response Rate</div>
              <div className="stat-value">78.5%</div>
            </div>
          </div>
        </div>

        <div className="rating-breakdown">
          <h3>Rating Distribution</h3>
          <div className="rating-bars">
            <div className="rating-row">
              <span>5 ⭐</span>
              <div className="rating-bar">
                <div className="rating-fill" style={{width: '75%'}}></div>
              </div>
              <span>75%</span>
            </div>
            <div className="rating-row">
              <span>4 ⭐</span>
              <div className="rating-bar">
                <div className="rating-fill" style={{width: '18%'}}></div>
              </div>
              <span>18%</span>
            </div>
            <div className="rating-row">
              <span>3 ⭐</span>
              <div className="rating-bar">
                <div className="rating-fill" style={{width: '5%'}}></div>
              </div>
              <span>5%</span>
            </div>
            <div className="rating-row">
              <span>2 ⭐</span>
              <div className="rating-bar">
                <div className="rating-fill" style={{width: '1.5%'}}></div>
              </div>
              <span>1.5%</span>
            </div>
            <div className="rating-row">
              <span>1 ⭐</span>
              <div className="rating-bar">
                <div className="rating-fill" style={{width: '0.5%'}}></div>
              </div>
              <span>0.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="feedbacks-list">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search feedbacks..." className="search-input" />
            <select className="filter-select">
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars</option>
              <option>3 Stars</option>
              <option>2 Stars</option>
              <option>1 Star</option>
            </select>
            <select className="filter-select">
              <option>All Departments</option>
              <option>Laboratory</option>
              <option>Radiology</option>
              <option>Customer Service</option>
            </select>
          </div>
        </div>

        <div className="feedback-cards">
          <div className="feedback-card">
            <div className="feedback-header">
              <div className="patient-info">
                <div className="patient-avatar">
                  <span>JD</span>
                </div>
                <div className="patient-details">
                  <h4>Juan dela Cruz</h4>
                  <p>September 14, 2024</p>
                </div>
              </div>
              <div className="feedback-rating">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <span>5.0</span>
              </div>
            </div>
            <div className="feedback-content">
              <p>"Excellent service! The staff was very professional and the results were ready quickly. The facility is clean and well-organized. Highly recommended!"</p>
            </div>
            <div className="feedback-tags">
              <span className="tag">Laboratory</span>
              <span className="tag">Customer Service</span>
            </div>
            <div className="feedback-actions">
              <button className="respond-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Respond
              </button>
              <button className="flag-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Flag
              </button>
            </div>
          </div>

          <div className="feedback-card">
            <div className="feedback-header">
              <div className="patient-info">
                <div className="patient-avatar">
                  <span>MS</span>
                </div>
                <div className="patient-details">
                  <h4>Maria Santos</h4>
                  <p>September 13, 2024</p>
                </div>
              </div>
              <div className="feedback-rating">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <span>5.0</span>
              </div>
            </div>
            <div className="feedback-content">
              <p>"Fast and accurate test results. The online booking system is very convenient. Staff explained everything clearly."</p>
            </div>
            <div className="feedback-tags">
              <span className="tag">Online Booking</span>
              <span className="tag">Communication</span>
            </div>
            <div className="feedback-actions">
              <button className="respond-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Respond
              </button>
              <button className="feature-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
                Feature
              </button>
            </div>
          </div>

          <div className="feedback-card urgent">
            <div className="feedback-header">
              <div className="patient-info">
                <div className="patient-avatar">
                  <span>PR</span>
                </div>
                <div className="patient-details">
                  <h4>Pedro Rodriguez</h4>
                  <p>September 12, 2024</p>
                </div>
              </div>
              <div className="feedback-rating">
                <div className="stars">⭐⭐⭐</div>
                <span>3.0</span>
              </div>
            </div>
            <div className="feedback-content">
              <p>"Service was okay but had to wait longer than expected. The staff could be more attentive to patient concerns."</p>
            </div>
            <div className="feedback-tags">
              <span className="tag">Wait Time</span>
              <span className="tag">Customer Service</span>
            </div>
            <div className="feedback-actions">
              <button className="respond-btn urgent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Priority Response
              </button>
              <button className="follow-up-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Follow Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // System Logs Function
  const renderSystemLogs = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>System Logs</h2>
          <p>Monitor system activities, user actions, and security events</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Logs
          </button>
          <button className="clear-btn">Clear Old Logs</button>
        </div>
      </div>

      <div className="logs-overview">
        <div className="log-stats">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Total Events Today</div>
              <div className="stat-value">1,247</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">23</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">Security Alerts</div>
              <div className="stat-value">2</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <div className="stat-label">System Uptime</div>
              <div className="stat-value">99.9%</div>
            </div>
          </div>
        </div>

        <div className="log-categories">
          <div className="category-tabs">
            <button className="tab-btn active">All Logs</button>
            <button className="tab-btn">User Actions</button>
            <button className="tab-btn">System Events</button>
            <button className="tab-btn">Security</button>
            <button className="tab-btn">Errors</button>
          </div>
        </div>
      </div>

      <div className="logs-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search logs..." className="search-input" />
            <select className="filter-select">
              <option>All Levels</option>
              <option>Info</option>
              <option>Warning</option>
              <option>Error</option>
              <option>Critical</option>
            </select>
            <input type="datetime-local" className="date-filter" />
            <input type="datetime-local" className="date-filter" />
          </div>
        </div>

        <div className="logs-table">
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
              <tr>
                <td>2024-09-14 10:30:15</td>
                <td><span className="log-level info">INFO</span></td>
                <td>admin@mdlab.com</td>
                <td>User Login</td>
                <td>Successful authentication</td>
                <td>192.168.1.112</td>
                <td><span className="status success">Success</span></td>
              </tr>
              <tr>
                <td>2024-09-14 10:28:42</td>
                <td><span className="log-level info">INFO</span></td>
                <td>medtech1@mdlab.com</td>
                <td>Test Result Entry</td>
                <td>Updated CBC results for patient P001</td>
                <td>192.168.1.115</td>
                <td><span className="status success">Success</span></td>
              </tr>
              <tr>
                <td>2024-09-14 10:25:18</td>
                <td><span className="log-level warning">WARNING</span></td>
                <td>system</td>
                <td>Database Connection</td>
                <td>Connection timeout, retried successfully</td>
                <td>127.0.0.1</td>
                <td><span className="status warning">Resolved</span></td>
              </tr>
              <tr>
                <td>2024-09-14 10:20:55</td>
                <td><span className="log-level error">ERROR</span></td>
                <td>patient123@email.com</td>
                <td>Login Attempt</td>
                <td>Failed login - incorrect password</td>
                <td>203.177.45.123</td>
                <td><span className="status error">Failed</span></td>
              </tr>
              <tr>
                <td>2024-09-14 10:15:33</td>
                <td><span className="log-level info">INFO</span></td>
                <td>pathologist1@mdlab.com</td>
                <td>Report Generation</td>
                <td>Generated pathology report for case C-2024-0891</td>
                <td>192.168.1.118</td>
                <td><span className="status success">Success</span></td>
              </tr>
              <tr className="security-alert">
                <td>2024-09-14 09:45:22</td>
                <td><span className="log-level critical">CRITICAL</span></td>
                <td>unknown</td>
                <td>Security Event</td>
                <td>Multiple failed login attempts detected</td>
                <td>45.133.247.89</td>
                <td><span className="status blocked">Blocked</span></td>
              </tr>
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
                    <option value="medtech">Medical Technician</option>
                    <option value="pathologist">Pathologist</option>
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

  // Staff View Modal Component
  const renderViewStaffModal = () => {
    if (!showViewStaffModal || !selectedStaff) return null;
    
    const staff = selectedStaff;
    const staffName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown Staff';
    const email = staff.email || 'N/A';
    const phone = staff.phone || 'N/A';
    const username = staff.username || 'N/A';
    const role = staff.role || 'staff';
    const gender = staff.gender || 'N/A';
    const dateOfBirth = staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : 'N/A';
    const isActive = staff.isActive !== undefined ? staff.isActive : true;
    const createdAt = staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A';
    const lastLogin = staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : 'Never';
    
    // Handle address safely
    const address = staff.address || {};
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
        <div className="modal-overlay" onClick={closeStaffModal}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Staff Details - {staffName}</h3>
              <button className="modal-close" onClick={closeStaffModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="view-grid">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{staffName}</span>
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
      console.error('Error rendering staff view modal:', error);
      return (
        <div className="modal-overlay" onClick={closeStaffModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Loading Staff</h3>
              <button className="modal-close" onClick={closeStaffModal}>×</button>
            </div>
            <div className="modal-body">
              <p>There was an error loading the staff details. Please try again.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeStaffModal}>
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">MDLAB DIRECT</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('dashboard')}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
          </div>

          <div className="dropdown">
            <div className="nav-item-header" onClick={toggleUserManagement}>
              <div className="nav-item-main">
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <span className="nav-text">User Management</span>
              </div>
              <span className={`dropdown-arrow ${userManagementOpen ? 'open' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </span>
            </div>
            {userManagementOpen && (
              <div className="nav-submenu">
                <div 
                  className={`nav-subitem ${activeSection === 'patient' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('patient')}
                >
                  Patient
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'staff' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('staff')}
                >
                  Staff
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'pathologist' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('pathologist')}
                >
                  Pathologist
                </div>
              </div>
            )}
          </div>

          <div className="dropdown">
            <div className="nav-item-header" onClick={toggleFinance}>
              <div className="nav-item-main">
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </span>
                <span className="nav-text">Finance</span>
              </div>
              <span className={`dropdown-arrow ${financeOpen ? 'open' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </span>
            </div>
            {financeOpen && (
              <div className="nav-submenu">
                <div 
                  className={`nav-subitem ${activeSection === 'bills' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('bills')}
                >
                  Bills
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'transaction' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('transaction')}
                >
                  Transaction
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'payments' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('payments')}
                >
                  Payments
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'billing-rates' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('billing-rates')}
                >
                  Billing Rates
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'reports' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('reports')}
                >
                  Reports
                </div>
              </div>
            )}
          </div>

          <div 
            className={`nav-item ${activeSection === 'accounts' ? 'active' : ''}`}
            onClick={() => handleSectionClick('accounts')}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span className="nav-text">Accounts</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'feedbacks' ? 'active' : ''}`}
            onClick={() => handleSectionClick('feedbacks')}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span className="nav-text">Feedbacks</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => handleSectionClick('logs')}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </span>
            <span className="nav-text">Logs</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
            </div>
            <div className="user-details">
              <span className="user-role">{user?.role?.toUpperCase() || 'USER'}</span>
              <span className="user-email">{user?.email || 'user@example.com'}</span>
              <span className="user-name">{user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="page-title">{renderPageTitle()}</h1>
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
      
      {/* Patient View Modal */}
      {renderViewPatientModal()}
      
      {/* Staff View Modal */}
      {renderViewStaffModal()}
      
      {/* Pathologist View Modal */}
      {renderViewPathologistModal()}
      
      {/* Schedule Edit Modal */}
      {renderScheduleEditModal()}
      
      {/* Certification Management Modal */}
      {renderCertificationModal()}
    </div>
  );
}

export default Dashboard;
