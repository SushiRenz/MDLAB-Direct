import AppHeader from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { scheduleResultNotification } from '@/utils/notifications';
import { generateTestResultPDF } from '@/utils/pdfGenerator';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { testResultsAPI, TestResult } from '@/services/api';

// Complete test field definitions matching web
const testFieldDefinitions = {
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
      { key: 'fecalysis', label: 'Fecalysis', normalRange: 'See reference', group: 'other' }
    ]
  },
  immunology: {
    title: 'SEROLOGY/IMMUNOLOGY',
    fields: [
      { key: 'hepatitis_b', label: 'Hepatitis B Antigen (HbsAg)', normalRange: 'Non-Reactive', group: 'serology' },
      { key: 'hepatitis_c', label: 'Hepatitis C', normalRange: 'Non-Reactive', group: 'serology' },
      { key: 'hiv', label: 'HIV Screening', normalRange: 'Non-Reactive', group: 'serology' },
      { key: 'vdrl', label: 'VDRL (Syphilis)', normalRange: 'Non-Reactive', group: 'serology' },
      { key: 'dengue_ns1', label: 'Dengue NS1 Antigen', normalRange: 'Negative', group: 'dengue' },
      { key: 'dengue_igg', label: 'Dengue IgG Antibody', normalRange: 'Negative', group: 'dengue' },
      { key: 'dengue_igm', label: 'Dengue IgM Antibody', normalRange: 'Negative', group: 'dengue' },
      { key: 'salmonella_igg', label: 'Salmonella IgG', normalRange: 'Non-Reactive', group: 'salmonella' },
      { key: 'salmonella_igm', label: 'Salmonella IgM', normalRange: 'Non-Reactive', group: 'salmonella' },
      { key: 'hpylori_antigen', label: 'H. Pylori Antigen', normalRange: 'Negative', group: 'hpylori' },
      { key: 'hpylori_antibody', label: 'H. Pylori Antibody', normalRange: 'Negative', group: 'hpylori' },
      { key: 'psa', label: 'PSA (Prostate Specific Antigen)', normalRange: '<4.0 ng/mL', group: 'tumor_markers' },
      { key: 'crp', label: 'CRP (C-Reactive Protein)', normalRange: '<3.0 mg/L', group: 'inflammation' }
    ]
  },
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
      { key: 'monocytes', label: 'Monocytes', normalRange: '0.1-1.5 x10⁩/L', group: 'differential' },
      { key: 'eosinophils', label: 'Eosinophils', normalRange: '0.0-0.4 x10⁹/L', group: 'differential' },
      { key: 'basophils', label: 'Basophils', normalRange: '0.0-0.1 x10⁹/L', group: 'differential' },
      { key: 'esr', label: 'ESR (Erythrocyte Sedimentation Rate)', normalRange: '<20 mm/hr', group: 'other' },
      { key: 'aptt', label: 'APTT (Activated Partial Thromboplastin Time)', normalRange: '25-35 seconds', group: 'coagulation' },
      { key: 'pt', label: 'PT (Prothrombin Time)', normalRange: '11-15 seconds', group: 'coagulation' },
      { key: 'inr', label: 'INR (International Normalized Ratio)', normalRange: '0.8-1.2', group: 'coagulation' },
      { key: 'bleeding_time', label: 'Bleeding Time', normalRange: '1-6 minutes', group: 'coagulation' },
      { key: 'clotting_time', label: 'Clotting Time', normalRange: '5-15 minutes', group: 'coagulation' }
    ]
  },
  urinalysis: {
    title: 'CLINICAL MICROSCOPY',
    fields: [
      { key: 'color', label: 'Color', normalRange: 'Yellow', group: 'urine_physical' },
      { key: 'transparency', label: 'Transparency', normalRange: 'Clear', group: 'urine_physical' },
      { key: 'specificGravity', label: 'Specific Gravity', normalRange: '1.003-1.030', group: 'urine_physical' },
      { key: 'ph', label: 'pH', normalRange: '4.6-8.0', group: 'urine_chemical' },
      { key: 'protein', label: 'Protein', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'glucose', label: 'Glucose', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'ketones', label: 'Ketones', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'bilirubin', label: 'Bilirubin', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'urobilinogen', label: 'Urobilinogen', normalRange: 'Normal', group: 'urine_chemical' },
      { key: 'blood', label: 'Blood', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'leukocytes', label: 'Leukocytes', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'nitrites', label: 'Nitrites', normalRange: 'Negative', group: 'urine_chemical' },
      { key: 'pregnancy_test_urine', label: 'Pregnancy Test (Urine)', normalRange: 'Negative', group: 'pregnancy' },
      { key: 'pregnancy_test_serum', label: 'Pregnancy Test (Serum/β-HCG)', normalRange: 'Negative', group: 'pregnancy' }
    ]
  }
};

