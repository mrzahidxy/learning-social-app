import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Session, User } from '@supabase/supabase-js';
import type { Role } from '@prisma/client';
import prisma from '$lib/server/prisma';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient | null;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			profile: { displayName: string | null; role: Role | null; profileImage: string | null } | null;
		}
	}
}

const withSupabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	}) as SupabaseClient; // cast since createServerClient returns a compatible runtime client

	event.locals.safeGetSession = async () => {
		if (!event.locals.supabase) return { session: null, user: null };

		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();

		if (userError || !user) return { session: null, user: null };

		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();

		if (sessionError || !session) return { session: null, user };

		return { session: { ...session, user }, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const attachAuth: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;
	event.locals.profile = null;

	if (user?.id) {
		try {
			const profile = await prisma.profile.findUnique({
				where: { userId: user.id },
				select: { displayName: true, role: true, profileImage: true }
			});
			if (profile) {
				event.locals.profile = {
					displayName: profile.displayName ?? null,
					role: profile.role ?? null,
					profileImage: profile.profileImage ?? null
				};
			}
		} catch (err) {
			console.error('Failed to load profile', err);
		}
	}

	return resolve(event);
};

export const handle = sequence(withSupabase, attachAuth);
