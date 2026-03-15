export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      events: {
        Row: CalendarEvent
        Insert: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CalendarEvent, 'id'>>
      }
      notes: {
        Row: Note
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Note, 'id'>>
      }
      processing_queue: {
        Row: ProcessingQueueItem
        Insert: Omit<ProcessingQueueItem, 'id' | 'created_at'>
        Update: Partial<Omit<ProcessingQueueItem, 'id'>>
      }
      notification_log: {
        Row: NotificationLog
        Insert: Omit<NotificationLog, 'id' | 'created_at'>
        Update: Partial<Omit<NotificationLog, 'id'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at'>
        Update: Partial<Omit<Subscription, 'id'>>
      }
      product_image_originals: {
        Row: ProductImageOriginal
        Insert: Omit<ProductImageOriginal, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImageOriginal, 'id'>>
      }
      product_image_generations: {
        Row: ProductImageGeneration
        Insert: Omit<ProductImageGeneration, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImageGeneration, 'id'>>
      }
      product_image_feedback: {
        Row: ProductImageFeedback
        Insert: Omit<ProductImageFeedback, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImageFeedback, 'id'>>
      }
    }
  }
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'admin' | 'user'
  is_active: boolean
  phone: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  location: string | null
  start_at: string
  end_at: string | null
  all_day: boolean
  color: string
  source: 'voice' | 'text' | 'manual'
  raw_input: string | null
  notify_24h: boolean
  notify_8h: boolean
  notify_1h: boolean
  notified_24h: boolean
  notified_8h: boolean
  notified_1h: boolean
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category: string | null
  source: 'voice' | 'text' | 'manual'
  raw_input: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface ProcessingQueueItem {
  id: string
  user_id: string
  input_type: 'audio' | 'text'
  mode: 'anotacao' | 'agenda' | 'auto'
  audio_url: string | null
  text_input: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result_type: 'event' | 'note' | null
  result_id: string | null
  error_message: string | null
  retry_count: number
  created_at: string
  processed_at: string | null
}

export interface NotificationLog {
  id: string
  user_id: string
  event_id: string | null
  channel: 'push' | 'whatsapp' | 'email'
  status: 'sent' | 'failed' | 'pending'
  sent_at: string | null
  error_message: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  theme: 'dark' | 'light' | 'purple' | 'blue'
  notification_whatsapp: boolean
  notification_email: boolean
  notification_push: boolean
  default_notify_24h: boolean
  default_notify_8h: boolean
  default_notify_1h: boolean
  push_subscription: Record<string, unknown> | null
  calendar_default_view: '1d' | '3d' | '7d' | '1m'
  language: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled'
  max_events_per_month: number
  max_notes_per_month: number
  max_audio_minutes_per_month: number
  started_at: string
  expires_at: string | null
  created_at: string
}

export interface ProductImageOriginal {
  id: string
  user_id: string
  original_file_name: string
  storage_path: string
  content_type: string
  width: number | null
  height: number | null
  created_at: string
}

export interface ProductImageGeneration {
  id: string
  original_image_id: string
  user_id: string
  style: 'CHAMATIVO' | 'CONSERVADOR'
  prompt_used: string
  openai_model: string
  status: 'pending' | 'completed' | 'failed'
  storage_path: string | null
  retry_of_generation_id: string | null
  is_liked: boolean
  is_disliked: boolean
  is_in_gallery: boolean
  error_message: string | null
  created_at: string
}

export interface ProductImageFeedback {
  id: string
  generation_id: string
  user_id: string
  feedback_type: 'LIKE' | 'DISLIKE'
  created_at: string
}
