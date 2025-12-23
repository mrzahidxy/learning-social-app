import { redirect, type RequestHandler } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = (url.searchParams.get('type') ?? 'email') as EmailOtpType;
	const next = url.searchParams.get('next') ?? '/user';

	if (!token_hash) redirect(303, '/auth/error');

	const { error } = await supabase.auth.verifyOtp({ token_hash, type });

	if (error) {
		const reason = error.code ?? 'unknown';

		const safeReason = ['otp_expired', 'invalid_grant', 'token_not_found'].includes(reason)
			? reason
			: 'unknown';

		redirect(303, `/auth/error?reason=${safeReason}`);
	}

	redirect(303, next);
};
