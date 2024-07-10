import { useColorScheme } from "react-native";
import {
  PortalProvider,
  TamaguiProvider,
  type TamaguiProviderProps,
} from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { CurrentToast } from "./CurrentToast";
import { config } from "../tamagui.config";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ShareIntentProvider,
  useShareIntent,
  useShareIntentContext,
} from "expo-share-intent";

const queryClient = new QueryClient();

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) {
  const colorScheme = useColorScheme();

  return (
    
      <TamaguiProvider config={config} defaultTheme={"unwrapped"} {...rest}>
        <PortalProvider shouldAddRootHost>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <ToastProvider
                swipeDirection="horizontal"
                duration={3000}
                native={
                  [
                    /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
                    // 'mobile'
                  ]
                }
              >
                {children}
                <CurrentToast />
                <ToastViewport top="$8" left={0} right={0} />
              </ToastProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </PortalProvider>
      </TamaguiProvider>
    
  );
}
