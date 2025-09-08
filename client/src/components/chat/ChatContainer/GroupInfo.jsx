import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../services/axios';
import { getMemberChips } from '../SelectContact';
import Animation from '../../animation';
import {
  ADD_GROUP_MEMBER_URL,
  REMOVE_GROUP_MEMBER_URL,
  RENAME_GROUP_CHAT_URL,
} from '../../../utils/constants';
import {
  addMessagesToChat,
  setChatInfo,
  setChats,
  sortChats,
} from '../../../slices/ChatSlice';
import { stateContent, stateMessage } from '../ContactsBar/utils';
import Button from '../../common/Button';
import Logo from '../../common/Logo';
import { getShortName } from '../../../utils';
import Avatar from '../../common/Avatar';

function GroupInfo({
  handleModal = () => {},
  contacts = [],
  fetchChatMessages = () => {},
}) {
  const { selectedChat, chats } = useSelector((state) => state.chatData);
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(
    selectedChat?.members?.filter((m) => m._id !== user.id)
  );
  const [state, setState] = useState({
    type: 'idle',
    message: '',
  });

  const [showMembers, setShowMembers] = useState(false);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !selectedContacts.some((sel) => sel._id === c._id) &&
      c._id !== user.id
  );

  const updateGroup = async (action) => {
    try {
      const body = { chatId: selectedChat._id };
      let url;
      if (action === 'rename') {
        if (!groupName) {
          setError('Please enter a group name');
          return;
        }
        body.name = groupName;
        url = RENAME_GROUP_CHAT_URL;
      } else {
        body.userIds = [user.id];
        url = REMOVE_GROUP_MEMBER_URL;
      }

      setState({
        type: 'loading',
        message: action === 'rename' ? 'renaming group' : 'exiting from group',
      });

      const response = await axiosInstance.post(url, body);

      const updated_chat = response.data;
      dispatch(setChatInfo(action === 'rename' ? updated_chat : null));
      dispatch(addMessagesToChat([]));
      dispatch(sortChats());
      const old_chats = chats.filter((chat) => chat._id !== updated_chat._id);
      dispatch(
        setChats(action === 'rename' ? [updated_chat, ...old_chats] : old_chats)
      );
      fetchChatMessages();
      setTimeout(() => {
        setGroupName('');
        setSelectedContacts([]);
      }, 1000);
    } catch (error) {
      setState({
        type: 'error',
        message: stateMessage.chatError,
      });
    } finally {
      setTimeout(() => {
        setError('');
        setState({ type: 'idle', message: stateContent.idle });
      }, 2000);
    }
  };

  const addOrRemoveMember = async (contact, action) => {
    try {
      setState({
        type: 'loading',
        message: action === 'remove' ? 'removing member' : 'adding member',
      });
      const url =
        action === 'remove' ? REMOVE_GROUP_MEMBER_URL : ADD_GROUP_MEMBER_URL;
      const response = await axiosInstance.post(url, {
        chatId: selectedChat._id,
        userIds: [contact._id],
      });

      if (response.status == 200) {
        setSelectedContacts((prev) =>
          action === 'remove'
            ? prev.filter((c) => c._id !== contact._id)
            : [...prev, contact]
        );

        dispatch(setChatInfo(response.data));
        dispatch(addMessagesToChat([]));
        fetchChatMessages();
      }
    } catch (error) {
      setState({
        type: 'error',
        message:
          action === 'remove' ? 'Error removing member' : 'Error adding member',
      });
    } finally {
      setTimeout(() => {
        setSearchText('');
        setState({ type: 'idle', message: '' });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full overflow-y-auto">
      {/* Loading / Error / Success Animation */}
      {state.type !== 'idle' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Animation src={stateContent[state?.type]} className="size-40" />
          <h2 className="text-md lg:text-lg xl:text-xl font-semibold mt-2 text-indigo-500">
            {state?.message}
          </h2>
        </div>
      ) : (
        <>
          {/* Group Name */}
          <div>
            <Logo
              label={selectedChat?.name}
              className="text-3xl font-semibold"
              textColor="text-gray-400 mb-3"
            />
          </div>

          {selectedContacts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {getMemberChips(
                selectedContacts,
                user.id === selectedChat?.admin?._id,
                (contact) => addOrRemoveMember(contact, 'remove')
              )}
            </div>
          )}

          {!showMembers && (
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                type="text"
                placeholder="Enter group name"
                className="bg-indigo-100 sm:w-2/3 py-2 px-3 border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition w-full"
              />
              <Button
                label="Update"
                className="rounded-md py-2 px-2 w-full sm:w-1/3"
                onClick={() => updateGroup('rename')}
              />
            </div>
          )}

          {error && <span className="text-red-500 text-sm block">{error}</span>}

          {/* Admin vs Non-Admin Buttons */}
          {user.id === selectedChat?.admin?._id ? (
            <div className="flex gap-3 w-full">
              <Button
                label={
                  <span className="text-center">
                    {showMembers ? 'Hide Suggestions' : 'Add Members'}
                    {/* {showMembers ? (
                      <ChevronUpIcon className="size-6 text-white" />
                    ) : (
                      <ChevronDownIcon className="size-6 text-white" />
                    )} */}
                  </span>
                }
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-black"
                onClick={() => setShowMembers((prev) => !prev)}
              />
              <Button
                label="Exit Group"
                className="flex-1 text-white"
                textColor="bg-red-500 hover:bg-red-600"
                onClick={() => updateGroup('leave')}
              />
            </div>
          ) : (
            <Button
              label="Exit Group"
              className="w-full bg-red-500 text-white hover:bg-red-600"
              onClick={() => updateGroup('leave')}
            />
          )}

          <div className="w-full overflow-y-auto">
            {showMembers &&
              (filteredContacts.length > 0 ? (
                <div className="w-full mt-4 flex flex-col gap-3">
                  <div className="bg-gray-200 py-2 px-3 border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search contacts..."
                        className="flex-1 bg-transparent focus:outline-none text-black placeholder:text-gray-500 min-w-[120px]"
                      />
                    </div>
                  </div>
                  <div className="w-full h-full overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="flex items-start gap-4 py-2 px-3 hover:bg-gray-200 cursor-pointer"
                        onClick={() => addOrRemoveMember(contact, 'add')}
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
                </div>
              ) : (
                <div className="text-center text-primary font-semibold">
                  No more members to add
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default GroupInfo;
