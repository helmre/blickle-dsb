function makeMonthStatuses(pattern) {
  const out = Array(31).fill(null)
  for (const [day, status] of Object.entries(pattern)) {
    out[Number(day) - 1] = status
  }
  return out
}

export function getShopfloorSeed() {
  const todayDate = 14
  const fillGreen = (upTo) => {
    const arr = Array(31).fill(null)
    for (let i = 0; i < upTo; i++) arr[i] = 'green'
    return arr
  }
  return {
    departmentName: 'FB1 – Einlegepressen',
    monthLabel: 'Apr 26',
    week: 'KW 16',
    todayDate,
    reportingDayIdx: 0,
    rundgang: { time: '09:15', moderator: 'M. Huber', durationSeconds: 300 },

    columns: {
      S: {
        label: 'Sicherheit',
        monthStatuses: makeMonthStatuses({
          ...Object.fromEntries(Array.from({ length: todayDate }, (_, i) => [i + 1, 'green'])),
          3: 'yellow'
        }),
        mainKpi: { value: '42', unit: 'Tage', label: 'ohne Arbeitsunfall', status: 'green' },
        incidentHistory: [
          { days: 42, date: '18.03.' },
          { days: 15, date: '04.02.' },
          { days: 30, date: '20.01.' },
          { days: 77, date: '04.12.' },
        ],
        themes: [
          { pdca: 'do',    title: 'Schnittschutzhandschuhe Werkerunterweisung', owner: 'Meister Huber', role: 'meister' },
          { pdca: 'check', title: 'Ergonomie Arbeitsplatz 12', owner: 'Meister Huber', role: 'meister' },
        ]
      },
      Q: {
        label: 'Qualitaet',
        monthStatuses: makeMonthStatuses({
          ...Object.fromEntries(Array.from({ length: todayDate }, (_, i) => [i + 1, 'green'])),
          7: 'yellow', 11: 'red', 14: 'yellow'
        }),
        mainKpi: { value: '0 / 1', label: 'Reklamationen (Kunde/Intern)', status: 'yellow', subValue: '5 Tage ohne Rekla.' },
        incidentHistory: [
          { days: 5,  date: '11.04.' },
          { days: 12, date: '30.03.' },
          { days: 2,  date: '17.03.' },
          { days: 28, date: '15.03.' },
        ],
        reklaWeekly: [
          { label: 'KW12', intern: 2, kunde: 0 },
          { label: 'KW13', intern: 1, kunde: 1 },
          { label: 'KW14', intern: 0, kunde: 0 },
          { label: 'KW15', intern: 3, kunde: 0 },
          { label: 'KW16', intern: 1, kunde: 0 },
        ],
        themes: [
          { pdca: 'plan', title: 'Rueckstandsanalyse Auftrag 4221', owner: 'QS Mueller', role: 'qs', dueDate: '22.04.' },
          { pdca: 'act',  title: 'Abweichung Pressen-Parameter', owner: 'QS Mueller', role: 'qs' },
        ]
      },
      K: {
        label: 'Kapazitaet',
        monthStatuses: makeMonthStatuses({
          ...Object.fromEntries(Array.from({ length: todayDate }, (_, i) => [i + 1, 'green'])),
          5: 'yellow', 9: 'yellow'
        }),
        mainKpi: { value: '18 / 20', label: 'anwesend', status: 'green', subValue: '85 % Maschinen-Auslastung' },
        attendance: {
          total: 20,
          days: [
            { d: 'Mo', anwesend: 18, urlaub: 1, krank: 1, ausgeliehen: 0 },
            { d: 'Di', anwesend: 17, urlaub: 1, krank: 2, ausgeliehen: 0 },
            { d: 'Mi', anwesend: 18, urlaub: 1, krank: 1, ausgeliehen: 0 },
            { d: 'Do', anwesend: 19, urlaub: 0, krank: 1, ausgeliehen: 0 },
            { d: 'Fr', anwesend: 18, urlaub: 1, krank: 0, ausgeliehen: 1 },
          ]
        },
        themes: [
          { pdca: 'do',   title: 'Reparatur Hebelmechanik Maschine 6333', owner: 'Instandhaltung', role: 'fertsteuerer', magnet: 'wart-ek' },
          { pdca: 'plan', title: 'Sonderfahrt zum Verzinker', owner: 'Fertsteuerer K.', role: 'fertsteuerer', kind: 'entscheidung' },
        ]
      },
      T: {
        label: 'Termintreue',
        monthStatuses: fillGreen(todayDate),
        mainKpi: { value: '97 %', label: 'On-Time Delivery', status: 'green' },
        backlog: { yellow: 3, red: 1, label: 'Rueckstaende' },
        backlogTrend: [
          { d: '1', yellow: 0, red: 0 },  { d: '2', yellow: 2, red: 0 },
          { d: '3', yellow: 1, red: 0 },  { d: '4', yellow: 0, red: 1 },
          { d: '5', yellow: 4, red: 0 },  { d: '6', yellow: 1, red: 0 },
          { d: '7', yellow: 2, red: 0 },  { d: '8', yellow: 0, red: 0 },
          { d: '9', yellow: 3, red: 0 },  { d: '10', yellow: 1, red: 0 },
          { d: '11', yellow: 0, red: 0 }, { d: '12', yellow: 2, red: 1 },
          { d: '13', yellow: 1, red: 0 }, { d: '14', yellow: 3, red: 1 },
        ],
        themes: [
          { kind: 'backlog', title: 'Kundenrueckstand Auftrag 89221', status: 'red' },
          { kind: 'backlog', title: '3 Auftraege nicht fristgerecht eingelagert', status: 'yellow' },
        ]
      },
      P: {
        label: 'Produktivitaet',
        monthStatuses: makeMonthStatuses({
          ...Object.fromEntries(Array.from({ length: todayDate }, (_, i) => [i + 1, 'green'])),
          2: 'red', 10: 'red'
        }),
        mainKpi: { value: '103 %', label: 'Netto-Leistung', status: 'green', subValue: '2 MA unter 100 %' },
        leistungSeries: [98, 96, 101, 99, 102, 100, 103, 105, 102, 104],
        leistungTarget: 100,
        themes: [
          { kind: 'info', title: 'Ruestzeit im Ziel', status: 'green' },
          { kind: 'info', title: '2 MA unter 100 % — Schulung DI geplant', status: 'yellow' },
        ]
      },
      O: {
        label: 'Optimierung',
        monthStatuses: fillGreen(todayDate),
        mainKpi: { value: '3 neu', label: 'KVP-Ideen', status: 'green', subValue: '1 umgesetzt' },
        audit: {
          overall: 90,
          categories: [
            { key: 'ASI', value: 100 },
            { key: 'O&S', value: 89 },
            { key: 'STD', value: 87 },
            { key: 'QM',  value: 92 },
            { key: 'KVP', value: 75 },
          ],
          topMeasures: [
            { text: 'KVP-Wissen unterweisen — Alle MA foerdern', done: false },
            { text: 'Anfahrschutz an Regal (KSO) anbringen', done: true },
            { text: 'Papier u. Kunststoff im Stahlschrott', done: false },
          ]
        },
        themes: [
          { pdca: 'plan',  title: 'TE-Optimierung Band 3020', owner: 'Meister Huber', role: 'meister' },
          { pdca: 'check', title: 'KVP Materialfluss Halle 1', owner: 'Assistent BL', role: 'asst-bl' },
        ]
      }
    }
  }
}

