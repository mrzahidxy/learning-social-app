export type Article = {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  summary: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  readingTime: string;
  views: number;
  likes: number;
  authorId: string;
  content: string[];
  keyTakeaways: string[];
  recommendedTools: string[];
};

export type RawArticleData = {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  summary: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  views: number;
  likes: number;
  authorId: string;
  content: string[];
  keyTakeaways: string[];
  recommendedTools: string[];
};