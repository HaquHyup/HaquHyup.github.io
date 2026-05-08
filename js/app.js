let appAllPosts = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('posts.json을 불러올 수 없습니다.');
    appAllPosts = await response.json();
    
    renderPosts(appAllPosts);
    renderTags(appAllPosts);
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    document.getElementById('post-list').innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
  }
});

function renderPosts(posts) {
  const postList = document.getElementById('post-list');
  if (posts.length === 0) {
    postList.innerHTML = '<p>게시글이 없습니다.</p>';
    return;
  }

  postList.innerHTML = posts.map(post => `
    <article class="post-card">
      <h2><a href="post.html?file=${post.file}">${post.title}</a></h2>
      <div class="post-meta">
        <span>${post.date}</span>
        ${post.category ? `<span class="category">${post.category}</span>` : ''}
      </div>
      <p class="excerpt">${post.excerpt}</p>
      <div class="tags">
        ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderTags(posts) {
  const tagCloud = document.getElementById('tag-cloud');
  const tags = new Set();
  
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => tags.add(tag));
    }
  });

  if (tags.size === 0) {
    tagCloud.innerHTML = '<p>태그가 없습니다.</p>';
    return;
  }

  tagCloud.innerHTML = Array.from(tags).map(tag => 
    `<button class="tag-btn" onclick="filterByTag('${tag}')">#${tag}</button>`
  ).join('');
}

window.filterByTag = function(selectedTag) {
  const filtered = appAllPosts.filter(post => post.tags && post.tags.includes(selectedTag));
  renderPosts(filtered);
};

// 포트폴리오 모달 열기/닫기 로직
window.openPortfolioModal = function(portfolioId) {
  const modal = document.getElementById('portfolio-modal');
  const details = document.querySelectorAll('.portfolio-details');
  
  // 모든 상세 내용을 숨김
  details.forEach(detail => detail.style.display = 'none');
  
  // 선택한 상세 내용만 표시
  const selectedDetail = document.getElementById(portfolioId);
  if (selectedDetail) {
    selectedDetail.style.display = 'block';
  }
  
  modal.style.display = 'flex';
};

window.closePortfolioModal = function() {
  const modal = document.getElementById('portfolio-modal');
  modal.style.display = 'none';
};

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
  const modal = document.getElementById('portfolio-modal');
  if (event.target === modal) {
    closePortfolioModal();
  }
});
