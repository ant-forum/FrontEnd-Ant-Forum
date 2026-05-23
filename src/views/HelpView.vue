<script setup>
import { ref, onMounted } from 'vue';
import Navbar from "../components/layouts/header.vue";
import BaseFooter from "../components/layouts/footer.vue";

// Active Tab: 'student' | 'teacher'
const activeRole = ref('student');

onMounted(() => {
  document.title = "Help Center - ANTFORUM";
});

// Guide Sections Data
const studentSteps = [
  {
    title: "1. Choose Your Forum Category",
    desc: "Locate the most relevant category. Use the <strong>Questions</strong> section for troubleshooting/code queries, <strong>Showcase</strong> for projects, or <strong>General</strong> for open discussions.",
    icon: "bi-tag-fill",
    color: "bg-purple-subtle text-purple"
  },
  {
    title: "2. Write a Clear, Descriptive Title",
    desc: "Be specific. Instead of writing <em>'Help with React'</em>, write <em>'How do I handle state sharing between non-adjacent siblings in React?'</em>. This increases responses by 80%.",
    icon: "bi-card-heading",
    color: "bg-blue-subtle text-blue"
  },
  {
    title: "3. Format Your Code Blocks",
    desc: "Use markdown code blocks to format code cleanly. Wrap your code in triple backticks (```) followed by the language name (e.g., vue, javascript, python).",
    icon: "bi-code-slash",
    color: "bg-emerald-subtle text-emerald"
  },
  {
    title: "4. Provide Context & What You Tried",
    desc: "Describe the error, attach stack traces, and mention any workarounds or solutions you have already attempted. This saves everyone's time.",
    icon: "bi-info-circle-fill",
    color: "bg-amber-subtle text-amber"
  }
];

const teacherSteps = [
  {
    title: "1. Structure Announcements Clearly",
    desc: "Pin announcements to the top of the course category. Use clear headings, bullet points, and high-contrast alert callouts to highlight deadlines.",
    icon: "bi-megaphone-fill",
    color: "bg-rose-subtle text-rose"
  },
  {
    title: "2. Post Weekly Challenges/Tutorials",
    desc: "Introduce technical challenges or post mini-tutorials. Provide starter templates, repository links, and clear acceptance criteria.",
    icon: "bi-journal-code",
    color: "bg-indigo-subtle text-indigo"
  },
  {
    title: "3. Drive Engagement with Discussion Prompts",
    desc: "Ask open-ended questions at the end of posts to invite students to comment, share their ideas, or discuss implementation trade-offs.",
    icon: "bi-chat-left-text-fill",
    color: "bg-cyan-subtle text-cyan"
  },
  {
    title: "4. Moderate and Pin Solutions",
    desc: "Identify outstanding student comments or correct answers and mark them as solutions or pin them to the top of the thread for visibility.",
    icon: "bi-pin-angle-fill",
    color: "bg-teal-subtle text-teal"
  }
];
</script>

