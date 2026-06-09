export interface TipItem {
  type: 'good' | 'improve'
  tip: string
}

export interface Analysis {
  id: string
  resume_id: string
  overall_score: number
  ats_score: number
  ats_tips: TipItem[]
  tone_style_score: number
  tone_style_tips: TipItem[]
  content_score: number
  content_tips: TipItem[]
  structure_score: number
  structure_tips: TipItem[]
  skills_score: number
  skills_tips: TipItem[]
  created_at: string
}

export interface Resume {
  id: string
  file_path: string
  image_path?: string
  company_name: string
  job_title: string
  job_description: string
  created_at: string
  analysis?: Analysis
}

export interface ResumeSummary {
  id: string
  company_name: string
  job_title: string
  created_at: string
  overall_score?: number | null
  image_path?: string
}
