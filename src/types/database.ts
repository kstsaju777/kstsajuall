// Supabase 스키마와 동기화된 타입. supabase gen types로 자동 생성하는 것을 권장하지만,
// 보일러플레이트 1차 빌드는 수동 정의로 시작합니다. 스키마 변경 시 함께 업데이트하세요.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = "pending" | "paid" | "failed";
export type CalendarKind = "solar" | "lunar";
export type GenderKind = "male" | "female";
export type CouponDiscountKind = "fixed" | "free_pass";
export type CouponStatus = "unused" | "used";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_id: string;
  user_id: string | null;
  guest_email: string | null;
  product_id: string;
  amount: number;
  status: OrderStatus;
  toss_payment_key: string | null;
  paid_at: string | null;
  created_at: string;
  coupon_user_coupon_id: string | null;
  coupon_discount: number;
};

type CouponTypeRow = {
  id: string;
  code: string;
  name: string;
  discount_kind: CouponDiscountKind;
  amount: number;
  is_active: boolean;
  created_at: string;
};

type UserCouponRow = {
  id: string;
  user_id: string;
  coupon_type_id: string;
  status: CouponStatus;
  order_id: string | null;
  created_at: string;
  used_at: string | null;
};

type SajuInputRow = {
  id: string;
  order_id: string;
  name: string | null;
  birth_date: string;
  birth_time: string | null;
  time_unknown: boolean;
  gender: GenderKind;
  calendar: CalendarKind;
  concerns: string[];
  phone: string | null;
  created_at: string;
};

type SajuResultRow = {
  id: string;
  order_id: string;
  myeongsik: Json;
  interpretation_md: string;
  llm_provider: string;
  llm_model: string;
  created_at: string;
};

type ReviewRow = {
  id: string;
  user_id: string;
  order_id: string;
  product_id: string;
  rating: number;
  content: string;
  is_public: boolean;
  created_at: string;
};

type SajuApiCallRow = {
  id: string;
  called_at: string;
  success: boolean;
  source: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          price: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          id?: string;
          order_id: string;
          user_id?: string | null;
          guest_email?: string | null;
          product_id: string;
          amount: number;
          status?: OrderStatus;
          toss_payment_key?: string | null;
          paid_at?: string | null;
          created_at?: string;
          coupon_user_coupon_id?: string | null;
          coupon_discount?: number;
        };
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      coupon_types: {
        Row: CouponTypeRow;
        Insert: {
          id?: string;
          code: string;
          name: string;
          discount_kind?: CouponDiscountKind;
          amount?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<CouponTypeRow>;
        Relationships: [];
      };
      user_coupons: {
        Row: UserCouponRow;
        Insert: {
          id?: string;
          user_id: string;
          coupon_type_id: string;
          status?: CouponStatus;
          order_id?: string | null;
          created_at?: string;
          used_at?: string | null;
        };
        Update: Partial<UserCouponRow>;
        Relationships: [];
      };
      saju_inputs: {
        Row: SajuInputRow;
        Insert: {
          id?: string;
          order_id: string;
          name?: string | null;
          birth_date: string;
          birth_time?: string | null;
          time_unknown?: boolean;
          gender: GenderKind;
          calendar?: CalendarKind;
          concerns?: string[];
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<SajuInputRow>;
        Relationships: [];
      };
      saju_results: {
        Row: SajuResultRow;
        Insert: {
          id?: string;
          order_id: string;
          myeongsik: Json;
          interpretation_md: string;
          llm_provider: string;
          llm_model: string;
          created_at?: string;
        };
        Update: Partial<SajuResultRow>;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          product_id: string;
          rating: number;
          content: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: Partial<ReviewRow>;
        Relationships: [];
      };
      saju_api_calls: {
        Row: SajuApiCallRow;
        Insert: {
          id?: string;
          called_at?: string;
          success: boolean;
          source?: string | null;
        };
        Update: Partial<SajuApiCallRow>;
        Relationships: [];
      };
      saju_total_reviews: {
        Row: {
          id: string;
          result_id: string;
          name: string;
          gender: string | null;
          age_group: string | null;
          star: number;
          text: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          result_id: string;
          name: string;
          gender?: string | null;
          age_group?: string | null;
          star: number;
          text: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          result_id: string;
          name: string;
          gender: string | null;
          age_group: string | null;
          star: number;
          text: string;
          approved: boolean;
        }>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      merge_saju_result_content: {
        Args: { p_id: string; p_content: Json };
        Returns: Json;
      };
      claim_saju_alimtalk: {
        Args: { p_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
      calendar_kind: CalendarKind;
      gender_kind: GenderKind;
      coupon_discount_kind: CouponDiscountKind;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
