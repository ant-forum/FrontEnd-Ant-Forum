<script setup>
const tags = [
  { id: 1, name: '#React19' },
  { id: 2, name: '#WebAssembly' },
  { id: 3, name: '#GraphQL' },
  { id: 4, name: '#RustLang' },
  { id: 5, name: '#Kubernetes' },
  { id: 6, name: '#AI-Agents' },
];
</script>

<template>
  <div class="trending-section">
    <h3 class="section-title">
      <span class="title-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      </span>
      Trending Tags
    </h3>

    <div class="tags-wrap">
      <button v-for="tag in tags" :key="tag.id" class="tag-btn">
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.trending-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f5f3ff;
  border-radius: 6px;
  color: #7c3aed;
  flex-shrink: 0;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tag-btn:hover {
  background: #ede9fe;
  color: #7c3aed;
}
</style>