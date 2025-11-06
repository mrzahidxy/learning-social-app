import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const author = await prisma.profile.findUnique({
    where: {
      userId: id
    }
  });

  if (!author) {
    throw error(404, 'Author not found');
  }

  const authorArticles = await prisma.article.findMany({
    where: {
      authorUserId: id,
      published: true
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
      published: true,
      authorUserId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return {
    author,
    articles: authorArticles
  };
};
