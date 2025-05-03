import { useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Spinner from '../common/Spinner'
import {Outlet} from 'react-router-dom'
import ContactsContainer from '../chat/ContactsBar/ContactsContainer'

function AuthRoute({children}) {
  const {isLoggedIn} = useSelector((state) => state.userData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [isLoggedIn])

  if (loading) {
    return <div className="flex justify-center items-center h-screen w-full"><Spinner /></div>
  }

  return isLoggedIn ? <Navigate to="/chat" replace /> : children
}

export default AuthRoute
