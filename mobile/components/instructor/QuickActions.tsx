// components/instructor/QuickActions.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../ui/Button';

export default function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      <View style={styles.cell}>
        <Button
          title="View Attendance"
          onPress={() => router.push('/instructor/attendance?mode=view')}
        />
      </View>
      <View style={styles.cell}>
        <Button
          title="Record Attendance"
          onPress={() => router.push('/instructor/attendance?mode=record')}
        />
      </View>
      <View style={styles.cell}>
        <Button
          title="Lesson Progress"
          onPress={() => router.push('/instructor/progress')}
        />
      </View>
      <View style={styles.cell}>
        <Button
          title="View History"
          variant="outline"
          onPress={() => router.push('/instructor/progress')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  cell: {
    width: '48%',
    marginBottom: 12,
  },
});