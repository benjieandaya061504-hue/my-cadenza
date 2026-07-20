import { TextInput } from "react-native";

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
      className="mb-2 rounded-lg border border-[#ddd] p-3"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
}