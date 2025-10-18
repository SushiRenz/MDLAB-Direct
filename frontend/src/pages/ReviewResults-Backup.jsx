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

  // Complete field definitions based on MDLAB system arrangement (not appointment system)
  const testFieldDefinitions = {
    // Clinical Chemistry/Immunology - Following MDLAB system arrangement
    chemistry: {
      title: 'CLINICAL CHEMISTRY',
      fields: [
        { key: 'fbs', label: 'Glucose (FBS/RBS)', normalRange: '3.89-5.83 mmol/L', group: 'glucose' },
        { key: 'cholesterol', label: 'Total Cholesterol', normalRange: '3.5-5.2 mmol/L', group: 'lipids' },
        { key: 'triglyceride', label: 'Triglycerides', normalRange: '<2.26 mmol/L', group: 'lipids' },
        { key: 'hdl', label: 'HDL Cholesterol', normalRange: '>1.05 mmol/L', group: 'lipids' },
        { key: 'ldl', label: 'LDL Cholesterol', normalRange: '<2.9 mmol/L', group: 'lipids' },
        { key: 'bua', label: 'Uric Acid', normalRange: '156-360 umol/L', group: 'kidney' },
        { key: 'bun', label: 'BUN (Blood Urea Nitrogen)', normalRange: '1.7-8.3 mmol/L', group: 'kidney' },
        { key: 'creatinine', label: 'Creatinine', normalRange: '53-97 umol/L', group: 'kidney' },
        { key: 'ast_sgot', label: 'AST/SGOT', normalRange: '<31 U/L', group: 'liver' },
        { key: 'alt_sgpt', label: 'ALT/SGPT', normalRange: '<34 U/L', group: 'liver' },
        { key: 'sodium', label: 'Sodium (Na)', normalRange: '136-150 mmol/L', group: 'electrolytes' },
        { key: 'potassium', label: 'Potassium (K)', normalRange: '3.5-5.0 mmol/L', group: 'electrolytes' },
        { key: 'chloride', label: 'Chloride (Cl)', normalRange: '94-110 mmol/L', group: 'electrolytes' },
        { key: 'magnesium', label: 'Magnesium (Mg)', normalRange: '0.70-1.05 mmol/L', group: 'electrolytes' },
        { key: 'phosphorus', label: 'Phosphorus (P)', normalRange: '0.85-1.50 mmol/L', group: 'electrolytes' },
        // OGTT Tests
        { key: 'ogtt_fasting', label: 'OGTT Fasting', normalRange: '70-100 mg/dL', group: 'ogtt' },
        { key: 'ogtt_30min', label: 'OGTT 30 min', normalRange: '<180 mg/dL', group: 'ogtt' },
        { key: 'ogtt_60min', label: 'OGTT 60 min', normalRange: '<180 mg/dL', group: 'ogtt' },
        { key: 'ogtt_90min', label: 'OGTT 90 min', normalRange: '<155 mg/dL', group: 'ogtt' },
        { key: 'ogtt_120min', label: 'OGTT 120 min', normalRange: '<140 mg/dL', group: 'ogtt' }
      ]
    },
    // Serology/Immunology - Following MDLAB system
    immunology: {
      title: 'SEROLOGY/IMMUNOLOGY',
      fields: [
        { key: 'hepatitis_b', label: 'Hepatitis B Antigen (HbsAg)', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'hepatitis_c', label: 'Hepatitis C', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'hiv', label: 'HIV Screening', normalRange: 'Non-Reactive', group: 'serology' },
        { key: 'vdrl', label: 'VDRL (Syphilis)', normalRange: 'Non-Reactive', group: 'serology' },
        // Dengue Duo Components
        { key: 'dengue_ns1', label: 'Dengue NS1 Antigen', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igg', label: 'Dengue IgG Antibody', normalRange: 'Negative', group: 'dengue' },
        { key: 'dengue_igm', label: 'Dengue IgM Antibody', normalRange: 'Negative', group: 'dengue' },
        // Salmonella Components
        { key: 'salmonella_igg', label: 'Salmonella IgG', normalRange: 'Non-Reactive', group: 'salmonella' },
        { key: 'salmonella_igm', label: 'Salmonella IgM', normalRange: 'Non-Reactive', group: 'salmonella' },
        // H. pylori Components
        { key: 'hpylori_antigen', label: 'H. Pylori Antigen', normalRange: 'Negative', group: 'hpylori' },
        { key: 'hpylori_antibody', label: 'H. Pylori Antibody', normalRange: 'Negative', group: 'hpylori' },
        // Tumor Markers & Inflammation
        { key: 'psa', label: 'PSA (Prostate Specific Antigen)', normalRange: '<4.0 ng/mL', group: 'tumor_markers' },
        { key: 'crp', label: 'CRP (C-Reactive Protein)', normalRange: '<3.0 mg/L', group: 'inflammation' }
      ]
    },
    // Hematology - Following MDLAB system (including coagulation studies)
    hematology: {
      title: 'HEMATOLOGY',
      fields: [
        { key: 'hemoglobin', label: 'Hemoglobin', normalRange: '110-160 g/L', group: 'basic' },
        { key: 'hematocrit', label: 'Hematocrit', normalRange: '37-54%', group: 'basic' },
        { key: 'rbc', label: 'RBC Count', normalRange: '3.50-5.50 x10¹²/L', group: 'basic' },
        { key: 'platelets', label: 'Platelet Count', normalRange: '150-450 x10⁹/L', group: 'basic' },
        { key: 'wbc', label: 'WBC Count', normalRange: '4.0-10.0 x10⁹/L', group: 'basic' },
        { key: 'mcv', label: 'MCV', normalRange: '80-100 fL', group: 'indices' },
        { key: 'mch', label: 'MCH', normalRange: '27.0-34.0 pg', group: 'indices' },
        { key: 'mchc', label: 'MCHC', normalRange: '320-360 g/L', group: 'indices' },
        { key: 'neutrophils', label: 'Segmenters (Neutrophils)', normalRange: '2.0-7.0 x10⁹/L', group: 'differential' },
        { key: 'lymphocytes', label: 'Lymphocytes', normalRange: '0.8-4.0 x10⁹/L', group: 'differential' },
        { key: 'monocytes', label: 'Monocytes', normalRange: '0.1-1.5 x10⁹/L', group: 'differential' },
        { key: 'eosinophils', label: 'Eosinophils', normalRange: '0.0-0.4 x10⁹/L', group: 'differential' },
        { key: 'basophils', label: 'Basophils', normalRange: '0.0-0.1 x10⁹/L', group: 'differential' },
        { key: 'esr', label: 'ESR (Erythrocyte Sedimentation Rate)', normalRange: '<20 mm/hr', group: 'other' },
        { key: 'aptt', label: 'APTT (Activated Partial Thromboplastin Time)', normalRange: '25-35 seconds', group: 'coagulation' },
        { key: 'pt', label: 'PT (Prothrombin Time)', normalRange: '11-15 seconds', group: 'coagulation' },
        { key: 'inr', label: 'INR (International Normalized Ratio)', normalRange: '0.8-1.2', group: 'coagulation' }
      ]
    },
    // Clinical Microscopy/Urinalysis - Following MDLAB system
    urinalysis: {
      title: 'CLINICAL MICROSCOPY',
      fields: [
        { key: 'urine_color', label: 'Color', normalRange: 'Yellow', group: 'physical' },
        { key: 'urine_transparency', label: 'Transparency', normalRange: 'Clear', group: 'physical' },
        { key: 'urine_specific_gravity', label: 'Specific Gravity', normalRange: '1.003-1.030', group: 'physical' },
        { key: 'urine_ph', label: 'pH', normalRange: '4.6-8.0', group: 'chemical' },
        { key: 'urine_glucose', label: 'Glucose', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_protein', label: 'Protein', normalRange: 'Negative', group: 'chemical' },
        { key: 'urobilinogen', label: 'Urobilinogen', normalRange: 'Normal', group: 'chemical' },
        { key: 'urine_ketones', label: 'Ketones', normalRange: 'Negative', group: 'chemical' },
        { key: 'bilirubin', label: 'Bilirubin', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_leukocytes', label: 'Leukocytes', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_nitrites', label: 'Nitrites', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_blood', label: 'Blood', normalRange: 'Negative', group: 'chemical' },
        { key: 'urine_wbc', label: 'WBC/hpf', normalRange: '0-5/hpf', group: 'microscopic' },
        { key: 'urine_rbc', label: 'RBC/hpf', normalRange: '0-2/hpf', group: 'microscopic' },
        { key: 'urine_epithelial', label: 'Epithelial Cells', normalRange: 'Few', group: 'microscopic' },
        { key: 'mucus_thread', label: 'Mucus Threads', normalRange: 'Few', group: 'microscopic' },
        { key: 'amorphous_urates', label: 'Amorphous Urates', normalRange: 'Few', group: 'microscopic' },
        { key: 'urine_bacteria', label: 'Bacteria', normalRange: 'Few', group: 'microscopic' },
        { key: 'urine_crystals', label: 'Crystals', normalRange: 'None', group: 'microscopic' },
        { key: 'urine_casts', label: 'Casts', normalRange: 'None', group: 'microscopic' },
        { key: 'urine_others', label: 'Others', normalRange: '-', group: 'microscopic' }
      ]
    },
    // Fecalysis - Following MDLAB system
    fecalysis: {
      title: 'FECALYSIS',
      fields: [
        { key: 'fecal_color', label: 'Color', normalRange: 'Brown', group: 'physical' },
        { key: 'fecal_consistency', label: 'Consistency', normalRange: 'Formed', group: 'physical' },
        { key: 'fecal_occult_blood', label: 'Occult Blood', normalRange: 'Negative', group: 'chemical' },
        { key: 'fecal_rbc', label: 'RBC/hpf', normalRange: '0-2/hpf', group: 'microscopic' },
        { key: 'fecal_wbc', label: 'WBC/hpf', normalRange: '0-5/hpf', group: 'microscopic' },
        { key: 'fecal_bacteria', label: 'Bacteria', normalRange: 'Few', group: 'microscopic' },
        { key: 'fecal_parasite_ova', label: 'Parasite/Ova', normalRange: 'None seen', group: 'microscopic' }
      ]
    },
    // Blood Typing - Following MDLAB system
    blood_typing: {
      title: 'BLOOD TYPING',
      fields: [
        { key: 'blood_type', label: 'ABO Blood Type', normalRange: 'A/B/AB/O', group: 'typing' },
        { key: 'rh_factor', label: 'Rh Factor', normalRange: 'Positive/Negative', group: 'typing' }
      ]
    },
    // Pregnancy Test - Following MDLAB system
    pregnancy_test: {
      title: 'PREGNANCY TEST',
      fields: [
        { key: 'pregnancy_test', label: 'Pregnancy Test (Urine)', normalRange: 'Negative', group: 'pregnancy' },
        { key: 'serum_pregnancy_test', label: 'Serum Pregnancy Test', normalRange: 'Negative', group: 'pregnancy' }
      ]
    },
    // Thyroid Function Tests - Following MDLAB system  
    thyroid: {
      title: 'THYROID FUNCTION TESTS',
      fields: [
        { key: 'tsh', label: 'TSH (Thyroid Stimulating Hormone)', normalRange: '0.3-4.2 mIU/L', group: 'thyroid' },
        { key: 'ft3', label: 'FT3 (Free Triiodothyronine)', normalRange: '2.3-4.2 pg/mL', group: 'thyroid' },
        { key: 'ft4', label: 'FT4 (Free Thyroxine)', normalRange: '0.8-1.8 ng/dL', group: 'thyroid' },
        { key: 't3', label: 'T3 (Total Triiodothyronine)', normalRange: '80-200 ng/dL', group: 'thyroid' },
        { key: 't4', label: 'T4 (Total Thyroxine)', normalRange: '5.1-14.1 μg/dL', group: 'thyroid' }
      ]
    }
  };

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

  // Get service-specific test results (for compatibility with appointment services)
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
      'Sodium': 'sodium',
      'Potassium': 'potassium',
      'Chloride': 'chloride',
      'Color': 'urine_color',
      'Clarity': 'urine_transparency',
      'Specific Gravity': 'urine_specific_gravity',
      'pH': 'urine_ph',
      'Protein': 'urine_protein',
      'Glucose': 'urine_glucose',
      'Ketones': 'urine_ketones',
      'Blood': 'urine_blood',
      'Leukocytes': 'urine_leukocytes',
      'TSH (Thyroid Stimulating Hormone)': 'tsh',
      'Hepatitis B Antigen (HbsAg)': 'hepatitis_b',
      'HIV Screening': 'hiv',
      'VDRL (Syphilis)': 'vdrl'
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
      console.log('🔍 DEBUG: Full testResult object:', testResult);
      
      const appointmentId = testResult.appointmentId || 
                           testResult.appointment?._id || 
                           testResult.appointment?.appointmentId;
      
      console.log('🔍 DEBUG: Extracted appointmentId:', appointmentId);
      console.log('🔍 DEBUG: testResult.appointmentId:', testResult.appointmentId);
      console.log('🔍 DEBUG: testResult.appointment?._id:', testResult.appointment?._id);
      console.log('🔍 DEBUG: testResult.appointment?.appointmentId:', testResult.appointment?.appointmentId);
      
      if (!appointmentId) {
        console.log('⚠️ No appointmentId found, using testResult directly');
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, using testResult directly');
        setTestData(testResult);
        const appointmentServices = testResult.appointment?.services || [];
        setAppointmentServices(appointmentServices);
        return;
      }
      
      const apiUrl = `http://localhost:5000/api/test-results/appointment/${appointmentId}`;
      console.log('🔍 DEBUG: Making API call to:', apiUrl);
      
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
        console.log('⚠️ API call failed with status:', response.status, 'Using testResult directly');
        console.log('🔍 DEBUG: Using testResult directly:', testResult);
        console.log('🔍 DEBUG: testResult.results:', testResult.results);
        
        // Check for non-empty results
        const nonEmptyResults = Object.entries(testResult.results || {}).filter(([key, value]) => value && value.trim() !== '');
        console.log('🔍 DEBUG: Non-empty results count:', nonEmptyResults.length);
        console.log('🔍 DEBUG: Non-empty results details:');
        nonEmptyResults.forEach(([key, value]) => {
          console.log(`  ${key}: "${value}"`);
        });
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

  // Handle test approval
  const handleApproveTest = async (testResult) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/test-results/${testResult._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          approvedBy: currentUser._id,
          approvedDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Test result approved successfully!');
        fetchCompletedTests(); // Refresh the list
      } else {
        const data = await response.json();
        alert('Failed to approve test result: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving test:', error);
      alert('Error approving test result');
    }
  };

  // Handle test rejection
  const handleRejectTest = async (testResult) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/test-results/${testResult._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'pending', // Reset to pending so MedTech can re-enter results
          rejectedBy: currentUser._id,
          rejectedDate: new Date().toISOString(),
          rejectionReason: reason,
          // Clear ALL results data so they need to be re-entered completely
          results: {},
          completedDate: null,
          completedBy: null,
          // Mark as rejected to show rejection info but allow re-entry
          isRejected: true
        })
      });

      console.log('Rejection API response status:', response.status);
      
      if (response.ok) {
        alert(`Test result rejected successfully! Reason: ${reason}\n\nThe test has been sent back to the MedTech for re-entry of results.`);
        fetchCompletedTests(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error('Rejection API error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert('Failed to reject test result: ' + (errorData.message || errorData.error || 'Unknown error'));
        } catch (e) {
          alert('Failed to reject test result: ' + errorText);
        }
      }
    } catch (error) {
      console.error('Error rejecting test:', error);
      alert('Error rejecting test result');
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
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd', minWidth: '250px' }}>Actions</th>
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewResults(testResult)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            minWidth: '70px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleApproveTest(testResult)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            minWidth: '80px'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTest(testResult)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            minWidth: '80px'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal - NEW PROFESSIONAL LAB REPORT FORMAT */}
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

              {/* Professional Lab Report Content - Show ALL Results by Category */}
              <div style={{ padding: '25px' }}>
                {(() => {
                  console.log('🧪 PROFESSIONAL LAB REPORT: Starting rendering with all test results');
                  console.log('🧪 TEST DATA:', modalTestData);
                  
                  // Get organized test results by category
                  const organizedResults = getOrganizedTestResults(modalTestData);
                  console.log('🧪 ORGANIZED RESULTS:', organizedResults);
                  
                  if (Object.keys(organizedResults).length === 0) {
                    // Fallback: Show all non-empty results in a simple format
                    const allResults = modalTestData.results || {};
                    const nonEmptyResults = Object.entries(allResults).filter(([key, value]) => value && value.toString().trim() !== '');
                    
                    if (nonEmptyResults.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                          <p>No test results available for display.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ color: '#2c5282', marginBottom: '20px', borderBottom: '2px solid #2c5282', paddingBottom: '10px' }}>
                          TEST RESULTS
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                          {nonEmptyResults.map(([key, value]) => (
                            <div key={key} style={{ 
                              padding: '10px', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc'
                            }}>
                              <div style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '5px' }}>
                                {key.toUpperCase().replace(/_/g, ' ')}
                              </div>
                              <div style={{ color: '#4a5568', fontSize: '16px' }}>
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Render each category with its test results
                  return (
                    <>
                      {Object.entries(organizedResults).map(([category, categoryData]) => {
                    console.log(`🧪 RENDERING CATEGORY: ${category}`, categoryData);
                    
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
                          {categoryData.title}
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
                            {Object.entries(categoryData.fields).map(([fieldKey, fieldData]) => {
                              console.log(`🧪 RENDERING FIELD: ${fieldKey}`, fieldData);
                              
                              return (
                                <tr key={fieldKey}>
                                  <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                                    {fieldData.label}
                                  </td>
                                  <td style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '12px', 
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: fieldData.value && (fieldData.value.includes('Positive') || fieldData.value.includes('Reactive')) ? '#e74c3c' : '#27ae60'
                                  }}>
                                    {fieldData.value || 'Pending'}
                                  </td>
                                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                    {fieldData.normalRange}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                                          </td>
                                          <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                            {field.normalRange}
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