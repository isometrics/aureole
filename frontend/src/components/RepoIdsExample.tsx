"use client";

import { CombinedItem } from "@/types/api";
import { extractAllRepoIds, getSelectionSummary } from "@/utils/repoUtils";

interface RepoIdsExampleProps {
  selectedItems: CombinedItem[];
}

/**
 * Example component demonstrating how to use the new repo_ids functionality
 * This shows how to extract and work with repo IDs from selected repositories and organizations
 */
export default function RepoIdsExample({ selectedItems }: RepoIdsExampleProps) {
  const allRepoIds = extractAllRepoIds(selectedItems);
  const summary = getSelectionSummary(selectedItems);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Repo IDs Example</h3>
      
      <div className="space-y-4">
        {/* Selection Summary */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">Selection Summary</h4>
          <div className="text-sm space-y-1">
            <p>Total Items: {summary.totalItems}</p>
            <p>Repositories: {summary.repositories}</p>
            <p>Organizations: {summary.organizations}</p>
            <p>Unique Repo IDs: {summary.totalUniqueRepoIds}</p>
          </div>
        </div>

        {/* All Repo IDs */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">All Repo IDs</h4>
          {allRepoIds.length > 0 ? (
            <div className="text-sm">
              <p className="mb-2">Repo IDs: [{allRepoIds.join(', ')}]</p>
              <p className="text-gray-600">
                These are all the unique repository IDs from your selected items.
                Individual repos contribute 1 ID each, while organizations contribute
                all their member repo IDs.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No items selected</p>
          )}
        </div>

        {/* Individual Item Details */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">Item Details</h4>
          {selectedItems.length > 0 ? (
            <div className="space-y-2">
              {selectedItems.map((item, index) => (
                <div key={`${item.type}-${item.value}-${index}`} className="text-sm border-l-2 pl-2">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-gray-600">Type: {item.type}</p>
                  <p className="text-gray-600">Repo IDs: [{item.repo_ids.join(', ')}]</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No items selected</p>
          )}
        </div>

        {/* Usage Examples */}
        <div className="bg-blue-50 p-3 rounded border">
          <h4 className="font-medium mb-2">Usage Examples</h4>
          <div className="text-sm space-y-2">
            <p>
              <strong>API Call:</strong> Use <code>allRepoIds</code> to call backend APIs that expect repo IDs
            </p>
            <p>
              <strong>Filtering:</strong> Use <code>itemContainsRepoId(item, repoId)</code> to check if an item contains a specific repo
            </p>
            <p>
              <strong>Summary:</strong> Use <code>getSelectionSummary()</code> to get counts and statistics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 