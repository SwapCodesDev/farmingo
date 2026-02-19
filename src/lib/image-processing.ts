'use client';

/**
 * Converts an image file to a WebP Base64 data URI using the browser's canvas.
 * @param file The image file to convert (e.g., from an <input type="file">).
 * @param quality A number between 0 and 1 indicating the image quality.
 * @returns A promise that resolves with the WebP data URI string.
 */
export function imageToWebPBase64(file: File, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("FileReader did not return a result."));
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return reject(new Error('Could not get 2D context from canvas.'));
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch (error) {
          reject(new Error(`Canvas toDataURL failed: ${error}`));
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Image loading failed: ${error}`));
      };
      
      img.src = event.target.result as string;
    };

    reader.onerror = (error) => {
      reject(new Error(`FileReader failed: ${error}`));
    };

    reader.readAsDataURL(file);
  });
}
