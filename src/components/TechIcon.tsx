// Pinned devicon release: unpinned gh/ URLs follow the repo and break when icons are renamed.
const DEVICON = 'https://cdn.jsdelivr.net/npm/devicon@2.17.0/icons';

const TECH_ICONS: Record<string, string> = {
  'javascript': `${DEVICON}/javascript/javascript-original.svg`,
  'js': `${DEVICON}/javascript/javascript-original.svg`,
  'typescript': `${DEVICON}/typescript/typescript-original.svg`,
  'ts': `${DEVICON}/typescript/typescript-original.svg`,
  'react': `${DEVICON}/react/react-original.svg`,
  'react.js': `${DEVICON}/react/react-original.svg`,
  'next.js': `${DEVICON}/nextjs/nextjs-original.svg`,
  'nextjs': `${DEVICON}/nextjs/nextjs-original.svg`,
  'vue': `${DEVICON}/vuejs/vuejs-original.svg`,
  'vue.js': `${DEVICON}/vuejs/vuejs-original.svg`,
  'angular': `${DEVICON}/angularjs/angularjs-original.svg`,
  'svelte': `${DEVICON}/svelte/svelte-original.svg`,
  'html': `${DEVICON}/html5/html5-original.svg`,
  'html5': `${DEVICON}/html5/html5-original.svg`,
  'css': `${DEVICON}/css3/css3-original.svg`,
  'css3': `${DEVICON}/css3/css3-original.svg`,
  'tailwind': `${DEVICON}/tailwindcss/tailwindcss-original.svg`,
  'tailwindcss': `${DEVICON}/tailwindcss/tailwindcss-original.svg`,
  'tailwind css': `${DEVICON}/tailwindcss/tailwindcss-original.svg`,
  'bootstrap': `${DEVICON}/bootstrap/bootstrap-original.svg`,
  'node.js': `${DEVICON}/nodejs/nodejs-original.svg`,
  'nodejs': `${DEVICON}/nodejs/nodejs-original.svg`,
  'node': `${DEVICON}/nodejs/nodejs-original.svg`,
  'express': `${DEVICON}/express/express-original.svg`,
  'express.js': `${DEVICON}/express/express-original.svg`,
  'python': `${DEVICON}/python/python-original.svg`,
  'django': `${DEVICON}/django/django-plain.svg`,
  'fastapi': `${DEVICON}/fastapi/fastapi-original.svg`,
  'flask': `${DEVICON}/flask/flask-original.svg`,
  'java': `${DEVICON}/java/java-original.svg`,
  'spring': `${DEVICON}/spring/spring-original.svg`,
  'spring boot': `${DEVICON}/spring/spring-original.svg`,
  'kotlin': `${DEVICON}/kotlin/kotlin-original.svg`,
  'go': `${DEVICON}/go/go-original.svg`,
  'golang': `${DEVICON}/go/go-original.svg`,
  'rust': `${DEVICON}/rust/rust-original.svg`,
  'php': `${DEVICON}/php/php-original.svg`,
  'laravel': `${DEVICON}/laravel/laravel-original.svg`,
  'ruby': `${DEVICON}/ruby/ruby-original.svg`,
  'ruby on rails': `${DEVICON}/rails/rails-original-wordmark.svg`,
  'rails': `${DEVICON}/rails/rails-original-wordmark.svg`,
  'c#': `${DEVICON}/csharp/csharp-original.svg`,
  '.net': `${DEVICON}/dot-net/dot-net-original.svg`,
  'dotnet': `${DEVICON}/dot-net/dot-net-original.svg`,
  'postgresql': `${DEVICON}/postgresql/postgresql-original.svg`,
  'postgres': `${DEVICON}/postgresql/postgresql-original.svg`,
  'mysql': `${DEVICON}/mysql/mysql-original.svg`,
  'mongodb': `${DEVICON}/mongodb/mongodb-original.svg`,
  'mongo': `${DEVICON}/mongodb/mongodb-original.svg`,
  'redis': `${DEVICON}/redis/redis-original.svg`,
  'sqlite': `${DEVICON}/sqlite/sqlite-original.svg`,
  'firebase': `${DEVICON}/firebase/firebase-plain.svg`,
  'supabase': `${DEVICON}/supabase/supabase-original.svg`,
  'docker': `${DEVICON}/docker/docker-original.svg`,
  'kubernetes': `${DEVICON}/kubernetes/kubernetes-plain.svg`,
  'k8s': `${DEVICON}/kubernetes/kubernetes-plain.svg`,
  'aws': `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
  'gcp': `${DEVICON}/googlecloud/googlecloud-original.svg`,
  'google cloud': `${DEVICON}/googlecloud/googlecloud-original.svg`,
  'azure': `${DEVICON}/azure/azure-original.svg`,
  'nginx': `${DEVICON}/nginx/nginx-original.svg`,
  'linux': `${DEVICON}/linux/linux-original.svg`,
  'git': `${DEVICON}/git/git-original.svg`,
  'github': `${DEVICON}/github/github-original.svg`,
  'github actions': `${DEVICON}/github/github-original.svg`,
  'ci/cd': `${DEVICON}/github/github-original.svg`,
  'jenkins': `${DEVICON}/jenkins/jenkins-original.svg`,
  'terraform': `${DEVICON}/terraform/terraform-original.svg`,
  'ansible': `${DEVICON}/ansible/ansible-original.svg`,
  'figma': `${DEVICON}/figma/figma-original.svg`,
  'graphql': `${DEVICON}/graphql/graphql-plain.svg`,
  'rest api': `${DEVICON}/fastapi/fastapi-original.svg`,
  'prisma': `${DEVICON}/prisma/prisma-original.svg`,
  'vite': `${DEVICON}/vitejs/vitejs-original.svg`,
  'webpack': `${DEVICON}/webpack/webpack-original.svg`,
  'jest': `${DEVICON}/jest/jest-plain.svg`,
  // Cloud & Infrastructure
  'openstack': `${DEVICON}/openstack/openstack-original.svg`,
  'proxmox': 'https://www.proxmox.com/images/proxmox/Proxmox-logo-800.png',
  'kvm': `${DEVICON}/linux/linux-original.svg`,
  'alibaba cloud': 'https://img.icons8.com/color/48/alibaba-cloud.png',
  'amazon web services': `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
  'bash': `${DEVICON}/bash/bash-original.svg`,
  'bash script': `${DEVICON}/bash/bash-original.svg`,
  'centos': `${DEVICON}/centos/centos-original.svg`,
  'ubuntu': `${DEVICON}/ubuntu/ubuntu-plain.svg`,
  'debian': `${DEVICON}/debian/debian-original.svg`,
  'red hat': `${DEVICON}/redhat/redhat-original.svg`,
  'rhel': `${DEVICON}/redhat/redhat-original.svg`,
  'windows': `${DEVICON}/windows8/windows8-original.svg`,
  'macos': `${DEVICON}/apple/apple-original.svg`,
  'apache': `${DEVICON}/apache/apache-original.svg`,
  'hadoop': `${DEVICON}/hadoop/hadoop-original.svg`,
  'apache hadoop': `${DEVICON}/hadoop/hadoop-original.svg`,
  'apache spark': `${DEVICON}/apachespark/apachespark-original.svg`,
  'grafana': `${DEVICON}/grafana/grafana-original.svg`,
  'prometheus': `${DEVICON}/prometheus/prometheus-original.svg`,
  'elasticsearch': `${DEVICON}/elasticsearch/elasticsearch-original.svg`,
  // Design
  'photoshop': `${DEVICON}/photoshop/photoshop-plain.svg`,
  'illustrator': `${DEVICON}/illustrator/illustrator-plain.svg`,
  'adobe xd': `${DEVICON}/xd/xd-plain.svg`,
  'canva': 'https://img.icons8.com/color/48/canva.png',
  // Databases extra
  'oracle': `${DEVICON}/oracle/oracle-original.svg`,
  'cassandra': `${DEVICON}/cassandra/cassandra-original.svg`,
  'neo4j': `${DEVICON}/neo4j/neo4j-original.svg`,
  // Mobile
  'flutter': `${DEVICON}/flutter/flutter-original.svg`,
  'dart': `${DEVICON}/dart/dart-original.svg`,
  'swift': `${DEVICON}/swift/swift-original.svg`,
  'android': `${DEVICON}/android/android-original.svg`,
  // Tools
  'jira': `${DEVICON}/jira/jira-original.svg`,
  'confluence': `${DEVICON}/confluence/confluence-original.svg`,
  'gitlab': `${DEVICON}/gitlab/gitlab-original.svg`,
  'bitbucket': `${DEVICON}/bitbucket/bitbucket-original.svg`,
  'slack': 'https://img.icons8.com/color/48/slack-new.png',
  'notion': 'https://img.icons8.com/color/48/notion--v1.png',
};

export function getTechIcon(name: string): string | null {
  return TECH_ICONS[name.trim().toLowerCase()] || null;
}

interface TechBadgeProps {
  name: string;
  accentColor: string;
  size?: 'sm' | 'md';
  variant?: 'pill' | 'outline' | 'filled';
  textColor?: string;
}

export default function TechBadge({ name, accentColor, size = 'sm', variant = 'pill', textColor }: TechBadgeProps) {
  const iconUrl = getTechIcon(name);
  const ac = accentColor;
  const paddingClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const style = variant === 'filled'
    ? { backgroundColor: `${ac}20`, color: ac }
    : variant === 'outline'
    ? { borderColor: `${ac}30`, color: ac, border: '1px solid', backgroundColor: `${ac}08` }
    : { backgroundColor: `${ac}20`, color: textColor || ac };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${paddingClass}`} style={style}>
      {iconUrl && (
        <img src={iconUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className={`${iconSize} object-contain flex-shrink-0`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
      {name.trim()}
    </span>
  );
}
