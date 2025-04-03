export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string
          id: string
          location: string | null
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_manager_id"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_number: string
          account_type: string
          address: string | null
          balance: number
          birthdate: string | null
          business_address: string | null
          business_name: string | null
          business_registration: string | null
          created_at: string
          created_by: string | null
          email: string | null
          gender: string | null
          id: string
          id_image: string | null
          id_number: string | null
          id_type: string | null
          mother_name: string | null
          name: string
          nationality: string | null
          password: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type: string
          address?: string | null
          balance?: number
          birthdate?: string | null
          business_address?: string | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          id_image?: string | null
          id_number?: string | null
          id_type?: string | null
          mother_name?: string | null
          name: string
          nationality?: string | null
          password: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: string
          address?: string | null
          balance?: number
          birthdate?: string | null
          business_address?: string | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          id_image?: string | null
          id_number?: string | null
          id_type?: string | null
          mother_name?: string | null
          name?: string
          nationality?: string | null
          password?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          birthdate: string | null
          branch_id: string | null
          created_at: string
          email: string
          employee_id: string
          id: string
          id_image: string | null
          id_number: string | null
          mother_name: string | null
          name: string
          password: string
          permissions: Json
          phone: string | null
          role: Database["public"]["Enums"]["employee_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          employee_id: string
          id?: string
          id_image?: string | null
          id_number?: string | null
          mother_name?: string | null
          name: string
          password: string
          permissions?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          employee_id?: string
          id?: string
          id_image?: string | null
          id_number?: string | null
          mother_name?: string | null
          name?: string
          password?: string
          permissions?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_branch_id"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          currency_code: string
          currency_name: string
          id: string
          last_updated_by: string | null
          rate_to_syp: number
          updated_at: string
        }
        Insert: {
          currency_code: string
          currency_name: string
          id?: string
          last_updated_by?: string | null
          rate_to_syp: number
          updated_at?: string
        }
        Update: {
          currency_code?: string
          currency_name?: string
          id?: string
          last_updated_by?: string | null
          rate_to_syp?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          deposit_method: string | null
          destination_account_id: string | null
          external_account: string | null
          id: string
          performed_by: string
          rejection_reason: string | null
          source_account_id: string | null
          status: string
          transaction_type: string
          withdrawal_method: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deposit_method?: string | null
          destination_account_id?: string | null
          external_account?: string | null
          id?: string
          performed_by: string
          rejection_reason?: string | null
          source_account_id?: string | null
          status?: string
          transaction_type: string
          withdrawal_method?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          deposit_method?: string | null
          destination_account_id?: string | null
          external_account?: string | null
          id?: string
          performed_by?: string
          rejection_reason?: string | null
          source_account_id?: string | null
          status?: string
          transaction_type?: string
          withdrawal_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_account_id_fkey"
            columns: ["source_account_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      employee_role: "admin" | "manager" | "teller" | "customer_service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
