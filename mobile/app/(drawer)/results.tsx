import AppHeader from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { scheduleResultNotification } from '@/utils/notifications';
import { generateTestResultPDF } from '@/utils/pdfGenerator';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ResultsScreen() {
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('3months');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showTestTypePicker, setShowTestTypePicker] = useState(false);
  const [showTimePeriodPicker, setShowTimePeriodPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

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

  // Mock data - you can add sample results here or keep empty
  const testResults: any[] = [];

  // Simulate new result notification (you would call this when a new result is added)
  useEffect(() => {
    // Example: Send notification when new results are available
    // In production, this would be triggered by your backend
    const checkForNewResults = async () => {
      const newResult = testResults.find(r => !r.hasNotificationSent);
      if (newResult) {
        await scheduleResultNotification(newResult.title, newResult.date);
        // Mark as notification sent (in real app, this would be saved to backend)
      }
    };
    
    // Uncomment to test notifications:
    // checkForNewResults();
  }, []);

  const handlePrintResult = async (result: any) => {
    try {
      await generateTestResultPDF({
        testName: result.title,
        patientName: 'Renz Ramos',
        patientAge: 25,
        patientGender: 'Male',
        date: result.date,
        resultItems: result.resultItems,
        labTechnician: 'Maria Santos, RMT',
        doctorName: 'Dr. Juan Dela Cruz, MD',
        remarks: result.status === 'high' ? 'Please consult with your physician regarding elevated values.' : 'All parameters are within normal limits.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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

        <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Results List - for when there are results */}
          {testResults.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={80} color="#CBD5E0" />
              </View>
              <ThemedText style={styles.emptyTitle}>No Test Results Found</ThemedText>
              <ThemedText style={styles.emptyMessage}>
                No test results match your current filters, or you haven't had any tests yet.
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
              {testResults.map((result: any, index: number) => (
                <View key={index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultIcon}>
                      <Ionicons name="flask" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.resultInfo}>
                      <ThemedText style={styles.resultTitle}>{result.title}</ThemedText>
                      <ThemedText style={styles.resultDate}>{result.date}</ThemedText>
                      <View style={[
                        styles.statusBadge,
                        result.status === 'high' ? styles.statusBadgeHigh : 
                        result.status === 'low' ? styles.statusBadgeLow : 
                        styles.statusBadgeNormal
                      ]}>
                        <ThemedText style={[
                          styles.statusText,
                          result.status === 'high' ? styles.statusTextHigh : 
                          result.status === 'low' ? styles.statusTextLow : 
                          styles.statusTextNormal
                        ]}>
                          {result.status === 'high' ? 'Attention Needed' : 
                           result.status === 'low' ? 'Low Values' : 
                           'Normal'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.resultActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => Alert.alert('View Result', 'Full result details would be displayed here.')}
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
});
