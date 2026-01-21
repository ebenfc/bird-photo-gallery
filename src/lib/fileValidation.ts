const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validate uploaded image file
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  const mimeType = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    // Some browsers might not report correct MIME for HEIC
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['heic', 'heif'].includes(extension)) {
      return {
        valid: false,
        error: 'Invalid file type. Allowed types: JPEG, PNG, WEBP, HEIC'
      };
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size: 20MB'
    };
  }

  // Check file size is not zero
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }

  // Validate file extension matches MIME type or is HEIC
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension'
    };
  }

  // Check MIME type matches extension (except for HEIC which browsers handle inconsistently)
  const mimeExtMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/heic': ['heic'],
    'image/heif': ['heif']
  };

  const expectedExtensions = mimeExtMap[mimeType] || [];
  // Allow HEIC/HEIF files that browsers might misreport
  const isHeicFile = ['heic', 'heif'].includes(extension);
  if (!expectedExtensions.includes(extension) && !isHeicFile) {
    return {
      valid: false,
      error: 'File extension does not match file type'
    };
  }

  // Generate safe filename
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    valid: true,
    sanitizedFilename
  };
}

/**
 * Generate safe, unique filename
 */
export function sanitizeFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';

  // Format: timestamp-random.ext
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Validate file is actually an image (check magic bytes)
 */
export async function validateImageMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer).subarray(0, 12);

  // Check magic bytes for common image formats
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }

  // WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    // Check for WEBP signature at offset 8
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return true;
    }
  }

  // HEIC/HEIF: ftyp box at offset 4
  if (buffer.byteLength > 12) {
    const ftypBytes = new Uint8Array(buffer).subarray(4, 8);
    const ftyp = String.fromCharCode(...ftypBytes);
    if (ftyp === 'ftyp') {
      // Check for HEIC/HEIF brand at offset 8
      const brandBytes = new Uint8Array(buffer).subarray(8, 12);
      const brand = String.fromCharCode(...brandBytes);
      // Common HEIC/HEIF brands: heic, heix, hevc, hevx, mif1, msf1
      if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate file is actually an image from buffer (check magic bytes)
 */
export function validateImageMagicBytesFromBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }

  const bytes = buffer.subarray(0, 12);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }

  // WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return true;
    }
  }

  // HEIC/HEIF: ftyp box at offset 4
  if (buffer.length > 12) {
    const ftypBytes = buffer.subarray(4, 8);
    const ftyp = ftypBytes.toString('ascii');
    if (ftyp === 'ftyp') {
      const brandBytes = buffer.subarray(8, 12);
      const brand = brandBytes.toString('ascii');
      if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) {
        return true;
      }
    }
  }

  return false;
}
