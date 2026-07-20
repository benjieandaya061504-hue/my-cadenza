import Button from "../../components/ui/Button";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function LoginPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-5 text-3xl font-bold text-center">Login</Text>

      <View className="w-full rounded-[20px] bg-white p-[30px]">
        <Button title="Client" onPress={() => "Clicked"} />

        <View className="h-2.5" />

        <Button
          title="Instructor"
          onPress={() => router.push("/instructor/dashboard")}
        />
      </View>
    </View>
  );
}
