// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Role } from '@prisma/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			profile: {
				displayName: string | null;
				role: Role | null;
				profileImage: string | null;
			} | null;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			cookies?: Array<{ name: string; value: string }>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
