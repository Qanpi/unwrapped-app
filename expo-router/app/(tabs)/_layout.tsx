import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Settings,
} from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Link, Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { H4, useTheme, XStack } from "tamagui";

export function HeaderDropdown({ children }) {
  const toast = useToastController();

  return (
    <XStack
      hitSlop={20}
      onPress={() => toast.show("Support for other services is coming soon...")}
      alignItems="center"
      gap="$1"
    >
      <ChevronDown></ChevronDown>
      <H4>WhatsApp</H4>
    </XStack>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerTitle: (props) => <HeaderDropdown {...props}></HeaderDropdown>,
        headerRight: () => (
          <Link href="/settings" asChild>
            <TouchableOpacity>
              <Settings mr="$3"></Settings>
            </TouchableOpacity>
          </Link>
        ),
        tabBarActiveTintColor: "$purple7",
      }}
    >
      <Tabs.Screen
        name="howto"
        options={{
          title: "How to",
          tabBarIcon: ({ color, focused, size }) => (
            <HelpCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color}></MessageCircle>
          ),
        }}
      />
    </Tabs>
  );
}
