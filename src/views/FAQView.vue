<script setup>
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { ref, computed } from "vue";

const currentLanguage = ref("en");
const searchQuery = ref("");
const activeCategory = ref("all");
const openFaqIds = ref(new Set());

const translations = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about ANT Forum",
    searchPlaceholder: "Search questions...",
    noResults: "No FAQs found matching your criteria.",
    categories: {
      all: "All Questions",
      general: "General",
      account: "Account & Profile",
      projects: "Projects & Showcase",
      community: "Community Guidelines",
    },
    items: [
      {
        id: "faq-1",
        category: "general",
        question: "What is ANT Forum?",
        answer:
          "ANT Forum is a collaborative platform designed for students, developers, and creators to share projects, ask questions, write blogs, and engage in constructive discussions.",
      },
      {
        id: "faq-2",
        category: "account",
        question: "How do I create an account?",
        answer:
          "To create an account, click the Register button in the navigation bar, enter your details, and verify your email. Once verified, you will have access to all forum and showcase features.",
      },
      {
        id: "faq-3",
        category: "projects",
        question: "How do I submit a project to the Showcase?",
        answer:
          'Go to the Showcase tab, click the "Create Project" button, upload details about your project (title, link, descriptions, category, tags), and click submit. Once approved, it will be visible to all members.',
      },
      {
        id: "faq-4",
        category: "community",
        question: "How can I report inappropriate behavior or content?",
        answer:
          'Every post, project, and comment has a "Report" action button. Clicking it notifies our moderator team, who will review and take appropriate action.',
      },
      {
        id: "faq-5",
        category: "account",
        question: "How can I change my password?",
        answer:
          'You can update your password in Settings > Account Security. If you forgot your password, use the "Forgot Password" link on the login page to request a reset link via email.',
      },
      {
        id: "faq-6",
        category: "general",
        question: "Is ANT Forum free to use?",
        answer:
          "Yes! ANT Forum is completely free for students and developers to showcase projects, write posts, and engage with the community.",
      },
    ],
  },
  kh: {
    title: "សំណួរដែលសួរញឹកញាប់",
    subtitle: "ស្វែងរកចម្លើយចំពោះសំណួរទូទៅអំពី ANT Forum",
    searchPlaceholder: "ស្វែងរកសំណួរ...",
    noResults: "រកមិនឃើញសំណួរដែលត្រូវនឹងលក្ខខណ្ឌរបស់អ្នកឡើយ។",
    categories: {
      all: "សំណួរទាំងអស់",
      general: "ទូទៅ",
      account: "គណនី និងប្រវត្តិរូប",
      projects: "គម្រោង និងការបង្ហាញ",
      community: "គោលការណ៍ណែនាំសហគមន៍",
    },
    items: [
      {
        id: "faq-1",
        category: "general",
        question: "តើអ្វីទៅជា ANT Forum?",
        answer:
          "ANT Forum គឺជាវេទិកាសហការដែលត្រូវបានបង្កើតឡើងសម្រាប់សិស្ស និស្សិត អ្នកអភិវឌ្ឍន៍ និងអ្នកបង្កើតថ្មីក្នុងការចែករំលែកគម្រោង សួរសំណួរ សរសេរប្លុក និងចូលរួមក្នុងការពិភាក្សាប្រកបដោយការស្ថាបនា។",
      },
      {
        id: "faq-2",
        category: "account",
        question: "តើខ្ញុំបង្កើតគណនីដោយរបៀបណា?",
        answer:
          "ដើម្បីបង្កើតគណនី សូមចុចប៊ូតុងចុះឈ្មោះនៅលើរបាររុករក បញ្ចូលព័ត៌មានរបស់អ្នក រួចផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក។ នៅពេលផ្ទៀងផ្ទាត់រួចរាល់ អ្នកនឹងអាចប្រើប្រាស់មុខងារទាំងអស់របស់វេទិកាបាន។",
      },
      {
        id: "faq-3",
        category: "projects",
        question: "តើខ្ញុំអាចដាក់ស្នើគម្រោងទៅកាន់ទំព័រ Showcase ដោយរបៀបណា?",
        answer:
          'សូមចូលទៅកាន់ផ្ទាំង Showcase រួចចុចប៊ូតុង "បង្កើតគម្រោង" បន្ទាប់មកបំពេញព័ត៌មានលម្អិតអំពីគម្រោងរបស់អ្នក (ចំណងជើង តំណភ្ជាប់ ការពិពណ៌នា ប្រភេទ ស្លាក) រួចចុចដាក់ស្នើ។ ក្រោយពេលទទួលបានការអនុម័ត វានឹងបង្ហាញជូនសមាជិកទាំងអស់។',
      },
      {
        id: "faq-4",
        category: "community",
        question: "តើខ្ញុំអាចរាយការណ៍អំពីទង្វើ ឬមាតិកាមិនសមរម្យដោយរបៀបណា?",
        answer:
          'រាល់ការបង្ហោះ គម្រោង និងមតិយោបល់នីមួយៗ សុទ្ធតែមានប៊ូតុង "រាយការណ៍"។ ការចុចប៊ូតុងនេះនឹងជូនដំណឹងដល់ក្រុមសម្របសម្រួលរបស់យើងដើម្បីពិនិត្យ និងចាត់វិធានការសមស្រប។',
      },
      {
        id: "faq-5",
        category: "account",
        question: "តើខ្ញុំអាចប្តូរពាក្យសម្ងាត់របស់ខ្ញុំដោយរបៀបណា?",
        answer:
          'អ្នកអាចធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់របស់អ្នកនៅក្នុង ការកំណត់ > សុវត្ថិភាពគណនី។ ប្រសិនបើអ្នកភ្លេចពាក្យសម្ងាត់ សូមប្រើតំណភ្ជាប់ "ភ្លេចពាក្យសម្ងាត់" នៅលើទំព័រចូល ដើម្បីស្នើសុំតំណកំណត់ឡើងវិញតាមរយៈអ៊ីមែល។',
      },
      {
        id: "faq-6",
        category: "general",
        question: "តើ ANT Forum ប្រើប្រាស់ដោយឥតគិតថ្លៃឬទេ?",
        answer:
          "បាទ/ចាស! ANT Forum គឺឥតគិតថ្លៃទាំងស្រុងសម្រាប់សិស្ស និស្សិត និងអ្នកអភិវឌ្ឍន៍ក្នុងការបង្ហាញគម្រោង សរសេរអត្ថបទ និងចូលរួមជាមួយសហគមន៍។",
      },
    ],
  },
};

