import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatContainer from '../../components/chat/ChatContainer/ChatContainer';
import ContactsContainer from '../../components/chat/ContactsBar/ContactsContainer';
import EmptyChatContainer from '../../components/chat/EmptyChat/EmptyChatContainer';
import Notification from '../../components/common/Notification';
import AppHeader from '../../components/common/Header';
import Drawer from '../../components/common/Drawer';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import { GET_ALL_CHATS_URL, LOGOUT_URL } from '../../utils/constants';
import { logout } from '../../slices/UserSlice';
import { setChats } from '../../slices/ChatSlice';

function Chat() {
  const { selectedChat } = useSelector((state) => state.chatData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationText, setNotificationText] = useState({
    message: '',
    description: '',
    type: '',
  });

  async function fetchChats() {
    try {
      const response = await axiosInstance.get(GET_ALL_CHATS_URL);
      if (response.status === 200) {
        dispatch(setChats(response.data));
      }
    } catch (error) {
      setNotificationText({
        message: 'Failed to fetch chats',
        type: 'error',
        description: error.message,
      });
    }
  }

  useEffect(() => {
    fetchChats();
  }, []);

  const handleSidebar = () => {
    // console.log('clicked');
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post(
        LOGOUT_URL,
        {},
        { withCredentials: true }
      );
      const { message, details } = response.data;
      if (response.status === 200) {
        setNotificationText({
          message: message,
          type: 'success',
          details: details,
        });
        setTimeout(() => {
          setNotificationText({});
          dispatch(logout());
          navigate('/auth', { replace: true });
        }, 1000);
      }
    } catch (error) {
      const { message, details } = error.response.data;
      setNotificationText({
        message: message,
        type: 'error',
        details: details,
      });
      setTimeout(() => {
        setNotificationText({});
      }, 1000);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-white">
      <AppHeader onLogoClick={handleSidebar} handleLogout={handleLogout} />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <Drawer open={isSidebarOpen} setOpen={handleSidebar} side="left">
          <ContactsContainer
            isSidebarOpen={isSidebarOpen}
            handleSidebar={handleSidebar}
            handleLogout={handleLogout}
          />
        </Drawer>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-1/3 bg-white border-r-3 border-gray-300 shadow-lg mt-14">
          <ContactsContainer
            handleLogout={handleLogout}
            handleSidebar={handleSidebar}
          />
        </div>

        {/* Chat container */}
        <div className="flex-1 flex flex-col bg-indigo-200">
          <Notification
            message={notificationText.message}
            description={notificationText.description}
            type={notificationText.type}
            onClose={() => setNotificationText({})}
          />

          <div className="flex-1 flex-col h-full mt-14">
            {selectedChat ? (
              <ChatContainer handleSidebar={handleSidebar} setNotificationText={setNotificationText}/>
            ) : (
              <EmptyChatContainer handleSidebar={handleSidebar} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
