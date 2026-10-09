'use client';

/**
 * Render the first page of a PDF to an image in the browser (pdf.js), for a certificate preview.
 * pdf.js is loaded only when this runs, so it adds nothing to normal page loads.
 */
export async function pdfFirstPageToImage(file: Blob, targetWidth = 1200): Promise<Blob | null> {
  try {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await task.promise;
    try {
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(4, targetWidth / base.width) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const toBlob = (type: string, quality?: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
      return (await toBlob('image/webp', 0.85)) || (await toBlob('image/png'));
    } finally {
      await task.destroy();
    }
  } catch (err) {
    console.error('[pdf preview] could not render the first page', err);
    return null;
  }
}
