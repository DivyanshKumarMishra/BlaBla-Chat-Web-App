import {io} from 'socket.io-client' 
import { HOST } from '../utils/constants'

const setupSocket = (queryObject) => {
  const socketOptions = {
    withCredentials: true,
  }

  console.log(`connecting to ${HOST}`)
  if(queryObject) socketOptions.query = queryObject

  const socket = io(HOST, socketOptions)
  return socket
}

export {setupSocket}