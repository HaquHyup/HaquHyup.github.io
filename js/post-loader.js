document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postFile = urlParams.get('file');

  if (!postFile) {
    document.getElementById('post-content').innerHTML = '<h2>게시글을 찾을 수 없습니다.</h2>';
    return;
  }

  try {
    const response = await fetch(`pages/${postFile}`);
    if (!response.ok) throw new Error('게시글을 불러오는데 실패했습니다.');
    
    let text = await response.text();
    
    // Front Matter 파싱 및 제거
    const frontMatterMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    let postContent = text;
    let metadata = {};

    if (frontMatterMatch) {
      postContent = frontMatterMatch[2];
      const frontMatter = frontMatterMatch[1];
      
      frontMatter.split(/\r?\n/).forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          metadata[key] = value;
        }
      });
    }

    // 제목 등 메타데이터 표시
    let htmlContent = '';
    if (metadata.title) {
      document.title = `${metadata.title} - My GitHub Blog`;
      htmlContent += `<h1>${metadata.title}</h1>`;
    }
    if (metadata.date) {
      htmlContent += `<p class="post-meta">${metadata.date}</p>`;
    }
    
    // marked.js로 마크다운 변환
    htmlContent += marked.parse(postContent);
    document.getElementById('post-content').innerHTML = htmlContent;

    // Prism.js 하이라이팅 적용
    if (window.Prism) {
      Prism.highlightAll();
    }

    // Giscus 로드
    loadGiscus();

  } catch (error) {
    document.getElementById('post-content').innerHTML = `<h2>오류: ${error.message}</h2>`;
  }
});

function loadGiscus() {
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  // TODO: Giscus 설정 페이지에서 발급받은 실제 YOUR_REPO_ID와 YOUR_CATEGORY_ID를 넣어주세요.
  script.setAttribute('data-repo', 'haquoh/haquoh.github.io');
  script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); 
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); 
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1'); 
  script.setAttribute('data-input-position', 'bottom');
  
  const currentTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  script.setAttribute('data-theme', currentTheme === 'dark' ? 'dark' : 'light');
  
  script.setAttribute('data-lang', 'ko');
  script.crossOrigin = 'anonymous';
  script.async = true;

  document.querySelector('.giscus-container').appendChild(script);
}
