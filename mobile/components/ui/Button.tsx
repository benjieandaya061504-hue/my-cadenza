import { Pressable, StyleSheet, Text } from "react-native";

type ButtonVariant = "primary" | "outline";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
}: ButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      style={[styles.button, isOutline && styles.buttonOutline]}
      onPress={onPress}
    >
      <Text style={[styles.text, isOutline && styles.textOutline]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#063970",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#063970",
  },

  text: {
    color: "#fff",
  },

  textOutline: {
    color: "#063970",
  },
});