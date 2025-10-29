import articlesData from '$lib/data/articles.json';
import authorsData from '$lib/data/authors.json';
import type { Article, RawArticleData } from '$lib/types/article';
import type { Author, RawAuthorData } from '$lib/types/author';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  // Convert raw data to typed data
  const authors: Author[] = (authorsData as RawAuthorData[]).map((author) => ({
    userId: author.userId,
    role: (author.role as Author['role']) ?? 'AUTHOR',
    displayName: author.displayName,
    bio: author.bio,
    profileImage: author.profileImage,
    createdAt: new Date(author.createdAt),
    updatedAt: new Date(author.updatedAt),
    articleCount: author.articleCount,
    subscriberCount: author.subscriberCount
  }));

  const fallbackAuthor: Author = {
    userId: 'unknown',
    role: 'AUTHOR',
    displayName: 'Guest Author',
    bio: 'Author details coming soon.',
    profileImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    articleCount: 0,
    subscriberCount: 0
  };

  const articles: Article[] = (articlesData as RawArticleData[]).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    excerpt: item.excerpt,
    summary: item.summary,
    coverImage: item.coverImage,
    tags: item.tags,
    publishedAt: new Date(item.publishedAt),
    updatedAt: new Date(item.updatedAt),
    readingTime: item.readingTime,
    views: item.views,
    likes: item.likes,
    authorId: item.authorId,
    content: item.content,
    keyTakeaways: item.keyTakeaways,
    recommendedTools: item.recommendedTools
  }));

  // Find the article by ID
  const article = articles.find((a) => a.id === id);

  // If article not found, throw a 404 error
  if (!article) {
    throw error(404, 'Article not found');
  }

  // Find the author of the article
  const author = authors.find((a) => a.userId === article.authorId) ?? fallbackAuthor;

  // Find related articles (same author, excluding current article)
  const relatedArticles = articles
    .filter((a) => a.authorId === article.authorId && a.id !== id)
    .slice(0, 3);


    console.log("artciel", article);
      console.log("author", author);
        console.log("relatedArticles", relatedArticles);

  return {
    article,
    author,
    relatedArticles
  };
};