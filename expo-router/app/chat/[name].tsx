import { Circle, SlidersHorizontal } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { createContext, ReactNode, useContext } from "react";
import {
  Button,
  Card,
  H4,
  Paragraph,
  ScrollView,
  useWindowDimensions,
  XStack,
  YStack
} from "tamagui";
import { useCornerDecorations } from "./Decoration";

const WrappedContext = createContext({
  width: 0,
  height: 0,
});

interface BaseCardProps {
  backgroundColor?: string;
  children?: ReactNode;
}

function BaseCard({ backgroundColor, children }: BaseCardProps) {
  const { width, height } = useContext(WrappedContext);

  const decorations = useCornerDecorations(width, height, 4); 

  return (
    <Card width={width} height={height} px="$2">
      <Card.Header>
        <H4>01</H4>
      </Card.Header>
      <Card.Background
        bg={backgroundColor}
        alignItems="center"
        justifyContent="center"
      >
        {decorations}
        {children}
      </Card.Background>
      <Card.Footer>
        <Paragraph>Made with Unwrapped</Paragraph>
      </Card.Footer>
    </Card>
  );
}

function WrappedCardList() {
  const { width: windowWidth } = useWindowDimensions();

  //FIXME: min max the width and height in case width > height
  const padding = 30;
  const width = windowWidth - padding * 2;
  const height = (width * 1920) / 1080;

  const gap = padding / 2;

  return (
    <ScrollView horizontal snapToInterval={width + gap} decelerationRate={0.85}>
      <XStack px={padding} gap={gap}>
        <WrappedContext.Provider value={{ width, height }}>
          <BaseCard></BaseCard>
          <BaseCard></BaseCard>
          <BaseCard></BaseCard>
          <BaseCard></BaseCard>
          <BaseCard></BaseCard>
          <BaseCard></BaseCard>
        </WrappedContext.Provider>
      </XStack>
    </ScrollView>
  );
}

function ChatScreen() {
  const local = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: local.name }} />

      <YStack flex={1} justifyContent="center" alignItems="center" py="$5">
        <WrappedCardList></WrappedCardList>

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
