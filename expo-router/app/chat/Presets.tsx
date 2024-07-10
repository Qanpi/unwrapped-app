import { BaseCard } from "app/BaseCard";
import { PersonalStats } from "app/PersonalStats";
import { WaterMark } from "app/WaterMark";
import dayjs from "dayjs";
import {
  H1,
  H2,
  H3,
  H4,
  Image,
  Paragraph,
  Spacer,
  Square,
  Text,
  View,
  XStack,
  YStack,
  styled,
} from "tamagui";
import WordCloud from "../../react-native-wordcloud/src";
import { ColoredWordCloud } from "./ColoredWordCloud";
import { WrappedChat } from "./WrappedChat";

export const WH2 = styled(H2, {
  textAlign: "center",
});

export const WH3 = styled(H3, {
  textAlign: "center",
});

export const BigNumber = styled(H1, {
  fontSize: 80,
  lineHeight: 80,
  mb: "$-5",
});

export const getCardPresets = (
  chatName: string,
  data: any,
  width: number,
  height: number
) => {
  const { timespan, total, messagesPerPerson } = data;
  const intlNumber = new Intl.NumberFormat();

  let cumPercentage = 0;

  return [
    <BaseCard backgroundColor="$background4" gap="$0" watermark={false}>
      <WH2 mb="$-1">{chatName}</WH2>
      <Paragraph color="$gray9">{`${dayjs(timespan.from).format("L")} - ${dayjs(
        timespan.to
      ).format("L")}`}</Paragraph>
      <Spacer></Spacer>
      <WaterMark></WaterMark>
    </BaseCard>,
    <BaseCard backgroundColor="$background2">
      <WH2>
        These <H2 color="$background4">{intlNumber.format(timespan.days)}</H2>{" "}
        days have been fruitful.
      </WH2>
      <Paragraph>
        In total, you exchanged{" "}
        <Paragraph color="$background3">
          {intlNumber.format(total.messages)}
        </Paragraph>{" "}
        messages.
      </Paragraph>
    </BaseCard>,
    <BaseCard backgroundColor="$background2">
      <YStack alignSelf="stretch" p="$5">
        <H4 mb="$4">Messages per person</H4>
        {messagesPerPerson.slice(0, 6).map((p, i) => {
          const [name, count, factor] = p;
          const percentage = (factor * 100).toFixed(0);

          cumPercentage += factor * 100;
          const remainder = (100 - cumPercentage).toFixed(0);

          return (
            <XStack
              key={name}
              justifyContent="space-between"
              alignItems="center"
            >
              <Paragraph color={i === 5 ? "$gray10" : "$color"}>{i !== 5 ? name : "Others"}</Paragraph>

              <XStack alignItems="center" justifyContent="flex-end" gap="$2">
                <Paragraph color="$background3" opacity={0.7} fontSize={11}>
                  {i !== 5 ? percentage : remainder}%
                </Paragraph>
                <View height="$1" width={percentage + "%"}>
                  <Square
                    flex={1}
                    backgroundColor="$background3"
                    borderRadius="$1"
                  ></Square>
                </View>
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
        Out of <WH2 color="$background2">{intlNumber.format(total.words)}</WH2>{" "}
        words, your most popular were...
      </WH2>
    </BaseCard>,
    <BaseCard backgroundColor="$background3">
      <ColoredWordCloud
        width={width}
        height={height}
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
          maxFont: 80,
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
      <WH2 color="black">Meanwhile, your longest streak spanned...</WH2>
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

        <BigNumber color="black">{data.longestStreak.streak}</BigNumber>
        <Paragraph mb="$2" color="black">
          days
        </Paragraph>
      </View>
      <Paragraph color="black">{`${dayjs(data.longestStreak.from).format(
        "ll"
      )} - ${dayjs(data.longestStreak.to).format("ll")}`}</Paragraph>
    </BaseCard>,

    <BaseCard backgroundColor="$background4">
      <WH2>
        While the longest you went <WH2 fontStyle="italic">without</WH2> talking
        was...
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
          messages={data.first10Messages.slice(0, 5).reverse()}
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
        <WrappedChat
          messages={data.last10Messages.slice(0, 5).reverse()}
        ></WrappedChat>
      </View>
    </BaseCard>,
    <BaseCard backgroundColor="$background4">
      <WH2 mb="$-2">{chatName}</WH2>
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
