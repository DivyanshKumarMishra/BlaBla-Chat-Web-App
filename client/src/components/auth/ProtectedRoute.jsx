import { useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Spinner from '../common/Spinner'

function ProtectedRoute({children}) {
  const {isLoggedIn} = useSelector((state) => state.userData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [isLoggedIn])

  if (loading) {
    return <div className="flex justify-center items-center h-screen w-full"><Spinner /></div>
  }

  return isLoggedIn ? children : <Navigate to="/auth" />
}

export default ProtectedRoute
