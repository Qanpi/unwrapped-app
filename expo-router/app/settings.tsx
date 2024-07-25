import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gem, Milestone, Trash } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListItem, Paragraph, YGroup } from "tamagui";
import packageJSON from "../package.json";
import { usePremium } from "./paywall";

export default function ModalScreen() {
  const isPremium = usePremium();

  const queryClient = useQueryClient();
  const handleDeleteAll = async () => {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    queryClient.invalidateQueries({
      queryKey: ["chats"],
    });
  };

  return (
    <SafeAreaView>
      <YGroup>
        <YGroup.Item>
          <ListItem icon={<Gem></Gem>} title={"My tier"}>
            <ListItem.Subtitle>
              {isPremium === false ? "Free" : "Premium"}
            </ListItem.Subtitle>
          </ListItem>
        </YGroup.Item>
        <YGroup.Item>
          <ListItem icon={<Milestone></Milestone>} title={"App version"}>
            <ListItem.Subtitle>{packageJSON.version}</ListItem.Subtitle>
          </ListItem>
        </YGroup.Item>
        <YGroup.Item>
          <ListItem
            icon={<Trash></Trash>}
            pressTheme
            title={<Paragraph color="$red6">Delete all data</Paragraph>}
            onPress={handleDeleteAll}
          >
            <ListItem.Subtitle>
              Permanently removes all analyzed conversations.
            </ListItem.Subtitle>
          </ListItem>
        </YGroup.Item>
      </YGroup>
    </SafeAreaView>
  );
}
