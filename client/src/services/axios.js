import axios from 'axios'
import {HOST} from '../utils/constants'

const axiosInstance = axios.create({
  baseURL: HOST,
    headers: {
    'Content-Type': 'application/json',
    accept: 'application/json'
  },
  withCredentials: true // allows cookies to be sent in cross-origin requests
})

export default axiosInstance