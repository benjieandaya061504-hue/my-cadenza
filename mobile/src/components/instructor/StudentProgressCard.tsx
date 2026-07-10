import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StudentProgressCardProps {
  name: string;
  progress: number; // 0-100
}

export default function StudentProgressCard({ name, progress }: StudentProgressCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.progressText}>{progress}% complete</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0E8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0288D1',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
});
