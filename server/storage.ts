import { eq, and, gte, lte, like, sql, desc, asc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  listings, 
  photos, 
  availability, 
  messages, 
  swaps,
  notifications,
  type User, 
  type InsertUser,
  type InsertUserWithPassword, 
  type Listing,
  type InsertListing,
  type Photo,
  type InsertPhoto,
  type Availability,
  type InsertAvailability,
  type Message,
  type InsertMessage,
  type Swap,
  type InsertSwap,
  type Notification,
  type InsertNotification,
  type UserWithSubscription,
  type ListingWithPhotos,
  type MessageWithSender,
  type SwapWithDetails
} from "@shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { 
  schema: { users, listings, photos, availability, messages, swaps, notifications }
});

// Storage interface
export interface IStorage {
  // User operations
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getUserById(id: string): Promise<UserWithSubscription | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  verifyUser(id: string): Promise<void>;
  updateUserSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus: string;
    subscriptionCurrentPeriodEnd?: Date;
  }): Promise<void>;
  
  // Listing operations
  createListing(listing: InsertListing & { ownerId: string }): Promise<Listing>;
  getListingById(id: string): Promise<ListingWithPhotos | undefined>;
  getListingsByOwner(ownerId: string): Promise<ListingWithPhotos[]>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  searchListings(
    filters: any,
    coordinates?: { lat: number; lng: number },
    radiusKm?: number,
    sortBy?: string,
    page?: number,
    limit?: number,
    amenities?: string[]
  ): Promise<{ listings: ListingWithPhotos[]; totalCount: number }>;
  
  // Photo operations
  addPhotosToListing(listingId: string, photos: Omit<InsertPhoto, 'listingId'>[]): Promise<Photo[]>;
  addPhoto(photo: Omit<InsertPhoto, 'id'>): Promise<Photo>;
  getPhotoById(id: string): Promise<Photo | undefined>;
  deletePhoto(photoId: string): Promise<void>;
  
  // Availability operations
  setAvailability(listingId: string, availabilityData: Omit<InsertAvailability, 'listingId'>[]): Promise<void>;
  getAvailability(listingId: string, startDate?: Date, endDate?: Date): Promise<Availability[]>;
  
  // Message operations
  createMessage(message: InsertMessage & { senderId: string }): Promise<Message>;
  getMessageThread(threadId: string): Promise<MessageWithSender[]>;
  getUserThreads(userId: string): Promise<Array<{
    threadId: string;
    otherUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    lastMessage: Message;
    unreadCount: number;
  }>>;
  markMessagesAsRead(threadId: string, userId: string): Promise<void>;
  
  // Swap operations
  createSwap(swap: InsertSwap & { requesterId: string }): Promise<Swap>;
  getSwapById(id: string): Promise<SwapWithDetails | undefined>;
  getSwapsByUser(userId: string): Promise<SwapWithDetails[]>;
  updateSwapStatus(id: string, status: "pending" | "accepted" | "declined" | "cancelled"): Promise<Swap>;
  checkSwapConflicts(requesterListingId: string, requestedListingId: string, startDate: Date, endDate: Date): Promise<Swap[]>;
  acceptSwapWithConflictCheck(id: string): Promise<Swap>;
  
  // Notification operations
  createNotification(notification: InsertNotification & { userId: string }): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getAllListings(limit?: number, offset?: number): Promise<ListingWithPhotos[]>;
  updateUserRole(userId: string, role: "user" | "admin"): Promise<void>;
  toggleListingActive(listingId: string): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      passwordHash: userData.passwordHash,
    }).returning();
    return user;
  }

  async getUserById(id: string): Promise<UserWithSubscription | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    return {
      ...user,
      isSubscriber: user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUser(id: string): Promise<void> {
    await db.update(users)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus: string;
    subscriptionCurrentPeriodEnd?: Date;
  }): Promise<void> {
    await db.update(users)
      .set({
        ...subscriptionData,
        subscriptionStatus: subscriptionData.subscriptionStatus as any,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Listing operations
  async createListing(listingData: InsertListing & { ownerId: string }): Promise<Listing> {
    const [listing] = await db.insert(listings).values(listingData).returning();
    return listing;
  }

  async getListingById(id: string): Promise<ListingWithPhotos | undefined> {
    const [listing] = await db.select().from(listings)
      .where(eq(listings.id, id));

    if (!listing) return undefined;

    // Get photos for the listing
    const listingPhotos = await db.select().from(photos)
      .where(eq(photos.listingId, id))
      .orderBy(asc(photos.position));

    // Get owner details
    const [owner] = await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      isVerified: users.isVerified,
    }).from(users).where(eq(users.id, listing.ownerId));

    return {
      ...listing,
      photos: listingPhotos,
      owner: owner,
    } as ListingWithPhotos;
  }

  async getListingsByOwner(ownerId: string): Promise<ListingWithPhotos[]> {
    const ownerListings = await db.select().from(listings)
      .where(eq(listings.ownerId, ownerId))
      .orderBy(desc(listings.createdAt));

    const results: ListingWithPhotos[] = [];
    for (const listing of ownerListings) {
      const listingPhotos = await db.select().from(photos)
        .where(eq(photos.listingId, listing.id))
        .orderBy(asc(photos.position));
      
      const [owner] = await db.select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      }).from(users).where(eq(users.id, listing.ownerId));

      results.push({
        ...listing,
        photos: listingPhotos,
        owner: owner,
      } as ListingWithPhotos);
    }
    
    return results;
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const [listing] = await db.update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: string): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async searchListings(
    filters: any,
    coordinates?: { lat: number; lng: number },
    radiusKm?: number,
    sortBy?: string,
    page?: number,
    limit?: number,
    amenities?: string[]
  ): Promise<{ listings: ListingWithPhotos[]; totalCount: number }> {
    const conditions = [eq(listings.isActive, true)];

    // Handle text search in title, description, city, or country
    if (filters.location && filters.location.trim()) {
      const locationSearch = `%${filters.location.trim().toLowerCase()}%`;
      conditions.push(
        sql`(
          LOWER(${listings.title}) LIKE ${locationSearch} OR
          LOWER(${listings.description}) LIKE ${locationSearch} OR
          LOWER(${listings.city}) LIKE ${locationSearch} OR
          LOWER(${listings.country}) LIKE ${locationSearch} OR
          LOWER(${listings.address}) LIKE ${locationSearch}
        )`
      );
    }

    // Handle property type filter
    if (filters.type && filters.type !== '') {
      conditions.push(eq(listings.type, filters.type));
    }

    // Handle guest capacity filter
    if (filters.guests && Number(filters.guests) > 0) {
      conditions.push(gte(listings.maxGuests, Number(filters.guests)));
    }

    // Handle bedroom filter
    if (filters.bedrooms && Number(filters.bedrooms) > 0) {
      conditions.push(gte(listings.bedrooms, Number(filters.bedrooms)));
    }

    // Handle bathroom filter
    if (filters.bathrooms && Number(filters.bathrooms) > 0) {
      conditions.push(gte(listings.bathrooms, Number(filters.bathrooms)));
    }

    // Handle price range filters
    if (filters.minPrice && Number(filters.minPrice) > 0) {
      conditions.push(gte(listings.pricePerNight, filters.minPrice));
    }
    if (filters.maxPrice && Number(filters.maxPrice) > 0) {
      conditions.push(lte(listings.pricePerNight, filters.maxPrice));
    }

    // Handle location-based search with performance optimizations
    if (coordinates && radiusKm && radiusKm > 0) {
      // Cap maximum radius for performance and sanity
      const maxRadiusKm = Math.min(radiusKm, 100);
      
      // Bounding box prefilter for better performance (enables index usage)
      // Approximate: 1 degree latitude ≈ 111km, 1 degree longitude ≈ 111km * cos(latitude)
      const latDelta = maxRadiusKm / 111.0;
      const lngDelta = maxRadiusKm / (111.0 * Math.cos((coordinates.lat * Math.PI) / 180));
      
      const minLat = coordinates.lat - latDelta;
      const maxLat = coordinates.lat + latDelta;
      const minLng = coordinates.lng - lngDelta;
      const maxLng = coordinates.lng + lngDelta;
      
      // First filter by bounding box (fast with indexes)
      conditions.push(
        sql`CAST(${listings.latitude} AS FLOAT) BETWEEN ${minLat} AND ${maxLat}`,
        sql`CAST(${listings.longitude} AS FLOAT) BETWEEN ${minLng} AND ${maxLng}`
      );
      
      // Then apply precise Haversine distance calculation
      conditions.push(
        sql`(
          6371 * acos(
            LEAST(1.0, 
              cos(radians(${coordinates.lat})) * 
              cos(radians(CAST(${listings.latitude} AS FLOAT))) * 
              cos(radians(CAST(${listings.longitude} AS FLOAT)) - radians(${coordinates.lng})) + 
              sin(radians(${coordinates.lat})) * 
              sin(radians(CAST(${listings.latitude} AS FLOAT)))
            )
          )
        ) <= ${maxRadiusKm}`
      );
    }

    // Handle amenities filter with proper JSON containment
    if (amenities && amenities.length > 0) {
      // Check if listing amenities contain all requested amenities
      for (const amenity of amenities) {
        conditions.push(
          sql`${listings.amenities}::jsonb ? ${amenity}`
        );
      }
    }

    // Build the base query with distance calculation for sorting
    let selectClause;
    if (coordinates) {
      selectClause = db.select({
        id: listings.id,
        ownerId: listings.ownerId,
        title: listings.title,
        description: listings.description,
        type: listings.type,
        maxGuests: listings.maxGuests,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        pricePerNight: listings.pricePerNight,
        latitude: listings.latitude,
        longitude: listings.longitude,
        address: listings.address,
        city: listings.city,
        country: listings.country,
        amenities: listings.amenities,
        houseRules: listings.houseRules,
        preferredSwapNotes: listings.preferredSwapNotes,
        isActive: listings.isActive,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        distance: sql<number>`(
          6371 * acos(
            LEAST(1.0, 
              cos(radians(${coordinates.lat})) * 
              cos(radians(CAST(${listings.latitude} AS FLOAT))) * 
              cos(radians(CAST(${listings.longitude} AS FLOAT)) - radians(${coordinates.lng})) + 
              sin(radians(${coordinates.lat})) * 
              sin(radians(CAST(${listings.latitude} AS FLOAT)))
            )
          )
        )`.as('distance')
      }).from(listings);
    } else {
      selectClause = db.select().from(listings);
    }

    // Set ordering with distance support
    let orderBy;
    switch (sortBy) {
      case 'distance':
        if (coordinates) {
          orderBy = sql`distance ASC`;
        } else {
          orderBy = desc(listings.createdAt);
        }
        break;
      case 'price_low':
        orderBy = asc(listings.pricePerNight);
        break;
      case 'price_high':
        orderBy = desc(listings.pricePerNight);
        break;
      case 'newest':
        orderBy = desc(listings.createdAt);
        break;
      case 'oldest':
        orderBy = asc(listings.createdAt);
        break;
      default:
        if (coordinates) {
          orderBy = sql`distance ASC`;
        } else {
          orderBy = desc(listings.createdAt);
        }
        break;
    }

    const query = selectClause
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit || 20)
      .offset(((page || 1) - 1) * (limit || 20));

    // Get total count before applying pagination
    const countQuery = coordinates ? 
      db.select({ count: sql`count(*)` }).from(listings)
        .where(and(...conditions)) :
      db.select({ count: sql`count(*)` }).from(listings)
        .where(and(...conditions));
    
    const [{ count }] = await countQuery;
    const totalCount = Number(count);
    
    const foundListings = await query;

    // Batch fetch photos and owners for better performance
    const listingIds = foundListings.map((l: Listing) => l.id);
    const allPhotos = listingIds.length > 0 ? await db.select().from(photos)
      .where(inArray(photos.listingId, listingIds as string[]))
      .orderBy(asc(photos.position)) : [];

    const ownerIds = Array.from(new Set(foundListings.map((l: Listing) => l.ownerId)));
    const allOwners = ownerIds.length > 0 ? await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      isVerified: users.isVerified,
    }).from(users).where(inArray(users.id, ownerIds as string[])) : [];

    // Group photos by listing ID
    const photosByListing = allPhotos.reduce((acc, photo) => {
      if (!acc[photo.listingId]) acc[photo.listingId] = [];
      acc[photo.listingId].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);

    // Map owners by ID
    const ownersById = allOwners.reduce((acc, owner) => {
      acc[owner.id] = owner;
      return acc;
    }, {} as Record<string, any>);

    // Combine results
    const results: ListingWithPhotos[] = foundListings.map((listing: Listing) => ({
      ...listing,
      photos: photosByListing[listing.id] || [],
      owner: ownersById[listing.ownerId],
    }));
    
    return { listings: results, totalCount };
  }

  // Photo operations
  async addPhotosToListing(listingId: string, photoData: Omit<InsertPhoto, 'listingId'>[]): Promise<Photo[]> {
    const photosToInsert = photoData.map(photo => ({
      ...photo,
      listingId,
    }));
    
    return await db.insert(photos).values(photosToInsert).returning();
  }

  async addPhoto(photoData: Omit<InsertPhoto, 'id'>): Promise<Photo> {
    const [photo] = await db.insert(photos).values(photoData).returning();
    return photo;
  }

  async getPhotoById(id: string): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async deletePhoto(photoId: string): Promise<void> {
    await db.delete(photos).where(eq(photos.id, photoId));
  }

  // Availability operations
  async setAvailability(listingId: string, availabilityData: Omit<InsertAvailability, 'listingId'>[]): Promise<void> {
    // Delete existing availability for the date range
    const dates = availabilityData.map(a => a.date);
    if (dates.length > 0) {
      await db.delete(availability)
        .where(and(
          eq(availability.listingId, listingId),
          inArray(availability.date, dates)
        ));
    }

    // Insert new availability
    if (availabilityData.length > 0) {
      const availabilityToInsert = availabilityData.map(avail => ({
        ...avail,
        listingId,
      }));
      
      await db.insert(availability).values(availabilityToInsert);
    }
  }

  async getAvailability(listingId: string, startDate?: Date, endDate?: Date): Promise<Availability[]> {
    let query = db.select().from(availability).where(eq(availability.listingId, listingId));

    const conditions = [eq(availability.listingId, listingId)];

    if (startDate) {
      conditions.push(gte(availability.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(availability.date, endDate));
    }

    return await db.select().from(availability)
      .where(and(...conditions))
      .orderBy(asc(availability.date));
  }

  // Message operations
  async createMessage(messageData: InsertMessage & { senderId: string }): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getMessageThread(threadId: string): Promise<MessageWithSender[]> {
    const threadMessages = await db.select().from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(asc(messages.createdAt));

    const results: MessageWithSender[] = [];
    for (const message of threadMessages) {
      const [sender] = await db.select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      }).from(users).where(eq(users.id, message.senderId));

      results.push({
        ...message,
        sender,
      } as MessageWithSender);
    }

    return results;
  }

  async getUserThreads(userId: string): Promise<Array<{
    threadId: string;
    otherUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    lastMessage: Message;
    unreadCount: number;
  }>> {
    // This is a complex query - simplified for now
    const userMessages = await db.select().from(messages)
      .where(sql`${messages.senderId} = ${userId} OR ${messages.receiverId} = ${userId}`)
      .orderBy(desc(messages.createdAt));

    // Group by thread and get the latest message for each
    const threads = new Map();
    
    for (const message of userMessages) {
      if (!threads.has(message.threadId)) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const [otherUser] = await db.select({
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        }).from(users).where(eq(users.id, otherUserId));

        const unreadCount = await db.select({ count: sql`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.threadId, message.threadId),
            eq(messages.receiverId, userId),
            sql`${messages.readAt} IS NULL`
          ));

        threads.set(message.threadId, {
          threadId: message.threadId,
          otherUser,
          lastMessage: message,
          unreadCount: Number(unreadCount[0]?.count || 0),
        });
      }
    }

    return Array.from(threads.values());
  }

  async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ readAt: new Date() })
      .where(and(
        eq(messages.threadId, threadId),
        eq(messages.receiverId, userId),
        sql`${messages.readAt} IS NULL`
      ));
  }

  // Swap operations
  async createSwap(swapData: InsertSwap & { requesterId: string }): Promise<Swap> {
    const [swap] = await db.insert(swaps).values(swapData).returning();

    // Create notification for property owner about new swap request
    await this.createNotification({
      userId: swapData.requestedUserId,
      type: 'swap_request_received',
      title: 'New Swap Request',
      message: 'Someone wants to swap with your property!',
      swapId: swap.id,
      isRead: false,
    });

    return swap;
  }

  async getSwapById(id: string): Promise<SwapWithDetails | undefined> {
    const [swap] = await db.select().from(swaps)
      .where(eq(swaps.id, id));

    if (!swap) return undefined;

    // Get all related data separately
    const [requester] = await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
    }).from(users).where(eq(users.id, swap.requesterId));

    const [requestedUser] = await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
    }).from(users).where(eq(users.id, swap.requestedUserId));

    const [requesterListing] = await db.select({
      id: listings.id,
      title: listings.title,
      type: listings.type,
      city: listings.city,
      country: listings.country,
    }).from(listings).where(eq(listings.id, swap.requesterListingId));

    const [requestedListing] = await db.select({
      id: listings.id,
      title: listings.title,
      type: listings.type,
      city: listings.city,
      country: listings.country,
    }).from(listings).where(eq(listings.id, swap.requestedListingId));

    return {
      ...swap,
      requester,
      requestedUser,
      requesterListing,
      requestedListing,
    } as SwapWithDetails;
  }

  async getSwapsByUser(userId: string): Promise<SwapWithDetails[]> {
    const userSwaps = await db.select().from(swaps)
      .where(sql`${swaps.requesterId} = ${userId} OR ${swaps.requestedUserId} = ${userId}`)
      .orderBy(desc(swaps.createdAt));

    const results: SwapWithDetails[] = [];
    for (const swap of userSwaps) {
      const swapWithDetails = await this.getSwapById(swap.id);
      if (swapWithDetails) {
        results.push(swapWithDetails);
      }
    }

    return results;
  }

  async updateSwapStatus(id: string, status: "pending" | "accepted" | "declined" | "cancelled"): Promise<Swap> {
    // Get the swap details first
    const swapDetails = await this.getSwapById(id);
    if (!swapDetails) {
      throw new Error('Swap not found');
    }

    const [swap] = await db.update(swaps)
      .set({ status, updatedAt: new Date() })
      .where(eq(swaps.id, id))
      .returning();

    // Create notifications based on status change
    if (status === 'accepted') {
      await this.createNotification({
        userId: swapDetails.requesterId,
        type: 'swap_request_accepted',
        title: 'Swap Request Accepted!',
        message: `Your swap request for ${swapDetails.requestedListing.title} has been accepted!`,
        swapId: swap.id,
        isRead: false,
      });
    } else if (status === 'declined') {
      await this.createNotification({
        userId: swapDetails.requesterId,
        type: 'swap_request_declined',
        title: 'Swap Request Declined',
        message: `Your swap request for ${swapDetails.requestedListing.title} has been declined.`,
        swapId: swap.id,
        isRead: false,
      });
    } else if (status === 'cancelled') {
      // Notify both parties about cancellation
      await Promise.all([
        this.createNotification({
          userId: swapDetails.requesterId,
          type: 'swap_cancelled',
          title: 'Swap Cancelled',
          message: `The swap for ${swapDetails.requestedListing.title} has been cancelled.`,
          swapId: swap.id,
          isRead: false,
        }),
        this.createNotification({
          userId: swapDetails.requestedUserId,
          type: 'swap_cancelled',
          title: 'Swap Cancelled',
          message: `The swap for ${swapDetails.requesterListing.title} has been cancelled.`,
          swapId: swap.id,
          isRead: false,
        })
      ]);
    }

    return swap;
  }

  async checkSwapConflicts(requesterListingId: string, requestedListingId: string, startDate: Date, endDate: Date): Promise<Swap[]> {
    // Check for overlapping accepted swaps for either listing
    const conflictingSwaps = await db.select().from(swaps)
      .where(
        and(
          sql`${swaps.status} = 'accepted'`,
          sql`(
            (${swaps.requesterListingId} = ${requesterListingId} OR ${swaps.requestedListingId} = ${requesterListingId} OR
             ${swaps.requesterListingId} = ${requestedListingId} OR ${swaps.requestedListingId} = ${requestedListingId})
            AND
            (${swaps.startDate} < ${endDate} AND ${swaps.endDate} > ${startDate})
          )`
        )
      );
    
    return conflictingSwaps;
  }

  async acceptSwapWithConflictCheck(id: string): Promise<Swap> {
    // Use transaction with explicit locking to prevent MVCC race conditions
    return await db.transaction(async (tx) => {
      // Lock the target swap row first to prevent concurrent acceptance
      const [targetSwap] = await tx.select().from(swaps)
        .where(eq(swaps.id, id))
        .for('update');
      
      if (!targetSwap) {
        throw new Error('Swap not found');
      }
      
      if (targetSwap.status !== 'pending') {
        throw new Error('Swap is not pending');
      }
      
      // Lock all pending swaps for the same listings and date ranges
      // This prevents concurrent acceptances of overlapping swaps
      await tx.select().from(swaps)
        .where(
          and(
            eq(swaps.status, 'pending'),
            sql`(
              (${swaps.requesterListingId} = ${targetSwap.requesterListingId} OR ${swaps.requestedListingId} = ${targetSwap.requesterListingId} OR
               ${swaps.requesterListingId} = ${targetSwap.requestedListingId} OR ${swaps.requestedListingId} = ${targetSwap.requestedListingId})
              AND
              (${swaps.startDate} < ${targetSwap.endDate} AND ${swaps.endDate} > ${targetSwap.startDate})
            )`
          )
        )
        .for('update');
      
      // Now check for any accepted conflicts (should be none after locking)
      const conflictingSwaps = await tx.select().from(swaps)
        .where(
          and(
            eq(swaps.status, 'accepted'),
            sql`(
              (${swaps.requesterListingId} = ${targetSwap.requesterListingId} OR ${swaps.requestedListingId} = ${targetSwap.requesterListingId} OR
               ${swaps.requesterListingId} = ${targetSwap.requestedListingId} OR ${swaps.requestedListingId} = ${targetSwap.requestedListingId})
              AND
              (${swaps.startDate} < ${targetSwap.endDate} AND ${swaps.endDate} > ${targetSwap.startDate})
            )`
          )
        );
      
      if (conflictingSwaps.length > 0) {
        throw new Error('Conflicting swaps exist');
      }
      
      // Accept the swap atomically - double-check status still pending
      const updatedSwaps = await tx.update(swaps)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(and(eq(swaps.id, id), eq(swaps.status, 'pending')))
        .returning();
      
      if (updatedSwaps.length === 0) {
        throw new Error('Swap is no longer pending');
      }
      
      return updatedSwaps[0];
    });
  }

  // Admin operations
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAllListings(limit = 50, offset = 0): Promise<ListingWithPhotos[]> {
    const allListings = await db.select().from(listings)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    const results: ListingWithPhotos[] = [];
    for (const listing of allListings) {
      const listingPhotos = await db.select().from(photos)
        .where(eq(photos.listingId, listing.id))
        .orderBy(asc(photos.position));
      
      const [owner] = await db.select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      }).from(users).where(eq(users.id, listing.ownerId));

      results.push({
        ...listing,
        photos: listingPhotos,
        owner: owner,
      } as ListingWithPhotos);
    }
    
    return results;
  }

  async updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async toggleListingActive(listingId: string): Promise<void> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
    if (listing) {
      await db.update(listings)
        .set({ isActive: !listing.isActive, updatedAt: new Date() })
        .where(eq(listings.id, listingId));
    }
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification & { userId: string }): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }
}

export const storage = new PostgresStorage();