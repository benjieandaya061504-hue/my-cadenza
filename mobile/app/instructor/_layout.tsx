import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { fonts } from "../../themes/fonts";

const INSTRUCTOR_NAME = "Terter";

function CustomDrawerContent(props: any) {
  const handleLogout = () => {
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
              fontFamily: fonts.bold,
              fontSize: 16,
              color: "#222",
            }}
          >
            {INSTRUCTOR_NAME}
          </Text>

          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: 13,
              color: "#888",
            }}
          >
            Instructor
          </Text>
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

      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Pressable onPress={handleLogout}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="red" />

            <Text
              style={{
                marginLeft: 10,
                fontFamily: fonts.bold,
                color: "red",
                fontSize: 14,
              }}
            >
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
            drawerIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="availability"
          options={{
            title: "Availability",
            drawerIcon: ({ color }) => (
              <Ionicons name="time-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="attendance"
          options={{
            title: "Attendance",
            drawerIcon: ({ color }) => (
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
            drawerIcon: ({ color }) => (
              <Ionicons name="bar-chart-outline" size={20} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="schedule"
          options={{
            title: "Schedule",
            drawerIcon: ({ color }) => (
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
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.15)",
          }}
          onPress={() => setVisible(false)}
        >
          <View
            onStartShouldSetResponder={() => true}
            style={{
              position: "absolute",
              top: 60,
              right: 15,
              width: 260,
              backgroundColor: "#fff",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,

              // Android
              elevation: 6,

              // iOS
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 16,
                marginBottom: 10,
              }}
            >
              Notifications
            </Text>

            {notifications.length === 0 ? (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: "#888",
                }}
              >
                No notifications
              </Text>
            ) : (
              notifications.map((item, index) => (
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
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#667ef9"
                    style={{ marginRight: 10 }}
                  />

                  <Text
                    style={{
                      flex: 1,
                      fontFamily: fonts.regular,
                      fontSize: 14,
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
