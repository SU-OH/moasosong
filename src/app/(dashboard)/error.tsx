"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-navy-900 mb-2">
        페이지를 불러올 수 없습니다
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        일시적인 오류입니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="h-12 bg-navy-700 hover:bg-navy-800 text-white rounded-xl px-6"
        >
          다시 시도
        </Button>
        <Link href="/">
          <Button variant="outline" className="h-12 rounded-xl px-6">
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </Link>
      </div>
    </div>
  );
}
