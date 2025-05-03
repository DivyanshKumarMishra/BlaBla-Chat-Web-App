import { useState, useEffect } from 'react';
import {
  ChatBubbleLeftEllipsisIcon,
  UserGroupIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import Logo from '../../common/Logo';
import ProfileInfo from './ProfileInfo';
import axiosInstance from '../../../services/axios'; 
import { AUTH_ROUTE, CHAT_ROUTE, CHANNEL_ROUTE } from '../../../utils/constants';
import {logout} from '../../../slices/UserSlice';
import NewDM from './NewDM';
import { setDMs, setChannels } from '../../../slices/ChatSlice';
import ContactList from '../ContactList';
import NewChannel from './NewChannel';

function ContactsContainer({setNotificationText = () => {}, handleSidebar = () => {}, setShow = () => {}, getDMs = () => {}, getChannels = () => {}}) {
  const [activeTab, setActiveTab] = useState('dm');
  const {selectedChat, selectedChatType, dms, channels} = useSelector((state) => state.chatData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    getDMs()
  }, [selectedChat])

  useEffect(() => {
    getChannels()
  }, [])

  const tabs = [
    { id: 'dm', label: 'Direct Messages', icon: ChatBubbleLeftEllipsisIcon},
    { id: 'channel', label: 'Channels', icon: UserGroupIcon },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'logout', label: 'Logout', icon: ArrowLeftStartOnRectangleIcon }
  ];

  const handleTabClick = async (id) => {
    if (id === 'logout') {
      await handleLogout()
    } else {
      setActiveTab(id);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post(`${AUTH_ROUTE}/logout`, {}, { withCredentials: true });
      const { message, details } = response.data
      if(response.status === 200){
        setNotificationText({message: message, type: 'success', details: details})
        setShow(true);
        setTimeout(() => {
          setNotificationText({})
          dispatch(logout())
          setShow(false);
          navigate('/auth')
        }, 3000);
      }
    } catch (error) {
      const { message, details } = error.response.data
      setNotificationText({message: message, type: 'error', details: details})
      setShow(true);
      setTimeout(() => {
        setNotificationText({})
        setShow(false);
      }, 3000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-15 flex items-center justify-between">
        <Logo className="text-white text-3xl p-4 bg-primary" />
        <button className='p-4 md:hidden' onClick={handleSidebar}>
          <XMarkIcon className='text-white hover:text-primary hover:bg-white rounded-full size-6 focus:border-none focus:outline-none duration-300 transition-all' />
        </button>
      </div>
      <div className="flex flex-1">
        <div className="w-16 flex flex-col justify-between items-center py-4 bg-primary">
          <div className="flex flex-col gap-3 items-center">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`p-2 rounded-lg transition 
                  ${
                    activeTab === id
                      ? 'bg-white text-primary'
                      : 'text-white hover:bg-white hover:text-primary'
                  }`}
              >
              <Icon className="w-6 h-6" />
            </button>
            ))}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 py-5 overflow-auto">
          {activeTab === 'profile' && <ProfileInfo />}
          {activeTab === 'dm' &&
           <div className='flex flex-col gap-3'>
            <NewDM label='Direct Messages' handleSidebar={handleSidebar} getDMs={getDMs}/>
            <div className='max-h-[70vh] overflow-y-auto scrollbar-hidden'>
              <ContactList contacts={dms} handleSidebar={handleSidebar}/>
            </div>
           </div>
          }
          {activeTab === 'channel' && 
            <div className='flex flex-col gap-3'>
              <NewChannel label='Channels' handleSidebar={handleSidebar} getChannels={getChannels}/>
              <div className='max-h-[70vh] overflow-y-auto scrollbar-hidden'>
                <ContactList contacts={channels} handleSidebar={handleSidebar} isChannel={true}/>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default ContactsContainer;
