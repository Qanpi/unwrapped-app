import { config as configBase } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { themes, tokens } from "./themes";
import { merge } from "lodash-es"

export const config = createTamagui(merge(configBase, { tokens }, { themes }))

export default config

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf { }
}
