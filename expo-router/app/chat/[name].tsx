import {
  Bug,
  MoreHorizontal,
  Share2,
  Share as ShareIcon,
  Trash2,
} from "@tamagui/lucide-icons";
import * as FileSystem from "expo-file-system";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { createContext, useEffect, useRef, useState } from "react";
import { captureRef } from "react-native-view-shot";
import {
  Button,
  Paragraph,
  Popover,
  ScrollView,
  Spinner,
  Theme,
  useWindowDimensions,
  View,
  XStack,
  YStack,
} from "tamagui";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Share from "react-native-share";

import { useToastController } from "@tamagui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useInterstitial } from "app/(tabs)";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Linking, TouchableOpacity } from "react-native";
import { AdEventType } from "react-native-google-mobile-ads";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePremium } from "../paywall";
import { getCardPresets } from "./Presets";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

export const WrappedContext = createContext({
  width: 0,
  height: 0,
});

export const useWrappedCards = () => {
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

  return { width, height, gap, padding };
};

function WrappedCardList() {
  const local = useLocalSearchParams();
  const chatKey = local.name as string;

  const [status, setStatus] = useState("Initializing...");
  const queryClient = useQueryClient();
  const [data, setData] = useState(null);

  const toast = useToastController();
  useEffect(() => {
    if (!local.name) return; //FIXME: 404 page

    const initializeChat = async () => {
      const chatRaw = await AsyncStorage.getItem(chatKey as string);
      const chat = JSON.parse(chatRaw);

      setStatus("Retrieving chat data...");

      // if previous analyzer, exit now
      //FIXME: date based way to determine when analyzed?
      if ("lastAnalyzed" in chat) {
        return setData(chat);
      }

      const SERVER_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

      setStatus("Analyzing conversations...");
      try {
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
          throw new Error("Server failed to analyze chat.");
        }
        setStatus("Finalizing visualizations...");
        const parsed = JSON.parse(res.body);
        setData(parsed);

        await AsyncStorage.setItem(chatKey, res.body);
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      } catch (e) {
        router.navigate("../");
        toast.show("Failed to analyze chat. Please try again later.");
        console.error(e);
      }
    };

    initializeChat().catch(console.error); //FIXME: handle error
  }, [local.name]);

  const cardRefs = useRef([]);
  const assignCardRef = (el, index) => {
    if (el && !cardRefs.current[index]) {
      cardRefs.current[index] = el;
    }
  };

  const shareCapturedFiles = async (uris: string[]) => {
    //FIXME: handleError gracefully
    try {
      const response = await Share.open({
        type: "image/*",
        urls: uris,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isPremium = usePremium();
  const interstitial = useInterstitial();

  const takeScreenShot = async (single: boolean = false) => {
    const urls: string[] = [];

    try {
      for (const card of cardRefs.current) {
        const uri = await captureRef(card, {
          format: "jpg",
          quality: 0.8,
        });

        urls.push("file://" + uri);

        if (single) break;
      }
    } catch (e) {
      //FIXME: handle gracefully
      console.error(e);
    }

    return urls;
  };

  const loading = !data;

  const scrollIndex = useRef(0);
  const { width, height, gap, padding } = useWrappedCards();

  const handlePressDeleteChat = async () => {
    await AsyncStorage.removeItem(chatKey);
    await queryClient.invalidateQueries({
      queryKey: ["chats"],
    });
    router.navigate("/");
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
                padding={0}
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
                <YStack gap="$0">
                  <Button
                    justifyContent="flex-start"
                    icon={Trash2}
                    onPress={handlePressDeleteChat}
                  >
                    Delete chat
                  </Button>
                  <Button
                    justifyContent="flex-start"
                    icon={Bug}
                    onPress={() =>
                      Linking.openURL(
                        "mailto:qanpii@gmail.com?subject=BUG: &body=What was the issue?"
                      )
                    }
                  >
                    Report issue
                  </Button>
                </YStack>
              </Popover.Content>
            </Popover>
          ), //FIXME: hit slop and touchable opacity for web cursor
        }}
      />

      {!loading ? (
        <ScrollView
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / (width + gap));
            scrollIndex.current = index;
          }}
          horizontal
          snapToInterval={width + gap}
          decelerationRate={0.85}
          flexGrow={0}
        >
          <XStack px={padding} gap={gap}>
            <Theme name="spotify">
              <WrappedContext.Provider value={{ width, height }}>
                {getCardPresets(chatKey, data, width, height).map((card, i) => (
                  <card.type
                    {...card.props}
                    index={i + 1}
                    key={i}
                    ref={(el) => assignCardRef(el, i)}
                    seed={chatKey + i}
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
          justifyContent="center"
          alignItems="center"
        >
          <Paragraph>{status}</Paragraph>
          <Spinner></Spinner>
        </View>
      )}
      <XStack height="$8">
        <Button
          disabled={loading}
          opacity={loading ? 0.5 : 1}
          height="100%"
          flexDirection="column"
          chromeless
          onPress={async () => {
            const urls = await takeScreenShot(true);
            shareCapturedFiles(urls);
          }}
        >
          <Share2></Share2>
          This page
        </Button>
        <Button
          disabled={loading}
          opacity={loading ? 0.5 : 1}
          height="100%"
          chromeless
          flexDirection="column"
          onPress={async () => {
            const urls = takeScreenShot();

            if (isPremium === false) {
              interstitial.show();
              const unsubscribe = interstitial.addAdEventListener(
                AdEventType.CLOSED,
                async () => {
                  await shareCapturedFiles(await urls);
                  unsubscribe();
                }
              );
            } else {
              await shareCapturedFiles(await urls);
            }
          }}
        >
          <ShareIcon></ShareIcon>
          Everything
        </Button>
      </XStack>
    </>
  );
}

function ChatScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} paddingTop="$5" gap="$3" alignItems="center">
        <WrappedCardList></WrappedCardList>
      </YStack>
    </SafeAreaView>
  );
}

export default ChatScreen;
