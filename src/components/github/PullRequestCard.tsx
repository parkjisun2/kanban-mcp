/**
 * PullRequestCard — GitHub PR 카드 (TaskCard 패턴)
 *
 * 상태 뱃지: Open(초록), Draft(회색), Merged(보라), Closed(빨강)
 * 브랜치: head → base 코드 블록으로 표시.
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitMerge, GitPullRequest } from "lucide-react";
import type { GitHubPullRequest } from "@/types/github";

function prStatus(pr: GitHubPullRequest) {
  if (pr.merged) return { label: "Merged", className: "bg-purple-600 text-white" };
  if (pr.draft) return { label: "Draft", className: "bg-muted text-muted-foreground" };
  if (pr.state === "open") return { label: "Open", className: "bg-green-600 text-white" };
  return { label: "Closed", className: "bg-red-600/80 text-white" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function PullRequestCard({ pr }: { pr: GitHubPullRequest }) {
  const status = prStatus(pr);

  return (
    <a href={pr.url} target="_blank" rel="noopener noreferrer">
      <Card className="cursor-pointer gap-2 p-3 transition-colors hover:border-primary/30 hover:bg-accent/30">
        {/* --- 상태 뱃지 + 번호 + 머지 아이콘 */}
        <div className="flex items-center gap-1.5">
          {pr.merged ? (
            <GitMerge className="h-3.5 w-3.5 text-purple-400" />
          ) : (
            <GitPullRequest className="h-3.5 w-3.5 text-green-400" />
          )}
          <Badge
            variant="secondary"
            className={`${status.className} text-[10px] px-1.5 py-0`}
          >
            {status.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">#{pr.number}</span>
        </div>

        {/* --- 제목 */}
        <p className="text-sm font-medium leading-snug">{pr.title}</p>

        {/* --- 브랜치: head → base */}
        <div className="flex items-center gap-1">
          <code className="rounded bg-muted px-1 py-0 text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">
            {pr.head}
          </code>
          <span className="text-[10px] text-muted-foreground">→</span>
          <code className="rounded bg-muted px-1 py-0 text-[10px] font-mono text-muted-foreground">
            {pr.base}
          </code>
        </div>

        {/* --- 메타: 작성자, 시간 */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{pr.user}</span>
          <span>{timeAgo(pr.updatedAt)}</span>
        </div>
      </Card>
    </a>
  );
}
