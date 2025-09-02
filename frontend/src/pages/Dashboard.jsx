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
      case 'admin': return 'Admin Management';
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
      default: return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Top Row Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-label">Pending Test Results</div>
            <div className="stat-value">45</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Completed Reports</div>
            <div className="stat-value">892</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
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
              📈 Revenue Chart
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
            <h3>👥 Patients</h3>
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
            <h3>👨‍⚕️ Staff</h3>
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
            <h3>👥 Patient Visits</h3>
          </div>
          <div className="activity-content">
            <div className="activity-chart">
              📊 Visit Analytics
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
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <div className="stat-label">New This Month</div>
            <div className="stat-value">45</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">Appointments Today</div>
            <div className="stat-value">28</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <div className="stat-label">Total Staff</div>
            <div className="stat-value">24</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">On Duty</div>
            <div className="stat-value">18</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">On Leave</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <div className="stat-label">Total Pathologists</div>
            <div className="stat-value">8</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-label">Active Cases</div>
            <div className="stat-value">32</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Completed Today</div>
            <div className="stat-value">15</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
          <h2>Admin Management</h2>
          <p>Manage system administrators and access permissions</p>
        </div>
        <button className="add-btn">+ Add New Admin</button>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <div className="stat-label">Total Admins</div>
            <div className="stat-value">5</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-info">
            <div className="stat-label">Permission Groups</div>
            <div className="stat-value">4</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">System Actions</div>
            <div className="stat-value">127</div>
          </div>
        </div>
      </div>

      <div className="management-content">
        <div className="content-header">
          <div className="search-filter">
            <input type="text" placeholder="Search admins..." className="search-input" />
            <select className="filter-select">
              <option>All Admins</option>
              <option>Super Admin</option>
              <option>System Admin</option>
              <option>Lab Admin</option>
              <option>Finance Admin</option>
            </select>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Admin ID</th>
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
                <td>A001</td>
                <td>Sarah Johnson</td>
                <td>Super Admin</td>
                <td>Full Access</td>
                <td>2024-09-01 08:30</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>A002</td>
                <td>Robert Chen</td>
                <td>System Admin</td>
                <td>User Management, System</td>
                <td>2024-08-31 16:45</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>A003</td>
                <td>Linda Martinez</td>
                <td>Lab Admin</td>
                <td>Lab Operations, Reports</td>
                <td>2024-09-01 07:15</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            <div className="stat-label">Mobile Users</div>
            <div className="stat-value">456</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">89</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">App Downloads</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
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
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
                  </div>
                </td>
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
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </div>

          <div className="dropdown">
            <div className="nav-item-header" onClick={toggleUserManagement}>
              <div className="nav-item-main">
                <span className="nav-icon">👥</span>
                <span className="nav-text">User Management</span>
              </div>
              <span className={`dropdown-arrow ${userManagementOpen ? 'open' : ''}`}>▼</span>
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
                  Admin
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
                <span className="nav-icon">💰</span>
                <span className="nav-text">Finance</span>
              </div>
              <span className={`dropdown-arrow ${financeOpen ? 'open' : ''}`}>▼</span>
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
            <span className="nav-icon">👤</span>
            <span className="nav-text">Accounts</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'feedbacks' ? 'active' : ''}`}
            onClick={() => handleSectionClick('feedbacks')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Feedbacks</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => handleSectionClick('logs')}
          >
            <span className="nav-icon">📝</span>
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
              🚪
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
