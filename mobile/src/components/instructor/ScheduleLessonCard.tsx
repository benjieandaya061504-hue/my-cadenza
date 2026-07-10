// components/instructor/ScheduleLessonCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ScheduledLesson } from '../../../.expo/types/instructor';

interface Props {
  lesson: ScheduledLesson;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: '#3B82F6',
  in_progress: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ScheduleLessonCard({ lesson }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>
          {lesson.startTime} – {lesson.endTime}
        </Text>
        <Badge
          label={STATUS_LABELS[lesson.status]}
          color={STATUS_COLORS[lesson.status]}
        />
      </View>

      <Text style={styles.clientName}>{lesson.clientName}</Text>
      <Text style={styles.course}>{lesson.course}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.meta}>📅 {lesson.date}</Text>
        <Text style={styles.meta}>🏠 {lesson.studioRoom}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    minWidth: 220,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
  },
  course: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  meta: {
    fontSize: 12,
    color: '#8A8A8A',
  },
});