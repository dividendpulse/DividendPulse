// ------------------------------
// DividendPulse Dashboard Engine
// ------------------------------

// Load saved data on startup
document.addEventListener("DOMContentLoaded", () => {
    loadPositions();
    updateSummary();
});

// Add Position
document.getElementById("addPositionBtn").addEventListener("click", () => {
    const ticker = document.getElementById("ticker").value.trim().toUpperCase();
    const shares = parseFloat(document.getElementById("shares").value);
    const price = parseFloat(document.getElementById("price").value);
    const dividend = parseFloat(document.getElementById("dividend").value);

    if (!ticker || isNaN(shares) || isNaN(price) || isNaN(dividend)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    const table = document.getElementById("positionsTable").getElementsByTagName("tbody")[0];
    const row = table.insertRow();

    row.innerHTML = `
        <td>${ticker}</td>
        <td>${shares}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${dividend.toFixed(2)}</td>
        <td class="drip-status">OFF</td>
        <td>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
            <button class="dripBtn">Toggle DRIP</button>
        </td>
    `;

    savePositions();
    updateSummary();
    clearInputs();
});

// Edit / Delete / DRIP Toggle
document.getElementById("positionsTable").addEventListener("click", (event) => {
    const row = event.target.closest("tr");

    if (event.target.classList.contains("deleteBtn")) {
        row.remove();
        savePositions();
        updateSummary();
    }

    if (event.target.classList.contains("editBtn")) {
        const cells = row.getElementsByTagName("td");

        document.getElementById("ticker").value = cells[0].innerText;
        document.getElementById("shares").value = cells[1].innerText;
        document.getElementById("price").value = cells[2].innerText.replace("$", "");
        document.getElementById("dividend").value = cells[3].innerText.replace("$", "");

        row.remove();
        savePositions();
        updateSummary();
    }

    if (event.target.classList.contains("dripBtn")) {
        const dripCell = row.querySelector(".drip-status");
        dripCell.innerText = dripCell.innerText === "ON" ? "OFF" : "ON";
        savePositions();
    }
});

// Save to localStorage
function savePositions() {
    const rows = document.querySelectorAll("#positionsTable tbody tr");
    const data = [];

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        data.push({
            ticker: cells[0].innerText,
            shares: parseFloat(cells[1].innerText),
            price: parseFloat(cells[2].innerText.replace("$", "")),
            dividend: parseFloat(cells[3].innerText.replace("$", "")),
            drip: cells[4].innerText
        });
    });

    localStorage.setItem("positions", JSON.stringify(data));
}

// Load from localStorage
function loadPositions() {
    const saved = JSON.parse(localStorage.getItem("positions")) || [];
    const table = document.getElementById("positionsTable").getElementsByTagName("tbody")[0];

    saved.forEach(pos => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${pos.ticker}</td>
            <td>${pos.shares}</td>
            <td>$${pos.price.toFixed(2)}</td>
            <td>$${pos.dividend.toFixed(2)}</td>
            <td class="drip-status">${pos.drip}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
                <button class="dripBtn">Toggle DRIP</button>
            </td>
        `;
    });
}

// Update summary totals
function updateSummary() {
    const rows = document.querySelectorAll("#positionsTable tbody tr");

    let totalValue = 0;
    let totalIncome = 0;

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        const shares = parseFloat(cells[1].innerText);
        const price = parseFloat(cells[2].innerText.replace("$", ""));
        const dividend = parseFloat(cells[3].innerText.replace("$", ""));

        totalValue += shares * price;
        totalIncome += shares * dividend;
    });

    document.getElementById("totalValue").innerText = `$${totalValue.toFixed(2)}`;
    document.getElementById("totalIncome").innerText = `$${totalIncome.toFixed(2)}`;
}

// Clear input fields
function clearInputs() {
    document.getElementById("ticker").value = "";
    document.getElementById("shares").value = "";
    document.getElementById("price").value = "";
    document.getElementById("dividend").value = "";
}

