<script setup>
import { onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import BaseFooter from "../components/layouts/footer.vue";

onMounted(() => {
  document.title = "About Us - ANTFORUM";
});

const teamMembers = [
  {
    id: 1,
    name: "Sophearom",
    role: "Project Manager",
    image: new URL("../assets/DSC_5424.JPG", import.meta.url).href,
    bio: "I'm a leader of ANT-Forum Team.",
    skills: ["Project Management", "Agile", "Architecture", "System Design"],
    accent: "purple",
    github: "PhearomDev",
    linkedin: "vathana-ant",
    email: "phearom@antforum.io",
  },
  {
    id: 2,
    name: "Vathana",
    role: "Frontend Developer & Hosting Server",
    image: new URL("../assets/DSC_5427.JPG", import.meta.url).href,
    bio: "I'm a member of ANT-Forum ANT.",
    skills: ["Node.js", "Vue.js", "MySQL", "Hosting Server", "APIs"],
    accent: "pink",
    github: "Asycn2006",
    linkedin: "vathana-ant",
    email: "vongvathana18@gmail.com",
  },
  {
    id: 3,
    name: "Sopanha",
    role: "Frontend Developer",
    image: new URL("../assets/DSC_5482.JPG", import.meta.url).href,
    bio: "I'm a member of ANT-Forum ANT.",
    skills: ["Vue.js", "JavaScript", "Node.js", "Express", "Vue.js", "MySQL"],
    accent: "cyan",
    github: "V-Sopanha",
    linkedin: "zin-ant",
    email: "panha@antforum.io",
  },
  {
    id: 4,
    name: "Khikhe",
    role: "Backend Developer & DB",
    image: new URL("../assets/DSC_5480.JPG", import.meta.url).href,
    bio: "I'm a member of ANT-Forum ANT.",
    skills: ["PostgreSQL", "Node.js", "SQL Tuning", "Git", "APIs"],
    accent: "emerald",
    github: "khikhetun168",
    linkedin: "panha-ant",
    email: "khikhe@antforum.io",
  },
  {
    id: 5,
    name: "Yeanlang",
    role: "Backend Developer",
    image: new URL("../assets/DSC_5433.JPG", import.meta.url).href,
    bio: "I'm a member of ANT-Forum ANT.",
    skills: ["Jest", "Cypress", "SecOps", "CI/CD", "Testing"],
    accent: "rose",
    github: "songhai-yeanlang",
    linkedin: "sopanha-ant",
    email: "yeanlang@antforum.io",
  },
];

const stats = [
  { value: "5+", label: "Core Developers" },
  { value: "24/7", label: "Collaboration" },
];
</script>

<template>
  <Navbar />

  <main class="about-us-layout min-vh-100 py-5">
    <div class="container">
      <section
        class="about-hero text-center mb-5 p-5 rounded-5 shadow-sm position-relative overflow-hidden"
      >
        <!-- Floating shapes -->
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>

        <div class="position-relative z-1 py-4">
          <span
            class="badge bg-purple-subtle text-purple mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase"
            style="font-size: 0.75rem; letter-spacing: 1.5px"
          >
            Meet The Creators
          </span>
          <h1 class="fw-black mb-3 text-gradient-title">ANT Forum</h1>
          <p class="text-muted fs-5 mb-0 mx-auto text-lead px-5">
            ANT-Forum – វេទិកាពហុបំណងសម្រាប់បង្ហាញស្នាដៃឌីជីថល (Digital
            Portfolio) បង្កើតសហគមន៍សួរ-ឆ្លើយចែករំលែកចំណេះដឹង (Q&A Community) និង
            ជាប្រភពនៃអត្ថបទបច្ចេកវិទ្យា (Tech Blog Post) សម្រាប់សិស្សានុសិស្ស
            និងអតីតសិស្សនៃសាលា ANT ទាំងអស់។
          </p>
        </div>
      </section>
      <section class="mission-section mb-5">
        <div class="row g-4">
          <div class="col-lg-8">
            <div
              class="card mission-card border-0 shadow-sm rounded-4 p-4 h-100"
            >
              <span class="section-label mb-2"
                ><i class="bi bi-compass"></i> Our Vision</span
              >
              <h3 class="fw-bold mb-3 themed-text">
                មូលហេតុ និងគោលបំណង (Reason & Purpose)
              </h3>
              <div
                class="d-flex flex-column gap-3 text-muted"
                style="font-size: 0.93rem; line-height: 1.6"
              >
                <div>
                  <strong class="text-purple fw-bold"
                    >Portfolio Building (ការកសាងប្រវត្តិរូបឌីជីថល):</strong
                  >
                  <span>
                    បង្កើតកន្លែងផ្ទុកកូដ និងបង្ហាញស្នាដៃគម្រោង (Projects)
                    របស់សិស្សដែលធ្លាប់បានធ្វើកន្លងមកឱ្យមានសណ្តាប់ធ្នាប់
                    ដើម្បីងាយស្រួលបង្ហាញទៅកាន់ក្រុមហ៊ុននៅពេលដាក់ពាក្យរកការងារធ្វើ។</span
                  >
                </div>
                <div>
                  <strong class="text-purple fw-bold"
                    >Knowledge Exchange (ការផ្លាស់ប្តូរចំណេះដឹង):</strong
                  >

                  <span>
                    កសាងសហគមន៍អនឡាញមួយដែលសិស្សានុសិស្សគ្រប់កម្រិតអាចសួរទីតាំង
                    Error របស់កូដ ចែករំលែកបទពិសោធន៍
                    និងជួយដោះស្រាយបញ្ហាបច្ចេកទេសឱ្យគ្នាទៅវិញទៅមកដោយភាពស្និទ្ធស្នាល។</span
                  >
                </div>
                <div>
                  <strong class="text-purple fw-bold"
                    >Tech Blog Post (អត្ថបទបច្ចេកវិទ្យា):</strong
                  >
                  <span>
                    ផ្តោតលើការផ្តល់ប្រភពឯកសាររៀនសូត្របន្ថែម គន្លឹះខ្លីៗ (Tech
                    Tips) និងព័ត៌មានថ្មីៗពីសាលា
                    តាមរយៈអត្ថបទដែលរៀបរៀងដោយអ្នកជំនាញ និង Admin
                    ដើម្បីបណ្តុះទម្លាប់អាន និងស្រាវជ្រាវ។</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="stats-container">
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="card stat-card border-0 shadow-sm rounded-4 p-4 text-center d-flex flex-column justify-content-center"
              >
                <h2 class="fw-black text-gradient mb-1">{{ stat.value }}</h2>
                <span class="text-muted small fw-bold">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ ACKNOWLEDGMENT ═══════════════ -->
      <section class="acknowledgment-section mb-5">
        <div
          class="card acknowledgment-card border-0 shadow-sm rounded-5 p-5 text-center position-relative overflow-hidden"
        >
          <div class="ack-overlay"></div>
          <div class="position-relative z-1">
            <div
              class="d-flex align-items-center justify-content-center gap-3 mb-4"
            >
              <i class="bi bi-award-fill text-purple fs-2"></i>
              <h2
                class="fw-bold text-purple mb-0 display-6 text-uppercase"
                style="font-family: sans-serif"
              >
                សេចក្ដីថ្លែងអំណរគុណ
              </h2>
              <i class="bi bi-award-fill text-purple fs-2"></i>
            </div>
            <p
              class="text-white fs-5 mb-5 text-lead mx-auto"
              style="
                max-width: 960px;
                line-height: 1.8;
                font-weight: 400;
                opacity: 0.95;
              "
            >
              សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅជូនចំពោះ ក្រសួងប្រៃសណីយ៍និងទូរគមនាគមន៍
              មូលនិធិ ស.អ. និងថ្នាក់បណ្តុះបណ្តាលបច្ចេកវិទ្យាអាន ANT
              ក្រុមរបស់ពួកយើងមានអារម្មណ៍សោមនស្សរីករាយដែលទទួលបាននូវអាហារូបករណ៍លើជំនាញការអភិវឌ្ឍន៍គេហទំព័រ
              អាហារូបករណ៍នេះពិតជាបានជួយសម្រាលបន្ទុកហិរញ្ញវត្ថុនៃការចាយការសិក្សាដល់ក្រុមរបស់ពួកយើងទាំងអស់គ្នាក្រុមរបស់ពួកយើងនិងប្តេជ្ញាការខិតខំប្រឹងប្រែងសិក្សាគឺដើម្បីកសាងសមត្ថភាពក៏អាចចូលរួមចំណែកសង្គមនាពេលថ្ងៃអនាគត
              ។
            </p>
            <div
              class="d-flex align-items-stretch justify-content-center gap-3 flex-wrap"
            >
              <div
                class="logo-box logo-1 col-12 col-sm-auto flex-grow-1 flex-sm-grow-0"
              >
                <img
                  src="../assets/MPTC.png"
                  alt="MPTC Logo"
                  class="sponsor-logo img-fluid"
                />
              </div>
              <div
                class="logo-box logo-2 col-12 col-sm-auto flex-grow-1 flex-sm-grow-0"
              >
                <img
                  src="../assets/CBRD Fund.png"
                  alt="CBRD Fund Logo"
                  class="sponsor-logo img-fluid"
                />
              </div>
              <div
                class="logo-box logo-2 col-12 col-sm-auto flex-grow-1 flex-sm-grow-0"
              >
                <img
                  src="../assets/ANT.png"
                  alt="ANT Logo"
                  class="sponsor-logo img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ TEAM GRID ═══════════════ -->
      <section class="team-section mb-5">
        <div class="section-header text-center mb-5">
          <span class="section-label"
            ><i class="bi bi-people-fill"></i> Core Members</span
          >
          <h2 class="fw-bold themed-text">Meet Our Developers</h2>
          <p class="text-muted">
            Hover over the cards to see skills and social channels.
          </p>
        </div>

        <div
          class="row g-4 justify-content-center row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5"
        >
          <div
            v-for="member in teamMembers"
            :key="member.id"
            class="col d-flex justify-content-center"
          >
            <div class="flip-card-container">
              <article :class="['flip-card-inner', member.accent]">
                <!-- Front Side: Image and Overlay -->
                <div
                  class="flip-card-front overflow-hidden position-relative rounded-4 border-0"
                >
                  <img
                    :src="member.image"
                    :alt="member.name"
                    class="member-img w-100 h-100 object-fit-cover img-fluid"
                  />
                  <div
                    class="member-overlay d-flex flex-column justify-content-end p-4"
                  >
                    <span
                      class="member-role text-white-50 small fw-bold text-uppercase mb-1"
                      >{{ member.role }}</span
                    >
                    <h4 class="member-name text-white fw-bold mb-0">
                      {{ member.name }}
                    </h4>
                  </div>
                </div>

                <!-- Back Side: Bio, Skills, Socials -->
                <div
                  class="flip-card-back p-4 rounded-4 d-flex flex-column justify-content-between"
                >
                  <div>
                    <span class="section-label mb-2"
                      ><i class="bi bi-person-badge"></i> Profile</span
                    >
                    <h4 class="fw-bold themed-text mb-1">{{ member.name }}</h4>
                    <span
                      class="text-muted small text-uppercase fw-bold d-block mb-3"
                      style="font-size: 0.75rem; letter-spacing: 0.5px"
                      >{{ member.role }}</span
                    >

                    <p
                      class="card-text text-muted small mb-0"
                      style="line-height: 1.5"
                    >
                      {{ member.bio }}
                    </p>
                  </div>

                  <div>
                    <!-- Skill Badges -->
                    <div class="skill-tags d-flex flex-wrap gap-1 mb-4">
                      <span
                        v-for="skill in member.skills"
                        :key="skill"
                        :class="[
                          'badge-skill',
                          `bg-${member.accent}-subtle`,
                          `text-${member.accent}`,
                        ]"
                      >
                        {{ skill }}
                      </span>
                    </div>

                    <!-- Divider -->
                    <hr class="border-light-subtle my-3" />

                    <!-- Social Links -->
                    <div
                      class="d-flex align-items-center justify-content-between"
                    >
                      <span class="text-muted small">Connect:</span>
                      <div class="social-icons d-flex gap-2">
                        <a
                          :href="`https://github.com/${member.github}`"
                          target="_blank"
                          class="social-btn"
                          title="GitHub"
                        >
                          <i class="bi bi-github"></i>
                        </a>
                        <a
                          :href="`https://linkedin.com/in/${member.linkedin}`"
                          target="_blank"
                          class="social-btn"
                          title="LinkedIn"
                        >
                          <i class="bi bi-linkedin"></i>
                        </a>
                        <a
                          :href="`mailto:${member.email}`"
                          class="social-btn"
                          title="Email"
                        >
                          <i class="bi bi-envelope-fill"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ CONCLUSION ═══════════════ -->
      <section
        class="about-hero text-center mb-5 p-5 rounded-5 shadow-sm position-relative overflow-hidden"
      >
        <!-- Floating shapes -->
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>

        <div class="position-relative z-1 py-4">
          <span
            class="badge bg-purple-subtle text-purple mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase"
            style="font-size: 0.75rem; letter-spacing: 1.5px"
          >
            Ecosystem
          </span>
          <h1 class="fw-black mb-3 text-gradient-title">
            សេចក្តីសន្និដ្ឋាន (Conclusion)
          </h1>
          <p class="text-muted fs-5 mb-0 mx-auto text-lead px-5">
            ANT-Forum មិនត្រឹមតែជាកន្លែងសម្រាប់ដោះស្រាយបញ្ហាកូដប៉ុណ្ណោះទេ
            ប៉ុន្តែវាគឺជា Ecosystem ពេញលេញមួយសម្រាប់អ្នកអភិវឌ្ឍន៍ជំនាន់ថ្មីនៅ
            ANT។ វានឹងក្លាយជា Portfolio ដ៏រស់រវើក
            ជាសហគមន៍ដែលពោរពេញដោយការចែករំលែក និងជាប្រភពចំណេះដឹងឥតចេះរីងស្ងួត
            ដែលជាសក្ខីភាពនៃភាពជោគជ័យ និងការរីកចម្រើនឥតឈប់ឈររបស់សិស្សគ្រប់រូប។
          </p>
        </div>
      </section>

      <!-- ═══════════════ CALL TO ACTION ═══════════════ -->
      <section
        class="cta-section text-center mt-5 p-5 rounded-5 border shadow-sm position-relative overflow-hidden"
      >
        <div class="cta-overlay-glow"></div>
        <div class="position-relative z-1">
          <h4 class="fw-bold mb-2 themed-text">Want to join the community?</h4>
          <p class="text-muted small mb-4 mx-auto" style="max-width: 500px">
            Join our growing list of builders posting project showcases, helping
            others solve complex bugs, and publishing articles.
          </p>
          <div class="d-flex justify-content-center gap-3">
            <router-link
              to="/forum"
              class="btn btn-primary-gradient px-4 py-2 fw-bold shadow-sm text-decoration-none"
            >
              Explore Forum
            </router-link>
            <router-link
              to="/showcase"
              class="btn btn-outline-secondary px-4 py-2 fw-bold text-decoration-none"
            >
              View Showcase
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </main>

  <BaseFooter />
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap");

