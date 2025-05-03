import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ChatContainer from '../../components/chat/ChatContainer/ChatContainer'
import ContactsContainer from '../../components/chat/ContactsBar/ContactsContainer'
import EmptyChatContainer from '../../components/chat/EmptyChat/EmptyChatContainer'
import Notification from '../../components/common/Notification'
import { setChannels, setDMs } from '../../slices/ChatSlice'
import axiosInstance from '../../services/axios'
import { CHANNEL_ROUTE, CHAT_ROUTE } from '../../utils/constants'

function Chat() {
  const { profileSetup } = useSelector((state) => state.userData.user)
  const { selectedChatType, selectedChat } = useSelector((state) => state.chatData)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notificationText, setNotificationText] = useState({
      message: '',
      description: '',
      type: '',
    });
  const [show, setShow] = useState(false);

  const handleSidebar = () => {
    // console.log(isSidebarOpen);
    setIsSidebarOpen(prev => !prev)
  }

  async function getDMs(){
    try {
      const response = await axiosInstance.get(`${CHAT_ROUTE}/get-dms`, {withCredentials: true})
      if(response.status === 200){
        // console.log(response.data.dms);
        dispatch(setDMs(response.data.dms))
      }
    } catch (error) {
      console.log(error.response.data);
    }
  }

  async function getChannels(){
    try {
      const response = await axiosInstance.get(`${CHANNEL_ROUTE}/get-all-channels`, {withCredentials: true})
      if(response.status === 200){
        // console.log(response.data.channels);
        dispatch(setChannels(response.data.channels))
      }
    } catch (error) {
      console.log(error.response.data);
    }
  }

  useEffect(() => {
    if (!profileSetup) navigate('/profile')
  }, [profileSetup, navigate])

  return (
    <div className="h-screen flex flex-col md:flex-row text-white bg-gray-200 overflow-hidden">
      <Notification
        message={notificationText.message}
        description={notificationText.description}
        show={show}
        type={notificationText.type}
        onClose={() => setShow(false)}
      />
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform transform w-full md:w-1/3 bg-primary fixed top-0 left-0 h-full z-20 md:relative`}
      >
        <ContactsContainer handleSidebar={handleSidebar} setNotificationText={setNotificationText} setShow={setShow} getDMs={getDMs} getChannels={getChannels}/>
      </div>
      <div className="h-full flex-1 bg-indigo-100">
        {selectedChat ? <ChatContainer handleSidebar={handleSidebar} getDMs={getDMs}/> : <EmptyChatContainer handleSidebar={handleSidebar}/>}
      </div>
    </div>
  )
}

export default Chat
