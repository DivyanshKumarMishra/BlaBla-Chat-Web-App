import { useState, useEffect } from 'react';
import Tooltip from '../../common/Tooltip';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../common/Modal';
import Animation from '../../animation';
import axiosInstance from '../../../services/axios';
import MultiSelect from '../SelectContact';
import Button from '../../common/Button';
import {
  CREATE_GROUP_CHAT_URL,
  SEARCH_CONTACTS_URL,
} from '../../../utils/constants';
import { addMessagesToChat, setChatInfo, setChats, sortChats } from '../../../slices/ChatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { stateContent, stateMessage } from './utils';

function NewGroup({ label = '', handleSidebar = () => {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState('');
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chatData);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    type: 'idle',
    message: stateMessage.idle,
  });

  useEffect(() => {
    const getAllContacts = async () => {
      try {
        setState({ type: 'loading', message: stateMessage.loadingContacts });
        const response = await axiosInstance.get(SEARCH_CONTACTS_URL);
        if (response.status === 200) {
          setContacts(response.data.contacts);
          setState({ type: 'idle', message: stateMessage.idle });
        }
      } catch (error) {
        setState({ type: 'error', message: stateMessage.error });
      } finally {
        setTimeout(() => {
          setState({ type: 'idle', message: stateMessage.idle });
        }, 3000);
      }
    };

    getAllContacts();
  }, []);

  const handleNewChat = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setGroupName('');
    setError('');
    setModalOpen((prev) => !prev);
  };

  const createGroup = async () => {
    try {
      setState({ type: 'loading', message: stateMessage.group });
      if (!groupName) {
        setError('Please enter a group name');
        setState({ type: 'idle', message: stateMessage.idle });
        return;
      }

      if (selectedContacts.length < 2) {
        setError('Please select at least 2 contacts');
        setState({ type: 'idle', message: stateMessage.idle });
        return;
      }

      setError('');
      const memberIds = selectedContacts.map((c) => c._id);
      const response = await axiosInstance.post(CREATE_GROUP_CHAT_URL, {
        name: groupName,
        members: memberIds,
      });

      const new_chat = response.data;
      if (!chats.find((chat) => chat._id === new_chat?._id)) {
        dispatch(setChatInfo(new_chat));
        dispatch(addMessagesToChat([]));
        dispatch(setChats(response.data));
        dispatch(sortChats());
      }

      setModalOpen(false);
      setTimeout(() => {
        setState({ type: 'idle', message: stateMessage.idle });
        setGroupName('');
        setContacts([]);
        setSelectedContacts([]);
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
          content="New Group"
          position="left"
          bgColor="bg-primary"
          textColor="text-white"
        >
          <button onClick={handleNewChat} className={`rounded-lg transition `}>
            <PlusIcon className="w-6 h-6" />
          </button>
        </Tooltip>
      </div>
      <Modal
        open={modalOpen}
        closeModal={closeModal}
        setSelectedContacts={setSelectedContacts}
        className="w-4/5 md:max-w-md bg-white items-center justify-center min-h-[45vh] max-h-[80vh] md:min-h-[60vh]"
        backdropClasses="bg-gray-500/75"
        childrenClasses="mt-5"
      >
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {/* Input and Button Container */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              type="text"
              placeholder="Enter group name"
              className="bg-indigo-100 sm:w-2/3 py-2 px-3 border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition w-full"
            />
            <Button
              label="Create Group"
              className="rounded-md py-2 px-2 w-full sm:w-1/3"
              onClick={createGroup}
              disabled={state.type !== 'idle'}
            />
          </div>
          {error && <span className="text-red-500 text-sm block">{error}</span>}

          {/* Contact Section */}
          <div className="w-full overflow-y-auto">
            {/* Contact Section */}
            <div className="w-full overflow-y-auto">
              {state.type !== 'idle' ? (
                <div className="flex flex-col items-center justify-start h-full text-center">
                  <Animation
                    src={stateContent[state.type]}
                    className="size-40"
                  />
                  <h2 className="text-sm lg:text-lg xl:text-xl text-primary font-semibold">
                    {state.message}
                  </h2>
                </div>
              ) : contacts.length > 0 ? (
                <MultiSelect
                  contacts={contacts}
                  selectedContacts={selectedContacts}
                  setSelectedContacts={setSelectedContacts}
                />
              ) : (
                <div className="flex flex-col items-center justify-start h-full text-center">
                  <Animation src={stateContent['idle']} className="size-40" />
                  <h2 className="text-sm lg:text-lg xl:text-xl text-primary font-semibold">
                    {stateMessage.idle}
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default NewGroup;
