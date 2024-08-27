import AsyncStorage from "@react-native-async-storage/async-storage";
import { FilePlus } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { unzip } from "react-native-zip-archive";
import {
  Button,
  Image,
  ListItem,
  Paragraph,
  View,
  YGroup,
  YStack,
} from "tamagui";
import { usePremium } from "../paywall";

export function ChatListItem({
  name,
  lastUpdated,
  onPress,
}: {
  name: string;
  lastUpdated: string;
  onPress?: () => void;
}) {
  return (
    <YGroup.Item>
      <ListItem
        onPress={onPress ? onPress : undefined}
        pressTheme
        title={<Paragraph fontWeight="bold">{name}</Paragraph>}
      >
        <ListItem.Subtitle>Last updated: {lastUpdated}</ListItem.Subtitle>
      </ListItem>
    </YGroup.Item>
  );
}

export function DefaultYStack({ children }) {
  return (
    <YStack ai="flex-start" gap="$8" px="$1" pt="$5">
      {children}
    </YStack>
  );
}
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-7645417253321075~9323994393";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {});

export const useInterstitial = () => {
  useEffect(() => {
    const unsubscribe = interstitial.addAdEventsListener(
      ({ type, payload }) => {
        if (type === AdEventType.CLOSED) {
          interstitial.load();
        }
      }
    );
    // Start loading the interstitial straight away
    interstitial.load();

    return unsubscribe;
  }, []);

  return interstitial;
};

export default function ChatsScreen() {
  const router = useRouter();

  const isPremium = usePremium();
  const interstitial = useInterstitial();

  const { hasShareIntent, shareIntent } = useShareIntentContext();
  useEffect(() => {
    if (hasShareIntent) {
      // we want to handle share intent event in a specific page
      const file = shareIntent?.files?.[0];
      if (!file) {
        throw new Error("Could not open shared file.");
      }

      openChat(file);
    }
  }, [hasShareIntent]);

  const toast = useToastController();
  const openChat = async (file: {
    fileName: string;
    mimeType: string;
    path: string;
  }) => {
    try {
      let uri: string, filename: string;

      if (file.mimeType === "text/plain") {
        uri = file.path;
        filename = file.fileName;
      } else if (file?.mimeType === "application/zip") {
        const zipPath =
          FileSystem.cacheDirectory + file.fileName.replace(/.zip/, "");

        await unzip(file.path, zipPath, "UTF-8");
        const entries = await FileSystem.readDirectoryAsync(zipPath);

        const chatLog = entries.find((e) => e.endsWith(".txt"));
        if (!chatLog) {
          return toast.show("Invalid zip file.");
        }

        uri = zipPath + "/" + chatLog;
        filename = chatLog;
      } else {
        return toast.show(
          "Invalid file type, only .zip and .txt files are supported."
        );
      }

      let key = filename.startsWith("WhatsApp Chat with ")
        ? filename.replace(/WhatsApp Chat with /, "")
        : filename;

      key.replace(/.txt/, "");

      try {
        if (isPremium === false) interstitial.show();
      } catch (e) {
        console.log("interstitial not loaded yet");
      }

      await AsyncStorage.setItem(key, JSON.stringify({ uri }));
      router.push(`chat/${key}`);
    } catch (e) {
      console.error(e);
      toast.show(
        "Something went wrong opening the file. Please try again or contact support."
      );
    }
  };

  const handlePressImport = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["text/plain", "application/zip"], //TODO: .zip support?
      copyToCacheDirectory: true,
    });

    if (res.canceled) {
      return;
    }

    const { name, uri, mimeType } = res.assets[0];

    if (!mimeType) return toast.show("Invalid file type.");

    openChat({ fileName: name, path: uri, mimeType: mimeType });
  };

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const keys = await AsyncStorage.getAllKeys();
      const res = await AsyncStorage.multiGet(keys);
      return res;
    },
  });

  function PremiumBanner() {
    const isPremium = usePremium();

    return isPremium === false ? (
      <View minHeight={200} onPress={() => router.push("/paywall")}>
        <Image
          flex={1}
          source={{
            uri: require("../../assets/images/premium-banner.png"),
          }}
          objectFit="contain"
          resizeMode="contain"
        ></Image>
      </View>
    ) : (
      <></>
    );
  }

  return (
    <YStack>
      <PremiumBanner></PremiumBanner>
      <Button
        justifyContent="flex-start"
        variant="outlined"
        chromeless
        icon={FilePlus}
        color="$purple8"
        onPress={handlePressImport}
      >
        <Button.Text>Import new chat</Button.Text>
      </Button>
      <YGroup scrollable>
        {chats?.length
          ? chats
              .map(([name, data]) => {
                const parsed = JSON.parse(data);
                return [name, parsed];
              })
              .sort((a, b) =>
                dayjs(a[1].lastAnalyzed).isAfter(dayjs(b[1].lastAnalyzed))
                  ? -1
                  : 1
              )
              .map(([name, parsed]) => {
                return (
                  <ChatListItem
                    key={name}
                    name={name}
                    onPress={() => {
                      try {
                        if (isPremium === false) interstitial.show();
                      } catch (e) {
                        console.log("ad not loaded yet");
                      }
                      router.push(`chat/${name}`);
                    }}
                    lastUpdated={dayjs(parsed.lastAnalyzed).format("L")}
                  ></ChatListItem>
                );
              })
          : null}
      </YGroup>
    </YStack>
  );
}
