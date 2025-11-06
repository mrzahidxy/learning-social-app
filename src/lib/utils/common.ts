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

//  Helper function to handle image error
export const handleImageError = (event: Event, fallbackImage: string) => {
	const target = event.currentTarget as HTMLImageElement | null;
	if (!target || target.dataset.fallbackApplied === 'true') return;
	target.dataset.fallbackApplied = 'true';
	target.src = fallbackImage;
};

export const formatLongDate = (dateValue: string | Date | null | undefined): string => {
	if (!dateValue) return '';

	const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

	if (isNaN(date.getTime())) return '';

	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
};
