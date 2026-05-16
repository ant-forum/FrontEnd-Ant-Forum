<template>
  <nav class="navbar-custom">
    <!-- Logo -->
    <div class="logo">
      ANT-Forum
    </div>

    <!-- Center Navigation -->
    <div class="nav-center">
      <ul class="nav-links">
        <li><router-link to="/" class="nav-link" active-class="active" exact-active-class="active">Forum</router-link></li>
        <li><router-link to="/showcase" class="nav-link" active-class="active">Showcase</router-link></li>
        <li><router-link to="/blog" class="nav-link" active-class="active">Blog</router-link></li>
      </ul>
    </div>

    <!-- Right Actions -->
    <div class="nav-actions">
      <div class="search-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search..." class="search-input" />
      </div>
      
      <button class="notification-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </button>

      <div class="avatar-container">
        <img src="/avatar.png" alt="User Avatar" class="avatar-image" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.navbar-custom {
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #f0f1f5 0%, #fafafa 50%, #f0f1f5 100%);
  width: 100%;
  box-sizing: border-box;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1e29;
}

.nav-center {
  background-color: #ffffff;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-links {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #9333ea;
}

.nav-link.active {
  color: #9333ea;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.8rem;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.2rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  outline: none;
  font-size: 0.9rem;
  color: #334155;
  width: 250px;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: #a855f7;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #0f172a;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, transform 0.2s ease;
}

.notification-btn:hover {
  color: #9333ea;
  transform: scale(1.05);
}

.avatar-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive adjustments if needed */
@media (max-width: 768px) {
  .nav-center {
    display: none;
  }
  .search-input {
    width: 150px;
  }
}
</style>
