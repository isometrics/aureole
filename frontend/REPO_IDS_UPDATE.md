# Repo IDs Update - TypeScript Frontend

This document describes the updates made to the TypeScript frontend to support the new `repo_ids` field from the backend API.

## Overview

The backend API now returns `repo_ids` for both repositories and organizations:
- **Repositories**: `repo_ids` contains a single-element array with the repository's ID
- **Organizations**: `repo_ids` contains an array of all repository IDs that belong to that organization

## TypeScript Interface Updates

### Updated Interfaces in `src/types/api.ts`

```typescript
export interface Repository {
  label: string;
  value: number;
  type: 'repo';
  formatted_label: string;
  repo_ids: number[];      // NEW: Array containing the single repo ID
}

export interface Organization {
  label: string;
  value: string;
  type: 'org';
  formatted_label: string;
  repo_ids: number[];      // NEW: Array of all repo IDs in this organization
}

export interface CombinedItem {
  label: string;
  value: number | string;
  type: 'repo' | 'org';
  original_label: string;
  repo_ids: number[];      // NEW: Array of repo IDs (single for repos, multiple for orgs)
}

export interface DataMetadata {
  total_repositories: number;
  total_organizations: number;
  total_items: number;
  total_unique_repo_ids: number;  // NEW: Count of unique repo IDs across all items
  last_updated: string | null;
  dataset_info: {
    description: string;
    usage: string;
    recommended_client_libraries: string[];
  };
}
```

## Utility Functions

### New Utility File: `src/utils/repoUtils.ts`

```typescript
import { CombinedItem } from "@/types/api";

// Extract all unique repo IDs from selected items
export function extractAllRepoIds(selectedItems: CombinedItem[]): number[]

// Get repo IDs for a specific item
export function getRepoIdsForItem(item: CombinedItem): number[]

// Check if an item contains a specific repo ID
export function itemContainsRepoId(item: CombinedItem, repoId: number): boolean

// Get a summary of selected items with their repo counts
export function getSelectionSummary(selectedItems: CombinedItem[])
```

## Usage Examples

### 1. Extract All Repo IDs from Selected Items

```typescript
import { extractAllRepoIds } from "@/utils/repoUtils";

const selectedItems: CombinedItem[] = [
  // ... your selected items
];

const allRepoIds = extractAllRepoIds(selectedItems);
// Returns: [123, 456, 789, 101] (unique repo IDs from all selected items)
```

### 2. Get Selection Summary

```typescript
import { getSelectionSummary } from "@/utils/repoUtils";

const summary = getSelectionSummary(selectedItems);
// Returns:
// {
//   totalItems: 3,
//   repositories: 1,
//   organizations: 2,
//   totalUniqueRepoIds: 15,
//   repoIds: [123, 456, 789, ...]
// }
```

### 3. Check if Item Contains Specific Repo

```typescript
import { itemContainsRepoId } from "@/utils/repoUtils";

const hasRepo = itemContainsRepoId(item, 123);
// Returns: true if the item contains repo ID 123
```

### 4. Use in API Calls

```typescript
// Get all repo IDs for backend API calls
const repoIds = extractAllRepoIds(selectedTags);

// Call backend API with repo IDs
const response = await fetch('/api/run_tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ repo_ids: repoIds })
});
```

## Updated Components

### SearchBar Component

The `SearchBar` component now includes utility functions to demonstrate the new functionality:

```typescript
// Get all unique repo IDs from selected items
const getAllSelectedRepoIds = useCallback(() => {
  return extractAllRepoIds(selectedTags);
}, [selectedTags]);

// Get a summary of the current selection
const getCurrentSelectionSummary = useCallback(() => {
  return getSelectionSummary(selectedTags);
}, [selectedTags]);
```

### Example Component

A new example component `RepoIdsExample.tsx` demonstrates how to use the new functionality:

```typescript
import RepoIdsExample from "@/components/RepoIdsExample";

// Use in your component
<RepoIdsExample selectedItems={selectedTags} />
```

## Backward Compatibility

All existing functionality remains unchanged. The new `repo_ids` field is additive and doesn't break existing code.

## Migration Guide

1. **Update imports**: Add the new utility functions where needed
2. **Use repo_ids**: Replace manual repo ID extraction with the new utility functions
3. **Update API calls**: Use `extractAllRepoIds()` for backend API calls that expect repo IDs
4. **Add type safety**: The TypeScript interfaces now include the `repo_ids` field

## Benefits

- **Consistent Structure**: Both repos and orgs now have the same `repo_ids` field structure
- **Type Safety**: Full TypeScript support for the new field
- **Utility Functions**: Easy-to-use functions for common operations
- **Performance**: Efficient extraction of unique repo IDs
- **Maintainability**: Centralized logic for repo ID operations 