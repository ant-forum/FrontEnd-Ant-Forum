<script setup>
import { reactive, ref, computed, watch } from 'vue'
import Navbar from "../components/layouts/header.vue"
import Footer from "../components/layouts/footer.vue"
// Form
const form = reactive({
  name: '',
  bio: '',
  github: '',
  linkedin: ''
})

// Avatar
const avatarFile = ref(null)
const avatarPreview = ref('')

// Skills
const skillInput = ref('')
const skills = ref([])

// Errors
const errors = reactive({
  name: '',
  bio: '',
  github: '',
  linkedin: ''
})

// URL validation
const isValidURL = (url) => {
  return /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.+)?$/.test(url)
}

// Handle avatar upload
const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Only image files allowed')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('Max size is 2MB')
    return
  }

  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = (event) => {
    avatarPreview.value = event.target.result
  }
  reader.readAsDataURL(file)
}

// Skills
const addSkill = () => {
  const value = skillInput.value.trim()
  if (value && !skills.value.includes(value)) {
    skills.value.push(value)
  }
  skillInput.value = ''
}

const removeSkill = (index) => {
  skills.value.splice(index, 1)
}

// Validation
watch(form, () => {
  errors.name = form.name ? '' : 'Name is required'

  errors.bio =
    form.bio.length > 200 ? 'Bio must be under 200 characters' : ''

  errors.github =
    form.github && !isValidURL(form.github)
      ? 'Invalid GitHub URL'
      : ''

  errors.linkedin =
    form.linkedin && !isValidURL(form.linkedin)
      ? 'Invalid LinkedIn URL'
      : ''
}, { deep: true })

const isValid = computed(() => {
  return !errors.name && !errors.bio && !errors.github && !errors.linkedin
})

// Submit
const handleSubmit = () => {
  if (!isValid.value) return

  const payload = new FormData()

  payload.append('name', form.name)
  payload.append('bio', form.bio)
  payload.append('github', form.github)
  payload.append('linkedin', form.linkedin)

  skills.value.forEach((skill, i) => {
    payload.append(`skills[${i}]`, skill)
  })

  if (avatarFile.value) {
    payload.append('avatar', avatarFile.value)
  }

  console.log('Submit:', payload)
}
</script>

<template>
    <Navbar />
  <div class="container py-4">
    
    <div class="card shadow-sm p-4">

      <h4 class="mb-4">Edit Profile</h4>

      <!-- Avatar Upload -->
      <div class="text-center mb-4">
        <img
          :src="avatarPreview || 'https://via.placeholder.com/100'"
          class="rounded-circle mb-3"
          width="100"
          height="100"
        />

        <input
          type="file"
          class="form-control"
          accept="image/*"
          @change="handleAvatarChange"
        />
      </div>

      <!-- Name -->
      <div class="mb-3">
        <label class="form-label">Name *</label>
        <input
          v-model="form.name"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
        />
        <div class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <!-- Bio -->
      <div class="mb-3">
        <label class="form-label">Bio</label>
        <textarea
          v-model="form.bio"
          class="form-control"
          rows="3"
          :class="{ 'is-invalid': errors.bio }"
        ></textarea>
        <div class="invalid-feedback">{{ errors.bio }}</div>
        <small class="text-muted">{{ form.bio.length }}/200</small>
      </div>

      <!-- Skills -->
      <div class="mb-3">
        <label class="form-label">Skills</label>

        <div class="d-flex mb-2">
          <input
            v-model="skillInput"
            @keyup.enter="addSkill"
            class="form-control me-2"
            placeholder="Add skill"
          />
          <button class="btn btn-outline-primary" @click="addSkill">
            Add
          </button>
        </div>

        <div>
          <span
            v-for="(skill, index) in skills"
            :key="index"
            class="badge bg-primary me-2 mb-2"
          >
            {{ skill }}
            <span
              class="ms-1"
              style="cursor:pointer"
              @click="removeSkill(index)"
            >
              ✕
            </span>
          </span>
        </div>
      </div>

      <!-- GitHub -->
      <div class="mb-3">
        <label class="form-label">GitHub</label>
        <input
          v-model="form.github"
          class="form-control"
          :class="{ 'is-invalid': errors.github }"
        />
        <div class="invalid-feedback">{{ errors.github }}</div>
      </div>

      <!-- LinkedIn -->
      <div class="mb-3">
        <label class="form-label">LinkedIn</label>
        <input
          v-model="form.linkedin"
          class="form-control"
          :class="{ 'is-invalid': errors.linkedin }"
        />
        <div class="invalid-feedback">{{ errors.linkedin }}</div>
      </div>

      <!-- Submit -->
      <button
        class="btn btn-primary w-100"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        Save Profile
      </button>

    </div>

  </div>
  <Footer/>
</template>