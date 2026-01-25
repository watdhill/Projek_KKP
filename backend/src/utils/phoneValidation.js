/**
 * Validate Indonesian phone number
 * Format: 08xxxxxxxxx (10-13 digits)
 */
function validatePhoneNumber(phone) {
    if (!phone) return null; // Allow empty

    const cleaned = String(phone).replace(/\s/g, '');

    // Must be all digits
    if (!/^\d+$/.test(cleaned)) {
        return 'Nomor telepon harus berupa angka';
    }

    // Must start with 08
    if (!cleaned.startsWith('08')) {
        return 'Nomor telepon harus dimulai dengan 08 (format Indonesia)';
    }

    // Length check
    if (cleaned.length < 10 || cleaned.length > 13) {
        return 'Nomor telepon harus 10-13 digit';
    }

    return null; // Valid
}

module.exports = { validatePhoneNumber };
