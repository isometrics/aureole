export interface Repository {
  label: string;           // Original repo URL
  value: number;           // Repo ID
  type: 'repo';
  formatted_label: string; // "repo: https://github.com/user/repo"
}

export interface Organization {
  label: string;           // Original org name
  value: string;           // Lowercase org name
  type: 'org';
  formatted_label: string; // "org: Mozilla"
}

export interface CombinedItem {
  label: string;           // Formatted label with prefix
  value: number | string;  // Repo ID or org name
  type: 'repo' | 'org';
  original_label: string;  // Original label without prefix
}

export interface DataMetadata {
  total_repositories: number;
  total_organizations: number;
  total_items: number;
  last_updated: string | null;
  dataset_info: {
    description: string;
    usage: string;
    recommended_client_libraries: string[];
  };
}

export interface DataResponse {
  repositories: Repository[];
  organizations: Organization[];
  all_items: CombinedItem[];
  metadata: DataMetadata;
} 