import { useState } from 'react';
import type { GitHubImportOptions, GitHubPreview } from '@/types';

export function useDashboardGitHubImport() {
  const [githubUsername, setGithubUsername] = useState('');
  const [githubPreview, setGithubPreview] = useState<GitHubPreview | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubMsg, setGithubMsg] = useState('');
  const [githubOptions, setGithubOptions] = useState<GitHubImportOptions>({ bio: true, skills: true, projects: true });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  return { githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects };
}
