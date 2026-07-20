import { Pressable, Text } from "react-native";

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
      className={`items-center rounded-lg px-4 py-3 ${
        isOutline ? "border border-[#063970] bg-transparent" : "bg-[#063970]"
      }`}
      onPress={onPress}
    >
      <Text className={isOutline ? "text-[#063970]" : "text-white"}>
        {title}
      </Text>
    </Pressable>
  );
}
