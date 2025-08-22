/**
 * Validates email format using HTML5 validation and custom regex
 * @param value - The input string to validate
 * @param regex - Custom regex pattern for validation
 * @param fieldName - Name of the field being validated
 * @returns Object containing validation result and error message
 */
export function validateField(
	value: string,
	regex: RegExp,
	fieldName?: string
): { isValid: boolean; error?: string } {
	if (!value.trim()) {
		return { isValid: false, error: `${fieldName} cannot be empty` };
	}

	if (!regex.test(value)) {
		return { isValid: false, error: 'Please enter a valid email address' };
	}

	return { isValid: true };
}
