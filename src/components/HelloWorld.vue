<script setup>
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)

const teamMembers = [
  { name: 'Heng Sophearom', role: 'Team Leader', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Songhai Yeanlang', role: 'Member', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Voeun Sopanha', role: 'Member', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Vong Vathana', role: 'Member', avatar: 'https://i.pravatar.cc/150?img=32' },
  { name: 'Tun Khikhe', role: 'Member', avatar: 'https://i.pravatar.cc/150?img=13' },
]

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<template>
  <div class="page-wrapper" :class="{ loaded: isLoaded }">
    <!-- Header -->
    <header class="navbar">
      <div class="logo">
        <div class="logo-icon"></div>
        <span class="logo-text">ANT-Forum</span>
      </div>
      <nav class="nav-links">
        <a href="#hero" class="nav-item active">Home</a>
        <a href="#team" class="nav-item">Team</a>
        <a href="#project-details" class="nav-item">Project Details</a>
      </nav>
      <a href="#" class="btn-primary">Connect ↗</a>
    </header>

    <!-- Hero Section -->
    <section id="hero" class="hero">
      <div class="bg-grid"></div>
      <div class="glow blob-1"></div>
      <div class="glow blob-2"></div>
      <div class="glow blob-3"></div>
      
      <!-- Floating Elements -->
      <div class="floating-element card-1">
        <div class="glass-card">
          <div class="card-icon">🚀</div>
          <div class="card-text">
            <strong>Project Showcase</strong>
            <span>12 New Projects this week</span>
          </div>
        </div>
      </div>
      <div class="floating-element card-2">
        <div class="glass-card">
          <div class="card-icon">💬</div>
          <div class="card-text">
            <strong>Live Forum</strong>
            <span>Active Q&A Community</span>
          </div>
        </div>
      </div>
      <div class="floating-element card-3">
        <div class="glass-card">
          <div class="card-icon">✍️</div>
          <div class="card-text">
            <strong>Tech Blog</strong>
            <span>Latest Industry Trends</span>
          </div>
        </div>
      </div>

      <div class="hero-content">
        <div class="badge-wrapper">
          <span class="badge-dot"></span>
          <div class="badge">ANT Final Project · Web Development</div>
        </div>
        <h1 class="title">
          ANT-Forum<br/>
          <span class="text-gradient">Empowering</span> Teams<br/>
          To <span class="text-outline">Build</span> Better.
        </h1>
        <p class="subtitle">The ultimate ecosystem for ANT developers to showcase portfolios, exchange knowledge, and stay ahead with tech insights.</p>
        <div class="hero-actions">
          <a href="#project-details" class="btn-primary large">Explore Proposal</a>
          <a href="#team" class="btn-secondary large">Meet the Team</a>
        </div>
      </div>
    </section>

    <!-- Team & Mentors -->
    <section id="team" class="section team-section">
      <div class="container">
        <div class="section-header">
          <span class="sub-label">Our Leadership</span>
          <h2 class="section-title">Teacher & Mentor</h2>
        </div>
        <div class="mentors-grid">
          <div class="mentor-card highlight">
            <span class="card-role">Teacher</span>
            <h3>Chen Sovanminea</h3>
            <p>Expert in Full-stack Development</p>
          </div>
          <div class="mentor-card highlight">
            <span class="card-role">Mentor</span>
            <h3>Rith Munisophak</h3>
            <p>Lead Project Guidance</p>
          </div>
        </div>

        <div class="section-header" style="margin-top: 60px;">
          <span class="sub-label">G2 - Group 2</span>
          <h2 class="section-title">Team ANT-Forum</h2>
        </div>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.name" class="team-card">
            <div class="team-avatar" :style="{ backgroundImage: `url(${member.avatar})` }"></div>
            <strong>{{ member.name }}</strong>
            <span>{{ member.role }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Project Details (The Requested Content) -->
    <section id="project-details" class="section project-details">
      <div class="container narrow">
        
        <!-- Table of Contents -->
        <div class="toc-card">
          <h3>មាតិកា (Table of Contents)</h3>
          <div class="toc-grid">
            <a href="#s1">1. ឈ្មោះគម្រោង</a>
            <a href="#s2">2. មូលហេតុ និងគោលបំណង</a>
            <a href="#s3">3. បញ្ហា</a>
            <a href="#s4">4. ដំណោះស្រាយ</a>
            <a href="#s5">5. អ្នកប្រើប្រាស់គោលដៅ</a>
            <a href="#s6">6. មុខងារសំខាន់ៗ</a>
            <a href="#s7">7. រចនាសម្ព័ន្ធបច្ចេកទេស</a>
            <a href="#s8">8. ផែនការអនាគត</a>
            <a href="#s9">9. លទ្ធផលរំពឹងទុក</a>
            <a href="#s10">10. សេចក្តីសន្និដ្ឋាន</a>
          </div>
        </div>

        <!-- Content Blocks -->
        <div class="content-blocks">
          
          <div id="s1" class="content-item">
            <div class="item-number">01</div>
            <h2 class="item-title">ឈ្មោះគម្រោង (Project Title)</h2>
            <div class="item-body">
              <p><strong>ANT-Forum</strong> – វេទិកាពហុបំណងសម្រាប់បង្ហាញស្នាដៃឌីជីថល (Digital Portfolio) បង្កើតសហគមន៍សួរ-ឆ្លើយចែករំលែកចំណេះដឹង (Q&A Community) និង ជាប្រភពនៃអត្ថបទបច្ចេកវិទ្យា (Tech Blog Post) សម្រាប់សិស្សានុសិស្ស និងអតីតសិស្សនៃសាលា ANT ទាំងអស់។</p>
            </div>
          </div>

          <div id="s2" class="content-item">
            <div class="item-number">02</div>
            <h2 class="item-title">មូលហេតុ និងគោលបំណង (Reason & Purpose)</h2>
            <div class="item-body">
              <div class="feature-row">
                <div class="feat">
                  <h4>Portfolio Building</h4>
                  <p>បង្កើតកន្លែងផ្ទុកកូដ និងបង្ហាញស្នាដៃគម្រោង (Projects) របស់សិស្សឱ្យមានសណ្តាប់ធ្នាប់ ដើម្បីងាយស្រួលបង្ហាញទៅកាន់ក្រុមហ៊ុន។</p>
                </div>
                <div class="feat">
                  <h4>Knowledge Exchange</h4>
                  <p>កសាងសហគមន៍អនឡាញមួយដែលសិស្សានុសិស្សគ្រប់កម្រិតអាចសួរ-ឆ្លើយ និងជួយដោះស្រាយបញ្ហាបច្ចេកទេសឱ្យគ្នាទៅវិញទៅមក។</p>
                </div>
                <div class="feat">
                  <h4>Tech Blog Post</h4>
                  <p>ផ្តោតលើការផ្តល់ប្រភពឯកសាររៀនសូត្របន្ថែម គន្លឹះខ្លីៗ (Tech Tips) និងព័ត៌មានថ្មីៗពីសាលា។</p>
                </div>
              </div>
            </div>
          </div>

          <div id="s3" class="content-item">
            <div class="item-number">03</div>
            <h2 class="item-title">បញ្ហា (Problem Statement)</h2>
            <div class="item-body">
              <ul class="bullet-list">
                <li><strong>Loss of Projects:</strong> គម្រោងបញ្ចប់វគ្គរបស់សិស្សច្បងភាគច្រើនតែងតែបាត់បង់បន្ទាប់ពីប្រឡងបញ្ចប់វគ្គ។</li>
                <li><strong>Debugging Difficulty:</strong> សិស្សតែងតែជួបការលំបាកក្នុងការស្វែងរកជំនួយនៅក្រៅម៉ោងសិក្សា។</li>
                <li><strong>Lack of Engagement:</strong> សិស្សមិនមានវេទិកាផ្លូវការដើម្បីអានអត្ថបទបច្ចេកវិទ្យា ឬចែករំលែកសមិទ្ធផល។</li>
              </ul>
            </div>
          </div>

          <div id="s4" class="content-item">
            <div class="item-number">04</div>
            <h2 class="item-title">ដំណោះស្រាយ (Solution)</h2>
            <div class="item-body">
              <div class="solution-grid">
                <div class="sol-card">
                  <h5>Project Showcase Engine</h5>
                  <p>ប្រព័ន្ធបង្ហោះគម្រោងដែលមានមុខងារវាយតម្លៃ (Rate/Star) និងរាប់ចំនួនអ្នកចូលមើល (Views)។</p>
                </div>
                <div class="sol-card">
                  <h5>Interactive Forum</h5>
                  <p>កន្លែងសួរ-ឆ្លើយ ដែលអនុញ្ញាតឱ្យសិស្សភ្ជាប់កូដបានយ៉ាងស្រួលជាមួយ Syntax Highlighting។</p>
                </div>
                <div class="sol-card">
                  <h5>Tech Blog Post</h5>
                  <p>ផ្នែកពិសេសសម្រាប់ Admin និង លោកគ្រូអ្នកគ្រូ ក្នុងការបង្ហោះអត្ថបទចែករំលែកចំណេះដឹង។</p>
                </div>
              </div>
            </div>
          </div>

          <div id="s5" class="content-item">
            <div class="item-number">05</div>
            <h2 class="item-title">អ្នកប្រើប្រាស់គោលដៅ និងកម្រិតសិទ្ធិ (Target Users & RBAC)</h2>
            <div class="item-body">
              <p>ការគ្រប់គ្រងសុវត្ថិភាពទិន្នន័យតាមរយៈ Role-Based Access Control (RBAC):</p>
              <div class="rbac-list">
                <div class="rbac-item"><span>សិស្ស:</span> បង្កើត Profile, បង្ហោះ Project, សួរ/ឆ្លើយសំណួរ។</div>
                <div class="rbac-item"><span>អតីតសិស្ស:</span> ដូចសិស្ស ប៉ុន្តែអាចតាំងខ្លួនជា Mentor។</div>
                <div class="rbac-item"><span>Teacher / Mentor:</span> វាយតម្លៃ Project, គ្រប់គ្រងមាតិកា។</div>
                <div class="rbac-item highlight"><span>Admin:</span> មានសិទ្ធិពេញលេញលើប្រព័ន្ធ និងបង្ហោះ Blog។</div>
              </div>
            </div>
          </div>

          <div id="s6" class="content-item">
            <div class="item-number">06</div>
            <h2 class="item-title">មុខងារសំខាន់ៗនៃប្រព័ន្ធ (Core Features)</h2>
            <div class="item-body">
              <div class="nested-features">
                <div class="n-feat"><strong>Showcase:</strong> Analytics Dashboard, Top Trending Logic, Advanced Categorization.</div>
                <div class="n-feat"><strong>Forum:</strong> Interactive Threads, Syntax Highlighting, Upvote/Downvote System.</div>
                <div class="n-feat"><strong>Blog:</strong> Admin Publication Tools, Reading Analytics.</div>
              </div>
            </div>
          </div>

          <div id="s7" class="content-item">
            <div class="item-number">07</div>
            <h2 class="item-title">រចនាសម្ព័ន្ធបច្ចេកទេស (System Overview)</h2>
            <div class="item-body">
              <div class="stack-row">
                <div class="stack-box">Vue.js (Frontend)</div>
                <div class="stack-box">Node.js + Express (Backend)</div>
                <div class="stack-box">MySQL (Database)</div>
              </div>
            </div>
          </div>

          <div id="s8" class="content-item">
            <div class="item-number">08</div>
            <h2 class="item-title">ផែនការអនាគត (Future Plans)</h2>
            <div class="item-body">
              <p>Job Opportunity Hub, Real-time Communication (Socket.io), and Mobile Application (iOS/Android).</p>
            </div>
          </div>

          <div id="s9" class="content-item">
            <div class="item-number">09</div>
            <h2 class="item-title">លទ្ធផលរំពឹងទុក (Expected Outcomes)</h2>
            <div class="item-body">
              <ul class="check-list">
                <li>សិស្សមាន Portfolio ឌីជីថលផ្ទាល់ខ្លួនដ៏រឹងមាំ។</li>
                <li>បរិយាកាសសិក្សាដែលសំបូរទៅដោយការចែករំលែក។</li>
                <li>ប្រព័ន្ធកណ្តាលដ៏ទំនើបសម្រាប់ផ្ទុកស្នាដៃសិស្ស។</li>
              </ul>
            </div>
          </div>

          <div id="s10" class="content-item">
            <div class="item-number">10</div>
            <h2 class="item-title">សេចក្តីសន្និដ្ឋាន (Conclusion)</h2>
            <div class="item-body">
              <p>ANT-Forum គឺជា Ecosystem ពេញលេញមួយសម្រាប់អ្នកអភិវឌ្ឍន៍ជំនាន់ថ្មីនៅ ANT។ វានឹងក្លាយជា Portfolio ដ៏រស់រវើក និងជាប្រភពចំណេះដឹងឥតចេះរីងស្ងួត។</p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 ANT-Forum Team · Built with Vue 3 & Node.js</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:wght@400;500;600;700&display=swap');

.page-wrapper {
  font-family: 'Inter', 'Kantumruy Pro', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  scroll-behavior: smooth;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.container.narrow {
  max-width: 800px;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 48px;
  position: sticky;
  top: 0;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  z-index: 100;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { width: 32px; height: 32px; background: #1a1a1a; border-radius: 8px 0 8px 8px; }
.logo-text { font-weight: 700; font-size: 18px; }

.nav-links { display: flex; gap: 8px; }
.nav-item { text-decoration: none; color: #666; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 100px; transition: 0.3s; }
.nav-item:hover { background: #f5f5f5; color: #1a1a1a; }
.nav-item.active { background: #1a1a1a; color: white; }

.btn-primary { background: #1a1a1a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 100px; font-weight: 500; font-size: 14px; }
.btn-primary.large { padding: 16px 32px; font-size: 16px; }
.btn-secondary.large { background: #f4f3ec; color: #1a1a1a; text-decoration: none; padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 500; }

/* Hero */
.hero {
  position: relative;
  height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%);
}

.bg-grid { 
  position: absolute; 
  inset: -100px; 
  background-size: 60px 60px; 
  background-image: 
    linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
  z-index: 0; 
  mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
}

.glow { position: absolute; width: 800px; height: 800px; border-radius: 50%; filter: blur(140px); opacity: 0.35; z-index: 0; pointer-events: none; }
.blob-1 { background: #fef3c7; top: -20%; left: -10%; animation: drift 15s ease-in-out infinite alternate; }
.blob-2 { background: #ede9fe; bottom: -20%; right: -10%; animation: drift 18s ease-in-out infinite alternate-reverse; }
.blob-3 { background: #dcfce7; top: 40%; right: 20%; width: 400px; height: 400px; animation: drift 12s ease-in-out infinite alternate; }

@keyframes drift {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(50px, 30px) rotate(10deg); }
}

.floating-element {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 16px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  animation: float 6s ease-in-out infinite;
}

.card-icon { font-size: 24px; }
.card-text { text-align: left; }
.card-text strong { display: block; font-size: 14px; color: #1a1a1a; }
.card-text span { font-size: 11px; color: #888; font-weight: 500; }

.card-1 { top: 20%; left: 10%; animation-delay: 0s; }
.card-2 { top: 30%; right: 12%; animation-delay: 1s; }
.card-3 { bottom: 25%; left: 15%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.hero-content { position: relative; z-index: 2; max-width: 1000px; padding: 0 40px; }

.badge-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  background: rgba(0,0,0,0.03);
  border-radius: 100px;
  margin-bottom: 32px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #1a1a1a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.badge { font-size: 12px; font-weight: 700; color: #1a1a1a; letter-spacing: 0.5px; }

.title { 
  font-size: clamp(48px, 8vw, 110px); 
  font-weight: 800; 
  letter-spacing: -4px; 
  margin: 0 0 32px; 
  line-height: 0.95; 
  color: #1a1a1a;
}

.text-gradient {
  background: linear-gradient(135deg, #1a1a1a 0%, #666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-outline {
  -webkit-text-stroke: 1.5px #1a1a1a;
  color: transparent;
}

.subtitle { 
  font-size: clamp(16px, 2vw, 22px); 
  color: #666; 
  margin: 0 auto 48px; 
  max-width: 650px;
  line-height: 1.5;
}

.hero-actions { display: flex; gap: 20px; justify-content: center; }

/* Sections */
.section { padding: 100px 0; }
.section-header { text-align: center; margin-bottom: 48px; }
.sub-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 8px; }
.section-title { font-size: 40px; font-weight: 700; letter-spacing: -1px; }

/* Mentors */
.mentors-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.mentor-card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #eee; text-align: center; }
.card-role { display: inline-block; padding: 4px 12px; background: #f4f3ec; border-radius: 100px; font-size: 11px; font-weight: 700; margin-bottom: 16px; }
.mentor-card h3 { font-size: 24px; margin-bottom: 8px; }
.mentor-card p { color: #666; }

/* Team */
.team-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
.team-card { background: white; padding: 20px; border-radius: 20px; border: 1px solid #eee; width: 160px; text-align: center; transition: 0.3s; }
.team-card:hover { transform: translateY(-5px); border-color: #1a1a1a; }
.team-avatar { width: 64px; height: 64px; border-radius: 50%; background-size: cover; margin: 0 auto 12px; }
.team-card strong { display: block; font-size: 14px; margin-bottom: 4px; }
.team-card span { font-size: 12px; color: #999; }

/* Project Details Layout */
.project-details { background: #fafafa; }

.toc-card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #eee; margin-bottom: 80px; }
.toc-card h3 { font-size: 20px; margin-bottom: 24px; }
.toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.toc-grid a { text-decoration: none; color: #666; font-size: 15px; padding: 12px; border-radius: 8px; border: 1px solid transparent; transition: 0.2s; }
.toc-grid a:hover { background: #f4f3ec; color: #1a1a1a; border-color: #eee; }

.content-blocks { display: flex; flex-direction: column; gap: 120px; }
.content-item { scroll-margin-top: 120px; position: relative; }
.item-number { font-size: 64px; font-weight: 700; color: #eee; position: absolute; left: -100px; top: -20px; }
.item-title { font-size: 32px; font-weight: 700; margin-bottom: 32px; }
.item-body { font-size: 18px; line-height: 1.8; color: #333; }

.feature-row { display: flex; flex-direction: column; gap: 24px; margin-top: 24px; }
.feat { background: white; padding: 24px; border-radius: 16px; border: 1px solid #eee; }
.feat h4 { font-size: 18px; margin-bottom: 8px; }
.feat p { font-size: 15px; color: #666; }

.bullet-list { padding-left: 20px; display: flex; flex-direction: column; gap: 12px; }
.bullet-list li strong { color: #1a1a1a; }

.solution-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.sol-card { background: white; padding: 24px; border-radius: 16px; border-left: 4px solid #1a1a1a; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.sol-card h5 { font-size: 16px; margin-bottom: 8px; }
.sol-card p { font-size: 14px; color: #666; }

.rbac-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.rbac-item { background: #fff; padding: 12px 20px; border-radius: 8px; border: 1px solid #eee; font-size: 15px; }
.rbac-item.highlight { border-color: #1a1a1a; background: #f4f3ec; }
.rbac-item span { font-weight: 700; margin-right: 8px; }

.stack-row { display: flex; gap: 12px; }
.stack-box { background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; }

.check-list { list-style: "✓ "; padding-left: 20px; color: #1a1a1a; font-weight: 500; display: flex; flex-direction: column; gap: 12px; }

.footer { padding: 40px 0; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px; }

@media (max-width: 1024px) {
  .title { font-size: 64px; }
  .item-number { display: none; }
  .toc-grid { grid-template-columns: 1fr; }
  .mentors-grid { grid-template-columns: 1fr; }
  .navbar { padding: 20px; }
  .stack-row { flex-direction: column; }
}
</style>
