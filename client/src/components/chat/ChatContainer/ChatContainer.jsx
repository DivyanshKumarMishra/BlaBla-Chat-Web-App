import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageBar from './MessageBar';
import MessageContainer from './MessageContainer';
import Modal from '../../common/Modal';
import GroupInfo from './GroupInfo';
import axiosInstance from '../../../services/axios';
import { MESSAGE_URL, SEARCH_CONTACTS_URL } from '../../../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addMessagesToChat, sortChats } from '../../../slices/ChatSlice';
import { useSocket } from '../../../contexts/SocketContext';

function ChatContainer({
  handleSidebar = () => {},
  setNotificationText = () => {},
}) {
  const { selectedChat, selectedChatMessages } = useSelector(
    (state) => state.chatData
  );
  const [contacts, setContacts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  async function fetchChatMessages() {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${MESSAGE_URL}/${selectedChat._id}`
      );
      if (response.status === 200) {
        dispatch(addMessagesToChat(response.data));
        dispatch(sortChats());
      }
    } catch (error) {
      dispatch(addMessagesToChat([]));
      dispatch(sortChats());
      setNotificationText({
        type: 'error',
        message: error.response.data.message,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
        setNotificationText({});
      }, 500);
    }
  }

  const handleModal = () => {
    setModalOpen((prev) => !prev);
  };

  useEffect(() => {
    const getAllContacts = async () => {
      try {
        const response = await axiosInstance.get(SEARCH_CONTACTS_URL);
        if (response.status === 200) {
          setContacts(response.data.contacts);
        }
      } catch (error) {
        setNotificationText({
          message: error.response.data.message,
          type: 'error',
        });
      } finally {
        setTimeout(() => {
          setNotificationText({});
        }, 3000);
      }
    };

    if (selectedChat?.isGroupChat) getAllContacts();
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-indigo-100 flex flex-col text-black">
      <ChatHeader
        handleSidebar={handleSidebar}
        handleModal={handleModal}
        modalOpen={modalOpen}
      />
      <MessageContainer
        setNotificationText={setNotificationText}
        loading={loading}
        setLoading={setLoading}
        selectedChatMessages={selectedChatMessages}
        fetchChatMessages={fetchChatMessages}
      />
      <MessageBar setNotificationText={setNotificationText} />
      <Modal
        open={modalOpen}
        closeModal={handleModal}
        className="w-full md:max-w-md bg-white items-center justify-center min-h-[30vh] max-h-[80vh] md:min-h-[35vh]"
        backdropClasses="bg-gray-500/75"
        childrenClasses="mt-0"
      >
        <GroupInfo
          contacts={contacts}
          handleModal={handleModal}
          fetchChatMessages={fetchChatMessages}
        />
      </Modal>
    </div>
  );
}

export default ChatContainer;
