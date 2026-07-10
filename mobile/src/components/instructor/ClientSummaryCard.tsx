// components/instructor/ClientSummaryCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AssignedClient } from '../../../.expo/types/instructor';

interface Props {
  client: AssignedClient;
}

export default function ClientSummaryCard({ client }: Props) {
  const progressLabel = `${client.completedSessions}/${client.totalSessions} sessions`;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {client.avatarUrl ? (
          <Image source={{ uri: client.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {client.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.course}>{client.course}</Text>
        </View>

        <Badge label={client.package} />
      </View>

      <Text style={styles.progress}>{progressLabel}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    backgroundColor: '#5B4FCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  course: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  progress: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 10,
  },
});