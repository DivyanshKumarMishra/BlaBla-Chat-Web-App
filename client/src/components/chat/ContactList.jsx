import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {setChatInfo} from '../../slices/ChatSlice'
import { getShortName } from '../../utils'
import { HOST } from '../../utils/constants'
import Avatar from '../common/Avatar'
import moment from 'moment'

function ContactList({contacts = [], isChannel = false, handleSidebar = () => {}}) {
  const {selectedChat} = useSelector(state => state.chatData)
  const dispatch = useDispatch()

  const handleClick = (contact) => {
    if(contact._id === selectedChat?._id) return
    const chatInfo = {
      selectedChatType: isChannel ? 'channel' : 'dm',
      selectedChat: contact,
      selectedChatMessages: []
    }
    dispatch(setChatInfo(chatInfo))
    handleSidebar()
  }

  return (
    <div className='mt-1'>
      {contacts?.map((contact) => {
        return (
          <div
            key={contact._id}
            className={`flex items-center justify-start gap-4 py-2 px-3 hover:bg-indigo-400 cursor-pointer ${
              selectedChat && selectedChat._id === contact._id ? 'bg-indigo-400' : 'bg-primary'
            }`}
            onClick={() => handleClick(contact)}
          >
            {
              !isChannel && (() => {
                const { image, name, _id, color, email, lastMessageTime } = contact;
                return (
                  <>
                    <Avatar
                      image={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image
                          ? `${HOST}/${image}`
                          : ''
                      }
                      className="bg-gray-200 size-10 md:size-12 lg:size-12 rounded-full shadow-md"
                      textSize="text-sm md:text-base lg:text-lg"
                      color={color}
                      text={getShortName(name)}
                    />
                    <div className="flex justify-between items-center h-full w-full">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm md:text-base font-semibold text-white">{name}</div>
                        {/* <div className="text-xs md:text-sm font-semibold text-gray-200">{email}</div> */}
                      </div>
                      {lastMessageTime && (
                        <div className="text-xs md:text-sm font-base text-gray-300">
                          {moment(lastMessageTime).format('LT')}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
            }
            {
              isChannel && (() => {
                const { name, _id, color } = contact;               
                return (
                  <>
                  <Avatar
                    className="size-10 md:size-12 lg:size-12 rounded-full shadow-md"
                    textSize="text-sm md:text-base lg:text-lg"
                    color={color}
                    text={name.split(' ')[0].charAt(0)}
                  />
                  <div className="flex justify-between items-center h-full w-full">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm md:text-base font-semibold text-white">{name}</div>
                    </div>
                  </div>
                  </>
                )
              })()
            }
          </div>
        );
      })}
    </div>
  )
}

export default ContactList
