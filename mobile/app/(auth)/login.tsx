import { View, Text, Pressable, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

import { login } from "../../services/authService";
import { saveUser } from "../../services/authStorage";


export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {

    if (!email || !password) {

      Alert.alert(
        "Required",
        "Email and password are required"
      );

      return;
    }

    try {

      setLoading(true);

      const data = await login(
        email.trim(),
        password
      );

      const user = data.user;

      if (!user) {

        Alert.alert(
          "Login Failed",
          "Invalid response from server"
        );

        return;

      }

      // Save logged in user
      await saveUser(user);

      const role = user.role?.toLowerCase();

      switch(role) {

        case "instructor":

          router.replace("/instructor");
          break;

        case "student":

          router.replace("/student");
          break;

        default:

          Alert.alert(
            "Access Denied",
            "This account cannot access the mobile application"
          );

          break;

      }

    } catch (error) {

      const message =
        error?.response?.data?.error ||
        "Invalid email or password";


      Alert.alert(
        "Login Failed",
        message
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <View className="flex-1 justify-center px-6 bg-[#F8FAFC]">

      <View className="mb-8">

        <Text className="text-4xl font-bold text-[#063970]">
          Cadenza
        </Text>

        <Text className="mt-2 text-base text-[#64748B]">
          Welcome back! Login to continue.
        </Text>

      </View>

      <View className="gap-4">


        <Input

          placeholder="Email"

          value={email}

          onChangeText={setEmail}

          autoCapitalize="none"

          keyboardType="email-address"

        />

        <View>

          <View className="mb-2 flex-row justify-between px-1">

            <Text className="text-sm font-medium text-[#334155]">

              Password

            </Text>

            <Pressable>

              <Text className="text-sm font-medium text-[#063970]">

                Forgot password?

              </Text>

            </Pressable>

          </View>

          <Input

            placeholder="Password"

            value={password}

            onChangeText={setPassword}

            secureTextEntry

          />

        </View>
        <Button onPress={handleLogin}>

          {loading ? "Loading..." : "Login"}


        </Button>



      </View>



    </View>

  );

}