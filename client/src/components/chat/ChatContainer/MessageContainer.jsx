import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  DocumentIcon,
  ArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import axiosInstance from '../../../services/axios';
import { HOST } from '../../../utils/constants';
import { setIsDownloading } from '../../../slices/ChatSlice';
import { checkIfImage } from '../../../utils';
import Modal from '../../common/Modal';
import Spinner from '../../common/Spinner';
import { useSocket } from '../../../contexts/SocketContext';
import Animation from '../../animation';

function MessageContainer({
  setLoading = () => {},
  fetchChatMessages = () => {},
  selectedChatMessages = [],
  loading = false,
}) {
  const { user } = useSelector((state) => state.userData);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { selectedChat, isUploading, isDownloading, typingUsers } = useSelector(
    (state) => state.chatData
  );
  const scrollRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!selectedChat) return;
    fetchChatMessages();

    // joining a room for chat
    socket.emit('join-chat', selectedChat._id);
    scrollRef.current &&
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => {
      socket.emit('leave-chat', selectedChat._id);
    };
  }, [selectedChat._id]);

  useEffect(() => {
    scrollRef.current &&
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatMessages.length]);

  const downloadFile = async (url) => {
    if (!url) return;
    try {
      dispatch(setIsDownloading(true));
      const response = await axiosInstance.get(`${HOST}/${url}`, {
        responseType: 'blob',
        withCredentials: true,
      });
      if (response.status === 200) {
        console.log('downloading...');
        const fileURLBlob = window.URL.createObjectURL(
          new Blob([response.data])
        );
        const fileLink = document.createElement('a');
        fileLink.href = fileURLBlob;
        fileLink.setAttribute('download', url.split('/').pop());
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        window.URL.revokeObjectURL(fileURLBlob);
        dispatch(setIsDownloading(false));
      }
    } catch (error) {
      dispatch(setIsDownloading(false));
      console.log(error.message);
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages?.map((message, index) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {/* {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format('LL')}
            </div>
          )} */}
          {!selectedChat.isGroupChat
            ? renderDmMessage(message)
            : renderGroupMessage(message)}
        </div>
      );
    });
  };

  const renderDmMessage = (message) => (
    <div
      className={`${
        message.sender._id === user.id ? 'text-right' : 'text-left'
      }`}
    >
      {/* {message.sender._id} : {' '}
      {selectedChat._id} */}
      {message.messageType === 'text' && (
        <div
          className={`p-3 my-2 inline-block max-w-[50%] break-words rounded-lg ${
            message.sender._id === user.id
              ? 'bg-primary text-white'
              : 'bg-white text-primary'
          } ${message.sender === user.id ? 'ml-auto' : 'mr-auto'}`}
        >
          <span>{message.content}</span>
        </div>
      )}

      {/* message is file */}
      {message.messageType === 'file' && (
        <div
          className={`inline-block w-auto max-w-[80%] sm:max-w-[60%] md:max-w-[50%] break-words p-3 rounded-lg my-2 ${
            message.sender !== selectedChat._id
              ? 'bg-primary text-white'
              : 'bg-white text-primary'
          } ${message.sender !== selectedChat._id ? 'ml-auto' : 'mr-auto'}`}
        >
          {message.fileUrl.map((file, index) =>
            checkIfImage(file) ? (
              <div
                className="cursor-pointer w-full"
                key={index}
                onClick={() => {
                  setImageUrl(`${file}`);
                  setModalOpen(true);
                }}
              >
                <img
                  key={file}
                  src={`${HOST}/${file}`}
                  alt={`${file}`}
                  className="m-1 rounded w-full object-contain"
                  style={{ maxWidth: '200px' }}
                />
              </div>
            ) : (
              <div
                key={index}
                className="p-2 rounded-lg m-1 bg-white ml-auto w-auto"
              >
                <div className="flex items-center gap-2 w-auto">
                  <DocumentIcon className="size-10 shrink-0 mt-1 text-yellow-500" />
                  <span className="flex-1 text-start text-sm text-primary overflow-hidden break-words">
                    {file.split(/[/\\]/).slice(-1)[0]}
                  </span>
                  <ArrowDownIcon
                    className="size-7 shrink-0 mt-1 text-primary hover:text-white hover:bg-primary rounded-full"
                    onClick={() => downloadFile(file)}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format('LT')}
      </div>
    </div>
  );

  const renderGroupMessage = (message) => {
    return (
      <div
        className={`${
          message.sender._id !== user.id ? 'text-left' : 'text-right'
        }`}
      >
        {/* message is text */}
        {message.messageType === 'text' && (
          <div
            className={`rounded-lg p-3 my-2 inline-block max-w-[50%] break-words ${
              message.sender._id !== user.id
                ? 'bg-white text-primary'
                : 'bg-primary text-white'
            }  ${message.sender._id !== user.id ? 'mr-auto' : 'ml-auto'}`}
          >
            <div className="flex flex-col">
              {message.sender?._id !== user.id && (
                <span className="font-semibold text-gray-600">
                  {message.sender?.name?.split(' ')[0]}
                </span>
              )}
              <span>{message.content}</span>
            </div>
          </div>
        )}
        {/* message is file */}
        {message.messageType === 'file' && (
          <div
            className={`p-3 rounded-lg my-2 inline-block w-auto max-w-[80%] sm:max-w-[60%] md:max-w-[50%] break-words ${
              message.sender._id !== user.id
                ? 'bg-white text-primary'
                : 'bg-primary text-white'
            } ${message.sender._id !== user.id ? 'mr-auto' : 'ml-auto'}`}
          >
            {message.fileUrl.map((file, index) =>
              checkIfImage(file) ? (
                <div
                  className="cursor-pointer w-full"
                  key={index}
                  onClick={() => {
                    setImageUrl(`${file}`);
                    setModalOpen(true);
                  }}
                >
                  <img
                    key={file}
                    src={`${HOST}/${file}`}
                    alt={`${file}`}
                    className="m-1 rounded w-full object-contain"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              ) : (
                <div className="p-2 rounded-lg m-1 bg-white ml-auto w-auto">
                  <div className="flex items-center gap-2 w-auto">
                    <DocumentIcon className="size-10 shrink-0 mt-1 text-yellow-500" />
                    <span className="flex-1 text-start text-sm text-primary overflow-hidden break-words">
                      {file.split(/[/\\]/).slice(-1)[0]}
                    </span>
                    <ArrowDownIcon
                      className="size-7 shrink-0 mt-1 text-primary hover:text-white hover:bg-primary rounded-full"
                      onClick={() => downloadFile(file)}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
        {message.sender._id !== user.id ? (
          <div className="text-gray-600 flex flex-row gap-1 items-center">
            <span className="text-xs">
              {moment(message.timestamp).format('LT')}
            </span>
          </div>
        ) : (
          <div className="text-xs text-gray-600">
            {moment(message.timestamp).format('LT')}
          </div>
        )}
      </div>
    );
  };

  const getTypingIndicator = () => {
    const typingUsersInChat = typingUsers?.filter(
      (tu) => tu.roomId === selectedChat?._id
    );

    const typingUserNames = selectedChat?.members
      ?.filter(
        (m) => typingUsersInChat.findIndex((tu) => tu.userId === m._id) > -1
      )
      .map((m) => m.name?.split(' ')[0]);

    const isTyping = typingUserNames.length > 0;
    const typingText = typingUserNames.join(', ');

    return (
      <>
        {isTyping && (
          <div className="flex flex-col items-start">
            {!selectedChat?.isGroupChat && (
              <div className="bg-white text-primary rounded-lg my-2 inline-flex items-center max-w-[50%]">
                <Animation
                  src="/animations/typing.lottie"
                  className="w-20 h-10"
                />
              </div>
            )}
            <span className="text-sm text-gray-500">
              {typingText} {typingUserNames.length > 1 ? 'are' : 'is'} typing...
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 px-8 w-full">
      {loading || isUploading || isDownloading ? (
        <div className="h-full w-full  flex flex-col items-center justify-center gap-2">
          <Spinner className="size-36" />
          <p className="poppins-medium text-lg text-gray-500">
            {loading
              ? 'fetching messages'
              : isUploading
              ? 'Uploading...'
              : 'Downloading...'}
          </p>
        </div>
      ) : (
        <>
          {renderMessages()}
          {getTypingIndicator()}
          <div ref={scrollRef}></div>
          {/* <Modal
            open={modalOpen}
            closeModal={() => setModalOpen(false)}
            className="w-4/5 md:max-w-[80vw] h-[80vh]"
            imageModal={true}
            backdropClasses="bg-gray-800/90"
            childrenClasses="h-full flex items-center justify-center"
          >
            <div
              id="modal_child"
              className="h-full md:h-[90%] flex flex-col items-center justify-center"
            >
              {imageUrl && (
                <img
                  src={`${HOST}/${imageUrl}`}
                  alt={imageUrl}
                  className="max-h-full max-w-full object-contain"
                />
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  className="p-1 text-white hover:text-white hover:bg-primary rounded-full"
                  aria-label="Close"
                  onClick={() => {
                    setModalOpen(false);
                    setImageUrl(null);
                  }}
                >
                  <XMarkIcon className="size-10" />
                </button>
                <button
                  className="p-1 text-white hover:text-white hover:bg-primary rounded-full"
                  aria-label="Download"
                  onClick={() => {
                    downloadFile(imageUrl);
                  }}
                >
                  <ArrowDownIcon className="size-10" />
                </button>
              </div>
            </div>
          </Modal> */}
        </>
      )}
    </div>
  );
}

export default MessageContainer;
