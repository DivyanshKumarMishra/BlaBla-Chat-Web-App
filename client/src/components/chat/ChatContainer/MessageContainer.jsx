import {useRef, useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import moment from 'moment'
import { DocumentIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import axiosInstance from '../../../services/axios'
import { CHANNEL_ROUTE, CHAT_ROUTE, HOST } from '../../../utils/constants'
import {addMessagesToChat, setIsDownloading} from '../../../slices/ChatSlice'
import {checkIfImage} from '../../../utils'
import Modal from '../../common/Modal';
import Spinner from '../../common/Spinner';

function MessageContainer() {
  const {user} = useSelector((state) => state.userData)
  const dispatch = useDispatch()
  const {selectedChat, selectedChatType, selectedChatMessages, isUploading, isDownloading} = useSelector((state) => state.chatData)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    async function getChats(){
      try {
        if(selectedChatType === 'dm' && selectedChat._id){
          setLoading(true)
          const response = await axiosInstance.get(`${CHAT_ROUTE}/get-messages/${selectedChat._id}`, {withCredentials: true})
          if(response.status === 200){
            dispatch(addMessagesToChat({messages:response.data.messages, multiple: false}))
          }
        }else if(selectedChatType === 'channel' && selectedChat._id){
          setLoading(true)
          const response = await axiosInstance.get(`${CHANNEL_ROUTE}/get-channel-messages/${selectedChat._id}`, {withCredentials: true})
          if(response.status === 200){
            dispatch(addMessagesToChat({messages:response.data.messages, multiple: true}))
          }
        }
      } catch (error) {
        console.log(error.message);
        setLoading(false)
      }finally {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      }
    }

    getChats()
  }, [selectedChat, selectedChatType])

  useEffect(() => {
    scrollRef.current && scrollRef.current?.scrollIntoView({behavior: "smooth"})
  }, [selectedChatMessages])

  const downloadFile = async (url) => {
    if(!url) return
      try {
        dispatch(setIsDownloading(true))
        const response = await axiosInstance.get(`${HOST}/${url}`, {responseType: 'blob', withCredentials: true});
        if(response.status === 200){
          console.log('downloading...');          
          const fileURLBlob = window.URL.createObjectURL(new Blob([response.data]));
          const fileLink = document.createElement('a');
          fileLink.href = fileURLBlob;
          fileLink.setAttribute('download', url.split('/').pop());
          document.body.appendChild(fileLink);
          fileLink.click();
          fileLink.remove();
          window.URL.revokeObjectURL(fileURLBlob);
          dispatch(setIsDownloading(false))
        }
      } catch (error) {
        dispatch(setIsDownloading(false))
        console.log(error.message);
      }
  }

  const renderMessages = () => {
    let lastDate=null
    // console.log(selectedChatMessages)
    return selectedChatMessages?.map((message, index) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD')
      const showDate = messageDate !== lastDate
      lastDate = messageDate
      return (
        <div key={index}>
          {showDate && <div className='text-center text-gray-500 my-2'>{moment(message.timestamp).format('LL')}</div>}
          {
            selectedChatType === 'dm' ? renderDmMessage(message) : renderChannelMessage(message)
          }
        </div>
      )
    })
  }

  const renderDmMessage = (message) => (
    <div className={`${message.sender !== selectedChat._id ? 'text-right' : 'text-left'}`}>

      {/* message is text */}
      {message.messageType === 'text' && <div className={`${message.sender !== selectedChat._id ? 'bg-primary text-white' : 'bg-white text-primary'} p-2 rounded-lg my-2 ${message.sender !== selectedChat._id ? 'ml-auto' : 'mr-auto'} p-3 my-1 inline-block max-w-[50%] break-words`}>
        {message.content}
      </div>}

      {/* message is file */}
      {message.messageType === 'file' && (
        <div
          className={`${
            message.sender !== selectedChat._id
              ? 'bg-primary text-white'
              : 'bg-white text-primary'
          } p-2 rounded-lg my-2 ${
            message.sender !== selectedChat._id ? 'ml-auto' : 'mr-auto'
          } inline-block w-auto max-w-[80%] sm:max-w-[60%] md:max-w-[50%] break-words`}
        >
          {message.fileUrl.map((file, index) =>
            checkIfImage(file) ? (
              <div className="cursor-pointer w-full"
                key={index} 
                onClick={() => {
                  setImageUrl(`${file}`)
                  setModalOpen(true)
                }}>
                <img key={file} src={`${HOST}/${file}`} alt={`${file}`} className="m-1 rounded w-full object-contain" style={{ maxWidth: '200px' }} />
              </div>
            ) : (
              <div className="p-2 rounded-lg m-1 bg-white ml-auto w-auto">
                <div className="flex items-center gap-2 w-auto">
                  <DocumentIcon className="size-10 shrink-0 mt-1 text-yellow-500" />
                  <span className="flex-1 text-start text-sm text-primary overflow-hidden break-words">
                    {file.split(/[/\\]/).slice(-1)[0]}
                  </span>
                  <ArrowDownIcon className="size-7 shrink-0 mt-1 text-primary hover:text-white hover:bg-primary rounded-full" 
                  onClick={() => downloadFile(file)}/>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className='text-xs text-gray-600'>
        {moment(message.timestamp).format('LT')}
      </div>
    </div>
  )

  const renderChannelMessage = (message) => {
    return <div className={`${message.sender._id !== user.id ? 'text-left' : 'text-right'}`}>

      {/* message is text */}
      {message.messageType === 'text' && <div className={`${message.sender._id !== user.id ? 'bg-white text-primary' : 'bg-primary text-white'} p-2 rounded-lg my-2 ${message.sender._id !== user.id ? 'mr-auto' : 'ml-auto'} p-3 my-1 inline-block max-w-[50%] break-words`}>
        {message.content}
      </div>}
      {/* message is file */}
      {message.messageType === 'file' && (
        <div
          className={`${
            message.sender._id !== user.id
              ? 'bg-white text-primary'
              : 'bg-primary text-white'
          } p-2 rounded-lg my-2 ${
            message.sender._id !== user.id ? 'mr-auto' : 'ml-auto'
          } inline-block w-auto max-w-[80%] sm:max-w-[60%] md:max-w-[50%] break-words`}
        >
          {message.fileUrl.map((file, index) =>
            checkIfImage(file) ? (
              <div className="cursor-pointer w-full"
                key={index} 
                onClick={() => {
                  setImageUrl(`${file}`)
                  setModalOpen(true)
                }}>
                <img key={file} src={`${HOST}/${file}`} alt={`${file}`} className="m-1 rounded w-full object-contain" style={{ maxWidth: '200px' }} />
              </div>
            ) : (
              <div className="p-2 rounded-lg m-1 bg-white ml-auto w-auto">
                <div className="flex items-center gap-2 w-auto">
                  <DocumentIcon className="size-10 shrink-0 mt-1 text-yellow-500" />
                  <span className="flex-1 text-start text-sm text-primary overflow-hidden break-words">
                    {file.split(/[/\\]/).slice(-1)[0]}
                  </span>
                  <ArrowDownIcon className="size-7 shrink-0 mt-1 text-primary hover:text-white hover:bg-primary rounded-full" 
                  onClick={() => downloadFile(file)}/>
                </div>
              </div>
            )
          )}
        </div>
      )}
      {
        message.sender._id !== user.id ? <div className='text-gray-600 flex flex-row gap-1 items-center'>
          <span className='text-sm'>{message.sender.name.split(' ')[0]}</span>
          <span className='text-xs'>{moment(message.timestamp).format('LT')}</span>
        </div> : <div className='text-xs text-gray-600'>
          {moment(message.timestamp).format('LT')}
        </div>
      }
    </div>
  }
 
  return (
    <div className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 w-full'>
      {(isUploading || isDownloading) ? (<div className='h-full w-full flex flex-col items-center justify-center gap-2'>
          <Spinner className="size-36" />
          <p className="poppins-medium text-lg text-gray-500">
            {isUploading ? 'Uploading...' : 'Downloading...'}
          </p>
        </div>) :
        <>
          {renderMessages()}
          <Modal
            open={modalOpen}
            closeModal={() => setModalOpen(false)}
            className='w-4/5 md:max-w-[80vw] h-[80vh]'
            imageModal={true}
            backdropClasses='bg-gray-800/90'
            childrenClasses='h-full flex items-center justify-center'
          >
            <div id='modal_child' className='h-full md:h-[90%] flex flex-col items-center justify-center'>
              {imageUrl && <img src={`${HOST}/${imageUrl}`} alt={imageUrl} className="max-h-full max-w-full object-contain" />}
              <div className='flex items-center justify-center gap-4 mt-4'>
                <button
                  className="p-1 text-white hover:text-white hover:bg-primary rounded-full"
                  aria-label="Close"
                  onClick={() => {
                    setModalOpen(false)
                    setImageUrl(null)
                  }}>
                  <XMarkIcon className="size-10" />
                </button>
                <button
                  className="p-1 text-white hover:text-white hover:bg-primary rounded-full"
                  aria-label="Download"
                  onClick={() => {
                    downloadFile(imageUrl)
                  }}>
                  <ArrowDownIcon className="size-10" />
                </button>
              </div>
            </div>
          </Modal>
          <div ref={scrollRef}></div>
        </>
      }
    </div>
  )
}

export default MessageContainer
