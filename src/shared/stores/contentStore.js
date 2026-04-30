import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId, now } from '../utils/storage.js'
import { getTemplateById } from '../templates/registry.js'
import { validateContentForPublication } from '../templates/templateValidation.js'
import { contentRepository } from '../repositories/appRepositories.js'

const EDIT_LOCKED_STATUSES = new Set(['in_review', 'approved', 'archived'])

const STROBEL_ACADEMY_PARAMS = {
  kicker: 'ACADEMY | FÜHRUNGSKRÄFTEENTWICKLUNG',
  imageUrl: '/content/einblickle/martin-strobel-bei-blickle.jpeg',
  imageBadgeTitle: 'MARTIN STROBEL',
  imageBadgeSubtitle: 'zu Gast bei Blickle',
  headline: 'Martin Strobel zu Gast bei Blickle',
  body: 'Martin Strobel, ehemaliger Handball-Nationalspieler, Europameister und Olympia-Bronzemedaillengewinner, war zu Gast bei Blickle.',
  quote: 'In seinem Vortrag sprach er über Teamgeist, klare Rollen, Verantwortung und den Umgang mit Rückschlägen. Seine Botschaft: „Team statt Ego“ - Disziplin, Vertrauen und echter gemeinsamer Einsatz machen den Unterschied.',
  dateLabel: '29.04.2026',
  readingTime: '1 min',
  card1Title: 'Europameister & Olympia-Bronze',
  card2Title: 'Impulse für Führungskräfte',
  card3Title: 'Team statt Ego · Verantwortung · Rückschläge',
  footerTitle: 'AKTUELL IN DER BLICKLE ACADEMY',
  footerText: 'Praxisnahe Impulse für Führung, Teamgeist und Zusammenarbeit.',
}

const DKMS_HERO_PARAMS = {
  badge: 'INFO',
  kicker: 'ANKÜNDIGUNG · BLICKLE',
  headline: 'Held des Alltags: Stammzellspende',
  leadText: 'Ein Blickle-Mitarbeiter hat durch eine Stammzellspende über die DKMS einem Menschen das Leben gerettet.',
  bodyText: 'Wir sind stolz und dankbar für so viel Engagement.',
  highlightText: 'Auch Du kannst Dich registrieren lassen!',
  imageUrl: '/content/dkms/hands-heart.png',
  dateLabel: '2025',
  readingTime: '2 min',
  audienceLabel: 'Für alle Mitarbeiter:innen',
  audienceValue: 'Blickle Gruppe',
  footerStrong: 'Gemeinsam können wir Leben retten.',
  footerText: 'Jede Registrierung zählt.',
  ctaLabel: 'Mehr Infos zur DKMS',
  ctaUrl: 'https://www.dkms.de/',
}

const FRIDA_PROJECT_PARAMS = {
  kicker: 'PROJEKT-SHOWCASE',
  kategorie: 'NACHHALTIGKEIT',
  projektname: 'Frida Hochbeet',
  beschreibung: "Mitarbeiter haben gemeinsam Hochbeete für den Außenbereich gebaut. Frisches Gemüse und Kräuter fürs s'Rädle - nachhaltig und selbst angebaut!",
  imageUrl: '/content/projekte/frida-hochbeet-hero.png',
  authorLabel: 'BLICKLE TEAM',
  accent: '#B5CC18',
  theme: 'dark',
}

function normalizeSeedContent(items) {
  let changed = false
  const normalized = items.map((content) => {
    if (content.id === 'content-strobel' && content.templateId !== 'designer-academy-guest') {
      changed = true
      return {
        ...content,
        title: 'Martin Strobel zu Gast',
        description: 'Ex-Handball-Nationalspieler besucht Blickle.',
        type: 'text',
        status: 'approved',
        templateId: 'designer-academy-guest',
        templateParams: { ...STROBEL_ACADEMY_PARAMS },
      }
    }

    if (content.id === 'content-dkms' && content.templateId !== 'designer-dkms-hero') {
      changed = true
      return {
        ...content,
        title: 'DKMS: Blickle-Mitarbeiter rettet Leben',
        description: 'Stammzellspende eines Kollegen.',
        type: 'text',
        status: 'approved',
        templateId: 'designer-dkms-hero',
        templateParams: { ...DKMS_HERO_PARAMS },
      }
    }

    if (content.id === 'content-projekt-frida' && content.templateId !== 'designer-project-showcase') {
      changed = true
      const params = content.templateParams || {}
      return {
        ...content,
        title: 'Projekt: Frida Hochbeet',
        description: 'Nachhaltiges Mitarbeiter-Projekt.',
        type: 'text',
        status: 'approved',
        templateId: 'designer-project-showcase',
        templateParams: {
          ...FRIDA_PROJECT_PARAMS,
          projektname: params.projektname || FRIDA_PROJECT_PARAMS.projektname,
          beschreibung: params.beschreibung || FRIDA_PROJECT_PARAMS.beschreibung,
          kategorie: params.kategorie || FRIDA_PROJECT_PARAMS.kategorie,
        },
      }
    }

    return content
  })
  return { items: normalized, changed }
}

