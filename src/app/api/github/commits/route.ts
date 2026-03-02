/**
 * /api/github/commits — GitHub 최근 커밋 목록 API Route
 *
 * GitHub REST API에서 기본 브랜치의 최근 커밋 20개를 가져온다.
 * SHA는 앞 7자로 축약해서 shortSha로 제공한다.
 */

import { NextResponse } from "next/server";
import type { GitHubCommit } from "@/types/github";

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
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=20`,
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

    const commits: GitHubCommit[] = raw.map((c) => ({
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      message: c.commit?.message || "",
      author: c.commit?.author?.name || c.author?.login || "unknown",
      date: c.commit?.author?.date || "",
      url: c.html_url,
    }));

    return NextResponse.json(commits);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub commits" },
      { status: 500 }
    );
  }
}
