<script setup>
import { useToastStore } from '../../shared/stores/toastStore.js'
const toastStore = useToastStore()

const icons = {
  success: '&#9989;',
  error: '&#9888;',
  info: '&#8505;',
  warning: '&#9888;',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" v-if="toastStore.toasts.length">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          <span class="toast-icon" v-html="icons[toast.type]"></span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
  min-width: 250px;
  max-width: 400px;
}

.toast-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #4caf50;
}

.toast-error {
  background: #fce4ec;
  color: #c62828;
  border-left: 4px solid #ef5350;
}

.toast-info {
  background: #e3f2fd;
  color: #1565c0;
  border-left: 4px solid #42a5f5;
}

.toast-warning {
  background: #fff3e0;
  color: #e65100;
  border-left: 4px solid #ff9800;
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Transition animations */
.toast-enter-active {
  animation: toast-slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-leave-active {
  animation: toast-slide-out 0.25s cubic-bezier(0.55, 0, 1, 0.45);
}

@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toast-slide-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(40px); }
}
</style>
