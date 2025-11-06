import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Linking, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ThemedText } from './themed-text';
import { Ionicons } from '@expo/vector-icons';
import { MobileLabSchedule } from '@/services/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface MobileLabMapProps {
  schedules: MobileLabSchedule[];
}

const MobileLabMap: React.FC<MobileLabMapProps> = ({ schedules = [] }) => {
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  // Center map on Nueva Vizcaya
  const mapCenter = {
    latitude: 16.3791,
    longitude: 121.1503,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  // Filter schedules with valid coordinates
  const validSchedules = schedules.filter(
    schedule =>
      schedule.location?.coordinates?.lat &&
      schedule.location?.coordinates?.lng
  );

  // Calculate map region based on schedules
  const getMapRegion = () => {
    if (validSchedules.length === 0) {
      return mapCenter;
    }

    if (validSchedules.length === 1) {
      const schedule = validSchedules[0];
      return {
        latitude: schedule.location.coordinates!.lat,
        longitude: schedule.location.coordinates!.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Calculate average position for multiple markers
    const avgLat =
      validSchedules.reduce((sum, s) => sum + s.location.coordinates!.lat, 0) /
      validSchedules.length;
    const avgLng =
      validSchedules.reduce((sum, s) => sum + s.location.coordinates!.lng, 0) /
      validSchedules.length;

    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    };
  };

  // Open Google Maps with directions
  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const formatTimeSlot = (schedule: MobileLabSchedule) => {
    if (schedule.timeSlot) {
      return `${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`;
    }
    return 'Time not available';
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {validSchedules.map((schedule, index) => (
            <Marker
              key={schedule._id || index}
              coordinate={{
                latitude: schedule.location.coordinates!.lat,
                longitude: schedule.location.coordinates!.lng,
              }}
              title={schedule.location.name}
              description={`${schedule.location.barangay}, ${schedule.location.municipality}`}
              onPress={() => setSelectedSchedule(schedule._id)}
            />
          ))}
        </MapView>
      </View>

      {/* Legend */}
      {validSchedules.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendMarker} />
            <ThemedText style={styles.legendText}>
              Tap location cards for details and directions
            </ThemedText>
          </View>
        </View>
      )}

      {/* Location Cards */}
      {validSchedules.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
        >
          {validSchedules.map((schedule, index) => (
            <TouchableOpacity
              key={schedule._id || index}
              style={[
                styles.locationCard,
                selectedSchedule === schedule._id && styles.locationCardExpanded,
              ]}
              onPress={() =>
                setSelectedSchedule(
                  selectedSchedule === schedule._id ? null : schedule._id
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="location" size={32} color="#21AEA8" />
                  </View>
                  <View style={styles.cardMarkerLabel}>
                    <ThemedText style={styles.cardMarkerText}>
                      {String.fromCharCode(65 + index)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <ThemedText style={styles.cardTitle}>
                    {schedule.location.name}
                  </ThemedText>
                  <View style={styles.cardRow}>
                    <ThemedText style={styles.cardEmoji}>📍</ThemedText>
                    <ThemedText style={styles.cardText}>
                      {schedule.location.barangay}, {schedule.location.municipality}
                    </ThemedText>
                  </View>
                  <View style={styles.cardRow}>
                    <ThemedText style={styles.cardEmoji}>🕒</ThemedText>
                    <ThemedText style={styles.cardText}>
                      {formatTimeSlot(schedule)}
                    </ThemedText>
                  </View>
                  <View style={styles.cardRow}>
                    <ThemedText style={styles.cardEmoji}>📅</ThemedText>
                    <ThemedText style={styles.cardText}>
                      {DAYS_OF_WEEK[schedule.dayOfWeek]}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {selectedSchedule === schedule._id && (
                <View style={styles.expandedDetails}>
                  {schedule.contactInfo?.phone && (
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={16} color="#21AEA8" />
                      <ThemedText style={styles.contactText}>
                        {schedule.contactInfo.phone}
                      </ThemedText>
                    </View>
                  )}
                  {schedule.notes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="information-circle" size={16} color="#F59E0B" />
                      <ThemedText style={styles.notesText}>
                        {schedule.notes}
                      </ThemedText>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() =>
                      openDirections(
                        schedule.location.coordinates!.lat,
                        schedule.location.coordinates!.lng
                      )
                    }
                  >
                    <Ionicons name="map" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.directionsButtonText}>
                      Get Directions
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noSchedules}>
          <Ionicons name="location-outline" size={48} color="#94a3b8" />
          <ThemedText style={styles.noSchedulesText}>
            No mobile lab schedules at this time. Check back soon!
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mapContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  legend: {
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#21AEA8',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#21AEA8',
  },
  legendText: {
    fontSize: 13,
    color: '#0F766E',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardsContent: {
    gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    width: Dimensions.get('window').width - 48,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#21AEA8',
  },
  locationCardExpanded: {
    borderColor: '#21AEA8',
    borderWidth: 2,
    minHeight: 300,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  cardIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMarkerLabel: {
    position: 'absolute',
    top: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#21AEA8',
  },
  cardMarkerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#21AEA8',
  },
  cardDetails: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardEmoji: {
    fontSize: 14,
  },
  cardText: {
    fontSize: 13,
    color: '#718096',
    flex: 1,
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '500',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  notesText: {
    fontSize: 13,
    color: '#78350F',
    flex: 1,
    lineHeight: 18,
  },
  directionsButton: {
    backgroundColor: '#21AEA8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
    shadowColor: '#21AEA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 4,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noSchedules: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSchedulesText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});

export default MobileLabMap;
