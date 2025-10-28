import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import {  type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const withSupabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {

          cookies.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, { ...options, path: '/' }) // path required
          );
        }
      }
    }
  );

  // Validates JWT (via getUser) before returning session
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) return { session: null, user: null };

    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error) return { session: null, user: null };
    return { session, user };
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

  // (optional) simple guards:
  // if (!session && event.url.pathname.startsWith('/private')) redirect(303, '/login');

  return resolve(event);
};


export const handle = sequence(withSupabase, attachAuth);