import "../tamagui-web.css";

import { useEffect } from "react";
import { Platform, TouchableOpacity, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, SplashScreen, Stack, useRouter } from "expo-router";
import { Provider } from "./Provider";
import { Share, Share2, X } from "@tamagui/lucide-icons";
import { ShareIntentProvider } from "expo-share-intent";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

if (Platform.OS === "ios") {
  //  Purchases.configure({apiKey: });
  throw new Error("IOS not yet supported.");
} else if (Platform.OS === "android") {
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_RC_GOOGLE_API_KEY,
  });
}

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ShareIntentProvider
      options={{
        // debug: true,
        resetOnBackground: true,
        onResetShareIntent: () => {
          router.replace({
            pathname: "/",
          });
        },
      }}
    >
      <Provider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="settings"
              options={{
                title: "Settings",
                presentation: "card",
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen name="chat/[name]" />
            <Stack.Screen
              name="paywall"
              options={{
                presentation: "modal",
              }}
            />
          </Stack>
        </ThemeProvider>
      </Provider>
    </ShareIntentProvider>
  );
}
