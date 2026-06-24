<script setup>
import { ref, onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import BaseFooter from "../components/layouts/footer.vue";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const activeRole = ref("student");

onMounted(() => {
  document.title = "Help Center - ANTFORUM";
});

// Quick links
const quickLinks = [
  {
    icon: "bi-chat-text-fill",
    label: "Go to Forum",
    to: "/forum",
    color: "blue",
  },
  {
    icon: "bi-plus-circle-fill",
    label: "Create Post",
    to: "/forum/create",
    color: "blue",
  },
  {
    icon: "bi-grid-fill",
    label: "Browse Showcase",
    to: "/showcase",
    color: "emerald",
  },
  { icon: "bi-question-circle-fill", label: "FAQ", to: "/faq", color: "amber" },
];

// Stats
const stats = [
  { value: "5 min", label: "Avg. response time", icon: "bi-clock-fill" },
  { value: "94%", label: "Questions answered", icon: "bi-check-circle-fill" },
  { value: "1.2k+", label: "Active members", icon: "bi-people-fill" },
];

// Student steps – richer detail
const studentSteps = [
  {
    title: "Choose the Right Category",
    desc: "Navigate to the forum and select the category that best fits your question. Use <strong>Questions</strong> for help-seeking &amp; debugging, <strong>Showcase</strong> to share projects, and <strong>General</strong> for broad discussions. Posting in the correct category increases visibility by 60%.",
    tip: "Tip: When in doubt, use the <em>Questions</em> category.",
    icon: "bi-tag-fill",
    color: "blue",
  },
  {
    title: "Write a Specific Title",
    desc: "Your title is the first thing others read. Be explicit: instead of <em>'React doesn't work'</em>, write <em>'useEffect fires twice in React 18 StrictMode — how do I prevent it?'</em>. Specific titles attract experts and reduce back-and-forth clarification.",
    tip: "Good titles include the technology, symptom, and context.",
    icon: "bi-card-heading",
    color: "blue",
  },
  {
    title: "Describe the Problem Fully",
    desc: "Include: what you were trying to do, what happened, what you expected, and your environment (OS, browser, framework version). Attach relevant error messages or stack traces in <strong>code blocks</strong> so they are easy to read.",
    tip: "More context = faster resolution. Never skip environment details.",
    icon: "bi-info-circle-fill",
    color: "emerald",
  },
  {
    title: "Format Code with Markdown",
    desc: "Always wrap code in triple backticks followed by the language name. Raw, unformatted code is difficult to read and less likely to receive a helpful reply. ANTFORUM renders syntax highlighting automatically.",
    tip: "Press the {} button in the editor toolbar to insert a code block template.",
    icon: "bi-code-slash",
    color: "amber",
  },
  {
    title: "Add Relevant Tags",
    desc: "Tags like <code>#Vue.js</code>, <code>#Python</code>, or <code>#API</code> help developers with the right expertise discover your post quickly. Add at least 2–3 tags that describe your technology stack and topic area.",
    tip: "Use the tag autocomplete in the post editor to find existing tags.",
    icon: "bi-hash",
    color: "rose",
  },
  {
    title: "Engage with Replies",
    desc: "When someone answers, acknowledge their reply, ask follow-up questions if needed, and mark the thread as resolved once your problem is solved. This helps future members with the same issue find the correct answer instantly.",
    tip: "Mark the best answer as 'Accepted' so it appears at the top.",
    icon: "bi-reply-fill",
    color: "cyan",
  },
];

const teacherSteps = [
  {
    title: "Structure Announcements Clearly",
    desc: "Pin critical announcements (deadlines, schedule changes, assignment releases) to the top of the course category. Use clear headings, numbered lists, and bold text to highlight key dates and actions required from students.",
    tip: "Pin your most important post so it always stays visible.",
    icon: "bi-megaphone-fill",
    color: "rose",
  },
  {
    title: "Post Detailed Assignment Briefs",
    desc: "When posting an assignment or challenge, include: the objective, acceptance criteria, starter code (GitHub link), deadline, and evaluation rubric. Clear briefs reduce repeat questions and improve completion rates by 40%.",
    tip: "Include a link to any required reading or repository.",
    icon: "bi-journal-code",
    color: "indigo",
  },
  {
    title: "Drive Engagement with Prompts",
    desc: 'End each post with an open-ended discussion prompt (e.g. <em>"What was the most challenging part for you?"</em>). This encourages shy students to participate and builds a culture of collaborative learning.',
    tip: "Prompt-based posts receive 3× more replies on average.",
    icon: "bi-chat-left-text-fill",
    color: "cyan",
  },
  {
    title: "Respond Publicly, Not Privately",
    desc: "When a student sends you a direct question that other students might also have, answer it publicly in the forum thread. This benefits the whole class and reduces repeated one-on-one clarifications.",
    tip: "Public answers build a searchable knowledge base for your class.",
    icon: "bi-broadcast",
    color: "teal",
  },
  {
    title: "Recognize Outstanding Contributions",
    desc: 'Actively upvote, reply to, and highlight insightful student posts. Publicly calling out exceptional contributions by name (e.g. <em>"Great approach by @username!"</em>) motivates the whole class.',
    tip: "Recognition builds a positive classroom community culture.",
    icon: "bi-trophy-fill",
    color: "amber",
  },
  {
    title: "Moderate and Pin Solutions",
    desc: "When a correct, high-quality answer is posted, pin it or mark it as the accepted solution. This helps future students searching the thread immediately find the best resolution without reading every reply.",
    tip: "Pin the accepted reply to put it at the top of the thread.",
    icon: "bi-pin-angle-fill",
    color: "blue",
  },
];

// Do / Don't lists
const studentDos = [
  "Write a clear, specific, searchable title",
  "Include your tech stack, framework version, and OS",
  "Format all code using Markdown code blocks",
  "Attach relevant error messages and stack traces",
  "Add 2–3 relevant tags to your post",
  "Reply to those who help you and mark solutions",
];
const studentDonts = [
  "Post vague titles like 'It doesn't work'",
  "Share unformatted, raw code in plain text",
  "Skip environment details (OS, browser, version)",
  "Cross-post the same question across multiple threads",
  "Leave threads unresolved after receiving a correct answer",
];
</script>

<template>
  <div class="help-page">
    <div class="orb-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <Navbar />

    <main class="help-container">
      <div class="help-inner">
        <!-- ── HERO ─────────────────────────────────── -->
        <section
          class="help-hero glass-card text-center mb-5 position-relative overflow-hidden"
        >
          <div class="hero-glow"></div>
          <div class="position-relative z-1">
            <span
              class="section-label d-inline-flex align-items-center gap-2 mb-3"
            >
              <span class="pulse-indicator"></span>
              Help Center
            </span>
            <h1 id="help-page-title" class="help-title mb-3">
              ANTFORUM Help Center
            </h1>
            <p class="help-subtitle mb-5 mx-auto">
              Everything you need to write effective posts, get better answers,
              and contribute meaningfully to our developer community.
            </p>

            <!-- Quick Links -->
            <div class="quick-links-row">
              <router-link
                v-for="link in quickLinks"
                :key="link.to"
                :to="link.to"
                :class="['quick-link-btn', `color-${link.color}`]"
              >
                <i :class="['bi', link.icon]"></i>
                {{ link.label }}
              </router-link>
            </div>
          </div>
        </section>

        <!-- ── STATS BAR ─────────────────────────────── -->
        <div class="stats-bar glass-card mb-5">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <i :class="['bi', stat.icon, 'stat-icon']"></i>
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>

        <!-- ── ROLE TOGGLE ───────────────────────────── -->
        <div class="d-flex justify-content-center mb-5">
          <div class="role-toggle-container">
            <button
              id="toggle-student-btn"
              @click="activeRole = 'student'"
              class="btn-toggle"
              :class="{ active: activeRole === 'student' }"
            >
              <i class="bi bi-mortarboard-fill me-2"></i> Student Guide
            </button>
            <button
              id="toggle-teacher-btn"
              @click="activeRole = 'teacher'"
              class="btn-toggle"
              :class="{ active: activeRole === 'teacher' }"
            >
              <i class="bi bi-person-workspace me-2"></i> Teacher & Mentor
            </button>
          </div>
        </div>

        <!-- ── CONTENT ─────────────────────────────── -->
        <Transition name="fade-slide" mode="out-in">
          <!-- STUDENT -->
          <div v-if="activeRole === 'student'" key="student">
            <!-- Section header -->
            <div class="section-header mb-4">
              <div class="section-icon-box bg-blue-subtle text-blue">
                <i class="bi bi-mortarboard"></i>
              </div>
              <div>
                <h2 class="themed-text fw-bold mb-1">
                  Student's Posting Guide
                </h2>
                <p class="text-muted small mb-0">
                  Follow these 6 steps to get faster, more helpful responses
                  from the community.
                </p>
              </div>
            </div>

            <!-- Steps -->
            <div class="row g-4 mb-5">
              <div
                v-for="(step, idx) in studentSteps"
                :key="step.title"
                class="col-md-6"
              >
                <div :class="['step-card', `step-glow-${step.color}`]">
                  <div class="step-number">
                    {{ String(idx + 1).padStart(2, "0") }}
                  </div>
                  <div class="d-flex align-items-start gap-3">
                    <div
                      :class="[
                        'step-icon-box',
                        `bg-${step.color}-subtle`,
                        `text-${step.color}`,
                      ]"
                    >
                      <i :class="['bi', step.icon]"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="fw-bold mb-2 themed-text">{{ step.title }}</h5>
                      <p
                        class="text-muted small mb-2"
                        v-html="sanitizeHtml(step.desc)"
                      ></p>
                      <div :class="['step-tip', `tip-${step.color}`]">
                        <i class="bi bi-lightbulb me-1"></i>
                        <span v-html="sanitizeHtml(step.tip)"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Do / Don't -->
            <div class="row g-4 mb-5">
              <div class="col-md-6">
                <div class="do-dont-card dos-card">
                  <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span class="do-badge"><i class="bi bi-check-lg"></i></span>
                    Best Practices
                  </h5>
                  <ul class="do-dont-list">
                    <li v-for="item in studentDos" :key="item">
                      <i class="bi bi-check2-circle text-success me-2"></i
                      >{{ item }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="do-dont-card donts-card">
                  <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span class="dont-badge"><i class="bi bi-x-lg"></i></span>
                    Common Mistakes to Avoid
                  </h5>
                  <ul class="do-dont-list">
                    <li v-for="item in studentDonts" :key="item">
                      <i class="bi bi-x-circle text-danger me-2"></i>{{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Code Formatting Card -->
            <div class="markdown-tip-card position-relative overflow-hidden">
              <div class="tip-card-overlay"></div>
              <div class="position-relative z-1">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-lightbulb-fill text-warning fs-4"></i>
                  <h5 class="fw-bold mb-0 text-white">
                    Markdown Code Formatting
                  </h5>
                </div>
                <p class="text-light-subtle small mb-4">
                  Wrap code in triple backticks with a language name for syntax
                  highlighting.
                </p>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div
                      class="code-editor-window rounded-3 overflow-hidden h-100"
                    >
                      <div
                        class="code-editor-header d-flex align-items-center justify-content-between px-3 py-2"
                      >
                        <div class="d-flex align-items-center gap-2">
                          <span class="dot" style="background: #ef4444"></span>
                          <span class="dot" style="background: #f59e0b"></span>
                          <span class="dot" style="background: #10b981"></span>
                          <span class="ms-2 text-muted-code small"
                            >write-post.md</span
                          >
                        </div>
                        <span class="editor-badge">MARKDOWN</span>
                      </div>
                      <div class="code-preview-box p-3">
                        <pre
                          class="mb-0"
                          style="font-size: 0.8rem; line-height: 1.6"
                        >Here is my Vue code:

<span style="color:#5483B3;">```javascript</span>
<span style="color:#f43f5e;">const</span> app = createApp(App);
app.mount(<span style="color:#34d399;">'#app'</span>);
<span style="color:#5483B3;">```</span></pre>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div
                      class="code-editor-window rounded-3 overflow-hidden h-100"
                    >
                      <div
                        class="code-editor-header d-flex align-items-center justify-content-between px-3 py-2"
                      >
                        <div class="d-flex align-items-center gap-2">
                          <span class="dot" style="background: #ef4444"></span>
                          <span class="dot" style="background: #f59e0b"></span>
                          <span class="dot" style="background: #10b981"></span>
                          <span class="ms-2 text-muted-code small"
                            >forum-thread</span
                          >
                        </div>
                        <span
                          class="editor-badge"
                          style="
                            color: #34d399;
                            border-color: rgba(52, 211, 153, 0.3);
                          "
                          >RENDERED</span
                        >
                      </div>
                      <div class="code-preview-box p-3">
                        <p class="text-light small mb-2">
                          Here is my Vue code:
                        </p>
                        <div
                          class="p-3 rounded-2"
                          style="
                            background: #090f24;
                            border: 1px solid rgba(255, 255, 255, 0.05);
                          "
                        >
                          <pre
                            class="mb-0"
                            style="
                              font-size: 0.8rem;
                              line-height: 1.6;
                              color: #a5b4fc;
                            "
                          ><span style="color:#60a5fa;">const</span> app = <span style="color:#60a5fa;">createApp</span>(App);
app.<span style="color:#60a5fa;">mount</span>(<span style="color:#34d399;">'#app'</span>);</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="d-flex align-items-center gap-2 text-warning small fw-bold mt-4"
                >
                  <i class="bi bi-check2-circle"></i>
                  Result: Beautifully syntax-highlighted code that other
                  developers can read at a glance.
                </div>
              </div>
            </div>
          </div>

          <!-- TEACHER -->
          <div v-else key="teacher">
            <div class="section-header mb-4">
              <div class="section-icon-box bg-indigo-subtle text-indigo">
                <i class="bi bi-person-workspace"></i>
              </div>
              <div>
                <h2 class="themed-text fw-bold mb-1">Teacher & Mentor Guide</h2>
                <p class="text-muted small mb-0">
                  Six best practices for facilitating an active and productive
                  learning forum.
                </p>
              </div>
            </div>

            <div class="row g-4 mb-5">
              <div
                v-for="(step, idx) in teacherSteps"
                :key="step.title"
                class="col-md-6"
              >
                <div :class="['step-card', `step-glow-${step.color}`]">
                  <div class="step-number">
                    {{ String(idx + 1).padStart(2, "0") }}
                  </div>
                  <div class="d-flex align-items-start gap-3">
                    <div
                      :class="[
                        'step-icon-box',
                        `bg-${step.color}-subtle`,
                        `text-${step.color}`,
                      ]"
                    >
                      <i :class="['bi', step.icon]"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="fw-bold mb-2 themed-text">{{ step.title }}</h5>
                      <p
                        class="text-muted small mb-2"
                        v-html="sanitizeHtml(step.desc)"
                      ></p>
                      <div :class="['step-tip', `tip-${step.color}`]">
                        <i class="bi bi-lightbulb me-1"></i>
                        <span>{{ step.tip }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Engagement Tip Banner -->
            <div class="teachers-tip-card">
              <div class="d-flex align-items-start gap-3">
                <div class="teacher-tip-icon">
                  <i class="bi bi-stars"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-2 themed-text">
                    Pro Engagement Insight
                  </h5>
                  <p class="text-muted small mb-0">
                    Research shows students are
                    <strong>3× more likely</strong> to participate when a
                    teacher includes a clear, approachable discussion prompt
                    (e.g.
                    <em
                      >"What was the trickiest part for you and how did you
                      solve it?"</em
                    >). Formatting, starter code links, and explicit deadlines
                    in announcements reduce confusion by up to 55%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── CTA ───────────────────────────────────── -->
        <section
          class="cta-section text-center mt-5 glass-card position-relative overflow-hidden"
        >
          <div class="cta-glow"></div>
          <div class="position-relative z-1">
            <h4 class="fw-bold mb-2 themed-text">Ready to get started?</h4>
            <p class="text-muted mb-4 mx-auto" style="max-width: 480px">
              Apply these best practices and start a conversation on ANTFORUM
              right now.
            </p>
            <div class="d-flex justify-content-center gap-3 flex-wrap">
              <router-link
                id="cta-create-post-btn"
                to="/forum/create"
                class="btn-primary-gradient text-decoration-none"
              >
                <i class="bi bi-plus-lg me-1"></i> Create Discussion
              </router-link>
              <router-link
                to="/faq"
                class="btn-secondary-outline text-decoration-none"
              >
                <i class="bi bi-question-circle me-1"></i> Browse FAQ
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* ── PAGE SHELL ─────────────────────────────────────── */
.help-page {
  min-height: 100vh;
  background: var(--color-bg);
  background-image:
    linear-gradient(var(--color-border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-soft) 1px, transparent 1px);
  background-size: 34px 34px;
  color: var(--color-text);
  position: relative;
  overflow-x: hidden;
  transition:
    background-color var(--transition-slow),
    color var(--transition-slow);
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
  filter: blur(90px);
}
.orb-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(
    circle,
    rgba(84, 131, 179, 0.14),
    transparent 70%
  );
  top: -120px;
  left: -120px;
}
.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(84, 131, 179, 0.12),
    transparent 70%
  );
  bottom: -80px;
  right: -60px;
}
.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.07),
    transparent 70%
  );
  top: 40%;
  left: 55%;
}

