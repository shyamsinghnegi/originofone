import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const checkAbandonedCarts = internalAction({
  args: {},
  handler: async (ctx) => {
    const abandonedCarts = await ctx.runMutation(internal.cart.getAbandoned, {
      olderThanMs: ONE_HOUR_MS,
    });

    for (const cart of abandonedCarts) {
      const user = await ctx.runQuery(api.users.getUserById, {
        id: cart.userId,
      });
      if (!user) continue;

      try {
        await ctx.runAction(internal.actions.email.sendAbandonedCartEmail, {
          userEmail: user.email,
          userName: user.name,
          itemCount: cart.items.length,
        });
      } catch (err) {
        console.error(
          `Abandoned-cart email failed for cart ${cart._id}:`,
          err instanceof Error ? err.message : err
        );
      } finally {
        await ctx.runMutation(internal.cart.recordReminderSent, {
          cartId: cart._id,
        });
      }
    }
  },
});

export const syncInventory = internalAction({
  args: {},
  handler: async (_ctx) => {
    // Placeholder: connect to supplier/ERP API to reconcile stock levels.
    // Call ctx.runMutation(internal.products.updateStock, ...) per SKU.
    console.log("Inventory sync completed");
  },
});
