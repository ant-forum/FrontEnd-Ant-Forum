<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import Navbar from "../components/layouts/header.vue"
import Footer from "../components/layouts/footer.vue"
import { useAuthStore } from '../stores/auth'
// Form
const form = reactive({
  name: '',
  bio: '',
  github: '',
  linkedin: ''
})

const authStore = useAuthStore()
const successMessage = ref('')
const errorMessage = ref('')
const isSaving = ref(false)

// Avatar
const avatarFile = ref(null)
const avatarPreview = ref('')
const savedAvatarPreview = ref('')

const savedProfile = reactive({
  name: '',
  bio: '',
  github: '',
  linkedin: '',
  skills: []
})

const isEditing = ref(false)

const resetForm = () => {
  form.name = savedProfile.name
  form.bio = savedProfile.bio
  form.github = savedProfile.github
  form.linkedin = savedProfile.linkedin
  skills.value = [...savedProfile.skills]
  avatarFile.value = null
  avatarPreview.value = savedAvatarPreview.value
}

const startEdit = () => {
  isEditing.value = true
  resetForm()
}

const handleCancel = () => {
  resetForm()
  isEditing.value = false
}

const saveProfileState = () => {
  savedProfile.name = form.name
  savedProfile.bio = form.bio
  savedProfile.github = form.github
  savedProfile.linkedin = form.linkedin
  savedProfile.skills = [...skills.value]
  savedAvatarPreview.value = avatarPreview.value
}

const applyUpdateToStore = (updatedUser) => {
  authStore.user = {
    ...authStore.user,
    name: updatedUser.name ?? form.name,
    bio: updatedUser.bio ?? form.bio,
    github: updatedUser.github ?? form.github,
    linkedin: updatedUser.linkedin ?? form.linkedin,
    skills: updatedUser.skills ?? [...skills.value],
    avatar: updatedUser.avatar ?? updatedUser.avatarUrl ?? avatarPreview.value
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const loadSavedProfile = () => {
  const user = authStore.user || {}
  savedProfile.name = user.name || ''
  savedProfile.bio = user.bio || ''
  savedProfile.github = user.github || ''
  savedProfile.linkedin = user.linkedin || ''
  savedProfile.skills = Array.isArray(user.skills) ? [...user.skills] : []
  savedAvatarPreview.value = user.avatar || user.avatarUrl || ''
  avatarPreview.value = savedAvatarPreview.value
  resetForm()
}

onMounted(loadSavedProfile)

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

  // Revoke previous object URL to free memory
  if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
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
const handleSubmit = async () => {
  if (!isValid.value || isSaving.value) return

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

  isSaving.value = true
  errorMessage.value = ''

  try {
    const response = await axios.put('/api/users/me', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const updatedUser = response.data?.user ?? response.data ?? {}
    applyUpdateToStore(updatedUser)
    saveProfileState()
    isEditing.value = false
    showSuccess('Profile saved successfully.')
  } catch (error) {
    console.error('Profile update failed:', error)
    showError('Unable to save profile. Please try again.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
    <Navbar />
  <div class="container py-4">
    
    <div class="card shadow-sm p-4">

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Profile</h4>
        <div>
          <button
            v-if="!isEditing"
            class="btn btn-outline-primary"
            @click="startEdit"
          >
            Edit Profile
          </button>
          <div v-else class="d-flex gap-2">
            <button class="btn btn-secondary" @click="handleCancel" :disabled="isSaving">
              Cancel
            </button>
            <button
              class="btn btn-primary d-flex align-items-center gap-2"
              :disabled="!isValid || isSaving"
              @click="handleSubmit"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger mt-2" role="alert">
        {{ errorMessage }}
      </div>

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
          :disabled="!isEditing"
        />
      </div>

      <!-- Name -->
      <div class="mb-3">
        <label class="form-label">Name *</label>
        <input
          v-model="form.name"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          :disabled="!isEditing"
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
          :disabled="!isEditing"
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
            :disabled="!isEditing"
          />
          <button
            class="btn btn-outline-primary"
            @click="addSkill"
            :disabled="!isEditing"
          >
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
              v-if="isEditing"
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
          :disabled="!isEditing"
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
          :disabled="!isEditing"
        />
        <div class="invalid-feedback">{{ errors.linkedin }}</div>
      </div>

    </div>

  </div>
  <Footer/>
</template>