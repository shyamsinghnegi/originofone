/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_email from "../actions/email.js";
import type * as actions_r2 from "../actions/r2.js";
import type * as actions_stripe from "../actions/stripe.js";
import type * as cart from "../cart.js";
import type * as cronHandlers from "../cronHandlers.js";
import type * as crons from "../crons.js";
import type * as emails_AbandonedCart from "../emails/AbandonedCart.js";
import type * as emails_Layout from "../emails/Layout.js";
import type * as emails_OrderConfirmation from "../emails/OrderConfirmation.js";
import type * as emails_PendingPayment from "../emails/PendingPayment.js";
import type * as emails_RefundConfirmation from "../emails/RefundConfirmation.js";
import type * as emails_ReturnNotification from "../emails/ReturnNotification.js";
import type * as emails_ShippingNotification from "../emails/ShippingNotification.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/email": typeof actions_email;
  "actions/r2": typeof actions_r2;
  "actions/stripe": typeof actions_stripe;
  cart: typeof cart;
  cronHandlers: typeof cronHandlers;
  crons: typeof crons;
  "emails/AbandonedCart": typeof emails_AbandonedCart;
  "emails/Layout": typeof emails_Layout;
  "emails/OrderConfirmation": typeof emails_OrderConfirmation;
  "emails/PendingPayment": typeof emails_PendingPayment;
  "emails/RefundConfirmation": typeof emails_RefundConfirmation;
  "emails/ReturnNotification": typeof emails_ReturnNotification;
  "emails/ShippingNotification": typeof emails_ShippingNotification;
  http: typeof http;
  orders: typeof orders;
  products: typeof products;
  reviews: typeof reviews;
  users: typeof users;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