.help-container {
  position: relative;
  z-index: 1;
  padding: 5rem 1.5rem 6rem;
}
.help-inner {
  max-width: 960px;
  margin: 0 auto;
}

/* ── GLASS CARD ─────────────────────────────────────── */
.glass-card {
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  transition: all 0.3s ease;
}

/* ── HERO ───────────────────────────────────────────── */
.help-hero {
  padding: 3.5rem 3rem;
}
.hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(84, 131, 179, 0.08),
    transparent 50%,
    rgba(167, 139, 250, 0.08)
  );
}
.help-title {
  font-family: var(--font-family-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 850;
  line-height: 1.1;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.help-subtitle {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  max-width: 600px;
}
.section-label {
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.09em;
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

/* ── QUICK LINKS ────────────────────────────────────── */
.quick-links-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
}
.quick-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}
.quick-link-btn:active {
  transform: scale(0.96);
}

.quick-link-btn.color-blue {
  background: rgba(124, 58, 237, 0.1);
  color: #052659;
  border-color: rgba(124, 58, 237, 0.2);
}
.quick-link-btn.color-blue {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.2);
}
.quick-link-btn.color-emerald {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  border-color: rgba(5, 150, 105, 0.2);
}
.quick-link-btn.color-amber {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.2);
}

.quick-link-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