export const COLUMN_ORDER = ['S', 'Q', 'K', 'T', 'P', 'O']
export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr']
export const PDCA_COLORS = {
  plan:  { bg: '#EF4444', label: 'P' },
  do:    { bg: '#F59E0B', label: 'D' },
  check: { bg: '#3B82F6', label: 'C' },
  act:   { bg: '#10B981', label: 'A' },
}
export const ROLE_COLORS = {
  meister:      { border: '#6B7280', label: 'Meister' },
  qs:           { border: '#EF4444', label: 'QS' },
  fertsteuerer: { border: '#3B82F6', label: 'Fertigungssteuerer' },
  'asst-bl':    { border: '#10B981', label: 'Assistent BL' },
}
export const STATUS_COLORS = {
  green:  '#10B981',
  yellow: '#F59E0B',
  red:    '#EF4444',
  blue:   '#3B82F6',
}

export const MAGNET_LABELS = {
  'aufgenommen': 'Aufgenommen',
  'ih-informiert': 'IH informiert',
  'wart-ek': 'Warten auf EK',
  'ext-monteur': 'Externer Monteur',
}
export const MAGNET_COLORS = {
  'aufgenommen': '#6B7280',
  'ih-informiert': '#3B82F6',
  'wart-ek': '#F59E0B',
  'ext-monteur': '#8B5CF6',
}
