/**
 * Decodes the width and height of an image buffer without third-party dependencies.
 * Supports: PNG, JPEG, GIF, and WebP formats.
 */
export function getImageDimensions(buffer: Buffer): { width: number; height: number; aspect: number } | null {
  try {
    if (!buffer || buffer.length < 12) return null;

    // 1. PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(12);
      const height = buffer.readUInt32BE(16);
      return { width, height, aspect: height > 0 ? width / height : 1 };
    }

    // 2. GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height, aspect: height > 0 ? width / height : 1 };
    }

    // 3. JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) return null;
        const marker = buffer[offset + 1];
        if (marker === 0xd9 || marker === 0xda) break; // EOI or SOS
        
        const length = buffer.readUInt16BE(offset + 2);
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, aspect: height > 0 ? width / height : 1 };
        }
        offset += 2 + length;
      }
    }

    // 4. WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // 'RIFF'
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50  // 'WEBP'
    ) {
      const chunkHeader = buffer.toString('ascii', 12, 16);
      if (chunkHeader === 'VP8 ') {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height, aspect: height > 0 ? width / height : 1 };
      } else if (chunkHeader === 'VP8L') {
        const val = buffer.readUInt32LE(21);
        const width = (val & 0x3fff) + 1;
        const height = ((val >> 14) & 0x3fff) + 1;
        return { width, height, aspect: height > 0 ? width / height : 1 };
      } else if (chunkHeader === 'VP8X') {
        const width = (buffer.readUInt32LE(24) & 0xffffff) + 1;
        const height = (buffer.readUInt32LE(27) & 0xffffff) + 1;
        return { width, height, aspect: height > 0 ? width / height : 1 };
      }
    }
  } catch (err) {
    // Suppress and fallback
  }
  return null;
}
