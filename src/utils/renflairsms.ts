import axios from "axios";

export const sendOtpViaRenflair = async (phone: string, otp: string) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

  const response = await axios.get(url);

  return response.data;
};