const categories = computed(() => {
  const catTrans = translations[currentLanguage.value].categories;
  return Object.keys(catTrans).map((key) => ({
    id: key,
    name: catTrans[key],
  }));
});

const filteredFaqs = computed(() => {
  const allFaqs = translations[currentLanguage.value].items;
  return allFaqs.filter((faq) => {
    const matchesCategory =
      activeCategory.value === "all" || faq.category === activeCategory.value;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

const toggleFaq = (id) => {
  if (openFaqIds.value.has(id)) {
    openFaqIds.value.delete(id);
  } else {
    openFaqIds.value.add(id);
  }
};

const isFaqOpen = (id) => openFaqIds.value.has(id);
</script>

<template>
  <div class="faq-page">
    <!-- Decorative Background Orbs -->
    <div class="orb-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <Navbar />

    <main class="container py-5 faq-container">
      <!-- Hero Header -->
      <div class="faq-hero text-center mb-5">
        <div class="hero-card">
          <div class="hero-glow"></div>
          <div class="hero-content">
            <span
              class="section-label d-inline-flex align-items-center gap-2 mb-3"
            >
              <span class="pulse-indicator"></span>
              FAQ
            </span>
            <h1 class="faq-title">{{ translations[currentLanguage].title }}</h1>
            <p class="faq-subtitle mb-4">
              {{ translations[currentLanguage].subtitle }}
            </p>

            <!-- Language Switcher Toggle -->
            <div class="lang-selector mb-4">
              <button
                class="lang-btn"
                :class="{ active: currentLanguage === 'en' }"
                @click="currentLanguage = 'en'"
              >
                English
              </button>
              <button
                class="lang-btn"
                :class="{ active: currentLanguage === 'kh' }"
                @click="currentLanguage = 'kh'"
              >
                ភាសាខ្មែរ
              </button>
            </div>

            <!-- Search input bar -->
            <div class="search-container mx-auto">
              <div class="input-group search-input-group">
                <span class="input-group-text search-icon-btn"
                  ><i class="bi bi-search"></i
                ></span>
                <input
                  type="text"
                  class="form-control search-input"
                  :placeholder="translations[currentLanguage].searchPlaceholder"
                  v-model="searchQuery"
                />
                <span
                  class="input-group-text clear-icon-btn"
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                >
                  <i class="bi bi-x-circle-fill"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-column flex-lg-row gap-4">
        <!-- Sidebar Navigation -->
        <aside class="faq-sidebar flex-shrink-0">
          <div class="category-sidebar glass-card">
            <h3 class="mb-4 d-flex align-items-center gap-2 sidebar-title">
              <i class="bi bi-tag-fill"></i>
              {{ currentLanguage === "en" ? "Categories" : "ប្រភេទសំណួរ" }}
            </h3>
            <nav>
              <ul class="nav flex-column gap-2">
                <li v-for="cat in categories" :key="cat.id" class="nav-item">
                  <button
                    @click="activeCategory = cat.id"
                    class="nav-link w-100 text-start d-flex align-items-center gap-3 transition-all"
                    :class="{ active: activeCategory === cat.id }"
                  >
                    <span
                      class="icon-badge d-flex align-items-center justify-content-center"
                    >
                      <i
                        class="bi"
                        :class="{
                          'bi-grid-fill': cat.id === 'all',
                          'bi-info-circle-fill': cat.id === 'general',
                          'bi-person-badge-fill': cat.id === 'account',
                          'bi-folder-fill': cat.id === 'projects',
                          'bi-shield-fill-exclamation': cat.id === 'community',
                        }"
                      ></i>
                    </span>
                    <span class="label-text">{{ cat.name }}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main FAQs Accordion -->
        <div class="flex-grow-1">
          <div class="faq-content-area glass-card">
            <div class="content-glow"></div>

            <div
              v-if="filteredFaqs.length > 0"
              class="faq-list d-flex flex-column gap-3"
            >
              <div
                v-for="faq in filteredFaqs"
                :key="faq.id"
                class="faq-item"
                :class="{ open: isFaqOpen(faq.id) }"
              >
                <button
                  class="faq-header w-100 d-flex justify-content-between align-items-center gap-3"
                  @click="toggleFaq(faq.id)"
                >
                  <span class="faq-question">{{ faq.question }}</span>
                  <span class="toggle-icon-box">
                    <i
                      class="bi"
                      :class="
                        isFaqOpen(faq.id) ? 'bi-chevron-up' : 'bi-chevron-down'
                      "
                    ></i>
                  </span>
                </button>
                <div
                  class="faq-body-collapse"
                  :style="{ maxHeight: isFaqOpen(faq.id) ? '500px' : '0px' }"
                >
                  <div class="faq-body-content">
                    <p class="faq-answer">{{ faq.answer }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-5">
              <i class="bi bi-search-heart text-muted display-4 mb-3"></i>
              <p class="text-muted fs-5">
                {{ translations[currentLanguage].noResults }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.faq-page {
  min-height: 100vh;
  background: var(--color-bg);
  background-image:
    linear-gradient(var(--color-border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-soft) 1px, transparent 1px);
  background-size: 34px 34px;
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.orb-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.6;
  transition: all 0.5s ease;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.15),
    transparent 70%
  );
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.12),
    transparent 70%
  );
  bottom: -80px;
  right: -50px;
}

.faq-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  padding-top: 5rem !important;
  padding-bottom: 5rem !important;
}

