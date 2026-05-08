document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      
      if (!keyword) {
        if (typeof renderPosts === 'function' && typeof appAllPosts !== 'undefined') {
          renderPosts(appAllPosts);
        }
        return;
      }

      const filtered = appAllPosts.filter(post => {
        return (post.title && post.title.toLowerCase().includes(keyword)) ||
               (post.description && post.description.toLowerCase().includes(keyword)) ||
               (post.excerpt && post.excerpt.toLowerCase().includes(keyword)) ||
               (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword)));
      });

      if (typeof renderPosts === 'function') {
        renderPosts(filtered);
      }
    });
  }
});
