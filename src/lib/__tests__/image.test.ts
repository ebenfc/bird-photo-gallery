import { processUploadedImage } from '../image';
import sharp from 'sharp';
import exifr from 'exifr';
import { uploadToStorage } from '../supabase';

// Mock dependencies
jest.mock('sharp');
jest.mock('exifr');
jest.mock('../supabase');

describe('Image Processing', () => {
  // Mock buffer for testing
  const mockBuffer = Buffer.from('fake-image-data');

  // Mock sharp chain
  const mockRotate = jest.fn().mockReturnThis();
  const mockJpeg = jest.fn().mockReturnThis();
  const mockResize = jest.fn().mockReturnThis();
  const mockToBuffer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup sharp mock with proper chain
    (sharp as unknown as jest.Mock).mockReturnValue({
      rotate: mockRotate,
      jpeg: mockJpeg,
      resize: mockResize,
      toBuffer: mockToBuffer,
    });

    // Default: Sharp processing succeeds
    mockToBuffer.mockResolvedValue(Buffer.from('processed-image'));

    // Default: No EXIF data
    (exifr.parse as jest.Mock).mockResolvedValue(null);

    // Default: Upload succeeds
    (uploadToStorage as jest.Mock).mockResolvedValue(undefined);
  });

  describe('processUploadedImage', () => {
    it('should generate unique filenames with .jpg extension', async () => {
      const result = await processUploadedImage(mockBuffer);

      expect(result.filename).toMatch(/^[a-f0-9-]+\.jpg$/);
      expect(result.thumbnailFilename).toMatch(/^[a-f0-9-]+_thumb\.jpg$/);

      // Verify base filename matches
      const baseId = result.filename.replace('.jpg', '');
      expect(result.thumbnailFilename).toBe(`${baseId}_thumb.jpg`);
    });

    it('should extract EXIF date when available', async () => {
      const testDate = new Date('2024-06-15T14:30:00Z');
      (exifr.parse as jest.Mock).mockResolvedValue({
        DateTimeOriginal: testDate,
      });

      const result = await processUploadedImage(mockBuffer);

      expect(result.originalDateTaken).toEqual(testDate);
      expect(exifr.parse).toHaveBeenCalledWith(mockBuffer);
    });

    it('should return null date when EXIF data has no DateTimeOriginal', async () => {
      (exifr.parse as jest.Mock).mockResolvedValue({
        Make: 'Canon',
        Model: 'EOS R5',
        // No DateTimeOriginal
      });

      const result = await processUploadedImage(mockBuffer);

      expect(result.originalDateTaken).toBeNull();
    });

    it('should handle EXIF extraction failure gracefully', async () => {
      (exifr.parse as jest.Mock).mockRejectedValue(new Error('EXIF parse failed'));

      const result = await processUploadedImage(mockBuffer);

      expect(result.originalDateTaken).toBeNull();
      // Should not throw, processing continues
      expect(result.filename).toBeTruthy();
    });

    it('should process original image with correct settings', async () => {
      await processUploadedImage(mockBuffer);

      expect(sharp).toHaveBeenCalledWith(mockBuffer, { failOn: 'none' });
      expect(mockRotate).toHaveBeenCalled();
      expect(mockJpeg).toHaveBeenCalledWith({ quality: 90 });
      expect(mockToBuffer).toHaveBeenCalled();
    });

    it('should generate thumbnail with correct dimensions and quality', async () => {
      await processUploadedImage(mockBuffer);

      // Sharp is called twice: once for original, once for thumbnail
      expect(sharp).toHaveBeenCalledTimes(2);

      // Verify thumbnail resize settings
      expect(mockResize).toHaveBeenCalledWith(400, null, { withoutEnlargement: true });
      expect(mockJpeg).toHaveBeenCalledWith({ quality: 80 });
    });

    it('should upload both original and thumbnail to correct paths', async () => {
      const result = await processUploadedImage(mockBuffer);

      expect(uploadToStorage).toHaveBeenCalledTimes(2);
      expect(uploadToStorage).toHaveBeenCalledWith(
        expect.any(Buffer),
        `originals/${result.filename}`,
        'image/jpeg'
      );
      expect(uploadToStorage).toHaveBeenCalledWith(
        expect.any(Buffer),
        `thumbnails/${result.thumbnailFilename}`,
        'image/jpeg'
      );
    });

    it('should propagate upload errors', async () => {
      (uploadToStorage as jest.Mock).mockRejectedValueOnce(
        new Error('Upload failed')
      );

      await expect(processUploadedImage(mockBuffer)).rejects.toThrow('Upload failed');
    });

    it('should fall back to original buffer when sharp processing fails', async () => {
      mockToBuffer.mockRejectedValueOnce(new Error('Sharp processing failed'));

      // processUploadedImage has a graceful fallback — when sharp fails, it stores
      // the original buffer instead of throwing. Magic byte validation happens at
      // the upload route level (src/app/api/upload/browser/route.ts), not here.
      const result = await processUploadedImage(mockBuffer);
      expect(result.filename).toBeTruthy();
      expect(uploadToStorage).toHaveBeenCalledTimes(2);
    });

    it('should generate different filenames for multiple calls', async () => {
      const result1 = await processUploadedImage(mockBuffer);
      const result2 = await processUploadedImage(mockBuffer);

      expect(result1.filename).not.toBe(result2.filename);
      expect(result1.thumbnailFilename).not.toBe(result2.thumbnailFilename);
    });

    it('should handle Date objects in EXIF data', async () => {
      // EXIF library typically returns Date objects for DateTimeOriginal
      const testDate = new Date('2024-06-15T14:30:00Z');
      (exifr.parse as jest.Mock).mockResolvedValue({
        DateTimeOriginal: testDate,
      });

      const result = await processUploadedImage(mockBuffer);

      expect(result.originalDateTaken).toBeInstanceOf(Date);
      expect(result.originalDateTaken?.getFullYear()).toBe(2024);
      expect(result.originalDateTaken).toEqual(testDate);
    });
  });

  describe('File Validation (Security)', () => {
    it('should fall back gracefully for non-image buffers (magic bytes validated at route level)', async () => {
      // processUploadedImage does NOT validate magic bytes — that responsibility
      // belongs to the upload route (src/app/api/upload/browser/route.ts), which
      // calls validateImageMagicBytesFromBuffer() BEFORE calling this function.
      // When sharp fails on a non-image buffer, this function falls back to
      // storing the original buffer as-is rather than throwing.
      const maliciousBuffer = Buffer.from('not-an-image');
      mockToBuffer.mockRejectedValueOnce(new Error('Input buffer contains unsupported image format'));

      const result = await processUploadedImage(maliciousBuffer);
      expect(result.filename).toBeTruthy();
    });
  });
});
