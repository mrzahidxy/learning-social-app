import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const getSupabaseAdmin = () => {
	if (!client) {
		client = createServerClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY!, {
			cookies: {
				getAll: () => [],
				setAll: () => {}
			}
		});
	}
	return client;
};
