"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { fraudCaseSchema, type FraudCaseInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = ["기본 정보", "가해자 정보", "증거 자료", "확인 및 제출"];

const FRAUD_TYPES = [
  { value: "investment", label: "투자 사기", desc: "가상화폐, 주식, 리딩방 등" },
  { value: "shopping", label: "쇼핑 사기", desc: "중고거래, 미배송, 가품 등" },
  { value: "loan", label: "대출 사기", desc: "선입금 요구, 수수료 편취 등" },
  { value: "romance", label: "로맨스 스캠", desc: "연애 빙자 금전 요구" },
  { value: "phishing", label: "보이스 피싱", desc: "전화/문자 사기" },
  { value: "other", label: "기타", desc: "위에 해당하지 않는 사기" },
];

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FraudCaseInput>({
    resolver: zodResolver(fraudCaseSchema),
    defaultValues: {
      police_report_filed: false,
    },
  });

  const selectedFraudType = watch("fraud_type");

  async function handleNext() {
    let fieldsToValidate: (keyof FraudCaseInput)[] = [];
    if (step === 0) {
      fieldsToValidate = ["title", "fraud_type", "description", "amount_lost", "incident_date"];
    }
    const valid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(data: FraudCaseInput) {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("로그인이 필요합니다");
      router.push("/login");
      return;
    }

    const { data: inserted, error } = await supabase
      .from("fraud_cases")
      .insert({
        victim_id: user.id,
        title: data.title,
        fraud_type: data.fraud_type,
        description: data.description,
        amount_lost: data.amount_lost,
        incident_date: data.incident_date,
        suspect_name: data.suspect_name || null,
        suspect_contact: data.suspect_contact || null,
        suspect_account: data.suspect_account || null,
        suspect_bank: data.suspect_bank || null,
        suspect_platform: data.suspect_platform || null,
        suspect_description: data.suspect_description || null,
        evidence_description: data.evidence_description || null,
        police_report_filed: data.police_report_filed,
        police_report_number: data.police_report_number || null,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      toast.error("접수 실패", { description: error?.message });
      setIsLoading(false);
      return;
    }

    // AI 파이프라인 비동기 트리거 (사용자는 대기하지 않음)
    fetch("/api/webhooks/case-created", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: inserted.id }),
    }).catch(() => {
      // AI 분석 실패해도 접수는 완료
    });

    toast.success("사건이 접수되었습니다", {
      description: "AI가 유사 사건을 분석합니다. 잠시 후 결과를 확인하세요.",
    });
    router.push("/victim/cases");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-navy-900">
        사건 접수
      </h2>

      {/* 진행 바 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn(i <= step ? "text-navy-700 font-medium" : "")}
            >
              {s}
            </span>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: 기본 정보 */}
        {step === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>사기 유형</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
                  {FRAUD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setValue("fraud_type", type.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        selectedFraudType === type.value
                          ? "border-navy-700 bg-navy-50"
                          : "border-border hover:border-navy-300"
                      )}
                    >
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.fraud_type && (
                  <p className="text-sm text-destructive">{errors.fraud_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">사건 제목</Label>
                <Input
                  id="title"
                  placeholder="예: 중고나라 에어팟 미배송 사기"
                  {...register("title")}
                  className="h-12"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">상세 설명</Label>
                <Textarea
                  id="description"
                  placeholder="사기 피해 경위를 상세히 작성해주세요 (20자 이상)"
                  {...register("description")}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amount_lost">피해 금액 (원)</Label>
                  <Input
                    id="amount_lost"
                    type="number"
                    placeholder="100000"
                    {...register("amount_lost", { valueAsNumber: true })}
                    className="h-12"
                  />
                  {errors.amount_lost && (
                    <p className="text-sm text-destructive">{errors.amount_lost.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident_date">사건 발생일</Label>
                  <Input
                    id="incident_date"
                    type="date"
                    {...register("incident_date")}
                    className="h-12"
                  />
                  {errors.incident_date && (
                    <p className="text-sm text-destructive">{errors.incident_date.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: 가해자 정보 */}
        {step === 1 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                알고 있는 가해자 정보를 입력해주세요. 동일범 추적에 활용됩니다.
              </p>
              <div className="space-y-2">
                <Label htmlFor="suspect_name">가해자 이름/닉네임</Label>
                <Input id="suspect_name" placeholder="김OO 또는 닉네임" {...register("suspect_name")} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspect_contact">가해자 연락처</Label>
                <Input id="suspect_contact" placeholder="전화번호 또는 카카오 ID" {...register("suspect_contact")} className="h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="suspect_bank">은행</Label>
                  <Input id="suspect_bank" placeholder="OO은행" {...register("suspect_bank")} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suspect_account">계좌번호</Label>
                  <Input id="suspect_account" placeholder="000-0000-0000" {...register("suspect_account")} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspect_platform">사기 플랫폼</Label>
                <Input id="suspect_platform" placeholder="중고나라, 번개장터, 카카오톡 등" {...register("suspect_platform")} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspect_description">기타 특징</Label>
                <Textarea id="suspect_description" placeholder="가해자에 대한 추가 정보" {...register("suspect_description")} rows={3} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 증거 자료 */}
        {step === 2 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evidence_description">증거 설명</Label>
                <Textarea
                  id="evidence_description"
                  placeholder="보유한 증거를 설명해주세요 (대화 캡처, 입금 내역, 계약서 등)"
                  {...register("evidence_description")}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>경찰 신고 여부</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("police_report_filed", true)}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-center transition-all",
                      watch("police_report_filed")
                        ? "border-navy-700 bg-navy-50 text-navy-700 font-medium"
                        : "border-border"
                    )}
                  >
                    신고함
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("police_report_filed", false)}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-center transition-all",
                      !watch("police_report_filed")
                        ? "border-navy-700 bg-navy-50 text-navy-700 font-medium"
                        : "border-border"
                    )}
                  >
                    미신고
                  </button>
                </div>
              </div>

              {watch("police_report_filed") && (
                <div className="space-y-2">
                  <Label htmlFor="police_report_number">신고 접수번호</Label>
                  <Input
                    id="police_report_number"
                    placeholder="접수번호 입력"
                    {...register("police_report_number")}
                    className="h-12"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: 확인 및 제출 */}
        {step === 3 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-navy-900">입력 내용 확인</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">사기 유형</span>
                  <span className="font-medium">
                    {FRAUD_TYPES.find((t) => t.value === watch("fraud_type"))?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">제목</span>
                  <span className="font-medium truncate ml-4">{watch("title")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">피해 금액</span>
                  <span className="font-medium">
                    {Number(watch("amount_lost") || 0).toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">사건 발생일</span>
                  <span className="font-medium">{watch("incident_date")}</span>
                </div>
                {watch("suspect_name") && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">가해자</span>
                    <span className="font-medium">{watch("suspect_name")}</span>
                  </div>
                )}
                {watch("suspect_account") && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">계좌</span>
                    <span className="font-medium">
                      {watch("suspect_bank")} {watch("suspect_account")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">경찰 신고</span>
                  <span className="font-medium">
                    {watch("police_report_filed") ? "신고함" : "미신고"}
                  </span>
                </div>
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-lg p-3">
                <p className="text-sm text-gold-700">
                  접수 후 AI가 자동으로 유사 사건을 분석합니다. 동일 가해자나
                  유사 수법의 사건이 발견되면 알려드립니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              className="flex-1 h-12 bg-navy-700 hover:bg-navy-800 text-white"
              onClick={handleNext}
            >
              다음
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 h-12 bg-navy-700 hover:bg-navy-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  접수하기
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
