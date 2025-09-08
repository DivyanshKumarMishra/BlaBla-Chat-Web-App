import { useSelector, useDispatch } from 'react-redux';
import {
  addMessagesToChat,
  setChatInfo,
  sortChats,
} from '../../slices/ChatSlice';
import { formatTimestamp, getSender, getShortName } from '../../utils';
import Avatar from '../common/Avatar';

function ContactList({ isGroup = false, handleSidebar = () => {} }) {
  const { selectedChat, chats } = useSelector((state) => state.chatData);
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const filteredChats = chats.filter((chat) =>
    isGroup ? chat.isGroupChat : !chat.isGroupChat
  );

  const handleClick = (chat) => {
    if (chat._id === selectedChat?._id) return;
    dispatch(setChatInfo(chat));
    dispatch(addMessagesToChat([]));
    dispatch(sortChats());
    handleSidebar();
  };

  return (
    <div className="mt-1 flex flex-col gap-2">
      {filteredChats?.map((chat) => {
        const { name, _id, latestMessage, members, isGroupChat, createdAt } =
          chat;
        const dmSender = getSender(user, members);
        // console.log(chat);

        return (
          <div
            key={_id}
            className={`flex items-center justify-start gap-4 py-2 px-3 rounded-md cursor-pointer transition-colors
              ${
                selectedChat && selectedChat._id === _id
                  ? 'bg-primary text-white'
                  : 'bg-indigo-200 text-primary hover:bg-indigo-400 hover:text-white'
              }`}
            onClick={(e) => {
              handleClick(chat);
            }}
          >
            {!isGroupChat && (
              <Avatar
                image={dmSender.image}
                className="bg-gray-200 size-10 md:size-12 shadow-md w-fit"
                textSize="text-sm md:text-base lg:text-lg"
                text={getShortName(dmSender.name)}
                useImageFit={true}
              />
            )}

            <div className="flex flex-col space-y-1 w-full min-w-0">
              <div className="text-sm md:text-base font-semibold">
                {isGroup ? name : dmSender.name}
              </div>

              <div className="flex justify-between overflow-hidden">
                {latestMessage?.content && (
                  <div className="text-xs md:text-sm truncate max-w-[40vw] overflow-hidden flex-shrink">
                    {`${latestMessage?.sender?.name?.split(' ')[0]}: ${
                      latestMessage?.content
                    }`}
                  </div>
                )}

                {(latestMessage?.createdAt || createdAt) && (
                  <div className="text-xs md:text-sm truncate">
                    {formatTimestamp(latestMessage?.createdAt || createdAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ContactList;
