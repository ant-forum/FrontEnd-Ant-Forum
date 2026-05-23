<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForumStore } from '../../stores/ForumStore';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'questions'
  }
});

const emit = defineEmits(['selectTab']);

const router = useRouter();
const route = useRoute();
const forumStore = useForumStore();

// Sidebar Local State
const showPromoBanner = ref(true);
const isAiDrawerOpen = ref(false);

// AI Chat Drawer State
const chatMessages = ref([
  {
    sender: 'bot',
    text: 'Hello Alex! I am your **Ant AI Assistant**. How can I help you navigate the Ant Forum ecosystem today?',
    time: 'Just now'
  }
]);
const userMessage = ref('');
const isTyping = ref(false);

// Quick Prompt Options
const quickPrompts = [
  'How do I create a new thread?',
  'What is Showcase?',
  'How do I save/bookmark posts?',
  'How do I format code snippets?'
];

// Handles sidebar item clicks
const handleItemClick = (tabId) => {
  if (tabId === 'ai-assist') {
    isAiDrawerOpen.value = true;
    return;
  }
  
  emit('selectTab', tabId);

  // If we are on another page, route back to forum home for specific actions
  if (route.path !== '/forum') {
    if (tabId === 'home') {
      router.push('/');
    } else if (tabId === 'questions' || tabId === 'saves') {
      router.push({ path: '/forum', query: { tab: tabId } });
    } else if (tabId === 'articles') {
      router.push('/blog');
    } else if (tabId === 'users') {
      router.push('/profile');
    }
  }
};

// Simulated AI Bot Responses
const getBotResponse = (input) => {
  const query = input.toLowerCase();
  if (query.includes('create') || query.includes('thread') || query.includes('post')) {
    return 'To create a new discussion:\n1. Navigate to the **Forum** page.\n2. Click the **"Create Question"** button in the header bar.\n3. Fill in the title (12+ characters), description, category, and add at least one tag.\n4. Click **"Publish Discussion"** to share it with the community!';
  }
  if (query.includes('showcase') || query.includes('project')) {
    return 'The **Showcase** section is where developers share their real-world builds. You can browse high-quality developer projects, see their stars/views, view their screenshots, and click through to live demos or GitHub codebases!';
  }
  if (query.includes('save') || query.includes('bookmark') || query.includes('saves')) {
    return 'You can save any discussion thread to review later! In the forum feed or inside a discussion details page, you can bookmark a post. Once saved, click the **"Saves"** filter in the left sidebar to view all of your bookmarked threads instantly!';
  }
  if (query.includes('format') || query.includes('code') || query.includes('markdown')) {
    return 'Our editors fully support **Markdown formatting**!\n- For inline code, use a single backtick: `\`code\``.\n- For multi-line code blocks, surround your snippet with triple backticks:\n  ```js\n  console.log("Hello Ant Forum!");\n  ```\nThis enables syntax highlighting automatically!';
  }
  return 'That is a great question! The Ant Forum is a high-performance community workspace powered by Vue 3 and modern design systems. You can browse discussions, share your showcase projects, and write blog articles!';
};