/* ── STATS BAR ──────────────────────────────────────── */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 0;
  padding: 1.5rem;
  flex-wrap: wrap;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  border-right: 1px solid var(--color-border);
}
.stat-item:last-child {
  border-right: none;
}
.stat-icon {
  font-size: 1.3rem;
  color: var(--color-primary);
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-align: center;
}

/* ── ROLE TOGGLE ────────────────────────────────────── */
.role-toggle-container {
  display: flex;
  gap: 0.3rem;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(10px);
  padding: 6px;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-md);
}
.btn-toggle {
  border: none;
  background: transparent;
  padding: 0.7rem 1.8rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.btn-toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}
.btn-toggle:active {
  transform: scale(0.97);
}
.btn-toggle.active {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  color: white;
  box-shadow: 0 4px 15px rgba(84, 131, 179, 0.25);
}

/* ── SECTION HEADER ─────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.section-icon-box {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 1.4rem;
  flex-shrink: 0;
}
.themed-text {
  color: var(--color-text);
}

/* ── STEP CARDS ─────────────────────────────────────── */
.step-card {
  position: relative;
  background: var(--color-glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  height: 100%;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.step-card:hover {
  transform: translateY(-5px);
}
.step-number {
  position: absolute;
  top: 1rem;
  right: 1.1rem;
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--color-border);
  line-height: 1;
  user-select: none;
  letter-spacing: -0.04em;
}
.step-card:hover .step-icon-box {
  transform: scale(1.06) rotate(2deg);
}

/* Category-specific hover glows */
.step-glow-blue:hover {
  border-color: rgba(124, 58, 237, 0.4) !important;
  box-shadow: 0 14px 32px rgba(124, 58, 237, 0.12) !important;
}
.step-glow-blue:hover {
  border-color: rgba(37, 99, 235, 0.4) !important;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.12) !important;
}
.step-glow-emerald:hover {
  border-color: rgba(5, 150, 105, 0.4) !important;
  box-shadow: 0 14px 32px rgba(5, 150, 105, 0.12) !important;
}
.step-glow-amber:hover {
  border-color: rgba(217, 119, 6, 0.4) !important;
  box-shadow: 0 14px 32px rgba(217, 119, 6, 0.12) !important;
}
.step-glow-rose:hover {
  border-color: rgba(225, 29, 72, 0.4) !important;
  box-shadow: 0 14px 32px rgba(225, 29, 72, 0.12) !important;
}
.step-glow-indigo:hover {
  border-color: rgba(79, 70, 229, 0.4) !important;
  box-shadow: 0 14px 32px rgba(79, 70, 229, 0.12) !important;
}
.step-glow-cyan:hover {
  border-color: rgba(8, 145, 178, 0.4) !important;
  box-shadow: 0 14px 32px rgba(8, 145, 178, 0.12) !important;
}
.step-glow-teal:hover {
  border-color: rgba(13, 148, 136, 0.4) !important;
  box-shadow: 0 14px 32px rgba(13, 148, 136, 0.12) !important;
}

