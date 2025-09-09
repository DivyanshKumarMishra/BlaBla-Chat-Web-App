import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Spinner from '../common/Spinner';
import AppHeader from '../common/Header';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.userData);
  const { selectedChat } = useSelector((state) => state.chatData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }

  return isLoggedIn ? (
    <div className="h-screen w-screen flex flex-col bg-gray-200 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  ) : (
    <Navigate to="/auth" />
  );
}

export default ProtectedRoute;
