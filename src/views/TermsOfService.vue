<script setup>
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";

const currentLanguage = ref("en");

const translations = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: June 2026",
    legalDocument: "LEGAL DOCUMENT",
    tableOfContents: "Table of Contents",
    sections: {
      introduction: {
        title: "Introduction",
        p1: "Welcome to ANT Forum. Please read these Terms of Service carefully before using our platform. These terms govern your access to and use of the ANT Forum website, mobile applications, and any related services provided by us.",
        p2: "By accessing or using ANT Forum, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the service.",
      },
      userAccounts: {
        title: "User Accounts",
        p1: "To use certain features of ANT Forum, you must register for an account. You agree to provide accurate, complete, and current information during registration.",
        items: [
          "You are responsible for safeguarding your account and password",
          "You must immediately notify us of any unauthorized use of your account",
          "We are not liable for any loss or damage arising from your failure to comply",
        ],
        p2: "We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms.",
      },
      userContent: {
        title: "User Content",
        p1: "Users may post, link, and otherwise make available content, including but not limited to text, images, videos, projects, and other materials. You retain ownership of your content, but you grant us a license to use, modify, and display it in connection with the service.",
        p2: "You represent and warrant that: (i) your content does not infringe any third-party rights; (ii) your content is not illegal, obscene, threatening, defamatory, or otherwise objectionable; and (iii) you have all necessary rights to grant the license herein.",
      },
      prohibitedConduct: {
        title: "Prohibited Conduct",
        items: [
          "Use the service for any illegal purpose or in violation of any local, state, national, or international law",
          "Harass, threaten, or intimidate other users",
          "Impersonate any person or entity",
          "Interfere with or disrupt the service or servers",
          "Use any automated means to access the service",
          "Collect or store personal data of other users without their explicit consent",
          "Post or transmit malware, computer viruses, or harmful code",
        ],
      },
      intellectualProperty: {
        title: "Intellectual Property",
        p1: "The ANT Forum service and its original content, features, and functionality are and will remain the exclusive property of ANT Forum and its licensors.",
        p2: "The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ANT Forum.",
      },
      termination: {
        title: "Termination",
        p1: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.",
        p2: "If you wish to terminate your account, you may simply discontinue using the service, or contact us to request account deletion.",
      },
      limitation: {
        title: "Limitation of Liability",
        p1: "In no event shall ANT Forum, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.",
      },
      changes: {
        title: "Changes",
        p1: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide notice at least 30 days' prior to any new terms taking effect.",
        p2: "By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.",
      },
    },
  },
  kh: {
    title: "លក្ខខណ្ឌសេវាកម្ម",
    lastUpdated: "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ មិថុនា ២០២៦",
    legalDocument: "ឯកសារច្បាប់",
    tableOfContents: "មាតិកា",
    sections: {
      introduction: {
        title: "សេចក្តីផ្តើម",
        p1: "សូមស្វាគមន៍មកកាន់ ANT Forum។ សូមអានលក្ខខណ្ឌសេវាកម្មទាំងនេះឱ្យបានហ្មត់ចត់ មុនពេលប្រើប្រាស់គេហទំព័ររបស់យើង។ លក្ខខណ្ឌទាំងនេះគ្រប់គ្រងលើការចូលប្រើប្រាស់ និងការប្រើប្រាស់គេហទំព័រ កម្មវិធីទូរស័ព្ទ និងសេវាកម្មពាក់ព័ន្ធនានារបស់ ANT Forum ដែលផ្តល់ដោយយើងខ្ញុំ។",
        p2: "តាមរយៈការចូលប្រើប្រាស់ ឬប្រើប្រាស់ ANT Forum អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌទាំងនេះ។ ប្រសិនបើអ្នកមិនយល់ស្របនឹងផ្នែកណាមួយនៃលក្ខខណ្ឌនេះទេ អ្នកមិនអាចចូលប្រើប្រាស់សេវាកម្មនេះបានឡើយ។",
      },
      userAccounts: {
        title: "គណនីអ្នកប្រើប្រាស់",
        p1: "ដើម្បីប្រើប្រាស់មុខងារមួយចំនួនរបស់ ANT Forum អ្នកត្រូវតែចុះឈ្មោះបង្កើតគណនី។ អ្នកយល់ព្រមផ្តល់ព័ត៌មានដែលត្រឹមត្រូវ ពេញលេញ និងបច្ចុប្បន្ន កំឡុងពេលចុះឈ្មោះ។",
        items: [
          "អ្នកមានការទទួលខុសត្រូវក្នុងការរក្សាសុវត្ថិភាពគណនី និងពាក្យសម្ងាត់របស់អ្នក",
          "អ្នកត្រូវតែជូនដំណឹងដល់យើងភ្លាមៗអំពីការប្រើប្រាស់គណនីរបស់អ្នកដោយគ្មានការអនុញ្ញាត",
          "យើងខ្ញុំមិនទទួលខុសត្រូវចំពោះការខូចខាត ឬការបាត់បង់ណាមួយដែលកើតឡើងពីការខកខានរបស់អ្នកឡើយ",
        ],
        p2: "យើងខ្ញុំរក្សាសិទ្ធិក្នុងការលុបចោល ឬផ្អាកគណនីរបស់អ្នកតាមការសម្រេចចិត្តរបស់យើង ដោយមិនបាច់ជូនដំណឹងជាមុន សម្រាប់រាល់ទង្វើដែលយើងជឿថាបំពាននឹងលក្ខខណ្ឌទាំងនេះ។",
      },
      userContent: {
        title: "មាតិកាអ្នកប្រើប្រាស់",
        p1: "អ្នកប្រើប្រាស់អាចបង្ហោះ ភ្ជាប់ទំនាក់ទំនង និងផ្តល់ជូននូវមាតិកាផ្សេងៗ រួមមានអត្ថបទ រូបភាព វីដេអូ គម្រោង និងសម្ភារៈផ្សេងៗទៀត។ អ្នកនៅតែរក្សាកម្មសិទ្ធិលើមាតិការបស់អ្នក ប៉ុន្តែអ្នកផ្តល់សិទ្ធិឱ្យយើងប្រើប្រាស់ កែប្រែ និងបង្ហាញវានៅលើសេវាកម្មរបស់យើង។",
        p2: "អ្នកធានាថា៖ (i) មាតិការបស់អ្នកមិនរំលោភសិទ្ធិភាគីទីបី; (ii) មាតិការបស់អ្នកមិនខុសច្បាប់ អសុរោះ គំរាមកំហែង បង្ខូចកេរ្តិ៍ឈ្មោះ ឬមិនអាចទទួលយកបាន; និង (iii) អ្នកមានសិទ្ធិគ្រប់គ្រាន់ក្នុងការផ្តល់អាជ្ញាប័ណ្ណនេះ។",
      },
      prohibitedConduct: {
        title: "ការប្រព្រឹត្តដែលត្រូវបានហាមឃាត់",
        items: [
          "ប្រើប្រាស់សេវាកម្មសម្រាប់គោលបំណងខុសច្បាប់ ឬបំពានច្បាប់មូលដ្ឋាន ច្បាប់ជាតិ ឬអន្តរជាតិ",
          "ធ្វើបាប គំរាមកំហែង ឬបំភិតបំភ័យអ្នកប្រើប្រាស់ដទៃ",
          "បន្លំធ្វើជាបុគ្គល ឬអង្គភាពណាមួយ",
          "ជ្រៀតជ្រែក ឬរំខានដល់សេវាកម្ម ឬម៉ាស៊ីនមេ (servers)",
          "ប្រើប្រាស់មធ្យោបាយស្វ័យប្រវត្តិណាមួយដើម្បីចូលប្រើប្រាស់សេវាកម្ម",
          "ប្រមូល ឬរក្សាទុកទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកប្រើប្រាស់ដទៃដោយគ្មានការអនុញ្ញាត",
          "បង្ហោះ ឬចម្លងមេរោគ កូដបង្កគ្រោះថ្នាក់ ឬកូដបំផ្លិចបំផ្លាញផ្សេងៗ",
        ],
      },
      intellectualProperty: {
        title: "កម្មសិទ្ធិបញ្ញា",
        p1: "សេវាកម្ម ANT Forum និងមាតិកាដើម មុខងារ និងលក្ខណៈពិសេសនានា គឺជាកម្មសិទ្ធិផ្តាច់មុខរបស់ ANT Forum និងអ្នកផ្តល់អាជ្ញាប័ណ្ណរបស់ខ្លួន។",
        p2: "សេវាកម្មនេះត្រូវបានការពារដោយច្បាប់រក្សាសិទ្ធិ ម៉ាកសញ្ញា និងច្បាប់ផ្សេងៗទៀត។ ម៉ាកសញ្ញារបស់យើងមិនអាចប្រើប្រាស់ពាក់ព័ន្ធនឹងផលិតផល ឬសេវាកម្មណាមួយដោយគ្មានការយល់ព្រមជាលាយលក្ខណ៍អក្សរជាមុនពី ANT Forum ឡើយ។",
      },
      termination: {
        title: "ការបញ្ចប់សេវាកម្ម",
        p1: "យើងអាចបញ្ចប់ ឬផ្អាកគណនីរបស់អ្នក និងរារាំងការចូលប្រើប្រាស់សេវាកម្មភ្លាមៗ ដោយមិនបាច់ជូនដំណឹងជាមុន ឬទទួលខុសត្រូវ ក្រោមការសម្រេចចិត្តរបស់យើងសម្រាប់ហេតុផលណាមួយ។",
        p2: "ប្រសិនបើអ្នកចង់បញ្ចប់គណនីរបស់អ្នក អ្នកគ្រាន់តែបញ្ឈប់ការប្រើប្រាស់សេវាកម្ម ឬទាក់ទងមកយើងដើម្បីស្នើសុំលុបគណនី។",
      },
      limitation: {
        title: "កម្រិតនៃការទទួលខុសត្រូវ",
        p1: "ទោះក្នុងកាលៈទេសៈណាក៏ដោយ ANT Forum រួមទាំងប្រធាន បុគ្គលិក ដៃគូ និងភ្នាក់ងារ មិនត្រូវទទួលខុសត្រូវចំពោះការខូចខាតដោយប្រយោល ចៃដន្យ ពិសេស ឬពិន័យណាមួយ រួមទាំងការបាត់បង់ប្រាក់ចំណេញ ទិន្នន័យ ការប្រើប្រាស់ ឬការបាត់បង់អរូបីដទៃទៀតឡើយ។",
      },
      changes: {
        title: "ការផ្លាស់ប្តូរ",
        p1: "យើងរក្សាសិទ្ធិតាមការសម្រេចចិត្តរបស់យើងក្នុងការកែប្រែ ឬជំនួសលក្ខខណ្ឌទាំងនេះនៅពេលណាក៏បាន។ ប្រសិនបើការកែប្រែមានលក្ខណៈសំខាន់ យើងនឹងផ្តល់ដំណឹងយ៉ាងហោចណាស់ ៣០ ថ្ងៃ មុនពេលលក្ខខណ្ឌថ្មីចូលជាធរមាន។",
        p2: "តាមរយៈការបន្តចូលប្រើប្រាស់ ឬប្រើប្រាស់សេវាកម្មរបស់យើង បន្ទាប់ពីការកែប្រែទាំងនោះចូលជាធរមាន អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌដែលបានកែប្រែថ្មីនោះ។",
      },
    },
  },
};

