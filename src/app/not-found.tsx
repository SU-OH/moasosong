import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-navy-400" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link href="/">
        <Button className="h-12 bg-navy-700 hover:bg-navy-800 text-white rounded-xl px-8">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