.about-us-layout {
  font-family: "Kantumruy Pro", var(--font-family-base, "Inter", sans-serif);
  background:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    var(--color-bg);
  background-size: 34px 34px;
  transition: background-color var(--transition-slow);
}

.themed-text {
  color: var(--color-text);
}

/* Hero Section */
.about-hero {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    background-color var(--transition-slow),
    border-color var(--transition-slow);
}

.text-gradient-title {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-lead {
  line-height: 1.6;
}

/* Floating Glow Effects */
.hero-glow-1,
.hero-glow-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.hero-glow-1 {
  width: 250px;
  height: 250px;
  top: -50px;
  left: -50px;
  background: rgba(99, 102, 241, 0.08);
}

.hero-glow-2 {
  width: 250px;
  height: 250px;
  bottom: -50px;
  right: -50px;
  background: rgba(139, 92, 246, 0.08);
}

/* Section Labels */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.logo-1 {
  width: 600px;
  max-width: 100%;
}
.logo-2 {
  width: 210px;
  max-width: 100%;
}
/* Mission Card */
.mission-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

/* Stats Card */
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary);
}

/* Stats Container */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.stats-container .stat-card {
  flex: 1;
}

@media (max-width: 991.98px) {
  .stats-container {
    flex-direction: row;
  }
}

