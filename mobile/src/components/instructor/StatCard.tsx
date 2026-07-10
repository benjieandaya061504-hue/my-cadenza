import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  icon?: React.ReactNode | null;
  label: string;
  value: number;
}

export default function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#8A8A8A',
    marginBottom: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
