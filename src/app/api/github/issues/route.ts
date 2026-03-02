/**
 * /api/github/issues — GitHub 이슈 목록 API Route
 *
 * GitHub REST API에서 이슈를 가져와서 정제된 형태로 반환한다.
 * PR은 GitHub API에서 이슈로도 반환되므로 pull_request 키가 있는 항목을 제외한다.
 * GITHUB_TOKEN은 서버사이드에서만 사용되어 클라이언트에 노출되지 않는다.
 */

import { NextResponse } from "next/server";
import type { GitHubIssue } from "@/types/github";

// --- GitHub API 호출 공통 헤더
function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function GET() {
  const repo = process.env.GITHUB_REPO;
  if (!repo || !process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN or GITHUB_REPO not configured" },
      { status: 500 }
    );
  }

  try {
    // --- state=all로 open + closed 모두 가져옴, 최근 50개
    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=all&per_page=50&sort=updated&direction=desc`,
      { headers: githubHeaders(), next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = await res.json();

    // --- PR 제외 (pull_request 키가 있는 항목은 PR)
    const issues: GitHubIssue[] = raw
      .filter((item) => !item.pull_request)
      .map((item) => ({
        id: item.id,
        number: item.number,
        title: item.title,
        state: item.state,
        labels: (item.labels || []).map((l: { name: string; color: string }) => ({
          name: l.name,
          color: l.color,
        })),
        user: item.user?.login || "unknown",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        commentsCount: item.comments || 0,
        url: item.html_url,
      }));

    return NextResponse.json(issues);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub issues" },
      { status: 500 }
    );
  }
}
