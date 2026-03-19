export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      games: {
        Row: {
          accuracy: number | null
          color: string | null
          created_at: string | null
          id: string
          opening_eco: string | null
          opening_name: string | null
          opponent_elo: number | null
          opponent_username: string | null
          pgn: string | null
          platform: string
          platform_game_id: string
          played_at: string | null
          player_elo: number | null
          result: string | null
          stockfish_eval: Json | null
          time_control: string | null
          user_id: string | null
          variant: string | null
        }
        Insert: {
          accuracy?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          opening_eco?: string | null
          opening_name?: string | null
          opponent_elo?: number | null
          opponent_username?: string | null
          pgn?: string | null
          platform: string
          platform_game_id: string
          played_at?: string | null
          player_elo?: number | null
          result?: string | null
          stockfish_eval?: Json | null
          time_control?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Update: {
          accuracy?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          opening_eco?: string | null
          opening_name?: string | null
          opponent_elo?: number | null
          opponent_username?: string | null
          pgn?: string | null
          platform?: string
          platform_game_id?: string
          played_at?: string | null
          player_elo?: number | null
          result?: string | null
          stockfish_eval?: Json | null
          time_control?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          chess_com_avatar: string | null
          chess_com_blitz_best_elo: number | null
          chess_com_blitz_draws: number | null
          chess_com_blitz_elo: number | null
          chess_com_blitz_losses: number | null
          chess_com_blitz_wins: number | null
          chess_com_bullet_best_elo: number | null
          chess_com_bullet_draws: number | null
          chess_com_bullet_elo: number | null
          chess_com_bullet_losses: number | null
          chess_com_bullet_wins: number | null
          chess_com_classical_elo: number | null
          chess_com_country: string | null
          chess_com_followers: number | null
          chess_com_joined: string | null
          chess_com_last_online: string | null
          chess_com_puzzle_rush_best: number | null
          chess_com_rapid_best_elo: number | null
          chess_com_rapid_draws: number | null
          chess_com_rapid_elo: number | null
          chess_com_rapid_losses: number | null
          chess_com_rapid_wins: number | null
          chess_com_tactics_highest: number | null
          chess_com_title: string | null
          chess_com_username: string | null
          created_at: string | null
          id: string
          last_synced_at: string | null
          lichess_bio: string | null
          lichess_blitz_elo: number | null
          lichess_blitz_games: number | null
          lichess_blitz_prog: number | null
          lichess_bullet_elo: number | null
          lichess_bullet_games: number | null
          lichess_bullet_prog: number | null
          lichess_classical_elo: number | null
          lichess_classical_games: number | null
          lichess_correspondence_elo: number | null
          lichess_country: string | null
          lichess_followers: number | null
          lichess_games_draws: number | null
          lichess_games_losses: number | null
          lichess_games_total: number | null
          lichess_games_wins: number | null
          lichess_playing_time: number | null
          lichess_puzzle_games: number | null
          lichess_puzzle_rating: number | null
          lichess_rapid_elo: number | null
          lichess_rapid_games: number | null
          lichess_rapid_prog: number | null
          lichess_title: string | null
          lichess_username: string | null
          username: string
        }
        Insert: {
          chess_com_avatar?: string | null
          chess_com_blitz_best_elo?: number | null
          chess_com_blitz_draws?: number | null
          chess_com_blitz_elo?: number | null
          chess_com_blitz_losses?: number | null
          chess_com_blitz_wins?: number | null
          chess_com_bullet_best_elo?: number | null
          chess_com_bullet_draws?: number | null
          chess_com_bullet_elo?: number | null
          chess_com_bullet_losses?: number | null
          chess_com_bullet_wins?: number | null
          chess_com_classical_elo?: number | null
          chess_com_country?: string | null
          chess_com_followers?: number | null
          chess_com_joined?: string | null
          chess_com_last_online?: string | null
          chess_com_puzzle_rush_best?: number | null
          chess_com_rapid_best_elo?: number | null
          chess_com_rapid_draws?: number | null
          chess_com_rapid_elo?: number | null
          chess_com_rapid_losses?: number | null
          chess_com_rapid_wins?: number | null
          chess_com_tactics_highest?: number | null
          chess_com_title?: string | null
          chess_com_username?: string | null
          created_at?: string | null
          id: string
          last_synced_at?: string | null
          lichess_bio?: string | null
          lichess_blitz_elo?: number | null
          lichess_blitz_games?: number | null
          lichess_blitz_prog?: number | null
          lichess_bullet_elo?: number | null
          lichess_bullet_games?: number | null
          lichess_bullet_prog?: number | null
          lichess_classical_elo?: number | null
          lichess_classical_games?: number | null
          lichess_correspondence_elo?: number | null
          lichess_country?: string | null
          lichess_followers?: number | null
          lichess_games_draws?: number | null
          lichess_games_losses?: number | null
          lichess_games_total?: number | null
          lichess_games_wins?: number | null
          lichess_playing_time?: number | null
          lichess_puzzle_games?: number | null
          lichess_puzzle_rating?: number | null
          lichess_rapid_elo?: number | null
          lichess_rapid_games?: number | null
          lichess_rapid_prog?: number | null
          lichess_title?: string | null
          lichess_username?: string | null
          username: string
        }
        Update: {
          chess_com_avatar?: string | null
          chess_com_blitz_best_elo?: number | null
          chess_com_blitz_draws?: number | null
          chess_com_blitz_elo?: number | null
          chess_com_blitz_losses?: number | null
          chess_com_blitz_wins?: number | null
          chess_com_bullet_best_elo?: number | null
          chess_com_bullet_draws?: number | null
          chess_com_bullet_elo?: number | null
          chess_com_bullet_losses?: number | null
          chess_com_bullet_wins?: number | null
          chess_com_classical_elo?: number | null
          chess_com_country?: string | null
          chess_com_followers?: number | null
          chess_com_joined?: string | null
          chess_com_last_online?: string | null
          chess_com_puzzle_rush_best?: number | null
          chess_com_rapid_best_elo?: number | null
          chess_com_rapid_draws?: number | null
          chess_com_rapid_elo?: number | null
          chess_com_rapid_losses?: number | null
          chess_com_rapid_wins?: number | null
          chess_com_tactics_highest?: number | null
          chess_com_title?: string | null
          chess_com_username?: string | null
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          lichess_bio?: string | null
          lichess_blitz_elo?: number | null
          lichess_blitz_games?: number | null
          lichess_blitz_prog?: number | null
          lichess_bullet_elo?: number | null
          lichess_bullet_games?: number | null
          lichess_bullet_prog?: number | null
          lichess_classical_elo?: number | null
          lichess_classical_games?: number | null
          lichess_correspondence_elo?: number | null
          lichess_country?: string | null
          lichess_followers?: number | null
          lichess_games_draws?: number | null
          lichess_games_losses?: number | null
          lichess_games_total?: number | null
          lichess_games_wins?: number | null
          lichess_playing_time?: number | null
          lichess_puzzle_games?: number | null
          lichess_puzzle_rating?: number | null
          lichess_rapid_elo?: number | null
          lichess_rapid_games?: number | null
          lichess_rapid_prog?: number | null
          lichess_title?: string | null
          lichess_username?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