const activeSection = ref("introduction");

const tocItems = computed(() => [
  {
    id: "introduction",
    title: translations[currentLanguage.value].sections.introduction.title,
    icon: "1",
  },
  {
    id: "user-accounts",
    title: translations[currentLanguage.value].sections.userAccounts.title,
    icon: "2",
  },
  {
    id: "user-content",
    title: translations[currentLanguage.value].sections.userContent.title,
    icon: "3",
  },
  {
    id: "prohibited-conduct",
    title: translations[currentLanguage.value].sections.prohibitedConduct.title,
    icon: "4",
  },
  {
    id: "intellectual-property",
    title:
      translations[currentLanguage.value].sections.intellectualProperty.title,
    icon: "5",
  },
  {
    id: "termination",
    title: translations[currentLanguage.value].sections.termination.title,
    icon: "6",
  },
  {
    id: "limitation",
    title: translations[currentLanguage.value].sections.limitation.title,
    icon: "7",
  },
  {
    id: "changes",
    title: translations[currentLanguage.value].sections.changes.title,
    icon: "8",
  },
]);

const scrollToSection = (id) => {
  activeSection.value = id;
  const element = document.getElementById(id);
  if (element) {
    const yOffset = -140; // Offset for fixed navbar
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const handleScroll = () => {
  const scrollPosition = window.scrollY + 160; // Match active offset

  // Find the section that is currently in view
  for (let i = tocItems.value.length - 1; i >= 0; i--) {
    const item = tocItems.value[i];
    const section = document.getElementById(item.id);
    if (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (scrollPosition >= sectionTop) {
        activeSection.value = item.id;
        break;
      }
    }
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="tos-page">
    <!-- Decorative Background Orbs -->
    <div class="orb-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <Navbar />

    <main class="container py-5 tos-container">
      <div class="tos-hero text-center mb-5">
        <div class="hero-card">
          <!-- Decorative glow inside hero -->
          <div class="hero-glow"></div>
          <div class="hero-content">
            <span
              class="section-label d-inline-flex align-items-center gap-2 mb-3"
            >
              <span class="pulse-indicator"></span>
              {{ translations[currentLanguage].legalDocument }}
            </span>
            <h1 class="tos-title">{{ translations[currentLanguage].title }}</h1>
            <p class="tos-subtitle mb-4">
              {{ translations[currentLanguage].lastUpdated }}
            </p>

            <!-- Language Switcher Toggle -->
            <div class="lang-selector">
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
          </div>
        </div>
      </div>

      <div class="d-flex flex-column flex-lg-row gap-4">
        <!-- Table of Contents Sidebar -->
        <aside class="tos-sidebar flex-shrink-0">
          <div class="toc-sidebar glass-card">
            <h3 class="mb-4 d-flex align-items-center gap-2 toc-title">
              <i class="bi bi-list-ul"></i>
              {{ translations[currentLanguage].tableOfContents }}
            </h3>
            <nav>
              <ul class="nav flex-column gap-2">
                <li v-for="item in tocItems" :key="item.id" class="nav-item">
                  <button
                    @click="scrollToSection(item.id)"
                    class="nav-link w-100 text-start d-flex align-items-center gap-3 transition-all"
                    :class="{ active: activeSection === item.id }"
                  >
                    <span
                      class="icon-badge d-flex align-items-center justify-content-center"
                    >
                      {{ item.icon }}
                    </span>
                    <span class="label-text">{{ item.title }}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-grow-1">
          <div class="tos-content glass-card">
            <!-- Decorative inner gradient glow -->
            <div class="content-glow"></div>

            <section id="introduction" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">1</span>
                {{ translations[currentLanguage].sections.introduction.title }}
              </h2>
              <p class="tos-text mb-3">
                {{ translations[currentLanguage].sections.introduction.p1 }}
              </p>
              <p class="tos-text">
                {{ translations[currentLanguage].sections.introduction.p2 }}
              </p>
            </section>

            <section id="user-accounts" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">2</span>
                {{ translations[currentLanguage].sections.userAccounts.title }}
              </h2>
              <p class="tos-text mb-4">
                {{ translations[currentLanguage].sections.userAccounts.p1 }}
              </p>
              <ul class="tos-list d-flex flex-column gap-3">
                <li
                  v-for="(item, idx) in translations[currentLanguage].sections
                    .userAccounts.items"
                  :key="idx"
                  class="d-flex align-items-start gap-3"
                >
                  <i
                    class="bi flex-shrink-0 mt-1"
                    :class="{
                      'bi-shield-check text-indigo': idx === 0,
                      'bi-exclamation-triangle text-amber': idx === 1,
                      'bi-balance2 text-blue': idx === 2,
                    }"
                  ></i>
                  <span>{{ item }}</span>
                </li>
              </ul>
              <p class="tos-text mt-4">
                {{ translations[currentLanguage].sections.userAccounts.p2 }}
              </p>
            </section>

            <section id="user-content" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">3</span>
                {{ translations[currentLanguage].sections.userContent.title }}
              </h2>
              <p class="tos-text mb-4">
                {{ translations[currentLanguage].sections.userContent.p1 }}
              </p>
              <p class="tos-text">
                {{ translations[currentLanguage].sections.userContent.p2 }}
              </p>
            </section>

            <section id="prohibited-conduct" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">4</span>
                {{
                  translations[currentLanguage].sections.prohibitedConduct.title
                }}
              </h2>
              <ul class="tos-list d-flex flex-column gap-3">
                <li
                  v-for="(item, idx) in translations[currentLanguage].sections
                    .prohibitedConduct.items"
                  :key="idx"
                  class="d-flex align-items-start gap-3"
                >
                  <i
                    class="bi flex-shrink-0 mt-1"
                    :class="{
                      'bi-x-circle text-red': idx === 0,
                      'bi-hand-thumbs-down text-orange': idx === 1,
                      'bi-person-x text-pink': idx === 2,
                      'bi-bolt text-yellow': idx === 3,
                      'bi-robot text-blue': idx === 4,
                      'bi-person-lock text-cyan': idx === 5,
                      'bi-virus text-red-intense': idx === 6,
                    }"
                  ></i>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section id="intellectual-property" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">5</span>
                {{
                  translations[currentLanguage].sections.intellectualProperty
                    .title
                }}
              </h2>
              <p class="tos-text mb-4">
                {{
                  translations[currentLanguage].sections.intellectualProperty.p1
                }}
              </p>
              <p class="tos-text">
                {{
                  translations[currentLanguage].sections.intellectualProperty.p2
                }}
              </p>
            </section>

            <section id="termination" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">6</span>
                {{ translations[currentLanguage].sections.termination.title }}
              </h2>
              <p class="tos-text mb-4">
                {{ translations[currentLanguage].sections.termination.p1 }}
              </p>
              <p class="tos-text">
                {{ translations[currentLanguage].sections.termination.p2 }}
              </p>
            </section>

            <section id="limitation" class="tos-section mb-5">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">7</span>
                {{ translations[currentLanguage].sections.limitation.title }}
              </h2>
              <p class="tos-text">
                {{ translations[currentLanguage].sections.limitation.p1 }}
              </p>
            </section>

            <section id="changes" class="tos-section">
              <h2
                class="tos-section-title d-flex align-items-center gap-3 mb-4"
              >
                <span class="section-number">8</span>
                {{ translations[currentLanguage].sections.changes.title }}
              </h2>
              <p class="tos-text mb-4">
                {{ translations[currentLanguage].sections.changes.p1 }}
              </p>
              <p class="tos-text">
                {{ translations[currentLanguage].sections.changes.p2 }}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.tos-page {
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
    rgba(84, 131, 179, 0.15),
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
    rgba(84, 131, 179, 0.12),
    transparent 70%
  );
  bottom: -80px;
  right: -50px;
}

.tos-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  padding-top: 5rem !important;
  padding-bottom: 5rem !important;
}

