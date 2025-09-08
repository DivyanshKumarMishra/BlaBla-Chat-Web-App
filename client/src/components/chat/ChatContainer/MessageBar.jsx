import { useState, useRef, useEffect } from 'react';
import {
  PaperClipIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/20/solid';
import { useSelector, useDispatch } from 'react-redux';
import EmojiPick from '../../common/EmojiPick';
import { useSocket } from '../../../contexts/SocketContext';
import axiosInstance from '../../../services/axios';
import { HOST } from '../../../utils/constants';
import {
  addMessagesToChat,
  setIsUploading,
  sortChats,
} from '../../../slices/ChatSlice';
import { checkIfImage } from '../../../utils';
import Drawer from '../../common/Drawer';
import Tooltip from '../../common/Tooltip';
import { MESSAGE_URL } from '../../../utils/constants';

function MessageBar({ setNotificationText = () => {} }) {
  const { socket } = useSocket();
  const { selectedChat } = useSelector((state) => state.chatData);
  const { user } = useSelector((state) => state.userData);
  const [fileUrls, setFileUrls] = useState([]);
  const [message, setMessage] = useState('');
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [emojiRef]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { userId: user.id, roomId: selectedChat._id });
    }

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { userId: user.id, roomId: selectedChat._id });
    }, 1000);
  };

  const handleFileClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleEmojiClick = () => {
    setOpen(true);
  };

  const handleEmoji = (emoji) => {
    setMessage((msg) => `${msg}${emoji.emoji}`);
  };

  const handleRemoveFile = (index) => {
    setFileUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e) => {
    try {
      if (!e.target.files) return;
      const formData = new FormData();
      const files = Array.from(e.target.files);
      dispatch(setIsUploading(true));
      files.forEach((file) => formData.append('files', file));
      // const response = await axiosInstance.post(UPLOAD_FILE_ROUTE, formData, { withCredentials: true, headers: {
      //   'Content-Type': 'multipart/form-data'
      // }, params: { timestamp: Date.now() }});
      // if(response.status === 201) {
      //   dispatch(setIsUploading(false))
      //   setFileUrls(Array.from(response.data.filePaths));
      // }
    } catch (error) {
      console.log(error);
      dispatch(setIsUploading(false));
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const sendNewMessage = async (e) => {
    try {
      const response = await axiosInstance.post(MESSAGE_URL, {
        content: message,
        chatId: selectedChat._id,
        messageType: 'text',
      });

      if (response.status === 200) {
        socket.emit('new-message', response.data);
        dispatch(addMessagesToChat(response.data));
        dispatch(sortChats());
      }
    } catch (error) {
      setNotificationText({
        type: 'error',
        message: 'failed to send message',
      });
    } finally {
      setMessage('');
      setTimeout(() => {
        setNotificationText({});
      }, 1000);
    }
  };

  return (
    <div className="h-[10vh] bg-white border-t-2 border-gray-300 flex justify-center items-center px-4">
      {fileUrls.length > 0 && (
        <Drawer
          open={previewDrawerOpen}
          setOpen={setPreviewDrawerOpen}
          side="bottom"
          width="w-[100vw] md:w-[67vw]"
          height="h-[50vh] md:h-[50vh] max-h-[70vh]"
        >
          <div className="px-4 py-2 flex gap-4 overflow-x-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {fileUrls.slice(0, 4).map((fileUrl, index) => {
                const isImage = checkIfImage(fileUrl);
                const isLastVisible = index === 3 && fileUrls.length > 4;
                const remainingCount = fileUrls.length - 4;
                return (
                  <div
                    key={index}
                    className="relative border border-primary rounded overflow-hidden aspect-square group"
                  >
                    {isImage ? (
                      <img
                        src={`${HOST}/${fileUrl}`}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-center p-2">
                        <span className="truncate">
                          {fileUrl.split('/').pop()}
                        </span>
                      </div>
                    )}
                    {/* Cross button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs z-10"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                    {/* Transparent overlay with +N */}
                    {isLastVisible && (
                      <div className="absolute inset-0 bg-opacity-0 hover:bg-gray-500/80 flex items-center justify-center text-white font-semibold text-sm transition">
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Drawer>
      )}
      <div className="flex-1 flex items-center">
        <div className="flex flex-1 items-center bg-white border-2 border-indigo-200 rounded-md px-3 py-1 gap-3">
          <textarea
            id="msgInput"
            name="msgInput"
            rows={1}
            className="flex-1 resize-none bg-transparent focus:outline-none text-black break-words overflow-y-auto max-h-[20vh]"
            placeholder="Enter message"
            value={message}
            onChange={handleInputChange}
          />
          <button type="button" onClick={handleFileClick} disabled={!!message}>
            <PaperClipIcon className="size-6 text-primary" />
          </button>
          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
          <EmojiPick
            handleEmojiClick={handleEmojiClick}
            emojiRef={emojiRef}
            open={open}
            handleEmoji={handleEmoji}
          />
        </div>
        {fileUrls.length > 0 && (
          <Tooltip
            content="New Channel"
            position="top"
            bgColor="bg-white"
            textColor="text-primary"
          >
            <button
              onClick={() => setPreviewDrawerOpen(true)}
              className={`rounded-lg transition `}
            >
              <EyeIcon className="ml-2 size-7 text-primary" />
            </button>
          </Tooltip>
        )}
        <button
          type="button"
          onClick={sendNewMessage}
          disabled={
            (!message && fileUrls.length === 0) ||
            (message && fileUrls.length > 0)
          }
          className="ml-3 bg-primary text-white p-2 rounded-full transition duration-300 disabled:bg-gray-400 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default MessageBar;