/* Acknowledgment Section */
.acknowledgment-card {
  background: url("https://images.unsplash.com/photo-1614850523011-8f49ffc73908?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ymx1ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D");
  background-size: cover;
  background-position: center;
  border: 1px solid var(--color-border) !important;
  position: relative;
}

.ack-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.3) 0%,
    rgba(17, 24, 39, 0.3) 100%
  );
  z-index: 0;
}

.text-purple {
  color: #a855f7 !important;
}

.logo-box,
.logo-1,
.logo-2 {
  background: white;
  padding: 16px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 200px;
}

[data-theme="dark"] .logo-box,
[data-theme="dark"] .logo-1,
[data-theme="dark"] .logo-2 {
  background: rgba(255, 255, 255, 0.95);
  border-color: transparent;
}

.sponsor-logo {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.logo-box:hover,
.logo-1:hover,
.logo-2:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}

.text-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.team-section {
  margin-bottom: 3rem !important;
  padding-bottom: 2rem;
}

/* Team Section & Flip Card Styling */
.flip-card-container {
  perspective: 1500px;
  width: 100%;
  max-width: 400px;
  height: 350px;
  margin: 0 auto;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.flip-card-container:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-lg);
}

.flip-card-front {
  background: var(--color-surface);
  z-index: 2;
  transform: rotateY(0deg);
}

