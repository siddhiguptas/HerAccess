export type ResourceCategory =
  | 'women_hostel'
  | 'public_transport'
  | 'hospital'
  | 'pharmacy'
  | 'police_or_public_support'
  | 'women_support';

export type FreshnessLevel = 'green' | 'yellow' | 'red';
export type VerificationStatus = 'high' | 'medium' | 'conflict' | 'unverified';
export type CollectorStatus = 'healthy' | 'degraded' | 'healing' | 'failed' | 'needs_review';

export interface AttributeProvenance {
  field_name: string;
  raw_value?: string;
  normalized_value?: any;
  source_url: string;
  source_domain: string;
  evidence_text?: string;
  observed_at: string;
  collector_id?: string;
  verification_status: VerificationStatus;
  freshness: FreshnessLevel;
}

export interface EvidenceCard {
  field_name: string;
  claimed_value: any;
  evidence_quote: string;
  source_url: string;
  source_domain: string;
  observed_at: string;
  verification_status: VerificationStatus;
  freshness_level: FreshnessLevel;
  collector_id: string;
}

export interface RankingFactor {
  factor_name: string;
  label: string;
  score_contribution: number;
  matched: boolean;
}

export interface SupportChainItem {
  category: ResourceCategory;
  resource_id: number;
  name: string;
  locality?: string;
  distance_km: number;
  key_detail: string;
  source_url: string;
  is_real_data?: boolean;
  data_source_badge?: string;
}

export interface ResourceDetail {
  id: number;
  category: ResourceCategory;
  name: string;
  city: string;
  locality?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  primary_contact?: string;
  source_url?: string;
  freshness: FreshnessLevel;
  observed_at: string;
  is_real_data?: boolean;
  data_source_badge?: string;
  attributes: AttributeProvenance[];
  evidence_cards: EvidenceCard[];
  why_this_result: RankingFactor[];
  support_chain: SupportChainItem[];
  distance_km?: number;
  match_score?: number;
  has_conflicts: boolean;
}

export interface ParsedIntent {
  city: string;
  target_location?: string;
  user_type: string;
  budget_max?: number;
  distance_max_km: number;
  required_categories: ResourceCategory[];
  preferences: Record<string, any>;
  explanation: string;
}

export interface SearchResponse {
  intent: ParsedIntent;
  total_found: number;
  primary_results: ResourceDetail[];
  nearby_support_ecosystem: Record<string, ResourceDetail[]>;
  execution_time_ms: number;
}

export interface ConflictDetail {
  id: number;
  resource_id: number;
  resource_name: string;
  category: ResourceCategory;
  field_name: string;
  value_a: any;
  source_a_url: string;
  source_a_observed_at: string;
  value_b: any;
  source_b_url: string;
  source_b_observed_at: string;
  status: string;
  detected_at: string;
}

export interface ChangeEventDetail {
  id: number;
  resource_id: number;
  resource_name: string;
  category: ResourceCategory;
  field_name: string;
  old_value: any;
  new_value: any;
  change_type: 'added' | 'modified' | 'removed';
  detected_at: string;
  evidence_url?: string;
  collector_id?: string;
}

export interface CollectorHealthSummary {
  collector_id: string;
  name: string;
  category: ResourceCategory;
  source_url: string;
  status: CollectorStatus;
  last_run_at?: string;
  last_healed_at?: string;
  heal_count: number;
  records_count: number;
  validation_pass_rate: number;
  last_error?: string;
}

export interface HealthDashboardResponse {
  total_collectors: number;
  healthy_count: number;
  degraded_count: number;
  healing_count: number;
  failed_count: number;
  total_sources: number;
  total_records: number;
  overall_validation_rate: number;
  last_collection_timestamp?: string;
  collectors: CollectorHealthSummary[];
  recent_runs: any[];
  recent_healing_events: any[];
}

export interface DemoStatusResponse {
  collector_id: string;
  status: CollectorStatus;
  is_broken: boolean;
  broken_fields: string[];
  validation_pass_rate: number;
  heal_in_progress: boolean;
  last_healed_at?: string;
  same_collector_id_verified: boolean;
  message: string;
}
