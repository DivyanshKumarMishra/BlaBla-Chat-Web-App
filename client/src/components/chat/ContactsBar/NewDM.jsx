import { useState, useEffect } from 'react';
import {useDispatch} from 'react-redux'
import Tooltip from '../../common/Tooltip';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../common/Modal';
import Animation from '../../animation';
import axiosInstance from '../../../services/axios';
import { CHAT_ROUTE, HOST } from '../../../utils/constants';
import Avatar from '../../common/Avatar';
import { getShortName } from '../../../utils';
import { setChatInfo } from '../../../slices/ChatSlice';

function NewDM({ label = '', handleSidebar = () => {}, getDMs = () => {} }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedContact, setSelectedContact] = useState(null); 

  useEffect(() => {
    if(!searchText) return
    const timer = setTimeout(() => {
      searchContacts();
    }, 500);

    // DEBOUNCING
    return () => {
      setSearchedContacts([])
      clearTimeout(timer)
    };
  }, [searchText]);

  const searchContacts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${CHAT_ROUTE}/search-contacts/${searchText}`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setSearchedContacts(response.data.contacts);
      }
    } catch (error) {
      setSearchText('')
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000)
    }
  };

  const handleNewChat = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setSearchText('');
    setModalOpen((prev) => !prev)
  }

  const selectNewContact = async (contact) => {
    dispatch(setChatInfo({ selectedChatType: 'dm', selectedChat: contact, selectedChatMessages: null }));
    setSelectedContact(contact);
    setModalOpen(false);
    setSearchText('');
    setSearchedContacts([]);
    await getDMs()
    setTimeout(() => {
      handleSidebar();
    }, 500)
  }

  return (
    <div className="px-2 flex flex-1 w-full">
      <div className="flex justify-between items-center w-full">
        {label}
        <Tooltip
          content="New Chat"
          position="left"
          bgColor="bg-white"
          textColor="text-primary"
        >
          <button onClick={handleNewChat} className={`rounded-lg transition `}>
            <PlusIcon className="w-6 h-6" />
          </button>
        </Tooltip>
      </div>
      <Modal open={modalOpen} closeModal={closeModal} className='w-4/5 md:max-w-md bg-white h-[60%] md:h-[70%]' backdropClasses='bg-indigo-500/75' childrenClasses='mt-5'>
        <div className="flex flex-col gap-4 items-center justify-center">
          <h3 className="text-md lg:text-lg xl:text-xl text-gray-500 font-semibold">
            Please select a contact
          </h3>
          <div className="w-full">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              placeholder="Search Contacts"
              className="bg-indigo-100 py-2 px-3 w-full border border-gray-300 rounded-md  text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
          <div className='w-full h-[37vh] md:h-[47vh]'>
            {loading ? 
              <div className="flex flex-col items-center justify-start h-full">
                <Animation src="/animations/plane.lottie" className="size-40"/>
                <h2 className="text-md lg:text-lg xl:text-xl text-primary font-semibold">
                  Fetching contacts...
                </h2>
              </div> : 
              searchedContacts.length <= 0 ?
                <div className="flex flex-col items-center justify-start h-full">
                  <Animation src="/animations/plane.lottie" className="size-40"/>
                  <h2 className="text-sm lg:text-lg xl:text-xl text-primary font-semibold">
                    No contacts found
                  </h2>
                </div> :
              <div className='w-full h-full overflow-y-auto'>
                {searchedContacts.map((contact) => {
                  const { image, name, _id, color, email } = contact;
                  return <div
                    key={_id}
                    className="flex items-start justify-start gap-4 py-2 px-3 hover:bg-gray-200 cursor-pointer"
                    onClick={() => selectNewContact(contact)}>
                    <Avatar
                      image={image instanceof File ? URL.createObjectURL(image) : image ? `${HOST}/${image}` : ''}
                      className="bg-gray-200 size-10 md:size-12 lg:size-16 rounded-full shadow-md"
                      textSize="text-sm md:text-base lg:text-lg"
                      color={color}
                      text={getShortName(name)}
                    />
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-500">{name}</div>
                      <div className="text-xs md:text-sm lg:text-md font-semibold text-gray-500">{email}</div>
                    </div>
                  </div>
                })}
              </div>
            }
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default NewDM;

const contacts = [
  { _id: "1", name: "Alice Johnson", email: "alice.johnson@example.com", color: "#FF5733" },
  { _id: "2", name: "Bob Smith", email: "bob.smith@example.com", color: "#33C1FF" },
  { _id: "3", name: "Charlie Brown", email: "charlie.brown@example.com", color: "#8E44AD" },
  { _id: "4", name: "Dana White", email: "dana.white@example.com", color: "#27AE60" },
  { _id: "5", name: "Eli Turner", email: "eli.turner@example.com", color: "#F39C12" },
  { _id: "6", name: "Fay Evans", email: "fay.evans@example.com", color: "#E74C3C" },
  { _id: "7", name: "George King", email: "george.king@example.com", color: "#1ABC9C" },
  { _id: "8", name: "Hannah Lee", email: "hannah.lee@example.com", color: "#3498DB" },
  { _id: "9", name: "Isaac Wright", email: "isaac.wright@example.com", color: "#9B59B6" },
  { _id: "10", name: "Jade Kim", email: "jade.kim@example.com", color: "#2ECC71" }
];
