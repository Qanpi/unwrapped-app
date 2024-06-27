import { ThemedText } from "@/components/ThemedText";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Avatar, Icon, ListItem } from "@rneui/base";
import { Button, Text } from "@rneui/themed";
import { Tabs } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatListItemProps = {
  title: string;
  lastUpdated: Date;
  messages: number;
};

const ChatListItem = ({ title, lastUpdated, messages }: ChatListItemProps) => {
  return (
    <ListItem>
      <ListItem.Content>
        {/* <Avatar></Avatar> */}
        <ListItem.Title>{title}</ListItem.Title>
        <ListItem.Subtitle>
          Last updated: {lastUpdated.toLocaleDateString()}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default function HomeScreen() {
  const chats = [
    // {
    //   title: "Tinpot",
    //   lastUpdated: new Date(),
    //   messages: 1000,
    // },
  ];

  return (
    <SafeAreaView style={common.topLevelView}>
      <Text style={common.subtitle}>Chats</Text>

      <Pressable
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        onPress={() => console.log("add chat")}
      >
        <View
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon name="note-add" style={{ marginRight: 5 }} />
          <Text>Import new chat</Text>
        </View>
      </Pressable>

      {chats.length > 0 ? (
        <ScrollView>
          {chats.map((chat) => (
            <ChatListItem {...chat} key={chat.title} />
          ))}
        </ScrollView>
      ) : (
        <>
          <Text>Learn how to get started.</Text>
        </>
      )}
    </SafeAreaView>
  );
}

export const common = StyleSheet.create({
  topLevelView: {
    paddingHorizontal: 35,
    paddingVertical: 30,
    display: "flex",
    gap: 10,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
  },
});
