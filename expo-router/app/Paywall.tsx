import { X } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Link, Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import {
  Button,
  Paragraph,
  Spacer,
  Theme,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { ChatListItem } from "./(tabs)";
import { useWrappedCards, WrappedContext } from "./chat/[name]";
import { BaseCard } from "./chat/BaseCard";
import { StatRowTemplate } from "./chat/PersonalStats";
import { BigNumber, WH2 } from "./chat/Presets";

export const checkPremiumAccess = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // access latest customerInfo
    if (typeof customerInfo.entitlements.active["Premium"] !== "undefined") {
      // Grant user "pro" access
      return true;
    }
  } catch (e) {
    // Error fetching customer info
    console.error(e);
  }

  return false;
};

export const usePremium = () => {
  //undefined means hasn't loaded yet
  const [isPremium, setIsPremium] = useState<boolean | undefined>();
  const [force, setForce] = useState(0);

  useEffect(() => {
    const check = async () => {
      const premium = await checkPremiumAccess();
      setIsPremium(premium);
    };

    check();

    const forceRender = () => {
      setForce((i) => i + 1);
    };
    Purchases.addCustomerInfoUpdateListener(forceRender);
    Purchases.addCustomerInfoUpdateListener(check);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(forceRender);
      Purchases.removeCustomerInfoUpdateListener(check);
    };
  }, [force]);

  return isPremium;
};

export const Paywall = () => {
  const scrollIndex = useRef(0);
  const router = useRouter();

  const { width, height, gap, padding } = useWrappedCards();

  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage>();

  const toast = useToastController();
  const handlePurchase = async () => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(
        lifetimePackage!
      );
    } catch (e) {
      //FIXME: error taost
      if (!e.userCancelled) {
        toast.show(
          "Something went wrong trying to purchase premium, please contact support."
        );
      }
    }

    if (await checkPremiumAccess()) {
      router.navigate("../");
    }
  };

  const advertCards = [
    <BaseCard backgroundColor="$background2" seed="paywall">
      <WH2>Unlock lifetime premium</WH2>
      {/* FIXME: adjust by locale */}
      <Paragraph>
        For a one-time payment of{" "}
        <Paragraph color="$background3">
          {lifetimePackage?.product.priceString}
        </Paragraph>
      </Paragraph>
      <Spacer size="$2"></Spacer>
      <Button
        paddingHorizontal="$5"
        backgroundColor="$background4"
        borderRadius={20}
        color="$background2"
        onPress={handlePurchase}
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
      <WH2 color="black">Unlimited Ad-free analyses</WH2>
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

  const [skippable, setSkippable] = useState(false);

  const scrollToBeginning = () => {
    scrollView.current?.scrollTo({ x: scrollWidth, y: 0, animated: false });
  };

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.lifetime !== null) {
          setLifetimePackage(offerings.current.lifetime);
        }
      } catch (e) {
        toast.show("Could not load offers, try again later.");
        console.error(e);
      }
    };

    loadOfferings();
  }, []);

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
          headerRight: () =>
            skippable ? (
              <Link href="../" asChild>
                <TouchableOpacity>
                  <X></X>
                </TouchableOpacity>
              </Link>
            ) : null,
        }}
      />
      <ScrollView
        flex={1}
        ref={scrollView}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const index = Math.round(x / (width + gap));
          scrollIndex.current = index;

          if (x >= 2 * scrollWidth - gap && !skippable) {
            setSkippable(true);
          }

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
