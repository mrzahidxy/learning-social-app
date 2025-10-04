<script lang="ts">

  type User = {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };

  let { user = null } = $props();

  let isDropdownOpen = $state(false);
  let profileImageSrc = $state('');

  $effect(() => {
    profileImageSrc = user?.user_metadata?.avatar_url || '/images/placeholder-avatar.svg';
  });

  function handleProfileImageError() {
    profileImageSrc = '/images/placeholder-avatar.svg';
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function closeDropdown() {
    isDropdownOpen = false;
  }



  function handleSignOut() {
    closeDropdown();
  }
</script>

<nav class="bg-white shadow-sm">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 justify-between">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 text-xl font-bold text-blue-600">
          LearningPlatform
        </a>
      </div>
      
      {#if user}
        <div class="relative flex items-center">
          <button 
            onclick={toggleDropdown}
            onblur={closeDropdown}
            class="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <img 
              class="h-8 w-8 rounded-full object-cover" 
              src={profileImageSrc}
              onerror={handleProfileImageError}
              alt="Profile" 
              width="32"
              height="32"
            />
          </button>
          
          {#if isDropdownOpen}
            <div 
              class="absolute right-0 top-10 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              tabindex="-1"
            >
              <div class="border-b border-gray-200 px-4 py-2">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
              <form method="POST" action="/signout">
                <button 
                  type="submit"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </form>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</nav>