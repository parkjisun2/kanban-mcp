/**
 * CommitCard — GitHub 커밋 카드 (TaskCard 패턴)
 *
 * SHA 앞 7자, 커밋 메시지(첫 줄만), 작성자, 시간 표시.
 */

"use client";

import { Card } from "@/components/ui/card";
import type { GitHubCommit } from "@/types/github";

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

export default function CommitCard({ commit }: { commit: GitHubCommit }) {
  const firstLine = commit.message.split("\n")[0];

  return (
    <a href={commit.url} target="_blank" rel="noopener noreferrer">
      <Card className="cursor-pointer gap-2 p-3 transition-colors hover:border-primary/30 hover:bg-accent/30">
        {/* --- SHA 뱃지 */}
        <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          {commit.shortSha}
        </code>

        {/* --- 커밋 메시지 (첫 줄) */}
        <p className="text-sm font-medium leading-snug line-clamp-2">{firstLine}</p>

        {/* --- 메타: 작성자, 시간 */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{commit.author}</span>
          <span>{timeAgo(commit.date)}</span>
        </div>
      </Card>
    </a>
  );
}
