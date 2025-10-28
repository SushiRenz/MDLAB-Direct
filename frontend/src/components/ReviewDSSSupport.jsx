import React from 'react';
import { getSeverityColor, getSeverityIcon } from '../utils/reviewDSSHelper';

const ReviewDSSSupport = ({ recommendations, onClose }) => {
  // Handle case where recommendations might be undefined or null
  const safeRecommendations = recommendations || [];
  
  // Group recommendations by severity
  const critical = safeRecommendations.filter(r => r.severity === 'critical');
  const high = safeRecommendations.filter(r => r.severity === 'high');
  const low = safeRecommendations.filter(r => r.severity === 'low');
  const normal = safeRecommendations.filter(r => r.severity === 'normal');
  
  // If no recommendations at all, show a message
  const hasNoResults = safeRecommendations.length === 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#21AEA8',
          color: 'white',
          padding: '20px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Clinical Decision Support
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '25px' }}>
          {/* Disclaimer */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#856404'
          }}>
            <strong>⚠️ Disclaimer:</strong> These are automated recommendations based on test values. 
            Final clinical decisions should be made by qualified medical professionals.
          </div>

          {/* No Results Message */}
          {hasNoResults && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>ℹ️ No Test Results Available</div>
              <div style={{ fontSize: '14px' }}>
                No test results were found to analyze. The test may not have been completed yet or results may not be available.
              </div>
            </div>
          )}

          {/* Critical Alerts */}
          {critical.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                color: getSeverityColor('critical'),
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getSeverityIcon('critical')} CRITICAL - URGENT ACTION REQUIRED
              </h3>
              {critical.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderLeft: `5px solid ${getSeverityColor('critical')}`,
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#721c24', fontSize: '15px' }}>
                    {rec.test}
                  </div>
                  <div style={{ fontSize: '13px', color: '#721c24', marginBottom: '5px' }}>
                    <strong>Result:</strong> {rec.value} | <strong>Normal Range:</strong> {rec.normalRange}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#721c24', 
                    fontWeight: 'bold',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f5c6cb',
                    borderRadius: '4px'
                  }}>
                    {getSeverityIcon('critical')} {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* High/Elevated Values */}
          {high.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                color: getSeverityColor('high'),
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getSeverityIcon('high')} ELEVATED VALUES
              </h3>
              {high.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderLeft: `5px solid ${getSeverityColor('high')}`,
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404', fontSize: '15px' }}>
                    {rec.test}
                  </div>
                  <div style={{ fontSize: '13px', color: '#856404', marginBottom: '5px' }}>
                    <strong>Result:</strong> {rec.value} | <strong>Normal Range:</strong> {rec.normalRange}
                  </div>
                  <div style={{ fontSize: '14px', color: '#856404', marginTop: '8px' }}>
                    {getSeverityIcon('high')} {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low/Deficient Values */}
          {low.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                color: getSeverityColor('low'),
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getSeverityIcon('low')} BELOW NORMAL VALUES
              </h3>
              {low.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderLeft: `5px solid ${getSeverityColor('low')}`,
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0c5460', fontSize: '15px' }}>
                    {rec.test}
                  </div>
                  <div style={{ fontSize: '13px', color: '#0c5460', marginBottom: '5px' }}>
                    <strong>Result:</strong> {rec.value} | <strong>Normal Range:</strong> {rec.normalRange}
                  </div>
                  <div style={{ fontSize: '14px', color: '#0c5460', marginTop: '8px' }}>
                    {getSeverityIcon('low')} {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Normal/All Clear */}
          {normal.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                color: getSeverityColor('normal'),
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getSeverityIcon('normal')} ALL CLEAR
              </h3>
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderLeft: `5px solid ${getSeverityColor('normal')}`,
                borderRadius: '6px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '14px', color: '#155724', fontWeight: '500' }}>
                  {getSeverityIcon('normal')} {normal[0].message}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e0e0e0',
          padding: '15px 25px',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#f8f9fa',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#21AEA8',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1a8e8a'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#21AEA8'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDSSSupport;