.hero-card {
  display: inline-block;
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

.hero-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(84, 131, 179, 0.08),
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
  box-shadow: 0 0 0 5px rgba(84, 131, 179, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.tos-title {
  font-family: var(--font-family-display);
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 850;
  line-height: 1.1;
  margin-bottom: 12px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-blue) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tos-subtitle {
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
  box-shadow: 0 4px 12px rgba(84, 131, 179, 0.3);
}

/* Sidebar styling */
.tos-sidebar {
  width: 100%;
}

@media (min-width: 992px) {
  .tos-sidebar {
    width: 300px;
    position: sticky;
    top: 110px; /* Perfectly positioned below fixed header */
    height: fit-content;
    align-self: flex-start; /* Prevents stretching and enables sticky behavior */
    z-index: 100;
  }

  .toc-sidebar.glass-card {
    transform: translateZ(
      0
    ); /* Enables hardware acceleration for smooth scrolling */
    will-change: transform;
  }
}

.toc-sidebar.glass-card {
  padding: 24px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-border);
  background: var(--color-glass-bg);
  backdrop-filter: blur(24px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  position: relative;
}

.toc-title {
  color: var(--color-text);
  font-family: var(--font-family-display);
  font-size: 1.1rem;
  font-weight: 700;
}

.toc-title i {
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
  border-color: rgba(84, 131, 179, 0.15);
  color: var(--color-primary);
}

.icon-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.nav-link.active .icon-badge {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  color: white;
}

/* Content Area styling */
.tos-content {
  position: relative;
  overflow: hidden;
  padding: 40px !important;
}

@media (max-width: 576px) {
  .tos-content {
    padding: 24px !important;
  }
}

.content-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(84, 131, 179, 0.03), transparent);
  pointer-events: none;
}

