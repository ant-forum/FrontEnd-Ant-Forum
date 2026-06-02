<script setup>
import { onMounted } from 'vue';
import Navbar from "../components/layouts/header.vue";
import BaseFooter from "../components/layouts/footer.vue";

import member1 from '../assets/team/member1.jpg';
import member2 from '../assets/team/member2.jpg';
import member3 from '../assets/team/member3.jpg';
import member4 from '../assets/team/member4.jpg';
import member5 from '../assets/team/member5.jpg';

onMounted(() => {
  document.title = "About Us - ANT Forum";
});

const stats = [
  { value: "1,500+", label: "Active Members", icon: "bi-people-fill", color: "text-purple" },
  { value: "450+", label: "Projects Shared", icon: "bi-code-square", color: "text-blue" },
  { value: "98%", label: "Help Queries Solved", icon: "bi-patch-check-fill", color: "text-emerald" },
  { value: "120+", label: "Tech Articles", icon: "bi-journal-text", color: "text-rose" }
];

const values = [
  {
    title: "Community Driven",
    desc: "We believe that the best way to learn is together. Our platform encourages students to support, critique, and inspire one another.",
    icon: "bi-heart-fill",
    color: "bg-purple-subtle text-purple"
  },
  {
    title: "Open Source Mindset",
    desc: "We push for building in public. Showcasing work, sharing code blocks, and writing documentation are core to our engineering ideals.",
    icon: "bi-git",
    color: "bg-blue-subtle text-blue"
  },
  {
    title: "Mentorship & Growth",
    desc: "Through student-to-mentor interaction and expert feedback, we help bridge the gap between classroom theory and production code.",
    icon: "bi-rocket-takeoff-fill",
    color: "bg-emerald-subtle text-emerald"
  },
  {
    title: "Inclusive Learning",
    desc: "No matter your background, skill level, or specialization, ANT Forum is a safe space for every aspiring software engineer.",
    icon: "bi-stars",
    color: "bg-amber-subtle text-amber"
  }
];

const team = [
  {
    name: "Heng Sophearom",
    role: "Lead Full-Stack Architect",
    avatar: member2,
    bio: "Passionate developer crafting Vue UI design systems and orchestrating robust Node.js backend services."
  },
  {
    name: "Vong Vathana",
    role: "Frontend Development & Manage Server",
    avatar: member1,
    bio: "Shaping product feature pipelines and building responsive user layouts with premium animations."
  },
  {
    name: "Voeun Sopanha",
    role: "Frontend Development",
    avatar: member3,
    bio: "Specializing in secure JWT authorization, PostgreSQL schemas, and optimized REST APIs."
  },
  {
    name: "Songhai Yeanlang",
    role: "Backend & Database Architect",
    avatar: member4,
    bio: "Dedicated to user interface details, micro-interactions, and visual polishing across application pages."
  },
  {
    name: "Tun Khikhe",
    role: "Backend & Database Architect",
    avatar: member5,
    bio: "Managing build systems, server environments, and ensuring clean CI/CD production pipelines."
  }
];

const milestones = [
  { year: "2024", title: "ANT Forum Inception", desc: "Started as a small project for Node.js developers to share code snippets." },
  { year: "2025", title: "Milestone Expansion", desc: "Added Project Showcases, live metrics tracking, and mentor moderation features." },
  { year: "2026", title: "Scaling New Heights", desc: "Rebuilding our platform with Vite, Vue 3, and rich modern design patterns." }
];
</script>

