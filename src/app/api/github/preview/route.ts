import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import type { GitHubRepo, GitHubUser } from '@/types/api';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const ghFetch = async <T>(url: string): Promise<T> => {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'PortfolioKit' };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data: T = await res.json();
  return data;
};

const GITHUB_USERNAME_RE = /^[A-Za-z0-9-]{1,39}$/;
const extractUsername = (input: unknown): string | null => {
  if (typeof input !== 'string') return null;
  const match = input.match(/github\.com\/([^/?#]+)/);
  const username = (match ? match[1] : input.replace(/\.git$/, '')).trim();
  return GITHUB_USERNAME_RE.test(username) ? username : null;
};

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const rawUsername = request.nextUrl.searchParams.get('username');
    if (!rawUsername) return errorResponse('Username required', 400);
    const username = extractUsername(rawUsername);
    if (!username) return errorResponse('Invalid GitHub username', 400);

    const [user, repos] = await Promise.all([
      ghFetch<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(username)}`),
      ghFetch<GitHubRepo[]>(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100&type=owner`),
    ]);

    const langCount: Record<string, number> = {};
    repos.forEach((r) => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const topLangs = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang]) => lang);

    return successResponse({
      profile: {
        name: user.name || username, bio: user.bio || '', avatar: user.avatar_url,
        location: user.location || '', blog: user.blog || '',
        public_repos: user.public_repos, followers: user.followers,
      },
      languages: topLangs,
      projects: repos.map((r) => ({
        name: r.name, title: r.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: r.description || '', tech_stack: r.language || '',
        github_url: r.html_url, demo_url: r.homepage || '',
        stars: r.stargazers_count, fork: r.fork,
      })),
    });
  } catch (err) {
    if (getErrorMessage(err) === 'GitHub API error: 404') return errorResponse('GitHub user not found', 404);
    if (getErrorMessage(err).startsWith('GitHub API error')) return errorResponse(getErrorMessage(err), 502);
    return errorResponse(getErrorMessage(err));
  }
}
