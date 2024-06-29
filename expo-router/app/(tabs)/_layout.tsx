import { Link, Tabs } from "expo-router";
import {
  Adapt,
  Button,
  ButtonIcon,
  getFontSizeToken,
  H1,
  H3,
  H4,
  H6,
  Paragraph,
  Popover,
  Select,
  SelectIcon,
  Sheet,
  Text,
  useTheme,
  View,
  XStack,
} from "tamagui";
import {
  HelpCircle,
  Atom,
  AudioWaveform,
  MessageCircle,
  Settings,
  ChevronDown,
} from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useToastController } from "@tamagui/toast";
import { tokens } from "@tamagui/config/v3";

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
            <Settings mr="$3"></Settings>
          </Link>
        ),
        tabBarActiveTintColor: theme.red10.val,
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
