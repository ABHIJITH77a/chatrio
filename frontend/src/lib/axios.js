import axios from"axios";

export const axiosInstance=axios.create({
    baseURL:"https://chatrio-qshq.onrender.com/api",
    withCredentials:true,
})
