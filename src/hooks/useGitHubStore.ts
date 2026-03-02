/**
 * useGitHubStore — GitHub 대시보드 Zustand 스토어
 *
 * GitHub API Route(/api/github/*)에서 데이터를 가져와 상태를 관리한다.
 * 30초 간격 자동 폴링 + 탭 비활성 시 폴링 중지 기능 포함.
 */

import { create } from "zustand";
import { useEffect, useRef } from "react";
import type {
  GitHubIssue,
  GitHubPullRequest,
  GitHubCommit,
  GitHubDeployment,
  GitHubSummary,
} from "@/types/github";

// --- 스토어 상태 타입
interface GitHubState {
  issues: GitHubIssue[];
  pulls: GitHubPullRequest[];
  commits: GitHubCommit[];
  deployments: GitHubDeployment[];
  summary: GitHubSummary;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // --- 데이터 fetch 액션
  fetchIssues: () => Promise<void>;
  fetchPulls: () => Promise<void>;
  fetchCommits: () => Promise<void>;
  fetchDeployments: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

// --- 요약 통계 계산 헬퍼
function computeSummary(
  issues: GitHubIssue[],
  pulls: GitHubPullRequest[],
  commits: GitHubCommit[],
  deployments: GitHubDeployment[]
): GitHubSummary {
  return {
    openIssues: issues.filter((i) => i.state === "open").length,
    openPRs: pulls.filter((p) => p.state === "open").length,
    totalCommits: commits.length,
    latestDeployState:
      deployments.length > 0 ? deployments[0].state : "none",
  };
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
  issues: [],
  pulls: [],
  commits: [],
  deployments: [],
  summary: { openIssues: 0, openPRs: 0, totalCommits: 0, latestDeployState: "none" },
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchIssues: async () => {
    try {
      const res = await fetch("/api/github/issues");
      if (!res.ok) throw new Error("issues fetch failed");
      const data: GitHubIssue[] = await res.json();
      set((s) => {
        const summary = computeSummary(data, s.pulls, s.commits, s.deployments);
        return { issues: data, summary };
      });
    } catch {
      set({ error: "Failed to fetch issues" });
    }
  },

  fetchPulls: async () => {
    try {
      const res = await fetch("/api/github/pulls");
      if (!res.ok) throw new Error("pulls fetch failed");
      const data: GitHubPullRequest[] = await res.json();
      set((s) => {
        const summary = computeSummary(s.issues, data, s.commits, s.deployments);
        return { pulls: data, summary };
      });
    } catch {
      set({ error: "Failed to fetch pull requests" });
    }
  },

  fetchCommits: async () => {
    try {
      const res = await fetch("/api/github/commits");
      if (!res.ok) throw new Error("commits fetch failed");
      const data: GitHubCommit[] = await res.json();
      set((s) => {
        const summary = computeSummary(s.issues, s.pulls, data, s.deployments);
        return { commits: data, summary };
      });
    } catch {
      set({ error: "Failed to fetch commits" });
    }
  },

  fetchDeployments: async () => {
    try {
      const res = await fetch("/api/github/deployments");
      if (!res.ok) throw new Error("deployments fetch failed");
      const data: GitHubDeployment[] = await res.json();
      set((s) => {
        const summary = computeSummary(s.issues, s.pulls, s.commits, data);
        return { deployments: data, summary };
      });
    } catch {
      set({ error: "Failed to fetch deployments" });
    }
  },

  // --- 4개 엔드포인트를 병렬로 호출
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    const { fetchIssues, fetchPulls, fetchCommits, fetchDeployments } = get();
    await Promise.all([
      fetchIssues(),
      fetchPulls(),
      fetchCommits(),
      fetchDeployments(),
    ]);
    set({ isLoading: false, lastUpdated: new Date() });
  },
}));

/**
 * GitHub 자동 폴링 훅
 *
 * 30초마다 모든 GitHub 데이터를 갱신한다.
 * 탭이 비활성(hidden) 상태면 폴링을 중지하고, 다시 활성화되면 즉시 갱신 후 폴링 재시작.
 *
 * @param intervalMs 폴링 간격 (기본 30초)
 */
export function useGitHubAutoRefresh(intervalMs = 30000) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fetchAll } = useGitHubStore();

  useEffect(() => {
    // --- 최초 로드 시 즉시 데이터 가져오기
    fetchAll();

    // --- 폴링 시작/중지 함수
    const startPolling = () => {
      if (intervalRef.current) return; // 이미 돌고 있으면 무시
      intervalRef.current = setInterval(fetchAll, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // --- 탭 활성화/비활성화 감지
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAll(); // 탭 복귀 시 즉시 갱신
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAll, intervalMs]);
}
