/**
 * Live screenshot of a project's demo site, shown when the project has no image of its own.
 * WordPress mShots: free and keyless; it serves a placeholder while a new site is captured, then
 * the screenshot (refreshed by mShots now and then). Only http(s) links are passed on.
 */
export function liveScreenshotUrl(demoUrl: unknown): string | null {
  if (typeof demoUrl !== 'string' || !demoUrl.trim()) return null;
  let url: URL;
  try {
    url = new URL(demoUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url.toString())}?w=1200&h=800`;
}

/** The image to show for a project: its own image, else a live screenshot of its demo site. */
export function projectImage(project: { image_url?: string | null; demo_url?: string | null }): string | null {
  return project.image_url || liveScreenshotUrl(project.demo_url);
}
