/**
 * IssueCard — GitHub 이슈 카드 (TaskCard 패턴)
 *
 * KanbanColumn 안의 TaskCard와 동일한 카드 디자인.
 * 클릭하면 GitHub 이슈 페이지로 새 탭 열림.
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import type { GitHubIssue } from "@/types/github";

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

export default function IssueCard({ issue }: { issue: GitHubIssue }) {
  return (
    <a href={issue.url} target="_blank" rel="noopener noreferrer">
      <Card className="cursor-pointer gap-2 p-3 transition-colors hover:border-primary/30 hover:bg-accent/30">
        {/* --- 상태 뱃지 + 번호 */}
        <div className="flex items-center gap-1.5">
          <Badge
            variant={issue.state === "open" ? "default" : "secondary"}
            className={
              issue.state === "open"
                ? "bg-green-600 text-white text-[10px] px-1.5 py-0"
                : "text-[10px] px-1.5 py-0"
            }
          >
            {issue.state === "open" ? "Open" : "Closed"}
          </Badge>
          <span className="text-[10px] text-muted-foreground">#{issue.number}</span>
        </div>

        {/* --- 제목 */}
        <p className="text-sm font-medium leading-snug">{issue.title}</p>

        {/* --- 라벨 */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <span
                key={label.name}
                className="inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-medium"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* --- 메타: 작성자, 시간, 댓글 수 */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{issue.user}</span>
          <span>{timeAgo(issue.updatedAt)}</span>
          {issue.commentsCount > 0 && (
            <span className="flex items-center gap-0.5 ml-auto">
              <MessageSquare className="h-3 w-3" />
              {issue.commentsCount}
            </span>
          )}
        </div>
      </Card>
    </a>
  );
}
