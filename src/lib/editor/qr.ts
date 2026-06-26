import QRCode from "qrcode";

export async function generateQR(text: string, size: number = 200): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: { dark: "#1C1917", light: "#FFFFFF" },
    });
    return `<img src="${dataUrl}" width="${size}" height="${size}" alt="QR Code" style="display:block" />`;
  } catch {
    return `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;font-size:12px">QR Error</div>`;
  }
}
