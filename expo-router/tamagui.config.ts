import { config as configBase } from '@tamagui/config/v3';
import { merge } from "lodash-es";
import { createTamagui } from 'tamagui';
import { themes, tokens } from "./themes";

export const config = createTamagui(merge(configBase, { tokens }, { themes }) as typeof configBase)

export default config

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf { }
}
