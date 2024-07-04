import { FilePlus } from "@tamagui/lucide-icons";
import WordCloud from "rn-wordcloud";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { Button, ListItem, Paragraph, XStack, YGroup, YStack } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";

function ChatListItem({ name, lastUpdated }: { name: string }) {
  const displayName = name.startsWith("WhatsApp Chat with ")
    ? name.slice(20)
    : name;

  return (
    <YGroup.Item>
      <ListItem
        onPress={() => router.navigate(`chat/${name}`)}
        pressTheme
        title={displayName}
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

export default function ChatsScreen() {
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

    await AsyncStorage.setItem(name, JSON.stringify({ uri }));

    router.navigate(`chat/${name}`);
  };

  useEffect(() => {
    const insertTestData = async () => {
      await AsyncStorage.setItem(
        "haichuan.txt",
        '{"timespan": {"from": "2021-08-21T17:06:00", "to": "2024-06-14T17:21:00", "days": 1028}, "total": {"messages": 3351, "words": 10867}, "messagesPerPerson": [["Aleksei Terin", 1745, 0.5207400775887795], ["Haichuan Ma", 1606, 0.4792599224112205]], "messagesByHour": [36, 4, 0, 0, 1, 0, 10, 22, 95, 104, 96, 119, 158, 362, 169, 154, 184, 160, 183, 136, 201, 400, 581, 176], "longestDayRange": "From 12 AM to 09 PM on Sep 12 2021.", "mostPopularWords": [["lmao", 168], ["good", 61], ["like", 56], ["send", 39], ["thanks", 38], ["sorry", 38], ["there", 36], ["well", 33], ["come", 33], ["dont", 31], ["notes", 30], ["from", 30], ["think", 28], ["could", 26], ["gonna", 26], ["then", 25], ["didnt", 23], ["when", 22], ["coming", 22], ["aight", 20], ["tack", 20], ["home", 19], ["call", 19], ["much", 18], ["tell", 18], ["mean", 18], ["make", 18], ["take", 17], ["wait", 16], ["missed", 16], ["voice", 16], ["right", 16], ["today", 16], ["sure", 15], ["wanna", 15], ["thank", 15], ["thing", 15], ["lmaoo", 15], ["nice", 15], ["late", 15], ["they", 15], ["going", 15], ["cant", 14], ["time", 14], ["still", 14], ["need", 14], ["tmrw", 14], ["kinda", 14], ["physics", 14], ["back", 14]], "mostPopularEmojis": [["\ud83d\ude01", 35], ["\ud83d\ude33", 25], ["\ud83e\udd29", 19], ["\ud83d\ude2d", 16], ["\ud83e\udd2a", 11], ["\ud83d\udc80", 11], ["\u2764\ufe0f", 11], ["\ud83d\udc48", 10], ["\ud83d\ude4f", 10], ["\u2764", 10], ["\ud83e\udd72", 8], ["\ud83d\udc49", 8], ["\ud83d\udc4d", 7], ["\ud83e\udd14", 6], ["\ud83d\ude08", 6], ["\ud83e\udd13", 6], ["\ud83d\udc4c", 5], ["\u270b", 5], ["\ud83d\ude03", 5], ["\ud83d\udcaa", 5], ["\ud83d\ude0e", 4], ["\ud83d\ude14", 4], ["\ud83d\ude2c", 4], ["\ud83d\udc4f", 4], ["\ud83e\udd1d", 4], ["\ud83d\ude25", 4], ["\ud83d\ude44", 3], ["\ud83c\uddf8\ud83c\uddea", 3], ["\ud83e\udd28", 3], ["\ud83e\udd7a", 3], ["\ud83c\udf89", 3], ["\ud83d\ude2b", 3], ["\ud83e\udd37\ud83c\udffc\u200d\u2642", 2], ["\ud83c\udd7f\ufe0f", 2], ["\ud83c\udd7e\ufe0f", 2], ["\ud83d\ude0d", 2], ["\ud83d\ude1d", 2], ["\ud83d\ude09", 2], ["\ud83d\ude42", 2], ["\ud83e\udd2d", 2], ["\ud83d\ude00", 2], ["\ud83d\ude22", 2], ["\ud83d\ude23", 2], ["\ud83e\udee1", 2], ["\ud83c\udf77", 2], ["\ud83d\udca1", 2], ["\ud83e\udef4", 2], ["\ud83d\udc51", 2], ["\u2753", 2], ["\ud83d\ude19", 2]], "longestStreak": {"streak": 8, "from": "2024-04-19", "to": "2024-04-26"}, "longestSilence": {"silence": 46, "from": "2021-12-20", "to": "2022-02-04"}, "groupHistory": [], "lastAnalyzed": "2024-07-04T23:51:20.491205"}'
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

  return (
    <DefaultYStack>
      <YStack width="100%">
        <Button
          justifyContent="flex-start"
          variant="outlined"
          chromeless
          icon={FilePlus}
          onPress={handlePressImport}
        >
          Import new chat
        </Button>
        <YGroup>
          {chats?.map(([name, data]) => {
            const parsed = JSON.parse(data);
            return (
              <ChatListItem
                key={name}
                name={name}
                lastUpdated={dayjs(parsed.lastAnalyzed).format("L")}
              ></ChatListItem>
            );
          })}
        </YGroup>
      </YStack>
    </DefaultYStack>
  );
}
