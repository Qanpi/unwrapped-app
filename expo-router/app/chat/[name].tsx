import {
  Circle,
  HelpCircle,
  Share2,
  Share as ShareIcon,
  SlidersHorizontal,
  MoreHorizontal,
} from "@tamagui/lucide-icons";
import type { GetProps } from "tamagui";
import { BlurView } from "expo-blur";
import { GiftedChat } from "react-native-gifted-chat";
import WordCloud from "../../react-native-wordcloud";
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
  Adapt,
  Button,
  Card,
  H1,
  H2,
  H3,
  H4,
  H6,
  Image,
  Input,
  Label,
  Paragraph,
  Popover,
  ScrollView,
  Spacer,
  Spinner,
  Square,
  styled,
  Text,
  Theme,
  Tooltip,
  TooltipGroup,
  useTheme,
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
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

const WrappedContext = createContext({
  width: 0,
  height: 0,
});

const WaterMark = () => {
  return (
    <XStack alignItems="center" gap="$1">
      <Image
        source={{
          uri: require("./../../assets/images/logo_96.png"),
          width: 12,
          height: 12,
        }}
      ></Image>
      <Paragraph fontSize={11}>Unwrapped</Paragraph>
    </XStack>
  );
};

type BaseCardProps = {
  index?: number;
  watermark?: boolean;
} & GetProps<typeof Card.Background>;

const BaseCard = forwardRef(function BaseCard(
  { children, index, watermark = true, ...rest }: BaseCardProps,
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
        alignItems="center"
        justifyContent="center"
        gap="$2"
        p="$3"
        //allow press events
        pointerEvents="auto"
        {...rest}
      >
        {decorations}
        {children}
      </Card.Background>
      <Card.Footer>{watermark ? <WaterMark></WaterMark> : null}</Card.Footer>
    </Card>
  );
});

interface PersonalStats {
  mostPopularWord: { word: string; count: number };
  emoji: string;
  MBTI: string;
  iq: number;
  convosEnded: number;
  convosStarted: number;
  averageResponseTime: number;
  screenTime: number;
}

const PersonalStats = ({
  name,
  stats,
}: {
  name: string;
  stats: PersonalStats;
}) => {
  function formatTime(seconds) {
    // Hours, minutes and seconds
    const hrs = ~~(seconds / 3600);
    const mins = ~~((seconds % 3600) / 60);
    const secs = ~~seconds % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"

    if (hrs > 0) {
      return `${hrs}h ${mins}min`;
    }

    return `${mins}min ${secs}sec`;
  }

  const StatRow = ({ title, stat }) => {
    const paywallStyle = {
      color: "#fff0",

      shadowOpacity: 1,
      shadowColor: "#000",
      shadowRadius: 15,

      textShadowColor: "rgba(255,255,255,0.5)",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 15,
    };

    return (
      <XStack justifyContent="space-between">
        <Paragraph>{title} </Paragraph>

        <TouchableOpacity hitSlop={20} onPress={() => console.log("paywall")}>
          <Paragraph userSelect={"none"} style={paywallStyle}>
            {stat}
          </Paragraph>
        </TouchableOpacity>
      </XStack>
    );
  };

  const InfoTooltip = () => {
    return (
      <Popover size="$5">
        <Popover.Trigger alignSelf="flex-end" asChild>
          <Button chromeless iconAfter={HelpCircle} fontSize={10} opacity={0.5}>
            How are these calculated
          </Button>
        </Popover.Trigger>

        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Popover.Sheet>
        </Adapt>

        <Popover.Content
          borderWidth={1}
          borderColor="$borderColor"
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

          <YStack>
            <View>
              <H6>Personality type</H6>
              <Paragraph>how this is calculated</Paragraph>
            </View>
          </YStack>
        </Popover.Content>
      </Popover>
    );
  };

  return (
    <>
      <H1 fontSize={100} lineHeight={150} mb="$-4" mt="$-10">
        {stats.emoji}
      </H1>
      <H6 mb="$-3">{name}</H6>
      <Paragraph fontSize={10}>
        said '{stats.mostPopularWord.word}' {stats.mostPopularWord.count} times
      </Paragraph>
      <Spacer></Spacer>
      <YStack width="80%">
        <StatRow title="Personality type:" stat={"TODO"}></StatRow>
        <StatRow title="IQ:" stat={stats.iq.toFixed(1)}></StatRow>

        <Spacer></Spacer>
        <StatRow title="Convos started:" stat={stats.convosStarted}></StatRow>
        <StatRow title="Convos ended:" stat={stats.convosEnded}></StatRow>
        <StatRow
          title="Response time:"
          stat={"~" + formatTime(stats.averageResponseTime)}
        ></StatRow>
        <StatRow
          title="Screen time:"
          stat={"~" + formatTime(stats.screenTime)}
        ></StatRow>
        <InfoTooltip></InfoTooltip>
      </YStack>
    </>
  );
};

