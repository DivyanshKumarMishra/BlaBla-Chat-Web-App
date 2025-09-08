import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { closeChat } from '../../../slices/ChatSlice';
import { getSender, getShortName } from '../../../utils';
import Avatar from '../../common/Avatar';
import { useEffect, useState } from 'react';
import { useSocket } from '../../../contexts/SocketContext';

const getStatus = (map, chat, senderId) => {
  // console.log(map, senderId, chat);
  console.log(map, senderId);
  if (chat?.isGroupChat) return null;
  const memberId = chat?.members?.find((id) => id !== senderId)?._id;
  return map[memberId] ? 'Online' : 'Offline';
};

function ChatHeader({ modalOpen, handleModal = () => {} }) {
  const { socket } = useSocket();
  const { selectedChat, onlineStatusMap } = useSelector(
    (state) => state.chatData
  );
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const { name, isGroupChat, members } = selectedChat;
  const recentChat = getSender(user, members);
  const chatImage = isGroupChat ? '' : recentChat?.image;
  // const [singleChatStatus, setSingleChatStatus] = useState(null);

  // useEffect(() => {
  //   socket.emit('online-status');
  // }, []);

  return (
    <div className="h-16 bg-white border-b-2 border-gray-300 flex flex-row shadow-xs">
      <div className="flex gap-5 items-center justify-between w-full px-5 md:px-5">
        <div className="flex gap-3 items-center justify-center">
          <div className="h-full flex items-center justify-start gap-4 py-2 px-3 cursor-pointer">
            {!isGroupChat && (
              <Avatar
                image={chatImage}
                className="bg-gray-200 size-12 rounded-full shadow-md"
                textSize="text-base"
                text={getShortName(isGroupChat ? name : recentChat?.name)}
              />
            )}
            <div className="text-base lg:text-xl font-semibold text-gray-500">
              {isGroupChat ? name : recentChat?.name}
              {/* {!selectedChat?.isGroupChat && singleChatStatus && (
                <div className="text-sm text-gray-400">{singleChatStatus}</div>
              )} */}
            </div>
          </div>
        </div>
        <div className="flex gap-5 items-center justify-center">
          {isGroupChat && (
            <button
              onClick={async () => {
                handleModal();
              }}
            >
              {modalOpen ? (
                <EyeSlashIcon className="text-primary size-6" />
              ) : (
                <EyeIcon className="text-primary size-6" />
              )}
            </button>
          )}
          <button
            onClick={async () => {
              dispatch(closeChat());
            }}
          >
            <XMarkIcon className="text-primary hover:text-white hover:bg-primary rounded-full size-6 duration-300 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