.step-icon-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* Step tip pills */
.step-tip {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-sm);
  line-height: 1.4;
}
.tip-blue {
  background: rgba(124, 58, 237, 0.1);
  color: #052659;
}
.tip-blue {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
.tip-emerald {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}
.tip-amber {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}
.tip-rose {
  background: rgba(225, 29, 72, 0.1);
  color: #e11d48;
}
.tip-indigo {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}
.tip-cyan {
  background: rgba(8, 145, 178, 0.1);
  color: #0891b2;
}
.tip-teal {
  background: rgba(13, 148, 136, 0.1);
  color: #0d9488;
}

/* ── DO / DON'T ─────────────────────────────────────── */
.do-dont-card {
  height: 100%;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
}
.dos-card {
  background: rgba(16, 185, 129, 0.04);
  border-color: rgba(16, 185, 129, 0.15);
}
.donts-card {
  background: rgba(239, 68, 68, 0.04);
  border-color: rgba(239, 68, 68, 0.15);
}
.do-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}
.dont-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}
.do-dont-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.do-dont-list li {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
}

/* ── MARKDOWN TIP CARD ──────────────────────────────── */
.markdown-tip-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  padding: 2rem;
}
.tip-card-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 100% 0%,
    rgba(84, 131, 179, 0.15),
    transparent 50%
  );
  pointer-events: none;
}
.code-editor-window {
  background: #020617;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.code-editor-header {
  background: #090f24;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.text-muted-code {
  color: #64748b;
  font-size: 0.8rem;
}
.editor-badge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(84, 131, 179, 0.3);
  color: #5483B3;
}
.code-preview-box {
  background: transparent;
  font-family: "Fira Code", "Courier New", monospace;
}

