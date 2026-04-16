<script setup>
import { computed } from 'vue'
import ShopfloorHeader from './ShopfloorHeader.vue'
import ColumnHeader from './ColumnHeader.vue'
import LetterMosaic from './LetterMosaic.vue'
import KpiCard from './KpiCard.vue'
import ThemeListItem from './ThemeListItem.vue'
import BacklogIndicator from './BacklogIndicator.vue'
import IncidentCounterTable from './IncidentCounterTable.vue'
import ReklaBarChart from './ReklaBarChart.vue'
import LeistungSparkline from './LeistungSparkline.vue'
import AnwesenheitChart from './AnwesenheitChart.vue'
import BacklogTrend from './BacklogTrend.vue'
import AuditScoreCard from './AuditScoreCard.vue'
import { COLUMN_ORDER, STATUS_COLORS } from '../utils/shopfloorSeed.js'

const props = defineProps({
  board: { type: Object, required: true },
  isRunning: { type: Boolean, default: false },
})

const columnAccents = {
  S: '#EF4444',
  Q: '#F59E0B',
  K: '#3B82F6',
  T: '#8B5CF6',
  P: '#B5CC18',
  O: '#10B981',
}

const cols = computed(() => COLUMN_ORDER.map(key => ({
  key,
  accent: columnAccents[key],
  data: props.board.columns[key]
})))
</script>

<template>
  <div class="sfm-board">
    <ShopfloorHeader
      :department-name="board.departmentName"
      :week="board.week"
      :rundgang-time="board.rundgang.time"
      :moderator="board.rundgang.moderator"
      :timer-seconds="board.rundgang.durationSeconds"
      :is-running="isRunning"
    />

    <div class="sfm-grid">
      <div v-for="col in cols" :key="col.key" class="sfm-col">
        <ColumnHeader :letter="col.key" :label="col.data.label" :accent="col.accent" />

        <div class="mosaic-wrap">
          <div class="mosaic-head">
            <span class="mosaic-month">{{ board.monthLabel }}</span>
            <span class="mosaic-dept">{{ board.departmentName.split('–')[1]?.trim() || board.departmentName }}</span>
          </div>
          <LetterMosaic
            :letter="col.key"
            :month-statuses="col.data.monthStatuses || []"
            :today-date="board.todayDate"
            :accent="col.accent"
          />
        </div>

        <KpiCard
          :value="col.data.mainKpi.value"
          :label="col.data.mainKpi.label"
          :status="col.data.mainKpi.status"
          :unit="col.data.mainKpi.unit || ''"
          :sub-value="col.data.mainKpi.subValue || ''"
        />

        <IncidentCounterTable
          v-if="col.key === 'S' && col.data.incidentHistory"
          title="Tage ohne Unfall"
          :entries="col.data.incidentHistory"
        />
        <IncidentCounterTable
          v-else-if="col.key === 'Q' && col.data.incidentHistory"
          title="Tage ohne Rekla."
          :entries="col.data.incidentHistory"
        />

        <ReklaBarChart
          v-if="col.key === 'Q' && col.data.reklaWeekly"
          :weeks="col.data.reklaWeekly"
        />

        <AnwesenheitChart
          v-if="col.key === 'K' && col.data.attendance"
          :days="col.data.attendance.days"
          :total="col.data.attendance.total"
        />

        <LeistungSparkline
          v-if="col.key === 'P' && col.data.leistungSeries"
          :values="col.data.leistungSeries"
          :target="col.data.leistungTarget || 100"
        />

        <BacklogIndicator
          v-if="col.data.backlog"
          :yellow="col.data.backlog.yellow"
          :red="col.data.backlog.red"
          :label="col.data.backlog.label"
        />

        <BacklogTrend
          v-if="col.key === 'T' && col.data.backlogTrend"
          :days="col.data.backlogTrend"
        />

        <AuditScoreCard
          v-if="col.key === 'O' && col.data.audit"
          :categories="col.data.audit.categories"
          :overall="col.data.audit.overall"
          :top-measures="col.data.audit.topMeasures"
        />

        <div class="theme-list" v-if="col.data.themes?.length">
          <div class="theme-list-label">
            {{ col.key === 'T' || col.key === 'P' ? 'Hinweise' : 'Aktive Themen' }}
          </div>
          <ThemeListItem
            v-for="(theme, i) in col.data.themes"
            :key="i"
            :theme="theme"
          />
        </div>
      </div>
    </div>

    <footer class="sfm-footer">
      <span>Stand {{ board.week }} · {{ board.reportingDay || 'Montag' }}</span>
      <span class="sep">·</span>
      <span>Rundgang {{ board.rundgang.time }} Uhr mit {{ board.rundgang.moderator }}</span>
      <span class="spacer"></span>
      <span class="legend">
        <span class="legend-dot" :style="{ background: STATUS_COLORS.green }"></span> i.O.
        <span class="legend-dot" :style="{ background: STATUS_COLORS.yellow }"></span> Hinweis
        <span class="legend-dot" :style="{ background: STATUS_COLORS.red }"></span> Handlung
      </span>
    </footer>
  </div>
</template>

<style scoped>
.sfm-board {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0A1A33 0%, #122E54 50%, #163A6C 100%);
  color: #fff;
  padding: 28px 40px 20px;
  box-sizing: border-box;
  font-family: var(--font-body);
}

.sfm-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-top: 18px;
}

.sfm-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.mosaic-wrap {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 10px 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.mosaic-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 2px;
}
.mosaic-month {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.mosaic-dept {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.03em;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.theme-list-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 2px;
}

.sfm-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.03em;
  font-weight: 500;
}
.sep { opacity: 0.4; }
.spacer { flex: 1; }
.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 6px;
  box-shadow: 0 0 8px currentColor;
}
</style>
