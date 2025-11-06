import AppHeader from '@/components/app-header';
import LabTestModal from '@/components/LabTestModal';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, servicesAPI } from '@/services/api';
import { Appointment, useAppointmentStore } from '@/utils/appointments';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal, Platform, SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const TEST_OPTIONS = [
  { 
    _id: '1',
    serviceName: 'Complete Blood Count (CBC)', 
    category: 'hematology',
    price: 280,
    description: 'Complete blood count with differential',
    preparationInstructions: 'No special preparation required',
    duration: '20 minutes',
    isActive: true
  },
  { 
    _id: '2',
    serviceName: 'Fasting Blood Sugar (FBS)', 
    category: 'clinical_chemistry',
    price: 150,
    description: 'Fasting glucose level test',
    preparationInstructions: 'Must be taken while fasting for 8-12 hours',
    duration: '2-4 hours',
    isActive: true
  },
  { 
    _id: '3',
    serviceName: 'Lipid Profile', 
    category: 'clinical_chemistry',
    price: 450,
    description: 'Complete cholesterol panel',
    preparationInstructions: 'Must be taken while fasting for 8-12 hours',
    duration: '2-4 hours',
    isActive: true
  },
  { 
    _id: '4',
    serviceName: 'Urinalysis', 
    category: 'clinical_microscopy',
    price: 200,
    description: 'Complete urine examination',
    preparationInstructions: 'Best taken in the morning for accurate results',
    duration: '2-4 hours',
    isActive: true
  },
  { 
    _id: '5',
    serviceName: 'X-Ray Chest (PA)', 
    category: 'other',
    price: 600,
    description: 'Posterior-Anterior chest X-ray',
    preparationInstructions: 'No special preparation required',
    duration: '15 minutes',
    isActive: true
  }
];

const TIME_SLOTS = [
  { id: 'morning', label: '7:00 AM - 10:00 AM (Morning - Fasting Tests)' },
  { id: 'afternoon', label: '1:00 PM - 4:00 PM (Afternoon - After Lunch)' }
];

