import { useAssets } from "expo-asset";
import { ReactNode, useContext, useMemo } from "react";
import { Image } from "tamagui";
import seedrandom from "seedrandom";
import { AssetContext } from "app/Provider";

export function Decoration({ asset, x, y, size = 150 }) {
  const angle = Math.floor(Math.random() * 360);

  const height = size,
    width = size;

  return (
    <Image
      source={asset}
      width={width}
      height={height}
      position="absolute"
      objectFit="contain"
      resizeMode="contain"
      zIndex={-1}
      top={y}
      left={x}
      transform={[
        { translateX: -width / 2 },
        { translateY: -height / 2 },
        { rotateZ: `${angle}deg` },
      ]}
    ></Image>
  );
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.max(Math.min(x, hi), lo);

export const useCornerDecorations = (
  width: number,
  height: number,
  count: number,
  seed?: string
) => {
  const assets = useContext(AssetContext);

  if (!assets) return [];
  const DECORATION_COUNT = assets.length;

  if (seed) seedrandom(seed, { global: true });
  //TODO: match order across cards?
  const randomAssetId = Math.floor(Math.random() * DECORATION_COUNT);
  const decorations: ReactNode[] = [];

  //TODO: add RNG seeding
  for (let i = 0; i < count; i++) {
    const columns = 6;
    const rows = 8;

    const column = Math.floor(width / columns);
    const row = Math.floor(height / rows);

    const inset = 20;
    const minX = clamp((i % 2) * column * (columns - 1), inset, width - inset);
    const minY = clamp(
      Math.floor(i / 2) * row * (rows - 1),
      inset,
      height - inset
    );

    const maxX = minX + column;
    const maxY = minY + row;

    decorations.push(
      <Decoration
        key={i}
        asset={assets[(randomAssetId + i) % DECORATION_COUNT]}
        x={Math.random() * (maxX - minX) + minX}
        y={Math.random() * (maxY - minY) + minY}
      ></Decoration>
    );
  }

  return decorations;
};
