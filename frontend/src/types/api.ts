export interface Repository {
  label: string;           // Original repo URL
  value: number;           // Repo ID
  type: 'repo';
  formatted_label: string; // "repo: https://github.com/user/repo"
  repo_ids: number[];      // Array containing the single repo ID
}

export interface Organization {
  label: string;           // Original org name
  value: string;           // Lowercase org name
  type: 'org';
  formatted_label: string; // "org: Mozilla"
  repo_ids: number[];      // Array of all repo IDs in this organization
}

export interface CombinedItem {
  label: string;           // Formatted label with prefix
  value: number | string;  // Repo ID or org name
  type: 'repo' | 'org';
  original_label: string;  // Original label without prefix
  repo_ids: number[];      // Array of repo IDs (single for repos, multiple for orgs)
}

export interface DataResponse {
  repositories: Repository[];
  organizations: Organization[];
  all_items: CombinedItem[];
} 