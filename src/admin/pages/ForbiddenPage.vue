<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <div class="forbidden-icon">&#128274;</div>
      <h2>Zugriff nicht erlaubt</h2>
      <p>Deine aktuelle Rolle hat für diesen Bereich keine Berechtigung.</p>
      <router-link class="btn-primary" to="/admin">Zum Dashboard</router-link>
    </div>
  </div>
</template>

<style scoped>
.forbidden-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
}

.forbidden-card {
  width: min(460px, 100%);
  padding: 36px;
  background: var(--blickle-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.forbidden-icon {
  font-size: 2.6rem;
  margin-bottom: 12px;
}

.forbidden-card h2 {
  font-family: var(--font-display);
  color: var(--blickle-navy);
  margin: 0 0 8px;
}

.forbidden-card p {
  color: var(--gray-600);
  margin: 0 0 20px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  background: var(--blickle-navy);
  color: white;
  border-radius: 8px;
  font-weight: 700;
}
</style>
