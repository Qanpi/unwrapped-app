import { ThemedText } from "@/components/ThemedText";
import { Text } from "@rneui/themed";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { common } from ".";

export default function HowToScreen() {
  return (
    <SafeAreaView style={common.topLevelView}>
      <Text style={common.subtitle}>Get started</Text>
    </SafeAreaView>
  );
}
