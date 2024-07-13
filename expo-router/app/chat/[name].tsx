import {
  Bug,
  MoreHorizontal,
  Share2,
  Share as ShareIcon,
  Trash2
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
  YStack
} from "tamagui";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Share from "react-native-share";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { TouchableOpacity } from "react-native";
import { getCardPresets } from "./presets";

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

  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);

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

      const SERVER_URL = "http://192.168.10.163:7071";

      setStatus("Analyzing conversations...");
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
        throw new Error("Server failed to analyze chat.")
      }

      setStatus("Finalizing visualizations...");
      const parsed = JSON.parse(res.body);
      setData(parsed);

      await AsyncStorage.setItem(chatKey, res.body);
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
    const response = await Share.open({
      type: "image/*",
      urls: uris,
    });
  };

  const handlePressShareEverything = async () => {
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

  const scrollIndex = useRef(0);
  const {width, height, gap, padding} = useWrappedCards();

  const queryClient = useQueryClient();

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
                  <Button justifyContent="flex-start" icon={Bug}>
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
                {getCardPresets("Chat with " + chatKey, data, width, height).map(
                  (card, i) => (
                    <card.type
                      {...card.props}
                      index={i + 1}
                      key={i}
                      ref={(el) => assignCardRef(el, i)}
                      seed={chatKey + i}
                    ></card.type>
                  )
                )}
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
      <XStack height="$10">
        <Button
          height="100%"
          flexDirection="column"
          chromeless
          onPress={async () => {
            const uri = await captureRef(
              cardRefs.current[scrollIndex.current],
              {
                format: "png",
              }
            );

            shareCapturedFiles([uri]);
          }}
        >
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