.tos-section {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.tos-section:not(:last-child)::after {
  content: "";
  position: absolute;
  bottom: -24px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-border),
    transparent
  );
}

.tos-section-title {
  color: var(--color-text);
  font-family: var(--font-family-display);
  font-size: 1.4rem;
  font-weight: 750;
}

.section-number {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(84, 131, 179, 0.2);
}

.tos-text {
  color: var(--color-text-muted);
  line-height: 1.7;
  font-size: 0.975rem;
}

.tos-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

.tos-list li {
  color: var(--color-text-muted);
  transition: all 0.2s ease;
  font-size: 0.975rem;
}

.tos-list li:hover {
  color: var(--color-text);
  transform: translateX(4px);
}

.tos-list li i {
  font-size: 1.1rem;
}

/* Custom icon colors */
.text-indigo {
  color: #5483B3;
}
.text-amber {
  color: #f59e0b;
}
.text-blue {
  color: #3b82f6;
}
.text-red {
  color: #f87171;
}
.text-orange {
  color: #fb923c;
}
.text-pink {
  color: #f472b6;
}
.text-yellow {
  color: #facc15;
}

.text-cyan {
  color: #22d3ee;
}
.text-red-intense {
  color: #ef4444;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(84, 131, 179, 0.15);
  }
  50% {
    box-shadow:
      0 0 0 8px rgba(84, 131, 179, 0.05),
      0 0 15px rgba(84, 131, 179, 0.2);
  }
}
</style>
