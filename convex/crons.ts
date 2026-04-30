import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Nudge users who left items in cart for 1+ hour
crons.hourly("abandoned cart nudge", { minuteUTC: 15 }, internal.cronHandlers.checkAbandonedCarts);

// Nightly inventory reconciliation
crons.daily("inventory sync", { hourUTC: 3, minuteUTC: 0 }, internal.cronHandlers.syncInventory);

export default crons;
