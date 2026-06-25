export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "teacher" | "student";
          school: string | null;
          avatar_url: string | null;
          plan: "starter" | "pro";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          role?: "teacher" | "student";
          school?: string | null;
          avatar_url?: string | null;
          plan?: "starter" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "teacher" | "student";
          school?: string | null;
          avatar_url?: string | null;
          plan?: "starter" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
      };
      presentations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string | null;
          slides: Json[];
          template: string;
          status: "draft" | "published";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          subject?: string | null;
          slides?: Json[];
          template?: string;
          status?: "draft" | "published";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subject?: string | null;
          slides?: Json[];
          template?: string;
          status?: "draft" | "published";
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          teacher_id: string;
          presentation_id: string | null;
          name: string;
          code: string;
          max_students: number;
          status: "active" | "scheduled" | "ended";
          settings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          presentation_id?: string | null;
          name: string;
          code: string;
          max_students?: number;
          status?: "active" | "scheduled" | "ended";
          settings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          presentation_id?: string | null;
          name?: string;
          code?: string;
          max_students?: number;
          status?: "active" | "scheduled" | "ended";
          settings?: Json;
          created_at?: string;
        };
      };
      room_participants: {
        Row: {
          id: string;
          room_id: string;
          student_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          student_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          student_id?: string;
          joined_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          room_id: string;
          question: string;
          options: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          question: string;
          options?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          question?: string;
          options?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          student_id: string;
          option_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          student_id: string;
          option_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          student_id?: string;
          option_index?: number;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          room_id: string;
          title: string;
          questions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          title: string;
          questions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          title?: string;
          questions?: Json;
          created_at?: string;
        };
      };
      quiz_responses: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          answers: Json;
          score: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          answers?: Json;
          score?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          student_id?: string;
          answers?: Json;
          score?: number | null;
          completed_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          is_announcement: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          content: string;
          is_announcement?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          content?: string;
          is_announcement?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
