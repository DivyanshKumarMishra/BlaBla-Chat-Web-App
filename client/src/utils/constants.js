const HOST = import.meta.env.VITE_SERVER_URL

const AUTH_ROUTE = `${HOST}/api/auth`
const PROFILE_ROUTE = `${HOST}/api/profile`
const CHAT_ROUTE = `${HOST}/api/chat`
const CHANNEL_ROUTE = `${HOST}/api/channel`

export { HOST, AUTH_ROUTE, PROFILE_ROUTE, CHAT_ROUTE, CHANNEL_ROUTE }
