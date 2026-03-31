export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "victim" | "lawyer";

export type CaseStatus =
  | "submitted"
  | "analyzing"
  | "classified"
  | "matched"
  | "in_progress"
  | "resolved";

export type CategoryStatus = "collecting" | "published" | "assigned";

export type InterestStatus = "pending" | "accepted" | "rejected";

export type FraudType =
  | "investment"
  | "shopping"
  | "loan"
  | "romance"
  | "phishing"
  | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bar_number: string | null;
          law_firm: string | null;
          specializations: string[] | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          bar_number?: string | null;
          law_firm?: string | null;
          specializations?: string[] | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bar_number?: string | null;
          law_firm?: string | null;
          specializations?: string[] | null;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      fraud_cases: {
        Row: {
          id: string;
          victim_id: string;
          title: string;
          fraud_type: string;
          description: string;
          amount_lost: number;
          incident_date: string;
          suspect_name: string | null;
          suspect_contact: string | null;
          suspect_account: string | null;
          suspect_bank: string | null;
          suspect_platform: string | null;
          suspect_description: string | null;
          evidence_urls: string[] | null;
          evidence_description: string | null;
          police_report_filed: boolean;
          police_report_number: string | null;
          status: CaseStatus;
          ai_classification: Json | null;
          ai_summary: string | null;
          ai_fraud_pattern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          victim_id: string;
          title: string;
          fraud_type: string;
          description: string;
          amount_lost: number;
          incident_date: string;
          suspect_name?: string | null;
          suspect_contact?: string | null;
          suspect_account?: string | null;
          suspect_bank?: string | null;
          suspect_platform?: string | null;
          suspect_description?: string | null;
          evidence_urls?: string[] | null;
          evidence_description?: string | null;
          police_report_filed?: boolean;
          police_report_number?: string | null;
          status?: CaseStatus;
          ai_classification?: Json | null;
          ai_summary?: string | null;
          ai_fraud_pattern?: string | null;
        };
        Update: {
          title?: string;
          fraud_type?: string;
          description?: string;
          amount_lost?: number;
          incident_date?: string;
          suspect_name?: string | null;
          suspect_contact?: string | null;
          suspect_account?: string | null;
          suspect_bank?: string | null;
          suspect_platform?: string | null;
          suspect_description?: string | null;
          evidence_urls?: string[] | null;
          evidence_description?: string | null;
          police_report_filed?: boolean;
          police_report_number?: string | null;
          status?: CaseStatus;
          ai_classification?: Json | null;
          ai_summary?: string | null;
          ai_fraud_pattern?: string | null;
          updated_at?: string;
        };
      };
      case_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          fraud_type: string;
          fraud_pattern: string | null;
          total_cases: number;
          total_amount: number;
          status: CategoryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          fraud_type: string;
          fraud_pattern?: string | null;
          total_cases?: number;
          total_amount?: number;
          status?: CategoryStatus;
        };
        Update: {
          name?: string;
          description?: string | null;
          fraud_type?: string;
          fraud_pattern?: string | null;
          total_cases?: number;
          total_amount?: number;
          status?: CategoryStatus;
        };
      };
      case_matches: {
        Row: {
          id: string;
          case_id: string;
          category_id: string;
          similarity_score: number | null;
          match_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          category_id: string;
          similarity_score?: number | null;
          match_reason?: string | null;
        };
        Update: {
          similarity_score?: number | null;
          match_reason?: string | null;
        };
      };
      lawyer_interests: {
        Row: {
          id: string;
          lawyer_id: string;
          category_id: string;
          message: string | null;
          fee_structure: string | null;
          status: InterestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          lawyer_id: string;
          category_id: string;
          message?: string | null;
          fee_structure?: string | null;
          status?: InterestStatus;
        };
        Update: {
          message?: string | null;
          fee_structure?: string | null;
          status?: InterestStatus;
        };
      };
      messages: {
        Row: {
          id: string;
          interest_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          interest_id: string;
          sender_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
    };
  };
};
