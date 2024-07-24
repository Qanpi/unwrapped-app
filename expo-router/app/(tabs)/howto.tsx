import { H4, useTheme } from "tamagui";
import { DefaultYStack } from ".";

export default function HowToScreen() {
  const theme = useTheme({ name: "dark" });

  return (
    <DefaultYStack>
      <H4>Get started</H4>
    </DefaultYStack>
  );
}
