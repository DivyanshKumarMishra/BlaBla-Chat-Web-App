import axios from 'axios'
import {HOST} from '../utils/constants'

const axiosInstance = axios.create({
  baseURL: HOST
})

export default axiosInstance