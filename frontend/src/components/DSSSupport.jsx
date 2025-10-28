import React from 'react';
import { getSeverityColor, getSeverityIcon } from '../utils/dssHelper';

const DSSSupport = ({ recommendations, onClose }) => {
  const hasCritical = recommendations.critical && recommendations.critical.length > 0;
  const hasHigh = recommendations.high && recommendations.high.length > 0;
  const hasLow = recommendations.low && recommendations.low.length > 0;
  const hasNormal = recommendations.normal && recommendations.normal.length > 0;

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
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
            🧠 Clinical Decision Support
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 10px'
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
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#856404'
          }}>
            <strong>⚠️ Disclaimer:</strong> These are automated recommendations based on test values. 
            Final clinical decisions should be made by qualified medical professionals.
          </div>

          {/* Critical Alerts */}
          {hasCritical && (
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
                {getSeverityIcon('critical')} CRITICAL ALERTS
              </h3>
              {recommendations.critical.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderLeft: `4px solid ${getSeverityColor('critical')}`,
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#721c24' }}>
                    {rec.test}: {rec.value} (Normal: {rec.range})
                  </div>
                  <div style={{ fontSize: '14px', color: '#721c24' }}>
                    {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* High Values */}
          {hasHigh && (
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
              {recommendations.high.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderLeft: `4px solid ${getSeverityColor('high')}`,
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#856404' }}>
                    {rec.test}: {rec.value} (Normal: {rec.range})
                  </div>
                  <div style={{ fontSize: '14px', color: '#856404' }}>
                    {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low Values */}
          {hasLow && (
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
                {getSeverityIcon('low')} BELOW NORMAL
              </h3>
              {recommendations.low.map((rec, index) => (
                <div key={index} style={{
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderLeft: `4px solid ${getSeverityColor('low')}`,
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0c5460' }}>
                    {rec.test}: {rec.value} (Normal: {rec.range})
                  </div>
                  <div style={{ fontSize: '14px', color: '#0c5460' }}>
                    {rec.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Normal Status */}
          {hasNormal && (
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
                borderLeft: `4px solid ${getSeverityColor('normal')}`,
                borderRadius: '4px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '14px', color: '#155724' }}>
                  {recommendations.normal[0].message}
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
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#21AEA8',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSSSupport;