// Send Message Logic
const sendMessage = async (textToSend) => {
  const text = textToSend || userMessage.value.trim();
  if (!text) return;

  // Add User Message
  chatMessages.value.push({
    sender: 'user',
    text: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  if (!textToSend) {
    userMessage.value = '';
  }

  // Trigger Typing Indicator
  isTyping.value = true;
  
  // Smooth scroll chat to bottom
  scrollToBottom();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Add Bot Response
  chatMessages.value.push({
    sender: 'bot',
    text: getBotResponse(text),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  isTyping.value = false;
  scrollToBottom();
};

const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.ai-chat-body');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 50);
};

const closePromo = () => {
  showPromoBanner.value = false;
};
</script>

<template>
  <aside class="left-sidebar-navigation">
    <!-- Top-level navigation items -->
    <div class="sidebar-nav-section">
      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'home' }" 
        @click="handleItemClick('home')"
      >
        <i class="bi bi-house-door-fill"></i>
        <span>Home</span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'questions' }" 
        @click="handleItemClick('questions')"
      >
        <i class="bi bi-globe2"></i>
        <span>Questions</span>
      </button>

      <button 
        class="sidebar-item ai-assist-btn" 
        :class="{ active: activeTab === 'ai-assist' || isAiDrawerOpen }" 
        @click="handleItemClick('ai-assist')"
      >
        <span class="ai-sparkle-glow"></span>
        <i class="bi bi-chat-square-quote-fill"></i>
        <span>AI Assist</span>
        <span class="badge-ai-live">AI</span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'tags' }" 
        @click="handleItemClick('tags')"
      >
        <i class="bi bi-tags-fill"></i>
        <span>Tags</span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'saves' }" 
        @click="handleItemClick('saves')"
      >
        <i class="bi bi-bookmark-star-fill"></i>
        <span>Saves</span>
      </button>
    </div>

    <!-- PUBLIC Section -->
    <div class="sidebar-section-header">
      <span>PUBLIC</span>
    </div>
    
    <div class="sidebar-nav-section">
      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'challenges' }" 
        @click="handleItemClick('challenges')"
      >
        <i class="bi bi-trophy-fill text-amber"></i>
        <span>Challenges</span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'chat' }" 
        @click="handleItemClick('chat')"
      >
        <i class="bi bi-chat-dots-fill text-indigo"></i>
        <span>Chat</span>
        <span class="status-dot"></span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'articles' }" 
        @click="handleItemClick('articles')"
      >
        <i class="bi bi-newspaper text-emerald"></i>
        <span>Articles</span>
      </button>

      <button 
        class="sidebar-item" 
        :class="{ active: activeTab === 'users' }" 
        @click="handleItemClick('users')"
      >
        <i class="bi bi-people-fill text-purple"></i>
        <span>Users</span>
      </button>
    </div>

    <!-- COLLECTIVES Section -->
    <div class="sidebar-section-header d-flex align-items-center justify-content-between">
      <span>COLLECTIVES</span>
      <button class="plus-btn"><i class="bi bi-plus-lg"></i></button>
    </div>

    <div class="sidebar-nav-section collectives-section">
      <div class="collective-item">
        <i class="bi bi-patch-check-fill text-green"></i>
        <div class="collective-meta">
          <span class="name">Vue Ecosystem</span>
          <span class="sub">12k Members</span>
        </div>
      </div>

      <div class="collective-item">
        <i class="bi bi-patch-check-fill text-blue"></i>
        <div class="collective-meta">
          <span class="name">Go Masters</span>
          <span class="sub">8.4k Members</span>
        </div>
      </div>
    </div>

    <!-- Ant Internal Promotional Banner -->
    <transition name="fade">
      <div v-if="showPromoBanner" class="sidebar-promo-banner shadow-sm">
        <button class="close-promo-btn" @click="closePromo">
          <i class="bi bi-x"></i>
        </button>
        <div class="promo-header">
          <i class="bi bi-cpu-fill"></i>
          <strong>ANT INTERNAL</strong>
        </div>
        <p class="promo-text">
          Bring the best of human expertise and automated AI assistance together at work.
        </p>
        <button class="btn-promo-cta rounded-pill">
          Try for free
        </button>
      </div>
    </transition>

    <!-- TELEPORT AI CHAT PANEL -->
    <Teleport to="body">
      <transition name="slide-panel">
        <div v-if="isAiDrawerOpen" class="ai-assist-drawer-wrapper">
          <!-- Backdrop -->
          <div class="ai-drawer-backdrop" @click="isAiDrawerOpen = false"></div>
          
          <!-- Chat Panel -->
          <div class="ai-chat-panel shadow-lg">
            <!-- Header -->
            <div class="ai-chat-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="ai-avatar-glow">
                  <i class="bi bi-cpu"></i>
                </div>
                <div>
                  <h4 class="m-0 fw-black text-white">Ant AI Assistant</h4>
                  <span class="status-badge"><span class="pulse-dot"></span> Active Assist</span>
                </div>
              </div>
              <button class="close-drawer-btn" @click="isAiDrawerOpen = false">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Chat Messages Body -->
            <div class="ai-chat-body">
              <div 
                v-for="(msg, index) in chatMessages" 
                :key="index" 
                :class="['chat-bubble-row', msg.sender]"
              >
                <div class="chat-bubble">
                  <p class="m-0" v-html="msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')"></p>
                  <span class="bubble-time">{{ msg.time }}</span>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isTyping" class="chat-bubble-row bot">
                <div class="chat-bubble typing">
                  <div class="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Prompts Section -->
            <div class="ai-chat-quick-prompts">
              <span class="prompts-title">💡 Frequently Asked Questions</span>
              <div class="prompts-grid">
                <button 
                  v-for="prompt in quickPrompts" 
                  :key="prompt"
                  class="prompt-pill-btn"
                  @click="sendMessage(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </div>

            <!-- Chat Footer Input -->
            <div class="ai-chat-footer">
              <div class="chat-input-wrapper">
                <input 
                  v-model="userMessage" 
                  type="text" 
                  placeholder="Ask a question about Ant Forum..."
                  class="chat-input"
                  @keydown.enter="sendMessage()"
                />
                <button 
                  class="btn-send-chat" 
                  :disabled="!userMessage.trim()"
                  @click="sendMessage()"
                >
                  <i class="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </aside>
