import { H4, Text, View } from "tamagui";
import { HeaderDropdown } from "./_layout";
import { DefaultYStack } from ".";
import { Paywall } from "app/Paywall";

export default function HowToScreen() {
  return (
    <DefaultYStack>
      <H4>Get started</H4>
      <Paywall></Paywall>
    </DefaultYStack>
  );
}
