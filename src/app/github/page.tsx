/**
 * /github — GitHub 상태 대시보드 페이지
 *
 * 칸반과 별도로 GitHub 레포의 이슈, PR, 커밋, 배포 상태를 확인하는 읽기 전용 대시보드.
 */

import GitHubDashboard from "@/components/github/GitHubDashboard";

export default function GitHubPage() {
  return <GitHubDashboard />;
}
