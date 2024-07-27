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
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

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

  useEffect(() => {
    const insertTestData = async () => {
      await AsyncStorage.setItem(
        "haichuan.txt",
        //FIXME: double quote escaping
        `{"timespan": {"from": "2021-08-21T17:06:00", "to": "2024-06-14T17:21:00", "days": 1028}, "total": {"messages": 3351, "words": 10867}, "messagesPerPerson": [["Aleksei Terin", 1745, 0.5207400775887795], ["Haichuan Ma", 1606, 0.4792599224112205]], "messagesByHour": [36, 4, 0, 0, 1, 0, 10, 22, 95, 104, 96, 119, 158, 362, 169, 154, 184, 160, 183, 136, 201, 400, 581, 176], "longestDayRange": "From 12 AM to 09 PM on Sep 12 2021.", "mostPopularWords": [["lmao", 168], ["good", 61], ["like", 56], ["send", 39], ["thanks", 38], ["sorry", 38], ["there", 36], ["well", 33], ["come", 33], ["dont", 31], ["notes", 30], ["from", 30], ["think", 28], ["could", 26], ["gonna", 26], ["then", 25], ["didnt", 23], ["when", 22], ["coming", 22], ["aight", 20], ["tack", 20], ["home", 19], ["call", 19], ["much", 18], ["tell", 18], ["mean", 18], ["make", 18], ["take", 17], ["wait", 16], ["missed", 16], ["voice", 16], ["right", 16], ["today", 16], ["sure", 15], ["wanna", 15], ["thank", 15], ["thing", 15], ["lmaoo", 15], ["nice", 15], ["late", 15], ["they", 15], ["going", 15], ["cant", 14], ["time", 14], ["still", 14], ["need", 14], ["tmrw", 14], ["kinda", 14], ["physics", 14], ["back", 14]], "mostPopularEmojis": [["\ud83d\ude01", 35], ["\ud83d\ude33", 25], ["\ud83e\udd29", 19], ["\ud83d\ude2d", 16], ["\ud83e\udd2a", 11], ["\ud83d\udc80", 11], ["\u2764\ufe0f", 11], ["\ud83d\udc48", 10], ["\ud83d\ude4f", 10], ["\u2764", 10], ["\ud83e\udd72", 8], ["\ud83d\udc49", 8], ["\ud83d\udc4d", 7], ["\ud83e\udd14", 6], ["\ud83d\ude08", 6], ["\ud83e\udd13", 6], ["\ud83d\udc4c", 5], ["\u270b", 5], ["\ud83d\ude03", 5], ["\ud83d\udcaa", 5], ["\ud83d\ude0e", 4], ["\ud83d\ude14", 4], ["\ud83d\ude2c", 4], ["\ud83d\udc4f", 4], ["\ud83e\udd1d", 4], ["\ud83d\ude25", 4], ["\ud83d\ude44", 3], ["\ud83c\uddf8\ud83c\uddea", 3], ["\ud83e\udd28", 3], ["\ud83e\udd7a", 3], ["\ud83c\udf89", 3], ["\ud83d\ude2b", 3], ["\ud83e\udd37\ud83c\udffc\u200d\u2642", 2], ["\ud83c\udd7f\ufe0f", 2], ["\ud83c\udd7e\ufe0f", 2], ["\ud83d\ude0d", 2], ["\ud83d\ude1d", 2], ["\ud83d\ude09", 2], ["\ud83d\ude42", 2], ["\ud83e\udd2d", 2], ["\ud83d\ude00", 2], ["\ud83d\ude22", 2], ["\ud83d\ude23", 2], ["\ud83e\udee1", 2], ["\ud83c\udf77", 2], ["\ud83d\udca1", 2], ["\ud83e\udef4", 2], ["\ud83d\udc51", 2], ["\u2753", 2], ["\ud83d\ude19", 2]], "longestStreak": {"streak": 8, "from": "2024-04-19", "to": "2024-04-26"}, "longestSilence": {"silence": 46, "from": "2021-12-20", "to": "2022-02-04"}, "groupHistory": [], "personal": {"Aleksei Terin": {"convosEnded": 212, "convosStarted": 283, "averageResponseTime": 9979.106145251397, "screenTime": 138.6770428015564, "uniqueWords": 1373, "mostPopularWord": {"word": "lmao", "count": 162}, "emoji": "\ud83d\ude01", "iq": 146.711595571409}, "Haichuan Ma": {"convosStarted": 253, "convosEnded": 324, "averageResponseTime": 4972.050209205021, "screenTime": 118.89105058365759, "uniqueWords": 1292, "mostPopularWord": {"word": "come", "count": 21}, "emoji": "\ud83e\udd29", "iq": 136.87407035632364}}, "first10Messages": [["2021-08-21T17:06:00", "Aleksei Terin", "all good?"], ["2021-08-21T17:06:00", "Haichuan Ma", "Yeah"], ["2021-08-21T17:06:00", "Haichuan Ma", "Hbu?"], ["2021-08-21T17:06:00", "Aleksei Terin", "yup"], ["2021-08-21T17:06:00", "Aleksei Terin", "didnt throw up"], ["2021-08-21T17:06:00", "Aleksei Terin", "not yet atl"], ["2021-08-21T17:06:00", "Aleksei Terin", "why call?"], ["2021-08-21T17:06:00", "Haichuan Ma", "Accidwnt"], ["2021-08-21T17:07:00", "Aleksei Terin", "oh ok lol"], ["2021-08-21T17:07:00", "Haichuan Ma", "\ud83d\udc7d"]], "last10Messages": [["2024-06-14T17:21:00", "Haichuan Ma", "Cos I have to finish up Iskus gift and all"], ["2024-06-14T17:21:00", "Haichuan Ma", "sorry"], ["2024-06-14T06:51:00", "Aleksei Terin", "bruh"], ["2024-06-13T23:38:00", "Haichuan Ma", "Idk"], ["2024-06-13T20:45:00", "Aleksei Terin", "?"], ["2024-06-13T20:45:00", "Aleksei Terin", "are you coming to sleepover tmrrw_"], ["2024-06-13T20:40:00", "Aleksei Terin", "\ud83d\ude2d"], ["2024-06-11T20:57:00", "Aleksei Terin", "bless deez nuts"], ["2024-06-10T22:10:00", "Haichuan Ma", "I wouldnt say contaminate, more like bless"], ["2024-06-10T21:24:00", "Aleksei Terin", "istg ur gonna contaminate ur feed for years"]], "lastAnalyzed": "2024-07-06T08:24:48.530129"}`
      );
    };

    if (process.env.NODE_ENV === "development") {
      console.log("development env detected.");
      insertTestData();
    }
  }, []);

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
