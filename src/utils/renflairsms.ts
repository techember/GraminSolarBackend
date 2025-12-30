import axios from "axios";

export const sendOtpViaRenflair = async (phone: string, otp: string) => {
  const API_KEY = process.env.RENFLAIR_API_KEY;

  const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

  const response = await axios.get(url);

  return response.data;
};

// export const sendOrderPlacedSms = async (
//   phone: string,
//   customerName: string,
//   orderId: string,
// ) => {
//   const API_KEY = process.env.RENFLAIR_API_KEY;

//   const message = `Deeksha Gramin Solar
// Dear ${customerName}, your order ${orderId} has been placed successfully.
// Our representative will contact you within 24–48 hours.
// Helpline: +91 7042924765`;

//   const url = `https://sms.renflair.in/sendmessage.php?API=${API_KEY}&PHONE=${phone}&MESSAGE=${encodeURIComponent(
//     message,
//   )}`;

//   const response = await axios.get(url);
//   console.log("Renflair SMS response:", response.data);
//   return response.data;
// };


// export const sendOrderPlacedSms = async (
//   phone: string,
//   _customerName: string,
//   orderId: string,
// ) => {
//   try {
//     const API_KEY = process.env.RENFLAIR_API_KEY;
//     const otp = orderId.slice(-4);

//     const url = `https://sms.renflair.in/V1.php?API=${API_KEY}&PHONE=${phone}&OTP=${otp}`;

//     const response = await axios.get(url, { timeout: 8000 });

//     console.log("Renflair SMS:", response.data);
//     return response.data;
//   } catch (err) {
//     //@ts-ignore
//     console.error(" Renflair SMS failed (ignored):", err.code || err.message);
//     return null; // ⬅NEVER THROW
//   }
// };

export const sendOrderPlacedSms = async (
  phone: string,
  customerName: string,
  orderId: string,
) => {
  try {
    const API_KEY = process.env.RENFLAIR_API_KEY;

    const message = `Hi ${customerName}, Your order ID ${orderId} has been placed successfully. It will be delivered soon.`;

    const url = "https://sms.renflair.in/V1.php";

    const response = await axios.get(url, {
      params: {
        API: API_KEY,
        PHONE: phone,
        MESSAGE: message,
      },
      timeout: 8000,
    });

    console.log(" Renflair V1 MESSAGE response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error(" Renflair V1 MESSAGE failed:", err.code || err.message);
    return null; // NEVER break order
  }
};


