export type Language = 
  | 'All' 
  | 'Tamil' 
  | 'Malayalam' 
  | 'Hindi' 
  | 'Telugu' 
  | 'Kannada' 
  | 'Bengali' 
  | 'Punjabi' 
  | 'Gujarati' 
  | 'Marathi' 
  | 'Bhojpuri'
  | 'Odia'
  | 'English' 
  | 'Spanish'
  | 'Arabic'
  | 'French'
  | 'German'
  | 'Russian'
  | 'Portuguese'
  | 'Italian'
  | 'Chinese'
  | 'Japanese'
  | 'Turkish'
  | 'Other'
  | string;

export type Category = 
  | 'All'
  | 'Entertainment'
  | 'Movies'
  | 'News'
  | 'Sports'
  | 'Music'
  | 'Kids'
  | 'Animation'
  | 'Comedy'
  | 'Documentary'
  | 'Religious'
  | 'Education'
  | 'Lifestyle'
  | 'Series'
  | 'Tamil Movies' 
  | 'Tamil Comedy' 
  | 'Tamil Entertainment' 
  | 'Malayalam Movies' 
  | 'Malayalam Comedy' 
  | 'Malayalam Entertainment'
  | 'General'
  | string;

export type Country =
  | 'All'
  | 'India'
  | 'United States'
  | 'United Kingdom'
  | 'Canada'
  | 'Australia'
  | 'Germany'
  | 'France'
  | 'Spain'
  | 'Italy'
  | 'Brazil'
  | 'Russia'
  | 'China'
  | 'Turkey'
  | 'Argentina'
  | 'Mexico'
  | 'International'
  | string;

export interface Channel {
  id: string;
  name: string;
  language: string;
  category: string;
  country?: string;
  countryCode?: string;
  quality?: string;
  logo: string;
  streamUrl: string;
  alternateStreams?: string[];
  isCustom?: boolean;
  featured?: boolean;
  description?: string;
  currentProgram?: string;
  nextProgram?: string;
  programTime?: string;
  tags?: string[];
  website?: string;
  network?: string;
  watchedAt?: number;
}

export interface CreateChannelPayload {
  name: string;
  streamUrl: string;
  alternateStreams?: string[];
  category: string;
  language: string;
  country?: string;
  countryCode?: string;
  quality?: string;
  logo?: string;
  description?: string;
  currentProgram?: string;
  nextProgram?: string;
  programTime?: string;
  featured?: boolean;
  tags?: string[];
  website?: string;
  network?: string;
}

export interface WatchHistoryItem {
  channelId: string;
  timestamp: number;
}

export interface StreamQualityLevel {
  id: number;
  height: number;
  width?: number;
  bitrate: number;
  label: string;
}

// Authentication & Entry Code Types for TFLIX
export type PlanTier = 'vip' | 'premium' | 'trial' | 'standard' | 'lifetime';
export type CodeStatus = 'active' | 'used' | 'revoked' | 'expired';

export interface EntryCode {
  id: string;
  code: string;
  planTier: PlanTier;
  status: CodeStatus;
  createdAt: number;
  expiresAt: number | null;
  maxActivations: number;
  activationCount: number;
  assignedTo?: string;
  phoneOrEmail?: string;
  price: number;
  notes?: string;
}

export interface UserSession {
  token: string;
  code: string;
  planTier: PlanTier;
  expiresAt: number | null;
  assignedTo?: string;
  verifiedAt: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalCodesGenerated: number;
  activePassesCount: number;
  expiredCodesCount: number;
  revokedCodesCount: number;
  planBreakdown: Record<string, number>;
}
