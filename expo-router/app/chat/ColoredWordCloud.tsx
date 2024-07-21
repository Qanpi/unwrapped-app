import { Paragraph } from "tamagui";
import WordCloud from "../../react-native-wordcloud";

export const ColoredWordCloud = ({ words, width, height }) => {
  const minFont = 10;
  const maxFont = 40;
  const fontOffset = 10;

  //asume sorted
  const counts = words.map(([_, count]) => count);

  const getColor = (count: number) => {
    const pos = counts.findIndex((c) => c === count);

    if (pos < 5) {
      return "$accent";
    }

    return "$background2";
  };

  return (
    <WordCloud
      renderWord={(text, style, onLayout) => {
        const color = style.color;
        delete style.color;

        return (
          <Paragraph
            style={{
              ...style,
              fontSize: style.fontSize - 3,
              fontWeight: 800,
            }}
            color={color}
            onTextLayout={onLayout}
          >
            {text}
          </Paragraph>
        );
      }}
      options={{
        words: words.map(([word, count]) => {
          return { text: word, value: count, color: getColor(count) }; //TODO: colors
        }),
        verticalEnabled: true,
        minFont,
        maxFont,
        fontOffset,
        width,
        height,
      }}
    ></WordCloud>
  );
};