<template>
  <div class="about-layout min-vh-100 d-flex flex-column">
    <Navbar />

    <main class="flex-grow-1 py-5">
      <div class="container max-w-5xl">
        <!-- Hero Section -->
        <section class="about-hero text-center mb-5 p-5 rounded-5 shadow-sm position-relative overflow-hidden">
          <div class="hero-overlay"></div>
          <div class="position-relative z-1">
            <span class="badge bg-purple-subtle text-purple mb-2 px-3 py-2 rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 1px;">Our Story</span>
            <h1 class="fw-black mb-3 text-gradient-title display-4">Empowering Developer Communities</h1>
            <p class="text-muted fs-5 mb-0 mx-auto" style="max-width: 700px;">
              ANT Forum is a premium community platform built for developers, students, and mentors to showcase software projects, resolve complex technical issues, and publish insights.
            </p>
          </div>
        </section>

        <!-- Stats Grid -->
        <section class="row g-4 mb-5">
          <div v-for="stat in stats" :key="stat.label" class="col-6 col-md-3">
            <div class="card stat-card border-0 shadow-sm rounded-4 p-4 text-center h-100">
              <div class="stat-icon-wrapper mb-3 mx-auto">
                <i :class="['bi fs-3', stat.icon, stat.color]"></i>
              </div>
              <h2 class="fw-black mb-1 themed-text">{{ stat.value }}</h2>
              <span class="text-muted small fw-semibold">{{ stat.label }}</span>
            </div>
          </div>
        </section>

        <!-- Our Mission & Vision -->
        <section class="card mission-card border-0 shadow-sm rounded-5 p-4 p-lg-5 mb-5 overflow-hidden position-relative">
          <div class="mission-overlay"></div>
          <div class="position-relative z-1 row align-items-center g-4">
            <div class="col-lg-7">
              <h3 class="fw-black mb-3 themed-text">Our Mission</h3>
              <p class="text-muted mb-4 fs-6 lh-relaxed">
                In modern web development, studying theory is only half the battle. The true mastery comes from creating real-world projects, hitting roadblocks, debuggings code, and sharing findings.
              </p>
              <p class="text-muted mb-0 fs-6 lh-relaxed">
                ANT Forum acts as an incubator for technology talent by offering a structured forum for code support, a polished showcase area to launch projects, and a developer blog for developer-authored articles.
              </p>
            </div>
            <div class="col-lg-5">
              <div class="quote-box p-4 rounded-4 border bg-surface text-center shadow-sm">
                <i class="bi bi-quote fs-1 text-purple mb-2 d-block"></i>
                <p class="themed-text fst-italic mb-3">"The best way to predict the future is to build it together."</p>
                <span class="text-purple small fw-bold">— ANT Engineering Team</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Values Section -->
        <section class="mb-5">
          <div class="text-center mb-4">
            <h3 class="fw-black themed-text mb-2">Our Core Values</h3>
            <p class="text-muted small">The foundational guidelines that steer our community platform.</p>
          </div>
          <div class="row g-4">
            <div v-for="val in values" :key="val.title" class="col-md-6">
              <div class="card value-card border-0 shadow-sm rounded-4 p-4 h-100">
                <div class="d-flex align-items-start gap-3">
                  <div :class="['value-icon-box rounded-3 flex-shrink-0', val.color]">
                    <i :class="['bi', val.icon]"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-2 themed-text">{{ val.title }}</h5>
                    <p class="text-muted small mb-0 lh-relaxed">{{ val.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Milestones Timeline -->
        <section class="mb-5 timeline-section p-4 p-lg-5 rounded-5 border">
          <div class="text-center mb-5">
            <h3 class="fw-black themed-text mb-2">Community Milestones</h3>
            <p class="text-muted small">Our journey from a classroom snippet project to a scaling developer forum.</p>
          </div>
          <div class="vertical-timeline position-relative">
            <div v-for="(milestone, idx) in milestones" :key="milestone.year" class="timeline-item position-relative mb-4 pb-3" :class="idx % 2 === 0 ? 'left' : 'right'">
              <div class="timeline-dot bg-purple"></div>
              <div class="card timeline-card border-0 shadow-sm p-4 rounded-4">
                <span class="badge bg-purple-subtle text-purple mb-2 fw-bold align-self-start">{{ milestone.year }}</span>
                <h5 class="fw-bold mb-2 themed-text">{{ milestone.title }}</h5>
                <p class="text-muted small mb-0">{{ milestone.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Meet the Team -->
        <section class="mb-5">
          <div class="text-center mb-4">
            <h3 class="fw-black themed-text mb-2">Meet the Team</h3>
            <p class="text-muted small">The engineers and mentors steering ANT Forum forward.</p>
          </div>
          <div class="row g-4 justify-content-center">
            <div v-for="member in team" :key="member.name" class="col-md-4">
              <div class="card team-card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                <img :src="member.avatar" class="rounded-circle border border-theme mb-3 mx-auto object-fit-cover" width="96" height="96" alt="Team avatar">
                <h5 class="fw-bold mb-1 themed-text">{{ member.name }}</h5>
                <span class="text-purple small fw-bold mb-3 d-block">{{ member.role }}</span>
                <p class="text-muted small mb-0 lh-relaxed">{{ member.bio }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Call to Action -->
        <section class="cta-section text-center p-5 rounded-5 border shadow-sm position-relative overflow-hidden">
          <div class="soft-blob blob-left"></div>
          <div class="soft-blob blob-right"></div>
          <div class="position-relative z-2">
            <h3 class="fw-black mb-2 themed-text">Ready to join our community?</h3>
            <p class="text-muted small mb-4 mx-auto" style="max-width: 500px;">
              Share your software creations, help someone solve a bug, or write a technical blog post today.
            </p>
            <div class="d-flex justify-content-center gap-3 flex-wrap">
              <router-link to="/forum" class="btn btn-primary-gradient px-4 py-3 fw-bold text-decoration-none">
                <i class="bi bi-chat-left-text me-2"></i> Join Discussions
              </router-link>
              <router-link to="/showcase" class="btn btn-outline-purple px-4 py-3 fw-bold text-decoration-none">
                Explore Projects <i class="bi bi-arrow-right ms-2"></i>
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
.about-layout {
  font-family: var(--font-family-base, 'Inter', sans-serif);
  color: var(--color-text);
  background-color: transparent;
}

.max-w-5xl {
  max-width: 1040px;
}

.themed-text {
  color: var(--color-text);
}

.fw-black {
  font-weight: 900;
}

.lh-relaxed {
  line-height: 1.7;
}

/* Hero Section */
.about-hero {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-slow);
}

.text-gradient-title {
  background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Stat Cards */
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-primary) !important;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-hover);
  border-radius: 50%;
  border: 1px solid var(--color-border);
}

/* Mission Card */
.mission-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.quote-box {
  background-color: var(--color-surface-hover) !important;
  border-color: var(--color-border) !important;
}

/* Value Cards */
.value-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.value-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary) !important;
}

