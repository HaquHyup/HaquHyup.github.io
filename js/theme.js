document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateToggleButton(savedTheme);
  } else {
    // OS 기본 테마 감지
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.setAttribute('data-theme', 'dark');
      updateToggleButton('dark');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleButton(newTheme);

      // Giscus 테마 업데이트
      const iframe = document.querySelector('iframe.giscus-frame');
      if (iframe) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: newTheme } } },
          'https://giscus.app'
        );
      }
    });
  }

  function updateToggleButton(theme) {
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
});
