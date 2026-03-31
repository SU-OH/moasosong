"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const INPUT_CLASS =
  "h-12 rounded-xl border-border/60 bg-slate-50/50 focus:bg-white text-base px-4 transition-all duration-200";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("이메일 또는 비밀번호를 확인해주세요.");
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const defaultPath =
        profile?.role === "lawyer"
          ? "/lawyer/dashboard"
          : "/victim/dashboard";
      router.push(redirect || defaultPath);
      router.refresh();
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="flex-1 space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-navy-800">
            이메일
          </Label>
          <Input
            type="email"
            placeholder="example@email.com"
            {...register("email")}
            className={INPUT_CLASS}
          />
          {errors.email && (
            <p className="text-xs text-destructive pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-navy-800">
            비밀번호
          </Label>
          <Input
            type="password"
            placeholder="6자 이상 입력"
            {...register("password")}
            className={INPUT_CLASS}
          />
          {errors.password && (
            <p className="text-xs text-destructive pl-1">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            type="submit"
            className="w-full h-12 bg-navy-700 hover:bg-navy-800 text-white text-base font-bold rounded-xl shadow-md shadow-navy-700/15 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "로그인"
            )}
          </Button>
        </motion.div>

        <div className="relative flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">또는</span>
          <Separator className="flex-1" />
        </div>

        <Link href="/signup" className="block">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-navy-700 text-base font-semibold rounded-xl border-navy-200 hover:bg-navy-50/50"
            >
              회원가입
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.form>
  );
}
