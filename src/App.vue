<template>
  <PasswordGate v-if="!authenticated" @authenticated="authenticated = true" />
  <router-view v-else />
</template>

<script setup>
import { ref } from 'vue'
import PasswordGate from './PasswordGate.vue'
import { hasDemoSession } from './shared/auth/demoPassword.js'

const authenticated = ref(hasDemoSession())
</script>
