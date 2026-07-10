import Button from "@/components/ui/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function LoginPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.card}>
        <Button
          title="Client"
          onPress={() => "Clicked"}
        />

        <View style={{ height: 10 }} />

        <Button
          title="Instructor"
          onPress={() => router.push("/instructor/dashboard")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
});
