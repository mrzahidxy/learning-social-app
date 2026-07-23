import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { requireRole, requireUser } from '$lib/server/auth/authorization';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { fileName, contentType, bucket } = await request.json();
		const userId = requireUser(locals.user?.id ?? null);
		await requireRole(userId, ['READER', 'AUTHOR', 'ADMIN']);

		const supabaseAdmin = getSupabaseAdmin();

		// Generate a unique file name to prevent conflicts
		const fileExtension = fileName.split('.').pop();
		const uniqueFileName = `${uuidv4()}.${fileExtension}`;

		// Create a signed upload URL
		const { data, error: supabaseError } = await supabaseAdmin.storage
			.from(bucket || 'uploads')
			.createSignedUploadUrl(uniqueFileName);

		if (supabaseError) {
			throw error(500, `Supabase error: ${supabaseError.message}`);
		}

		return json({
			signedUrl: data.signedUrl,
			filePath: uniqueFileName,
			bucket: bucket || 'uploads'
		});
	} catch (err) {
		console.error('Supabase upload signature generation failed:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to generate upload signature');
	}
};
