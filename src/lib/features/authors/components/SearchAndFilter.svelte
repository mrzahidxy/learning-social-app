<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Create event dispatcher
  const dispatch = createEventDispatcher();

  let searchTerm = $state('');
  let sortOption = $state('name-asc');

  // Event handlers
  const handleSearch = (event: Event) => {
    searchTerm = (event.target as HTMLInputElement).value;
    // Dispatch custom event for parent component
    dispatch('searchchange', { searchTerm });
  };

  const handleSort = (event: Event) => {
    sortOption = (event.target as HTMLSelectElement).value;
    // Dispatch custom event for parent component
    dispatch('sortchange', { sortOption });
  };
</script>

<div class="flex flex-col gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-md">
  <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div class="flex-1 max-w-lg">
      <label class="sr-only" for="author-search">Search authors</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg aria-hidden="true" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <input
          id="author-search"
          type="search"
          placeholder="Search by name or bio..."
          class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700" for="authors-sorter">
        Sort by:
      </label>
      <select
        id="authors-sorter"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
        value={sortOption}
        onchange={handleSort}
      >
        <option value="name-asc">Name A → Z</option>
        <option value="name-desc">Name Z → A</option>
        <option value="articles-desc">Articles (High to Low)</option>
        <option value="subscribers-desc">Subscribers (High to Low)</option>
      </select>
    </div>
  </div>
</div>