<script setup>
import { reactive } from 'vue'
import Navbar from "../components/layouts/header.vue"
import Footer from "../components/layouts/footer.vue"
const form = reactive({
  name: '',
  bio: '',
  avatar: '',
  skills: '',
  github: '',
  linkedin: ''
})

// Convert skills string → array
const getSkills = () => {
  return form.skills
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill)
}

const handleSubmit = () => {
  console.log('Profile Data:', {
    ...form,
    skills: getSkills()
  })
}
</script>

<template>
    <Navbar />
  <div class="container py-4">
    
    <div class="card shadow-sm p-4">

      <h4 class="mb-4">Edit Profile</h4>

      <!-- Name -->
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="form.name" type="text" class="form-control" placeholder="Your name">
      </div>

      <!-- Bio -->
      <div class="mb-3">
        <label class="form-label">Bio</label>
        <textarea v-model="form.bio" class="form-control" rows="3" placeholder="Short bio"></textarea>
      </div>

      <!-- Avatar -->
      <div class="mb-3">
        <label class="form-label">Avatar URL</label>
        <input v-model="form.avatar" type="text" class="form-control" placeholder="https://...">
      </div>

      <!-- Skills -->
      <div class="mb-3">
        <label class="form-label">Skills (comma separated)</label>
        <input v-model="form.skills" type="text" class="form-control" placeholder="Vue, Node, Laravel">
        <small class="text-muted">Separate skills with commas</small>
      </div>

      <!-- GitHub -->
      <div class="mb-3">
        <label class="form-label">GitHub URL</label>
        <input v-model="form.github" type="text" class="form-control" placeholder="https://github.com/username">
      </div>

      <!-- LinkedIn -->
      <div class="mb-3">
        <label class="form-label">LinkedIn URL</label>
        <input v-model="form.linkedin" type="text" class="form-control" placeholder="https://linkedin.com/in/username">
      </div>

      <!-- Submit -->
      <button class="btn btn-primary w-100" @click="handleSubmit">
        Save Profile
      </button>

    </div>

  </div>
  <Footer/>
</template>