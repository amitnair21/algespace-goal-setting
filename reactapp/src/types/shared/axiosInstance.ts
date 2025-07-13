import Axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = Axios.create({
    baseURL: "https://algespace-goal-setting.onrender.com",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": `${import.meta.env.VITE_API_KEY}`
    }
});

export default axiosInstance;
