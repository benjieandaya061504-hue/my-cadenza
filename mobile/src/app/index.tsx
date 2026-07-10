import Login from "@/app/auth/login";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
        <Login></Login>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
