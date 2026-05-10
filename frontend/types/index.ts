// AiMedico - Global TypeScript Types

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  full_name: string
  email: string
  role: 'user' | 'admin' | 'doctor'
  preferred_language: 'en' | 'bn'
  is_active: boolean
  is_verified: boolean
  created_at?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  tokens: TokenResponse
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  preferred_language?: 'en' | 'bn'
}

// ── Prescription ──────────────────────────────────────────────────────────────

export type PrescriptionStatus = 'uploaded' | 'ocr_done' | 'ai_done' | 'failed'
export type FileType = 'image' | 'pdf' | 'unknown'

export interface Prescription {
  id: string
  user_id: string
  original_filename: string
  file_type: FileType
  file_size_bytes: number
  status: PrescriptionStatus
  raw_ocr_text?: string
  cleaned_text?: string
  ocr_confidence?: string
  ocr_engine_used?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface PrescriptionListItem {
  id: string
  original_filename: string
  file_type: FileType
  status: PrescriptionStatus
  created_at: string
}

export interface PrescriptionListResponse {
  items: PrescriptionListItem[]
  total: number
  page: number
  page_size: number
  has_next: boolean
}

export interface UploadResponse {
  id: string
  original_filename: string
  file_type: FileType
  file_size_bytes: number
  status: PrescriptionStatus
  message: string
}

// ── AI Analysis ───────────────────────────────────────────────────────────────

export type EmergencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface MedicineItem {
  name: string
  generic_name?: string
  brand_name?: string
  dosage?: string
  frequency?: string
  duration?: string
  route?: string
  timing?: string
  explanation_en?: string
  explanation_bn?: string
  side_effects?: string
  warnings?: string
  reminder_times?: string[]
}

export interface DosageItem {
  medicine: string
  dose: string
  frequency: string
  timing?: string
  notes?: string
}

export interface WarningItem {
  level: 'low' | 'medium' | 'high' | 'critical'
  message_en: string
  message_bn?: string
  keyword?: string
}

export interface TestItem {
  name: string
  purpose?: string
  explanation_en?: string
  explanation_bn?: string
  normal_range?: string
}

export interface ConditionItem {
  name: string
  explanation_en?: string
  explanation_bn?: string
}

export interface FollowUpItem {
  recommendation_en: string
  recommendation_bn?: string
  urgency?: 'routine' | 'soon' | 'urgent'
}

export interface AIAnalysis {
  medicines: MedicineItem[]
  dosage: DosageItem[]
  warnings: WarningItem[]
  tests: TestItem[]
  conditions: ConditionItem[]
  followup: FollowUpItem[]
  summary_en: string
  summary_bn: string
  emergency_level: EmergencyLevel
  emergency_keywords_found: string[]
  disclaimer_en?: string
  disclaimer_bn?: string
}

export interface AIResult {
  id: string
  prescription_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_model_used?: string
  total_tokens: number
  processing_time_ms: number
  analysis?: AIAnalysis
  emergency_level: EmergencyLevel
  error_message?: string
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiError {
  success: false
  message: string
  errors?: { field: string; message: string; type: string }[]
}

export interface ApiSuccess<T> {
  success?: true
  data?: T
}
