/**
 * GitHubColumn — GitHub 대시보드 컬럼 (KanbanColumn과 동일한 레이아웃)
 *
 * KanbanColumn의 디자인 패턴을 그대로 따른다:
 * - 컬럼 헤더: 색상 dot + 제목 + 아이템 수 뱃지
 * - 스크롤 가능한 카드 목록
 * - w-72, shrink-0, rounded-lg border
 *
 * 드래그앤드롭은 없고, 읽기 전용으로 카드를 표시한다.
 */

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useGitHubStore } from "@/hooks/useGitHubStore";
import IssueCard from "./IssueCard";
import PullRequestCard from "./PullRequestCard";
import CommitCard from "./CommitCard";
import DeploymentCard from "./DeploymentCard";

interface GitHubColumnProps {
  title: string;
  count: number;
  color: string;       // Tailwind bg 클래스 (예: "bg-green-500")
  type: "issues" | "pulls" | "commits" | "deployments";
}

export default function GitHubColumn({ title, count, color, type }: GitHubColumnProps) {
  const { issues, pulls, commits, deployments } = useGitHubStore();

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-border/50 bg-muted/30">
      {/* --- 컬럼 헤더 (KanbanColumn과 동일 패턴) */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {count}
          </span>
        </div>
      </div>

      {/* --- 카드 목록 (스크롤) */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-2 py-1" style={{ minHeight: 40 }}>
          {type === "issues" &&
            (issues.length === 0 ? (
              <EmptyState text="이슈 없음" />
            ) : (
              issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            ))}

          {type === "pulls" &&
            (pulls.length === 0 ? (
              <EmptyState text="PR 없음" />
            ) : (
              pulls.map((pr) => <PullRequestCard key={pr.id} pr={pr} />)
            ))}

          {type === "commits" &&
            (commits.length === 0 ? (
              <EmptyState text="커밋 없음" />
            ) : (
              commits.map((c) => <CommitCard key={c.sha} commit={c} />)
            ))}

          {type === "deployments" &&
            (deployments.length === 0 ? (
              <EmptyState text="배포 없음" />
            ) : (
              deployments.map((d) => <DeploymentCard key={d.id} deployment={d} />)
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- 비어있을 때 표시
function EmptyState({ text }: { text: string }) {
  return (
    <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>
  );
}
