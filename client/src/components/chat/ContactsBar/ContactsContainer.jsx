import {
  ChatBubbleLeftEllipsisIcon,
  UserGroupIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/solid';
import NewDM from './NewDM';
import ContactList from '../ContactList';
import NewGroup from './NewGroup';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../../../slices/ChatSlice';

function ContactsContainer({
  isSidebarOpen = false,
  handleSidebar = () => {},
  handleLogout = () => {},
}) {
  const { activeTab } = useSelector((state) => state.chatData);
  const dispatch = useDispatch();

  const tabs = [
    { id: 'dm', label: 'Direct Messages', icon: ChatBubbleLeftEllipsisIcon },
    { id: 'group', label: 'Groups', icon: UserGroupIcon },
    { id: 'logout', label: 'Logout', icon: ArrowLeftStartOnRectangleIcon },
  ];

  const handleTabClick = async (id) => {
    if (id === 'logout') {
      await handleLogout();
    } else {
      dispatch(setActiveTab(id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {/* <div className="h-15 flex items-center justify-between bg-primary">
        <Logo className="text-white text-3xl p-4" />
        <button className="p-4 md:hidden" onClick={handleSidebar}>
          <XMarkIcon className="text-white hover:text-primary hover:bg-white rounded-full size-6 transition" />
        </button>
      </div> */}

      <div className="flex flex-1">
        <div className="w-16 flex flex-col justify-between items-center py-3 bg-white">
          <div className="flex flex-col gap-3 items-center">
            {tabs
              .filter((t) => t.id !== 'logout')
              .map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id)}
                  className={`p-2 rounded-full transition-colors ${
                    activeTab === id
                      ? 'bg-indigo-500 text-white'
                      : 'text-indigo-500 hover:bg-indigo-500 hover:text-white'
                  }`}
                  title={id === 'dm' ? 'Direct Messages' : 'Groups'}
                >
                  <Icon className="w-7 h-7" />
                </button>
              ))}
          </div>
          {/* Logout pinned at bottom */}
          {/* <button
            onClick={() => handleTabClick('logout')}
            className="p-2 rounded-full text-indigo-500 hover:bg-indigo-500 hover:text-white transition font-bold"
            title="Logout"
          >
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6" />
          </button> */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 py-3 overflow-auto px-4">
          {activeTab === 'dm' && (
            <>
              <div className="flex flex-col gap-3">
                <NewDM label="Direct Messages" handleSidebar={handleSidebar} />
                <div className="max-h-[70vh] overflow-y-auto scrollbar-hidden">
                  <ContactList handleSidebar={handleSidebar} />
                </div>
              </div>
            </>
          )}
          {activeTab === 'group' && (
            <>
              <div className="flex flex-col gap-3">
                <NewGroup label="Groups" handleSidebar={handleSidebar} />
                <div className="max-h-[70vh] overflow-y-auto scrollbar-hidden">
                  <ContactList handleSidebar={handleSidebar} isGroup={true} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactsContainer;
