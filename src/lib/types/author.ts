// Define the Author type based on the Prisma schema Profile model
export type Author = {
  userId: string;
  role: 'READER' | 'AUTHOR' | 'ADMIN';
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  articleCount: number;
  subscriberCount: number;
};

// Define the type for the raw JSON data
export type RawAuthorData = {
  userId: string;
  role: string;
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  subscriberCount: number;
};