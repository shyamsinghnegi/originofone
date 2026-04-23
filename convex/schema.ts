import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const address = v.object({
  id: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  province: v.string(),
  postalCode: v.string(),
  country: v.string(),
  isDefault: v.boolean(),
});

const cartItem = v.object({
  productId: v.id("products"),
  slug: v.string(),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  color: v.string(),
  size: v.string(),
  image: v.string(),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("customer"), v.literal("admin")),
    addresses: v.array(address),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  products: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    images: v.array(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    variants: v.array(
      v.object({
        color: v.string(),
        size: v.string(),
        stock: v.number(),
        sku: v.string(),
      })
    ),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        color: v.string(),
        size: v.string(),
        image: v.string(),
      })
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    shippingAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      province: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
    shippingMethod: v.string(),
    subtotal: v.number(),
    shippingCost: v.number(),
    tax: v.number(),
    total: v.number(),
    tracking: v.optional(
      v.object({
        carrier: v.string(),
        trackingNumber: v.string(),
        url: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_razorpay_order_id", ["razorpayOrderId"])
    .index("by_status", ["status"]),

  cart: defineTable({
    userId: v.id("users"),
    items: v.array(cartItem),
    lastUpdated: v.number(),
  }).index("by_user_id", ["userId"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    orderId: v.optional(v.id("orders")),
    rating: v.number(),
    title: v.optional(v.string()),
    body: v.string(),
    verified: v.boolean(),
    helpful: v.number(),
  })
    .index("by_product_id", ["productId"])
    .index("by_user_id", ["userId"]),
});
