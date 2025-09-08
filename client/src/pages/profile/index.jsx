import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../services/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircleIcon } from '@heroicons/react/20/solid';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/Input/Input';
import Button from '../../components/common/Button';
import { setUserInfo } from '../../slices/UserSlice';
import { UPDATE_PROFILE_URL } from '../../utils/constants';
import Notification from '../../components/common/Notification';
import { getShortName } from '../../utils';

function Profile() {
  const user = useSelector((state) => state.userData.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, clearErrors } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      color: user?.color || '#ff0000',
    },
  });
  const [notificationText, setNotificationText] = useState({
    message: '',
    description: '',
    type: '',
  });

  const [hovered, setHovered] = useState(false);
  const [image, setImage] = useState(user?.image || '');
  const fileInputRef = useRef(null);

  const formHandler = async (data) => {
    // console.log(`data: ${JSON.stringify(data)}`);
    setNotificationText({});
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('image', image || '');
      const result = await axiosInstance.post(UPDATE_PROFILE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (result?.data) {
        setNotificationText({
          message: `Profile updated successfully`,
          type: 'success',
        });
        setTimeout(() => {
          dispatch(setUserInfo(result?.data));
          setNotificationText({});
          navigate('/chat');
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      const { message, details } = error.response.data;
      setNotificationText({
        message: message,
        type: 'error',
        description: details,
      });
      setTimeout(() => {
        setNotificationText({});
      }, 1000);
      return;
    }
  };

  const errorHandler = (errors) => {
    let errObj = {};
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, value]) => {
        errObj[key] = value.message;
      });
      setNotificationText({
        message: 'Error updating profile',
        type: 'error',
        description: errObj,
      });
      setTimeout(() => {
        clearErrors();
        setNotificationText({});
      }, 3000);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    e.target.files[0] && setImage(e.target.files[0]);
  };

  const handleDelete = async () => {
    fileInputRef.current.value = '';
    setImage('');
  };

  return (
    <>
      <Notification
        message={notificationText.message}
        description={notificationText.description}
        type={notificationText.type}
        onClose={() => setNotificationText({})}
      />
      <div className="flex justify-center items-center w-full profile">
        <div className="flex flex-col gap-5 w-full max-w-xs md:max-w-xl bg-white rounded-2xl shadow-2xl p-6">
          <div className="w-full flex flex-col md:flex-row gap-5 md:gap-10 items-center text-center md:text-left">
            <div className="flex items-center justify-center gap-5 md:mt-5 md:w-1/2 w-full h-full">
              <Avatar
                image={image}
                className="bg-white size-40"
                hovered={hovered}
                text={name}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                handleFileClick={handleFileClick}
                handleDelete={handleDelete}
              />
            </div>
            <form
              onSubmit={handleSubmit(formHandler, errorHandler)}
              className="flex flex-col gap-5 w-full mt-5"
            >
              <Input
                name="name"
                type="text"
                className="w-full"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 5,
                    message: 'Name must be at least 5 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Name must be less than 100 characters',
                  },
                })}
              />
              <Input
                name="email"
                type="email"
                className="w-full"
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
              <Button
                label="Save"
                type="submit"
                className="w-full text-center"
              />
            </form>
          </div>
          <div className="flex justify-center itmes-center">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="inline-flex rounded-md bg-white text-gray-500 hover:text-primary"
            >
              <span className="sr-only">Close</span>
              <ArrowLeftCircleIcon aria-hidden="true" className="size-10" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
