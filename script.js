/* Eco Tracker — local-only habit tracking. No backend or API required. */
(() => {
  "use strict";

  const HABITS = [
    {id:"bottle", title:"Carried a reusable bottle", desc:"Skipped single-use plastic bottles today.", icon:"🚰", category:"Waste"},
    {id:"lights", title:"Switched off unused lights", desc:"Saved electricity when leaving a room.", icon:"💡", category:"Energy"},
    {id:"bag", title:"Used a reusable shopping bag", desc:"Said no to an unnecessary plastic bag.", icon:"🛍️", category:"Waste"},
    {id:"tap", title:"Saved water while brushing", desc:"Turned off the tap when it was not needed.", icon:"💧", category:"Water"},
    {id:"walk", title:"Walked or cycled for a short trip", desc:"Chose an active option when safe and practical.", icon:"🚲", category:"Nature"},
    {id:"fan", title:"Switched off unused fans or devices", desc:"Avoided wasting energy when not in use.", icon:"🔌", category:"Energy"},
    {id:"waste", title:"Sorted waste properly", desc:"Separated recyclable and general waste.", icon:"♻️", category:"Waste"},
    {id:"plant", title:"Cared for a plant or tree", desc:"Watered a plant or helped care for green space.", icon:"🪴", category:"Nature"},
    {id:"food", title:"Avoided wasting food", desc:"Took only what I could finish or saved leftovers.", icon:"🥗", category:"Waste"},
    {id:"shower", title:"Kept my shower short", desc:"Used water thoughtfully while washing.", icon:"🚿", category:"Water"},
    {id:"paper", title:"Used less paper", desc:"Used digital notes or both sides of paper.", icon:"📄", category:"Waste"},
    {id:"litter", title:"Kept my surroundings clean", desc:"Used a bin and left nature litter-free.", icon:"🌳", category:"Nature"}
  ];

  const DAILY_TIPS = [
    "You don't need to be perfect. You just need to begin.",
    "Before buying something new, ask: can I reuse or repair what I already have?",
    "A reusable bottle is a small habit that can reduce single-use waste.",
    "Turn off lights when daylight is enough for your room.",
    "Plan meals and store food well to help prevent food waste.",
    "Bring a reusable bag when you go shopping.",
    "A clean neighbourhood is good for people, animals, and plants.",
    "Every drop counts: close the tap while brushing your teeth."
  ];

  const $ = (id) => document.getElementById(id);
  const STORE_KEY = "ecoTrackerData_v1";
  const THEME_KEY = "ecoTrackerTheme";
  let data = loadData();
  let selectedDate = dateKey(new Date());
  let activeFilter = "All";
  let tipIndex = Math.floor(Math.random() * DAILY_TIPS.length);
  let toastTimer;

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function parseDate(key) {
    const [y,m,d] = key.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  function shiftDate(key, days) {
    const date = parseDate(key);
    date.setDate(date.getDate() + days);
    return dateKey(date);
  }
  function prettyDate(key, includeYear = false) {
    const d = parseDate(key);
    const options = { weekday:"short", month:"short", day:"numeric" };
    if (includeYear) options.year = "numeric";
    return d.toLocaleDateString(undefined, options);
  }
  function loadData() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {days:{}};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.days) return {days:{}};
      return parsed;
    } catch (error) {
      return {days:{}};
    }
  }
  function saveData() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      showToast("Browser storage is unavailable. Your changes may not be saved.");
      return false;
    }
  }
  function dayState(key = selectedDate) {
    if (!data.days[key]) data.days[key] = {checked:[]};
    if (!Array.isArray(data.days[key].checked)) data.days[key].checked = [];
    data.days[key].checked = [...new Set(data.days[key].checked.filter(id => HABITS.some(h => h.id === id)))];
    return data.days[key];
  }
  function checkedIds(key = selectedDate) { return dayState(key).checked; }
  function metrics(key = selectedDate) {
    const count = checkedIds(key).length;
    return {count, total:HABITS.length, score:Math.round(count / HABITS.length * 100), percent:Math.round(count / HABITS.length * 100)};
  }
  function trackedKeys() {
    return Object.keys(data.days).filter(key => data.days[key] && Array.isArray(data.days[key].checked));
  }
  function streak() {
    let cursor = dateKey(new Date());
    let result = 0;
    // A day counts towards a streak when at least one habit was checked.
    while (data.days[cursor] && data.days[cursor].checked && data.days[cursor].checked.length > 0) {
      result++;
      cursor = shiftDate(cursor, -1);
    }
    return result;
  }
  function renderDate() {
    const today = dateKey(new Date());
    $("selectedDate").textContent = selectedDate === today ? `Today · ${prettyDate(selectedDate)}` : prettyDate(selectedDate, true);
    $("nextDay").disabled = selectedDate >= today;
  }
  function renderHabits() {
    const grid = $("habitGrid");
    const done = checkedIds();
    const visible = HABITS.filter(h => activeFilter === "All" || h.category === activeFilter);
    $("allCount").textContent = HABITS.length;
    if (!visible.length) {
      grid.innerHTML = '<div class="empty-filter">No habits found in this category.</div>';
      return;
    }
    grid.innerHTML = visible.map(h => {
      const isDone = done.includes(h.id);
      return `<label class="habit-card ${isDone ? "done" : ""}" for="habit-${h.id}">
        <input class="habit-check" type="checkbox" id="habit-${h.id}" data-habit="${h.id}" ${isDone ? "checked" : ""} aria-label="${h.title}">
        <span class="habit-icon" aria-hidden="true">${h.icon}</span>
        <span class="habit-content"><h3>${h.title}</h3><p>${h.desc}</p><span class="habit-meta"><span class="habit-category">${h.category}</span><span class="habit-points">+${Math.round(100/HABITS.length)} eco points</span></span></span>
      </label>`;
    }).join("");
    grid.querySelectorAll("[data-habit]").forEach(input => {
      input.addEventListener("change", () => {
        const ids = checkedIds();
        if (input.checked && !ids.includes(input.dataset.habit)) ids.push(input.dataset.habit);
        if (!input.checked) {
          const index = ids.indexOf(input.dataset.habit);
          if (index >= 0) ids.splice(index, 1);
        }
        dayState().checked = ids;
        saveData();
        renderAll();
        showToast(input.checked ? "Nice work! Habit added to your day 🌱" : "Habit unchecked. Every step still counts.");
      });
    });
  }
  function renderMetrics() {
    const m = metrics();
    $("heroScore").innerHTML = `${m.score}<span>/100</span>`;
    $("heroCompleted").innerHTML = `${m.count}<span>/${m.total}</span>`;
    $("heroStreak").textContent = `${streak()} ${streak() === 1 ? "day" : "days"}`;
    $("scoreNumber").textContent = m.score;
    $("scoreRing").style.setProperty("--score", `${m.score}%`);
    $("progressText").textContent = `${m.percent}%`;
    $("progressFill").style.width = `${m.percent}%`;
    $("completedText").textContent = `${m.count} of ${m.total}`;
    $("progressBigScore").textContent = m.score;
    $("scoreStatus").textContent = m.score === 100 ? "Eco champion!" : m.score >= 70 ? "Great momentum!" : m.score >= 35 ? "Growing greener" : m.score > 0 ? "Nice start!" : "Just getting started";
    $("wideProgressText").textContent = `${m.percent}% complete`;
    $("wideProgressFill").style.width = `${m.percent}%`;
    $("metricDone").textContent = m.count;
    $("metricLeft").textContent = m.total - m.count;
    $("metricStreak").textContent = streak();
    if (m.score === 100) {
      $("scoreMessage").textContent = "You did it, eco champion!";
      $("scoreSubtext").textContent = "You've checked every habit. Keep growing that greener routine!";
    } else if (m.score >= 70) {
      $("scoreMessage").textContent = "You're making a difference!";
      $("scoreSubtext").textContent = "Amazing progress. Keep up those thoughtful choices.";
    } else if (m.score > 0) {
      $("scoreMessage").textContent = "Every action matters.";
      $("scoreSubtext").textContent = "You're on your way. Try one more green habit today.";
    } else {
      $("scoreMessage").textContent = "Ready to make a difference?";
      $("scoreSubtext").textContent = "Every small action is a step towards a healthier planet.";
    }
  }
  function renderWeekChart() {
    const today = dateKey(new Date());
    const keys = Array.from({length:7}, (_,i) => shiftDate(today, i - 6));
    $("weekChart").innerHTML = keys.map(key => {
      const m = metrics(key);
      const label = parseDate(key).toLocaleDateString(undefined, {weekday:"short"}).slice(0,2);
      const height = m.score === 0 ? 3 : m.score;
      return `<div class="chart-day ${key === today ? "today" : ""}" title="${prettyDate(key, true)}: ${m.score}%">
        <span class="chart-value">${m.score}</span>
        <div class="chart-bar-area"><div class="chart-bar" style="height:${height}%"></div></div>
        <span class="chart-day-label">${label}</span>
      </div>`;
    }).join("");
  }
  function renderAchievements() {
    const allTracked = trackedKeys();
    const totalDone = allTracked.reduce((sum,key) => sum + metrics(key).count, 0);
    const bestScore = allTracked.reduce((max,key) => Math.max(max, metrics(key).score), 0);
    const items = [
      {icon:"🌱",title:"First green step",desc:"Complete your first habit.",unlocked:totalDone >= 1},
      {icon:"🌿",title:"Habit builder",desc:"Complete 10 habits in total.",unlocked:totalDone >= 10},
      {icon:"🌳",title:"Eco explorer",desc:"Complete 25 habits in total.",unlocked:totalDone >= 25},
      {icon:"💯",title:"Perfect day",desc:"Reach a 100 eco-score in one day.",unlocked:bestScore === 100},
      {icon:"🔥",title:"Keep the streak",desc:"Track habits on 3 days in a row.",unlocked:streak() >= 3}
    ];
    $("achievementList").innerHTML = items.map(item => `<div class="achievement ${item.unlocked ? "unlocked" : ""}"><span class="achievement-icon">${item.icon}</span><span class="achievement-text"><strong>${item.title}</strong><small>${item.desc}</small></span><span class="achievement-state">${item.unlocked ? "Unlocked ✓" : "Locked"}</span></div>`).join("");
  }
  function renderHistory() {
    const keys = trackedKeys().sort((a,b) => b.localeCompare(a));
    $("historyCount").textContent = `${keys.length} ${keys.length === 1 ? "day" : "days"} tracked`;
    if (!keys.length) {
      $("historyList").innerHTML = '<div class="history-empty">Your first check-in will appear here. Pick a habit above to get started 🌱</div>';
      return;
    }
    $("historyList").innerHTML = keys.slice(0,7).map(key => {
      const m = metrics(key);
      return `<div class="history-row"><div class="history-date">${prettyDate(key, true)}<small>${key === dateKey(new Date()) ? "Today" : m.count === HABITS.length ? "All habits completed" : `${m.count} habits completed`}</small></div><div class="history-score"><strong>${m.score}/100</strong><div>${m.percent}% score</div></div><div class="history-mini-track-wrap"><div class="history-mini-track"><div class="history-mini-fill" style="width:${m.percent}%"></div></div></div></div>`;
    }).join("");
  }
  function renderAll() {
    renderDate();
    renderHabits();
    renderMetrics();
    renderWeekChart();
    renderAchievements();
    renderHistory();
  }
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function showTip() {
    $("dailyTipText").textContent = DAILY_TIPS[tipIndex];
  }
  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Eco Tracker habit data. Scores are based on completed habits, not measured environmental savings.",
      habits: HABITS.map(({id,title,category}) => ({id,title,category})),
      days: Object.fromEntries(trackedKeys().sort().map(key => [key, {
        date:key,
        completedHabits:checkedIds(key),
        completedCount:metrics(key).count,
        totalHabits:HABITS.length,
        ecoScore:metrics(key).score
      }]))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eco-tracker-progress-${dateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Your progress export is ready.");
  }

  $("habitFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    $("habitFilters").querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("selected", b === button));
    renderHabits();
  });
  $("prevDay").addEventListener("click", () => {
    selectedDate = shiftDate(selectedDate, -1);
    renderAll();
  });
  $("nextDay").addEventListener("click", () => {
    const today = dateKey(new Date());
    if (selectedDate < today) selectedDate = shiftDate(selectedDate, 1);
    renderAll();
  });
  $("completeDayBtn").addEventListener("click", () => {
    $("progress").scrollIntoView({behavior:"smooth"});
  });
  $("refreshTip").addEventListener("click", () => {
    tipIndex = (tipIndex + 1 + Math.floor(Math.random() * (DAILY_TIPS.length - 1))) % DAILY_TIPS.length;
    showTip();
    showToast("Here's a fresh green idea 💡");
  });
  $("nextDailyTip").addEventListener("click", () => {
    tipIndex = (tipIndex + 1) % DAILY_TIPS.length;
    showTip();
  });
  $("exportBtn").addEventListener("click", exportData);
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    $("themeToggle").textContent = dark ? "☀" : "☾";
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  });
  $("menuToggle").addEventListener("click", () => {
    const open = $("mainNav").classList.toggle("open");
    $("menuToggle").setAttribute("aria-expanded", String(open));
    $("menuToggle").textContent = open ? "✕" : "☰";
  });
  $("mainNav").querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    $("mainNav").classList.remove("open");
    $("menuToggle").setAttribute("aria-expanded", "false");
    $("menuToggle").textContent = "☰";
  }));
  document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item === link));
  }));

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    $("themeToggle").textContent = "☀";
  }
  $("yearNow").textContent = new Date().getFullYear();
  showTip();
  renderAll();
})();
