/**
 * DeploymentCard — GitHub 배포 카드 (TaskCard 패턴)
 *
 * 상태 뱃지: Success(초록), Failure(빨강), Pending(노랑)
 * 환경(Production/Preview), ref, Vercel URL 표시.
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { GitHubDeployment } from "@/types/github";

function deployBadge(state: string) {
  switch (state) {
    case "success":
      return { label: "Success", className: "bg-green-600 text-white" };
    case "failure":
    case "error":
      return { label: "Failed", className: "bg-red-600 text-white" };
    case "in_progress":
      return { label: "Building", className: "bg-blue-600 text-white" };
    case "inactive":
      return { label: "Inactive", className: "bg-muted text-muted-foreground" };
    default:
      return { label: "Pending", className: "bg-yellow-600 text-white" };
  }
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

export default function DeploymentCard({ deployment }: { deployment: GitHubDeployment }) {
  const badge = deployBadge(deployment.state);

  return (
    <Card className="gap-2 p-3">
      {/* --- 환경 + 상태 뱃지 */}
      <div className="flex items-center gap-1.5">
        <Badge
          variant="secondary"
          className={`${badge.className} text-[10px] px-1.5 py-0`}
        >
          {badge.label}
        </Badge>
        <span className="text-[10px] font-medium text-muted-foreground">
          {deployment.environment}
        </span>
      </div>

      {/* --- ref (커밋 SHA 또는 브랜치) */}
      <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground truncate block max-w-full">
        {deployment.ref.length > 10 ? deployment.ref.slice(0, 7) : deployment.ref}
      </code>

      {/* --- Vercel URL */}
      {deployment.url && (
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline truncate"
        >
          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{deployment.url.replace("https://", "")}</span>
        </a>
      )}

      {/* --- 시간 */}
      <div className="text-[10px] text-muted-foreground">
        {timeAgo(deployment.createdAt)}
      </div>
    </Card>
  );
}
