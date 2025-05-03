import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChatType: null,
  selectedChat: null,
  selectedChatMessages: [],
  dms: [],
  isUploading: false,
  isDownloading:false,
  channels:[],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatInfo: (state, action) => {
      state.selectedChatType = action.payload.selectedChatType;
      state.selectedChat = action.payload.selectedChat;
      state.selectedChatMessages = action.payload?.selectedChatMessages
      state.dms = action.payload?.dms?.length ? action.payload.dms : state.dms;
      state.isUploading = action.payload.isUploading || false
      state.isDownloading = action.payload.isDownloading || false
      state.channels = action.payload?.channels?.length ? action.payload.channels : state.channels
    },

    addMessagesToChat: (state, action) => {
      const { multiple, messages } = action.payload;
      const normalizedMessages = Array.isArray(messages) ? messages : [messages];
      const formattedMessages = normalizedMessages.map(({ sender, receiver, messageType, content, fileUrl, timestamp }) => ({
        messageType,
        content,
        fileUrl,
        timestamp,
        receiver,
        sender
      }));
    
      state.selectedChatMessages = multiple
        ? formattedMessages
        : [...(state.selectedChatMessages || []), ...formattedMessages]
    },   

    setDMs: (state, action) => {
      state.dms = action.payload
    },

    closeChat: (state) => {
      state.selectedChatType = '';
      state.selectedChat = null;
      state.selectedChatMessages = [];
    },

    setIsUploading: (state, action) => {
      state.isUploading = action.payload
    },

    setIsDownloading: (state, action) => {
      state.isDownloading = action.payload
    },

    setChannels: (state, action) => {
      state.channels = Array.isArray(action.payload) ? action.payload : [action.payload]
    },

    sortChannels: (state, action) => {
      const index = state.channels.findIndex(channel => channel._id === action.payload.channelId)
      if(index !== -1 && index !== undefined){
        const [recent_channel] = state.channels.splice(index,1)
        state.channels.unshift(recent_channel)
      }
    },

    sortDMs: (state, action) => {
      const { message, userId } = action.payload
      const fromId = message.sender._id === userId ? message.receiver._id : message.sender._id
      const fromData = message.sender._id === userId ? message.receiver : message.sender
      const index = state.dms.findIndex(dm => dm._id === fromId)
      if(index !== -1 && index !== undefined){
        const [recent_dm] = state.dms.splice(index,1)
        state.dms.unshift(recent_dm)
      }else{
        state.dms.unshift(fromData)
      }
    }
  },
});

export const {
  setChatInfo,
  closeChat,
  addMessagesToChat,
  setDMs,
  setIsUploading,
  setIsDownloading,
  setChannels, 
  sortChannels, 
  sortDMs
} = chatSlice.actions;
export default chatSlice.reducer;
