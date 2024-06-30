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
  H1,
  H4,
  Paragraph,
  ScrollView,
  useWindowDimensions,
  XStack,
  YStack,
} from "tamagui";
import { useCornerDecorations } from "./Decoration";

import * as Sharing from "expo-sharing";
import Share from "react-native-share";

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const padding = 30;
  const { width, height } = ((w, h) => {
    if (w > h) {
      return {
        width: (h * 1080) / 1920 - padding * 2,
        height: h,
      };
    } else {
      return {
        width: w - padding * 2,
        height: ((w - padding * 2) * 1920) / 1080,
      };
    }
  })(windowWidth, windowHeight);

  const gap = padding / 2;

  const cardRefs = useRef([]);
  const assignCardRef = (el, index) => {
    if (el && !cardRefs.current[index]) {
      cardRefs.current[index] = el;
    }
  };

  const handlePressShare = async () => {
    //FIXME: handleError gracefully
    const shareCapturedFiles = async (uris: string[]) => {
      const response = await Share.open({
        title: "title",
        message: "message", //TODO:

        type: "image/*",
        urls: uris,
      });

      // if (await Sharing.isAvailableAsync()) {
      //   await Sharing.shareAsync("file://" + uri, {
      //     dialogTitle: "Share your Wrapped",
      //     mimeType: "image/jpg",
      //     UTI: ".jpg"
      //   });
      // } else {
      //   //FIXME: show a toast
      //   alert("Sharing is not available on this platform");
      // }
    };

    const urls: string[] = [];

    for (const card of cardRefs.current) {
      try {
        const uri = await captureRef(card, {
          format: "jpg",
          quality: 0.8,
        });

        urls.push("file://" + uri);
      } catch (e) {
        //FIXME: handle gracefully
        console.error(e);
      }
    }

    shareCapturedFiles(urls);
  };

  const cardPresets = Array.from({ length: 8 }, (v, i) => (
    <H4>{"Title" + i}</H4>
  ));

  return (
    <>
      <Stack.Screen
        options={{
          title: local.name,
          headerRight: (props) => <Share2 onPress={handlePressShare}></Share2>, //FIXME: hit slop and touchable opacity for web cursor 
        }}
      />

      <ScrollView
        horizontal
        snapToInterval={width + gap}
        decelerationRate={0.85}
      >
        <XStack px={padding} gap={gap}>
          <WrappedContext.Provider value={{ width, height }}>
            {cardPresets.map((cardChildren, index) => (
              <BaseCard key={index} ref={(el) => assignCardRef(el, index)}>
                {cardChildren}
              </BaseCard>
            ))}
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
