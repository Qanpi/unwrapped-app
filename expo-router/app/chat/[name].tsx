import { Circle, Share2, SlidersHorizontal } from "@tamagui/lucide-icons";
import WordCloud from "rn-wordcloud";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { captureRef } from "react-native-view-shot";
import {
  Button,
  Card,
  H1,
  H2,
  H4,
  Image,
  Paragraph,
  ScrollView,
  Square,
  styled,
  Text,
  useWindowDimensions,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useCornerDecorations } from "./Decoration";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Share from "react-native-share";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { tokens } from "@tamagui/config/v3";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

const WrappedContext = createContext({
  width: 0,
  height: 0,
});

interface BaseCardProps {
  backgroundColor?: string;
  children?: ReactNode;
  index: number;
}

const BaseCard = forwardRef(function BaseCard(
  { backgroundColor, children, index }: BaseCardProps,
  ref
) {
  const { width, height } = useContext(WrappedContext);

  const decorations = useCornerDecorations(width, height, 4);

  return (
    <Card ref={ref} collapsable={false} width={width} height={height} px="$2">
      <Card.Header>
        <H4>{String(index).padStart(2, "0")}</H4>
      </Card.Header>
      <Card.Background
        bg={backgroundColor}
        alignItems="center"
        justifyContent="center"
        gap="$2"
        p="$3"
      >
        {decorations}
        {children}
      </Card.Background>
      <Card.Footer>
        <XStack alignItems="center" flex={1} gap="$1">
          <Image
            source={{
              uri: require("./../../assets/images/logo_96.png"),
              width: 12,
              height: 12,
            }}
          ></Image>
          <Paragraph fontSize={11}>Unwrapped</Paragraph>
        </XStack>
      </Card.Footer>
    </Card>
  );
});

function WrappedCardList() {
  const local = useLocalSearchParams();
  const chatKey = local.name as string;

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!local.name) return; //FIXME: 404 page

    const dateReviver = (key, value) => {
      const date = dayjs(value, "YYYY-MM-DDTHH:mm:ss", true);

      if (date.isValid()) {
        return date;
      }

      return value;
    };

    const initializeChat = async () => {
      const chatRaw = await AsyncStorage.getItem(chatKey as string);
      const chat = JSON.parse(chatRaw, dateReviver);

      // if previous analyzer, exit now
      //FIXME: date based way to determine when analyzed?
      if ("lastAnalyzed" in chat) {
        return setData(chat);
      }

      const SERVER_URL = "http://192.168.10.163:7071";

      const res = await FileSystem.uploadAsync(
        `${SERVER_URL}/api/analyze`,
        chat.uri,
        {
          fieldName: "chat",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        }
      );

      if (res.status !== 200) {
        console.log("status error");
        return; //FIXME: throw error
      }

      const parsed = JSON.parse(res.body, dateReviver);
      setData(parsed);

      await AsyncStorage.setItem(chatKey, res.body);
    };

    initializeChat().catch(console.error); //FIXME: handle error
  }, [local.name]);

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

  const loading = !data;

  const chatName = chatKey.replace(/\..+$/, "");

  const getCardPresets = () => {
    if (loading) return [];

    const WH2 = styled(H2, {
      textAlign: "center",
    });

    const { timespan, total, messagesPerPerson } = data;
    return [
      <>
        <WH2>{chatName}</WH2>
        <Paragraph>{`${timespan.from.format("L")} - ${timespan.to.format(
          "L"
        )}`}</Paragraph>
      </>,
      <>
        <WH2>These {timespan.days} days have been fruitful.</WH2>
        <Paragraph>
          In total, you exchanged {total.messages} messages.
        </Paragraph>
      </>,
      <>
        <YStack alignSelf="stretch" p="$5">
          <H4 mb="$4">Messages sent per person</H4>
          {messagesPerPerson.map((p) => {
            const [name, count, factor] = p;
            const percentage = (factor * 100).toFixed(0) + "%";

            return (
              <XStack key={name} justifyContent="space-between" alignItems="center">
                <Paragraph>{name}</Paragraph>
                <XStack alignItems="center" gap="$2" width={percentage}>
                  <Paragraph fontSize={11}>{percentage}</Paragraph>
                  <Square
                    height={12}
                    flex={1}
                    backgroundColor="red"
                    borderRadius="$1"
                  ></Square>
                </XStack>
              </XStack>
            );
          })}
        </YStack>
      </>,
      <>
        <H4>Messages types pie chart</H4>
      </>,
      <>
        <WH2>
          Out of {new Intl.NumberFormat().format(total.words)} words, your most
          popular were...
        </WH2>
      </>,
      <>
        <WordCloud
          options={{
            words: data.mostPopularWords.slice(0, 40).map(([word, count]) => {
              return { text: word, value: count }; //TODO: colors
            }),
            verticalEnabled: true,
            minFont: 10,
            maxFont: 50,
            fontOffset: 10,
            margin: 2,
            width,
            height,
            fontFamily: "Arial", //TODO: update this
          }}
        ></WordCloud>
      </>,
      <WH2>And your most popular emojis...</WH2>,
      <WordCloud
        options={{
          words: data.mostPopularEmojis.slice(0, 50).map(([word, count]) => {
            return { text: word, value: count }; //TODO: colors
          }),
          minFont: 15,
          maxFont: 50,
          margin: 5,
          fontOffset: 10,
          width,
          height,
          fontFamily: "Arial", //TODO: update this
        }}
      ></WordCloud>,
      <>
        <WH2>The messages were coming in non-stop.</WH2>
        <Paragraph>{data.longestDayRange}</Paragraph>
      </>,
      <>
        <Paragraph>heatmap</Paragraph>
      </>,
      <WH2>Meanwhile, your longest streak spanned...</WH2>,
      <>
        <View position="relative" background={"yellow"}>
          <Image
            source={{
              uri: require("./../../assets/images/fire-streak.png"),
              width: 150,
              height: 200,
            }}
            position="absolute"
          ></Image>
          <H1 mb="$-3">{data.longestStreak.streak}</H1>
          <Paragraph>days</Paragraph>
        </View>
      </>,
    ];
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: !loading ? chatKey : "Loading...",
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
            {getCardPresets().map((cardChildren, index) => (
              <BaseCard
                key={index}
                ref={(el) => assignCardRef(el, index)}
                index={index + 1}
              >
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
