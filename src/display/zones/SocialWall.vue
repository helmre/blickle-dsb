<script setup>
defineProps({
  title: { type: String, default: 'Social Media' },
  zoneId: String
})

// Ein Hero-Post (mit Bild) und ein kompakter Sekundär-Post je Spalte
const facebookHero = {
  id: 'fb-1',
  time: 'vor 3 Std.',
  text: 'Willkommen, neue Azubis! Diese Woche haben 12 neue Kolleginnen und Kollegen ihre Ausbildung bei uns in Rosenfeld begonnen. Wir wünschen euch einen tollen Start!',
  image: '/content/karriere/blickle-team.jpg',
  likes: 248,
  comments: 31,
}
const facebookSecondary = {
  id: 'fb-2',
  time: 'gestern',
  text: 'Unser neues Rad der Besten-Linie ist da — 30 % leichter bei gleicher Tragkraft. Ein Meilenstein für die Intralogistik.',
  likes: 412,
  comments: 47,
}

const linkedinHero = {
  id: 'li-1',
  time: 'vor 5 Std.',
  text: 'Blickle setzt auf Nachhaltigkeit: Unsere neue LED-Hallenbeleuchtung reduziert den Energieverbrauch um 15 %. Ein weiterer Schritt zu unserem Klimaziel 2030.',
  image: '/content/karriere/blickle-produktion.jpg',
  likes: 156,
  comments: 12,
}
const linkedinSecondary = {
  id: 'li-2',
  time: 'vor 2 Tagen',
  text: 'Stolze Momente: Ein Blickle-Mitarbeiter hat durch seine Stammzellspende über die DKMS einem Menschen das Leben gerettet. Danke für dein Engagement!',
  likes: 487,
  comments: 63,
}
</script>

<template>
  <div class="social-wall">
    <!-- Header -->
    <div class="sw-header">
      <div class="sw-header-accent"></div>
      <h3 class="sw-title">{{ title }}</h3>
      <span class="sw-subtitle">Blickle auf Social Media</span>
    </div>

    <!-- Feed Grid -->
    <div class="sw-feeds">
      <!-- Facebook -->
      <div class="sw-feed">
        <div class="sw-feed-header">
          <div class="sw-feed-icon sw-feed-icon-fb">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div class="sw-feed-meta">
            <span class="sw-feed-name">Blickle</span>
            <span class="sw-feed-handle">@blickle.rollen</span>
          </div>
          <span class="sw-feed-badge">Live</span>
        </div>
        <div class="sw-feed-content">
          <article class="sw-post sw-post--hero">
            <header class="sw-post-header">
              <div class="sw-post-avatar"><img src="/Blicklelogo.png" alt="Blickle" /></div>
              <div class="sw-post-meta">
                <span class="sw-post-author">Blickle Räder+Rollen GmbH</span>
                <span class="sw-post-time">{{ facebookHero.time }}</span>
              </div>
            </header>
            <p class="sw-post-text">{{ facebookHero.text }}</p>
            <img :src="facebookHero.image" alt="" class="sw-post-image sw-post-image--hero" />
            <footer class="sw-post-footer">
              <span class="sw-post-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7v-5.88"/><path d="M11 10a4 4 0 0 1-4-4V2"/></svg>
                {{ facebookHero.likes }}
              </span>
              <span class="sw-post-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ facebookHero.comments }}
              </span>
            </footer>
          </article>
          <article class="sw-post sw-post--compact">
            <header class="sw-post-header">
              <div class="sw-post-avatar"><img src="/Blicklelogo.png" alt="Blickle" /></div>
              <div class="sw-post-meta">
                <span class="sw-post-author">Blickle Räder+Rollen GmbH</span>
                <span class="sw-post-time">{{ facebookSecondary.time }}</span>
              </div>
            </header>
            <p class="sw-post-text">{{ facebookSecondary.text }}</p>
            <footer class="sw-post-footer">
              <span class="sw-post-stat">{{ facebookSecondary.likes }} Likes</span>
              <span class="sw-post-stat">{{ facebookSecondary.comments }} Kommentare</span>
            </footer>
          </article>
        </div>
      </div>

      <!-- LinkedIn -->
      <div class="sw-feed">
        <div class="sw-feed-header">
          <div class="sw-feed-icon sw-feed-icon-li">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div class="sw-feed-meta">
            <span class="sw-feed-name">Blickle</span>
            <span class="sw-feed-handle">Räder+Rollen GmbH · 18.200 Follower</span>
          </div>
          <span class="sw-feed-badge">Live</span>
        </div>
        <div class="sw-feed-content">
          <article class="sw-post sw-post--hero">
            <header class="sw-post-header">
              <div class="sw-post-avatar"><img src="/Blicklelogo.png" alt="Blickle" /></div>
              <div class="sw-post-meta">
                <span class="sw-post-author">Blickle Räder+Rollen GmbH</span>
                <span class="sw-post-time">{{ linkedinHero.time }}</span>
              </div>
            </header>
            <p class="sw-post-text">{{ linkedinHero.text }}</p>
            <img :src="linkedinHero.image" alt="" class="sw-post-image sw-post-image--hero" />
            <footer class="sw-post-footer">
              <span class="sw-post-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7v-5.88"/><path d="M11 10a4 4 0 0 1-4-4V2"/></svg>
                {{ linkedinHero.likes }}
              </span>
              <span class="sw-post-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ linkedinHero.comments }}
              </span>
            </footer>
          </article>
          <article class="sw-post sw-post--compact">
            <header class="sw-post-header">
              <div class="sw-post-avatar"><img src="/Blicklelogo.png" alt="Blickle" /></div>
              <div class="sw-post-meta">
                <span class="sw-post-author">Blickle Räder+Rollen GmbH</span>
                <span class="sw-post-time">{{ linkedinSecondary.time }}</span>
              </div>
            </header>
            <p class="sw-post-text">{{ linkedinSecondary.text }}</p>
            <footer class="sw-post-footer">
              <span class="sw-post-stat">{{ linkedinSecondary.likes }} Likes</span>
              <span class="sw-post-stat">{{ linkedinSecondary.comments }} Kommentare</span>
            </footer>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-wall {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px;
  gap: 20px;
}

