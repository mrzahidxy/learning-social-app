// Helper functions to get initials badge
export const getInitials = (name: string | null) => {
	if (!name) return 'A';
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || 'A'
	);
};

//  Helper function to convert date to timestamp
const toTimestamp = (value: unknown) => {
	if (value instanceof Date) {
		return value.getTime();
	}

	if (typeof value === 'string') {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
	}

	return 0;
};
//  Helper function to handle image error
export const handleImageError = (event: Event, fallbackImage: string) => {
	const target = event.currentTarget as HTMLImageElement | null;
	if (!target || target.dataset.fallbackApplied === 'true') return;
	target.dataset.fallbackApplied = 'true';
	target.src = fallbackImage;
};
