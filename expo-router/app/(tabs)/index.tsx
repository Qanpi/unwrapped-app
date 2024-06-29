import { FilePlus } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import {
  Button,
  ListItem,
  Paragraph,
  XStack,
  YGroup,
  YStack
} from "tamagui";

function ChatListItem({ name, lastUpdated }) {
  return (
    <YGroup.Item>
      <ListItem
        onPress={() => router.navigate(`chat/${name}`)}
        pressTheme
        title={
          <XStack>
            <Paragraph>{name}</Paragraph>
          </XStack>
        }
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
  return (
    <DefaultYStack>
      <YStack width="100%">
        <Button
          justifyContent="flex-start"
          variant="outlined"
          chromeless
          icon={FilePlus}
        >
          Import new chat
        </Button>
        <YGroup>
          <ChatListItem name="Tinpot"></ChatListItem>
          <ChatListItem name="Tinpot"></ChatListItem>
        </YGroup>
      </YStack>
    </DefaultYStack>
  );
}
