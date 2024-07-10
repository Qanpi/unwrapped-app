import { forwardRef, useContext } from "react";
import { type GetProps, Card, H4 } from "tamagui";
import { WrappedContext } from "./chat/[name]";
import { useCornerDecorations } from "./chat/Decoration";
import { WaterMark } from "./WaterMark";

type BaseCardProps = {
  index?: number;
  watermark?: boolean;
  seed?: string;
} & GetProps<typeof Card.Background>;

export const BaseCard = forwardRef(function BaseCard(
  { children, index, watermark = true, seed, ...rest }: BaseCardProps,
  ref
) {
  const { width, height } = useContext(WrappedContext);

  const decorations = useCornerDecorations(width, height, 4, seed);

  return (
    <Card ref={ref} collapsable={false} width={width} height={height} px="$2">
      <Card.Header>
        <H4>{index && String(index).padStart(2, "0")}</H4>
      </Card.Header>
      <Card.Background
        alignItems="center"
        justifyContent="center"
        gap="$2"
        p="$3"
        //allow press events
        pointerEvents="auto"
        {...rest}
      >
        {decorations}
        {children}
      </Card.Background>
      <Card.Footer>{watermark ? <WaterMark></WaterMark> : null}</Card.Footer>
    </Card>
  );
});
