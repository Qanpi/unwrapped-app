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
import { createContext } from "react";
import { Asset, useAssets } from "expo-asset";

const queryClient = new QueryClient();

export const AssetContext = createContext<Asset[] | null>(null);

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) {
  const colorScheme = useColorScheme();

  //order is chosen so that at least one 3D rainbow element is present
  const assetSources = [
    require(`../assets/images/decorations/cloud.png`), //3D
    require(`../assets/images/decorations/red.png`),
    require(`../assets/images/decorations/metal.png`),
    require(`../assets/images/decorations/stripe.png`),
    require(`../assets/images/decorations/flower.png`), //3D
    require(`../assets/images/decorations/spill.png`),
    require(`../assets/images/decorations/signature.png`),
    require(`../assets/images/decorations/palm.png`),
  ];

  //FIXME: handle errors
  const [assets, errors] = useAssets(assetSources);

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
              <AssetContext.Provider value={assets}>{children}</AssetContext.Provider>
              <CurrentToast />
              <ToastViewport top="$8" left={0} right={0} />
            </ToastProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