export const useContentStore = defineStore('content', () => {
  const loadedItems = contentRepository.load()
  const normalizedContent = normalizeSeedContent(loadedItems)
  const items = ref(normalizedContent.items)
  if (normalizedContent.changed) contentRepository.save(normalizedContent.items)

  function persist() { contentRepository.save(items.value) }
  function commit(nextItems) {
    const previous = items.value
    items.value = nextItems
    try {
      persist()
    } catch (error) {
      items.value = previous
      throw error
    }
    return items.value
  }

  const approved = computed(() => items.value.filter(c => c.status === 'approved' && !c.supersededAt))
  const drafts = computed(() => items.value.filter(c => c.status === 'draft'))
  const inReview = computed(() => items.value.filter(c => c.status === 'in_review'))

  function getById(id) { return items.value.find(c => c.id === id) }

  function isLocked(content) {
    return EDIT_LOCKED_STATUSES.has(content?.status)
  }

  function lockedContentError(content) {
    const error = new Error('Dieser Inhalt ist schreibgeschützt. Bitte eine neue Revision erstellen.')
    error.name = 'ContentLockedError'
    error.status = content?.status || ''
    error.contentId = content?.id || ''
    return error
  }

  function assertEditable(content) {
    if (!isLocked(content)) return
    throw lockedContentError(content)
  }

  function publicationIssues(content) {
    const template = content?.templateId ? getTemplateById(content.templateId) : null
    return validateContentForPublication(content, template)
  }

  function assertPublishable(content) {
    const issues = publicationIssues(content)
    if (!issues.length) return
    const error = new Error(`Inhalt ist noch nicht vollständig: ${issues.map(issue => issue.message).join(' ')}`)
    error.name = 'ContentValidationError'
    error.issues = issues
    throw error
  }

  function add(content) {
    const item = { ...content, id: generateId(), createdAt: now(), updatedAt: now(), status: 'draft', reviewEvents: content.reviewEvents || [] }
    commit([...items.value, item])
    return item
  }

  // Creates a new draft content entry from a template (designer or legacy).
  // Seeds the entry with the template's defaultParams. Caller navigates to the editor.
  function createFromTemplate(templateId, overrides = {}) {
    const tpl = getTemplateById(templateId)
    if (!tpl) return null
    const defaults = tpl.defaultParams ? JSON.parse(JSON.stringify(tpl.defaultParams)) : {}
    const content = {
      id: generateId(),
      title: overrides.title || tpl.name,
      description: overrides.description || '',
      type: 'template',
      templateId: tpl.id,
      templateParams: { ...defaults, ...(overrides.templateParams || {}) },
      tags: overrides.tags || [],
      status: 'draft',
      createdBy: overrides.createdBy || '',
      createdAt: now(),
      updatedAt: now(),
      validFrom: overrides.validFrom || null,
      validUntil: overrides.validUntil || null,
      locationIds: overrides.locationIds || [],
      reviewNote: overrides.reviewNote || '',
      reviewContext: overrides.reviewContext || null,
      reviewVersion: 0,
      reviewEvents: [],
    }
    commit([...items.value, content])
    return content
  }

  function update(id, changes, options = {}) {
    const idx = items.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const current = items.value[idx]
    if (!options.allowLocked) assertEditable(current)
    const updated = { ...current, ...changes, updatedAt: now() }
    commit(items.value.map((item, itemIdx) => itemIdx === idx ? updated : item))
    return updated
  }

  function remove(id) {
    const content = getById(id)
    if (content) assertEditable(content)
    commit(items.value.filter(c => c.id !== id))
  }

  function setStatus(id, status) {
    return update(id, { status })
  }

  function actorFields(actor = {}) {
    return {
      userId: actor.id || actor.userId || '',
      userName: actor.name || actor.userName || '',
    }
  }

  function appendReviewEvent(id, event) {
    const idx = items.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const content = items.value[idx]
    const reviewEvent = {
      id: generateId(),
      type: event.type,
      comment: event.comment?.trim?.() || '',
      createdAt: now(),
      ...actorFields(event.actor || event),
    }
    const updated = {
      ...content,
      updatedAt: now(),
      reviewEvents: [...(content.reviewEvents || []), reviewEvent],
    }
    commit(items.value.map((item, itemIdx) => itemIdx === idx ? updated : item))
    return updated
  }

  function createRevision(id, actor) {
    const source = getById(id)
    if (!source) return null
    if (!isLocked(source)) return source

    const timestamp = now()
    const actorInfo = actorFields(actor)
    const revisionBaseId = source.revisionOf || source.id
    const revision = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(),
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: actorInfo.userId || source.createdBy || '',
      reviewVersion: 0,
      reviewNote: source.reviewNote || '',
      reviewContext: null,
      submittedAt: null,
      submittedBy: null,
      publishedAt: null,
      approvedBy: null,
      supersededAt: null,
      supersededBy: null,
      revisionOf: revisionBaseId,
      basedOnContentId: source.id,
      basedOnReviewVersion: source.reviewVersion || 0,
      replacesContentId: source.status === 'approved' ? source.id : source.replacesContentId || null,
      reviewEvents: [
        {
          id: generateId(),
          type: 'revision_started',
          comment: `Neue Revision auf Basis von Version ${source.reviewVersion || 0}`,
          createdAt: timestamp,
          ...actorInfo,
        },
      ],
    }
    if (source.status === 'in_review') {
      commit(items.value
        .map(item => item.id === source.id
          ? { ...item, status: 'archived', supersededAt: timestamp, supersededBy: revision.id, updatedAt: timestamp }
          : item)
        .concat(revision)
      )
    } else {
      commit([...items.value, revision])
    }
    return revision
  }

  function setStatusWithReviewEvent(id, status, event) {
    const idx = items.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const content = items.value[idx]
    if (status === 'in_review' || status === 'approved') {
      assertPublishable(content)
    }
    const timestamp = now()
    const actor = actorFields(event.actor || event)
    const comment = event.comment?.trim?.() || ''
    const reviewEvent = {
      id: generateId(),
      type: event.type,
      comment,
      createdAt: timestamp,
      ...actor,
    }
    const updated = {
      ...content,
      status,
      updatedAt: timestamp,
      reviewEvents: [...(content.reviewEvents || []), reviewEvent],
    }
    if (status === 'in_review') {
      updated.reviewVersion = Number(content.reviewVersion || 0) + 1
      updated.submittedAt = timestamp
      updated.submittedBy = actor.userId
      updated.reviewNote = comment || content.reviewNote || ''
    }
    if (status === 'approved') {
      updated.publishedAt = timestamp
      updated.approvedBy = actor.userId
    }
    const replacesContentId = status === 'approved' ? content.replacesContentId : null
    commit(items.value.map((item, itemIdx) => {
      if (itemIdx === idx) return updated
      if (replacesContentId && item.id === replacesContentId && item.status === 'approved') {
        return {
          ...item,
          status: 'archived',
          supersededAt: timestamp,
          supersededBy: updated.id,
          updatedAt: timestamp,
        }
      }
      return item
    }))
    return updated
  }

  function submitForReview(id, actor, comment = '') {
    return setStatusWithReviewEvent(id, 'in_review', { type: 'submitted', actor, comment })
  }

  function approve(id, actor, comment = '') {
    return setStatusWithReviewEvent(id, 'approved', { type: 'approved', actor, comment })
  }

  function reject(id, actor, comment = '') {
    return setStatusWithReviewEvent(id, 'rejected', { type: 'rejected', actor, comment })
  }

  function moveToDraft(id, actor, comment = '') {
    const content = getById(id)
    if (content?.status === 'approved' || content?.status === 'in_review') {
      throw lockedContentError(content)
    }
    return setStatusWithReviewEvent(id, 'draft', { type: 'revision_started', actor, comment })
  }

  return {
    items,
    approved,
    drafts,
    inReview,
    getById,
    isLocked,
    publicationIssues,
    add,
    createFromTemplate,
    createRevision,
    update,
    remove,
    setStatus,
    appendReviewEvent,
    submitForReview,
    approve,
    reject,
    moveToDraft,
    persist,
  }
})
