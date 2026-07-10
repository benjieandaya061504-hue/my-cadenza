import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TodayLessonCardProps {
  studentName: string;
  studentLevel: string;
  time: string;
  location?: string;
  onAttend?: () => void;
}

export default function TodayLessonCard({
  studentName,
  studentLevel,
  time,
  location,
  onAttend,
}: TodayLessonCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{studentName.charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.studentLevel}>{studentLevel}</Text>
        <Text style={styles.time}>{time}</Text>
        {location && <Text style={styles.location}>{location}</Text>}
      </View>
      <TouchableOpacity style={styles.attendButton} onPress={onAttend}>
        <Text style={styles.attendButtonText}>Attend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8D5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7D5BA6',
  },
  content: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  studentLevel: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  location: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  attendButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  attendButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
