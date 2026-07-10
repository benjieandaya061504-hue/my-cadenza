import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

interface TodayLessonCardProps {
  studentName: string;
  studentLevel: string;
  time: string;
  location?: string;
  buttonText?: string;
  onAttend?: () => void;
}

export default function TodayLessonCard({
  studentName,
  studentLevel,
  time,
  location,
  buttonText = 'Attend',
  onAttend,
}: TodayLessonCardProps) {
  const avatarColors = [
    '#E8D5F2',
    '#D6EAF8',
    '#D5F5E3',
    '#FDEBD0',
    '#FADBD8',
  ];

  const avatarColor =
    avatarColors[studentName.length % avatarColors.length];

  const initial = studentName?.trim()?.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.studentName}>{studentName}</Text>

        <Text style={styles.studentLevel}>{studentLevel}</Text>

        <Text style={styles.time}>{time}</Text>

        {location ? (
          <Text style={styles.location}>{location}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E8E8E8',

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Android Shadow
    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B4B8A',
  },

  content: {
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  studentLevel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },

  time: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },

  location: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  attendButton: {
    backgroundColor: '#667ef9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginLeft: 12,
  },

  attendButtonPressed: {
    opacity: 0.8,
  },

  attendButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },

  attendButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});