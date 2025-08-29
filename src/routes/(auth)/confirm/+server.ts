import { redirect, type RequestHandler } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash');
  const type = (url.searchParams.get('type') ?? 'email') as EmailOtpType;
  const next = url.searchParams.get('next') ?? '/'; 

  if (!token_hash) redirect(303, '/auth/error');

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (error) {
    console.error('verifyOtp error:', error.message);
    redirect(303, '/auth/error');
  }

  redirect(303, next);
};

