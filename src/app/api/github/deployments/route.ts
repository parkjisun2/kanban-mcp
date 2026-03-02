/**
 * /api/github/deployments — GitHub 배포 목록 API Route
 *
 * GitHub REST API에서 배포 목록을 가져오고,
 * 각 배포의 최신 상태(status)를 별도 API 호출로 가져온다.
 * Vercel 등 외부 배포 서비스의 상태를 확인할 수 있다.
 */

import { NextResponse } from "next/server";
import type { GitHubDeployment } from "@/types/github";

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
    // --- 배포 목록 가져오기 (최근 10개)
    const res = await fetch(
      `https://api.github.com/repos/${repo}/deployments?per_page=10`,
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

    // --- 각 배포의 최신 상태를 병렬로 가져온다
    const deployments: GitHubDeployment[] = await Promise.all(
      raw.map(async (d) => {
        // 각 배포의 statuses 중 가장 최신 것을 가져옴
        let state: GitHubDeployment["state"] = "pending";
        let description = "";
        let deployUrl = "";

        try {
          const statusRes = await fetch(
            `https://api.github.com/repos/${repo}/deployments/${d.id}/statuses?per_page=1`,
            { headers: githubHeaders() }
          );
          if (statusRes.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const statuses: any[] = await statusRes.json();
            if (statuses.length > 0) {
              state = statuses[0].state;
              description = statuses[0].description || "";
              deployUrl = statuses[0].environment_url || statuses[0].target_url || "";
            }
          }
        } catch {
          // 상태를 못 가져오면 pending 유지
        }

        return {
          id: d.id,
          environment: d.environment || "unknown",
          ref: d.ref || "",
          state,
          description,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          url: deployUrl,
        };
      })
    );

    return NextResponse.json(deployments);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub deployments" },
      { status: 500 }
    );
  }
}
