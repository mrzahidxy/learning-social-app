export type Article = {
	id: string;
	title: string;
	imageUrl: string | null;
  published: boolean;
	createdAt: Date;
	updatedAt: Date;
	authorUserId: string;
	content: string;
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

export type ArticleAuthor = {
  userId: string;
  displayName: string | null;
} | null;

export type AdminArticle = {
  id: string;
  title: string;
  published: boolean;
  authorUserId: string;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthor;
};