const LAB_LOCATIONS = [
  {
    id: 'main',
    name: 'MDLAB Direct - Main Branch',
    address: '123 Main Street, City',
    availableTests: ['Urinalysis', 'X-Ray Chest (PA)', 'Fasting Blood Sugar', 'Lipid Profile', 'Complete Blood Count']
  },
  {
    id: 'north',
    name: 'MDLAB Direct - North Branch',
    address: '456 North Ave, City',
    availableTests: ['Urinalysis', 'Fasting Blood Sugar', 'Complete Blood Count']
  },
  {
    id: 'south',
    name: 'MDLAB Direct - South Branch',
    address: '789 South Road, City',
    availableTests: ['Urinalysis', 'X-Ray Chest (PA)', 'Lipid Profile', 'Complete Blood Count']
  }
];

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const { appointments, addAppointment, rescheduleAppointment, cancelAppointment } =
    useAppointmentStore();
  
  // Real data states
  const [realAppointments, setRealAppointments] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isTestSelectionVisible, setIsTestSelectionVisible] = useState(false);
  
  // Form states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTests, setSelectedTests] = useState<typeof TEST_OPTIONS>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch appointments and services on mount
  useEffect(() => {
    if (user) {
      console.log('🔍 User found, fetching appointments for:', {
        id: user._id || user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      });
      fetchAppointments();
      fetchServices();
    } else {
      console.log('❌ No user found in useEffect');
    }
  }, [user]);

  // Also fetch services immediately on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      
      console.log('🔍 Fetching appointments for authenticated user');
      console.log('   User info:', {
        id: user?._id || user?.id,
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.email
      });
      
      // Test if we have a valid token
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('❌ No authentication token found');
          return;
        }
        console.log('✅ Token found in storage');
      } catch (e) {
        console.log('❌ Error checking token:', e);
      }
      
      // DO NOT pass patientId - backend filters automatically by authenticated user
      // This matches the web frontend implementation
      const response = await appointmentAPI.getAppointments();
      
      console.log('📡 Fetch appointments response:', response);
      
      if (response.success && response.data?.data) {
        console.log('📅 Successfully fetched appointments:', response.data.data.length, 'appointments');
        console.log('� Appointment details:', response.data.data);
        setRealAppointments(response.data.data);
      } else {
        console.error('❌ Failed to fetch appointments:', response.message);
        console.log('🔍 Response structure:', response);
      }
    } catch (error) {
      console.error('💥 Error fetching appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      console.log('🔍 Fetching services from backend...');
      
      const response = await servicesAPI.getServices({ limit: 100 }); // Exact same as web frontend
      
      console.log('📡 Services response:', response.success, response.data?.length);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Successfully fetched services:', response.data.length);
        console.log('� First service sample:', response.data[0]);
        setAvailableServices(response.data);
      } else {
        console.error('❌ Failed to fetch services - Invalid response:', response);
        // Fallback to test options if API fails
        setAvailableServices(TEST_OPTIONS);
      }
    } catch (error) {
      console.error('💥 Error fetching services:', error);
      // Fallback to test options if error occurs
      setAvailableServices(TEST_OPTIONS);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to book an appointment');
      return;
    }

    if (selectedTests.length === 0) {
      Alert.alert(
        'No Tests Selected',
        'Please select at least one test to book an appointment.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('=== 📝 APPOINTMENT BOOKING DEBUG ===');
      console.log('👤 User data:', {
        id: user._id || user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        address: user.address
      });
      console.log('🧪 Selected tests:', selectedTests);

      // Format appointment date - EXACT SAME AS WEB
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      
      console.log('📅 Formatted date:', localDateString);

      // Format sex field - capitalize first letter to match backend validation
      const formatGender = (gender: string | undefined) => {
        if (!gender) return undefined;
        return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      };

      // Prepare appointment data - EXACT SAME STRUCTURE AS WEB
      const testNames = selectedTests.map(test => test.serviceName).join(', ');
      const testIds = selectedTests.map(test => test._id);
      const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);

      const appointmentData = {
        patientId: user._id || user.id,
        patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient',
        contactNumber: user.phone || '09123456789',
        email: user.email || '',
        address: typeof user.address === 'object' ? (user.address as any)?.street : user.address || '',
        age: user.age || undefined,
        sex: formatGender(user.gender),
        serviceIds: testIds, // Array of service IDs - SAME AS WEB
        serviceName: testNames, // Combined service names - SAME AS WEB
        appointmentDate: localDateString, // YYYY-MM-DD format - SAME AS WEB
        appointmentTime: 'Any time during clinic hours', // Default time - SAME AS WEB
        type: 'scheduled', // ✅ FIXED: Changed from 'clinic' to 'scheduled' to match backend enum
        priority: 'regular', // ✅ ADDED: Required by backend, matches web default
        totalPrice: totalPrice, // Total price of all tests - SAME AS WEB
        notes: `Patient booking - Multiple tests: ${testNames}`, // SAME AS WEB
        reasonForVisit: `Multiple tests - Patient self-booking (${selectedTests.length} tests)` // SAME AS WEB
      };

      console.log('� FINAL APPOINTMENT DATA:', JSON.stringify(appointmentData, null, 2));
      console.log('🌐 Sending to:', 'POST /api/appointments');
      
      const response = await appointmentAPI.createAppointment(appointmentData);
      
      console.log('📡 Appointment response:', response.success ? 'Success' : 'Failed');

      if (response.success) {
        const testNames = selectedTests.map(test => test.serviceName).join(', ');
        const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);

        Alert.alert(
          'Appointment Booked',
          `Your appointment for ${testNames} has been booked for ${selectedDate.toLocaleDateString()}.\n\nTotal: ₱${totalPrice.toFixed(2)}\n\nWould you like to book another appointment?`,
          [
            {
              text: 'No',
              onPress: async () => {
                setIsBookingModalVisible(false);
                resetBookingForm();
                // Add a small delay to ensure the appointment is saved before fetching
                setTimeout(() => {
                  fetchAppointments();
                }, 1000);
              }
            },
            {
              text: 'Yes',
              onPress: async () => {
                resetBookingForm();
                // Add a small delay to ensure the appointment is saved before fetching
                setTimeout(() => {
                  fetchAppointments();
                }, 1000);
              }
            }
          ]
        );
      } else {
        console.log('❌ Appointment creation failed:', response.message);
        Alert.alert('Error', response.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      console.error('💥 Error booking appointment:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🚨 AUTHENTICATION ERROR detected during appointment creation');
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Could redirect to login here
                console.log('User needs to re-authenticate');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to book appointment. Please try again.');
      }
    }
  };

  const resetBookingForm = () => {
    setSelectedTests([]);
    setSelectedDate(new Date());
  };

  const handleTestSelection = (selectionData: any) => {
    console.log('📋 Received test selection data:', selectionData);
    
    // The LabTestModal passes an object with tests array
    const tests = selectionData.tests || selectionData;
    console.log('✅ Selected tests:', tests);
    
    // Ensure each test has the correct structure with serviceName as name
    const formattedTests = tests.map((test: any) => {
      console.log('🔧 Formatting test:', test);
      return {
        _id: test._id,
        serviceName: test.serviceName || test.name,
        name: test.serviceName || test.name, // Add name property for compatibility
        price: test.price || 0,
        category: test.category,
        description: test.description,
        preparationInstructions: test.preparationInstructions,
        duration: test.duration,
        isActive: test.isActive
      };
    });
    
    console.log('🔧 Formatted tests:', formattedTests);
    setSelectedTests(formattedTests);
    console.log('💾 Setting selected tests in state:', formattedTests);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(appointment.date);
    setIsModalVisible(true);
  };

  const confirmReschedule = () => {
    if (selectedAppointment) {
      rescheduleAppointment(selectedAppointment.id, selectedDate);
      setIsModalVisible(false);
    }
  };

  const handleCancel = (appointmentId: string) => {
    cancelAppointment(appointmentId);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const calculateTotalPrice = () => {
    return selectedTests.reduce((sum, test) => sum + test.price, 0);
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <ThemedText style={styles.testName}>{appointment.testName}</ThemedText>
        <View style={[
          styles.statusBadge,
          { backgroundColor: appointment.status === 'upcoming' ? '#21AEA8' : '#718096' }
        ]}>
          <ThemedText style={styles.statusText}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#718096" />
          <ThemedText style={styles.detailText}>
            {appointment.date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#718096" />
          <ThemedText style={styles.detailText}>{appointment.location}</ThemedText>
        </View>
      </View>

      {appointment.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => handleReschedule(appointment)}
          >
            <Ionicons name="calendar" size={16} color="#21AEA8" />
            <ThemedText style={styles.rescheduleText}>Reschedule</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancel(appointment.id)}
          >
            <Ionicons name="close-circle" size={16} color="#E53E3E" />
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#21AEA8" barStyle="light-content" />
      <AppHeader />
      
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.pageTitle}>My Appointments</ThemedText>
            
            {/* Debug button - remove in production */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setIsBookingModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.bookButtonText}>Book New Appointment</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upcoming Appointments</ThemedText>
          {isLoadingAppointments ? (
            <ThemedText style={styles.emptyStateText}>Loading appointments...</ThemedText>
          ) : realAppointments.filter(apt => apt.status === 'pending' || apt.status === 'scheduled').length === 0 ? (
            <ThemedText style={styles.emptyStateText}>
              No upcoming appointments. Book one to get started!
            </ThemedText>
          ) : (
            realAppointments
              .filter(apt => apt.status === 'pending' || apt.status === 'scheduled')
              .map((appointment, index) => (
                <View key={appointment._id || index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentInfo}>
                      <ThemedText style={styles.appointmentTitle}>
                        {appointment.serviceName || 'Lab Test'}
                      </ThemedText>
                      <ThemedText style={styles.appointmentDate}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </ThemedText>
                      <ThemedText style={styles.appointmentTime}>
                        {appointment.appointmentTime}
                      </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#21AEA8' }]}>
                      <ThemedText style={styles.statusText}>{appointment.status}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <ThemedText style={styles.detailText}>
                        {appointment.type === 'mobile' ? 'Mobile Lab Service' : 'Lab Center'}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={16} color="#666" />
                      <ThemedText style={styles.detailText}>
                        ₱{appointment.totalPrice || 0}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))
          )}
        </View>

        <View style={[styles.section, styles.pastAppointmentsSection]}>
          <ThemedText style={styles.sectionTitle}>Past Appointments</ThemedText>
          {isLoadingAppointments ? (
            <ThemedText style={styles.emptyStateText}>Loading appointments...</ThemedText>
          ) : realAppointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled').length === 0 ? (
            <ThemedText style={styles.emptyStateText}>
              No past appointments.
            </ThemedText>
          ) : (
            <View style={styles.pastAppointmentsContainer}>
              {realAppointments
                .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
                .map((appointment, index) => (
                  <View key={appointment._id || index} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentInfo}>
                        <ThemedText style={styles.appointmentTitle}>
                          {appointment.serviceName || 'Lab Test'}
                        </ThemedText>
                        <ThemedText style={styles.appointmentDate}>
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </ThemedText>
                        <ThemedText style={styles.appointmentTime}>
                          {appointment.appointmentTime}
                        </ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: appointment.status === 'completed' ? '#16A34A' : '#EF4444' 
                      }]}>
                        <ThemedText style={styles.statusText}>{appointment.status}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color="#666" />
                        <ThemedText style={styles.detailText}>
                          {appointment.type === 'mobile' ? 'Mobile Lab Service' : 'Lab Center'}
                        </ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color="#666" />
                        <ThemedText style={styles.detailText}>
                          ₱{appointment.totalPrice || 0}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
      </View>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBookingModalVisible}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Book New Appointment</ThemedText>
            
            {/* Test Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Select Tests</ThemedText>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setIsTestSelectionVisible(true)}
              >
                <ThemedText style={styles.selectedValueText}>
                  {(() => {
                    console.log('🎯 Rendering dropdown text, selectedTests:', selectedTests);
                    if (selectedTests.length === 0) {
                      return 'Select Laboratory Tests...';
                    } else if (selectedTests.length === 1) {
                      const testName = selectedTests[0]?.serviceName || 'Unknown Test';
                      console.log('📝 Single test name:', testName);
                      return testName;
                    } else {
                      const testNames = selectedTests.map(test => test?.serviceName || 'Unknown Test').join(', ');
                      console.log('📝 Multiple test names:', testNames);
                      return testNames.length > 40 
                        ? `${selectedTests.length} tests selected`
                        : testNames;
                    }
                  })()}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color="#1A202C" />
              </TouchableOpacity>
              
              {/* Selected Tests Preview */}
              {selectedTests.length > 0 && (
                <View style={styles.selectedTestsPreview}>
                  <ThemedText style={styles.previewTitle}>Selected Tests:</ThemedText>
                  {selectedTests.map(test => (
                    <View key={test._id} style={styles.testPreviewItem}>
                      <ThemedText style={styles.testPreviewName}>
                        {test.serviceName || 'Unknown Test'}
                      </ThemedText>
                      <ThemedText style={styles.testPreviewPrice}>
                        ₱{(test.price || 0).toFixed(2)}
                      </ThemedText>
                    </View>
                  ))}
                  <View style={styles.totalPricePreview}>
                    <ThemedText style={styles.totalPriceText}>
                      Total: ₱{calculateTotalPrice().toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Select Date</ThemedText>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.selectedValueText}>{selectedDate.toLocaleDateString()}</ThemedText>
                <Ionicons name="calendar" size={20} color="#1A202C" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Location Selection - Static like frontend */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Location</ThemedText>
              <View style={styles.locationDisplay}>
                <View style={styles.locationInfo}>
                  <ThemedText style={styles.staticLocationName}>MDLAB Direct - Main Branch</ThemedText>
                  <ThemedText style={styles.locationDetails}>You can visit anytime during clinic hours</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsBookingModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBookAppointment}
              >
                <ThemedText style={styles.confirmButtonText}>Book</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lab Test Selection Modal */}
      <LabTestModal
        visible={isTestSelectionVisible}
        onClose={() => setIsTestSelectionVisible(false)}
        onConfirm={handleTestSelection}
      />

      {/* Reschedule Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Reschedule Appointment</ThemedText>
            <View style={styles.datePickerContainer}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.selectedValueText}>
                  {selectedDate.toLocaleDateString()}
                </ThemedText>
                <Ionicons name="calendar" size={20} color="#1A202C" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  themeVariant="light"
                  textColor="#1A202C"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReschedule}
              >
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 16,
    backgroundColor: '#E8F5F3',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C', // Darker header title
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21AEA8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#21AEA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A202C', // Darker section title
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C', // Darker test name color
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#4A5568', // Darker detail text
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  rescheduleButton: {
    backgroundColor: '#E6FFFD',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
  },
  rescheduleText: {
    color: '#21AEA8',
    fontSize: 14,
  },
  cancelText: {
    color: '#E53E3E',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A202C', // Darker title color
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C', // Darker label color
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    backgroundColor: '#F7FAFC', // Light background for contrast
  },
  selectedValueText: {
    fontSize: 16,
    color: '#1A202C', // Dark, visible text color
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    marginTop: 8,
    width: '100%',
    maxHeight: 200,
    borderColor: '#CBD5E0',
    borderWidth: 1,
  },
  optionButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
  },
  selectedOption: {
    backgroundColor: '#E6FFFD',
  },
  optionText: {
    fontSize: 16,
    color: '#1A202C', // Darker text color
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: '#EDF2F7',
  },
  confirmButton: {
    backgroundColor: '#21AEA8',
  },
  cancelButtonText: {
    color: '#2D3748', // Darker cancel button text
    fontSize: 14,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  datePickerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  optionsList: {
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E0', // Darker border
    backgroundColor: '#FFFFFF',
  },
  testOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    color: '#21AEA8',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#4A5568', // Darker address text
    marginTop: 4,
  },
  locationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    backgroundColor: '#FFFFFF',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A202C',
  },
  locationAddress: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 4,
  },
  availableTests: {
    marginTop: 8,
  },
  availableTestsLabel: {
    fontSize: 12,
    color: '#718096',
  },
  availableTestsList: {
    fontSize: 14,
    color: '#1A202C',
    marginTop: 4,
  },
  emptyStateText: {
    color: '#718096',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  pastAppointmentsSection: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
  },
  pastAppointmentsContainer: {
    padding: 8,
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  recommendationLine: {
    width: 4,
    height: '100%',
    backgroundColor: '#21AEA8',
    borderRadius: 2,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  selectedTestsPreview: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#21AEA8',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  testPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  testPreviewName: {
    fontSize: 14,
    color: '#1A202C',
    flex: 1,
  },
  testPreviewPrice: {
    fontSize: 14,
    color: '#21AEA8',
    fontWeight: '600',
  },
  totalPricePreview: {
    borderTopWidth: 1,
    borderTopColor: '#21AEA8',
    marginTop: 8,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21AEA8',
  },
  // Additional styles for appointment cards
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#4A5568',
  },
  // Location display styles
  locationDisplay: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationInfo: {
    alignItems: 'center',
  },
  staticLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
});
