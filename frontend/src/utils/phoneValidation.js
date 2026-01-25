/**
 * Validate Indonesian phone number format
 * Must start with 08 and contain only digits
 * Length: 10-13 digits
 */
export function validatePhoneNumber(phone) {
    if (!phone) return true; // Allow empty (optional field)

    // Remove any whitespace
    const cleaned = phone.replace(/\s/g, '');

    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) {
        return 'Nomor telepon harus berupa angka';
    }

    // Check if starts with 08
    if (!cleaned.startsWith('08')) {
        return 'Nomor telepon harus dimulai dengan 08 (format Indonesia)';
    }

    // Check length (08 + 8-11 digits = 10-13 total)
    if (cleaned.length < 10 || cleaned.length > 13) {
        return 'Nomor telepon harus 10-13 digit';
    }

    return true; // Valid
}

/**
 * Format phone number input (remove non-digits, limit length)
 */
export function formatPhoneInput(value) {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 13 digits
    return digits.slice(0, 13);
}
