<template>
  <div class="gate" v-if="!authenticated">
    <div class="gate-card">
      <img src="/Blicklelogo.png" alt="Blickle" class="gate-logo" />
      <h1 class="gate-title">Digitales Schwarzes Brett</h1>
      <p class="gate-subtitle">Zugang nur für autorisierte Personen</p>
      <form @submit.prevent="checkPassword" class="gate-form">
        <input
          v-model="password"
          type="password"
          placeholder="Passwort eingeben"
          class="gate-input"
          :class="{ 'gate-input--error': error }"
          autofocus
        />
        <button type="submit" class="gate-btn">Anmelden</button>
      </form>
      <p v-if="error" class="gate-error">Falsches Passwort</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const HASH = '098785ba601c8040b7eb576204e8ae09febfc1f5253dca1383c39f4ceeda11c7'

const authenticated = ref(sessionStorage.getItem('dsb_auth') === 'true')
const password = ref('')
const error = ref(false)

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function checkPassword() {
  error.value = false
  const hash = await sha256(password.value)
  if (hash === HASH) {
    sessionStorage.setItem('dsb_auth', 'true')
    authenticated.value = true
  } else {
    error.value = true
    password.value = ''
  }
}
</script>

<style scoped>
.gate {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #163A6C;
  font-family: 'DM Sans', sans-serif;
}
.gate-card {
  text-align: center;
  max-width: 380px;
  width: 100%;
  padding: 48px 40px;
}
.gate-logo {
  height: 48px;
  margin-bottom: 32px;
}
.gate-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.gate-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 32px;
}
.gate-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gate-input {
  padding: 14px 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1rem;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.gate-input:focus {
  border-color: #B5CC18;
}
.gate-input--error {
  border-color: #e74c3c;
}
.gate-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
.gate-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #B5CC18;
  color: #163A6C;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}
.gate-btn:hover {
  background: #c8de2a;
}
.gate-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 12px;
}
</style>