export default function ResultsScreen() {
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('3months');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showTestTypePicker, setShowTestTypePicker] = useState(false);
  const [showTimePeriodPicker, setShowTimePeriodPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const testTypes = [
    { label: 'All Results', value: 'all' },
    { label: 'Blood Tests', value: 'blood' },
    { label: 'Urine Tests', value: 'urine' },
    { label: 'X-Ray', value: 'xray' },
    { label: 'Other', value: 'other' },
  ];

  const timePeriods = [
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'Last Year', value: '1year' },
    { label: 'All Time', value: 'all' },
  ];

  const sortOptions = [
    { label: 'Date (Newest First)', value: 'newest' },
    { label: 'Date (Oldest First)', value: 'oldest' },
    { label: 'Test Name', value: 'name' },
  ];

  // Fetch test results on component mount
  useEffect(() => {
    fetchTestResults();
  }, []);

  // Apply filters and sorting when data or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [testResults, selectedTestType, selectedTimePeriod, selectedSort]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching test results...');
      const response = await testResultsAPI.getMyTestResults();
      
      if (response.success && response.data) {
        console.log('✅ Test results fetched:', response.data.count, 'results');
        
        // Log first result for debugging
        if (response.data.data.length > 0) {
          console.log('📋 Sample result structure:');
          console.log('   Service Name:', response.data.data[0].serviceName);
          console.log('   Sample ID:', response.data.data[0].sampleId);
          console.log('   Results keys:', Object.keys(response.data.data[0].results || {}));
          console.log('   First result entry:', Object.entries(response.data.data[0].results || {})[0]);
        }
        
        setTestResults(response.data.data);
      } else {
        console.log('⚠️ No test results found');
        setTestResults([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching test results:', error);
      setError(error.message || 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTestResults();
    setRefreshing(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...testResults];

    // Filter by test type
    if (selectedTestType !== 'all') {
      filtered = filtered.filter(result => {
        const testType = result.testType?.toLowerCase() || '';
        return testType.includes(selectedTestType.toLowerCase());
      });
    }

    // Filter by time period
    if (selectedTimePeriod !== 'all') {
      const now = new Date();

      filtered = filtered.filter(result => {
        const resultDate = new Date(result.sampleDate);
        const monthsDiff = (now.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        switch (selectedTimePeriod) {
          case '3months':
            return monthsDiff <= 3;
          case '6months':
            return monthsDiff <= 6;
          case '1year':
            return monthsDiff <= 12;
          default:
            return true;
        }
      });
    }

    // Group results by sampleId (matching web behavior)
    const groupedBySampleId = new Map<string, TestResult[]>();
    
    filtered.forEach(result => {
      const sampleId = result.sampleId;
      if (!groupedBySampleId.has(sampleId)) {
        groupedBySampleId.set(sampleId, []);
      }
      groupedBySampleId.get(sampleId)!.push(result);
    });

    // Merge grouped results into single entries
    const mergedResults: TestResult[] = Array.from(groupedBySampleId.values()).map(group => {
      // Use the first result as base
      const baseResult = { ...group[0] };
      
      // Merge all service names (comma-separated)
      const allServiceNames = group.map(r => r.serviceName).join(', ');
      baseResult.serviceName = allServiceNames;
      
      // Merge all results objects
      const mergedResultsObj: Record<string, any> = {};
      group.forEach(r => {
        if (r.results) {
          Object.assign(mergedResultsObj, r.results);
        }
      });
      baseResult.results = mergedResultsObj;
      
      // Keep the most recent/relevant status flags
      baseResult.isNew = group.some(r => r.isNew);
      baseResult.isAbnormal = group.some(r => r.isAbnormal);
      baseResult.isCritical = group.some(r => r.isCritical);
      
      return baseResult;
    });

    // Sort merged results
    mergedResults.sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime();
        case 'oldest':
          return new Date(a.sampleDate).getTime() - new Date(b.sampleDate).getTime();
        case 'name':
          return a.serviceName.localeCompare(b.serviceName);
        default:
          return 0;
      }
    });

    setFilteredResults(mergedResults);
  };

  const handleViewResult = async (result: TestResult) => {
    // Mark as viewed if it's new
    if (result.isNew) {
      try {
        await testResultsAPI.markAsViewed(result._id);
        // Update local state
        setTestResults(prev => prev.map(r => 
          r._id === result._id ? { ...r, isNew: false } : r
        ));
      } catch (error) {
        console.error('Error marking result as viewed:', error);
      }
    }
    
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handlePrintResult = async (result: TestResult) => {
    try {
      const resultItems = Object.entries(result.results || {}).map(([key, value]) => ({
        parameter: key,
        result: typeof value === 'object' ? (value as any).value : String(value),
        unit: typeof value === 'object' ? (value as any).unit : '',
        normalRange: typeof value === 'object' ? (value as any).referenceRange : '',
        status: typeof value === 'object' ? (value as any).status : 'normal' as 'normal' | 'high' | 'low'
      }));

      await generateTestResultPDF({
        testName: result.serviceName,
        patientName: result.patientName,
        patientAge: 0, // Age not in TestResult interface
        patientGender: 'N/A', // Gender not in TestResult interface
        date: new Date(result.sampleDate).toLocaleDateString(),
        resultItems,
        labTechnician: result.medTech ? `${result.medTech.firstName} ${result.medTech.lastName}, RMT` : 'N/A',
        doctorName: result.pathologist ? `Dr. ${result.pathologist.firstName} ${result.pathologist.lastName}` : 'N/A',
        remarks: result.isCritical ? 'CRITICAL: Please consult with your physician immediately.' : 
                 result.isAbnormal ? 'Some values are outside normal range. Please consult with your physician.' : 
                 'All parameters are within normal limits.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (result: TestResult) => {
    if (result.isCritical) return '#DC2626'; // Red for critical
    if (result.isAbnormal) return '#F59E0B'; // Amber for abnormal
    return '#10B981'; // Green for normal
  };

  const getStatusText = (result: TestResult) => {
    if (result.isCritical) return 'Critical';
    if (result.isAbnormal) return 'Abnormal';
    return 'Normal';
  };

  const handleBookTest = () => {
    Alert.alert(
      'Book a Test',
      'You will be redirected to the Appointments page to book a new test.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Go to Appointments',
          onPress: () => router.push('/(drawer)/appointments'),
        },
      ]
    );
  };

  const getTestTypeLabel = () => {
    return testTypes.find(t => t.value === selectedTestType)?.label || 'All Results';
  };

  const getTimePeriodLabel = () => {
    return timePeriods.find(t => t.value === selectedTimePeriod)?.label || 'Last 3 Months';
  };

  const getSortLabel = () => {
    return sortOptions.find(s => s.value === selectedSort)?.label || 'Date (Newest First)';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#21AEA8" barStyle="light-content" />
      <AppHeader />
      
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <ThemedText style={styles.pageTitle}>Test Results</ThemedText>
          <ThemedText style={styles.pageSubtitle}>View and download your laboratory test results</ThemedText>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#21AEA8']} />
          }
        >
          <View style={styles.mainContent}>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <View style={styles.filterGroup}>
              <ThemedText style={styles.filterLabel}>TEST TYPE:</ThemedText>
              <TouchableOpacity 
                style={styles.filterDropdown}
                onPress={() => setShowTestTypePicker(!showTestTypePicker)}
              >
                <ThemedText style={styles.filterText}>{getTestTypeLabel()}</ThemedText>
                <Ionicons name={showTestTypePicker ? "chevron-up" : "chevron-down"} size={16} color="#21AEA8" />
              </TouchableOpacity>
              {showTestTypePicker && (
                <View style={styles.dropdownList}>
                  {testTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedTestType(type.value);
                        setShowTestTypePicker(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemText}>{type.label}</ThemedText>
                      {selectedTestType === type.value && (
                        <Ionicons name="checkmark" size={18} color="#21AEA8" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={styles.filterLabel}>TIME PERIOD:</ThemedText>
              <TouchableOpacity 
                style={styles.filterDropdown}
                onPress={() => setShowTimePeriodPicker(!showTimePeriodPicker)}
              >
                <ThemedText style={styles.filterText}>{getTimePeriodLabel()}</ThemedText>
                <Ionicons name={showTimePeriodPicker ? "chevron-up" : "chevron-down"} size={16} color="#21AEA8" />
              </TouchableOpacity>
              {showTimePeriodPicker && (
                <View style={styles.dropdownList}>
                  {timePeriods.map((period) => (
                    <TouchableOpacity
                      key={period.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedTimePeriod(period.value);
                        setShowTimePeriodPicker(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemText}>{period.label}</ThemedText>
                      {selectedTimePeriod === period.value && (
                        <Ionicons name="checkmark" size={18} color="#21AEA8" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={styles.filterLabel}>SORT BY:</ThemedText>
              <TouchableOpacity 
                style={styles.filterDropdown}
                onPress={() => setShowSortPicker(!showSortPicker)}
              >
                <ThemedText style={styles.filterText}>{getSortLabel()}</ThemedText>
                <Ionicons name={showSortPicker ? "chevron-up" : "chevron-down"} size={16} color="#21AEA8" />
              </TouchableOpacity>
              {showSortPicker && (
                <View style={styles.dropdownList}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSort(option.value);
                        setShowSortPicker(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemText}>{option.label}</ThemedText>
                      {selectedSort === option.value && (
                        <Ionicons name="checkmark" size={18} color="#21AEA8" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#21AEA8" />
              <ThemedText style={styles.loadingText}>Loading test results...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Ionicons name="alert-circle" size={64} color="#ef4444" />
              <ThemedText style={styles.errorTitle}>Error Loading Results</ThemedText>
              <ThemedText style={styles.errorMessage}>{error}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTestResults}>
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={80} color="#CBD5E0" />
              </View>
              <ThemedText style={styles.emptyTitle}>No Test Results Found</ThemedText>
              <ThemedText style={styles.emptyMessage}>
                {testResults.length === 0 
                  ? "You haven't had any tests yet. Book an appointment to get started!"
                  : "No test results match your current filters."}
              </ThemedText>
              <TouchableOpacity 
                style={styles.bookTestButton}
                onPress={() => router.push('/(drawer)/appointments')}
              >
                <ThemedText style={styles.bookTestButtonText}>Book a Test</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {filteredResults.map((result, index) => (
                <View key={result._id || index} style={styles.resultCard}>
                  {result.isNew && (
                    <View style={styles.newBadge}>
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                      <ThemedText style={styles.newBadgeText}>NEW</ThemedText>
                    </View>
                  )}
                  <View style={styles.resultHeader}>
                    <View style={[styles.resultIcon, { backgroundColor: getStatusColor(result) }]}>
                      <Ionicons name="flask" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.resultInfo}>
                      <ThemedText style={styles.resultTitle} numberOfLines={3}>
                        {result.serviceName}
                      </ThemedText>
                      <ThemedText style={styles.resultDate}>{formatDate(result.sampleDate)}</ThemedText>
                      <ThemedText style={styles.resultSampleId}>Sample ID: {result.sampleId}</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result) + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(result) }]}>
                          {getStatusText(result)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.resultActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewResult(result)}
                    >
                      <Ionicons name="eye-outline" size={18} color="#21AEA8" />
                      <ThemedText style={styles.viewButtonText}>View Full Report</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.printButton}
                      onPress={() => handlePrintResult(result)}
                    >
                      <Ionicons name="print-outline" size={18} color="#21AEA8" />
                      <ThemedText style={styles.printButtonText}>Print / Download</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      </View>

      {/* Result Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedResult && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <ThemedText style={styles.modalTitle}>Laboratory Test Results</ThemedText>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setShowDetailModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={28} color="#4A5568" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Patient and Test Info Header */}
                  <View style={styles.reportHeader}>
                    <View style={styles.reportHeaderRow}>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Patient:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>
                          {selectedResult.patientName}
                        </ThemedText>
                      </View>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Sample Date:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>
                          {new Date(selectedResult.sampleDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.reportHeaderRow}>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Test Type:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>
                          {selectedResult.serviceName}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.reportHeaderRow}>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Date Performed:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>
                          {selectedResult.createdAt ? new Date(selectedResult.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                        </ThemedText>
                      </View>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Time Performed:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>
                          {selectedResult.createdAt ? new Date(selectedResult.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.reportHeaderRow}>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Sample ID:</ThemedText>
                        <ThemedText style={styles.reportHeaderValue}>{selectedResult.sampleId}</ThemedText>
                      </View>
                      <View style={styles.reportHeaderItem}>
                        <ThemedText style={styles.reportHeaderLabel}>Status:</ThemedText>
                        <View style={[styles.statusBadgeInline, { 
                          backgroundColor: selectedResult.status === 'released' ? '#C6F6D5' : '#FED7D7' 
                        }]}>
                          <ThemedText style={[styles.statusTextInline, { 
                            color: selectedResult.status === 'released' ? '#22543D' : '#742A2A' 
                          }]}>
                            {selectedResult.status === 'released' ? 'Released' : selectedResult.status}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Test Results - Organized by Category */}
                  <View style={styles.detailSection}>
                    <ThemedText style={styles.detailSectionTitle}>Test Results</ThemedText>
                    {(() => {
                      // Helper function to get test value from results object (matching web logic)
                      const getTestFieldValue = (fieldKey: string, results: any) => {
                        if (!results || !fieldKey) return null;
                        
                        try {
                          if (typeof results === 'object' && !(results instanceof Map)) {
                            const value = results[fieldKey];
                            
                            if (value && typeof value === 'object' && 'value' in value) {
                              return value.value;
                            }
                            
                            if (value && typeof value === 'object' && 'result' in value) {
                              return value.result;
                            }
                            
                            return value;
                          }
                        } catch (error) {
                          console.error(`Error extracting field "${fieldKey}":`, error);
                        }
                        
                        return null;
                      };

                      // Get organized test results by category (matching web logic)
                      const getOrganizedTestResults = () => {
                        if (!selectedResult?.results) {
                          return {};
                        }
                        
                        const organizedResults: Record<string, any> = {};
                        
                        Object.entries(testFieldDefinitions).forEach(([category, config]) => {
                          const categoryFields: Record<string, any> = {};
                          let hasData = false;
                          
                          config.fields.forEach((field: any) => {
                            // Skip date/time performed fields
                            if (['date_performed', 'datePerformed', 'time_performed', 'timePerformed'].includes(field.key)) {
                              return;
                            }
                            
                            const value = getTestFieldValue(field.key, selectedResult.results);
                            if (value !== null && value !== undefined && value !== '') {
                              categoryFields[field.key] = {
                                label: field.label || field.key,
                                value: value,
                                normalRange: field.normalRange || 'See reference',
                                group: field.group || 'other'
                              };
                              hasData = true;
                            }
                          });
                          
                          if (hasData) {
                            organizedResults[category] = {
                              title: config.title,
                              fields: categoryFields
                            };
                          }
                        });
                        
                        return organizedResults;
                      };

                      const organizedResults = getOrganizedTestResults();
                      const hasResults = Object.keys(organizedResults).length > 0;

                      return hasResults ? (
                        <>
                          {Object.entries(organizedResults).map(([category, categoryData]: [string, any]) => (
                            <View key={category} style={styles.categorySection}>
                              <View style={styles.categoryHeader}>
                                <ThemedText style={styles.categoryTitle}>{categoryData.title}</ThemedText>
                              </View>
                              <View style={styles.resultsTable}>
                                <View style={styles.tableHeader}>
                                  <ThemedText style={[styles.tableHeaderText, { flex: 2 }]}>Test</ThemedText>
                                  <ThemedText style={[styles.tableHeaderText, { flex: 1.5 }]}>Result</ThemedText>
                                  <ThemedText style={[styles.tableHeaderText, { flex: 1.5 }]}>Normal Range</ThemedText>
                                </View>
                                {Object.entries(categoryData.fields).map(([key, fieldData]: [string, any], index) => {
                                  let displayValue: string;
                                  let status: string = 'normal';
                                  
                                  const value = fieldData.value;
                                  if (typeof value === 'object' && value !== null) {
                                    const valueObj = value as any;
                                    displayValue = valueObj.value !== undefined ? String(valueObj.value) : String(value);
                                    status = valueObj.status || 'normal';
                                  } else {
                                    displayValue = String(value);
                                  }

                                  const isAbnormal = status !== 'normal';

                                  return (
                                    <View 
                                      key={index} 
                                      style={[
                                        styles.tableRow,
                                        isAbnormal && styles.tableRowAbnormal
                                      ]}
                                    >
                                      <View style={{ flex: 2 }}>
                                        <ThemedText style={styles.tableCell}>{fieldData.label}</ThemedText>
                                      </View>
                                      <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
                                        <ThemedText style={[
                                          styles.tableCell,
                                          isAbnormal && styles.tableCellAbnormal
                                        ]}>
                                          {displayValue}
                                        </ThemedText>
                                        {isAbnormal && (
                                          <Ionicons 
                                            name={status === 'high' ? 'arrow-up' : 'arrow-down'} 
                                            size={16} 
                                            color={status === 'high' ? '#DC2626' : '#F59E0B'} 
                                            style={{ marginLeft: 4 }}
                                          />
                                        )}
                                      </View>
                                      <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>
                                        {fieldData.normalRange}
                                      </ThemedText>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          ))}
                        </>
                      ) : (
                        <View style={styles.noResultsBox}>
                          <Ionicons name="flask-outline" size={48} color="#CBD5E0" />
                          <ThemedText style={styles.noResultsText}>
                            No test values recorded yet. Results are being processed.
                          </ThemedText>
                        </View>
                      );
                    })()}
                  </View>

                  {/* Medical Personnel */}
                  {(selectedResult.medTech || selectedResult.pathologist) && (
                    <View style={styles.detailSection}>
                      <ThemedText style={styles.detailSectionTitle}>Certified By</ThemedText>
                      {selectedResult.medTech && (
                        <View style={styles.certificationItem}>
                          <Ionicons name="person" size={18} color="#21AEA8" style={styles.detailIcon} />
                          <View>
                            <ThemedText style={styles.detailLabel}>Medical Technologist</ThemedText>
                            <ThemedText style={styles.detailValue}>
                              {selectedResult.medTech.firstName} {selectedResult.medTech.lastName}, RMT
                            </ThemedText>
                          </View>
                        </View>
                      )}
                      {selectedResult.pathologist && (
                        <View style={styles.certificationItem}>
                          <Ionicons name="medical" size={18} color="#21AEA8" style={styles.detailIcon} />
                          <View>
                            <ThemedText style={styles.detailLabel}>Pathologist</ThemedText>
                            <ThemedText style={styles.detailValue}>
                              Dr. {selectedResult.pathologist.firstName} {selectedResult.pathologist.lastName}
                            </ThemedText>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Warning for Abnormal Results */}
                  {(selectedResult.isAbnormal || selectedResult.isCritical) && (
                    <View style={[
                      styles.warningBox,
                      selectedResult.isCritical && styles.warningBoxCritical
                    ]}>
                      <Ionicons 
                        name="warning" 
                        size={24} 
                        color={selectedResult.isCritical ? '#DC2626' : '#F59E0B'} 
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <ThemedText style={[
                          styles.warningTitle,
                          selectedResult.isCritical && styles.warningTitleCritical
                        ]}>
                          {selectedResult.isCritical ? 'Critical Results' : 'Abnormal Results Detected'}
                        </ThemedText>
                        <ThemedText style={styles.warningText}>
                          {selectedResult.isCritical 
                            ? 'Please consult with your physician immediately regarding these results.'
                            : 'Some values are outside the normal range. Please consult with your physician for interpretation.'}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Modal Footer with Actions */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setShowDetailModal(false);
                      handlePrintResult(selectedResult);
                    }}
                  >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.modalButtonText}>Download PDF</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5F3',
  },
  content: {
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#E8F5F3',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  mainContent: {
    padding: 20,
  },
  titleRow: {
    marginBottom: 24,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#21AEA8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  filterDropdown: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    color: '#2D3748',
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#2D3748',
    flex: 1,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  bookTestButton: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookTestButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultsList: {
    marginTop: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#21AEA8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resultIcon: {
    backgroundColor: '#21AEA8',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  resultSampleId: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeNormal: {
    backgroundColor: '#C6F6D5',
  },
  statusBadgeHigh: {
    backgroundColor: '#FED7D7',
  },
  statusBadgeLow: {
    backgroundColor: '#FEEBC8',
  },
  statusText: {
    color: '#22543D',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextNormal: {
    color: '#22543D',
  },
  statusTextHigh: {
    color: '#742A2A',
  },
  statusTextLow: {
    color: '#7C2D12',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5F3',
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#21AEA8',
    fontSize: 13,
    fontWeight: '600',
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5F3',
    borderRadius: 6,
  },
  printButtonText: {
    color: '#21AEA8',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailSection: {
    marginTop: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  detailGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 8,
  },
  detailIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500',
  },
  resultsTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAbnormal: {
    backgroundColor: '#FEF2F2',
  },
  tableCell: {
    fontSize: 14,
    color: '#2D3748',
  },
  tableCellUnit: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  tableCellAbnormal: {
    fontWeight: 'bold',
    color: '#DC2626',
  },
  certificationItem: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 24,
    marginBottom: 24,
  },
  warningBoxCritical: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#DC2626',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  warningTitleCritical: {
    color: '#991B1B',
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    backgroundColor: '#21AEA8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    backgroundColor: '#21AEA8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  reportHeader: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  reportHeaderItem: {
    flex: 1,
  },
  reportHeaderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
  },
  reportHeaderValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  statusBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusTextInline: {
    fontSize: 12,
    fontWeight: '600',
  },
});