function WrappedCardList() {
  const local = useLocalSearchParams();
  const chatKey = local.name as string;

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!local.name) return; //FIXME: 404 page

    const initializeChat = async () => {
      const chatRaw = await AsyncStorage.getItem(chatKey as string);
      const chat = JSON.parse(chatRaw);

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

      const parsed = JSON.parse(res.body);
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

  const handlePressShareEverything = async () => {
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

    const WH3 = styled(H3, {
      textAlign: "center",
    });

    const BigNumber = styled(H1, {
      fontSize: 80,
      lineHeight: 80,
      mb: "$-5",
    });

    const ColoredWordCloud = ({ words }) => {
      const minFont = 10;
      const maxFont = 50;
      const fontOffset = 10;

      //asume sorted
      const counts = words.map(([_, count]) => count);

      const getColor = (count: number) => {
        const pos = counts.findIndex((c) => c === count);

        if (pos < 5) {
          return "$accent";
        }

        return "$background2";
      };

      return (
        <WordCloud
          renderWord={(text, style, onLayout) => {
            const color = style.color;
            delete style.color;

            return (
              <Paragraph
                style={{
                  ...style,
                  fontSize: style.fontSize - 3,
                  fontWeight: 800,
                }}
                color={color}
                onTextLayout={onLayout}
              >
                {text}
              </Paragraph>
            );
          }}
          options={{
            words: words.map(([word, count]) => {
              return { text: word, value: count, color: getColor(count) }; //TODO: colors
            }),
            verticalEnabled: true,
            minFont,
            maxFont,
            fontOffset,
            width,
            height,
          }}
        ></WordCloud>
      );
    };

    const { timespan, total, messagesPerPerson } = data;
    return [
      <BaseCard backgroundColor="$background4" gap="$0" watermark={false}>
        <WH2 mb="$-1">{chatName}</WH2>
        <Paragraph color="$gray9">{`${dayjs(timespan.from).format(
          "L"
        )} - ${dayjs(timespan.to).format("L")}`}</Paragraph>
        <Spacer></Spacer>
        <WaterMark></WaterMark>
      </BaseCard>,
      <BaseCard backgroundColor="$background2">
        <WH2>
          These <H2 color="$background4">{timespan.days}</H2> days have been
          fruitful.
        </WH2>
        <Paragraph>
          In total, you exchanged{" "}
          <Paragraph color="$background3">{total.messages}</Paragraph> messages.
        </Paragraph>
      </BaseCard>,
      <BaseCard backgroundColor="$background2">
        <YStack alignSelf="stretch" p="$5">
          <H4 mb="$4">Messages per person</H4>
          {messagesPerPerson.map((p) => {
            const [name, count, factor] = p;
            const percentage = (factor * 100).toFixed(0) + "%";

            return (
              <XStack
                key={name}
                justifyContent="space-between"
                alignItems="center"
              >
                <Paragraph>{name}</Paragraph>
                <XStack alignItems="center" gap="$2" width={percentage}>
                  <Paragraph color="$background3" opacity={0.7} fontSize={11}>
                    {percentage}
                  </Paragraph>
                  <Square
                    height={10}
                    flex={1}
                    backgroundColor="$background3"
                    borderRadius="$1"
                  ></Square>
                </XStack>
              </XStack>
            );
          })}
        </YStack>
      </BaseCard>,
      // <BaseCard backgroundColor="$background2">
      //   <H4>Messages types pie chart</H4>
      // </BaseCard>,
      <BaseCard backgroundColor="$background3">
        <WH2>
          Out of{" "}
          <WH2 color="$background2">
            {new Intl.NumberFormat().format(total.words)}
          </WH2>{" "}
          words, your most popular were...
        </WH2>
      </BaseCard>,
      <BaseCard backgroundColor="$background3">
        <ColoredWordCloud
          words={data.mostPopularWords.slice(0, 40)}
        ></ColoredWordCloud>
      </BaseCard>,
      <BaseCard backgroundColor="$background3">
        <WH2>And your most popular emojis...</WH2>
      </BaseCard>,
      <BaseCard backgroundColor="$background3">
        <WordCloud
          renderWord={(text, style, onLayout) => (
            <Text
              style={{
                ...style,
                fontSize: style.fontSize - 7,
              }}
              onLayout={onLayout}
            >
              {text}
            </Text>
          )}
          options={{
            words: data.mostPopularEmojis.slice(0, 25).map(([word, count]) => {
              return { text: word, value: count }; //TODO: colors
            }),
            minFont: 25, //TODO: proportioanlize to count
            maxFont: 70,
            margin: 7, //FIXME: patch npm lib
            fontOffset: 5,
            width,
            height,
            fontFamily: "Arial", //TODO: update this
          }}
        ></WordCloud>
      </BaseCard>,
      // <BaseCard>
      //   <WH2>The messages kept coming in non-stop.</WH2>
      //   <Paragraph>{data.longestDayRange}</Paragraph>
      // </BaseCard>,
      // <Paragraph>heatmap</Paragraph>,
      <BaseCard backgroundColor="$background4">
        <WH2>Meanwhile, your longest streak spanned...</WH2>
      </BaseCard>,
      <BaseCard backgroundColor="$background4" pb="25%">
        <View
          alignItems="center"
          justifyContent="flex-end"
          width={180}
          height={230}
        >
          <Image
            source={{
              uri: require("./../../assets/images/fire-streak.png"),
              width: "100%",
              height: "100%",
            }}
            position="absolute"
          ></Image>

          <BigNumber>{data.longestStreak.streak}</BigNumber>
          <Paragraph mb="$2">days</Paragraph>
        </View>
        <Paragraph>{`${dayjs(data.longestStreak.from).format("ll")} - ${dayjs(
          data.longestStreak.to
        ).format("ll")}`}</Paragraph>
      </BaseCard>,

      <BaseCard backgroundColor="$background4">
        <WH2>
          While the longest you went <WH2 fontStyle="italic">without</WH2>{" "}
          talking was...
        </WH2>
      </BaseCard>,
      <BaseCard backgroundColor="$background4" pb="25%">
        <View
          alignItems="center"
          justifyContent="flex-end"
          width={250}
          height={230}
        >
          <Image
            source={{
              uri: require("./../../assets/images/poop-streak.png"),
              width: "100%",
              height: "100%",
            }}
            top={10}
            position="absolute"
          ></Image>
          <BigNumber>{data.longestSilence.silence}</BigNumber>
          <Paragraph mb="$3">days</Paragraph>
        </View>
        <Paragraph>{`${dayjs(data.longestSilence.from).format("ll")} - ${dayjs(
          data.longestSilence.to
        ).format("ll")}`}</Paragraph>
      </BaseCard>,
      <BaseCard backgroundColor="$background5">
        <WH2>Now let's look at some individual statistics 👀</WH2>
      </BaseCard>,
      ...Object.entries(data.personal).map(([name, stats]) => {
        return (
          <BaseCard backgroundColor="$background">
            <PersonalStats key={name} name={name} stats={stats}></PersonalStats>
          </BaseCard>
        );
      }),
      // <WH3>Over the years, your chat underwent some changes<WH3>,
      <BaseCard backgroundColor="$background2">
        <WH2 mt={50}>How it started</WH2>
        <View
          width={300}
          height={400}
          backgroundColor="#0001"
          borderRadius="$5"
          p="$1"
        >
          <WrappedChat
            messages={data.first10Messages.slice(0, 5)}
          ></WrappedChat>
        </View>
      </BaseCard>,
      <BaseCard backgroundColor="$background2">
        <WH2 mt={50}>How it's going</WH2>
        <View
          width={300}
          height={400}
          backgroundColor="#0001"
          borderRadius="$5"
          p="$1"
        >
          <WrappedChat messages={data.last10Messages.slice(0, 5)}></WrappedChat>
        </View>
      </BaseCard>,
      <BaseCard backgroundColor="$background4">
        <WH2 mb="$-3">{chatName}</WH2>
        <Paragraph>wrapped.</Paragraph>
        <Spacer></Spacer>
        <YStack>
          {/* <Image source={{
            uri: require("./../../assets/google-play.png"),
          }}></Image> */}
          <Paragraph>Get on ios</Paragraph>
        </YStack>
      </BaseCard>,
    ];
  };

  const test = [
    <BaseCard backgroundColor="$background1">
      <YStack>
        <Paragraph>Get on google pay</Paragraph>
        <Paragraph>Get on ios</Paragraph>
      </YStack>
    </BaseCard>,
  ];

  const WrappedChat = ({ messages }) => {
    return (
      <GiftedChat
        renderInputToolbar={() => null}
        messages={messages.map(([date, author, text], i) => {
          return {
            _id: date + i + text,
            createdAt: dayjs(date).toDate(),
            user: {
              _id: author,
              name: author,
            },
            text: text,
          };
        })}
        user={{
          _id: 1,
        }}
      ></GiftedChat>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: !loading ? chatKey : "Loading...",
          headerRight: (props) => (
            <Popover placement="bottom">
              <Popover.Trigger asChild>
                <TouchableOpacity>
                  <MoreHorizontal></MoreHorizontal>
                </TouchableOpacity>
              </Popover.Trigger>

              <Popover.Content
                borderWidth={1}
                borderColor="$borderColor"
                enterStyle={{ y: -10, opacity: 0 }}
                exitStyle={{ y: -10, opacity: 0 }}
                elevate
                animation={[
                  "quick",
                  {
                    opacity: {
                      overshootClamping: true,
                    },
                  },
                ]}
              >

                <YStack gap="$3">
                  <Paragraph>Delete chat</Paragraph> 
                </YStack>
              </Popover.Content>
            </Popover>
          ), //FIXME: hit slop and touchable opacity for web cursor
        }}
      />

      {!loading ? (
        <ScrollView
          horizontal
          snapToInterval={width + gap}
          decelerationRate={0.85}
          flexGrow={0}
          backgroundColor="yellow"
        >
          <XStack px={padding} gap={gap}>
            <Theme name="spotify">
              <WrappedContext.Provider value={{ width, height }}>
                {getCardPresets().map((card, i) => (
                  <card.type
                    {...card.props}
                    index={i + 1}
                    key={i}
                    ref={(el) => assignCardRef(el, i)}
                  ></card.type>
                ))}
              </WrappedContext.Provider>
            </Theme>
          </XStack>
        </ScrollView>
      ) : (
        <View
          width={width}
          height={height}
          backgroundColor="purple"
          justifyContent="center"
          alignItems="center"
        >
          <Paragraph>Analyzing your chat...</Paragraph>
          <Spinner></Spinner>
        </View>
      )}
      <XStack height="$10">
        <Button height="100%" chromeless flexDirection="column">
          <Share2></Share2>
          <Paragraph>This page</Paragraph>
        </Button>
        <Button
          height="100%"
          chromeless
          flexDirection="column"
          onPress={handlePressShareEverything}
        >
          <ShareIcon></ShareIcon>
          <Paragraph>Everything</Paragraph>
        </Button>
      </XStack>
    </>
  );
}

function ChatScreen() {
  return (
    <YStack flex={1} paddingTop="$5" alignItems="center">
      <WrappedCardList></WrappedCardList>
    </YStack>
  );
}

export default ChatScreen;
