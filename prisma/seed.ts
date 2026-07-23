import { NotificationType, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const users = {
	arif: '11111111-1111-4111-8111-111111111111',
	nusrat: '11111111-1111-4111-8111-111111111112',
	farhana: '11111111-1111-4111-8111-111111111113',
	tanjila: '22222222-2222-4222-8222-222222222221',
	hasan: '22222222-2222-4222-8222-222222222222',
	admin: '33333333-3333-4333-8333-333333333333'
};

const articles = {
	svelteSupabase: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
	emptyStates: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
	markdownGuide: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
	databaseDraft: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
	reviewDraft: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
	guidelines: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
};

const content = {
	svelteSupabase: `Building a learning app becomes easier when the first version focuses on one clear journey. In Pathshala, that journey starts with a reader opening the site, signing in with a magic link, completing a profile, and following an author whose lessons match their interests. SvelteKit is a good fit for this flow because pages, server actions, and API routes can live close to the feature they support.

Supabase handles authentication without forcing the app to manage passwords. The public URL and anonymous key can be used in the browser, while privileged service keys stay on the server. That separation keeps the login experience simple and protects sensitive operations such as storage management or admin-only updates.

Prisma gives the app a readable data layer. Profiles, articles, subscriptions, and notifications are small models, but together they create a useful social learning experience. A reader can follow an author, an author can publish lessons, and the home feed can show content based on those relationships. This is enough structure to test real product behavior without building a complex system too early.

The most important lesson is to keep the first version understandable. Use meaningful seed data, predictable user roles, and realistic article content. Then test the normal path, the empty state, and the permission rules. Once those basics feel reliable, the platform can grow with comments, bookmarks, richer notifications, and better author analytics.`,
	emptyStates: `Empty states are part of the product experience, not a place to hide missing data. A learner who opens a page with no articles, no followed authors, or no notifications should still understand what happened and what they can do next. A short message such as "No articles found" is technically correct, but it does not teach the user anything useful.

A better empty state has three parts. First, it names the situation clearly. Second, it explains why the page may be empty. Third, it gives the user one practical action. For example, a flows tab can say that articles will appear after the reader follows authors. An author page can explain that the author has not published lessons yet. A profile page can invite the user to complete their name, bio, and role request.

Design also matters. Placeholder images, calm spacing, and friendly language make the interface feel intentional. The goal is not to decorate an empty page, but to reduce confusion. Learners should feel guided rather than blocked.

Seed data helps teams test these moments. One reader should have subscriptions, another should have none, and one author should have no public articles. With those records in place, developers can check whether the interface handles real edge cases. Strong empty states make a small app feel complete, trustworthy, and ready for daily use.`,
	markdownGuide: `# Markdown Checklist for New Authors

Markdown helps authors write lessons that are easy to scan, edit, and publish. The format is simple, but good structure still matters. Before publishing a lesson on Pathshala, start by asking what the reader should be able to do after reading. A focused promise makes the rest of the article easier to organize.

Use one main heading, then divide the lesson into short sections. Each section should answer one question or explain one step. Long paragraphs are difficult to read on small screens, so keep them clear and direct. If you include code, introduce the reason first, show the snippet, and then explain what changed. Code without context is hard for beginners to trust.

Lists are useful for checklists, setup steps, and review points. Links should support the article rather than distract from it. If you reference documentation, tell the reader why the link matters. Images should add meaning, not simply fill space.

End every article with a next step. It can be a small exercise, a file to edit, or a question to explore. Learners remember more when they apply the idea immediately. A strong markdown article is not only formatted well; it respects the reader's time, explains the path clearly, and leaves them confident enough to continue.`,
	databaseDraft: `Safe database changes begin before anyone runs a migration. The first step is to describe the product change in plain language. If the team understands why a new field, table, or relationship is needed, the schema design becomes easier to review. For Pathshala, examples include adding article drafts, storing profile images, or tracking subscriptions between readers and authors.

After the goal is clear, update the Prisma schema carefully. Names should match the language used in the app. A field called published is easier to understand than a vague status flag when the only choices are public or draft. Indexes should support real queries, such as finding articles by author or loading unread notifications for a user.

Seed data is part of the safety check. It should include normal records and edge cases: readers with and without follows, authors with published and draft articles, and an admin who can moderate content. Realistic data makes UI bugs easier to notice.

Before deployment, test the migration locally, regenerate the Prisma client, and run the app against the updated database. If production data is involved, plan a rollback and avoid destructive changes unless they are truly required. A careful database workflow protects both the product and the people learning from it.`,
	reviewDraft: `A reliable article review workflow keeps a learning platform useful and respectful. Moderation should not feel like a mystery to authors. The process should explain what is checked, why it matters, and how an article can move from draft to published.

Start with the title. It should tell readers what they will learn, not simply name a technology. Next, read the opening paragraph. A good introduction states the problem and sets expectations. If the article promises a complete guide, the body should include enough detail for a learner to follow without guessing.

Links and images need review too. Links should point to safe, relevant resources. Cover images should match the topic and should not distract from the learning goal. If an article includes code, the reviewer should scan for obvious errors, missing steps, or private credentials accidentally pasted into examples.

The final check is tone. Pathshala content should be beginner-friendly, accurate, and respectful. Moderators can request changes instead of rejecting work without explanation. A clear review workflow helps authors improve and gives readers more trustworthy lessons. When the process is consistent, publishing becomes a shared quality practice rather than a gatekeeping exercise.`,
	guidelines: `Pathshala exists to help learners build confidence through practical articles. Community guidelines keep that goal clear for authors, readers, and moderators. Every article should be accurate, respectful, and focused on helping someone understand or complete a task.

Authors should write from experience and avoid copying private or copyrighted material. If an article uses an external idea, tool, or documentation page, it should mention the source. Examples should be small enough for readers to try in one sitting. A tutorial that requires too much hidden setup can discourage beginners, even when the topic is valuable.

Respectful language is required. Learning communities work best when people feel safe asking basic questions. Avoid insults, stereotypes, and dismissive comments about skill level. A helpful article explains trade-offs without shaming different choices.

Moderators may update roles, review drafts, and unpublish content that breaks the guidelines. This is not meant to limit creativity. It protects the quality of the platform and keeps the learning environment useful. Readers should be able to trust that published lessons have a clear purpose, practical value, and a respectful tone. When everyone follows these standards, Pathshala becomes easier to learn from and easier to contribute to.`
};

async function main() {
	await prisma.notification.deleteMany({ where: { articleId: { in: Object.values(articles) } } });
	await prisma.subscription.deleteMany({ where: { userId: { in: Object.values(users) } } });
	await prisma.article.deleteMany({ where: { id: { in: Object.values(articles) } } });
	await prisma.profile.deleteMany({ where: { userId: { in: Object.values(users) } } });

	await prisma.profile.createMany({
		data: [
			{
				userId: users.arif,
				role: Role.READER,
				displayName: 'Arif Rahman',
				bio: 'Frontend learner following practical SvelteKit and Supabase lessons.',
				profileImage: '/images/placeholder-avatar.svg'
			},
			{
				userId: users.nusrat,
				role: Role.READER,
				displayName: 'Nusrat Jahan',
				bio: 'New reader exploring Pathshala before following any authors.'
			},
			{
				userId: users.farhana,
				role: Role.READER,
				displayName: 'Farhana Islam',
				bio: 'Active reader learning backend workflows and project planning.'
			},
			{
				userId: users.tanjila,
				role: Role.AUTHOR,
				displayName: 'Tanjila Akter',
				bio: 'Writes clear lessons about SvelteKit, Supabase Auth, Prisma, and user experience.',
				profileImage:
					'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face'
			},
			{
				userId: users.hasan,
				role: Role.AUTHOR,
				displayName: 'Hasan Mahmud',
				bio: 'Prepares backend, database, and moderation guides for project-based learners.'
			},
			{
				userId: users.admin,
				role: Role.ADMIN,
				displayName: 'Sabbir Ahmed',
				bio: 'Platform moderator managing roles, article reviews, and publishing controls.',
				profileImage: '/images/placeholder-avatar.svg'
			}
		]
	});

	await prisma.article.createMany({
		data: [
			{
				id: articles.svelteSupabase,
				authorUserId: users.tanjila,
				title: 'Build a Learning App with SvelteKit and Supabase',
				content: content.svelteSupabase,
				imageUrl:
					'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
				published: true
			},
			{
				id: articles.emptyStates,
				authorUserId: users.tanjila,
				title: 'Design Better Empty States for Learners',
				content: content.emptyStates,
				published: true
			},
			{
				id: articles.markdownGuide,
				authorUserId: users.tanjila,
				title: 'Markdown Checklist for New Authors',
				content: content.markdownGuide,
				imageUrl:
					'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop',
				published: true
			},
			{
				id: articles.databaseDraft,
				authorUserId: users.hasan,
				title: 'Draft: Plan Safe Database Changes',
				content: content.databaseDraft,
				imageUrl:
					'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=675&fit=crop',
				published: false
			},
			{
				id: articles.reviewDraft,
				authorUserId: users.hasan,
				title: 'Draft: Article Review Workflow',
				content: content.reviewDraft,
				published: false
			},
			{
				id: articles.guidelines,
				authorUserId: users.admin,
				title: 'Community Guidelines for Helpful Learning Articles',
				content: content.guidelines,
				published: true
			}
		]
	});

	await prisma.subscription.createMany({
		data: [
			{ userId: users.arif, authorUserId: users.tanjila },
			{ userId: users.farhana, authorUserId: users.hasan },
			{ userId: users.admin, authorUserId: users.tanjila }
		]
	});

	await prisma.notification.createMany({
		data: [
			{
				userId: users.arif,
				articleId: articles.markdownGuide,
				type: NotificationType.ARTICLE_PUBLISHED,
				message: 'Tanjila Akter published "Markdown Checklist for New Authors".',
				read: false
			},
			{
				userId: users.arif,
				articleId: articles.svelteSupabase,
				type: NotificationType.ARTICLE_PUBLISHED,
				message: 'Tanjila Akter published "Build a Learning App with SvelteKit and Supabase".',
				read: true
			},
			{
				userId: users.admin,
				articleId: articles.guidelines,
				type: NotificationType.ARTICLE_PUBLISHED,
				message: 'Sabbir Ahmed published "Community Guidelines for Helpful Learning Articles".',
				read: false
			}
		]
	});

	console.log('Seed complete: 3 reader users, 2 authors, 1 admin, and 6 articles.');
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
