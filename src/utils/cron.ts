import cron from "node-cron";
import { processOrderEmails } from "./orderProcessingJob";

cron.schedule("*/10 * * * *", async () => {
  await processOrderEmails();
});