/* ── TEACHER TIP ────────────────────────────────────── */
.teachers-tip-card {
  background: linear-gradient(
    135deg,
    rgba(238, 242, 255, 0.5),
    rgba(224, 231, 255, 0.5)
  );
  border: 1px solid rgba(84, 131, 179, 0.2);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  backdrop-filter: blur(12px);
}
[data-theme="dark"] .teachers-tip-card {
  background: linear-gradient(
    135deg,
    rgba(30, 27, 75, 0.4),
    rgba(49, 46, 129, 0.4)
  );
  border-color: rgba(84, 131, 179, 0.25);
  border-left-color: var(--color-blue);
}
.teacher-tip-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
}

/* ── CTA ────────────────────────────────────────────── */
.cta-section {
  padding: 3rem 2rem;
}
.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 130px;
  background: radial-gradient(
    circle,
    rgba(84, 131, 179, 0.15),
    transparent 70%
  );
  pointer-events: none;
}
.btn-primary-gradient {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #052659, #5483B3);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.7rem 1.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
}
.btn-primary-gradient:hover {
  background: linear-gradient(135deg, #052659, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
  color: white;
}
.btn-secondary-outline {
  display: inline-flex;
  align-items: center;
  background: var(--color-glass-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  padding: 0.7rem 1.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
}
.btn-secondary-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}

/* ── SUBTLE COLORS ──────────────────────────────────── */
.bg-blue-subtle {
  background-color: #f3e8ff;
}
.text-blue {
  color: #052659;
}
.bg-blue-subtle {
  background-color: #dbeafe;
}
.text-blue {
  color: #2563eb;
}
.bg-emerald-subtle {
  background-color: #d1fae5;
}
.text-emerald {
  color: #059669;
}
.bg-amber-subtle {
  background-color: #fef3c7;
}
.text-amber {
  color: #d97706;
}
.bg-rose-subtle {
  background-color: #ffe4e6;
}
.text-rose {
  color: #e11d48;
}
.bg-indigo-subtle {
  background-color: #C1E8FF;
}
.text-indigo {
  color: #4f46e5;
}
.bg-cyan-subtle {
  background-color: #ecfeff;
}
.text-cyan {
  color: #0891b2;
}
.bg-teal-subtle {
  background-color: #ccfbf1;
}
.text-teal {
  color: #0d9488;
}

[data-theme="dark"] .bg-blue-subtle {
  background-color: rgba(124, 58, 237, 0.15);
}
[data-theme="dark"] .bg-blue-subtle {
  background-color: rgba(37, 99, 235, 0.15);
}
[data-theme="dark"] .bg-emerald-subtle {
  background-color: rgba(5, 150, 105, 0.15);
}
[data-theme="dark"] .bg-amber-subtle {
  background-color: rgba(217, 119, 6, 0.15);
}
[data-theme="dark"] .bg-rose-subtle {
  background-color: rgba(225, 29, 72, 0.15);
}
[data-theme="dark"] .bg-indigo-subtle {
  background-color: rgba(79, 70, 229, 0.15);
}
[data-theme="dark"] .bg-cyan-subtle {
  background-color: rgba(8, 145, 178, 0.15);
}
[data-theme="dark"] .bg-teal-subtle {
  background-color: rgba(13, 148, 136, 0.15);
}

/* ── TRANSITIONS ────────────────────────────────────── */
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
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ── RESPONSIVE ─────────────────────────────────────── */
@media (max-width: 576px) {
  .help-hero {
    padding: 2rem 1.25rem;
  }
  .glass-card {
    padding: 1.5rem;
  }
  .stats-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  .stat-item {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .stat-item:last-child {
    border-bottom: none;
  }
  .btn-toggle {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
