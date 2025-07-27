import { CombinedItem } from "@/types/api";

/**
 * Extract all unique repo IDs from an array of selected items
 * This function flattens the repo_ids arrays from both repositories and organizations
 * 
 * @param selectedItems - Array of selected repositories and organizations
 * @returns Array of unique repo IDs
 */
export function extractAllRepoIds(selectedItems: CombinedItem[]): number[] {
  const allRepoIds: number[] = [];
  
  for (const item of selectedItems) {
    allRepoIds.push(...item.repo_ids);
  }
  
  // Remove duplicates and return
  return [...new Set(allRepoIds)];
}

/**
 * Get repo IDs for a specific item (repository or organization)
 * 
 * @param item - A repository or organization item
 * @returns Array of repo IDs for this item
 */
export function getRepoIdsForItem(item: CombinedItem): number[] {
  return item.repo_ids;
}

/**
 * Check if an item contains a specific repo ID
 * 
 * @param item - A repository or organization item
 * @param repoId - The repo ID to check for
 * @returns True if the item contains the repo ID
 */
export function itemContainsRepoId(item: CombinedItem, repoId: number): boolean {
  return item.repo_ids.includes(repoId);
}

/**
 * Get a summary of selected items with their repo counts
 * 
 * @param selectedItems - Array of selected repositories and organizations
 * @returns Object with counts and details
 */
export function getSelectionSummary(selectedItems: CombinedItem[]) {
  const repos = selectedItems.filter(item => item.type === 'repo');
  const orgs = selectedItems.filter(item => item.type === 'org');
  const totalRepoIds = extractAllRepoIds(selectedItems);
  
  return {
    totalItems: selectedItems.length,
    repositories: repos.length,
    organizations: orgs.length,
    totalUniqueRepoIds: totalRepoIds.length,
    repoIds: totalRepoIds
  };
} 