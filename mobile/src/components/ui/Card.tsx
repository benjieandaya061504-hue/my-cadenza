import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
});