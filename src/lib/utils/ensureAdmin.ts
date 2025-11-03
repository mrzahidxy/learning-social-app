import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const ensureAdmin = async (userId: string | undefined | null) => {
    if (!userId) {
        throw error(401, 'Unauthorized');
    }

    const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { role: true }
    });

    if (profile?.role !== 'ADMIN') {
        throw error(403, 'Forbidden');
    }
};