<template>
  <Navbar />

  <main class="help-center-layout min-vh-100 py-5">
    <div class="container max-w-4xl">
      <!-- Header Banner -->
      <section class="help-hero text-center mb-5 p-5 rounded-5 shadow-sm position-relative overflow-hidden">
        <div class="hero-overlay"></div>
        <div class="position-relative z-1">
          <span class="badge bg-purple-subtle text-purple mb-2 px-3 py-2 rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 1px;">Support Guide</span>
          <h1 id="help-page-title" class="fw-black mb-3 text-dark text-gradient-title">ANTFORUM Help Center</h1>
          <p class="text-muted fs-5 mb-0 mx-auto" style="max-width: 600px;">
            Learn how to write high-quality, engaging, and well-formatted posts on our platform. Choose your guide below.
          </p>
        </div>
      </section>

      <!-- Role Selector Toggle -->
      <div class="d-flex justify-content-center mb-5">
        <div class="role-toggle-container p-1 rounded-pill bg-white shadow-sm border">
          <button 
            id="toggle-student-btn"
            @click="activeRole = 'student'" 
            class="btn-toggle" 
            :class="{ 'active': activeRole === 'student' }"
          >
            <i class="bi bi-mortarboard-fill me-2"></i>
            I am a Student
          </button>
          <button 
            id="toggle-teacher-btn"
            @click="activeRole = 'teacher'" 
            class="btn-toggle" 
            :class="{ 'active': activeRole === 'teacher' }"
          >
            <i class="bi bi-person-workspace me-2"></i>
            I am a Teacher / Mentor
          </button>
        </div>
      </div>

      <!-- Content Area with Transition -->
      <div class="help-content-container">
        <Transition name="fade-slide" mode="out-in">
          <!-- Student Content -->
          <div v-if="activeRole === 'student'" key="student" class="role-content">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="icon-header-box bg-purple-subtle text-purple rounded-4">
                <i class="bi bi-mortarboard fs-3"></i>
              </div>
              <div>
                <h3 class="fw-bold mb-1 text-dark">Student's Posting Guide</h3>
                <p class="text-muted small mb-0">How to request technical help and share projects successfully.</p>
              </div>
            </div>

            <!-- Steps Grid -->
            <div class="row g-4 mb-5">
              <div v-for="step in studentSteps" :key="step.title" class="col-md-6">
                <div class="card step-card border-0 shadow-sm rounded-4 p-4 h-100">
                  <div class="d-flex align-items-start gap-3">
                    <div :class="['step-icon-box rounded-3 flex-shrink-0', step.color]">
                      <i :class="['bi', step.icon]"></i>
                    </div>
                    <div>
                      <h5 class="fw-bold mb-2 text-dark">{{ step.title }}</h5>
                      <p class="text-muted small mb-0" v-html="step.desc"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Editor Formatting Card -->
            <div class="card markdown-tip-card border-0 shadow-sm rounded-4 p-4 bg-dark text-light overflow-hidden position-relative">
              <div class="tip-card-overlay"></div>
              <div class="position-relative z-1">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <i class="bi bi-lightbulb-fill text-warning fs-4"></i>
                  <h5 class="fw-bold mb-0 text-white">How to Format Code Snippets</h5>
                </div>
                <p class="text-light-subtle small mb-4">
                  To insert syntax-highlighted code in your forum post, wrap it in triple backticks and specify the programming language:
                </p>
                <div class="code-preview-box p-3 rounded-3 text-start bg-black border border-secondary mb-3">
                  <pre class="mb-0 text-emerald-light"><code>```javascript
const app = createApp(App);
app.mount('#app');
```</code></pre>
                </div>
                <div class="d-flex align-items-center gap-2 text-warning small fw-bold">
                  <i class="bi bi-check2-circle"></i>
                  <span>Result: Beautifully highlighted code that developers can read easily.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Teacher Content -->
          <div v-else key="teacher" class="role-content">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="icon-header-box bg-indigo-subtle text-indigo rounded-4">
                <i class="bi bi-person-workspace fs-3"></i>
              </div>
              <div>
                <h3 class="fw-bold mb-1 text-dark">Teacher & Mentor Guide</h3>
                <p class="text-muted small mb-0">Best practices for posting announcements and structuring course assignments.</p>
              </div>
            </div>

            <!-- Steps Grid -->
            <div class="row g-4 mb-5">
              <div v-for="step in teacherSteps" :key="step.title" class="col-md-6">
                <div class="card step-card border-0 shadow-sm rounded-4 p-4 h-100">
                  <div class="d-flex align-items-start gap-3">
                    <div :class="['step-icon-box rounded-3 flex-shrink-0', step.color]">
                      <i :class="['bi', step.icon]"></i>
                    </div>
                    <div>
                      <h5 class="fw-bold mb-2 text-dark">{{ step.title }}</h5>
                      <p class="text-muted small mb-0" v-html="step.desc"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Classroom Engagement Tips -->
            <div class="card teachers-tip-card border-0 shadow-sm rounded-4 p-4 text-dark" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);">
              <div class="d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-stars text-indigo fs-4"></i>
                <h5 class="fw-bold mb-0 text-dark">Classroom Engagement Tip</h5>
              </div>
              <p class="text-muted small mb-0">
                Students are <strong>3x more likely</strong> to reply if a teacher includes a specific, approachable prompt in the post (e.g. <em>"What challenges did you face when implementing this hook?"</em>). Using formatted outlines and links to GitHub repositories for starter files also yields much higher project completion rates.
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Call to Action -->
      <section class="cta-section text-center mt-5 p-4 rounded-4 border bg-white shadow-sm">
        <h5 class="fw-bold mb-2 text-dark">Ready to write your post?</h5>
        <p class="text-muted small mb-4">Put these tips into practice now on the main forum page.</p>
        <router-link id="cta-create-post-btn" to="/forum/create" class="btn btn-primary-gradient px-4 py-2 fw-bold shadow-sm text-decoration-none">
          <i class="bi bi-plus-lg me-1"></i> Create Discussion
        </router-link>
      </section>
    </div>
  </main>

  <BaseFooter />
</template>

<style scoped>
.help-center-layout {
  background-color: #f8fafc;
  font-family: var(--font-family-base, 'Inter', sans-serif);
}

.max-w-4xl {
  max-width: 900px;
}

/* Hero Section */
.help-hero {
  background: white;
  border: 1px solid #e2e8f0;
}

.text-gradient-title {
  background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Toggle Switch Styles */
.role-toggle-container {
  display: flex;
  gap: 0.25rem;
}

.btn-toggle {
  border: none;
  background: transparent;
  padding: 0.65rem 1.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  display: flex;
  align-items: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-toggle:hover {
  color: #334155;
  background-color: #f1f5f9;
}

.btn-toggle.active {
  background: #7c3aed;
  color: white;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

/* Header Info Icon box */
.icon-header-box {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Step Card Styles */
.step-card {
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f1f5f9 !important;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05) !important;
  border-color: #e2e8f0 !important;
}

.step-icon-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* Markdown Card styling */
.markdown-tip-card {
  background: #0f172a !important;
}

.code-preview-box {
  background: #020617;
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
}

.text-emerald-light {
  color: #34d399;
}

/* CTA */
.btn-primary-gradient {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.btn-primary-gradient:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.2);
}

/* Color Palette Subtles */
.bg-purple-subtle { background-color: #f3e8ff; }
.text-purple { color: #7c3aed; }

.bg-blue-subtle { background-color: #dbeafe; }
.text-blue { color: #2563eb; }

.bg-emerald-subtle { background-color: #d1fae5; }
.text-emerald { color: #059669; }

.bg-amber-subtle { background-color: #fef3c7; }
.text-amber { color: #d97706; }

.bg-rose-subtle { background-color: #ffe4e6; }
.text-rose { color: #e11d48; }

.bg-indigo-subtle { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }

.bg-cyan-subtle { background-color: #ecfeff; }
.text-cyan { color: #0891b2; }

.bg-teal-subtle { background-color: #ccfbf1; }
.text-teal { color: #0d9488; }

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
