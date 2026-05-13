import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ADMIN_LOGIN_PATH, PUBLIC_ROUTES } from '../constants/publicRoutes'

const MOBILE_APP_DOWNLOAD_URL = import.meta.env.VITE_MOBILE_APP_DOWNLOAD_URL

const ROUTES = PUBLIC_ROUTES
const LOGIN_PATH = ADMIN_LOGIN_PATH

/** Design tokens — match `AdminDashboard.jsx` `C` for visual consistency. */
const C = {
  bg: '#0e0f13',
  bg2: '#13141a',
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accent: '#7c6af7',
  accentL: '#a99cf9',
  accentD: '#5548d9',
  teal: '#2dd4bf',
  coral: '#f87171',
  green: '#34d399',
  pink: '#f472b6',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toDateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

function seeded01(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2 ** 32
}

function buildSlotsForDay(dateKey) {
  const blocks = [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ]
  return blocks.map(([start, end], i) => {
    const seed = `${dateKey}|${start}|${end}|${i}`
    const available = seeded01(seed) > 0.35
    return { start, end, available }
  })
}

// ─── Styles (layout from public mockup + Dashboard `C` tokens & motion) ───────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --bg: ${C.bg};
    --surface: ${C.bg2};
    --surface2: ${C.bg3};
    --surface3: ${C.bg4};
    --border: ${C.border};
    --border2: ${C.border2};
    --text: ${C.text};
    --text2: ${C.text2};
    --text3: ${C.text3};
    --accent: ${C.accent};
    --accentL: ${C.accentL};
    --accentD: ${C.accentD};
    --teal: ${C.teal};
    --coral: ${C.coral};
    --green: ${C.green};
    --pink: ${C.pink};
    --font-display: ${C.display};
    --font-body: ${C.font};
    --font-mono: ${C.mono};
    --radius-lg: 16px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 12px rgba(124,106,247,0.25); }
    50%       { box-shadow: 0 0 28px rgba(124,106,247,0.55); }
  }
  @keyframes dashFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }
  @keyframes dotBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  #public-site ::-webkit-scrollbar { width: 4px; height: 4px; }
  #public-site ::-webkit-scrollbar-track { background: transparent; }
  #public-site ::-webkit-scrollbar-thumb { background: rgba(124,106,247,0.3); border-radius: 4px; }
  #public-site ::-webkit-scrollbar-thumb:hover { background: rgba(124,106,247,0.6); }

  a.pub-nav-link, button.pub-nav-link {
    text-decoration: none;
    color: inherit;
    font: inherit;
  }

  .pub-nav {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 0;
  }
  .pub-nav-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 clamp(16px, 3vw, 40px);
    min-height: 64px;
  }
  .pub-nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    min-width: 0;
  }
  .pub-nav-brand .brand-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accentD));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
    animation: dashFloat 3s ease-in-out infinite, glowPulse 2.5s ease-in-out infinite;
  }
  .pub-nav-brand span {
    font-family: var(--font-display);
    font-size: clamp(15px, 2vw, 17px);
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pub-nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 6px 0;
    mask-image: linear-gradient(to right, black calc(100% - 20px), transparent 100%);
  }
  .pub-nav-links::-webkit-scrollbar { display: none; }
  .pub-nav-link {
    padding: 8px 12px; border-radius: 10px; cursor: pointer;
    font-size: 13px; font-weight: 400; color: var(--text2);
    transition: background 0.18s ease, color 0.18s ease; background: none; border: none;
    font-family: var(--font-body); letter-spacing: 0.02em;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .pub-nav-link:hover {
    color: var(--accentL);
    background: rgba(124,106,247,0.08);
  }
  .pub-nav-link.active {
    color: var(--accentL);
    background: rgba(124,106,247,0.12);
    font-weight: 600;
  }
  .pub-nav-link.download {
    color: var(--teal);
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pub-nav-link.download:hover { background: rgba(45,212,191,0.1); color: var(--teal); }
  .pub-nav-dl-icon { flex-shrink: 0; opacity: 0.9; }
  .pub-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding-left: 8px;
    margin-left: 4px;
    border-left: 1px solid var(--border);
  }
  .pub-nav-burger {
    display: none;
    position: relative;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    margin-left: auto;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    padding: 0;
    transition: border-color 0.18s ease, background 0.18s ease;
  }
  .pub-nav-burger:hover {
    border-color: rgba(124,106,247,0.35);
    background: rgba(124,106,247,0.08);
  }
  .pub-nav-burger span {
    position: absolute;
    left: 11px;
    right: 11px;
    height: 2px;
    background: var(--text2);
    border-radius: 1px;
    transition: transform 0.22s ease, opacity 0.18s ease, top 0.22s ease;
  }
  .pub-nav-burger span:nth-child(1) { top: 15px; }
  .pub-nav-burger span:nth-child(2) { top: 21px; }
  .pub-nav-burger span:nth-child(3) { top: 27px; }
  .pub-nav-burger.is-open span:nth-child(1) { top: 21px; transform: rotate(45deg); }
  .pub-nav-burger.is-open span:nth-child(2) { opacity: 0; }
  .pub-nav-burger.is-open span:nth-child(3) { top: 21px; transform: rotate(-45deg); }

  .pub-login-btn {
    padding: 7px 16px; border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text2);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-body);
    transition: all 0.18s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .pub-login-btn:hover {
    border-color: rgba(124,106,247,0.45);
    color: var(--accentL);
    background: rgba(124,106,247,0.1);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  .pub-hero {
    text-align: center;
    padding: 48px 40px 56px;
    margin: 20px auto 0;
    max-width: 1200px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--surface2);
    background-image:
      radial-gradient(ellipse 70% 55% at 50% -25%, rgba(124,106,247,0.22), transparent 55%),
      radial-gradient(ellipse 45% 40% at 85% 0%, rgba(244,114,182,0.09), transparent 50%);
    box-shadow: 0 12px 40px rgba(0,0,0,0.28);
    animation: fadeUp 0.45s ease both;
  }
  .pub-hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 2.85rem);
    font-weight: 700;
    line-height: 1.12;
    margin-bottom: 16px;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .pub-hero h1 em {
    background: linear-gradient(135deg, var(--accentL), var(--pink));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-style: italic;
    font-weight: 800;
  }
  .pub-hero .pub-hero-lead {
    font-size: 15px;
    color: var(--text2);
    max-width: 720px;
    margin: 0 auto 16px;
    line-height: 1.65;
    font-family: var(--font-body);
    text-align: left;
  }
  .pub-hero .pub-hero-req113 {
    font-size: 14px;
    color: var(--text3);
    max-width: 720px;
    margin: 0 auto 28px;
    line-height: 1.6;
    font-family: var(--font-body);
    text-align: left;
  }
  .pub-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  .pub-cta {
    padding: 12px 28px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-body);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.18s ease, border-color 0.18s ease;
    border: none;
    letter-spacing: 0.04em;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .pub-cta.primary {
    background: linear-gradient(135deg, var(--accent), var(--accentD));
    color: #fff;
    box-shadow: 0 8px 28px rgba(124,106,247,0.35);
  }
  .pub-cta.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(124,106,247,0.45);
  }
  .pub-cta.secondary {
    background: var(--surface3);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .pub-cta.secondary:hover {
    border-color: rgba(124,106,247,0.35);
    background: rgba(124,106,247,0.08);
    transform: translateY(-2px);
  }

  .pub-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin: 28px auto 48px;
    max-width: 1200px;
    padding: 0 40px;
  }
  a.pub-feature-card.stat-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.18s ease;
    box-shadow: 0 8px 28px rgba(0,0,0,0.22);
    text-decoration: none;
    color: inherit;
    display: block;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.4s ease both;
  }
  a.pub-feature-card.stat-card:nth-child(1) { animation-delay: 0.05s; }
  a.pub-feature-card.stat-card:nth-child(2) { animation-delay: 0.12s; }
  a.pub-feature-card.stat-card:nth-child(3) { animation-delay: 0.18s; }
  a.pub-feature-card.stat-card::before {
    content: '';
    position: absolute;
    top: -28px;
    right: -28px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(124,106,247,0.14);
    filter: blur(24px);
    pointer-events: none;
  }
  a.pub-feature-card.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.38);
    border-color: rgba(124,106,247,0.25);
  }
  .pub-feature-icon { font-size: 36px; margin-bottom: 14px; position: relative; }
  .pub-feature-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: var(--font-body);
    color: var(--text);
    position: relative;
  }
  .pub-feature-desc {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.6;
    font-family: var(--font-body);
    position: relative;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 16px;
    font-family: var(--font-display);
    letter-spacing: 0.02em;
    flex-wrap: wrap;
  }
  .sh-line { flex: 1; height: 1px; background: var(--border); min-width: 40px; }
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .cal-header {
    font-size: 10px;
    font-weight: 600;
    color: var(--text3);
    text-align: center;
    padding: 6px 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: var(--font-body);
  }
  button.cal-day {
    min-height: 80px;
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 6px;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
    text-align: left;
    font: inherit;
    width: 100%;
    color: var(--text2);
  }
  button.cal-day:hover {
    border-color: var(--border2);
    background: rgba(255,255,255,0.04);
  }
  button.cal-day.other { opacity: 0.4; }
  button.cal-day.today { border-color: rgba(124,106,247,0.45); box-shadow: inset 0 0 0 2px rgba(124,106,247,0.25); }
  button.cal-day.selected {
    border-color: rgba(124,106,247,0.45);
    background: rgba(124,106,247,0.12);
    color: var(--text);
    outline: 2px solid rgba(124,106,247,0.35);
  }
  .cal-num {
    font-size: 12px;
    font-weight: 500;
    color: var(--text2);
    margin-bottom: 4px;
    font-family: var(--font-mono);
  }
  .cal-num.today { color: var(--accentL); font-weight: 700; }

  .avail-legend { display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
  .avail-dot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text2);
    font-family: var(--font-body);
  }
  .avail-dot::before { content: ''; width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .avail-dot.free::before { background: var(--teal); }
  .avail-dot.booked::before { background: var(--accent); }
  .avail-dot.full::before { background: var(--coral); }

  .card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.22);
    animation: fadeUp 0.5s ease 0.1s both;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
    text-decoration: none;
  }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn-secondary {
    background: transparent;
    color: var(--text3);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover {
    border-color: rgba(124,106,247,0.35);
    color: var(--accentL);
    background: rgba(124,106,247,0.1);
  }

  .pub-studio-split {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 960px) {
    .pub-studio-split { grid-template-columns: 1.15fr 0.85fr; align-items: start; }
  }
  .pub-slots-panel {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px;
    background: var(--surface3);
  }
  .pub-slots-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    font-family: var(--font-body);
  }
  .pub-slots-head strong { font-size: 14px; color: var(--text); }
  .pub-slots-live {
    font-size: 12px;
    color: var(--text3);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .pub-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: dotBlink 1.4s ease-in-out infinite;
  }
  .pub-slot-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface2);
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text2);
    transition: background 0.15s ease;
  }
  .pub-slot-row:hover { background: rgba(255,255,255,0.03); }
  .pub-slot-row:last-child { margin-bottom: 0; }
  .pub-pill {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
    font-family: var(--font-body);
  }
  .pub-pill-ok {
    border: 1px solid rgba(52,211,153,0.35);
    background: rgba(52,211,153,0.12);
    color: var(--green);
  }
  .pub-pill-no {
    border: 1px solid rgba(248,113,113,0.3);
    background: rgba(248,113,113,0.1);
    color: var(--coral);
  }

  .app-download-section {
    max-width: 1200px;
    margin: 0 auto 40px;
    padding: 0 24px;
  }
  .app-download-inner {
    background: linear-gradient(135deg, ${C.bg4} 0%, #252842 55%, ${C.accentD} 120%);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 48px;
    display: flex;
    align-items: center;
    gap: 40px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.45s ease 0.08s both;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .app-download-inner:hover {
    border-color: rgba(124,106,247,0.25);
    box-shadow: 0 12px 40px rgba(124,106,247,0.15);
  }
  .app-bg-note-1 {
    position: absolute;
    right: -20px;
    top: -30px;
    font-size: 160px;
    opacity: 0.07;
    line-height: 1;
    pointer-events: none;
    color: var(--accentL);
  }
  .app-bg-note-2 {
    position: absolute;
    right: 120px;
    bottom: -20px;
    font-size: 100px;
    opacity: 0.05;
    line-height: 1;
    pointer-events: none;
    color: var(--pink);
  }
  .app-text-side { flex: 1; min-width: 260px; position: relative; z-index: 1; }
  .app-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(124,106,247,0.12);
    border: 1px solid rgba(124,106,247,0.28);
    border-radius: 20px;
    padding: 5px 14px;
    margin-bottom: 16px;
  }
  .app-badge span {
    font-size: 11px;
    font-weight: 600;
    color: var(--accentL);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: var(--font-body);
  }
  .app-title {
    font-family: var(--font-display) !important;
    font-size: 32px !important;
    font-weight: 700 !important;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  .app-desc {
    color: rgba(240,239,244,0.72);
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 24px;
    max-width: 520px;
    font-family: var(--font-body);
  }
  .app-dl-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 12px;
    background: #fff;
    color: ${C.bg};
    font-weight: 700;
    font-size: 14px;
    font-family: var(--font-body);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .app-dl-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.3);
  }
  .app-qr-side { flex-shrink: 0; text-align: center; position: relative; z-index: 1; }
  .app-qr-wrap {
    background: rgba(255,255,255,0.96);
    border-radius: 16px;
    padding: 16px;
    display: inline-block;
    margin-bottom: 10px;
    transition: transform 0.2s ease;
  }
  .app-qr-wrap:hover { transform: scale(1.02); }
  .app-qr-label {
    font-size: 12px;
    color: rgba(240,239,244,0.5);
    line-height: 1.4;
    font-family: var(--font-body);
  }

  .calendar-section { max-width: 1200px; margin: 0 auto; padding: 0 24px 48px; }

  @media (max-width: 999px) {
    .pub-nav-bar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      grid-template-areas:
        "brand login burger"
        "links links links";
      column-gap: 8px;
      row-gap: 0;
      align-items: center;
      padding-top: 12px;
      padding-bottom: 12px;
    }
    .pub-nav-brand { grid-area: brand; min-width: 0; }
    .pub-nav-burger { display: block; grid-area: burger; margin-left: 0; }
    .pub-nav-right {
      grid-area: login;
      justify-self: end;
      margin-left: 0;
      padding-left: 0;
      border-left: none;
      min-width: 0;
    }
    .pub-nav-links {
      grid-area: links;
      flex: unset;
      flex-direction: column;
      align-items: stretch;
      overflow: visible;
      mask-image: none;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      gap: 2px;
      border-top: 1px solid transparent;
      transition: max-height 0.28s ease, opacity 0.2s ease, padding 0.2s ease, border-color 0.2s ease;
    }
    .pub-nav-links.is-open {
      max-height: 480px;
      opacity: 1;
      padding: 14px 0 8px;
      border-top-color: var(--border);
    }
    .pub-nav-link {
      width: 100%;
      text-align: left;
      padding: 12px 14px;
      border-radius: 10px;
    }
    .pub-login-btn {
      font-size: 12px;
      padding: 8px 12px;
      max-width: min(220px, 42vw);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (max-width: 900px) {
    .pub-features { grid-template-columns: 1fr; }
    .pub-hero { margin-left: 16px; margin-right: 16px; padding-left: 24px; padding-right: 24px; }
    .pub-hero h1 { font-size: 2rem; }
  }
`

function NavPhoneIcon() {
  return (
    <svg
      className="pub-nav-dl-icon"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function QRCode() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="110" height="110" fill="white" />
      <rect x="8" y="8" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="13" y="13" width="18" height="18" rx="1" fill="white" />
      <rect x="17" y="17" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="74" y="8" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="79" y="13" width="18" height="18" rx="1" fill="white" />
      <rect x="83" y="17" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="8" y="74" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="13" y="79" width="18" height="18" rx="1" fill="white" />
      <rect x="17" y="83" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="44" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="16" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="16" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="24" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="44" width="6" height="6" fill="#7c6af7" />
      <rect x="52" y="44" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="44" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="52" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="52" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="60" width="6" height="6" fill="#7c6af7" />
      <rect x="52" y="60" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="76" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="76" width="6" height="6" fill="#7c6af7" />
      <rect x="60" y="76" width="6" height="6" fill="#1a1814" />
    </svg>
  )
}

export default function LandingPage() {
  const location = useLocation()
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [liveTick, setLiveTick] = useState(0)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setNavOpen(false)
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.pathname])

  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const selectedSlots = useMemo(
    () => buildSlotsForDay(`${selectedKey}|tick:${liveTick}`),
    [selectedKey, liveTick],
  )

  useEffect(() => {
    const id = window.setInterval(() => setLiveTick((t) => t + 1), 8000)
    return () => window.clearInterval(id)
  }, [])

  const monthLabel = useMemo(
    () =>
      monthCursor.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [monthCursor],
  )

  const calendarWeeks = useMemo(() => {
    const first = startOfMonth(monthCursor)
    const startWeekday = first.getDay()
    const gridStart = new Date(first)
    gridStart.setDate(1 - startWeekday)
    const weeks = []
    let cursor = new Date(gridStart)
    for (let w = 0; w < 6; w += 1) {
      const week = []
      for (let d = 0; d < 7; d += 1) {
        week.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }
    return weeks
  }, [monthCursor])

  const todayKey = toDateKey(new Date())

  const scrollToAppDownload = () => {
    document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const downloadHref = MOBILE_APP_DOWNLOAD_URL || '/mobile-application'

  return (
    <>
      <style>{globalStyles}</style>
      <div
        id="public-site"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--bg)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <nav className="pub-nav" aria-label="Main">
          <div className="pub-nav-bar">
            <div className="pub-nav-brand">
              <div className="brand-icon">♬</div>
              <span>Cadenza Music Center</span>
            </div>
            <div
              id="pub-nav-links"
              className={`pub-nav-links${navOpen ? ' is-open' : ''}`}
            >
              <NavLink
                to="/"
                end
                className={({ isActive }) => `pub-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                Home
              </NavLink>
              <Link className="pub-nav-link" to={ROUTES.registration} onClick={() => setNavOpen(false)}>
                Registration
              </Link>
              <Link className="pub-nav-link" to={ROUTES.enrollment} onClick={() => setNavOpen(false)}>
                Enroll
              </Link>
              <Link className="pub-nav-link" to={ROUTES.rental} onClick={() => setNavOpen(false)}>
                Instrument Rental
              </Link>
              <Link className="pub-nav-link" to={ROUTES.studioBooking} onClick={() => setNavOpen(false)}>
                Studio Booking
              </Link>
              <button
                type="button"
                className="pub-nav-link download"
                onClick={() => {
                  setNavOpen(false)
                  scrollToAppDownload()
                }}
              >
                <NavPhoneIcon />
                Download app
              </button>
            </div>
            <div className="pub-nav-right">
              <Link className="pub-login-btn" to={LOGIN_PATH} onClick={() => setNavOpen(false)}>
                Staff / Student Login →
              </Link>
            </div>
            <button
              type="button"
              className={`pub-nav-burger${navOpen ? ' is-open' : ''}`}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              aria-controls="pub-nav-links"
              onClick={() => setNavOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        <div className="pub-section active" id="pub-home" style={{ padding: 0 }}>
          <div className="pub-hero">
            <h1>
              Cadenza Music Center
              <br />
              <em>- by rain.</em>
            </h1>
            <div className="pub-hero-btns">
              <Link className="pub-cta primary" to={ROUTES.registration}>
                Registration
              </Link>
              <Link className="pub-cta secondary" to={ROUTES.enrollment}>
                Enrollment
              </Link>
            </div>
          </div>

          <div className="pub-features">
            <Link className="pub-feature-card stat-card" to={ROUTES.enrollment}>
              <div className="pub-feature-icon">🎓</div>
              <div className="pub-feature-title">Enrollment</div>
              <div className="pub-feature-desc">Open enrollment to continue.</div>
            </Link>
            <Link className="pub-feature-card stat-card" to={ROUTES.rental}>
              <div className="pub-feature-icon">🎸</div>
              <div className="pub-feature-title">Instrument rental</div>
              <div className="pub-feature-desc">Instrument rental services.</div>
            </Link>
            <Link className="pub-feature-card stat-card" to={ROUTES.studioBooking}>
              <div className="pub-feature-icon">🎵</div>
              <div className="pub-feature-title">Studio room booking</div>
              <div className="pub-feature-desc">Studio booking services.</div>
            </Link>
          </div>

          <div id="mobile-app" className="app-download-section" aria-labelledby="app-dl-title">
            <div className="app-download-inner">
              <div className="app-bg-note-1">🎵</div>
              <div className="app-bg-note-2">🎹</div>
              <div className="app-text-side">
                <div className="app-badge">
                  <span>Mobile</span>
                </div>
                <h2 className="app-title" id="app-dl-title">
                  Mobile application
                </h2>
                <p className="app-desc">
                  {'The Client shall be able to download the system\u2019s mobile application.'}
                </p>
                <a
                  className="app-dl-primary"
                  href={downloadHref}
                  {...(MOBILE_APP_DOWNLOAD_URL ? { download: true } : {})}
                >
                  Download mobile application
                </a>
              </div>
              <div className="app-qr-side">
                <div className="app-qr-wrap">
                  <QRCode />
                </div>
                <div className="app-qr-label">
                  Scan to download
                  <br />
                  the Cadenza app
                </div>
              </div>
            </div>
          </div>

          <div className="calendar-section">
            <div className="card">
              <div className="section-heading">
                <span>Live studio availability — {monthLabel}</span>
                <span className="sh-line" />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  aria-label="Previous month"
                  onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  aria-label="Next month"
                  onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                >
                  ›
                </button>
                <Link className="btn btn-sm btn-secondary" to={ROUTES.studioBooking}>
                  Book Now →
                </Link>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text2)',
                  marginBottom: 16,
                  lineHeight: 1.65,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Real-time availability through the interactive calendar. Select a day to check schedules before you
                proceed with a transaction or inquiry.
              </p>
              <div className="pub-studio-split" aria-live="polite">
                <div>
                  <div className="calendar-grid" role="grid" aria-label="Studio room calendar">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="cal-header">
                        {d}
                      </div>
                    ))}
                    {calendarWeeks.map((week) =>
                      week.map((day) => {
                        const inMonth = day.getMonth() === monthCursor.getMonth()
                        const key = toDateKey(day)
                        const isSelected = key === selectedKey
                        const isToday = key === todayKey
                        return (
                          <button
                            key={key}
                            type="button"
                            className={[
                              'cal-day',
                              !inMonth ? 'other' : '',
                              isToday ? 'today' : '',
                              isSelected ? 'selected' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              setSelectedDate(day)
                              setMonthCursor(startOfMonth(day))
                            }}
                            aria-pressed={isSelected}
                          >
                            <div className={`cal-num${isToday ? ' today' : ''}`}>{day.getDate()}</div>
                          </button>
                        )
                      }),
                    )}
                  </div>
                  <div className="avail-legend">
                    <span className="avail-dot free">Available</span>
                    <span className="avail-dot booked">Booked</span>
                    <span className="avail-dot full">Fully booked</span>
                  </div>
                </div>
                <div className="pub-slots-panel">
                  <div className="pub-slots-head">
                    <strong>{selectedDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                    <span className="pub-slots-live">
                      <span className="pub-live-dot" aria-hidden />
                      Real-time availability — updates automatically
                    </span>
                  </div>
                  {selectedSlots.map((s) => (
                    <div key={`${s.start}-${s.end}`} className="pub-slot-row">
                      <span>
                        {s.start}–{s.end}
                      </span>
                      <span className={s.available ? 'pub-pill pub-pill-ok' : 'pub-pill pub-pill-no'}>
                        {s.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
