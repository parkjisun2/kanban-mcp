/**
 * GitHubDashboard — GitHub 상태 대시보드 (칸반 보드 컬럼 레이아웃)
 *
 * KanbanBoard와 동일한 가로 컬럼 레이아웃을 사용한다.
 * 4개 컬럼: Issues / Pull Requests / Commits / Deployments
 * 각 컬럼 헤더에 아이템 개수 뱃지, 내부에 카드 목록.
 *
 * 상단 필터바 영역: 레포 이름 + 마지막 업데이트 + 새로고침 버튼
 * 30초 자동 폴링 + 탭 비활성 시 폴링 중지.
 */

"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGitHubStore, useGitHubAutoRefresh } from "@/hooks/useGitHubStore";
import GitHubColumn from "./GitHubColumn";

// --- "마지막 업데이트: n초 전" 표시용
function formatLastUpdated(date: Date | null): string {
  if (!date) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 5) return "방금 전";
  if (secs < 60) return `${secs}초 전`;
  const mins = Math.floor(secs / 60);
  return `${mins}분 전`;
}

export default function GitHubDashboard() {
  // --- 30초 자동 폴링 활성화
  useGitHubAutoRefresh(30000);

  const { issues, pulls, commits, deployments, isLoading, lastUpdated, fetchAll } =
    useGitHubStore();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* --- 필터바 영역 (KanbanBoard의 FilterBar 위치와 동일) */}
      <div className="flex items-center justify-between border-b border-border px-6 py-2.5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold">parkjisun2/wiki</h1>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              업데이트: {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAll()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          새로고침
        </Button>
      </div>

      {/* --- 컬럼 레이아웃 (KanbanBoard와 동일한 flex gap-4 overflow-x-auto) */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {/* Issues 컬럼 */}
        <GitHubColumn
          title="Issues"
          count={issues.length}
          color="bg-green-500"
          type="issues"
        />

        {/* Pull Requests 컬럼 */}
        <GitHubColumn
          title="Pull Requests"
          count={pulls.length}
          color="bg-blue-500"
          type="pulls"
        />

        {/* Commits 컬럼 */}
        <GitHubColumn
          title="Commits"
          count={commits.length}
          color="bg-orange-500"
          type="commits"
        />

        {/* Deployments 컬럼 */}
        <GitHubColumn
          title="Deployments"
          count={deployments.length}
          color="bg-purple-500"
          type="deployments"
        />
      </div>
    </div>
  );
}
