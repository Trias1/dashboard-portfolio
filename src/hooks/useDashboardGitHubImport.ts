import { useState } from 'react';

export function useDashboardGitHubImport() {
  const [githubUsername, setGithubUsername] = useState('');
  const [githubPreview, setGithubPreview] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubMsg, setGithubMsg] = useState('');
  const [githubOptions, setGithubOptions] = useState({ bio: true, skills: true, projects: true });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  return { githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects };
}
