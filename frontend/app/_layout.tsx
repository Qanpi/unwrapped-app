import { ThemedText } from "@/components/ThemedText";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Button, Icon, ListItem, Text } from "@rneui/themed";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  TouchableHighlightBase,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";

import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuProvider,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import "../tamagui-web.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";

import { tamaguiConfig } from "../tamagui.config";

interface HeaderDropdownProps {
  children: string;
  tintColor?: string;
}

function HeaderDropdown({ children, tintColor }: HeaderDropdownProps) {
  type Integration = {
    title: string;
    supported: boolean;
  };

  const integrations: Integration[] = [
    { title: "WhatsApp", supported: true },
    { title: "Coming soon...", supported: false },
  ];

  const [selected, setSelected] = useState<Integration>(integrations[0]);

  return (
    <>
      <SelectDropdown
        data={integrations}
        defaultValue={selected}
        disabledIndexes={integrations.map((integration, i) =>
          integration.supported ? -1 : i
        )}
        onSelect={(selectedItem: Integration, index) => {
          setSelected(selectedItem);
        }}
        dropdownOverlayColor="transparent"
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button type="clear" disabled>
                <Icon name="arrow-drop-down"></Icon>
                <Text h4>{selectedItem?.title || ""}</Text>
              </Button>
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <SafeAreaView>
              <ListItem>
                <ListItem.Content>
                  <Text>{item.title}</Text>
                </ListItem.Content>
              </ListItem>
            </SafeAreaView>
          );
        }}
        showsVerticalScrollIndicator={false}
      ></SelectDropdown>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <MenuProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack
                screenOptions={{
                  headerTintColor: "black",
                  headerTitle: (props) => (
                    <HeaderDropdown {...props}></HeaderDropdown>
                  ),
                  headerRight: (props) => (
                    <Link href={"/settings"}>
                      <Icon name="settings"></Icon>
                    </Link>
                  ),
                }}
              >
                <Stack.Screen name="(tabs)" options={{ title: "WhatsApp" }} />
                <Stack.Screen
                  name="settings"
                  options={{ headerTitle: "Settings", headerRight: undefined }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </TamaguiProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </MenuProvider>
  );
}
