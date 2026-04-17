import { computed } from 'vue'

// Helper used by designer editor components to back a local field by
// content.templateParams via v-model. Emits `update:params` with the new
// merged object whenever any field changes.
//
// Usage inside a designer editor <script setup>:
//   const props = defineProps({ params: { type: Object, default: () => ({}) }, readonly: Boolean })
//   const emit = defineEmits(['update:params'])
//   const { field } = useParamModel(props, emit)
//   const headline = field('headline', 'Default headline')
//   // use headline.value in template OR v-model="headline"
export function useParamModel(props, emit) {
  function field(key, defaultValue) {
    return computed({
      get() {
        const v = props.params?.[key]
        return v === undefined || v === null ? defaultValue : v
      },
      set(value) {
        emit('update:params', { ...(props.params || {}), [key]: value })
      }
    })
  }

  function update(key, value) {
    emit('update:params', { ...(props.params || {}), [key]: value })
  }

  return { field, update }
}
