export interface Document {
  id: number
  title: string
  original_filename: string
  file_extension: string
  mime_type: string
  year: number
  sector: string
  core_line: string
  document_type: string
  additional_notes: string | null
  file_path: string
  uploaded_by_user_id: number
  uploaded_at: string
}

export interface FilterOptions {
  sectors: string[]
  core_lines: string[]
  document_types: string[]
  years: number[]
}