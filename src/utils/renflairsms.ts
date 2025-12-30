import axios from "axios";

export const sendOtpViaRenflair = async (phone: string, otp: string) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

  const response = await axios.get(url);

  return response.data;
};

export const sendOrderPlacedSms = async (
  phone: string,
  _customerName: string,
  orderId: string,
) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  // Use orderId LAST 4 DIGITS as OTP
  const otp = orderId.slice(-4);

  const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

  const response = await axios.get(url, { timeout: 15000 });

  console.log("Renflair OTP SMS response:", response.data);
  return response.data;
};