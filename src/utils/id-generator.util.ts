/**
 * Utility function to generate booking numbers
 * Format: BK-YYYYMMDD-XXXXX (where X is a random alphanumeric character)
 */
export function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate 5 random alphanumeric characters
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars (I,O,0,1)
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `BK-${dateStr}-${random}`;
}

/**
 * Generate a unique ID for various entities
 * @param prefix - Optional prefix for the ID (e.g., 'USR', 'SRV')
 */
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return prefix
    ? `${prefix}-${timestamp}${randomStr}`
    : `${timestamp}${randomStr}`;
}