/* ── Header ── */
.sw-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.sw-header-accent {
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: var(--d-accent, #B5CC18);
  flex-shrink: 0;
}

.sw-title {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--d-text, rgba(255,255,255,0.95));
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sw-subtitle {
  font-size: 0.75rem;
  color: var(--d-text-secondary, rgba(255,255,255,0.4));
  font-weight: 400;
}

/* ── Feed Grid ── */
.sw-feeds {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

/* ── Individual Feed ── */
.sw-feed {
  display: flex;
  flex-direction: column;
  background: var(--d-surface-content);
  border: none;
  border-radius: 16px;
  overflow: hidden;
  min-height: 0;
}

.sw-feed-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--d-ghost-border, rgba(255,255,255,0.06));
  background: var(--d-zone-header-bg);
  flex-shrink: 0;
}

.sw-feed-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sw-feed-icon-fb { background: rgba(24, 119, 242, 0.15); color: #1877F2; }
.sw-feed-icon-li { background: rgba(10, 102, 194, 0.15); color: #0A66C2; }

.sw-feed-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.sw-feed-name {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--d-text, rgba(255,255,255,0.95));
}

.sw-feed-handle {
  font-size: 0.72rem;
  color: var(--d-text-secondary, rgba(255,255,255,0.45));
}

.sw-feed-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(181, 204, 24, 0.15);
  color: var(--d-accent, #B5CC18);
  animation: pulse-badge 2.5s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

/* ── Feed Content ── */
.sw-feed-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  overflow: hidden;
  min-height: 0;
}

.sw-post {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  background: var(--d-zone-header-bg, rgba(255,255,255,0.03));
  border-radius: 14px;
  border: 1px solid var(--d-ghost-border, rgba(255,255,255,0.05));
  min-height: 0;
}

/* Hero-Post (with image) takes most of the column */
.sw-post--hero {
  flex: 3;
}

/* Compact secondary post below */
.sw-post--compact {
  flex: 0 0 auto;
  gap: 8px;
  padding: 14px 16px;
}

.sw-post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.sw-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 5px;
}

.sw-post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sw-post-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sw-post-author {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--d-text, rgba(255,255,255,0.95));
  line-height: 1.2;
}

.sw-post-time {
  font-size: 0.78rem;
  color: var(--d-text-secondary, rgba(255,255,255,0.5));
}

.sw-post-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--d-text, rgba(255,255,255,0.88));
  margin: 0;
  flex-shrink: 0;
}

.sw-post--compact .sw-post-text {
  font-size: 0.85rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sw-post-image {
  width: 100%;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.sw-post-image--hero {
  flex: 1;
  min-height: 0;
  max-height: none;
  height: auto;
}

.sw-post-footer {
  display: flex;
  gap: 22px;
  padding-top: 10px;
  border-top: 1px solid var(--d-ghost-border, rgba(255,255,255,0.06));
  flex-shrink: 0;
}

.sw-post-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--d-text-secondary, rgba(255,255,255,0.6));
  font-weight: 600;
}

.sw-post-stat svg {
  stroke: currentColor;
}
</style>
