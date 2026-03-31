"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Scale, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-[54px] rounded-2xl border-border/60 bg-slate-50/50 focus:bg-white text-[15px] px-4 transition-all duration-200";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: SignupInput) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: data.role,
          full_name: data.full_name,
          bar_number: data.bar_number || null,
          law_firm: data.law_firm || null,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("가입 완료! 이메일 인증 후 로그인해주세요.");
    router.push("/login");
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 overflow-y-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="flex-1 space-y-5">
        {/* 역할 선택 */}
        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-navy-800">
            가입 유형
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "victim" as const, Icon: User, label: "개인 (피해자)" },
              { value: "lawyer" as const, Icon: Scale, label: "변호사" },
            ].map((role) => (
              <motion.button
                key={role.value}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setValue("role", role.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 py-6 rounded-2xl border-2 transition-all duration-200",
                  selectedRole === role.value
                    ? "border-navy-600 bg-navy-50/80 shadow-md shadow-navy-700/8"
                    : "border-border/60 bg-slate-50/30 hover:bg-slate-50"
                )}
              >
                {/* 체크마크 */}
                <AnimatePresence>
                  {selectedRole === role.value && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-2.5 right-2.5 w-5 h-5 bg-navy-700 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                    selectedRole === role.value
                      ? "bg-navy-700 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <role.Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[14px] font-semibold transition-colors",
                    selectedRole === role.value
                      ? "text-navy-700"
                      : "text-gray-500"
                  )}
                >
                  {role.label}
                </span>
              </motion.button>
            ))}
          </div>
          {errors.role && (
            <p className="text-xs text-destructive pl-1">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-navy-800">이름</Label>
          <Input
            placeholder="홍길동"
            {...register("full_name")}
            className={INPUT_CLASS}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive pl-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-navy-800">
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
          <Label className="text-[14px] font-medium text-navy-800">
            비밀번호
          </Label>
          <Input
            type="password"
            placeholder="6자 이상"
            {...register("password")}
            className={INPUT_CLASS}
          />
          {errors.password && (
            <p className="text-xs text-destructive pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-navy-800">
            비밀번호 확인
          </Label>
          <Input
            type="password"
            placeholder="비밀번호 재입력"
            {...register("confirmPassword")}
            className={INPUT_CLASS}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive pl-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-navy-800">
            전화번호 <span className="text-muted-foreground font-normal">(선택)</span>
          </Label>
          <Input
            type="tel"
            placeholder="010-0000-0000"
            {...register("phone")}
            className={INPUT_CLASS}
          />
        </div>

        {/* 변호사 전용 필드 */}
        <AnimatePresence>
          {selectedRole === "lawyer" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden space-y-5"
            >
              <div className="space-y-2">
                <Label className="text-[14px] font-medium text-navy-800">
                  변호사 등록번호
                </Label>
                <Input
                  placeholder="등록번호 입력"
                  {...register("bar_number")}
                  className={INPUT_CLASS}
                />
                {errors.bar_number && (
                  <p className="text-xs text-destructive pl-1">
                    {errors.bar_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[14px] font-medium text-navy-800">
                  소속 법률사무소{" "}
                  <span className="text-muted-foreground font-normal">(선택)</span>
                </Label>
                <Input
                  placeholder="법률사무소명"
                  {...register("law_firm")}
                  className={INPUT_CLASS}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pb-2 space-y-3">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            type="submit"
            className="w-full h-[54px] bg-navy-700 hover:bg-navy-800 text-white text-[15px] font-bold rounded-2xl shadow-md shadow-navy-700/15"
            disabled={isLoading || !selectedRole}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "가입하기"
            )}
          </Button>
        </motion.div>

        <p className="text-[13px] text-muted-foreground text-center py-2">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-navy-700 font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </motion.form>
  );
}
