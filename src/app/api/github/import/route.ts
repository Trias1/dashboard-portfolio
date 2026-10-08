import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { username: rawUsername, options } = await request.json();
    const username = extractUsername(rawUsername);
    if (!username) return errorResponse('Invalid GitHub username', 400);
    if (!options || typeof options !== 'object') return errorResponse('Invalid options', 400);
    const userId = auth.id;

    const [user, repos] = await Promise.all([
      ghFetch<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(username)}`),
      ghFetch<GitHubRepo[]>(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100&type=owner`),
    ]);

    const results: string[] = [];

    if (options.bio && user.bio) {
      const { data: existing } = await getSupabaseAdmin().from('about').select('id').eq('owner_id', userId).maybeSingle();
      if (existing) {
        await getSupabaseAdmin().from('about').update({ bio: user.bio, updated_at: new Date().toISOString() }).eq('owner_id', userId);
      } else {
        await getSupabaseAdmin().from('about').insert({ bio: user.bio, owner_id: userId });
      }
      results.push('bio');
    }

    if (options.skills) {
      const langCount: Record<string, number> = {};
      repos.forEach((r) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
      const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([l]) => l);
      if (topLangs.length > 0) {
        await getSupabaseAdmin().from('skills').insert({ title: 'GitHub Languages', skills: topLangs.join(', '), owner_id: userId });
        results.push('skills');
      }
    }

    if (options.projects && options.selectedProjects?.length > 0) {
      const selectedRepos = repos.filter((r) => options.selectedProjects.includes(r.name));
      for (const r of selectedRepos) {
        await getSupabaseAdmin().from('projects').insert({
          title: r.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: r.description || '', tech_stack: r.language || '',
          github_url: r.html_url, demo_url: r.homepage || '', owner_id: userId,
        });
      }
      results.push(`${selectedRepos.length} projects`);
    }

    return successResponse({ success: true, imported: results });
  } catch (err) {
    if (getErrorMessage(err) === 'GitHub API error: 404') return errorResponse('GitHub user not found', 404);
    if (getErrorMessage(err).startsWith('GitHub API error')) return errorResponse(getErrorMessage(err), 502);
    return errorResponse(getErrorMessage(err));
  }
}
