import { redirect, type RequestHandler } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const code = url.searchParams.get('code');
	const type = (url.searchParams.get('type') ?? 'email') as EmailOtpType;
	const requestedNext = url.searchParams.get('next');
	const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
		? requestedNext
		: '/dashboard';

	let authError = null;

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		authError = error;
	} else if (token_hash) {
		const { error } = await supabase.auth.verifyOtp({ token_hash, type });
		authError = error;
	} else {
		redirect(303, '/login?error=invalid');
	}

	if (authError) {
		const reason = authError.code === 'otp_expired' ? 'expired' : 'invalid';
		redirect(303, `/login?error=${reason}`);
	}

	redirect(303, next);
};
