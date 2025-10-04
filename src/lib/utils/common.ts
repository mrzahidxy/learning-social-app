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
