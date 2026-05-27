export function normalizePhone(phone: string): string {
    if (!phone) return "";
    // Remove non-digits
    const digits = phone.replace(/\D/g, "");
    // Return last 9 digits (e.g., 772123456)
    // This handles +2567..., 07..., 2567..., etc.
    return digits.slice(-9);
}
