import { HelpCircle } from "@tamagui/lucide-icons";
import { usePremium } from "app/paywall";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import {
  Button,
  View,
  XStack,
  Paragraph,
  Popover,
  Adapt,
  YStack,
  H6,
  H1,
  Spacer,
} from "tamagui";

function formatTime(seconds) {
  // Hours, minutes and seconds
  const hrs = ~~(seconds / 3600);
  const mins = ~~((seconds % 3600) / 60);
  const secs = ~~seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}min`;
  }

  if (mins > 0) {
    return `${mins}min ${secs}sec`;
  }

  return `${secs}sec`;
}

const StatRow = ({ title, stat, blur }) => {
  const style = blur
    ? {
        color: "#fff0",

        shadowOpacity: 1,
        shadowColor: "#000",
        shadowRadius: 15,

        textShadowColor: "rgba(255,255,255,0.5)",
        textShadowOffset: {
          width: 0,
          height: 0,
        },
        textShadowRadius: 15,
      }
    : {};

  const router = useRouter();

  const statParagraph = (
    <Paragraph userSelect={"none"} style={style}>
      {stat}
    </Paragraph>
  );

  return (
    <XStack justifyContent="space-between">
      <Paragraph>{title} </Paragraph>

      {!blur ? (
        statParagraph
      ) : (
        <TouchableOpacity
          hitSlop={5}
          onPress={() => router.navigate("/paywall")}
        >
          {statParagraph}
        </TouchableOpacity>
      )}
    </XStack>
  );
};

type StatRowTemplateProps = {
  stats: Partial<PersonalStats>;
  paywall?: boolean;
};
export const StatRowTemplate = ({
  stats,
  paywall = true,
}: StatRowTemplateProps) => {
  const template = [
    {
      title: "Personality type:",
      stat: stats.personalityType,
    },
    {
      title: "IQ:",
      stat: stats.iq?.toFixed(1),
    },
    {
      title: "Convos started:",
      stat: stats.convosStarted,
    },
    {
      title: "Convos killed:",
      stat: stats.convosEnded,
    },
    {
      title: "Response time:",
      stat: stats.averageResponseTime
        ? "~" + formatTime(stats.averageResponseTime)
        : undefined,
    },
    {
      title: "Screen time:",
      stat: stats.screenTime ? "~" + formatTime(stats.screenTime) : undefined,
    },
  ];

  return (
    <>
      {template.map((row) => (
        <StatRow title={row.title} stat={row.stat} blur={paywall}></StatRow>
      ))}
    </>
  );
};

interface PersonalStats {
  personalityType: string;
  mostPopularWord: { word: string; count: number };
  emoji: string;
  MBTI: string;
  iq: number;
  convosEnded: number;
  convosStarted: number;
  averageResponseTime: number;
  screenTime: number;
}

export const PersonalStats = ({
  name,
  stats,
}: {
  name: string;
  stats: PersonalStats;
}) => {
  const InfoTooltip = () => {
    return (
      <Popover size="$5">
        <Popover.Trigger alignSelf="flex-end" asChild>
          <Button chromeless iconAfter={HelpCircle} fontSize={10} opacity={0.5}>
            How are these calculated
          </Button>
        </Popover.Trigger>

        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Popover.Sheet>
        </Adapt>

        <Popover.Content
          borderWidth={1}
          borderColor="$borderColor"
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

          <YStack>
            <View>
              <H6>Personality type</H6>
              <Paragraph>how this is calculated</Paragraph>
            </View>
          </YStack>
        </Popover.Content>
      </Popover>
    );
  };

  const isPremium = usePremium();

  return (
    <>
      <H1 fontSize={100} lineHeight={150} mb="$-4" mt="$-10">
        {stats.emoji || "🛇"}
      </H1>
      <H6 mb="$-3">{name}</H6>
      {stats.mostPopularWord.count > 0 ? (
        <Paragraph fontSize={10}>
          said '{stats.mostPopularWord.word}' {stats.mostPopularWord.count}{" "}
          times
        </Paragraph>
      ) : null}
      <Spacer></Spacer>
      <YStack width="80%">
        <StatRowTemplate
          stats={stats}
          paywall={!(isPremium === true)}
        ></StatRowTemplate>
        <InfoTooltip></InfoTooltip>
      </YStack>
    </>
  );
};
