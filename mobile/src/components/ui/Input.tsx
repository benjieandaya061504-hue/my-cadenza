import { StyleSheet, TextInput } from "react-native";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function Input({
  placeholder,
  value,
  onChangeText,
}: InputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
});