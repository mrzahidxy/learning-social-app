import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { fileName, contentType, bucket } = await request.json();

		// Check if user is authenticated
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

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
		throw error(500, 'Failed to generate upload signature');
	}
};
