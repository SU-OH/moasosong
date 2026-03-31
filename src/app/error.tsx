"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-navy-900 mb-2">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        일시적인 오류입니다. 다시 시도해주세요.
      </p>
      <Button
        onClick={reset}
        className="h-12 bg-navy-700 hover:bg-navy-800 text-white rounded-xl px-8"
      >
        다시 시도
      </Button>
    </div>
  );
}
