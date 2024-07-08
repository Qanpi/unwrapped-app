import { Image, Paragraph, XStack } from "tamagui";


export const WaterMark = () => {
  return (
    <XStack alignItems="center" gap="$1">
      <Image
        source={{
          uri: require("./../assets/images/logo_96.png"),
          width: 12,
          height: 12,
        }}
      ></Image>
      <Paragraph fontSize={11}>Unwrapped</Paragraph>
    </XStack>
  );
};
