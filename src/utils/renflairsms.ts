import axios from "axios";

export const sendOtpViaRenflair = async (phone: string, otp: string) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

  const response = await axios.get(url);

  return response.data;
};

export const sendOrderPlacedSms = async (
  phone: string,
  customerName: string,
  orderId: string,
) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  const message = `Deeksha Gramin Solar
Dear ${customerName}, your order ${orderId} has been placed successfully.
Our representative will contact you within 24–48 hours.
Helpline: +91 7042924765`;

  const url = `https://sms.renflair.in/sendmessage.php?API=${API_KEY}&PHONE=${phone}&MESSAGE=${encodeURIComponent(
    message,
  )}`;

  const response = await axios.get(url);
  return response.data;
};
