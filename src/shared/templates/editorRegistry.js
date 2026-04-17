import { defineAsyncComponent } from 'vue'

// Maps registry.editorComponent name → Vue component.
// Used in ContentEditorPage to mount the correct editor for a given templateId.
// Display-side TemplateRenderer uses the same map with readonly=true.
export const editorRegistry = {
  DemoEditor: defineAsyncComponent(() => import('../../admin/designers/DemoEditor.vue')),
  VideoNewsEditor: defineAsyncComponent(() => import('../../admin/designers/VideoNewsEditor.vue')),
  JobPostingEditor: defineAsyncComponent(() => import('../../admin/designers/JobPostingEditor.vue')),
  MeetingCalloutEditor: defineAsyncComponent(() => import('../../admin/designers/MeetingCalloutEditor.vue')),
  LegalNoticeEditor: defineAsyncComponent(() => import('../../admin/designers/LegalNoticeEditor.vue')),
  RoomLocationEditor: defineAsyncComponent(() => import('../../admin/designers/RoomLocationEditor.vue')),
  VisitorAlertEditor: defineAsyncComponent(() => import('../../admin/designers/VisitorAlertEditor.vue')),
  CeoQuoteEditor: defineAsyncComponent(() => import('../../admin/designers/CeoQuoteEditor.vue')),
}

export function getEditor(name) {
  return editorRegistry[name] || null
}
