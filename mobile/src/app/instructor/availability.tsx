import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Instructor Availability Module
 *
 * This module displays the instructor's profile information stored in the
 * centralized database, including:
 * - Instructor's name
 * - Specialization (e.g., guitar, piano, vocal)
 * - Assigned teaching schedules
 *
 * Within this interface, instructors can:
 * - View and manage their available time slots for teaching
 * - Define their specializations
 * - Update their schedules
 *
 * The module presents the schedule in a structured format, allowing instructors
 * to set, update, or adjust their availability based on their preferred teaching
 * hours. The updated availability serves as the basis for lesson scheduling,
 * allowing the system to match instructors with appropriate lesson requests and
 * ensure proper coordination of schedules.
 *
 * STI College Koronadal
 */

interface InstructorProfile {
  name: string;
  specialization: string[];
  availableTimeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function AvailabilityPage() {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInstructorProfile();
  }, []);

  const loadInstructorProfile = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Fetch instructor profile from backend
      const mockProfile: InstructorProfile = {
        name: 'Mr. Jean Cruz',
        specialization: ['Guitar', 'Piano', 'Vocal'],
        availableTimeSlots: [
          {
            id: '1',
            day: 'Monday',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            isAvailable: true,
          },
          {
            id: '2',
            day: 'Tuesday',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            isAvailable: true,
          },
          {
            id: '3',
            day: 'Wednesday',
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            isAvailable: true,
          },
          {
            id: '4',
            day: 'Thursday',
            startTime: '02:00 PM',
            endTime: '05:00 PM',
            isAvailable: true,
          },
          {
            id: '5',
            day: 'Friday',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            isAvailable: true,
          },
        ],
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to load instructor profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInstructorProfile();
    setRefreshing(false);
  }, []);

  const toggleTimeSlot = (id: string) => {
    if (!profile) return;

    const updatedSlots = profile.availableTimeSlots.map((slot) =>
      slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
    );

    setProfile({
      ...profile,
      availableTimeSlots: updatedSlots,
    });

    // TODO: Update availability in backend
    console.log('Updated availability for slot:', id);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Instructor Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Instructor Profile</Text>
          <View style={styles.profileCard}>
            <Text style={styles.instructorName}>{profile.name}</Text>
            <Text style={styles.label}>Specializations:</Text>
            <View style={styles.specializationContainer}>
              {profile.specialization.map((spec, index) => (
                <View key={index} style={styles.specializationBadge}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Availability Schedule Section */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Teaching Schedule</Text>
          <Text style={styles.scheduleDescription}>
            Manage your available time slots for teaching. Toggle to set or
            update your availability based on your preferred teaching hours.
          </Text>

          {profile.availableTimeSlots.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.timeSlotCard,
                !slot.isAvailable && styles.timeSlotCardDisabled,
              ]}
            >
              <View style={styles.timeSlotInfo}>
                <Text style={styles.dayText}>{slot.day}</Text>
                <Text style={styles.timeText}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  slot.isAvailable && styles.toggleButtonActive,
                ]}
                onPress={() => toggleTimeSlot(slot.id)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    slot.isAvailable && styles.toggleButtonTextActive,
                  ]}
                >
                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#8A8A8A',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#D32F2F',
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#0288D1',
  },
  specializationText: {
    fontSize: 12,
    color: '#0288D1',
    fontWeight: '600',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  timeSlotCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  timeSlotCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  timeSlotInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  toggleButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});