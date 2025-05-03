import {io} from 'socket.io-client' 
import { HOST } from '../utils/constants'

const setupSocket = (queryObject) => {
  const socketOptions = {
    withCredentials: true,
    // reconnection: true,
    // reconnectionAttempts: 3,
    // retries: 3,
    // requestTimeout: 3000
  }

  if(queryObject) socketOptions.query = queryObject

  const socket = io(HOST, socketOptions)
  return socket
}

export {setupSocket}