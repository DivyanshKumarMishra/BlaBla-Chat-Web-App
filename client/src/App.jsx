import {useEffect, useState} from 'react'
import {BrowserRouter, Navigate, Routes, Route} from 'react-router-dom'
import {Auth, Chat, Profile} from './pages'
import {useSelector, useDispatch} from 'react-redux'
import axiosInstance from './services/axios'
import { PROFILE_ROUTE } from './utils/constants'
import {setUserInfo} from './slices/UserSlice'
import Notification from './components/common/Notification'
import Spinner from './components/common/Spinner'
import AuthRoute from './components/auth/AuthRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const {isLoggedIn} = useSelector((state) => state.userData)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [notificationText, setNotificationText] = useState({})

  useEffect(() => {
    async function getUserInfo(){
      try {
        setLoading(true)
        if(!isLoggedIn){
          const userInfo = await axiosInstance.get(`${PROFILE_ROUTE}/user-info`, {withCredentials: true})
          // console.log(userInfo)
          if(userInfo?.status === 200 && userInfo?.data) dispatch(setUserInfo(userInfo.data._doc || userInfo.data))
        }
      } catch (error) {
        setNotificationText({message: error.message, type: 'error'})
      }finally{
        setLoading(false)
      }
    }
    getUserInfo()
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {notificationText.message && <Notification message={notificationText.message} type={notificationText.type} />}
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
