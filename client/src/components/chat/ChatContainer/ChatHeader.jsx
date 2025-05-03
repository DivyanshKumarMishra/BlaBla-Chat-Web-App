import React from 'react'
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/20/solid'
import {useDispatch, useSelector} from 'react-redux'
import { closeChat } from '../../../slices/ChatSlice'
import { getShortName } from '../../../utils'
import { HOST } from '../../../utils/constants'
import Avatar from '../../common/Avatar'

function ChatHeader({handleSidebar = () => {}, getDMs = () => {}}) {
  const {selectedChat} = useSelector(state => state.chatData)
  const dispatch = useDispatch()
  const {name, email, image, color} = selectedChat

  return (
    <div className='h-[10vh] bg-white border-b-2 border-indigo-200 flex flex-row'>
      <button className='md:hidden' onClick={handleSidebar}>
        <ArrowRightIcon className='text-white bg-primary size-6 focus:border-none focus:outline-none duration-300 transition-all' />
      </button>
      <div className='flex gap-5 items-center justify-between w-full px-5 md:px-10'>
        <div className='flex gap-3 items-center justify-center'>
          <div className="h-full flex items-center justify-start gap-4 py-2 px-3 cursor-pointer">
            <Avatar
              image={image instanceof File ? URL.createObjectURL(image) : image ? `${HOST}/${image}` : ''}
              className="bg-gray-200 size-12 rounded-full shadow-md"
              textSize="text-base"
              color={color || '#8669ff'}
              text={getShortName(name)}
            />
            <div className="text-base lg:text-xl font-semibold text-gray-500">
              {name || email}
            </div>
          </div>
        </div>
        <div className='flex gap-5 items-center justify-center'>
          <button onClick={async () => {
            await getDMs()
            dispatch(closeChat())
          }}>
            <XMarkIcon className='text-primary hover:text-white hover:bg-primary rounded-full size-6 focus:border-none focus:outline-none duration-300 transition-all' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
