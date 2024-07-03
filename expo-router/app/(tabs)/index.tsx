import { FilePlus } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { Button, ListItem, Paragraph, XStack, YGroup, YStack } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

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
