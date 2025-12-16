const QRCode = require('qrcode');

/**
 * Generate unique QR code string
 * Format: TKT-{timestamp}-{random}
 */
function generateBarcodeString() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TKT${timestamp}${random}`;
}

/**
 * Generate QR code image
 * Returns base64 encoded PNG image
 */
async function generateBarcodeImage(barcodeText) {
    try {
        // Generate QR code as data URL (base64 PNG)
        const qrCodeDataURL = await QRCode.toDataURL(barcodeText, {
            errorCorrectionLevel: 'H',  // High error correction
            type: 'image/png',           // PNG format
            quality: 0.95,               // High quality
            margin: 1,                   // Margin around QR code
            width: 300,                  // QR code size in pixels
            color: {
                dark: '#000000',         // QR code color
                light: '#FFFFFF'         // Background color
            }
        });

        return qrCodeDataURL;
    } catch (err) {
        console.error('QR code generation error:', err);
        throw err;
    }
}

module.exports = {
    generateBarcodeString,
    generateBarcodeImage
};
