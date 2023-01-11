import axios from 'axios';

const baseURL = "https://booking-appointment-api.vercel.app/api/v1";

const apiConfig = axios.create({
    baseURL
});

export default apiConfig;