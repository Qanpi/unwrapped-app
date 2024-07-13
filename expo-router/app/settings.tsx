import { SafeAreaView } from 'react-native-safe-area-context'
import { Anchor, Paragraph, Text, View, XStack, YStack } from 'tamagui'
import { DefaultYStack } from './(tabs)'

export default function ModalScreen() {
  return (
    <SafeAreaView>
      <DefaultYStack>
        <Text>settings</Text>
      </DefaultYStack>
    </SafeAreaView>
  )
}
