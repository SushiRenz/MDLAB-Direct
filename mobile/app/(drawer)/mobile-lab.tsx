import AppHeader from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import MobileLabMap from '@/components/MobileLabMap';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { mobileLabAPI, MobileLabSchedule } from '@/services/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MobileLabScreen() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileLabError, setMobileLabError] = useState(false);
  const [weekSchedule, setWeekSchedule] = useState<MobileLabSchedule[]>([]);

  useEffect(() => {
    fetchMobileLabData();
  }, []);

  const fetchMobileLabData = async () => {
    try {
      setLoading(true);
      setMobileLabError(false);
      
      // Fetch current week schedule
      const weekResponse = await mobileLabAPI.getCurrentWeekSchedule();
      if (weekResponse.success && weekResponse.data) {
        setWeekSchedule(weekResponse.data);
      }
    } catch (error) {
      console.error('Error fetching mobile lab data:', error);
      setMobileLabError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMobileLabData();
    setRefreshing(false);
  };

  const formatTimeSlot = (schedule: MobileLabSchedule) => {
    if (schedule.timeSlot) {
      return `${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`;
    }
    return 'Time not available';
  };

  const getScheduleForDay = (dayIndex: number) => {
    return weekSchedule.find(schedule => schedule.dayOfWeek === dayIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#21AEA8" barStyle="light-content" />
      <AppHeader />
      
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <ThemedText style={styles.pageTitle}>Mobile Lab Service</ThemedText>
          <ThemedText style={styles.pageSubtitle}>Mobile laboratory services in your community</ThemedText>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#21AEA8']}
              tintColor="#21AEA8"
            />
          }
        >
          <View style={styles.mainContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#21AEA8" />
              <ThemedText style={styles.loadingText}>Loading schedules...</ThemedText>
            </View>
          ) : (
            <>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <ThemedText style={styles.heroTitle}>Mobile Laboratory Service</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Bringing quality healthcare to communities across Nueva Vizcaya
                </ThemedText>
                <TouchableOpacity 
                  style={styles.scheduleButton}
                  onPress={() => setShowScheduleModal(true)}
                >
                  <Ionicons name="calendar" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.scheduleButtonText}>View Full Schedule</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Map Section */}
              <View style={styles.mapSection}>
                <ThemedText style={styles.mapTitle}>Our Coverage Area</ThemedText>
                <ThemedText style={styles.mapSubtitle}>Serving communities throughout Nueva Vizcaya</ThemedText>
                <MobileLabMap schedules={weekSchedule} />
              </View>

              {/* Available Schedule Section */}
              <View style={styles.scheduleSection}>
                <ThemedText style={styles.sectionTitle}>Available Schedule</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Find us in different barangays throughout the week
                </ThemedText>
                
                {mobileLabError ? (
                  <View style={styles.errorState}>
                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                    <ThemedText style={styles.errorText}>Unable to load schedules</ThemedText>
                    <TouchableOpacity 
                      style={styles.retryButton} 
                      onPress={fetchMobileLabData}
                    >
                      <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : weekSchedule.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={64} color="#94a3b8" />
                    <ThemedText style={styles.emptyTitle}>No Schedules Available</ThemedText>
                    <ThemedText style={styles.emptyText}>
                      Check back soon for upcoming mobile lab visits to your area
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.scheduleTimeline}>
                    {weekSchedule.map((schedule, index) => (
                      <View key={schedule._id} style={styles.timelineItem}>
                        <View style={styles.timelineMarker}>
                          <View style={styles.markerDot} />
                          {index < weekSchedule.length - 1 && <View style={styles.markerLine} />}
                        </View>
                        <View style={styles.timelineContent}>
                          <ThemedText style={styles.timelineDay}>
                            {DAYS_OF_WEEK[schedule.dayOfWeek]}
                          </ThemedText>
                          <View style={styles.timelineCard}>
                            <View style={styles.cardIcon}>
                              <Ionicons name="location" size={24} color="#21AEA8" />
                            </View>
                            <View style={styles.cardDetails}>
                              <ThemedText style={styles.cardLocationName}>
                                {schedule.location?.name}
                              </ThemedText>
                              <View style={styles.detailRow}>
                                <Ionicons name="time" size={14} color="#718096" />
                                <ThemedText style={styles.detailText}>
                                  {formatTimeSlot(schedule)}
                                </ThemedText>
                              </View>
                              <View style={styles.detailRow}>
                                <Ionicons name="pin" size={14} color="#718096" />
                                <ThemedText style={styles.detailText}>
                                  {schedule.location?.barangay}
                                  {schedule.location?.municipality && `, ${schedule.location?.municipality}`}
                                </ThemedText>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      </View>

      {/* Full Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Mobile Lab Schedule</ThemedText>
              <TouchableOpacity 
                onPress={() => setShowScheduleModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.scheduleDetailsSection}>
                <ThemedText style={styles.sectionHeader}>Schedule Information</ThemedText>
                
                {weekSchedule.length > 0 ? (
                  <View style={styles.scheduleList}>
                    {weekSchedule.map((schedule, index) => (
                      <View key={index} style={styles.scheduleItemDetailed}>
                        <View style={styles.scheduleHeaderDetailed}>
                          <View style={styles.scheduleDayBadge}>
                            <ThemedText style={styles.scheduleDayBadgeText}>
                              {DAYS_OF_WEEK[schedule.dayOfWeek]}
                            </ThemedText>
                          </View>
                          <ThemedText style={styles.scheduleItemTitle}>
                            {schedule.location.name}
                          </ThemedText>
                        </View>

                        <View style={styles.scheduleInfoGrid}>
                          {/* Row 1: Time and Location */}
                          <View style={styles.infoRow}>
                            <View style={styles.infoItemHalf}>
                              <Ionicons name="time" size={18} color="#21AEA8" style={styles.infoIcon} />
                              <View style={styles.infoItemContent}>
                                <ThemedText style={styles.infoLabel}>TIME</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                  {formatTimeSlot(schedule)}
                                </ThemedText>
                              </View>
                            </View>

                            <View style={styles.infoItemHalf}>
                              <Ionicons name="location" size={18} color="#21AEA8" style={styles.infoIcon} />
                              <View style={styles.infoItemContent}>
                                <ThemedText style={styles.infoLabel}>LOCATION</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                  {schedule.location.barangay}, {schedule.location.municipality}
                                </ThemedText>
                              </View>
                            </View>
                          </View>

                          {/* Row 2: Coordinates and Contact Phone */}
                          <View style={styles.infoRow}>
                            {schedule.location.coordinates && (
                              <View style={styles.infoItemHalf}>
                                <Ionicons name="map" size={18} color="#21AEA8" style={styles.infoIcon} />
                                <View style={styles.infoItemContent}>
                                  <ThemedText style={styles.infoLabel}>COORDINATES</ThemedText>
                                  <ThemedText style={styles.infoValue}>
                                    {schedule.location.coordinates.lat.toFixed(4)}°N, {schedule.location.coordinates.lng.toFixed(4)}°E
                                  </ThemedText>
                                </View>
                              </View>
                            )}

                            {schedule.contactInfo?.phone && (
                              <View style={styles.infoItemHalf}>
                                <Ionicons name="call" size={18} color="#21AEA8" style={styles.infoIcon} />
                                <View style={styles.infoItemContent}>
                                  <ThemedText style={styles.infoLabel}>CONTACT PHONE</ThemedText>
                                  <ThemedText style={styles.infoValue}>
                                    {schedule.contactInfo.phone}
                                  </ThemedText>
                                </View>
                              </View>
                            )}
                          </View>

                          {/* Row 3: Contact Person (Full Width if exists) */}
                          {schedule.contactInfo?.contactPerson && (
                            <View style={styles.infoItemFull}>
                              <Ionicons name="person" size={18} color="#21AEA8" style={styles.infoIcon} />
                              <View style={styles.infoItemContent}>
                                <ThemedText style={styles.infoLabel}>CONTACT PERSON</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                  {schedule.contactInfo.contactPerson}
                                </ThemedText>
                              </View>
                            </View>
                          )}

                          {/* Row 4: Notes (Full Width) */}
                          {schedule.notes && (
                            <View style={styles.infoItemFull}>
                              <Ionicons name="document-text" size={18} color="#21AEA8" style={styles.infoIcon} />
                              <View style={styles.infoItemContent}>
                                <ThemedText style={styles.infoLabel}>NOTES</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                  {schedule.notes}
                                </ThemedText>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptySchedule}>
                    <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                    <ThemedText style={styles.emptyScheduleText}>
                      No mobile lab schedules are currently available.
                    </ThemedText>
                    <ThemedText style={styles.contactText}>
                      Please contact us for more information about upcoming visits.
                    </ThemedText>
                  </View>
                )}
              </View>
            </ScrollView>
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
  mainContent: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#718096',
  },
  // Hero Section
  heroSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#21AEA8',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  scheduleButton: {
    backgroundColor: '#21AEA8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#21AEA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Map Section
  mapSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  // Schedule Section
  scheduleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  // Error State
  errorState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Timeline
  scheduleTimeline: {
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineMarker: {
    alignItems: 'center',
    width: 20,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#21AEA8',
    marginTop: 8,
  },
  markerLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#cbd5e1',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginBottom: 16,
  },
  timelineDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#21AEA8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#21AEA8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    backgroundColor: '#E6FFFA',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  cardLocationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#718096',
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
    padding: 0,
    width: '100%',
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingBottom: 20,
  },
  scheduleDetailsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  scheduleList: {
    gap: 16,
  },
  scheduleItemDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#21AEA8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleHeaderDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scheduleDayBadge: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scheduleDayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scheduleItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  scheduleInfoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItemHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    minHeight: 80,
  },
  infoItemFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoItemContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#21AEA8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  emptySchedule: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyScheduleText: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  contactText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
});
