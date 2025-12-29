import cron from "node-cron";
import { processOrderEmails } from "./orderProcessingJob";

let cronInitialized = false;

export const initCronJobs = () => {
  if (cronInitialized) return;

  cronInitialized = true;

  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running order processing cron");
      await processOrderEmails();
    } catch (err) {
      console.error("Cron error:", err);
    }
  });

  console.log("Cron jobs initialized");
};
