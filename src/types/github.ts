/**
 * github.ts — GitHub 대시보드 타입 정의
 *
 * GitHub REST API 응답을 프론트엔드에서 사용할 수 있도록 정제한 타입.
 * 서버사이드 API Route(/api/github/*)에서 변환 후 클라이언트에 전달된다.
 */

// --- GitHub 이슈 (Issues 탭)
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  labels: GitHubLabel[];
  user: string;          // 작성자 login
  createdAt: string;     // ISO 8601
  updatedAt: string;
  commentsCount: number;
  url: string;           // html_url
}

// --- GitHub 라벨
export interface GitHubLabel {
  name: string;
  color: string;         // hex (# 없음)
}

// --- GitHub Pull Request (PRs 탭)
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  merged: boolean;
  user: string;
  head: string;          // head branch 이름
  base: string;          // base branch 이름
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  url: string;
}

// --- GitHub 커밋 (Commits 탭)
export interface GitHubCommit {
  sha: string;
  shortSha: string;      // 앞 7자
  message: string;
  author: string;
  date: string;          // ISO 8601
  url: string;
}

// --- GitHub 배포 (Deployments 탭)
export interface GitHubDeployment {
  id: number;
  environment: string;   // "production", "preview" 등
  ref: string;           // 브랜치 또는 커밋
  state: "success" | "failure" | "pending" | "in_progress" | "inactive" | "error";
  description: string;
  createdAt: string;
  updatedAt: string;
  url: string;           // 배포 URL (Vercel 등)
}

// --- 대시보드 요약 통계
export interface GitHubSummary {
  openIssues: number;
  openPRs: number;
  totalCommits: number;
  latestDeployState: GitHubDeployment["state"] | "none";
}
