import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});


export const sendOrderPlacedEmail = async (
  email: string,
  customerName: string,
  orderId: string,
) => {
  try {
      const textBody = `Dear ${customerName},

Thank you for choosing Deeksha Gramin Solar.

We are happy to inform you that your order ${orderId} has been placed successfully with us. Your request has been recorded in our system, and our team will now proceed with the next steps to process your order smoothly.

A representative from Deeksha Gramin Solar will contact you within 24–48 hours to verify details, provide further assistance, and guide you through the upcoming process.

If you have any questions or need support at any stage, please feel free to reach out to us at our helpline number +91 7042924765. Our team will be glad to assist you.

Thank you for trusting Deeksha Gramin Solar.
We look forward to serving you with reliable and sustainable solar solutions.

Warm regards,
Team Deeksha Gramin Solar`;

  console.log("Sending order placed email to:", email);

  await transporter.sendMail({
    from: `"Deeksha Gramin Solar" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Order Placed Successfully - ${orderId}`,
    text: textBody,
  });
  console.log("Order placed email sent to:", email);

  } catch (error: any) {
    console.error("Email send failed:", error.message);
    throw error; 
  }

};

export const sendOrderProcessingEmail = async (
  email: string,
  customerName: string,
  orderId: string,
) => {
  const body = `Dear ${customerName},

Thank you for choosing Deeksha Gramin Solar.

This is to inform you that your order ${orderId} has been successfully received and is currently under processing. Our team is reviewing your order details and preparing the next steps to ensure a smooth installation and service experience.

Our representative will be reaching out to you shortly to assist you further and share the necessary updates related to your order.

If you have any queries or require assistance in the meantime, please feel free to contact our helpline at +91 7042924765.

Thank you for your trust in Deeksha Gramin Solar.
We look forward to serving you.

Warm regards,
Team Deeksha Gramin Solar`;

  await transporter.sendMail({
    from: `"Deeksha Gramin Solar" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Order Under Processing - ${orderId}`,
    text: body,
  });
};