.flip-card-back {
  background: var(--color-surface);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
}

.member-img {
  object-fit: cover;
  object-position: center 15%;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.flip-card-front:hover .member-img {
  transform: scale(1.04);
}

.member-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(17, 24, 39, 0.9) 0%,
    rgba(17, 24, 39, 0.2) 65%,
    transparent 100%
  );
  z-index: 3;
}

/* Card Accent border glows on hover */
.flip-card-container:hover .flip-card-inner.purple {
  border-color: var(--color-purple) !important;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.25) !important;
}
.flip-card-container:hover .flip-card-inner.indigo {
  border-color: var(--color-primary) !important;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.25) !important;
}
.flip-card-container:hover .flip-card-inner.cyan {
  border-color: var(--color-info) !important;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.25) !important;
}
.flip-card-container:hover .flip-card-inner.emerald {
  border-color: var(--color-success) !important;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25) !important;
}
.flip-card-container:hover .flip-card-inner.rose {
  border-color: var(--color-danger) !important;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.25) !important;
}

/* Skill Tags badges */
.badge-skill {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 50px;
  font-weight: 600;
}

.bg-purple-subtle {
  background-color: rgba(139, 92, 246, 0.1);
}
.text-purple {
  color: #8b5cf6;
}

.bg-indigo-subtle {
  background-color: rgba(99, 102, 241, 0.1);
}
.text-indigo {
  color: #6366f1;
}

.bg-cyan-subtle {
  background-color: rgba(14, 165, 233, 0.1);
}
.text-cyan {
  color: #0ea5e9;
}

.bg-emerald-subtle {
  background-color: rgba(16, 185, 129, 0.1);
}
.text-emerald {
  color: #10b981;
}

.bg-rose-subtle {
  background-color: rgba(239, 68, 68, 0.1);
}
.text-rose {
  color: #ef4444;
}

/* Social buttons */
.social-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.9rem;
}

.social-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* CTA Section */
.cta-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    background-color var(--transition-slow),
    border-color var(--transition-slow);
}

.btn-primary-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary-gradient:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--color-primary-light);
}

.cta-overlay-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.08),
    transparent 70%
  );
  z-index: 0;
  pointer-events: none;
}
</style>
