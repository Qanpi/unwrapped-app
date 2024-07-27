import { useWrappedCards } from "app/chat/[name]";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { H4, Image, ScrollView, View, XStack } from "tamagui";
import { DefaultYStack } from ".";

export default function HowToScreen() {
  const scrollIndex = useRef(0);

  const { height, gap, padding } = useWrappedCards();
  const width = height * (9 / 20);

  return (
    <SafeAreaView style={{ alignItems: "center" }}>
      <H4>Follow the 3 steps below</H4>
      <DefaultYStack>
        <ScrollView
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / (width + gap));
            scrollIndex.current = index;
          }}
          horizontal
          snapToInterval={width + gap}
          decelerationRate={0.85}
          flexGrow={0}
        >
          <XStack gap={gap} px={padding}>
            <View w={width}>
              <Image
                objectFit="contain"
                resizeMode="contain"
                source={{
                  uri: require("assets/images/tutorial/1.jpg"),
                  width: width,
                  height: height,
                }}
              ></Image>
            </View>
            <View w={width} h={height}>
              <Image
                objectFit="contain"
                resizeMode="contain"
                source={{
                  uri: require("assets/images/tutorial/2.jpg"),
                  width: width,
                  height: height,
                }}
              ></Image>
            </View>
            <View w={width} h={height}>
              <Image
                objectFit="contain"
                resizeMode="contain"
                source={{
                  uri: require("assets/images/tutorial/3.jpg"),
                  width: width,
                  height: height,
                }}
              ></Image>
            </View>
            <View w={width} h={height}>
              <Image
                objectFit="contain"
                resizeMode="contain"
                source={{
                  uri: require("assets/images/tutorial/4.jpg"),
                  width: width,
                  height: height,
                }}
              ></Image>
            </View>
            <View w={width} h={height}>
              <Image
                objectFit="contain"
                resizeMode="contain"
                source={{
                  uri: require("assets/images/tutorial/5.jpg"),
                  width: width,
                  height: height,
                }}
              ></Image>
            </View>
          </XStack>
        </ScrollView>
      </DefaultYStack>
    </SafeAreaView>
  );
}
