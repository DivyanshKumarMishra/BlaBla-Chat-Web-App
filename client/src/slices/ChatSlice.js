import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChat: null,
  selectedChatMessages: [],
  typingUsers: [],
  onlineStatusMap: {},
  chats: [],
  notifications: [],
  userOnline: false,
  isUploading: false,
  isDownloading: false,
  activeTab: 'dm'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    setChatInfo: (state, action) => {
      state.selectedChat = action.payload;
    },

    setChats: (state, action) => {
      state.chats = Array.isArray(action.payload)
        ? action.payload
        : [action.payload, ...state.chats];
    },

    addMessagesToChat: (state, action) => {
      const messages = action.payload;

      state.selectedChatMessages = Array.isArray(messages)
        ? messages
        : [...state.selectedChatMessages, messages];

      // Determine the latest message based on createdAt
      let latestMessage = null;
      if (Array.isArray(messages)) {
        latestMessage = messages.reduce((latest, msg) => {
          if (!latest) return msg;
          return new Date(msg.createdAt) > new Date(latest.createdAt)
            ? msg
            : latest;
        }, null);
      } else {
        latestMessage = messages;
      }

      if (latestMessage) {
        const chatIndex = state.chats.findIndex(
          (c) => c._id === latestMessage.chat._id
        );

        if (chatIndex > -1) {
          state.chats[chatIndex].latestMessage = latestMessage;
        }
      }
    },

    addToNotifications: (state, action) => {
      state.notifications = Array.isArray(action.payload)
        ? action.payload
        : [action.payload, ...state.notifications];
    },

    addMessageToSpecificChat: (state, action) => {
      const chatId = action.payload?.chat?._id;
      const chatIndex = state.chats.findIndex((c) => c._id === chatId);

      if (chatIndex !== -1) {
        state.chats[chatIndex].messages = [
          action.payload,
          ...state.chats[chatIndex].messages,
        ];

        state.chats[chatIndex].latestMessage = action.payload;
      }
    },

    sortChats: (state) => {
      state.chats.sort((a, b) => {
        const aTime =
          a.latestMessage && a.latestMessage.createdAt
            ? new Date(a.latestMessage.createdAt)
            : new Date(a.updatedAt);

        const bTime =
          b.latestMessage && b.latestMessage.createdAt
            ? new Date(b.latestMessage.createdAt)
            : new Date(b.updatedAt);

        return bTime - aTime;
      });
    },

    closeChat: (state) => {
      state.selectedChat = null;
      state.selectedChatMessages = [];
    },

    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },

    setIsDownloading: (state, action) => {
      state.isDownloading = action.payload;
    },

    setTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },

    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (tu) =>
          tu.userId !== action.payload.userId &&
          tu.roomId !== action.payload.roomId
      );
    },

    updateUserStatus: (state, action) => {
      if (Array.isArray(action.payoad)) {
        state.onlineStatusMap = action.payload;
      } else {
        const { user_id, online } = action.payload;
        state.onlineStatusMap[user_id] = online;
      }
    },
  },
});

export const {
  setActiveTab,
  setChatInfo,
  setChats,
  closeChat,
  addMessagesToChat,
  addToNotifications,
  addMessageToSpecificChat,
  sortChats,
  setIsUploading,
  setIsDownloading,
  setTypingUser,
  removeTypingUser,
  updateUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
