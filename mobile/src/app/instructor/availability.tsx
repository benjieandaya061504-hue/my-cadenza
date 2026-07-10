import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";



export default function AvailabilityPage() {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Availability</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: "JakartaBold",
    fontSize: 16,
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});