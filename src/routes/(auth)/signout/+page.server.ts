import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ locals }) => {
    await locals.supabase.auth.signOut({ scope: 'local' }); // clears sb-* cookies
    throw redirect(303, '/login');
  }
};