</template>

<style scoped>
.left-sidebar-navigation {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 88px;
  align-self: start;
  font-family: inherit;
  user-select: none;
  padding-right: 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
}

.sidebar-nav-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #5b6270;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-item i {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.sidebar-item:hover {
  background: rgba(99, 102, 241, 0.05);
  color: #4f46e5;
}

.sidebar-item:hover i {
  transform: scale(1.15);
}

.sidebar-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.06) 100%);
  color: #6366f1;
  font-weight: 700;
  box-shadow: inset 3px 0 0 #6366f1;
}

/* AI Assist glowing button styling */
.ai-assist-btn {
  overflow: hidden;
}

.ai-sparkle-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.ai-assist-btn:hover .ai-sparkle-glow {
  opacity: 1;
}

.badge-ai-live {
  font-size: 9px;
  font-weight: 800;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: auto;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(168, 85, 247, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  margin-left: auto;
  box-shadow: 0 0 8px #10b981;
}

/* Section headers */
.sidebar-section-header {
  font-size: 11px;
  font-weight: 800;
  color: #9ca3af;
  letter-spacing: 1px;
  padding: 8px 16px 4px 16px;
  margin-top: 10px;
}

.plus-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
}

.plus-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #4b5563;
}

/* Collectives */
.collectives-section {
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collective-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collective-item:hover {
  background: rgba(0,0,0,0.02);
}

.collective-item i {
  font-size: 16px;
}

.collective-meta {
  display: flex;
  flex-direction: column;
}

.collective-meta .name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.collective-meta .sub {
  font-size: 10px;
  color: #9ca3af;
}

/* Ant colors */
.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }
.text-amber { color: #f59e0b; }
.text-indigo { color: #6366f1; }
.text-emerald { color: #059669; }
.text-purple { color: #8b5cf6; }

/* Promotional Banner SO-like */
.sidebar-promo-banner {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.close-promo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 18px;
}

.close-promo-btn:hover {
  color: white;
}

.promo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c084fc;
  font-size: 12px;
  margin-bottom: 8px;
}

.promo-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin-bottom: 12px;
}

.btn-promo-cta {
  width: 100%;
  padding: 8px;
  background: white;
  border: none;
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.btn-promo-cta:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

/* AI SLIDE OUT PANEL STYLING */
.ai-assist-drawer-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.ai-drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
}

.ai-chat-panel {
  position: relative;
  width: 420px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.ai-chat-header {
  padding: 24px;
  background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ai-avatar-glow {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #c084fc, #6366f1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.status-badge {
  font-size: 10px;
  color: #a7f3d0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.close-drawer-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
}

.close-drawer-btn:hover {
  color: white;
}

/* Chat content body */
.ai-chat-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-bubble-row {
  display: flex;
  width: 100%;
}

.chat-bubble-row.bot {
  justify-content: flex-start;
}

.chat-bubble-row.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 82%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.6;
}

.bot .chat-bubble {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.user .chat-bubble {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.bubble-time {
  display: block;
  font-size: 9.5px;
  color: #9ca3af;
  margin-top: 4px;
  text-align: right;
}

.user .bubble-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Typing Indicator styling */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing-bounce 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Quick FAQ section */
.ai-chat-quick-prompts {
  padding: 16px 24px;
  background: #fdfbf7;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.prompts-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 10px;
}

.prompts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-pill-btn {
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #4b5563;
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prompt-pill-btn:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #7c3aed;
}

/* Chat bottom input */
.ai-chat-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 14px;
  padding: 4px 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.chat-input-wrapper:focus-within {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 13.5px;
  color: #1f2937;
}

.chat-input:focus {
  outline: none;
}

.btn-send-chat {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #6366f1;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-send-chat:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-send-chat:not(:disabled):hover {
  background: #4f46e5;
  transform: scale(1.03);
}

/* Transitions */
.slide-panel-enter-active, .slide-panel-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-panel-enter-from, .slide-panel-leave-to {
  opacity: 0;
}

.slide-panel-enter-from .ai-chat-panel, .slide-panel-leave-to .ai-chat-panel {
  transform: translateX(100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
