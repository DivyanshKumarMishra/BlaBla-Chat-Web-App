import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../slices/UserSlice'
import chatReducer from '../slices/ChatSlice'

const store = configureStore({
  reducer: {
    userData: userReducer,
    chatData: chatReducer
  }
})

export default store