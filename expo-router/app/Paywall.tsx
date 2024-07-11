import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import {
  Button,
  Paragraph,
  Spacer,
  Theme,
  Unspaced,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { useWrappedCards, WrappedContext } from "./chat/[name]";
import { BaseCard } from "./BaseCard";
import { BigNumber, WH2 } from "./chat/presets";
import { ChatListItem } from "./(tabs)";
import { StatRowTemplate } from "./PersonalStats";
import { Link, Stack } from "expo-router";
import { X } from "@tamagui/lucide-icons";

export const Paywall = () => {
  const scrollIndex = useRef(0);

  const { width, height, gap, padding } = useWrappedCards();

  const PRICE = 4.99;

  const advertCards = [
    <BaseCard backgroundColor="$background2" seed="paywall">
      <WH2>Unlock lifetime premium</WH2>
      {/* FIXME: adjust by locale */}
      <Paragraph>For a one-time payment of ${PRICE}</Paragraph>
      <Spacer size="$2"></Spacer>
      <Button
        paddingHorizontal="$5"
        backgroundColor="$background4"
        borderRadius={20}
        color="$background2"
      >
        Continue
      </Button>
      <View position="relative" top={80}>
        <Paragraph fontSize={11}>{"Swipe to see benefits ->"}</Paragraph>
      </View>
    </BaseCard>,
    <BaseCard
      backgroundColor="$background4"
      justifyContent="flex-start"
      paddingTop={100}
    >
      <WH2 color="black">Unlimited conversations</WH2>
      <Spacer></Spacer>
      <YGroup gap="$-1" backgroundColor="$background">
        <ChatListItem name="Friends"></ChatListItem>
        <ChatListItem name="Family"></ChatListItem>
        <ChatListItem name="Pets"></ChatListItem>
        <ChatListItem name="And whomever else..."></ChatListItem>
      </YGroup>
    </BaseCard>,
    <BaseCard
      backgroundColor="$background5"
      justifyContent="flex-start"
      paddingTop={100}
    >
      <BigNumber lineHeight={100} position="absolute" top={150} right="15%">
        🥵
      </BigNumber>
      <WH2>Personalized AI statistics</WH2>
      <Spacer size="$12"></Spacer>
      <YStack width="80%">
        <StatRowTemplate
          paywall={false}
          stats={{
            personalityType: "ENTP",
            iq: 42,

            convosStarted: 123,
            convosEnded: 456,

            averageResponseTime: 1251,
            screenTime: 24000,
          }}
        ></StatRowTemplate>
      </YStack>
    </BaseCard>,
    <BaseCard backgroundColor="$background3">
      <WH2 color="black">Lifetime access to new features</WH2>
    </BaseCard>,
  ];

  const n = advertCards.length;

  advertCards.unshift(advertCards[advertCards.length - 1]);
  advertCards.push(advertCards[1]);

  const scrollView = useRef<ScrollView>(null);

  const scrollWidth = width + gap;

  const [skippable, setSkippable] = useState(false)

  const scrollToBeginning = () => {
    scrollView.current?.scrollTo({ x: scrollWidth, y: 0, animated: false });
    setSkippable(true);
  };

  useEffect(() => {
    scrollToBeginning();
    setSkippable(false);
  }, [scrollView]);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          title: "Unlock premium",
          headerRight: () => (
            skippable ? <Link href="../" asChild>
              <TouchableOpacity>
                <X></X>
              </TouchableOpacity>
            </Link> : null
          ),
        }}
      />
      <ScrollView
        flex={1}
        ref={scrollView}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const index = Math.round(x / (width + gap));
          scrollIndex.current = index;

          if (x >= (n + 1) * scrollWidth - gap / 3) {
            scrollToBeginning();
          }

          if (x <= gap / 3) {
            scrollView.current?.scrollTo({
              x: scrollWidth * n,
              y: 0,
              animated: false,
            });
          }
        }}
        horizontal
        snapToInterval={width + gap}
        decelerationRate={0.85}
      >
        <XStack px={padding} gap={gap} paddingTop="$5">
          <Theme name="spotify">
            <WrappedContext.Provider value={{ width, height }}>
              {advertCards.map((card, i) => (
                <card.type
                  {...card.props}
                  key={i}
                  seed={`paywall ${i % n}`}
                ></card.type>
              ))}
            </WrappedContext.Provider>
          </Theme>
        </XStack>
      </ScrollView>
    </>
  );
};

export default Paywall;
