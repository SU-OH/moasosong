import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export const signupSchema = z
  .object({
    role: z.enum(["victim", "lawyer"], {
      message: "역할을 선택해주세요",
    }),
    full_name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
    email: z.string().email("올바른 이메일을 입력해주세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    bar_number: z.string().optional(),
    law_firm: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "lawyer") {
        return !!data.bar_number && data.bar_number.length > 0;
      }
      return true;
    },
    {
      message: "변호사 등록번호를 입력해주세요",
      path: ["bar_number"],
    }
  );

export const fraudCaseSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상이어야 합니다"),
  fraud_type: z.string().min(1, "사기 유형을 선택해주세요"),
  description: z.string().min(20, "상세 설명은 20자 이상이어야 합니다"),
  amount_lost: z.number().min(1, "피해 금액을 입력해주세요"),
  incident_date: z.string().min(1, "사건 발생일을 입력해주세요"),
  suspect_name: z.string().optional(),
  suspect_contact: z.string().optional(),
  suspect_account: z.string().optional(),
  suspect_bank: z.string().optional(),
  suspect_platform: z.string().optional(),
  suspect_description: z.string().optional(),
  evidence_description: z.string().optional(),
  police_report_filed: z.boolean(),
  police_report_number: z.string().optional(),
});

export const lawyerInterestSchema = z.object({
  message: z.string().min(10, "메시지는 10자 이상이어야 합니다"),
  fee_structure: z.string().min(5, "수임료 구조를 입력해주세요"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "메시지를 입력해주세요"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type FraudCaseInput = z.infer<typeof fraudCaseSchema>;
export type LawyerInterestInput = z.infer<typeof lawyerInterestSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
