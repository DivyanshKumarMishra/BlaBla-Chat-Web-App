const HOST = import.meta.env.VITE_SERVER_URL;

const USER_URL = '/api/user/user-info';
const SIGNUP_URL = '/api/auth/signup';
const LOGIN_URL = '/api/auth/login';
const LOGOUT_URL = '/api/auth/logout';
const UPDATE_PROFILE_URL = `/api/profile/update-profile`;
const SEARCH_CONTACTS_URL = '/api/user/contacts';
const ACCESS_CHAT_URL = '/api/chat';
const GET_ALL_CHATS_URL = '/api/chat/get-all';
const CREATE_GROUP_CHAT_URL = '/api/chat/group/create';
const RENAME_GROUP_CHAT_URL = '/api/chat/group/rename';
const ADD_GROUP_MEMBER_URL = '/api/chat/group/add-member';
const REMOVE_GROUP_MEMBER_URL = '/api/chat/group/remove-member';
const MESSAGE_URL = '/api/message';

// CLOUDINARY config
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export {
  HOST,
  SIGNUP_URL,
  LOGIN_URL,
  LOGOUT_URL,
  UPDATE_PROFILE_URL,
  USER_URL,
  SEARCH_CONTACTS_URL,
  ACCESS_CHAT_URL,
  GET_ALL_CHATS_URL,
  CREATE_GROUP_CHAT_URL,
  RENAME_GROUP_CHAT_URL,
  ADD_GROUP_MEMBER_URL,
  REMOVE_GROUP_MEMBER_URL,
  MESSAGE_URL,
  CLOUDINARY_URL,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME,
};