.value-icon-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* Timeline */
.timeline-section {
  background: var(--color-surface);
  border-color: var(--color-border) !important;
}

.vertical-timeline {
  padding-left: 2rem;
  border-left: 2px solid var(--color-border);
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -2.35rem;
  top: 1.25rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-purple);
}

.timeline-card {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border) !important;
  transition: border-color 0.2s ease;
}

.timeline-card:hover {
  border-color: var(--color-purple) !important;
}

/* Team Cards */
.team-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-purple) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

/* Call to Action */
.cta-section {
  background: var(--color-surface);
  border-color: var(--color-border) !important;
}

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

.btn-outline-purple {
  border: 2px solid var(--color-purple);
  color: var(--color-purple);
  background: transparent;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.btn-outline-purple:hover {
  background: var(--color-purple-light);
  color: var(--color-purple);
  transform: translateY(-1px);
}

.soft-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  width: 250px;
  height: 250px;
  opacity: 0.15;
}

.blob-left {
  background: #7c3aed;
  top: -100px;
  left: -100px;
}

.blob-right {
  background: #d946ef;
  bottom: -100px;
  right: -100px;
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

/* Dark Mode Overrides for Subtles */
[data-theme='dark'] .bg-purple-subtle { background-color: rgba(124, 58, 237, 0.15); }
[data-theme='dark'] .bg-blue-subtle { background-color: rgba(37, 99, 235, 0.15); }
[data-theme='dark'] .bg-emerald-subtle { background-color: rgba(5, 150, 105, 0.15); }
[data-theme='dark'] .bg-amber-subtle { background-color: rgba(217, 119, 6, 0.15); }
</style>
