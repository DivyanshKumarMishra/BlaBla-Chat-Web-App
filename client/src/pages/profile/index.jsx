import {useEffect, useState, useRef} from 'react'
import axiosInstance from '../../services/axios'
import {useSelector} from 'react-redux'
import {useForm} from 'react-hook-form'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircleIcon } from '@heroicons/react/20/solid'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/Input/Input'
import Button from '../../components/common/Button'
import ColorPicker from '../../components/common/ColorPicker'
import { setUserInfo } from '../../slices/UserSlice';
import { HOST, PROFILE_ROUTE } from '../../utils/constants';
import Notification from '../../components/common/Notification';
import { getShortName } from '../../utils';

function Profile() {
  const user = useSelector((state) => state.userData.user)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {register, handleSubmit, clearErrors} = useForm({
    defaultValues:{
      name: user?.name,
      email: user?.email,
      color: user?.color || '#ff0000',
    }
  })
  const [notificationText, setNotificationText] = useState({
    message: '',
    description: '',
    type: '',
  });
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false)
  const [color, setColor] = useState(user?.color || '#ff0000')
  const [name, setName] = useState('')
  const [image, setImage] = useState(user?.image || '')
  const fileInputRef = useRef(null)
  
  useEffect(() => {
    const name = getShortName(user?.name)
    setName(name)

    return () => {
      if (image instanceof File) {
        URL.revokeObjectURL(image);
      }
    };
  }, [user, image])

  const formHandler = async (data) => {
    // console.log(`data: ${JSON.stringify(data)}`);
    setNotificationText({});
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      })
      formData.set('color', color)
      formData.append('image', image || '');
      const result = await axiosInstance.post(
        `${PROFILE_ROUTE}/update-profile`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (result?.data) {
        setNotificationText({
          message: `Profile updated successfully`,
          type: 'success',
        });
        setShow(true);
        setTimeout(() => {
          dispatch(setUserInfo(result?.data));
          setShow(false);
          setNotificationText({});
          navigate('/chat')
        }, 3000);
      }
    } catch (error) {
      console.log(error);
      const { message, details } = error.response.data;
      setNotificationText({
        message: message,
        type: 'error',
        description: details,
      });
      setShow(true);
      setTimeout(() => {
        setShow(false);
        setNotificationText({});
      }, 3000);
      return;
    }
  };

  const errorHandler = (errors) => {
    let errObj = {}
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, value]) => {
        errObj[key] = value.message
      })
      setShow(true);
      setNotificationText({
        message: 'Error updating profile',
        type: 'error',
        description: errObj,
      });
      setTimeout(() => {
        clearErrors();
        setShow(false);
      }, 5000);
    }
  };

  const handleNavigate = () => {
    if(user?.profileSetup) navigate('/chat')
    else {
      setShow(true);
      setNotificationText({
        message: 'Please setup your profile first',
        type: 'error',
      });
      setTimeout(() => {
        setShow(false);
      }, 5000);
    }
  }

  const handleFileClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    e.target.files[0] && setImage(e.target.files[0])
  }

  const handleDelete = async () => {
    fileInputRef.current.value = '';
    setImage('')
  }

  return (
    <>
      <Notification
        message={notificationText.message}
        description={notificationText.description}
        show={show}
        type={notificationText.type}
        onClose={() => setShow(false)}
      />
      <div className="flex flex-col justify-center items-center min-h-screen w-full bg-indigo-100">
        <div className="flex flex-col gap-5 w-full max-w-sm md:max-w-2xl bg-white rounded-2xl shadow-2xl py-6 md:px-12">
          <div className="w-full flex flex-col md:flex-row gap-5 md:gap-10 items-center md:items-start text-center md:text-left p-6">
            <div className="flex flex-col items-center justify-center md:justify-start gap-5 w-1/2">
              <Avatar 
                image={(image instanceof File ? URL.createObjectURL(image) : image ? `${HOST}/${image}` : '')}
                className="bg-white size-36" 
                color={color} 
                hovered={hovered} 
                text={name}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                handleFileClick={handleFileClick}
                handleDelete={handleDelete}
              />
              <ColorPicker value={color} onChange={(e) => setColor(e.target.value)} required={true}/>
            </div>
            <form onSubmit={handleSubmit(formHandler, errorHandler)} className="flex flex-col gap-5 w-full mt-5">
            <Input name="name" type="text" className="w-full" 
              {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 5, message: 'Name must be at least 5 characters' },
                  maxLength: { value: 100, message: 'Name must be less than 100 characters' },
              })}/>
              <Input name="email" type="email" className="w-full" 
                {...register('email', {
                  required: 'email is required',
                  validate: {
                    matchPattern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        value
                      ) || 'Email address must be a valid address',
                  },
                })}
              />
              <Button label="Save" type="submit" className="w-full text-center" />
            </form>
          </div>
          <div className='flex justify-center itmes-center'>
            <button
              type="button"
              onClick={handleNavigate}
              className="inline-flex rounded-md bg-white text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <ArrowLeftCircleIcon aria-hidden="true" className="size-10" />
            </button>
          </div>
        </div>  
      </div>
    </>
  )
}

export default Profile