import React, { useState } from 'react';
import '../design/PathologistDashboard.css';

function PathologistDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const user = currentUser;

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleReview = () => {
    setReviewOpen(!reviewOpen);
  };

  const toggleReports = () => {
    setReportsOpen(!reportsOpen);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const renderPageTitle = () => {
    switch (activeSection) {
      case 'review-queue': return 'Review Queue';
      case 'case-review': return 'Case Review';
      case 'critical-values': return 'Critical Values';
      case 'differential-diagnosis': return 'Differential Diagnosis';
      case 'result-approval': return 'Result Approval';
      case 'interpretations': return 'Result Interpretations';
      case 'trending': return 'Patient Trending';
      case 'audit-trail': return 'Audit Trail';
      case 'quality-assurance': return 'Quality Assurance';
      case 'consultations': return 'Consultations';
      case 'teaching-cases': return 'Teaching Cases';
      case 'research': return 'Research';
      case 'profile': return 'My Profile';
      default: return 'Pathologist Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'review-queue': return renderReviewQueue();
      case 'case-review': return renderCaseReview();
      case 'critical-values': return renderCriticalValues();
      case 'differential-diagnosis': return renderDifferentialDiagnosis();
      case 'result-approval': return renderResultApproval();
      case 'interpretations': return renderInterpretations();
      case 'trending': return renderTrending();
      case 'audit-trail': return renderAuditTrail();
      case 'quality-assurance': return renderQualityAssurance();
      case 'consultations': return renderConsultations();
      case 'teaching-cases': return renderTeachingCases();
      case 'research': return renderResearch();
      case 'profile': return renderProfile();
      default: return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <>
      {/* Critical Alerts */}
      <div className="critical-alerts">
        <div className="alert-card critical">
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <div className="alert-title">Critical Values Alert</div>
            <div className="alert-message">3 critical values require immediate attention</div>
          </div>
          <button className="alert-action" onClick={() => handleSectionClick('critical-values')}>
            Review Now
          </button>
        </div>
        <div className="alert-card urgent">
          <div className="alert-icon">⚡</div>
          <div className="alert-content">
            <div className="alert-title">Urgent Reviews</div>
            <div className="alert-message">5 urgent cases awaiting pathologist review</div>
          </div>
          <button className="alert-action" onClick={() => handleSectionClick('review-queue')}>
            View Queue
          </button>
        </div>
      </div>

      {/* Top Row Stats */}
      <div className="pathologist-stats-grid">
        <div className="pathologist-stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-label">Cases to Review</div>
            <div className="stat-value">12</div>
          </div>
        </div>

        <div className="pathologist-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Approved Today</div>
            <div className="stat-value">28</div>
          </div>
        </div>

        <div className="pathologist-stat-card">
          <div className="stat-icon">🩺</div>
          <div className="stat-info">
            <div className="stat-label">Consultations</div>
            <div className="stat-value">5</div>
          </div>
        </div>

        <div className="pathologist-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">Reports Generated</div>
            <div className="stat-value">15</div>
          </div>
        </div>
      </div>

      {/* Review Queue Summary */}
      <div className="review-summary">
        <div className="summary-header">
          <h3>Review Queue Summary</h3>
          <button className="refresh-btn" onClick={() => window.location.reload()}>🔄 Refresh</button>
        </div>

        <div className="queue-grid">
          <div className="queue-card priority-critical">
            <div className="queue-header">
              <span className="queue-title">Critical Values</span>
              <span className="queue-count">3</span>
            </div>
            <div className="queue-items">
              <div className="queue-item">
                <span className="patient-name">John Emergency</span>
                <span className="test-type">Troponin: 45.2 ng/mL</span>
                <span className="time-stamp">15 min ago</span>
              </div>
              <div className="queue-item">
                <span className="patient-name">Mary Critical</span>
                <span className="test-type">Glucose: 450 mg/dL</span>
                <span className="time-stamp">32 min ago</span>
              </div>
            </div>
          </div>

          <div className="queue-card priority-urgent">
            <div className="queue-header">
              <span className="queue-title">Urgent Reviews</span>
              <span className="queue-count">5</span>
            </div>
            <div className="queue-items">
              <div className="queue-item">
                <span className="patient-name">Sarah Johnson</span>
                <span className="test-type">Comprehensive Metabolic Panel</span>
                <span className="time-stamp">1 hour ago</span>
              </div>
              <div className="queue-item">
                <span className="patient-name">Robert Chen</span>
                <span className="test-type">Cardiac Enzymes</span>
                <span className="time-stamp">2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="queue-card priority-routine">
            <div className="queue-header">
              <span className="queue-title">Routine Reviews</span>
              <span className="queue-count">4</span>
            </div>
            <div className="queue-items">
              <div className="queue-item">
                <span className="patient-name">Maria Santos</span>
                <span className="test-type">Complete Blood Count</span>
                <span className="time-stamp">3 hours ago</span>
              </div>
              <div className="queue-item">
                <span className="patient-name">David Kim</span>
                <span className="test-type">Lipid Profile</span>
                <span className="time-stamp">4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Trending */}
      <div className="trending-section">
        <div className="trending-header">
          <h3>Patient Trending & Insights</h3>
          <button className="btn-view-all" onClick={() => handleSectionClick('trending')}>
            View All Trends
          </button>
        </div>

        <div className="trending-cards">
          <div className="trending-card">
            <div className="trending-patient">
              <div className="patient-info">
                <span className="patient-name">Elena Rodriguez</span>
                <span className="patient-id">P12345</span>
              </div>
              <div className="trending-indicator trending-up">📈</div>
            </div>
            <div className="trending-data">
              <span className="trend-test">HbA1c trending upward</span>
              <span className="trend-period">Last 6 months</span>
              <div className="trend-values">
                <span>Jan: 6.2% → Sep: 8.1%</span>
              </div>
            </div>
            <button className="btn-review-trend">📊 Review</button>
          </div>

          <div className="trending-card">
            <div className="trending-patient">
              <div className="patient-info">
                <span className="patient-name">Michael Wong</span>
                <span className="patient-id">P67890</span>
              </div>
              <div className="trending-indicator trending-down">📉</div>
            </div>
            <div className="trending-data">
              <span className="trend-test">Cholesterol improving</span>
              <span className="trend-period">Last 3 months</span>
              <div className="trend-values">
                <span>Jun: 285 → Sep: 198 mg/dL</span>
              </div>
            </div>
            <button className="btn-review-trend">📊 Review</button>
          </div>

          <div className="trending-card">
            <div className="trending-patient">
              <div className="patient-info">
                <span className="patient-name">Lisa Anderson</span>
                <span className="patient-id">P11223</span>
              </div>
              <div className="trending-indicator trending-stable">📊</div>
            </div>
            <div className="trending-data">
              <span className="trend-test">Kidney function stable</span>
              <span className="trend-period">Last 12 months</span>
              <div className="trend-values">
                <span>Creatinine: 0.9-1.1 mg/dL</span>
              </div>
            </div>
            <button className="btn-review-trend">📊 Review</button>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="quality-metrics">
        <h3>Quality Assurance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Review Turnaround Time</div>
            <div className="metric-value">2.3 hours</div>
            <div className="metric-trend">↓ 15% from last month</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Critical Value Response</div>
            <div className="metric-value">8.5 minutes</div>
            <div className="metric-trend">↓ 20% from target</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Review Accuracy</div>
            <div className="metric-value">99.2%</div>
            <div className="metric-trend">↑ 0.3% from last month</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Cases Reviewed Today</div>
            <div className="metric-value">28</div>
            <div className="metric-trend">Target: 25-30</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderReviewQueue = () => (
    <div className="review-queue-container">
      <div className="queue-header">
        <h2>Review Queue</h2>
        <div className="queue-filters">
          <select className="filter-select">
            <option>All Priorities</option>
            <option>Critical</option>
            <option>Urgent</option>
            <option>Routine</option>
          </select>
          <select className="filter-select">
            <option>All Departments</option>
            <option>Hematology</option>
            <option>Chemistry</option>
            <option>Microbiology</option>
            <option>Immunology</option>
          </select>
          <button className="btn-auto-assign">🎯 Auto Assign</button>
        </div>
      </div>

      <div className="queue-table">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Critical Values</th>
              <th>Received</th>
              <th>Turnaround Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="priority-critical">
              <td><span className="priority-badge critical">CRITICAL</span></td>
              <td>
                <div className="patient-info">
                  <span className="patient-name">John Emergency</span>
                  <span className="patient-id">P98765</span>
                </div>
              </td>
              <td>Cardiac Markers</td>
              <td className="critical-values">
                <span className="critical-item">Troponin: 45.2 ng/mL</span>
              </td>
              <td>11:45 AM</td>
              <td className="overdue">15 min</td>
              <td>
                <button className="btn-review-critical">🚨 Review Now</button>
              </td>
            </tr>
            <tr className="priority-urgent">
              <td><span className="priority-badge urgent">URGENT</span></td>
              <td>
                <div className="patient-info">
                  <span className="patient-name">Sarah Johnson</span>
                  <span className="patient-id">P12345</span>
                </div>
              </td>
              <td>Comprehensive Metabolic Panel</td>
              <td>
                <span className="abnormal-item">Glucose: 185 mg/dL</span>
              </td>
              <td>10:30 AM</td>
              <td className="normal">1h 30m</td>
              <td>
                <button className="btn-review">📋 Review</button>
              </td>
            </tr>
            <tr className="priority-routine">
              <td><span className="priority-badge routine">ROUTINE</span></td>
              <td>
                <div className="patient-info">
                  <span className="patient-name">Maria Santos</span>
                  <span className="patient-id">P54321</span>
                </div>
              </td>
              <td>Complete Blood Count</td>
              <td>Normal Range</td>
              <td>09:15 AM</td>
              <td className="normal">2h 45m</td>
              <td>
                <button className="btn-review">📋 Review</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCaseReview = () => (
    <div className="case-review-container">
      <div className="case-header">
        <div className="case-info">
          <h2>Case Review - Sarah Johnson (P12345)</h2>
          <div className="case-meta">
            <span>Age: 45 | Gender: Female | DOB: 1979-03-15</span>
            <span className="priority-badge urgent">URGENT</span>
          </div>
        </div>
        <div className="case-actions">
          <button className="btn-previous">← Previous Case</button>
          <button className="btn-next">Next Case →</button>
        </div>
      </div>

      <div className="case-content">
        <div className="case-main">
          <div className="test-results">
            <h3>Test Results - Comprehensive Metabolic Panel</h3>
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                    <th>Previous</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="abnormal">
                    <td>Glucose</td>
                    <td className="result-value">185 mg/dL</td>
                    <td>70-100 mg/dL</td>
                    <td><span className="status-high">HIGH</span></td>
                    <td>165 mg/dL (Aug 15)</td>
                  </tr>
                  <tr className="normal">
                    <td>Sodium</td>
                    <td className="result-value">142 mEq/L</td>
                    <td>136-145 mEq/L</td>
                    <td><span className="status-normal">NORMAL</span></td>
                    <td>140 mEq/L</td>
                  </tr>
                  <tr className="abnormal">
                    <td>Creatinine</td>
                    <td className="result-value">1.8 mg/dL</td>
                    <td>0.6-1.2 mg/dL</td>
                    <td><span className="status-high">HIGH</span></td>
                    <td>1.6 mg/dL</td>
                  </tr>
                  <tr className="normal">
                    <td>BUN</td>
                    <td className="result-value">22 mg/dL</td>
                    <td>7-20 mg/dL</td>
                    <td><span className="status-high">HIGH</span></td>
                    <td>19 mg/dL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="interpretation-section">
            <h3>Clinical Interpretation</h3>
            <textarea 
              className="interpretation-text"
              placeholder="Enter your clinical interpretation and recommendations..."
              rows="6"
            ></textarea>
            
            <div className="interpretation-templates">
              <h4>Quick Templates:</h4>
              <div className="template-buttons">
                <button className="template-btn">Diabetes Management</button>
                <button className="template-btn">Kidney Function</button>
                <button className="template-btn">Electrolyte Imbalance</button>
                <button className="template-btn">Follow-up Recommended</button>
              </div>
            </div>
          </div>

          <div className="review-actions">
            <button className="btn-approve">✅ Approve Results</button>
            <button className="btn-flag">🚩 Flag for Consultation</button>
            <button className="btn-request-repeat">🔄 Request Repeat</button>
            <button className="btn-save-draft">💾 Save Draft</button>
          </div>
        </div>

        <div className="case-sidebar">
          <div className="patient-history">
            <h3>Patient History</h3>
            <div className="history-timeline">
              <div className="history-item">
                <div className="history-date">Aug 15, 2024</div>
                <div className="history-test">Comprehensive Metabolic Panel</div>
                <div className="history-result">Glucose: 165 mg/dL ↑</div>
              </div>
              <div className="history-item">
                <div className="history-date">Jul 20, 2024</div>
                <div className="history-test">HbA1c</div>
                <div className="history-result">7.8% ↑</div>
              </div>
              <div className="history-item">
                <div className="history-date">Jun 10, 2024</div>
                <div className="history-test">Lipid Profile</div>
                <div className="history-result">Normal</div>
              </div>
            </div>
          </div>

          <div className="clinical-notes">
            <h3>Clinical Notes</h3>
            <div className="notes-content">
              <div className="note-item">
                <div className="note-author">Dr. Smith</div>
                <div className="note-date">Sep 2, 2024</div>
                <div className="note-text">Patient reports increased thirst and urination. Family history of diabetes.</div>
              </div>
            </div>
          </div>

          <div className="reference-values">
            <h3>Reference Information</h3>
            <div className="reference-content">
              <div className="reference-item">
                <strong>Age-adjusted reference ranges applied</strong>
              </div>
              <div className="reference-item">
                <strong>Critical values:</strong>
                <ul>
                  <li>Glucose: &gt;400 mg/dL</li>
                  <li>Creatinine: &gt;3.0 mg/dL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCriticalValues = () => (
    <div className="critical-values-container">
      <div className="critical-header">
        <h2>Critical Values Alert System</h2>
        <div className="critical-stats">
          <div className="stat-item">
            <span>Active Alerts:</span>
            <span className="critical-count">3</span>
          </div>
          <div className="stat-item">
            <span>Response Time Target:</span>
            <span>15 minutes</span>
          </div>
        </div>
      </div>

      <div className="critical-alerts-list">
        <div className="critical-alert critical-new">
          <div className="alert-priority">🚨 CRITICAL</div>
          <div className="alert-patient">
            <div className="patient-name">John Emergency</div>
            <div className="patient-id">P98765</div>
            <div className="patient-location">Emergency Room</div>
          </div>
          <div className="alert-test">
            <div className="test-name">Troponin I</div>
            <div className="test-result">45.2 ng/mL</div>
            <div className="test-reference">Critical: &gt;40 ng/mL</div>
          </div>
          <div className="alert-timing">
            <div className="received-time">11:45 AM</div>
            <div className="elapsed-time critical">15 min elapsed</div>
          </div>
          <div className="alert-actions">
            <button className="btn-notify-physician">📞 Notify Physician</button>
            <button className="btn-review-critical">📋 Review Now</button>
          </div>
        </div>

        <div className="critical-alert critical-acknowledged">
          <div className="alert-priority">🔴 HIGH</div>
          <div className="alert-patient">
            <div className="patient-name">Mary Critical</div>
            <div className="patient-id">P45678</div>
            <div className="patient-location">ICU Bed 5</div>
          </div>
          <div className="alert-test">
            <div className="test-name">Blood Glucose</div>
            <div className="test-result">450 mg/dL</div>
            <div className="test-reference">Critical: &gt;400 mg/dL</div>
          </div>
          <div className="alert-timing">
            <div className="received-time">11:15 AM</div>
            <div className="elapsed-time warning">45 min elapsed</div>
          </div>
          <div className="alert-actions">
            <button className="btn-acknowledged">✅ Acknowledged</button>
            <button className="btn-follow-up">📋 Follow Up</button>
          </div>
        </div>

        <div className="critical-alert critical-in-progress">
          <div className="alert-priority">🟡 URGENT</div>
          <div className="alert-patient">
            <div className="patient-name">Robert Urgent</div>
            <div className="patient-id">P11111</div>
            <div className="patient-location">Cardiology Ward</div>
          </div>
          <div className="alert-test">
            <div className="test-name">Potassium</div>
            <div className="test-result">6.8 mEq/L</div>
            <div className="test-reference">Critical: &gt;6.5 mEq/L</div>
          </div>
          <div className="alert-timing">
            <div className="received-time">10:30 AM</div>
            <div className="elapsed-time normal">In Progress</div>
          </div>
          <div className="alert-actions">
            <button className="btn-in-progress">⏳ In Progress</button>
            <button className="btn-update">📝 Update</button>
          </div>
        </div>
      </div>

      <div className="critical-protocols">
        <h3>Critical Value Protocols</h3>
        <div className="protocol-grid">
          <div className="protocol-card">
            <div className="protocol-title">Cardiac Markers</div>
            <div className="protocol-content">
              <ul>
                <li>Notify attending physician immediately</li>
                <li>Document notification time</li>
                <li>Follow up within 30 minutes</li>
              </ul>
            </div>
          </div>
          <div className="protocol-card">
            <div className="protocol-title">Glucose Critical</div>
            <div className="protocol-content">
              <ul>
                <li>Alert nursing staff for immediate intervention</li>
                <li>Notify endocrinologist if available</li>
                <li>Consider repeat testing if indicated</li>
              </ul>
            </div>
          </div>
          <div className="protocol-card">
            <div className="protocol-title">Electrolyte Imbalance</div>
            <div className="protocol-content">
              <ul>
                <li>Assess patient's current clinical status</li>
                <li>Review recent medications and treatments</li>
                <li>Recommend immediate intervention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrending = () => (
    <div className="trending-container">
      <div className="trending-header">
        <h2>Patient Trending Analysis</h2>
        <div className="trending-filters">
          <input type="text" placeholder="Search patient..." className="search-input" />
          <select className="filter-select">
            <option>All Time Periods</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <select className="filter-select">
            <option>All Tests</option>
            <option>Glucose/HbA1c</option>
            <option>Lipid Profile</option>
            <option>Kidney Function</option>
            <option>Liver Function</option>
          </select>
        </div>
      </div>

      <div className="trending-analysis">
        <div className="trend-chart-container">
          <div className="chart-header">
            <h3>Elena Rodriguez - HbA1c Trend</h3>
            <div className="chart-controls">
              <button className="btn-chart-type">📊 Bar Chart</button>
              <button className="btn-chart-type">📈 Line Chart</button>
              <button className="btn-export">📥 Export</button>
            </div>
          </div>
          
          <div className="trend-chart">
            <div className="chart-grid">
              <div className="chart-y-axis">
                <span>10%</span>
                <span>8%</span>
                <span>6%</span>
                <span>4%</span>
              </div>
              <div className="chart-area">
                <div className="trend-line">
                  <div className="trend-point" style={{left: '10%', bottom: '40%'}} data-value="6.2% (Jan)"></div>
                  <div className="trend-point" style={{left: '30%', bottom: '50%'}} data-value="6.8% (Mar)"></div>
                  <div className="trend-point" style={{left: '50%', bottom: '60%'}} data-value="7.3% (May)"></div>
                  <div className="trend-point" style={{left: '70%', bottom: '70%'}} data-value="7.8% (Jul)"></div>
                  <div className="trend-point critical" style={{left: '90%', bottom: '80%'}} data-value="8.1% (Sep)"></div>
                </div>
              </div>
              <div className="chart-x-axis">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
              </div>
            </div>
          </div>

          <div className="trend-analysis-notes">
            <h4>Clinical Interpretation:</h4>
            <div className="analysis-content">
              <p>Persistent upward trend in HbA1c levels over 8 months indicates poor glycemic control. Current level of 8.1% exceeds target of &lt;7% for most diabetic patients.</p>
              <p><strong>Recommendations:</strong> Review current medication regimen, assess patient compliance, consider intensification of therapy.</p>
            </div>
          </div>
        </div>

        <div className="trending-insights">
          <h3>Trending Insights</h3>
          <div className="insight-cards">
            <div className="insight-card trend-worsening">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <div className="insight-title">Worsening Trends</div>
                <div className="insight-count">5 patients</div>
                <div className="insight-description">Require immediate attention</div>
              </div>
            </div>
            
            <div className="insight-card trend-improving">
              <div className="insight-icon">📉</div>
              <div className="insight-content">
                <div className="insight-title">Improving Trends</div>
                <div className="insight-count">12 patients</div>
                <div className="insight-description">Positive response to treatment</div>
              </div>
            </div>
            
            <div className="insight-card trend-stable">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <div className="insight-title">Stable Patterns</div>
                <div className="insight-count">23 patients</div>
                <div className="insight-description">Maintain current monitoring</div>
              </div>
            </div>
          </div>

          <div className="predictive-alerts">
            <h4>Predictive Alerts</h4>
            <div className="alert-item">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">3 patients at risk of developing complications based on current trends</span>
              <button className="btn-view-details">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="audit-container">
      <div className="audit-header">
        <h2>Audit Trail</h2>
        <div className="audit-filters">
          <input type="date" className="date-input" />
          <select className="filter-select">
            <option>All Activities</option>
            <option>Result Reviews</option>
            <option>Approvals</option>
            <option>Modifications</option>
            <option>Critical Values</option>
          </select>
          <select className="filter-select">
            <option>All Users</option>
            <option>Pathologists</option>
            <option>Lab Technicians</option>
            <option>System</option>
          </select>
        </div>
      </div>

      <div className="audit-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Patient/Sample</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12:15:33 PM</td>
              <td>Dr. {user?.firstName || 'Pathologist'}</td>
              <td>Result Approved</td>
              <td>Sarah Johnson (P12345)</td>
              <td>Comprehensive Metabolic Panel - Approved with interpretation</td>
              <td>192.168.1.45</td>
              <td><span className="status-success">Success</span></td>
            </tr>
            <tr>
              <td>11:45:21 AM</td>
              <td>Dr. {user?.firstName || 'Pathologist'}</td>
              <td>Critical Value Alert</td>
              <td>John Emergency (P98765)</td>
              <td>Troponin I: 45.2 ng/mL - Critical value notification sent</td>
              <td>192.168.1.45</td>
              <td><span className="status-critical">Critical</span></td>
            </tr>
            <tr>
              <td>11:30:15 AM</td>
              <td>Dr. {user?.firstName || 'Pathologist'}</td>
              <td>Result Modified</td>
              <td>Maria Santos (P54321)</td>
              <td>CBC interpretation updated - Added clinical notes</td>
              <td>192.168.1.45</td>
              <td><span className="status-modified">Modified</span></td>
            </tr>
            <tr>
              <td>10:22:08 AM</td>
              <td>System</td>
              <td>Auto Assignment</td>
              <td>Multiple samples</td>
              <td>5 routine cases auto-assigned to review queue</td>
              <td>System</td>
              <td><span className="status-info">Info</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="audit-summary">
        <h3>Today's Activity Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span>Reviews Completed:</span>
            <span>28</span>
          </div>
          <div className="summary-item">
            <span>Critical Values:</span>
            <span>3</span>
          </div>
          <div className="summary-item">
            <span>Modifications:</span>
            <span>5</span>
          </div>
          <div className="summary-item">
            <span>System Actions:</span>
            <span>47</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="btn-edit">✏️ Edit Profile</button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'P'}</span>
          </div>
          <div className="profile-details">
            <h3>Dr. {user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}</h3>
            <p>{user?.role?.toUpperCase()}</p>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span>Cases Reviewed Today:</span>
            <span>28</span>
          </div>
          <div className="stat-item">
            <span>Critical Values Handled:</span>
            <span>3</span>
          </div>
          <div className="stat-item">
            <span>Average Review Time:</span>
            <span>12 minutes</span>
          </div>
          <div className="stat-item">
            <span>Active Since:</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="specializations">
          <h3>Specializations</h3>
          <div className="specialization-tags">
            <span className="tag">Clinical Pathology</span>
            <span className="tag">Hematology</span>
            <span className="tag">Clinical Chemistry</span>
            <span className="tag">Molecular Diagnostics</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pathologist-dashboard-container">
      {/* Sidebar */}
      <div className="pathologist-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">MDLAB DIRECT</h2>
          <div className="sidebar-subtitle">Pathologist Portal</div>
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
            <div className="nav-item-header" onClick={toggleReview}>
              <div className="nav-item-main">
                <span className="nav-icon">📋</span>
                <span className="nav-text">Case Review</span>
              </div>
              <span className={`dropdown-arrow ${reviewOpen ? 'open' : ''}`}>▼</span>
            </div>
            {reviewOpen && (
              <div className="nav-submenu">
                <div 
                  className={`nav-subitem ${activeSection === 'review-queue' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('review-queue')}
                >
                  Review Queue
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'case-review' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('case-review')}
                >
                  Active Case
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'critical-values' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('critical-values')}
                >
                  Critical Values
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'result-approval' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('result-approval')}
                >
                  Result Approval
                </div>
              </div>
            )}
          </div>

          <div 
            className={`nav-item ${activeSection === 'interpretations' ? 'active' : ''}`}
            onClick={() => handleSectionClick('interpretations')}
          >
            <span className="nav-icon">🩺</span>
            <span className="nav-text">Interpretations</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'trending' ? 'active' : ''}`}
            onClick={() => handleSectionClick('trending')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Patient Trending</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'audit-trail' ? 'active' : ''}`}
            onClick={() => handleSectionClick('audit-trail')}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Audit Trail</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'quality-assurance' ? 'active' : ''}`}
            onClick={() => handleSectionClick('quality-assurance')}
          >
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Quality Assurance</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'consultations' ? 'active' : ''}`}
            onClick={() => handleSectionClick('consultations')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Consultations</span>
          </div>

          <div className="dropdown">
            <div className="nav-item-header" onClick={toggleReports}>
              <div className="nav-item-main">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Reports & Research</span>
              </div>
              <span className={`dropdown-arrow ${reportsOpen ? 'open' : ''}`}>▼</span>
            </div>
            {reportsOpen && (
              <div className="nav-submenu">
                <div 
                  className={`nav-subitem ${activeSection === 'teaching-cases' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('teaching-cases')}
                >
                  Teaching Cases
                </div>
                <div 
                  className={`nav-subitem ${activeSection === 'research' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('research')}
                >
                  Research
                </div>
              </div>
            )}
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
              <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'P'}</span>
            </div>
            <div className="user-details">
              <span className="user-role">{user?.role?.toUpperCase() || 'PATHOLOGIST'}</span>
              <span className="user-email">{user?.email || 'pathologist@example.com'}</span>
              <span className="user-name">Dr. {user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pathologist-main">
        <div className="pathologist-header">
          <h1 className="page-title">{renderPageTitle()}</h1>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="critical-alerts-count">🚨 3</div>
            <div className="time-display">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="pathologist-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default PathologistDashboard;
