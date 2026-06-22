// Dividend Pulse - Auto-save Portfolio Engine

const STORAGE_KEY = "dividendPulsePortfolio_v1";

let positions = [];

// DOM elements
const positionsBody = document.getElementById("positionsBody");
const addForm = document.getElementById("addPositionForm");

const tickerInput = document.getElementById("tickerInput");
const sharesInput = document.getElementById("sharesInput");
const priceInput = document.getElementById("priceInput");
const yieldInput = document.getElementById("yieldInput");
const dripInput = document.getElementById("dripInput");

// Summary elements
const summaryValue = document.getElementById("summaryValue");
const summaryIncome = document.getElementById("summaryIncome");
const summaryYOC = document.getElementById("summaryYOC");
const summaryDrip = document.getElementById("summaryDrip");

const summaryCount = document.getElementById("summaryCount");
const summaryAvgYield = document.getElementById("summaryAvgYield");
const summaryDripDetail = document.getElementById("summaryDripDetail");
const summaryLargest = document.getElementById("summaryLargest");

// Helpers
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      positions = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      positions = parsed;
    } else {
      positions = [];
    }
  } catch (e) {
    console.error("Failed to load data:", e);
    positions = [];
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

function formatCurrency(value) {
  if (!isFinite(value)) return "$0";
  return "$" + value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPercent(value) {
  if (!isFinite(value)) return "0.00%";
  return value.toFixed(2) + "%";
}

// Rendering
function renderPositions() {
  positionsBody.innerHTML = "";

  positions.forEach((pos) => {
    const tr = document.createElement("tr");
    tr.dataset.id = pos.id;

    const value = pos.shares * pos.price;
    const income = value * (pos.yield / 100);

    tr.innerHTML = `
      <td class="ticker">${pos.ticker}</td>
      <td>${pos.shares.toFixed(4).replace(/\.?0+$/, "")}</td>
      <td>${formatCurrency(pos.price)}</td>
      <td>${formatCurrency(value)}</td>
      <td>${formatPercent(pos.yield)}</td>
      <td>${formatCurrency(income)}</td>
      <td>
        <button class="btn-small drip-toggle-btn ${pos.drip ? "" : "off"}" data-action="toggle-drip">
          ${pos.drip ? "DRIP On" : "DRIP Off"}
        </button>
      </td>
      <td>
        <div class="actions">
          <button class="btn-small" data-action="edit">Edit</button>
          <button class="btn-small danger" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    positionsBody.appendChild(tr);
  });
}

function renderSummary() {
  let totalValue = 0;
  let totalIncome = 0;
  let totalCost = 0; // same as value here (no separate cost basis)
  let dripCount = 0;
  let largestValue = 0;
  let largestTicker = null;

  positions.forEach((pos) => {
    const value = pos.shares * pos.price;
    const income = value * (pos.yield / 100);

    totalValue += value;
    totalIncome += income;
    totalCost += value;

    if (pos.drip) dripCount++;

    if (value > largestValue) {
      largestValue = value;
      largestTicker = pos.ticker;
    }
  });

  const yoc = totalCost > 0 ? (totalIncome / totalCost) * 100 : 0;
  const avgYield =
    totalValue > 0 ? (totalIncome / totalValue) * 100 : 0;

  summaryValue.textContent = formatCurrency(totalValue);
  summaryIncome.textContent = formatCurrency(totalIncome);
  summaryYOC.textContent = formatPercent(yoc);
  summaryDrip.textContent = `${dripCount} / ${positions.length}`;

  summaryCount.textContent = positions.length.toString();
  summaryAvgYield.textContent = formatPercent(avgYield);
  summaryDripDetail.textContent =
    positions.length === 0
      ? "0 enrolled"
      : `${dripCount} of ${positions.length} positions`;

  summaryLargest.textContent = largestTicker ? `${largestTicker} (${formatCurrency(largestValue)})` : "–";
}

function rerenderAll() {
  renderPositions();
  renderSummary();
}

// CRUD
function addPositionFromForm() {
  const ticker = (tickerInput.value || "").trim().toUpperCase();
  const shares = parseFloat(sharesInput.value);
  const price = parseFloat(priceInput.value);
  const yieldPct = parseFloat(yieldInput.value);
  const drip = !!dripInput.checked;

  if (!ticker || !isFinite(shares) || !isFinite(price) || !isFinite(yieldPct)) {
    alert("Please fill all fields with valid numbers.");
    return;
  }

  const newPos = {
    id: Date.now().toString(),
    ticker,
    shares,
    price,
    yield: yieldPct,
    drip,
  };

  positions.push(newPos);
  saveData();
  rerenderAll();

  addForm.reset();
  dripInput.checked = false;
}

function findPositionIndexById(id) {
  return positions.findIndex((p) => p.id === id);
}

function editPosition(id) {
  const idx = findPositionIndexById(id);
  if (idx === -1) return;

  const pos = positions[idx];

  const newTicker = prompt("Ticker:", pos.ticker);
  if (newTicker === null) return;

  const newSharesStr = prompt("Shares:", pos.shares);
  if (newSharesStr === null) return;

  const newPriceStr = prompt("Price:", pos.price);
  if (newPriceStr === null) return;

  const newYieldStr = prompt("Dividend Yield %:", pos.yield);
  if (newYieldStr === null) return;

  const newTickerTrimmed = newTicker.trim().toUpperCase();
  const newShares = parseFloat(newSharesStr);
  const newPrice = parseFloat(newPriceStr);
  const newYield = parseFloat(newYieldStr);

  if (!newTickerTrimmed || !isFinite(newShares) || !isFinite(newPrice) || !isFinite(newYield)) {
    alert("Invalid values. Edit cancelled.");
    return;
  }

  positions[idx] = {
    ...pos,
    ticker: newTickerTrimmed,
    shares: newShares,
    price: newPrice,
    yield: newYield,
  };

  saveData();
  rerenderAll();
}

function deletePosition(id) {
  const idx = findPositionIndexById(id);
  if (idx === -1) return;

  const confirmed = confirm("Delete this position?");
  if (!confirmed) return;

  positions.splice(idx, 1);
  saveData();
  rerenderAll();
}

function toggleDrip(id) {
  const idx = findPositionIndexById(id);
  if (idx === -1) return;

  positions[idx].drip = !positions[idx].drip;
  saveData();
  rerenderAll();
}

// Event wiring
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addPositionFromForm();
});

positionsBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const tr = btn.closest("tr");
  if (!tr) return;

  const id = tr.dataset.id;
  const action = btn.dataset.action;

  if (action === "edit") {
    editPosition(id);
  } else if (action === "delete") {
    deletePosition(id);
  } else if (action === "toggle-drip") {
    toggleDrip(id);
  }
});

// Init
loadData();
rerenderAll();

