import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/20/solid';
import Avatar from '../../common/Avatar';
import { HOST } from '../../../utils/constants';
import Button from '../../common/Button';
import { getShortName } from '../../../utils';

function ProfileInfo() {
  const { image, name, email, color } = useSelector(
    (state) => state.userData.user
  );
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white flex flex-1 flex-col items-center justify-center rounded-2xl p-6 w-full max-w-xs mx-auto shadow-lg">
      <div className="relative mb-4">
        <Avatar
          image={image}
          className="bg-gray-200 size-36 rounded-full shadow-md"
          textSize="text-xl"
          text={getShortName(name)}
        />
      </div>
      <div className="text-center w-full space-y-2">
        <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary">
          {name}
        </div>
        <div className="text-sm md:text-md lg:text-lg text-gray-700">
          {email}
        </div>
      </div>
      <Button
        label="Edit profile"
        onClick={handleEditProfile}
        className="mt-4 rounded-full p-3 w-24 sm:w-30 md:w-40"
      />
    </div>
  );
}

export default ProfileInfo;
