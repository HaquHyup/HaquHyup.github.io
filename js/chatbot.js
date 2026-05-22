/**
 * Portfolio AI Chatbot Widget (js/chatbot.js)
 * Dual-Mode Engine: Smart Local NLP Fallback & n8n Webhook Integration
 */

(function () {
  // Default configuration fallback
  const defaultConfig = {
    webhook: {
      url: 'https://본인주소.app.n8n.cloud/webhook/chat'
    },
    branding: {
      name: 'Portfolio AI',
      welcomeText: '안녕하세요! 저에 대해 궁금한 점을 물어보세요 😊',
      responseTimeText: '잠시 후 답변드릴게요'
    },
    style: {
      primaryColor: '#5c6bc0',
      position: 'right'
    }
  };

  // Merge user configuration with defaults
  const config = window.ChatWidgetConfig 
    ? {
        webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
      }
    : defaultConfig;

  let projectsData = [];
  let isChatOpen = false;

  // Initialize Chatbot when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    loadProjectsData();
    injectChatbotUI();
    setupEventListeners();
  });

  // 1. Fetch posts.json to learn about the projects for Local mode
  async function loadProjectsData() {
    try {
      const response = await fetch('posts.json');
      if (response.ok) {
        projectsData = await response.json();
      }
    } catch (error) {
      console.warn('Chatbot: posts.json을 로드할 수 없습니다. 기본 지식 기반으로 작동합니다.', error);
    }
  }

  // 2. Dynamically Inject Chatbot HTML into the page body
  function injectChatbotUI() {
    // Check if chatbot is already added to avoid duplicates
    if (document.getElementById('portfolio-chat-launcher')) return;

    // Apply primary color configuration to CSS variables
    if (config.style && config.style.primaryColor) {
      document.documentElement.style.setProperty('--chat-primary', config.style.primaryColor);
      // Generate a gradient with a slightly darker indigo for the default style
      document.documentElement.style.setProperty(
        '--chat-primary-gradient', 
        `linear-gradient(135deg, ${config.style.primaryColor} 0%, #3f51b5 100%)`
      );
    }

    // Launcher Floating Button
    const launcherHTML = `
      <div id="portfolio-chat-launcher" class="chat-launcher" title="Portfolio AI Chatbot">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
      </div>
    `;

    // Chat Dialog Window
    const chatContainerHTML = `
      <div id="portfolio-chat-container" class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🤖</div>
            <div class="chat-title-group">
              <h4 class="chat-title">${config.branding.name}</h4>
              <p class="chat-subtitle">블로그 AI 에이전트 • Online</p>
            </div>
          </div>
          <button id="chat-close-btn" class="chat-close-btn" aria-label="Close Chat">&times;</button>
        </div>

        <!-- Chat History -->
        <div id="chat-body" class="chat-body">
          <div class="chat-message ai">
            <div class="chat-message-bubble">
              ${config.branding.welcomeText}
            </div>
            <span class="chat-message-time">${getCurrentTime()}</span>
          </div>
        </div>

        <!-- Suggestion Chips -->
        <div class="chat-chips-container">
          <span class="chat-chip" data-message="💡 대표 프로젝트 소개해줘">💡 대표 프로젝트</span>
          <span class="chat-chip" data-message="🛠 어떤 기술 스택을 쓰나요?">🛠 사용 기술</span>
          <span class="chat-chip" data-message="📬 연락은 어떻게 하나요?">📬 연락처 정보</span>
          <span class="chat-chip" data-message="스타트업 투자 분석에 대해 말해줘">📈 투자 트렌드 분석</span>
          <span class="chat-chip" data-message="인플루언서 광고 효율 분석에 대해 말해줘">📱 광고 효율 분석</span>
        </div>

        <!-- Chat Input Form -->
        <form id="chat-input-form" class="chat-footer">
          <input type="text" id="chat-input" class="chat-input" placeholder="질문을 입력하세요..." autocomplete="off" required>
          <button type="submit" class="chat-send-btn" aria-label="Send Message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', launcherHTML);
    document.body.insertAdjacentHTML('beforeend', chatContainerHTML);
  }

  // 3. Event Listeners Setup
  function setupEventListeners() {
    const launcher = document.getElementById('portfolio-chat-launcher');
    const container = document.getElementById('portfolio-chat-container');
    const closeBtn = document.getElementById('chat-close-btn');
    const form = document.getElementById('chat-input-form');
    const input = document.getElementById('chat-input');
    const chips = document.querySelectorAll('.chat-chip');

    // Toggle Chat visibility
    const toggleChat = () => {
      isChatOpen = !isChatOpen;
      launcher.classList.toggle('active', isChatOpen);
      container.classList.toggle('active', isChatOpen);
      if (isChatOpen) {
        input.focus();
        // Change icon to close (X) when active
        launcher.innerHTML = isChatOpen 
          ? `<span style="font-size: 28px; color: #ffffff; font-weight: 300;">&times;</span>` 
          : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
      } else {
        launcher.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
      }
    };

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      handleSendMessage(text);
      input.value = '';
    });

    // Chips clicks
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-message');
        handleSendMessage(text);
      });
    });
  }

  // 4. Send message handler
  async function handleSendMessage(text) {
    appendMessage(text, 'user');
    
    // Add typing indicator
    const typingId = appendTypingIndicator();
    
    // Check if we use n8n Webhook mode or local Smart Agent fallback mode
    const isWebhookConfigured = config.webhook && 
                                 config.webhook.url && 
                                 !config.webhook.url.includes('본인주소') && 
                                 config.webhook.url.startsWith('http');

    try {
      let responseText = '';
      if (isWebhookConfigured) {
        responseText = await callN8nWebhook(text);
      } else {
        // Simulate a natural thinking delay (600ms to 1000ms) for local chatbot
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        responseText = processLocalNLP(text);
      }
      
      removeTypingIndicator(typingId);
      appendMessage(responseText, 'ai');
    } catch (error) {
      console.error('Chatbot Error:', error);
      removeTypingIndicator(typingId);
      appendMessage('죄송합니다. 메시지를 처리하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 😢', 'ai');
    }
  }

  // 5. Call external n8n webhook API
  async function callN8nWebhook(text) {
    try {
      const response = await fetch(config.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          chatInput: text,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      // Try parsing as JSON first, if not fall back to plain text
      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        // Common n8n response fields: text, output, response, message, chatOutput
        return data.output || data.response || data.text || data.message || data.chatOutput || JSON.stringify(data);
      } catch (e) {
        // Response is a plain text
        return rawText || '빈 응답을 받았습니다.';
      }
    } catch (error) {
      console.error('Webhook fetch failed:', error);
      throw error;
    }
  }

  // 6. Local NLP Keyword Matcher (Knowledge Base)
  function processLocalNLP(text) {
    const query = text.toLowerCase().replace(/\s+/g, '');
    
    // Core intents & rules
    
    // A. Greeting & Welcome
    if (query.match(/^(안녕|반가|하이|hello|hi|에이전트|누구|소개)/)) {
      return `반갑습니다! 저는 **${config.branding.name}**입니다. 
      이 블로그의 프로젝트, 기술 스택, 작성자 정보에 대해 답변해 드릴 수 있어요.
      
      궁금한 점이 있다면 언제든지 편하게 질문해 주세요! 😊`;
    }

    // B. Specific Project: Startup Funding
    if (query.includes('스타트업') || query.includes('투자') || query.includes('자본') || query.includes('funding') || query.includes('startup')) {
      const proj = projectsData.find(p => p.slug === 'startup-funding-analysis');
      return `📈 **[글로벌 스타트업 투자 트렌드 분석: 누가 AI 시장을 주도하는가?]** 프로젝트에 대해 안내해 드립니다!

이 분석은 **Kaggle의 2,820건 글로벌 스타트업 투자 데이터**를 사용하여 이루어졌습니다.

• **핵심 발견**: 생성형 AI 섹터에 대한 대규모 자금 쏠림 현상을 전년 대비 **350% 성장**이라는 구체적 수치로 확인했으며, 미국과 아시아 중심의 자본 편중 현상을 다각도로 시각화했습니다.
• **사용 기술**: \`Python\`, \`pandas\`, \`matplotlib\`, \`seaborn\`
• **제안 전략**: 비기술 스타트업의 SaaS 형태 AI 결합 전략 및 글로벌 투자 유치를 위한 국가별 맞춤 피칭 전략을 제시했습니다.

👉 [분석 보고서 전체 보기](post.html?file=startup-funding-analysis.md)를 통해 세부 차트와 핵심 인사이트를 확인해 보세요!`;
    }

    // C. Specific Project: Instagram Influencer
    if (query.includes('인스타그램') || query.includes('인플루언서') || query.includes('광고') || query.includes('효율') || query.includes('instagram') || query.includes('influencer')) {
      const proj = projectsData.find(p => p.slug === 'instagram-influencer-analysis');
      return `📱 **[인스타그램 인플루언서 광고 효율 분석 (2024)]** 프로젝트에 대한 상세 정보입니다.

상위 200명의 인플루언서 마케팅 캠페인 데이터를 정밀 탐색한 프로젝트입니다.

• **핵심 발견**: 팔로워 수 기준 100만 명 이상의 메가 인플루언서에 비해, 1만~5만 명 구간의 **마이크로 인플루언서가 평균 4.2배 높은 참여율(Engagement Rate)**을 보였으며, 도달당 비용(Cost Per Reach)이 **58% 절감**된다는 수학적 진실을 도출했습니다.
• **사용 기술**: \`Python\`, \`pandas\`, \`seaborn\`
• **제안 전략**: 브랜드 카테고리에 최적화된 마이크로 인플루언서 믹스 매칭 전략과 성과 기반 보상 모델 설계안을 제안했습니다.

👉 [분석 보고서 전체 보기](post.html?file=instagram-influencer-analysis.md)에서 자세한 시각화 그래프와 비즈니스 적용 전략을 읽어보실 수 있습니다!`;
    }

    // D. All Projects / Portfolio
    if (query.includes('프로젝트') || query.includes('포트폴리오') || query.includes('분석글') || query.includes('포스트') || query.includes('작업')) {
      if (projectsData.length === 0) {
        return `현재 등록되어 있는 주요 프로젝트 목록입니다:
        
1. **글로벌 스타트업 투자 트렌드 분석** (Python, pandas, matplotlib, seaborn)
2. **인스타그램 인플루언서 광고 효율 분석** (Python, pandas, seaborn)

자세한 내용을 알고 싶으시다면 프로젝트 제목을 말씀하시거나 위에 활성화된 칩 버튼을 클릭해 주세요!`;
      }

      let response = `제가 수행하고 블로그에 정리해 놓은 주요 **데이터 분석 포트폴리오** 목록입니다:\n\n`;
      projectsData.forEach((post, index) => {
        response += `${index + 1}. **[${post.title}](post.html?file=${post.file})**\n`;
        response += `   - *요약*: ${post.summary}\n`;
        response += `   - *기술*: \`${post.techStack.join(', ')}\`\n\n`;
      });
      response += `원하시는 분석 프로젝트 제목을 클릭해 보고서 상세 페이지로 이동해 보시거나, 여기에 직접 관련 질문을 남겨보세요!`;
      return response;
    }

    // E. Tech Stack / Skills
    if (query.includes('기술') || query.includes('스택') || query.includes('파이썬') || query.includes('python') || query.includes('pandas') || query.includes('판다스') || query.includes('시각화') || query.includes('차트') || query.includes('라이브러리')) {
      return `🛠 **보유하고 있는 데이터 분석 기술 스택**입니다:

• **데이터 핸들링**: \`Python\`, \`pandas\`, \`numpy\` 라이브러리를 사용해 데이터 전처리, 결측값 처리, 이상치 정제 및 정규화를 다룹니다.
• **시각화 및 EDA**: \`matplotlib\`, \`seaborn\`을 활용하여 데이터의 분포와 상관관계를 깊이 있고 심미적으로 보여주는 차트를 제작합니다.
• **버전 관리**: \`Git\`, \`GitHub\`를 활용하여 협업 및 버전 관리를 진행합니다.

이러한 기술이 응용된 실제 결과물들을 보고 싶으시면 **'프로젝트'**라고 물어보시거나 아래 Suggestion 칩에서 추천 항목들을 눌러주세요!`;
    }

    // F. Contact / Author Info
    if (query.includes('연락') || query.includes('메일') || query.includes('이메일') || query.includes('깃허브') || query.includes('github') || query.includes('주소') || query.includes('문의') || query.includes('컨택')) {
      return `📬 **저와 연락할 수 있는 방법**입니다:

• **GitHub**: [github.com/HaquHyup/HaquHyup.github.io](https://github.com/HaquHyup/HaquHyup.github.io) (여기를 클릭하시면 전체 소스코드와 리포지토리를 살펴보실 수 있습니다.)
• **이메일**: \`jungn@example.com\` (비즈니스 제안 및 피드백은 이메일을 통해 주시면 언제든 신속하게 환영합니다.)

언제든지 질문이 있으시거나 커피챗을 원하신다면 편하게 연락해 주세요!`;
    }

    // G. Special trigger for rules checklist or guidance
    if (query.includes('도움') || query.includes('기능') || query.includes('할수있는')) {
      return `저는 다음과 같은 내용에 막힘없이 대답할 수 있습니다:
      
• 💡 **대표 분석 프로젝트 요약 및 내용** ("인스타그램 광고 분석 요약해줘")
• 🛠 **사용 가능한 기술 역량** ("주요 기술 스택이 뭔가요?")
• 📬 **작성자 주소 및 연락처** ("어떻게 연락하나요?")

원하는 문장을 직접 채팅창에 입력하시거나 아래 퀵 버튼을 누르시면 됩니다!`;
    }

    // H. Default Fallback Response
    return `질문하신 내용에 대한 답변을 준비하지 못했습니다. 😅

저는 블로그에 수록된 **데이터 분석 포트폴리오 프로젝트, 사용한 기술 스택, 연락처 정보** 등에 관해 자세히 답변할 수 있습니다. 

아래 추천 항목 중에서 궁금한 내용을 선택해 보시는 것은 어떨까요?
- **'💡 대표 프로젝트'**를 입력하면 전체 포트폴리오를 목록화해 드립니다.
- **'🛠 사용 기술'**을 입력하면 활용한 기술 역량을 보여드립니다.`;
  }

  // 7. Helper: Add message bubble to chat window
  function appendMessage(text, sender) {
    const chatBody = document.getElementById('chat-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;

    // simple markdown parser for bold (**text**), code blocks (`code`), lists (•), and links [text](url)
    let parsedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
      // links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    msgDiv.innerHTML = `
      <div class="chat-message-bubble">
        ${parsedText}
      </div>
      <span class="chat-message-time">${getCurrentTime()}</span>
    `;

    chatBody.appendChild(msgDiv);
    scrollToBottom();
  }

  // 8. Helper: Add bouncing typing indicator
  function appendTypingIndicator() {
    const chatBody = document.getElementById('chat-body');
    const indicatorId = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = indicatorId;
    div.className = 'chat-message ai chat-typing-indicator';
    div.innerHTML = `
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
    `;
    chatBody.appendChild(div);
    scrollToBottom();
    return indicatorId;
  }

  // 9. Helper: Remove typing indicator
  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // 10. Helper: Scroll to bottom of chat body
  function scrollToBottom() {
    const chatBody = document.getElementById('chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 11. Helper: Get current HH:MM time
  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${minutes}`;
  }
})();
