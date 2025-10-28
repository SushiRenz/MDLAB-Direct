// Decision Support System Helper for Review Results Page
// Analyzes test results based on displayed values and provides recommendations

/**
 * Analyzes organized test results from Review Results modal
 * @param {Object} organizedResults - Results organized by category (from getOrganizedTestResults)
 * @returns {Array} Array of recommendation objects
 */
export const analyzeReviewResults = (organizedResults) => {
  const recommendations = [];

  if (!organizedResults || Object.keys(organizedResults).length === 0) {
    return recommendations;
  }

  // Iterate through each category
  Object.entries(organizedResults).forEach(([category, categoryData]) => {
    if (!categoryData.fields) return;

    // Analyze each field in the category
    Object.entries(categoryData.fields).forEach(([fieldKey, fieldData]) => {
      const { label, value, normalRange } = fieldData;
      
      if (!value || value === 'Pending') return;

      // Determine status based on value
      const recommendation = determineRecommendation(label, value, normalRange);
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });
  });

  // If all results are normal
  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'normal',
      status: 'Normal',
      test: 'Overall Assessment',
      value: 'All results within normal ranges',
      message: 'All test results are within normal ranges. No immediate concerns identified.'
    });
  }

  return recommendations;
};

/**
 * Determine recommendation based on test result value
 */
const determineRecommendation = (testName, value, normalRange) => {
  const lowerValue = String(value).toLowerCase().trim();
  
  // Check for Positive results (infectious diseases)
  if (lowerValue === 'positive' || lowerValue === 'reactive') {
    return {
      severity: 'critical',
      status: 'Positive',
      test: testName,
      value: value,
      normalRange: normalRange,
      message: 'Immediate clinical review required'
    };
  }

  // Check for High/Elevated results
  if (lowerValue.includes('high') || lowerValue.includes('elevated') || lowerValue.includes('increased')) {
    return {
      severity: 'high',
      status: 'High',
      test: testName,
      value: value,
      normalRange: normalRange,
      message: 'Recommend follow-up test & doctor consultation'
    };
  }

  // Check for Low/Decreased results
  if (lowerValue.includes('low') || lowerValue.includes('decreased') || lowerValue.includes('deficient')) {
    return {
      severity: 'low',
      status: 'Low',
      test: testName,
      value: value,
      normalRange: normalRange,
      message: 'Possible deficiency — further evaluation suggested'
    };
  }

  // Check for Critical values (often marked as such)
  if (lowerValue.includes('critical') || lowerValue.includes('urgent') || lowerValue.includes('severe')) {
    return {
      severity: 'critical',
      status: 'Critical',
      test: testName,
      value: value,
      normalRange: normalRange,
      message: 'URGENT — escalate to physician immediately'
    };
  }

  // Check for numeric values against reference range
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && normalRange && normalRange !== 'See reference') {
    // Extract numeric range from strings like "3.89-5.83 mmol/L" or "<2.26 mmol/L" or ">1.05 mmol/L"
    
    // Handle "less than" ranges like "<2.26 mmol/L"
    if (normalRange.startsWith('<')) {
      const maxValue = parseFloat(normalRange.substring(1).trim());
      if (!isNaN(maxValue) && numValue >= maxValue * 1.5) {
        return {
          severity: 'critical',
          status: 'Critical',
          test: testName,
          value: value,
          normalRange: normalRange,
          message: 'URGENT — escalate to physician immediately'
        };
      } else if (!isNaN(maxValue) && numValue >= maxValue) {
        return {
          severity: 'high',
          status: 'High',
          test: testName,
          value: value,
          normalRange: normalRange,
          message: 'Recommend follow-up test & doctor consultation'
        };
      }
    }
    
    // Handle "greater than" ranges like ">1.05 mmol/L"
    else if (normalRange.startsWith('>')) {
      const minValue = parseFloat(normalRange.substring(1).trim());
      if (!isNaN(minValue) && numValue <= minValue * 0.5) {
        return {
          severity: 'critical',
          status: 'Critical',
          test: testName,
          value: value,
          normalRange: normalRange,
          message: 'URGENT — escalate to physician immediately'
        };
      } else if (!isNaN(minValue) && numValue <= minValue) {
        return {
          severity: 'low',
          status: 'Low',
          test: testName,
          value: value,
          normalRange: normalRange,
          message: 'Possible deficiency — further evaluation suggested'
        };
      }
    }
    
    // Handle normal ranges like "3.89-5.83 mmol/L"
    else if (normalRange.includes('-')) {
      const rangeParts = normalRange.split('-');
      const minValue = parseFloat(rangeParts[0].trim());
      const maxValue = parseFloat(rangeParts[1].trim());
      
      if (!isNaN(minValue) && !isNaN(maxValue)) {
        // Critical high (>1.5x max)
        if (numValue > maxValue * 1.5) {
          return {
            severity: 'critical',
            status: 'Critical',
            test: testName,
            value: value,
            normalRange: normalRange,
            message: 'URGENT — escalate to physician immediately'
          };
        }
        // High (>max)
        else if (numValue > maxValue) {
          return {
            severity: 'high',
            status: 'High',
            test: testName,
            value: value,
            normalRange: normalRange,
            message: 'Recommend follow-up test & doctor consultation'
          };
        }
        // Critical low (<0.5x min)
        else if (numValue < minValue * 0.5) {
          return {
            severity: 'critical',
            status: 'Critical',
            test: testName,
            value: value,
            normalRange: normalRange,
            message: 'URGENT — escalate to physician immediately'
          };
        }
        // Low (<min)
        else if (numValue < minValue) {
          return {
            severity: 'low',
            status: 'Low',
            test: testName,
            value: value,
            normalRange: normalRange,
            message: 'Possible deficiency — further evaluation suggested'
          };
        }
      }
    }
  }

  return null;
};

/**
 * Get severity color for UI display
 */
export const getSeverityColor = (severity) => {
  const colors = {
    critical: '#dc3545',  // Red
    high: '#ffc107',      // Yellow/Orange
    low: '#17a2b8',       // Blue
    normal: '#28a745'     // Green
  };
  return colors[severity] || '#6c757d';
};

/**
 * Get severity icon
 */
export const getSeverityIcon = (severity) => {
  const icons = {
    critical: '🚨',
    high: '⚠️',
    low: '⬇️',
    normal: '✅'
  };
  return icons[severity] || 'ℹ️';
};
