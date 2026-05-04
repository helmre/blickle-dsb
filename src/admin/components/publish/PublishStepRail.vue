<script setup>
defineProps({
  completedSteps: { type: Array, default: () => [] },
  currentStep: { type: Number, required: true },
  maxUnlockedStep: { type: Number, required: true },
  steps: { type: Array, required: true },
})

defineEmits(['go-to-step'])

function isStepCompleted(completedSteps, stepId) {
  return completedSteps.includes(stepId)
}
</script>

<template>
  <aside class="step-rail" aria-label="Veröffentlichungsschritte">
    <button
      v-for="(step, index) in steps"
      :key="step.id"
      type="button"
      :class="[
        'step-item',
        {
          active: currentStep === index,
          done: isStepCompleted(completedSteps, step.id),
          locked: index > maxUnlockedStep,
        },
      ]"
      :disabled="index > maxUnlockedStep"
      @click="$emit('go-to-step', index)"
    >
      <span class="step-icon">
        <component :is="step.icon" :size="17" />
      </span>
      <span class="step-text">
        <span class="step-kicker">Schritt {{ index + 1 }}</span>
        <span class="step-label">{{ step.label }}</span>
      </span>
    </button>
  </aside>
</template>

<style scoped>
.step-rail {
  position: sticky;
  top: 72px;
  padding: 10px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.step-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--gray-600);
  text-align: left;
  cursor: pointer;
}

.step-item.active {
  border-color: rgba(181, 204, 24, 0.45);
  background: rgba(181, 204, 24, 0.11);
  color: var(--blickle-navy);
}

.step-item.done .step-icon {
  background: var(--blickle-green);
  color: var(--blickle-navy);
}

.step-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--gray-100);
  flex: 0 0 auto;
}

.step-text {
  display: grid;
  gap: 2px;
}

.step-kicker {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--gray-500);
  text-transform: uppercase;
}

.step-label {
  font-size: 0.86rem;
  font-weight: 800;
}

@media (max-width: 1380px) {
  .step-rail {
    position: static;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 820px) {
  .step-rail {
    grid-template-columns: 1fr;
  }
}
</style>
