import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.0.0.138:5000/api  /mobile",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api  