.hero-card {
  display: block;
  max-width: 800px;
  margin: 0 auto;
  padding: 36px 64px;
  background: var(--color-glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

@media (max-width: 576px) {
  .hero-card {
    padding: 24px;
  }
}

.hero-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    transparent 50%,
    rgba(167, 139, 250, 0.08)
  );
  pointer-events: none;
}

.section-label {
  color: var(--color-primary);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.faq-title {
  font-family: var(--font-family-display);
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 850;
  line-height: 1.1;
  margin-bottom: 12px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.faq-subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* Language selector */
.lang-selector {
  display: inline-flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 4px;
  border-radius: var(--radius-pill);
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.lang-btn {
  background: transparent;
  border: none;
  padding: 6px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  border-radius: var(--radius-pill);
  transition: all 0.2s ease;
  cursor: pointer;
}

.lang-btn:hover {
  color: var(--color-text);
}

.lang-btn.active {
  background: var(--color-primary);
  color: var(--color-text-on-primary, #ffffff);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Search bar */
.search-container {
  max-width: 500px;
}

.search-input-group {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill) !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-input-group:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.search-icon-btn,
.clear-icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
}

.clear-icon-btn {
  cursor: pointer;
}

.clear-icon-btn:hover {
  color: var(--color-danger);
}

.search-input {
  background: transparent;
  border: none;
  box-shadow: none !important;
  color: var(--color-text);
  font-size: 0.95rem;
  padding: 10px 12px;
}

/* Sidebar styling */
.faq-sidebar {
  width: 100%;
}

@media (min-width: 992px) {
  .faq-sidebar {
    width: 300px;
    position: sticky;
    top: 100px;
    height: fit-content;
    align-self: flex-start;
  }
}

.glass-card {
  padding: 28px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-border);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.sidebar-title {
  color: var(--color-text);
  font-family: var(--font-family-display);
  font-size: 1.1rem;
  font-weight: 700;
}

.sidebar-title i {
  color: var(--color-primary);
}

.nav-link {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
  transform: translateX(4px);
}

.nav-link.active {
  background: var(--color-primary-light);
  border-color: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
}

.icon-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.nav-link.active .icon-badge {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-purple)
  );
  color: white;
}

/* Accordion FAQs styling */
.faq-content-area {
  position: relative;
  overflow: hidden;
  padding: 40px !important;
}

@media (max-width: 576px) {
  .faq-content-area {
    padding: 24px !important;
  }
}

.content-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), transparent);
  pointer-events: none;
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-item:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: var(--shadow-sm);
}

.faq-item.open {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: var(--shadow-md);
}

.faq-header {
  background: transparent;
  border: none;
  padding: 20px 24px;
  text-align: left;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-header:hover {
  color: var(--color-primary);
}

.toggle-icon-box {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border-soft);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.faq-item.open .toggle-icon-box {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.faq-body-collapse {
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-body-content {
  padding: 0 24px 24px 24px;
  border-top: 1px dashed var(--color-border);
  padding-top: 16px;
}

.faq-answer {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.65;
  font-size: 0.95rem;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  }
  50% {
    box-shadow:
      0 0 0 8px rgba(99, 102, 241, 0.05),
      0 0 15px rgba(99, 102, 241, 0.2);
  }
}
</style>
