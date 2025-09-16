import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, decimal, timestamp, json, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const propertyTypeEnum = pgEnum("property_type", ["caravan", "cabin", "motorhome", "tent", "other"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none", "active", "past_due", "canceled", "incomplete", "trialing"
]);
export const swapStatusEnum = pgEnum("swap_status", [
  "pending", "accepted", "declined", "cancelled"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  country: text("country").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").default(false).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  
  // Billing fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("none").notNull(),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Listings table
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: propertyTypeEnum("type").notNull(),
  maxGuests: integer("max_guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  amenities: json("amenities").$type<string[]>().default([]).notNull(),
  houseRules: text("house_rules"),
  preferredSwapNotes: text("preferred_swap_notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Photos table
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  position: integer("position").default(0).notNull(),
});

// Availability table
export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  isAvailable: boolean("is_available").notNull(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: "set null" }),
  threadId: varchar("thread_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Swaps table
export const swaps = pgTable("swaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requestedUserId: varchar("requested_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requesterListingId: varchar("requester_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  requestedListingId: varchar("requested_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: swapStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  requestedSwaps: many(swaps, { relationName: "requester" }),
  receivedSwaps: many(swaps, { relationName: "requested" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  owner: one(users, {
    fields: [listings.ownerId],
    references: [users.id],
  }),
  photos: many(photos),
  availability: many(availability),
  messages: many(messages),
  requesterSwaps: many(swaps, { relationName: "requesterListing" }),
  requestedSwaps: many(swaps, { relationName: "requestedListing" }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  listing: one(listings, {
    fields: [photos.listingId],
    references: [listings.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  listing: one(listings, {
    fields: [availability.listingId],
    references: [listings.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  requester: one(users, {
    fields: [swaps.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  requestedUser: one(users, {
    fields: [swaps.requestedUserId],
    references: [users.id],
    relationName: "requested",
  }),
  requesterListing: one(listings, {
    fields: [swaps.requesterListingId],
    references: [listings.id],
    relationName: "requesterListing",
  }),
  requestedListing: one(listings, {
    fields: [swaps.requestedListingId],
    references: [listings.id],
    relationName: "requestedListing",
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  country: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
}).omit({
  id: true,
  passwordHash: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  subscriptionCurrentPeriodEnd: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  role: true,
});

export const insertListingSchema = createInsertSchema(listings, {
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(10),
  pricePerNight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0),
  latitude: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
  longitude: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  amenities: z.array(z.string()).default([]),
  houseRules: z.string().max(1000).optional(),
  preferredSwapNotes: z.string().max(1000).optional(),
}).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages, {
  body: z.string().min(1).max(2000),
  threadId: z.string().uuid(),
}).omit({
  id: true,
  senderId: true,
  createdAt: true,
  readAt: true,
});

export const insertSwapSchema = createInsertSchema(swaps, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(), 
  notes: z.string().max(1000).optional(),
}).omit({
  id: true,
  requesterId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability, {
  date: z.date(),
}).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserWithPassword = InsertUser & { password: string };
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;

// Helper types
export type UserWithSubscription = User & {
  isSubscriber: boolean;
};

export type ListingWithPhotos = Listing & {
  photos: Photo[];
  owner: Pick<User, 'id' | 'name' | 'avatarUrl' | 'isVerified'>;
};

export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'name' | 'avatarUrl'>;
};

export type MessageThreadSummary = {
  threadId: string;
  otherUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  lastMessage: Pick<Message, 'id' | 'body' | 'createdAt' | 'senderId' | 'receiverId' | 'readAt'>;
  unreadCount: number;
};

export type SwapWithDetails = Swap & {
  requester: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  requestedUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  requesterListing: Pick<Listing, 'id' | 'title' | 'type' | 'city' | 'country'>;
  requestedListing: Pick<Listing, 'id' | 'title' | 'type' | 'city' | 'country'>;
};