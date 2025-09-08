import { BellIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';
import { getSender } from '../../utils/index';
import {
  addMessageToSpecificChat,
  addToNotifications,
  setActiveTab,
  setChatInfo,
  sortChats,
} from '../../slices/ChatSlice';

function AppHeader({ onLogoClick = () => {}, handleLogout = () => {} }) {
  const { user, isLoggedIn } = useSelector((state) => state.userData);
  const { notifications } = useSelector((state) => state.chatData);
  const location = useLocation();
  const dispatch = useDispatch();

  return (
    <header className="fixed top-0 w-full h-14 flex items-center justify-between px-4 bg-indigo-500 text-white shadow-md z-[9999]">
      <button onClick={onLogoClick}>
        <Logo className="text-white text-3xl p-4" />
      </button>
      <div className="flex items-center gap-x-1">
        <Menu as="div" className="relative">
          <MenuButton className="relative p-2 text-white hover:bg-indigo-400 rounded-full outline-none">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-7" />
            {notifications.length > 0 && (
              <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full transform scale-110 transition-transform duration-300 ease-out">
                {notifications.length}
              </span>
            )}
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-1.5 w-70 origin-top-right rounded-md bg-white py-2 shadow-lg outline-none transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            {notifications?.length > 0 ? (
              notifications?.map((notification) => (
                <MenuItem
                  key={notification._id}
                  onClick={() => {
                    dispatch(setChatInfo(notification.chat));
                    dispatch(addMessageToSpecificChat(notification));
                    dispatch(
                      addToNotifications(
                        notifications.filter(
                          (msg) => msg._id !== notification._id
                        )
                      )
                    );
                    dispatch(sortChats());
                    dispatch(setActiveTab(notification.chat?.isGroupChat ? 'group' : 'dm'));
                  }}
                >
                  <div className="w-full flex justify-center px-3 py-1 text-sm/6 data-focus:outline-hidden text-primary hover:bg-indigo-100 cursor-pointer">
                    <span>New message from&nbsp;</span>
                    <span className="font-bold">
                      {notification.chat?.isGroupChat
                        ? `${notification.chat?.name}`
                        : `${
                            getSender(
                              user,
                              notification?.chat?.members
                            )?.name?.split(' ')[0]
                          }`}
                    </span>
                  </div>
                </MenuItem>
              ))
            ) : (
              <MenuItem>
                <div className="w-full flex justify-center px-3 py-1 text-sm/6 data-focus:outline-hidden text-primary hover:bg-indigo-100">
                  No new messages
                </div>
              </MenuItem>
            )}
          </MenuItems>
        </Menu>

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <MenuButton className="relative flex items-center hover:bg-indigo-400 p-2 rounded-full outline-none">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <Avatar
              alt=""
              image={user.image}
              className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-white/100"
            />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-1.5 w-18 origin-top-right rounded-md bg-white py-2 shadow-lg outline-none transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            {location.pathname !== '/profile' && (
              <MenuItem>
                <Link
                  to="/profile"
                  className="w-full flex justify-center px-3 py-1 text-sm/6 data-focus:outline-hidden text-primary hover:bg-indigo-100"
                >
                  Profile
                </Link>
              </MenuItem>
            )}
            {isLoggedIn && (
              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center px-3 py-1 text-sm/6 data-focus:outline-hidden text-primary hover:bg-indigo-100"
                >
                  Logout
                </button>
              </MenuItem>
            )}
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}

export default AppHeader;
