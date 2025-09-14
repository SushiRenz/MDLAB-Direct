import React, { useState } from 'react';
import '../design/Dashboard.css';

function Dashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

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

  const renderPageTitle = () => {
    switch (activeSection) {
      case 'patient': return 'Patient Management';
      case 'staff': return 'Staff Management';
      case 'pathologist': return 'Pathologist Management';
      case 'admin': return 'Staff Management';
      case 'mobile-account': return 'Mobile Account Management';
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
      case 'mobile-account': return renderMobileAccountManagement();
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
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Test Results</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Completed Reports</div>
            <div className="stat-value">892</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
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

  const renderPatientManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Patient Management</h2>
          <p>Manage patient records, view appointments, and track medical history</p>
        </div>
        <button className="add-btn">+ Add New Patient</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"></path>
              <polyline points="2,7 12,12 22,7"></polyline>
              <polyline points="12,12 12,22"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">New This Month</div>
            <div className="stat-value">45</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Appointments Today</div>
            <div className="stat-value">28</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Tests</div>
            <div className="stat-value">12</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search patients..." className="search-input" />
            <select className="filter-select">
              <option>All Patients</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Recent</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>P001</td>
                <td>Juan dela Cruz</td>
                <td>32</td>
                <td>Male</td>
                <td>+639123456789</td>
                <td>2024-08-28</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>P002</td>
                <td>Maria Santos</td>
                <td>28</td>
                <td>Female</td>
                <td>+639987654321</td>
                <td>2024-08-30</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>P003</td>
                <td>Pedro Rodriguez</td>
                <td>45</td>
                <td>Male</td>
                <td>+639555444333</td>
                <td>2024-08-25</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
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

  const renderStaffManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Staff Management</h2>
          <p>Manage laboratory staff, schedules, and performance</p>
        </div>
        <button className="add-btn">+ Add New Staff</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Staff</div>
            <div className="stat-value">24</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">On Duty</div>
            <div className="stat-value">18</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">On Leave</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Overtime Hours</div>
            <div className="stat-value">45</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search staff..." className="search-input" />
            <select className="filter-select">
              <option>All Staff</option>
              <option>Lab Technicians</option>
              <option>Nurses</option>
              <option>Administrators</option>
              <option>Security</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S001</td>
                <td>Dr. Ana Reyes</td>
                <td>Senior Lab Technician</td>
                <td>Hematology</td>
                <td>+639111222333</td>
                <td><span className="status active">On Duty</span></td>
                <td>8:00 AM - 5:00 PM</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>S002</td>
                <td>Mark Johnson</td>
                <td>Lab Technician</td>
                <td>Chemistry</td>
                <td>+639444555666</td>
                <td><span className="status active">On Duty</span></td>
                <td>9:00 AM - 6:00 PM</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>S003</td>
                <td>Lisa Garcia</td>
                <td>Nurse</td>
                <td>Sample Collection</td>
                <td>+639777888999</td>
                <td><span className="status leave">On Leave</span></td>
                <td>7:00 AM - 4:00 PM</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
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

  const renderPathologistManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Pathologist Management</h2>
          <p>Manage pathologists, specializations, and case assignments</p>
        </div>
        <button className="add-btn">+ Add New Pathologist</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Pathologists</div>
            <div className="stat-value">8</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Cases</div>
            <div className="stat-value">32</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Completed Today</div>
            <div className="stat-value">15</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">7</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search pathologists..." className="search-input" />
            <select className="filter-select">
              <option>All Pathologists</option>
              <option>Anatomical Pathology</option>
              <option>Clinical Pathology</option>
              <option>Cytopathology</option>
              <option>Molecular Pathology</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Pathologist ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>License No.</th>
                <th>Contact</th>
                <th>Cases Assigned</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PATH001</td>
                <td>Dr. Roberto Cruz</td>
                <td>Anatomical Pathology</td>
                <td>PRC-123456</td>
                <td>+639111222333</td>
                <td>8</td>
                <td><span className="status active">Available</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>PATH002</td>
                <td>Dr. Carmen Lopez</td>
                <td>Clinical Pathology</td>
                <td>PRC-654321</td>
                <td>+639444555666</td>
                <td>12</td>
                <td><span className="status busy">Busy</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>PATH003</td>
                <td>Dr. Michael Wong</td>
                <td>Cytopathology</td>
                <td>PRC-789012</td>
                <td>+639777888999</td>
                <td>5</td>
                <td><span className="status active">Available</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
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
                    <button className="btn-view">View</button>
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
                    <button className="btn-view">View</button>
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
                    <button className="btn-view">View</button>
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

  const renderMobileAccountManagement = () => (
    <div className="management-container">
      <div className="management-header">
        <div className="management-title">
          <h2>Mobile Account Management</h2>
          <p>Manage mobile app users and device registrations</p>
        </div>
        <button className="add-btn">+ Add Mobile User</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Mobile Users</div>
            <div className="stat-value">456</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 7.76 3.52 3.52m0 16.96 4.24-4.24m8.48-8.48 4.24-4.24"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">89</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">App Downloads</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Sync Requests</div>
            <div className="stat-value">145</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search mobile users..." className="search-input" />
            <select className="filter-select">
              <option>All Users</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Verified</option>
              <option>Unverified</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Device</th>
                <th>Last Sync</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>M001</td>
                <td>Carlos Mendoza</td>
                <td>carlos@email.com</td>
                <td>+639123456789</td>
                <td>iPhone 13</td>
                <td>2024-09-01 09:15</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>M002</td>
                <td>Elena Vasquez</td>
                <td>elena@email.com</td>
                <td>+639987654321</td>
                <td>Samsung Galaxy</td>
                <td>2024-08-31 18:30</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>M003</td>
                <td>David Kim</td>
                <td>david@email.com</td>
                <td>+639555444333</td>
                <td>Google Pixel</td>
                <td>2024-08-28 14:20</td>
                <td><span className="status inactive">Inactive</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">View</button>
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
        <button className="add-btn">+ Create New Bill</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Outstanding</div>
            <div className="stat-value">₱245,670</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Bills</div>
            <div className="stat-value">23</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Paid This Month</div>
            <div className="stat-value">156</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">8</div>
          </div>
        </div>
      </div>

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
              <tr>
                <td>BL-2024-001</td>
                <td>Juan dela Cruz</td>
                <td>Complete Blood Count, Urinalysis</td>
                <td>₱2,500</td>
                <td>2024-09-10</td>
                <td>2024-09-25</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-edit" title="Edit">Edit</button>
                    <button className="btn-send" title="Send">Send</button>
                    <button className="btn-print" title="Print">Print</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>BL-2024-002</td>
                <td>Maria Santos</td>
                <td>X-Ray Chest, ECG</td>
                <td>₱3,200</td>
                <td>2024-09-08</td>
                <td>2024-09-23</td>
                <td><span className="status paid">Paid</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-edit" title="Edit">Edit</button>
                    <button className="btn-print" title="Print">Print</button>
                    <button className="btn-receipt" title="Receipt">🧾</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>BL-2024-003</td>
                <td>Pedro Rodriguez</td>
                <td>Lipid Profile, Blood Sugar</td>
                <td>₱1,800</td>
                <td>2024-08-28</td>
                <td>2024-09-12</td>
                <td><span className="status overdue">Overdue</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-edit" title="Edit">Edit</button>
                    <button className="btn-remind" title="Remind">Remind</button>
                    <button className="btn-call" title="Call">📞</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
          <button className="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            Export Report
          </button>
          <button className="filter-btn">🔍 Advanced Filter</button>
        </div>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">₱48,500</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">This Week</div>
            <div className="stat-value">₱325,670</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4"></path>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m7 21 2-4 2 4"></path>
              <path d="m7 21-2-4 2-4"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Cash Payments</div>
            <div className="stat-value">₱125,000</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Card Payments</div>
            <div className="stat-value">₱200,670</div>
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
              <tr>
                <td>TXN-2024-0891</td>
                <td>2024-09-14 09:30</td>
                <td>Juan dela Cruz</td>
                <td>Laboratory Tests - CBC, Urinalysis</td>
                <td>Cash</td>
                <td>₱2,500</td>
                <td><span className="status completed">Completed</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-print" title="Print Receipt">Print</button>
                    <button className="btn-refund" title="Refund">Refund</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-2024-0890</td>
                <td>2024-09-14 08:15</td>
                <td>Maria Santos</td>
                <td>X-Ray Services</td>
                <td>Credit Card</td>
                <td>₱3,200</td>
                <td><span className="status completed">Completed</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-print" title="Print Receipt">Print</button>
                    <button className="btn-details" title="Payment Details">💳</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-2024-0889</td>
                <td>2024-09-13 16:45</td>
                <td>Carlos Mendoza</td>
                <td>Emergency Lab Package</td>
                <td>Online Payment</td>
                <td>₱5,500</td>
                <td><span className="status processing">Processing</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-track" title="Track Payment">📍</button>
                    <button className="btn-verify" title="Verify">✅</button>
                  </div>
                </td>
              </tr>
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
          <button className="add-btn">+ Record Payment</button>
          <button className="reconcile-btn">Reconcile</button>
        </div>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Collected</div>
            <div className="stat-value">₱1,245,670</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Verification</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Refunds Processed</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Collection Rate</div>
            <div className="stat-value">94.5%</div>
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
              <tr>
                <td>PAY-2024-0234</td>
                <td>BL-2024-001</td>
                <td>Juan dela Cruz</td>
                <td>₱2,500</td>
                <td>2024-09-14 10:30</td>
                <td>Cash</td>
                <td>Maria Santos</td>
                <td><span className="status verified">Verified</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-receipt" title="Receipt">🧾</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>PAY-2024-0235</td>
                <td>BL-2024-005</td>
                <td>Anna Rodriguez</td>
                <td>₱3,800</td>
                <td>2024-09-14 11:15</td>
                <td>GCash</td>
                <td>-</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View">View</button>
                    <button className="btn-verify" title="Verify">✅</button>
                    <button className="btn-dispute" title="Dispute">Dispute</button>
                  </div>
                </td>
              </tr>
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
        <button className="add-btn">+ Add New Rate</button>
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
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Average Rating</div>
              <div className="stat-value">4.8/5.0</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Reviews</div>
              <div className="stat-value">1,247</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Satisfaction Rate</div>
              <div className="stat-value">96.3%</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
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
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Events Today</div>
              <div className="stat-value">1,247</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">23</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-label">Security Alerts</div>
              <div className="stat-value">2</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
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
                <div 
                  className={`nav-subitem ${activeSection === 'admin' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('admin')}
                >
                  Staff
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'mobile-account' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('mobile-account')}
                >
                  Mobile Account
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
    </div>
  );
}

export default Dashboard;
