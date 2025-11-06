import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Example Supabase user IDs (replace with real UUIDs from auth.users)
  const readerId = 'cc293aea-a555-4d8a-a73c-4b48149a4169'
  const authorId = 'ddbda57a-2cff-4a46-bcb2-b41867dfd1a7'

  // Profile seeds
  await prisma.profile.createMany({
    data: [
      {
        userId: readerId,
        role: 'READER',
        displayName: 'Demo Reader',
        bio: 'Reads articles daily.',
      },
      {
        userId: authorId,
        role: 'AUTHOR',
        displayName: 'Jane Author',
        bio: 'Writes about Svelte + Supabase.',
      },
    ],
    skipDuplicates: true,
  })

  // Article
  const article = await prisma.article.create({
    data: {
      authorUserId: authorId,
      title: 'Hello World',
      content: 'This is the first article.',
      published: true,
    },
  })

  // Subscription
  await prisma.subscription.create({
    data: {
      userId: readerId,
      authorUserId: authorId,
    },
  })

  // Notification
  await prisma.notification.create({
    data: {
      userId: readerId,
      articleId: article.id,
      message: 'New article published by Jane Author',
    },
  })
}

main()
  .then(() => console.log('Seed complete'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
