/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setupSocket } from '../services/socket';
import {
  addMessagesToChat,
  removeTypingUser,
  setTypingUser,
  addToNotifications,
  sortChats,
  updateUserStatus,
} from '../slices/ChatSlice';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const { user } = useSelector((state) => state.userData);
  const { selectedChat, notifications } = useSelector(
    (state) => state.chatData
  );
  const dispatch = useDispatch();
  // const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const selectedChatRef = useRef(selectedChat);
  const notificationsRef = useRef(notifications);

  // useEffect(() => {
  //   socketRef.current = socket;
  // }, [socket]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (user?.id) {
      const new_socket = setupSocket({ userId: user.id });
      new_socket.emit('setup', user.id);
      setSocket(new_socket);

      // new_socket.on('online-status', (onlineUsers) => {
      //   console.log('online-status', onlineUsers);
      //   dispatch(
      //     updateUserStatus(
      //       onlineUsers.map((id) => ({ user_id: id, online: true }))
      //     )
      //   );
      // });

      // new_socket.on('online', (userId) => {
      //   dispatch(updateUserStatus({ user_id: userId, online: true }));
      // });

      // new_socket.on('offline', (userId) => {
      //   dispatch(updateUserStatus({ user_id: userId, online: false }));
      // });

      new_socket.on('message-received', (newMessage) => {
        // console.log(newMessage);
        if (
          !selectedChatRef.current ||
          selectedChatRef.current._id !== newMessage.chat._id
        ) {
          // if message is received from a chat other than selected chat then give notifications
          const new_notifications = notificationsRef.current;
          const existingChatIndex = new_notifications.findIndex(
            (not) => not.chat?._id === newMessage.chat._id
          );

          if (existingChatIndex !== -1) {
            const updatedNotifications = [
              ...new_notifications.slice(0, existingChatIndex),
              newMessage,
              ...new_notifications.slice(existingChatIndex + 1),
            ];
            dispatch(addToNotifications(updatedNotifications));
          } else {
            dispatch(addToNotifications(newMessage));
          }
        } else {
          dispatch(addMessagesToChat(newMessage));
          dispatch(sortChats());
        }
      });

      new_socket.on('typing', ({ userId, roomId }) => {
        dispatch(setTypingUser({ userId, roomId }));
      });

      new_socket.on('stop-typing', ({ userId, roomId }) => {
        dispatch(removeTypingUser({ userId, roomId }));
      });

      const handleBeforeUnload = () => {
        // new_socket.emit('offline', user.id);
        new_socket.disconnect();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.addEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  );
}
