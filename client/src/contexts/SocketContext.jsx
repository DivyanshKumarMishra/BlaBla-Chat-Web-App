import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setupSocket } from '../services/socket';
import { addMessagesToChat, sortChannels, sortDMs } from '../slices/ChatSlice';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const socket = useRef(null);
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const chat = useSelector(state => state.chatData)
  const chatRef = useRef(chat)

  useEffect(() => {
      chatRef.current = chat
  }, [chat])

  useEffect(() => {
    if (user) {
      socket.current = setupSocket({ userId: user.id });

      // connect socket to server when user logs in
      socket.current.on('connect', () => console.log('Connected'));

      const receiveMessage = (message) => {
        // console.log(message)
        const {selectedChatType, selectedChat} = chatRef.current    
        if (
          selectedChatType !== undefined &&
          (selectedChat?._id === message.sender._id ||
            selectedChat?._id === message.receiver._id)
        ) {
          dispatch(addMessagesToChat({messages: message, multiple: false}));
        }
        dispatch(sortDMs({message, userId: user.id}))
      };

      const receiveChannelMessage = (message) => {
        // console.log(message)
        const {selectedChatType, selectedChat} = chatRef.current    
        if (selectedChatType !== undefined && selectedChat?._id === message.channelId)
        {
          dispatch(addMessagesToChat({messages: message, multiple: true}));
        }
          dispatch(sortChannels(message))
      };

      socket.current.on('receive-message', receiveMessage);
      socket.current.on('receive-channel-message', receiveChannelMessage);

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
}
