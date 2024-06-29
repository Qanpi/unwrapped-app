import { Circle, SlidersHorizontal } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Card,
  H4,
  Paragraph,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

function WrappedCard() {
  return (
    <Card minWidth={400} height="200" backgroundColor="green" mx={50}>
      <Card.Header>
        <H4>01 0 10 01 </H4>
      </Card.Header>
    </Card>
  );
}

function ChatScreen() {
  const local = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: local.name }} />

      <YStack flex={1} justifyContent="center" alignItems="center" py="$5">
        <ScrollView horizontal snapToInterval={500} decelerationRate={0.85}>
          <WrappedCard></WrappedCard>
          <WrappedCard></WrappedCard>
          <WrappedCard></WrappedCard>
          <WrappedCard></WrappedCard>
          <WrappedCard></WrappedCard>
          <WrappedCard></WrappedCard>
        </ScrollView>

        <XStack>
          <Button minHeight={"$7"} chromeless flexDirection="column">
            <Circle fill="yellow"></Circle>
            <Paragraph>Theme</Paragraph>
          </Button>
          <Button chromeless flexDirection="column">
            <SlidersHorizontal></SlidersHorizontal>
            <Paragraph>Adjust</Paragraph>
          </Button>
        </XStack>
      </YStack>
    </>
  );
}

export default ChatScreen;
