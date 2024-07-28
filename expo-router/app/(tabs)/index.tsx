import AsyncStorage from "@react-native-async-storage/async-storage";
import { FilePlus } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Link, useRouter } from "expo-router";
import { ShareIntentFile, useShareIntentContext } from "expo-share-intent";
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

export function ChatListItem({ name, lastUpdated, onPress }: { name: string }) {
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

  const openChat = async (file: ShareIntentFile) => {
    let uri, filename;

    if (file.mimeType === "text/plain") {
      uri = file.path;
      filename = file.fileName;
    } else if (file?.mimeType === "application/zip") {
      const zipPath =
        FileSystem.cacheDirectory + file.fileName.replace(/.zip/, "");

      await unzip(file.path, zipPath, "UTF-8");
      const entries = await FileSystem.readDirectoryAsync(zipPath);

      const chatLog = entries.find((e) => e.endsWith(".txt"));
      uri = zipPath + "/" + chatLog;
      filename = chatLog;
    }

    const key = filename.replace(/WhatsApp Chat with /, "").replace(/.txt/, "");

    await AsyncStorage.setItem(key, JSON.stringify({ uri }));
    router.navigate(`chat/${key}`);
  };

  const handlePressImport = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "*/*", //TODO: .zip support?
      copyToCacheDirectory: true,
    });

    if (res.canceled) {
      console.log("canceled"); //FIXME:
      return;
    }

    const { uri, name } = res.assets[0];
    openChat(name, uri);
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
      <Link href="/paywall" asChild>
        <View minHeight={200}>
          <Image
            flex={1}
            source={{
              uri: require("../../assets/images/premium-banner.png"),
            }}
            objectFit="contain"
            resizeMode="contain"
          ></Image>
        </View>
      </Link>
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
      <YGroup>
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
                        //TODO: handle add hasn't loaded yet
                        console.error(e);
                      }
                      router.navigate(`chat/${name}`);
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
