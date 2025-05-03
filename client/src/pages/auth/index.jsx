import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/common/Notification';
import axiosInstance from '../../services/axios';
import { AUTH_ROUTE } from '../../utils/constants';
import { setUserInfo } from '../../slices/UserSlice';
import Logo from '../../components/common/Logo';

function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });
  const [notificationText, setNotificationText] = useState({
    message: '',
    description: '',
    type: '',
  });
  const [show, setShow] = useState(false);

  const formHandler = async (data) => {
    // console.log(`data: ${JSON.stringify(data)}`);
    setNotificationText({});
    try {
      if (activeTab === 'signup') {
        const result = await axiosInstance.post(`${AUTH_ROUTE}/signup`, data, {
          withCredentials: true,
        });
        if (result?.status === 201 && result?.data)
          setNotificationText({
            message: 'Account has been created successfully',
            type: 'success',
          });
          setShow(true);
          setActiveTab('login');
      } else {
        const result = await axiosInstance.post(
          `${AUTH_ROUTE}/login`,
          { email: data.email, password: data.password },
          { withCredentials: true }
        );
        if (result?.status === 201 && result?.data) {
          // console.log(result.data); 
          setNotificationText({
            message: `You've successfully logged in`,
            type: 'success',
          });
          setShow(true);
          setTimeout(() => { 
            dispatch(setUserInfo(result?.data)); 
            setShow(false);
            setNotificationText({});
            const { profileSetup } = result.data;
            if (!profileSetup) navigate('/profile');
            else navigate('/chat');
          }, 3000);
        }
      }
    } catch (error) {
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
    }
  };

  const errorHandler = (errors) => {
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        clearErrors();
      }, 3000);
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
    <div className='bg-indigo-100 '>
      <div className="min-h-screen flex flex-col items-start justify-start px-4 pt-6 sm:items-center sm:justify-center sm:px-6 lg:px-8 overflow-y-auto">
      <Notification
        message={notificationText.message}
        description={notificationText.description}
        show={show}
        type={notificationText.type}
        onClose={() => setShow(false)}
      />
      <div className="bg-white w-full max-w-md space-y-6 shadow-lg shadow-gray-500 rounded-md">
        <div className='flex flex-col items-center justify-center pt-5'>
          <Logo className="text-5xl"/>
          <p className='poppins-medium text-lg text-gray-500'>Let the banter begin!</p>
        </div>
        <nav aria-label="Tabs" className="flex justify-center -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={classNames(
                activeTab === tab.name
                  ? 'border-indigo-500 text-indigo-600 border-b-2'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700',
                'whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Auth Form */}
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-6">
          <form
            onSubmit={handleSubmit(formHandler, errorHandler)}
            className="mt-4 sm:mt-6 flex flex-col gap-y-4"
          >
            {/* Name (Signup only) */}
            {activeTab === 'signup' && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-full border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  {...register('name', {
                    required:
                      activeTab === 'signup' ? 'Full name is required' : false,
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
                className="mt-1 block w-full rounded-full border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-full border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                {...register('password', {
                  required: 'password is required',
                  validate: {
                    matchPattern: (value) =>
                      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(
                        value
                      ) ||
                      'password must contain at least 8 characters, at least one uppercase letter, at least one lowercase letter, and at least one number',
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
                  className="mt-1 block w-full rounded-full border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
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
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center rounded-full bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600"
              >
                {activeTab === 'login' ? 'Sign in' : 'Sign up'}
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
