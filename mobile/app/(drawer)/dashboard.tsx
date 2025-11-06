import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, authUtils, testResultsAPI } from '@/services/api';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync
} from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: 0,
    pastAppointments: 0,
    totalAppointments: 0,
    newResults: 0,
    isLoading: true
  });

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Navigate to the appropriate screen based on notification type
      if (data.screen) {
        router.push(data.screen as any);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    console.log('📊 Dashboard: useEffect triggered, user:', user);
    if (user) {
      console.log('📊 Dashboard: User exists, fetching data...');
      fetchDashboardData();
    } else {
      console.log('📊 Dashboard: No user found, skipping data fetch');
    }
  }, [user]);

  // Also fetch data on component mount
  useEffect(() => {
    console.log('📊 Dashboard: Component mounted, checking for data fetch...');
    if (user) {
      console.log('📊 Dashboard: User available on mount, fetching data...');
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Dashboard: Starting data fetch...');
      console.log('📊 Dashboard: Current user:', user);
      console.log('📊 Dashboard: API Base URL:', 'http://192.168.1.112:5000/api');
      
      // Check if we have authentication data
      const token = await authUtils.getStoredToken();
      console.log('📊 Dashboard: Stored token exists:', !!token);
      console.log('📊 Dashboard: Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      
      setDashboardData(prev => ({ ...prev, isLoading: true }));

      // Test basic API connectivity first
      console.log('📊 Dashboard: Testing basic API connectivity...');
      try {
        const testResponse = await fetch('http://192.168.1.112:5000/api/health');
        console.log('📊 Dashboard: Health check response status:', testResponse.status);
        if (testResponse.ok) {
          const healthData = await testResponse.json();
          console.log('📊 Dashboard: Health check data:', healthData);
          console.log('📊 Dashboard: ✅ Backend is reachable');
        } else {
          console.log('📊 Dashboard: ❌ Backend health check failed with status:', testResponse.status);
        }
      } catch (healthError) {
        console.error('📊 Dashboard: ❌ Backend connection failed:', healthError);
        console.error('📊 Dashboard: This suggests network connectivity issues');
      }
      
      // Fetch appointments
      console.log('📊 Dashboard: Fetching appointments for authenticated user');
      const appointmentsResponse = await appointmentAPI.getAppointments();
      console.log('📊 Dashboard: Appointments response:', appointmentsResponse);

      // Fetch test results
      console.log('📊 Dashboard: Fetching test results...');
      const resultsResponse = await testResultsAPI.getMyTestResults();
      console.log('📊 Dashboard: Test results response:', resultsResponse);

      let upcomingCount = 0;
      let pastCount = 0;
      let totalCount = 0;
      let newResultsCount = 0;

      if (appointmentsResponse.success && appointmentsResponse.data?.data) {
        const appointments = appointmentsResponse.data.data;
        totalCount = appointments.length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        appointments.forEach((apt: any) => {
          const appointmentDate = new Date(apt.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          
          if (appointmentDate >= today && !['cancelled', 'completed', 'no-show'].includes(apt.status)) {
            upcomingCount++;
          } else {
            pastCount++;
          }
        });
      }

      if (resultsResponse.success && resultsResponse.data?.data) {
        const results = resultsResponse.data.data;
        newResultsCount = results.filter((result: any) => result.isNew).length;
      }

      const finalData = {
        upcomingAppointments: upcomingCount,
        pastAppointments: pastCount,
        totalAppointments: totalCount,
        newResults: newResultsCount,
        isLoading: false
      };

      console.log('📊 Dashboard: Final dashboard data:', finalData);
      setDashboardData(finalData);

    } catch (error: any) {
      console.error('📊 Dashboard: Error fetching data:', error);
      console.error('📊 Dashboard: Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status
      });
      setDashboardData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/(tabs)');
    }
  };

  // Update the navigation handler
  const handleNavigate = (route: string) => {
    try {
      // Remove the leading slash and (drawer) prefix for cleaner navigation
      const cleanRoute = route.replace('/', '').replace('(drawer)/', '');
      navigation.navigate(cleanRoute as never);
      
      // Debug log
      console.log('Navigating to:', cleanRoute);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#21AEA8" barStyle="light-content" />
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'Patient'
              }
            </ThemedText>
            <ThemedText style={styles.userRole}>Patient</ThemedText>
          </View>
        </View>
        <View style={styles.navbarRight}>
          <View style={styles.userAvatar}>
            <ThemedText style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'P'}
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stats Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <ThemedText style={styles.welcomeTitle}>
              Welcome back, {user?.firstName || user?.username || 'Patient'}!
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchDashboardData}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <ThemedText style={styles.refreshText}>Refresh</ThemedText>
              </TouchableOpacity>
              {__DEV__ && (
                <TouchableOpacity 
                  style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}
                  onPress={async () => {
                    console.log('🔧 Debug: Testing API connection...');
                    try {
                      const response = await fetch('http://192.168.1.112:5000/api/health');
                      const data = await response.json();
                      console.log('🔧 Debug: API Response:', data);
                      alert(`API Status: ${data.success ? 'Connected' : 'Failed'}`);
                    } catch (error: any) {
                      console.error('🔧 Debug: API Test Failed:', error);
                      alert(`API Test Failed: ${error?.message || 'Unknown error'}`);
                    }
                  }}
                >
                  <Ionicons name="bug" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.refreshText}>Test</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {dashboardData.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNumber}>{dashboardData.upcomingAppointments}</ThemedText>
                <ThemedText style={styles.statLabel}>Upcoming{'\n'}Appointments</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNumber}>{dashboardData.pastAppointments}</ThemedText>
                <ThemedText style={styles.statLabel}>Past{'\n'}Appointments</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNumber}>{dashboardData.totalAppointments}</ThemedText>
                <ThemedText style={styles.statLabel}>Total{'\n'}Appointments</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleNavigate('appointments')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.actionTitle}>Book Appointment</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Schedule your next lab test</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleNavigate('results')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.actionTitle}>View Results</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Check your latest test results</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleNavigate('mobile-lab')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="car" size={24} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.actionTitle}>Mobile Lab</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Check community visit schedule</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleNavigate('profile')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.actionTitle}>My Profile</ThemedText>
              <ThemedText style={styles.actionSubtitle}>View your profile</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Activities</ThemedText>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="flask" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>Blood Test Results Available</ThemedText>
              <ThemedText style={styles.activityDate}>September 2, 2025</ThemedText>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>Appointment Scheduled</ThemedText>
              <ThemedText style={styles.activityDate}>August 28, 2025</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#21AEA8', // Match navbar color to eliminate white line
    paddingTop: 0,
  },
  navbar: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 20,
    paddingTop: 50, // Increased to push content down from very top
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 16,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#21AEA8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  logoutButton: {
    padding: 6,
  },
  content: {
    flex: 1,
    backgroundColor: '#E8F5F3', // Light background for content area
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  welcomeCard: {
    backgroundColor: '#21AEA8',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  welcomeContent: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    backgroundColor: '#21AEA8',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityIcon: {
    backgroundColor: '#21AEA8',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#718096',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
});
