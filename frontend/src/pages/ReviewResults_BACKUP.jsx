import React, { useState, useEffect } from 'react';
import { testResultsAPI, appointmentAPI } from '../services/api';
import '../design/Dashboard.css';

function ReviewResults({ currentUser }) {
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testData, setTestData] = useState({});
  const [appointmentServices, setAppointmentServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('completed');

  // Complete field definitions based on the Enter Results form
  const testFieldDefinitions = {
    // Hematology/CBC Tests
    hematology: {
      title: 'HEMATOLOGY',
      fields: [
        { key: 'hemoglobin', label: 'Hemoglobin', normalRange: '110-160 g/L', group: 'basic' },
        { key: 'hematocrit', label: 'Hematocrit', normalRange: '37-54%', group: 'basic' },
        { key: 'rbc', label: 'RBC', normalRange: '3.50-5.50 x10¹²/L', group: 'basic' },
        { key: 'platelets', label: 'Platelet count', normalRange: '150-450 x10⁹/L', group: 'basic' },
        { key: 'wbc', label: 'WBC', normalRange: '4.0-10.0 x10⁹/L', group: 'basic' },
        { key: 'mcv', label: 'MCV', normalRange: '80-100 fL', group: 'indices' },
        { key: 'mch', label: 'MCH', normalRange: '27.0-34.0 pg', group: 'indices' },
        { key: 'mchc', label: 'MCHC', normalRange: '320-360 g/L', group: 'indices' },
        { key: 'neutrophils', label: 'Segmenters', normalRange: '2.0-7.0 x10⁹/L', group: 'differential' },
        { key: 'lymphocytes', label: 'Lymphocytes', normalRange: '0.8-4.0 x10⁹/L', group: 'differential' },
        { key: 'monocytes', label: 'Monocytes', normalRange: '0.1-1.5 x10⁹/L', group: 'differential' },
        { key: 'eosinophils', label: 'Eosinophils', normalRange: '0.0-0.4 x10⁹/L', group: 'differential' },
        { key: 'basophils', label: 'Basophils', normalRange: '0.0-0.1 x10⁹/L', group: 'differential' },
        { key: 'esr', label: 'ESR', normalRange: '<20 mm/hr', group: 'other' }
      ]
    },
    // Clinical Chemistry Tests  
    chemistry: {
      title: 'BLOOD CHEMISTRY/IMMUNOLOGY',
      fields: [
        { key: 'fbs', label: 'Glucose', normalRange: '3.89-5.83 mmol/L', group: 'glucose' },
        { key: 'cholesterol', label: 'Cholesterol', normalRange: '3.5-5.2 mmol/L', group: 'lipids' },
        { key: 'triglyceride', label: 'Triglyceride', normalRange: '<2.26 mmol/L', group: 'lipids' },
        { key: 'hdl', label: 'HDL-Chole', normalRange: '>1.05 mmol/L', group: 'lipids' },
        { key: 'ldl', label: 'LDL-Chole', normalRange: '<2.9 mmol/L', group: 'lipids' },
        { key: 'bua', label: 'Uric acid', normalRange: '156-360 umol/L', group: 'kidney' },
        { key: 'bun', label: 'BUN', normalRange: '1.7-8.3 mmol/L', group: 'kidney' },
        { key: 'creatinine', label: 'Creatinine', normalRange: '53-97 umol/L', group: 'kidney' },
        { key: 'ast_sgot', label: 'AST/SGOT', normalRange: '<31 U/L', group: 'liver' },
        { key: 'alt_sgpt', label: 'ALT/SGPT', normalRange: '<34 U/L', group: 'liver' },
        { key: 'sodium', label: 'Sodium', normalRange: '136-150 mmol/L', group: 'electrolytes' },
        { key: 'potassium', label: 'Potassium', normalRange: '3.5-5.0 mmol/L', group: 'electrolytes' },
        { key: 'chloride', label: 'Chloride', normalRange: '94-110 mmol/L', group: 'electrolytes' },
        { key: 'tsh', label: 'TSH', normalRange: '0.3-4.2 mIU/L', group: 'thyroid' }
      ]
    },
    // Urinalysis Tests
    urinalysis: {
      title: 'URINALYSIS',
      fields: [
        { key: 'urine_color', label: 'Color', normalRange: 'Yellow', group: 'physical' },
        { key: 'urine_transparency', label: 'Transparency', normalRange: 'Clear', group: 'physical' },
        { key: 'urine_ph', label: 'pH', normalRange: '4.6-8.0', group: 'chemical' },
        { key: 'urine_specific_gravity', label: 'Specific Gravity', normalRange: '1.003-1.030', group: 'physical' },
        { key: 'urine_glucose', label: 'Glucose', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_protein', label: 'Protein', normalRange: 'Negative', group: 'chemical' },
        { key: 'urobilinogen', label: 'Urobilinogen', normalRange: 'Normal', group: 'chemical' },
        { key: 'urine_ketones', label: 'Ketone', normalRange: 'Negative', group: 'chemical' },
        { key: 'bilirubin', label: 'Bilirubin', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_wbc', label: 'WBC', normalRange: '15-20/hpf', group: 'microscopic' },
        { key: 'urine_rbc', label: 'RBC', normalRange: '1-2/hpf', group: 'microscopic' },
        { key: 'urine_leukocytes', label: 'Leukocyte', normalRange: 'Small', group: 'microscopic' },
        { key: 'urine_nitrites', label: 'Nitrite', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_blood', label: 'Blood', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_epithelial', label: 'Epithelial Cell', normalRange: '***', group: 'microscopic' },
        { key: 'mucus_thread', label: 'Mucus Thread', normalRange: '***', group: 'microscopic' },
        { key: 'amorphous_urates', label: 'Amorphous urates', normalRange: '++', group: 'microscopic' },
        { key: 'urine_bacteria', label: 'Bacteria', normalRange: '***', group: 'microscopic' }
      ]
    }
  };

  // Helper function to get test result value with service field mapping
  // Helper function to get test result value from MongoDB data
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

  // Get all test results organized by category
  const getOrganizedTestResults = (modalTestData) => {
    if (!modalTestData?.results) return {};
    
    const results = {};
    
    // Organize by test category
    Object.entries(testFieldDefinitions).forEach(([category, config]) => {
      const categoryResults = {};
      let hasData = false;
      
      config.fields.forEach(field => {
        const value = getTestFieldValue(field.key, modalTestData.results);
        if (value !== null && value !== undefined && value !== '') {
          categoryResults[field.key] = {
            value: value,
            label: field.label,
            normalRange: field.normalRange,
            group: field.group
          };
          hasData = true;
        }
      });
      
      // Only include categories that have actual data
      if (hasData) {
        results[category] = {
          title: config.title,
          fields: categoryResults
        };
      }
    });
    
    return results;
  };

  const getTestResultValue = (testName, modalTestData) => {
    if (!modalTestData || !testName) return 'Pending';

    // Map service names to database fields
    const serviceToFieldMap = {
      'FBS/RBS': 'fbs',
      'Total Cholesterol': 'cholesterol',
      'Triglycerides': 'triglyceride',
      'HDL Cholesterol': 'hdl',
      'LDL Cholesterol': 'ldl',
      'Uric Acid': 'bua',
      'Creatinine': 'creatinine',
      'BUN (Blood Urea Nitrogen)': 'bun',
      'ALT / SGPT': 'alt_sgpt',
      'AST / SGOT': 'ast_sgot',
      // Hematology Tests
      'Hemoglobin': 'hemoglobin',
      'Hematocrit': 'hematocrit',
      'RBC Count': 'rbc',
      'WBC Count': 'wbc',
      'Platelet Count': 'platelets',
      'ESR (Erythrocyte Sedimentation Rate)': 'esr',
      'Blood Typing (ABO Rh)': 'blood_type',
      'Segmenters': 'neutrophils',
      'Lymphocytes': 'lymphocytes',
      'Monocytes': 'monocytes',
      'Eosinophils': 'eosinophils',
      'Basophils': 'basophils',
      'MCV': 'mcv',
      'MCH': 'mch',
      'MCHC': 'mchc',
      // Electrolytes
      'Sodium': 'sodium',
      'Potassium': 'potassium',
      'Chloride': 'chloride',
      'Magnesium': 'magnesium',
      'Phosphorus': 'phosphorus',
      // Urinalysis Tests
      'Color': 'urine_color',
      'Clarity': 'urine_transparency',
      'Specific Gravity': 'urine_specific_gravity',
      'pH': 'urine_ph',
      'Protein': 'urine_protein',
      'Glucose': 'urine_glucose',
      'Ketones': 'urine_ketones',
      'Blood': 'urine_blood',
      'Leukocytes': 'urine_leukocytes',
      'Nitrites': 'urine_nitrites',
      'Urobilinogen': 'urobilinogen',
      'Bilirubin': 'bilirubin',
      'RBC (Urine)': 'urine_rbc',
      'WBC (Urine)': 'urine_wbc',
      'Epithelial Cells': 'urine_epithelial',
      'Bacteria': 'urine_bacteria',
      'Crystals': 'urine_crystals',
      'Casts': 'urine_casts',
      'Mucus Threads': 'mucus_thread',
      'Amorphous Urates': 'amorphous_urates',
      // Fecalysis Tests
      'Fecal Color': 'fecal_color',
      'Fecal Consistency': 'fecal_consistency',
      'FOBT (Fecal Occult Blood Test)': 'fecal_occult_blood',
      'Fecal RBC': 'fecal_rbc',
      'Fecal WBC': 'fecal_wbc',
      'Fecal Bacteria': 'fecal_bacteria',
      'Parasite/Ova': 'fecal_parasite_ova',
      // Pregnancy Tests
      'Serum Pregnancy Test': 'pregnancy_test',
      'Pregnancy Test (Urine)': 'pregnancy_test',
      // Serology/Immunology Tests
      'Hepatitis B Antigen (HbsAg)': 'hepatitis_b',
      'Hepatitis C': 'hepatitis_c',
      'HIV Screening': 'hiv',
      'VDRL (Syphilis)': 'vdrl',
      'Dengue Duo (NS1 IgG/IgM)': 'dengue_duo',
      'Dengue NS1': 'dengue_duo',
      'Salmonella Test (Typhoid IgG/IgM)': 'salmonella',
      // Thyroid Tests
      'TSH (Thyroid Stimulating Hormone)': 'tsh',
      'FT3 (Free Triiodothyronine)': 'ft3',
      'FT4 (Free Thyroxine)': 'ft4',
      'T3 (Total Triiodothyronine)': 't3',
      'T4 (Total Thyroxine)': 't4',
      // Additional Tests (often missing)
      'OGTT (Oral Glucose Tolerance Test)': 'fbs', // Often uses same field as FBS
      'HBA1c (Glycosylated Hemoglobin)': 'hba1c',
      'Rapid Antigen Test (COVID-19)': 'covid_antigen',
      'PSA (Prostate Specific Antigen)': 'psa',
      'H. Pylori Antibody / Antigen': 'h_pylori'
    };

    const fieldKey = serviceToFieldMap[testName];
    if (fieldKey) {
      const value = getTestFieldValue(fieldKey, modalTestData.results);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }

    return 'Pending';
  };

  // Group services by category
      'triglyceride': '<150 mg/dL',
      'hdl': '>40 mg/dL (M), >50 mg/dL (F)',
      'ldl': '<100 mg/dL',
      'bua': '3.5-7.2 mg/dL',
      'creatinine': '0.6-1.3 mg/dL',
      'bun': '8-20 mg/dL',
      'alt_sgpt': '<40 U/L',
      'ast_sgot': '<40 U/L',
      'hemoglobin': '12-16 g/dL (F), 14-18 g/dL (M)',
      'hematocrit': '36-46% (F), 41-53% (M)',
      'rbc': '4.0-5.2 million/μL (F), 4.5-5.9 million/μL (M)',
      'wbc': '4,500-11,000/μL',
      'platelets': '150,000-450,000/μL',
      'esr': '<20 mm/hr (F), <15 mm/hr (M)',
      'sodium': '136-145 mEq/L',
      'potassium': '3.5-5.0 mEq/L',
      'chloride': '98-107 mEq/L',
      'tsh': '0.4-4.0 mIU/L',
      'ft3': '2.3-4.2 pg/mL',
      'ft4': '0.8-1.8 ng/dL',
      'pregnancy_test': 'Negative',
      'hepatitis_b': 'Non-Reactive',
      'hiv': 'Non-Reactive',
      'vdrl': 'Non-Reactive',
      'dengue_duo': 'Non-Reactive',
      'salmonella': 'Non-Reactive',
      'fecal_occult_blood': 'Negative',
      'urine_protein': 'Negative',
      'urine_glucose': 'Negative',
      'urine_blood': 'Negative'
    };

    // Check for direct mapping first
    const mappedField = serviceFieldMapping[testName];
    
    if (mappedField && modalTestData.results) {
      let value;
      
      // Handle regular objects first (most common case from API)
      if (typeof modalTestData.results === 'object' && !(modalTestData.results instanceof Map)) {
        value = modalTestData.results[mappedField];
        console.log(`OBJECT ACCESS: Using ["${mappedField}"] = "${value}"`);
      } else if (modalTestData.results instanceof Map) {
        // Handle Map objects (less common, direct DB access)
        value = modalTestData.results.get(mappedField);
        console.log(`�️ MAP ACCESS: Using .get("${mappedField}") = "${value}"`);
      }
      
      if (value !== undefined && value !== null) {
        console.log(`🚀 SUCCESS: Found "${mappedField}" = "${value}"`);
        return value;
      }
    }
    
    // Fallback: try direct field lookup
    if (modalTestData.results) {
      let directValue;
      
      if (typeof modalTestData.results === 'object' && !(modalTestData.results instanceof Map)) {
        directValue = modalTestData.results[testName];
        console.log(`📦 DIRECT OBJECT: Using ["${testName}"] = "${directValue}"`);
      } else if (modalTestData.results instanceof Map) {
        directValue = modalTestData.results.get(testName);
        console.log(`�️ DIRECT MAP: Using .get("${testName}") = "${directValue}"`);
      }
      
      if (directValue !== undefined && directValue !== null) {
        console.log(`🚀 DIRECT: Found "${testName}" = "${directValue}"`);
        return directValue;
      }
    }
    
    // Debug: Show all available database fields for unmapped services
    if (!mappedField) {
      let availableFields = [];
      if (typeof modalTestData.results === 'object' && !(modalTestData.results instanceof Map)) {
        availableFields = Object.keys(modalTestData.results);
      } else if (modalTestData.results instanceof Map) {
        availableFields = Array.from(modalTestData.results.keys());
      }
      console.log(`🔍 DEBUG: Available database fields:`, availableFields);
      console.log(`🔍 DEBUG: Service "${testName}" needs mapping or doesn't exist in database`);
    }
    
    // Package test component mappings
    const packageTestComponents = {
      'Chem 10': ['FBS/RBS', 'BUN (Blood Urea Nitrogen)', 'Creatinine', 'Uric Acid', 'Total Cholesterol', 'Triglycerides', 'HDL Cholesterol', 'LDL Cholesterol', 'ALT / SGPT', 'AST / SGOT'],
      'Lipid Profile (TC, Trig, HDL, LDL)': ['Total Cholesterol', 'Triglycerides', 'HDL Cholesterol', 'LDL Cholesterol'],
      'Electrolytes (Na, K, Cl, tCa, TCo)': ['Sodium', 'Potassium', 'Chloride'],
      'Complete Blood Count (CBC)': ['Hemoglobin', 'Hematocrit', 'RBC Count', 'WBC Count', 'Platelet Count'],
      'Urinalysis (10 parameter)': ['Color', 'Clarity', 'Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Blood', 'Leukocytes', 'Nitrites'],
      'Fecalysis': ['Fecal Color', 'Fecal Consistency', 'FOBT (Fecal Occult Blood Test)', 'Parasite/Ova']
    };

    // If it's a package test, return components summary
    if (packageTestComponents[testName]) {
      const components = packageTestComponents[testName];
      const availableValues = components.map(component => {
        const mappedField = serviceFieldMapping[component];
        if (mappedField && modalTestData.results) {
          let value;
          if (typeof modalTestData.results === 'object' && !(modalTestData.results instanceof Map)) {
            value = modalTestData.results[mappedField];
          } else if (modalTestData.results instanceof Map) {
            value = modalTestData.results.get(mappedField);
          }
          return value !== undefined && value !== null ? `${component}: ${value}` : null;
        }
        return null;
      }).filter(Boolean);
      
      if (availableValues.length > 0) {
        return `See individual components (${availableValues.length}/${components.length} available)`;
      } else {
        console.log(`📦 PACKAGE: "${testName}" is a package test - components handled individually`);
        return 'Package Test';
      }
    }
    
    const fieldKey = serviceToFieldMap[testName];
    if (fieldKey) {
      const value = getTestFieldValue(fieldKey, modalTestData.results);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }

    return 'Pending';
  };

  // Group services by category
  const groupServicesByCategory = (services) => {
    const grouped = {};
    
    services.forEach(service => {
      const category = service.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    
    return grouped;
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'clinical_chemistry': 'BLOOD CHEMISTRY/IMMUNOLOGY',
      'hematology': 'HEMATOLOGY',
      'clinical_microscopy': 'CLINICAL MICROSCOPY',
      'serology_immunology': 'SEROLOGY/IMMUNOLOGY',
      'serology': 'SEROLOGY/IMMUNOLOGY',
      'urine_tests': 'URINALYSIS',
      'general': 'GENERAL TESTS'
    };
    
    return categoryMap[category] || category.toUpperCase().replace(/_/g, ' ');
  };

  // Get normal range for a test
  const getNormalRange = (serviceName) => {
    // Create a simple mapping for common tests to avoid complex dependencies
    const ranges = {
      // Clinical Chemistry
      'FBS/RBS': '70-110 mg/dL',
      'Total Cholesterol': '<200 mg/dL',
      'Triglycerides': '<150 mg/dL',
      'HDL Cholesterol': '>40 mg/dL (M), >50 mg/dL (F)',
      'LDL Cholesterol': '<100 mg/dL',
      'Uric Acid': '3.5-7.2 mg/dL',
      'Creatinine': '0.6-1.3 mg/dL',
      'BUN (Blood Urea Nitrogen)': '8-20 mg/dL',
      'ALT / SGPT': '<40 U/L',
      'AST / SGOT': '<40 U/L',
      'Serum Pregnancy Test': 'Negative',
      'OGTT (Oral Glucose Tolerance Test)': '70-140 mg/dL',
      'HBA1c (Glycosylated Hemoglobin)': '<7%',
      
      // Hematology
      'Hemoglobin': '12-16 g/dL (F), 14-18 g/dL (M)',
      'Hematocrit': '36-46% (F), 41-53% (M)',
      'RBC Count': '4.0-5.2 million/μL (F), 4.5-5.9 million/μL (M)',
      'WBC Count': '4,500-11,000/μL',
      'Platelet Count': '150,000-450,000/μL',
      'ESR (Erythrocyte Sedimentation Rate)': '<20 mm/hr (F), <15 mm/hr (M)',
      'Blood Typing (ABO Rh)': 'A/B/AB/O, Rh+/-',
      
      // Electrolytes
      'Sodium': '136-145 mEq/L',
      'Potassium': '3.5-5.0 mEq/L',
      'Chloride': '98-107 mEq/L',
      
      // Serology
      'Hepatitis B Antigen (HbsAg)': 'Non-Reactive',
      'HIV Screening': 'Non-Reactive',
      'VDRL (Syphilis)': 'Non-Reactive',
      'Dengue Duo (NS1 IgG/IgM)': 'Non-Reactive',
      'Dengue NS1': 'Non-Reactive',
      'Salmonella Test (Typhoid IgG/IgM)': 'Non-Reactive',
      'Rapid Antigen Test (COVID-19)': 'Non-Reactive',
      'PSA (Prostate Specific Antigen)': '<4.0 ng/mL',
      'H. Pylori Antibody / Antigen': 'Non-Reactive',
      
      // Thyroid
      'TSH (Thyroid Stimulating Hormone)': '0.4-4.0 mIU/L',
      'FT3 (Free Triiodothyronine)': '2.3-4.2 pg/mL',
      'FT4 (Free Thyroxine)': '0.8-1.8 ng/dL',
      'T3 (Total Triiodothyronine)': '80-200 ng/dL',
      'T4 (Total Thyroxine)': '5.1-14.1 μg/dL',
      
      // Urinalysis
      'Color': 'Yellow',
      'Clarity': 'Clear',
      'Specific Gravity': '1.003-1.030',
      'pH': '4.6-8.0',
      'Protein': 'Negative',
      'Glucose': 'Negative',
      'Ketones': 'Negative',
      'Blood': 'Negative',
      'Leukocytes': 'Negative',
      'Nitrites': 'Negative',
      'Pregnancy Test (Urine)': 'Negative',
      
      // Fecalysis
      'FOBT (Fecal Occult Blood Test)': 'Negative',
      'Fecal Color': 'Brown',
      'Fecal Consistency': 'Formed'
    };
    
    // For package tests that don't have direct mapping
    if (serviceName.includes('Package Test') || serviceName.includes('CBC') || serviceName.includes('Urinalysis') || 
        serviceName.includes('Chem 10') || serviceName.includes('Lipid Profile') || serviceName.includes('Electrolytes') ||
        serviceName.includes('Fecalysis')) {
      return 'See components';
    }
    
    return ranges[serviceName] || '-';
  };

  // Fetch completed test results ready for review
  const fetchCompletedTests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await testResultsAPI.getTestResults({
        status: filterStatus,
        limit: 50,
        sortBy: 'completedDate',
        sortOrder: 'desc'
      });

      if (response.success) {
        const testResults = response.data || [];
        setCompletedTests(testResults);
      } else {
        throw new Error(response.message || 'Failed to fetch completed tests');
      }
    } catch (error) {
      setError('Failed to load completed tests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing test details
  const handleViewResults = async (testResult) => {
    setSelectedTestResult(testResult);
    setShowDetailModal(true);
    
    try {
      const appointmentId = testResult.appointmentId || 
                           testResult.appointment?._id || 
                           testResult.appointment?.appointmentId;
      
      if (!appointmentId) {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const apiUrl = `http://localhost:5000/api/test-results/appointment/${appointmentId}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API RESPONSE DEBUG:', data);
        const testData = data.testResults || testResult;
        const serviceData = data.services || [];
        
        console.log('🔍 TEST DATA DEBUG:', testData);
        console.log('🔍 TEST DATA RESULTS:', testData.results);
        console.log('🔍 SERVICE DATA DEBUG:', serviceData);
        
        setTestData(testData);
        setAppointmentServices(serviceData);
      } else {
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
      }
    } catch (error) {
      setTestData(testResult);
      const appointmentServices = testResult.appointment?.services || [];
      setAppointmentServices(appointmentServices);
    }
  };

  useEffect(() => {
    fetchCompletedTests();
  }, [filterStatus]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalTestData = testData || selectedTestResult;

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="content-area" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: '#21AEA8', 
          borderBottom: '2px solid #21AEA8', 
          paddingBottom: '10px',
          marginBottom: '30px'
        }}>
          📋 Review Test Results
        </h2>

        {/* Filter Controls */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="completed">Completed Tests</option>
              <option value="approved">Approved Tests</option>
              <option value="rejected">Rejected Tests</option>
              <option value="pending">Pending Tests</option>
            </select>
            
            <button 
              onClick={fetchCompletedTests}
              style={{
                padding: '8px 16px',
                backgroundColor: '#21AEA8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            color: '#d73527', 
            backgroundColor: '#fef2f2', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div>Loading test results...</div>
          </div>
        )}

        {/* Test Results List */}
        {!loading && completedTests.length === 0 && (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '8px', 
            textAlign: 'center',
            color: '#666',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            No {filterStatus} test results found.
          </div>
        )}

        {!loading && completedTests.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#21AEA8', color: 'white' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Patient</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Test Type</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedTests.map((testResult, index) => (
                  <tr key={testResult._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {testResult.isWalkInPatient 
                          ? testResult.patientInfo?.name || testResult.appointment?.patientName || 'Walk-in Patient'
                          : testResult.patient?.firstName 
                            ? `${testResult.patient.firstName} ${testResult.patient.lastName}`
                            : testResult.appointment?.patientName || 'Unknown Patient'
                        }
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {testResult.appointment?.appointmentId || testResult.sampleId}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {testResult.testType || 'Multiple Tests'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: testResult.status === 'completed' ? '#e7f3ff' : testResult.status === 'approved' ? '#e6f7e6' : '#fff3cd',
                        color: testResult.status === 'completed' ? '#0066cc' : testResult.status === 'approved' ? '#28a745' : '#856404'
                      }}>
                        {testResult.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px' }}>
                      {formatDate(testResult.completedDate || testResult.sampleDate)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewResults(testResult)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#21AEA8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📋 View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && modalTestData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTestResult(null);
                  setTestData({});
                  setAppointmentServices([]);
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  zIndex: 1001
                }}
              >
                ×
              </button>

              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #21AEA8 0%, #17a2b8 100%)',
                color: 'white',
                padding: '25px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>MDLAB Diagnostic Laboratory</div>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
                    DOH License: 02-93-26-CL-2
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Contact: 0927 850 7775 / 0915 951 1516
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Email: mdlab.diagnostics@yahoo.com.ph
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Laboratory Report</div>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>
                    Date Released: {formatDate(modalTestData.completedDate || modalTestData.sampleDate)}
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div style={{
                padding: '20px 25px',
                borderBottom: '2px solid #21AEA8',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>Name:</strong> {(modalTestData.isWalkInPatient 
                      ? modalTestData.patientInfo?.name || modalTestData.appointment?.patientName
                      : modalTestData.patient?.firstName 
                        ? `${modalTestData.patient.firstName} ${modalTestData.patient.lastName}`
                        : modalTestData.appointment?.patientName || 'Unknown Patient').toUpperCase()}
                  </div>
                  <div>
                    <strong>Age:</strong> {modalTestData.patientInfo?.age || modalTestData.patient?.age || modalTestData.appointment?.age || 'N/A'}
                  </div>
                  <div>
                    <strong>Sex:</strong> {modalTestData.patientInfo?.gender || modalTestData.patient?.gender || modalTestData.appointment?.sex || 'N/A'}
                  </div>
                  <div>
                    <strong>Contact:</strong> {modalTestData.patientInfo?.contactNumber || modalTestData.patient?.phone || modalTestData.appointment?.contactNumber || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {modalTestData.patientInfo?.email || modalTestData.patient?.email || modalTestData.appointment?.email || 'N/A'}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Address:</strong> {modalTestData.patientInfo?.address || modalTestData.patient?.address || modalTestData.appointment?.address || 'N/A'}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(modalTestData.sampleDate)}
                  </div>
                  <div>
                    <strong>Lab. Number:</strong> {modalTestData.sampleId || 'N/A'}
                  </div>
                  <div>
                    <strong>Source:</strong> {modalTestData.appointment ? 'APPOINTMENT' : 'WALK-IN'}
                  </div>
                </div>
              </div>

              {/* Test Results Content - Dynamic Rendering */}
              <div style={{ padding: '25px' }}>
                {(() => {
                  console.log('🔄 DYNAMIC RENDERING: Starting dynamic test results rendering');
                  console.log('🔄 DYNAMIC RENDERING: appointmentServices:', appointmentServices);
                  console.log('🔄 DYNAMIC RENDERING: modalTestData:', modalTestData);
                  
                  // Use appointmentServices if available, otherwise extract from modalTestData
                  const servicesToRender = appointmentServices && appointmentServices.length > 0 
                    ? appointmentServices 
                    : modalTestData?.appointment?.services || [];
                    
                  console.log('🔄 DYNAMIC RENDERING: servicesToRender:', servicesToRender);
                  
                  if (!servicesToRender || servicesToRender.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No test services found for this appointment.</p>
                      </div>
                    );
                  }
                  
                  // Group services by category
                  const groupedServices = groupServicesByCategory(servicesToRender);
                  console.log('🔄 DYNAMIC RENDERING: groupedServices:', groupedServices);
                  
                  return Object.keys(groupedServices).map(category => {
                    const services = groupedServices[category];
                    const displayName = getCategoryDisplayName(category);
                    
                    console.log(`🔄 DYNAMIC RENDERING: Rendering category ${category} with ${services.length} services`);
                    
                    return (
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
                          {displayName}
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
                            {services.map((service, index) => {
                              const testValue = getTestResultValue(service.serviceName, modalTestData);
                              const normalRange = getNormalRange(service.serviceName);
                              
                              console.log(`🔄 DYNAMIC RENDERING: ${service.serviceName} = ${testValue}`);
                              
                              return (
                                <tr key={`${category}-${index}`}>
                                  <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                                    {service.serviceName}
                                  </td>
                                  <td style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '12px', 
                                    textAlign: 'center',
                                    fontWeight: testValue !== 'Pending' ? 'bold' : 'normal',
                                    color: testValue === 'Pending' ? '#999' : '#000'
                                  }}>
                                    {testValue}
                                  </td>
                                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                    {normalRange}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  });
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
                    <div style={{ fontWeight: 'bold' }}>AMABEL A. CALUB,MD,DPSP</div>
                    <div>License# 0109978</div>
                    <div>PATHOLOGIST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewResults;