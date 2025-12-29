import Order from "../modals/Order";
import { sendOrderPlacedEmail, sendOrderProcessingEmail } from "./emailServices";

export const processOrderEmails = async () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const orders = await Order.find({
    createdAt: { $lte: cutoff },
    processingMailSent: false,
  }).limit(50).populate("user");

  for (const order of orders) {
    const user = order.user as any;

    if (!user?.email || !order.orderId) continue;

        await sendOrderProcessingEmail(
          user.email,
          user.fullname,
          order.orderId,
        );
;

    order.processingMailSent = true;
    await order.save();
  }
};
