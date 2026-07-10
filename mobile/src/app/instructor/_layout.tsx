import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
} from "expo-router/drawer";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

const INSTRUCTOR_NAME = "Terter";

function CustomDrawerContent(props: any) {
  const handleLogout = () => {
    // TODO: clear auth/session state here if you have any (tokens, context, etc.)
    router.replace("/auth/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          <Ionicons name="person-circle-outline" size={56} color="#333" />
          <Text
            style={{
              marginTop: 8,
              fontSize: 16,
              fontWeight: "700",
              color: "#222",
            }}
          >
            {INSTRUCTOR_NAME}
          </Text>
          <Text style={{ fontSize: 13, color: "#888" }}>Instructor</Text>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: "#ddd",
            marginHorizontal: 20,
            marginBottom: 8,
          }}
        />

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={{ padding: 20, borderTopWidth: 1, borderColor: "#ddd" }}>
        <Pressable onPress={handleLogout}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text style={{ marginLeft: 10, color: "red", fontWeight: "600" }}>
              Logout
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const notifications = [
  { text: "Nagmahal" },
  { text: "Nasaktan" },
  { text: "Naghiking" },
];

export default function InstructorLayout() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Drawer
        screenOptions={{
          headerRight: () => (
            <Pressable
              onPress={() => setVisible(true)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </Pressable>
          ),
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="profile"
          options={{
            title: "Instructor Profile",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="person-circle-outline" size={20} color={color} />
            ),
            drawerItemStyle: { display: "none" },
          }}
        />

        <Drawer.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="grid-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="availability"
          options={{
            title: "Availability",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="time-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="attendance"
          options={{
            title: "Attendance",
            drawerIcon: ({ size, color }) => (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={color}
              />
            ),
          }}
        />

        <Drawer.Screen
          name="progress"
          options={{
            title: "Progress Tracking",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="bar-chart-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="schedule"
          options={{
            title: "Schedule",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="calendar-outline" size={20} color={color} />
            ),
          }}
        />
      </Drawer>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable onPress={() => setVisible(false)} style={{ flex: 1 }}>
          <Pressable
            style={{
              position: "absolute",
              top: 60,
              right: 15,
              width: 260,
              backgroundColor: "#fff",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
            >
              Notifications
            </Text>

            {notifications.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text style={{ flexShrink: 1 }}>{item.text}</Text>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}