/**
 * Cogram Open — VoltHacks scaffold
 * Session memory (localStorage) + MFA-lite pacing gauge.
 * Distinct codebase from FocusField; shared concept only.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "cogram_open_session_v1";
  const EPS = 0.08;

  const form = document.getElementById("memory-form");
  const input = document.getElementById("memory-input");
  const list = document.getElementById("memory-list");
  const sTask = document.getElementById("s-task");
  const sPhone = document.getElementById("s-phone");
  const rPhone = document.getElementById("r-phone");
  const sTaskVal = document.getElementById("s-task-val");
  const sPhoneVal = document.getElementById("s-phone-val");
  const rPhoneVal = document.getElementById("r-phone-val");
  const gaugeFill = document.getElementById("gauge-fill");
  const gaugeLabel = document.getElementById("gauge-label");

  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function renderEntries() {
    const entries = loadEntries();
    list.innerHTML = "";
    entries.slice().reverse().forEach((e) => {
      const li = document.createElement("li");
      const t = document.createElement("time");
      t.textContent = new Date(e.at).toLocaleString();
      li.appendChild(t);
      li.appendChild(document.createTextNode(e.text));
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const entries = loadEntries();
    entries.push({ text, at: Date.now() });
    saveEntries(entries);
    input.value = "";
    renderEntries();
  });

  function fieldAt(s, r) {
    return s / (r * r + EPS);
  }

  function updateGauge() {
    const st = Number(sTask.value);
    const sp = Number(sPhone.value);
    const rp = Number(rPhone.value);
    sTaskVal.textContent = st.toFixed(1);
    sPhoneVal.textContent = sp.toFixed(1);
    rPhoneVal.textContent = rp.toFixed(2);

    const fTask = fieldAt(st, 0.15);
    const fPhone = fieldAt(sp, rp);
    const total = fTask + fPhone + EPS;
    const focusRatio = fTask / total;
    const pct = Math.round(focusRatio * 100);
    gaugeFill.style.width = pct + "%";

    const capture = fPhone > st / (rp * rp + EPS);
    if (capture) {
      gaugeFill.style.background = "var(--danger)";
      gaugeLabel.textContent = "Transfer risk — phone may capture focus";
    } else if (pct < 55) {
      gaugeFill.style.background = "var(--warn)";
      gaugeLabel.textContent = "Unstable — raise task strength or distance";
    } else {
      gaugeFill.style.background = "var(--accent)";
      gaugeLabel.textContent = "Focus stable";
    }
  }

  [sTask, sPhone, rPhone].forEach((el) => el.addEventListener("input", updateGauge));

  renderEntries();
  updateGauge();
})();
