import dayjs from "dayjs";
import { GiftedChat } from "react-native-gifted-chat";

export const WrappedChat = ({ messages }) => {
  return (
    <GiftedChat
      renderInputToolbar={() => null}
      messages={messages.map(([date, author, text], i) => {
        return {
          _id: date + i + text,
          createdAt: dayjs(date).toDate(),
          user: {
            _id: author,
            name: author,
          },
          text: text,
        };
      })}
      user={{
        _id: 1,
      }}
    ></GiftedChat>
  );
};
