import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { ThemedText } from "@/components/ThemedText";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="howto"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "help-circle" : "help-circle-outline"}
              color={color}
            ></TabBarIcon>
          ),
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              color={color}
            ></TabBarIcon>
          ),
        }}
      ></Tabs.Screen>

      <Tabs.Screen
        name="widgets"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "square" : "square-outline"}
              color={color}
            ></TabBarIcon>
          ),
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}
