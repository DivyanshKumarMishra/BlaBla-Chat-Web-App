import { useState, useEffect } from 'react';
import Tooltip from '../../common/Tooltip';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../common/Modal';
import Animation from '../../animation';
import axiosInstance from '../../../services/axios';
import { CHANNEL_ROUTE, CHAT_ROUTE } from '../../../utils/constants';
import MultiSelect from '../SelectContact';
import Button from '../../common/Button';

function NewChannel({ label = '', handleSidebar = () => {}, getChannels = () => {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedColor, setSelectedColor] = useState('')
  const [channelName, setChannelName] = useState('') 

  useEffect(() => {
    const getAllContacts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `${CHAT_ROUTE}/get-all-contacts`,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setContacts(response.data.contacts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000)
      }
    };

    getAllContacts();
  }, []);

  const handleNewChat = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setChannelName('');
    setModalOpen((prev) => !prev)
  }

  const createChannel = async () => {
    try {
      if(!channelName) return
      if(!selectedContacts.length) return
      const memberIds = selectedContacts.map((c) => c._id); 
      const response = await axiosInstance.post(
        `${CHANNEL_ROUTE}/create-channel`,
        { name: channelName, members: memberIds, color: selectedColor },
        { withCredentials: true }
      );
      if (response.status === 201) {
        await getChannels()
        setChannelName('');
        setSelectedContacts([]);
        setModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }finally{
      setTimeout(() => {
        handleSidebar();
      }, 500)
    }
  }; 

  return (
    <div className="px-2 flex flex-1 w-full">
      <div className="flex justify-between items-center w-full">
        {label}
        <Tooltip
          content="New Channel"
          position="left"
          bgColor="bg-white"
          textColor="text-primary"
        >
          <button onClick={handleNewChat} className={`rounded-lg transition `}>
            <PlusIcon className="w-6 h-6" />
          </button>
        </Tooltip>
      </div>
      <Modal open={modalOpen} closeModal={closeModal} setSelectedContacts={setSelectedContacts} className='w-4/5 md:max-w-md bg-white h-[60%] md:h-[70%]' backdropClasses='bg-indigo-500/75' childrenClasses='mt-5'>
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {/* Input and Button Container */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              type="text"
              placeholder="Enter channel name"
              className="bg-indigo-100 sm:w-2/3 py-2 px-3 border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition w-full"
            />
            <Button
              label="Create Channel"
              className="rounded-md py-2 px-2 w-full sm:w-1/3"
              onClick={createChannel} />
          </div>
          <div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {['#fca5a5', '#fdba74', '#fde047', '#6ee7b7', '#5eead4', '#7dd3fc', '#c4b5fd', '#f9a8d4'].map(color => (
              <div
                key={color}
                className={`size-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-primary' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)} // you'll need this state
              />
            ))}
          </div>
          </div>
          {/* Contact Section */}
          <div className="w-full h-[37vh] md:h-[47vh] overflow-y-auto">
            {contacts.length <= 0 ? (
              <div className="flex flex-col items-center justify-start h-full text-center">
                <Animation src="/animations/plane.lottie" className="size-40" />
                <h2 className="text-sm lg:text-lg xl:text-xl text-primary font-semibold">
                  No contacts to add
                </h2>
              </div>
            ) : (
              <MultiSelect
                contacts={contacts}
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default NewChannel

const testcontacts = [
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
