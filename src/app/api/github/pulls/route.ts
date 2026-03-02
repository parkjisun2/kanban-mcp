/**
 * /api/github/pulls — GitHub Pull Request 목록 API Route
 *
 * GitHub REST API에서 PR 목록을 가져온다.
 * merged 상태는 merged_at 필드로 판별한다 (state=closed + merged_at !== null).
 * GITHUB_TOKEN은 서버사이드에서만 사용.
 */

import { NextResponse } from "next/server";
import type { GitHubPullRequest } from "@/types/github";

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
    // --- state=all로 open + closed(merged 포함) 모두 가져옴
    const res = await fetch(
      `https://api.github.com/repos/${repo}/pulls?state=all&per_page=30&sort=updated&direction=desc`,
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

    const pulls: GitHubPullRequest[] = raw.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      draft: pr.draft || false,
      // --- merged 판별: state=closed이고 merged_at이 있으면 merged
      merged: pr.state === "closed" && pr.merged_at !== null,
      user: pr.user?.login || "unknown",
      head: pr.head?.ref || "",
      base: pr.base?.ref || "",
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      url: pr.html_url,
    }));

    return NextResponse.json(pulls);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub pull requests" },
      { status: 500 }
    );
  }
}
