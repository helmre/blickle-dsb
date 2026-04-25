import { describe, expect, it } from 'vitest'
import { validateContentForPublication, validateTemplateParams } from './templateValidation.js'

describe('templateValidation', () => {
  it('requires QR announcement fields and validates URL-like values', () => {
    const template = { id: 'designer-demo' }

    expect(validateTemplateParams(template, {
      headline: 'Umfrage',
      body: 'Bitte teilnehmen',
      qr1Url: 'https://blickle.com/video',
      qr2Url: '/lokaler-link',
    })).toEqual([])

    const issues = validateTemplateParams(template, {
      headline: 'Umfrage',
      body: '',
      qr1Url: 'kein link',
      qr2Url: '',
    })

    expect(issues.map(issue => issue.key)).toEqual(['body', 'qr1Url', 'qr2Url'])
  })

  it('uses legacy parameter required flags', () => {
    const template = {
      id: 'tpl-announcement',
      parameters: [
        { key: 'titel', label: 'Titel', required: true },
        { key: 'text', label: 'Text', required: true },
        { key: 'datum', label: 'Datum', required: false },
      ],
    }

    expect(validateTemplateParams(template, { titel: 'A', text: '' }).map(issue => issue.key)).toEqual(['text'])
  })

  it('rejects temporary blob URLs for publishable media fields', () => {
    const template = { id: 'designer-video-news' }

    const issues = validateTemplateParams(template, {
      headline: 'Maschine',
      body: 'Update',
      videoUrl: 'blob:http://localhost:5173/temporary',
    })

    expect(issues.map(issue => issue.key)).toEqual(['videoUrl'])
  })

  it('allows media data URLs only for media URL fields', () => {
    expect(validateTemplateParams({ id: 'designer-video-news' }, {
      headline: 'Maschine',
      body: 'Update',
      videoUrl: 'data:video/mp4;base64,AAAA',
    })).toEqual([])

    const issues = validateTemplateParams({ id: 'designer-demo' }, {
      headline: 'Umfrage',
      body: 'Bitte teilnehmen',
      qr1Url: 'data:text/html;base64,PGgxPkZha2U8L2gxPg==',
      qr2Url: 'data:image/png;base64,AAAA',
    })

    expect(issues.map(issue => issue.key)).toEqual(['qr1Url', 'qr2Url'])
  })

  it('does not accept non-media protocols for media URL fields', () => {
    const issues = validateTemplateParams({ id: 'designer-video-news' }, {
      headline: 'Maschine',
      body: 'Update',
      videoUrl: 'mailto:team@example.com',
    })

    expect(issues.map(issue => issue.key)).toEqual(['videoUrl'])
  })

  it('validates content-level publication requirements', () => {
    const issues = validateContentForPublication(
      {
        title: '',
        type: 'template',
        templateId: 'designer-video-news',
        templateParams: { headline: 'Maschine', body: 'Update', videoUrl: '' },
        validFrom: '2026-05-02',
        validUntil: '2026-05-01',
      },
      { id: 'designer-video-news' }
    )

    expect(issues.map(issue => issue.key)).toEqual(['__title', '__validity', 'videoUrl'])
  })
})
