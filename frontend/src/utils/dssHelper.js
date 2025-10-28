// Simple Decision Support System Helper
// Provides basic clinical recommendations based on test results

/**
 * Analyzes test results and returns recommendation messages
 * @param {Object} results - Test results object with field names and values
 * @param {Object} referenceRanges - Normal ranges for each test
 * @returns {Array} Array of recommendation objects with severity and message
 */
export const analyzeSingleResult = (testName, value, referenceRange) => {
  if (!value || value === '') return null;

  const recommendations = [];
  
  // Convert value to number for numeric tests
  const numValue = parseFloat(value);
  const isNumeric = !isNaN(numValue);

  // Handle numeric results with reference ranges
  if (isNumeric && referenceRange) {
    const [min, max] = referenceRange.split('-').map(v => parseFloat(v.trim()));
    
    if (!isNaN(min) && !isNaN(max)) {
      if (numValue > max * 1.5) {
        // Critical high
        recommendations.push({
          severity: 'critical',
          test: testName,
          value: value,
          range: referenceRange,
          message: `URGENT — ${testName} critically elevated. Immediate physician review required.`
        });
      } else if (numValue > max) {
        // High
        recommendations.push({
          severity: 'high',
          test: testName,
          value: value,
          range: referenceRange,
          message: `${testName} is elevated. Recommend follow-up test and doctor consultation.`
        });
      } else if (numValue < min * 0.5) {
        // Critical low
        recommendations.push({
          severity: 'critical',
          test: testName,
          value: value,
          range: referenceRange,
          message: `URGENT — ${testName} critically low. Immediate physician review required.`
        });
      } else if (numValue < min) {
        // Low
        recommendations.push({
          severity: 'low',
          test: testName,
          value: value,
          range: referenceRange,
          message: `${testName} is below normal. Possible deficiency — further evaluation suggested.`
        });
      }
    }
  }

  // Handle text-based results (Positive/Negative for infections)
  const lowerValue = String(value).toLowerCase();
  
  if (lowerValue.includes('positive') || lowerValue.includes('+')) {
    // Check if it's an infectious disease test
    const infectiousTests = ['hepatitis', 'hiv', 'dengue', 'salmonella', 'vdrl'];
    const isInfectious = infectiousTests.some(test => testName.toLowerCase().includes(test));
    
    if (isInfectious) {
      recommendations.push({
        severity: 'critical',
        test: testName,
        value: value,
        range: 'Negative',
        message: `${testName} is POSITIVE. Immediate clinical review and patient counseling required.`
      });
    }
  }

  return recommendations.length > 0 ? recommendations : null;
};

/**
 * Analyzes all test results and returns grouped recommendations
 * @param {Object} allResults - All test results from the form
 * @returns {Object} Recommendations grouped by severity
 */
export const analyzeTestResults = (allResults) => {
  const recommendations = {
    critical: [],
    high: [],
    low: [],
    normal: []
  };

  // Reference ranges for common tests
  const referenceRanges = {
    // Clinical Chemistry
    fbs: '70-100',
    bua: '3.5-7.2',
    bun: '7-20',
    creatinine: '0.6-1.2',
    cholesterol: '0-200',
    triglyceride: '0-150',
    hdl: '40-60',
    ldl: '0-100',
    ast_sgot: '0-40',
    alt_sgpt: '0-35',
    sodium: '136-145',
    potassium: '3.5-5.0',
    
    // Hematology
    wbc: '4.5-11.0',
    rbc: '4.5-5.5',
    hemoglobin: '12-16',
    hematocrit: '36-46',
    platelets: '150-400',
    
    // Coagulation
    pt: '11-13.5',
    aptt: '25-35',
    inr: '0.8-1.2'
  };

  // Friendly test names
  const testNames = {
    fbs: 'Fasting Blood Sugar',
    bua: 'Blood Uric Acid',
    bun: 'Blood Urea Nitrogen',
    creatinine: 'Creatinine',
    cholesterol: 'Total Cholesterol',
    triglyceride: 'Triglycerides',
    hdl: 'HDL Cholesterol',
    ldl: 'LDL Cholesterol',
    ast_sgot: 'AST (SGOT)',
    alt_sgpt: 'ALT (SGPT)',
    sodium: 'Sodium',
    potassium: 'Potassium',
    wbc: 'White Blood Cells',
    rbc: 'Red Blood Cells',
    hemoglobin: 'Hemoglobin',
    hematocrit: 'Hematocrit',
    platelets: 'Platelets',
    pt: 'Prothrombin Time',
    aptt: 'APTT',
    inr: 'INR',
    hepatitis_b: 'Hepatitis B',
    hepatitis_c: 'Hepatitis C',
    hiv: 'HIV',
    dengue_duo: 'Dengue',
    dengue_ns1: 'Dengue NS1',
    vdrl: 'VDRL (Syphilis)'
  };

  // Analyze each result
  Object.keys(allResults).forEach(key => {
    const value = allResults[key];
    const testName = testNames[key] || key.toUpperCase();
    const referenceRange = referenceRanges[key];

    const result = analyzeSingleResult(testName, value, referenceRange);
    
    if (result) {
      result.forEach(rec => {
        recommendations[rec.severity].push(rec);
      });
    }
  });

  // Add normal message if everything is within range
  if (recommendations.critical.length === 0 && 
      recommendations.high.length === 0 && 
      recommendations.low.length === 0) {
    recommendations.normal.push({
      severity: 'normal',
      message: 'All test results are within normal ranges. No immediate concerns identified.'
    });
  }

  return recommendations;
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
