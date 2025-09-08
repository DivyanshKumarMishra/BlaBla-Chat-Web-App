import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '../../common/Tooltip';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../common/Modal';
import Animation from '../../animation';
import axiosInstance from '../../../services/axios';
import { SEARCH_CONTACTS_URL, ACCESS_CHAT_URL } from '../../../utils/constants';
import Avatar from '../../common/Avatar';
import { getShortName } from '../../../utils';
import {
  addMessagesToChat,
  setChatInfo,
  setChats,
  sortChats,
} from '../../../slices/ChatSlice';
import useDebounce from '../../../hooks/debounce';
import { stateContent, stateMessage } from './utils';

function NewDM({ label = '', handleSidebar = () => {} }) {
  const { chats } = useSelector((state) => state.chatData);
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [state, setState] = useState({
    type: 'idle',
    message: stateMessage.idle,
  });

  const searchContacts = useCallback(async (searchText) => {
    try {
      const response = await axiosInstance.get(
        `${SEARCH_CONTACTS_URL}/?search=${searchText}`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setSearchedContacts(response.data.contacts);
        setState({ type: 'idle', message: '' });
      }
    } catch (error) {
      setState({ type: 'error', message: stateMessage.error });
      setSearchedContacts([]);
    } finally {
      setTimeout(() => {
        setState({ type: 'idle', message: stateMessage.idle });
      }, 3000);
    }
  }, []);

  const debouncedFunction = useDebounce(searchContacts, 1000);

  useEffect(() => {
    if (!searchText) return;
    debouncedFunction(searchText);
  }, [searchText]);

  const closeModal = () => {
    setModalOpen((prev) => !prev);
    setTimeout(() => {
      setSearchText('');
      setSearchedContacts([]);
      setState({ type: 'idle', message: 'Start typing to search contacts...' });
    }, 1000);
  };

  const createNewChat = async (contact) => {
    try {
      setSearchedContacts([]);
      setState({ type: 'loading', message: stateMessage.chat });
      const response = await axiosInstance.post(ACCESS_CHAT_URL, {
        receiverId: contact._id,
      });

      const new_chat = response.data;

      if (!chats.find((chat) => chat._id === new_chat?._id)) {
        dispatch(setChatInfo(new_chat));
        dispatch(addMessagesToChat([]));
        dispatch(setChats(new_chat));
        dispatch(sortChats());
      }

      setModalOpen(false);
      setTimeout(() => {
        setState({ type: 'idle', message: stateMessage.idle });
        setSearchText('');
        setSearchedContacts([]);
        handleSidebar();
      }, 1000);
    } catch (error) {
      setState({ type: 'error', message: stateMessage.chatError });
    } finally {
      setTimeout(() => {
        setState({ type: 'idle', message: stateMessage.idle });
      }, 3000);
    }
  };

  return (
    <div className="px-2 py-2 flex flex-1 w-full text-indigo-500">
      <div className="flex justify-between items-center w-full">
        <span className="font-semibold">{label}</span>
        <Tooltip
          content="New Chat"
          position="left"
          bgColor="bg-primary"
          textColor="text-white"
        >
          <button
            onClick={() => setModalOpen(true)}
            className={`rounded-lg transition `}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </Tooltip>
      </div>
      <Modal
        open={modalOpen}
        closeModal={closeModal}
        className="w-4/5 md:max-w-md bg-white items-center justify-center max-h-[70vh] min-h-[40vh]"
        backdropClasses="bg-gray-500/75"
        childrenClasses="mt-4"
      >
        <div className="flex flex-col gap-4 items-center justify-center">
          <h3 className="text-md lg:text-lg xl:text-xl text-gray-500 font-semibold">
            Please select a contact
          </h3>
          <div className="w-full">
            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSearchedContacts([]);
                setState({ type: 'loading', message: stateMessage.loading });
              }}
              type="text"
              placeholder="Search Contacts"
              className="bg-indigo-100 py-2 px-3 w-full border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
          <div className="w-full">
            {searchedContacts.length > 0 ? (
              <div className="w-full h-full overflow-y-auto">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-start gap-4 py-2 px-3 hover:bg-gray-200 cursor-pointer"
                    onClick={() => createNewChat(contact)}
                  >
                    <Avatar
                      image={contact.image}
                      className="bg-gray-200 size-10 md:size-12 lg:size-16 rounded-full shadow-md"
                      textSize="text-sm md:text-base lg:text-lg"
                      text={getShortName(contact.name)}
                    />
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-500">
                        {contact.name}
                      </div>
                      <div className="text-xs md:text-sm lg:text-md font-semibold text-gray-500">
                        {contact.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Animation
                  src={stateContent[state?.type]}
                  className="size-40"
                />
                <h2
                  className={`text-md lg:text-lg xl:text-xl font-semibold mt-2 text-indigo-500`}
                >
                  {state?.message}
                </h2>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default NewDM;
