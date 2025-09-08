import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/common/Notification';
import axiosInstance from '../../services/axios';
import {
  SIGNUP_URL,
  LOGIN_URL,
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../../utils/constants';
import { setUserInfo } from '../../slices/UserSlice';
import Logo from '../../components/common/Logo';
import FileUpload from '../../components/Input/FileInput';
import axios from 'axios';
import InfoButton from '../../components/common/InfoButton';
import validationMessages from './validation';

const supportedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      image: '',
    },
  });

  const [notificationText, setNotificationText] = useState({
    message: '',
    description: '',
    type: '',
  });

  const buttonState = {
    login: isSubmitting ? 'Logging in...' : 'Login',
    signup: isSubmitting ? 'Signing up...' : 'Sign Up',
  };

  const formHandler = async (data) => {
    // console.log(`data: ${JSON.stringify(data)}`);
    setNotificationText({});
    try {
      if (activeTab === 'signup') {
        const result = await axiosInstance.post(SIGNUP_URL, data, {
          withCredentials: true,
          type: 'multipart/form-data',
        });

        if (result?.status === 201)
          setNotificationText({
            message: 'Account has been created successfully',
            type: 'success',
          });

        setActiveTab('login');
        setTimeout(() => {
          setNotificationText({});
        }, 500);
      } else {
        const result = await axiosInstance.post(
          LOGIN_URL,
          { email: data.email, password: data.password },
          { withCredentials: true }
        );
        if (result?.status === 200 && result?.data) {
          // console.log(result.data);
          setNotificationText({
            message: `You've successfully logged in`,
            type: 'success',
          });

          setTimeout(() => {
            dispatch(setUserInfo(result?.data));
            setNotificationText({});
            navigate('/chat', { replace: true });
          }, 1000);
        }
      }
    } catch (error) {
      const { message, details } = error.response.data;
      setNotificationText({
        message: message,
        type: 'error',
        description: details,
      });

      setTimeout(() => {
        setNotificationText({});
      }, 1000);
    }
  };

  const errorHandler = (errors) => {
    console.log(errors);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        clearErrors();
      }, 3000);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setLoading(true);
      if (e.target.files?.length <= 0) return;

      // get the filename from the file upload component
      const chosenFile = e.target.files[0];
      if (!supportedFileTypes.includes(chosenFile.type)) {
        setNotificationText({
          type: 'error',
          message: 'Unsupported file type',
        });
      }
      setFileName(chosenFile.name);

      // upload the file to cloudinary
      const formData = new FormData();
      formData.append('file', chosenFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.data) setFileName('');
      setValue('image', response.data.url.toString());
    } catch (error) {
      setNotificationText({
        type: 'error',
        message: 'Something went wrong. Please select the file again',
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShow(false);
        setNotificationText({});
      }, 1000);
    }
  };

  const tabs = [
    { name: 'login', label: 'Login' },
    { name: 'signup', label: 'Signup' },
  ];

  useEffect(() => {
    reset();
    clearErrors();
  }, [activeTab]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="auth">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:px-6 lg:px-8 overflow-y-auto">
        <Notification
          message={notificationText.message}
          description={notificationText.description}
          type={notificationText.type}
          onClose={() => setNotificationText({})}
        />
        <div className="bg-white flex flex-col gap-3 w-full max-w-md shadow-lg shadow-gray-500 rounded-lg">
          <div className="flex flex-col items-center justify-center pt-5">
            <Logo className="text-5xl" />
            <p className="poppins-medium text-lg text-gray-500">
              Let the banter begin!
            </p>
          </div>
          <nav
            aria-label="Tabs"
            className="flex justify-center -mb-px px-4 gap-3"
          >
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={classNames(
                  activeTab === tab.name
                    ? 'bg-indigo-200 text-indigo-800'
                    : 'bg-gray-200 text-indigo-500 hover:bg-gray-300',
                  'w-1/2 px-4 py-2 rounded-full text-sm font-medium transition-colors'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Auth Form */}
          <div className="bg-white pt-2 pb-6 px-4 shadow sm:rounded-lg sm:px-6">
            <form
              onSubmit={handleSubmit(formHandler, errorHandler)}
              className="flex flex-col gap-y-2"
            >
              {activeTab === 'signup' && (
                <div>
                  <div className="flex gap-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Full Name
                    </label>
                    <InfoButton text={validationMessages['name']} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    {...register('name', {
                      required:
                        activeTab === 'signup'
                          ? 'Full name is required'
                          : false,
                    })}
                  />
                  {errors?.name?.message && (
                    <p className="inline-block my-1 pl-1 text-red-600">
                      {errors?.name?.message}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
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
                {errors?.email?.message && (
                  <p className="inline-block my-1 pl-1 text-red-600">
                    {errors?.email?.message}
                  </p>
                )}
              </div>
              <div>
                <div className="flex gap-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <InfoButton text={validationMessages['password']} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  {...register('password', {
                    required: 'password is required',
                    validate: {
                      matchPattern: (value) =>
                        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(
                          value
                        ) || 'please enter a valid password',
                    },
                  })}
                />
                {errors?.password?.message && (
                  <p className="inline-block my-1 pl-1 text-red-600">
                    {errors?.password?.message}
                  </p>
                )}
              </div>
              {activeTab === 'signup' && (
                <div className="flex flex-col gap-y-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                      {...register('confirm_password', {
                        required: 'please confirm your password',
                        validate: {
                          matchPattern: (value) =>
                            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(
                              value
                            ) ||
                            'password must contain at least 8 characters, at least one uppercase letter, at least one lowercase letter, and at least one number',
                        },
                      })}
                    />
                    {errors?.confirm_password?.message && (
                      <p className="inline-block my-1 pl-1 text-red-600">
                        {errors?.confirm_password?.message}
                      </p>
                    )}
                  </div>
                  <FileUpload
                    label="Upload Profile Picture"
                    fileName={fileName}
                    loading={loading}
                    error={errors?.image?.message}
                    handleImageUpload={handleImageUpload}
                    {...register('image', {
                      required: 'please upload a profile picture',
                    })}
                  />
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:ring-indigo-600 ${
                    loading || isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {buttonState[activeTab]}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
