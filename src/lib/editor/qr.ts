// Simple QR code generator using canvas
export function generateQR(text: string, size: number = 200): string {
  // In a production app, use a library like qrcode.js
  // This is a placeholder that renders a styled div with the URL
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white" rx="${size * 0.05}"/>
    <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" fill="#1C1917" rx="${size * 0.02}"/>
    <rect x="${size * 0.22}" y="${size * 0.22}" width="${size * 0.56}" height="${size * 0.56}" fill="white" rx="${size * 0.01}"/>
    <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.12}" height="${size * 0.12}" fill="#1C1917"/>
    <rect x="${size * 0.50}" y="${size * 0.50}" width="${size * 0.12}" height="${size * 0.12}" fill="#1C1917"/>
    <rect x="${size * 0.62}" y="${size * 0.30}" width="${size * 0.08}" height="${size * 0.08}" fill="#1C1917"/>
    <rect x="${size * 0.30}" y="${size * 0.62}" width="${size * 0.08}" height="${size * 0.08}" fill="#1C1917"/>
    <text x="${size * 0.1}" y="${size * 0.92}" font-size="${size * 0.04}" fill="#1C1917" font-family="monospace">${text.length > 30 ? text.substring(0, 27) + "..." : text}</text>
  </svg>`;
}
