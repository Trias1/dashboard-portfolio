import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const ghFetch = async (url: string) => {
  const headers: any = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'PortfolioKit' };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
};

const extractUsername = (input: string) => {
  const match = input.match(/github\.com\/([^/]+)/);
  return match ? match[1] : input.replace(/\.git$/, '').trim();
};

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    let username = request.nextUrl.searchParams.get('username');
    if (!username) return errorResponse('Username required', 400);
    username = extractUsername(username);

    const [user, repos] = await Promise.all([
      ghFetch(`https://api.github.com/users/${username}`),
      ghFetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=owner`),
    ]);

    const langCount: Record<string, number> = {};
    repos.forEach((r: any) => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const topLangs = Object.entries(langCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang]) => lang);

    return successResponse({
      profile: {
        name: user.name || username, bio: user.bio || '', avatar: user.avatar_url,
        location: user.location || '', blog: user.blog || '',
        public_repos: user.public_repos, followers: user.followers,
      },
      languages: topLangs,
      projects: repos.map((r: any) => ({
        name: r.name, title: r.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: r.description || '', tech_stack: r.language || '',
        github_url: r.html_url, demo_url: r.homepage || '',
        stars: r.stargazers_count, fork: r.fork,
      })),
    });
  } catch (err: any) { return errorResponse(err.message); }
}
