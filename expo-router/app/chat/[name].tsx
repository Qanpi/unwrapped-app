import { Circle, Share2, SlidersHorizontal } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useRef,
} from "react";
import ViewShot, { captureRef } from "react-native-view-shot";
import {
  Button,
  Card,
  H4,
  Paragraph,
  ScrollView,
  useWindowDimensions,
  XStack,
  YStack,
} from "tamagui";
import { useCornerDecorations } from "./Decoration";

import { Text as RNText, View as RNView } from "react-native";

const WrappedContext = createContext({
  width: 0,
  height: 0,
});

interface BaseCardProps {
  backgroundColor?: string;
  children?: ReactNode;
}

const BaseCard = forwardRef(function BaseCard(
  { backgroundColor, children }: BaseCardProps,
  ref
) {
  const { width, height } = useContext(WrappedContext);

  const decorations = useCornerDecorations(width, height, 4);

  return (
    <Card ref={ref} collapsable={false} width={width} height={height} px="$2">
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
});

function WrappedCardList() {
  const local = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();

  //FIXME: min max the width and height in case width > height
  const padding = 30;
  const width = windowWidth - padding * 2;
  const height = (width * 1920) / 1080;
  const gap = padding / 2;

  const cardRefs = useRef([]);
  const assignCardRef = (el, index) => {
    if (el && !cardRefs.current[index]) {
      cardRefs.current[index] = el;
    }
  };

  const handlePressShare = () => {
    //FIXME: handleError gracefully
    const handleCapture = (uri) => {
      console.log(uri)
    }

    captureRef(cardRefs.current[0], {
      format: "jpg",
      quality: 0.8,
    }).then(handleCapture, (err) => console.error(err));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: local.name,
          headerRight: (props) => <Share2 onPress={handlePressShare}></Share2>,
        }}
      />

      <ScrollView
        horizontal
        snapToInterval={width + gap}
        decelerationRate={0.85}
      >
        <XStack px={padding} gap={gap}>
          <WrappedContext.Provider value={{ width, height }}>
            <BaseCard ref={(el) => assignCardRef(el, 0)}></BaseCard>
            <BaseCard></BaseCard>
            <BaseCard></BaseCard>
            <BaseCard></BaseCard>
            <BaseCard></BaseCard>
            <BaseCard></BaseCard>
          </WrappedContext.Provider>
        </XStack>
      </ScrollView>
    </>
  );
}

function ChatScreen() {
  return (
    <>
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
