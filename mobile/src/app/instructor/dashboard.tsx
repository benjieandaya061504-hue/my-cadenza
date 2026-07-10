// app/instructor/dashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../../themes/fonts';

import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatCard from '../../components/instructor/StatCard';
import TodayLessonCard from '../../components/instructor/TodayLessonCard';
import StudentProgressCard from '../../components/instructor/StudentProgressCard';

import { getInstructorDashboard } from '../../sevices/instructor.service';
import type { InstructorDashboardData } from '../../types/instructor.ts';

export default function InstructorDashboardScreen() {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const result = await getInstructorDashboard();
      setData(result);
    } catch (err) {
      setError('Unable to load your dashboard. Please try again.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDashboard();
      setLoading(false);
    })();
  }, [fetchDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <ErrorMessage message={error ?? 'Something went wrong.'} onRetry={fetchDashboard} />
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
        {/* Greeting */}
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.instructorName}>{data.instructorName}</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="ASSIGNED STUDENTS"
            value={data.stats.assignedStudents}
            icon={null}
          />
          <StatCard
            label="TODAY'S SESSIONS"
            value={data.stats.todaySessions}
            icon={null}
          />
        </View>

        {/* Today's Lessons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S LESSONS</Text>
        </View>
        {data.todaySchedule.length === 0 ? (
          <Text style={styles.emptyText}>No lessons scheduled for today.</Text>
        ) : (
          data.todaySchedule.map((lesson) => (
            <TodayLessonCard
              key={lesson.id}
              studentName={lesson.studentName}
              studentLevel={lesson.studentLevel}
              time={lesson.time}
              location={lesson.location}
              onAttend={() => console.log('Attend:', lesson.id)}
            />
          ))
        )}

        {/* Student Progress Overview */}
        <Text style={styles.sectionTitle}>STUDENT PROGRESS OVERVIEW</Text>
        {data.studentProgress.length === 0 ? (
          <Text style={styles.emptyText}>No progress data available.</Text>
        ) : (
          data.studentProgress.map((student) => (
            <StudentProgressCard
              key={student.id}
              name={student.name}
              progress={student.progress}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  greeting: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#8A8A8A',
  },

  instructorName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -6,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  markAttendanceBtn: {
    backgroundColor: '#667ef9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },

  markAttendanceBtnText: {
    fontFamily: fonts.bold,
    color: '#FFF',
    fontSize: 12,
  },

  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 8,
  },
});