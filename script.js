document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#positionsTable tbody");
    const totalValueEl = document.getElementById("totalValue");
    const totalIncomeEl = document.getElementById("totalIncome");
    const addBtn = document.getElementById("addPositionBtn");

    let positions = JSON.parse(localStorage.getItem("positions")) || [];

    function savePositions() {
        localStorage.setItem("positions", JSON.stringify(positions));
    }

    function calculateTotals() {
        let totalValue = 0;
        let totalIncome = 0;

        positions.forEach(pos => {
            totalValue += pos.shares * pos.price;
            totalIncome += pos.shares * pos.dividend;
        });

        totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    }

    function renderTable() {
        tableBody.innerHTML = "";

        positions.forEach((pos, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${pos.ticker}</td>
                <td>${pos.shares}</td>
                <td>$${pos.price.toFixed(2)}</td>
                <td>$${pos.dividend.toFixed(2)}</td>
                <td class="drip-status">${pos.drip ? "ON" : "OFF"}</td>
                <td>
                    <button class="editBtn" data-index="${index}">Edit</button>
                    <button class="deleteBtn" data-index="${index}">Delete</button>
                    <button class="dripBtn" data-index="${index}">Toggle DRIP</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function addPosition() {
        const ticker = prompt("Enter ticker symbol:");
        if (!ticker) return;

        const shares = parseFloat(prompt("Enter number of shares:"));
        if (isNaN(shares)) return;

        const price = parseFloat(prompt("Enter price per share:"));
        if (isNaN(price)) return;

        const dividend = parseFloat(prompt("Enter annual dividend per share:"));
        if (isNaN(dividend)) return;

        positions.push({
            ticker,
            shares,
            price,
            dividend,
            drip: false
        });

        savePositions();
        renderTable();
        calculateTotals();
    }

    function editPosition(index) {
        const pos = positions[index];

        const shares = parseFloat(prompt("Update shares:", pos.shares));
        if (isNaN(shares)) return;

        const price = parseFloat(prompt("Update price:", pos.price));
        if (isNaN(price)) return;

        const dividend = parseFloat(prompt("Update dividend:", pos.dividend));
        if (isNaN(dividend)) return;

        pos.shares = shares;
        pos.price = price;
        pos.dividend = dividend;

        savePositions();
        renderTable();
        calculateTotals();
    }

    function deletePosition(index) {
        if (!confirm("Delete this position?")) return;

        positions.splice(index, 1);
        savePositions();
        renderTable();
        calculateTotals();
    }

    function toggleDrip(index) {
        positions[index].drip = !positions[index].drip;
        savePositions();
        renderTable();
    }

    tableBody.addEventListener("click", (e) => {
        const index = e.target.dataset.index;

        if (e.target.classList.contains("editBtn")) {
            editPosition(index);
        } else if (e.target.classList.contains("deleteBtn")) {
            deletePosition(index);
        } else if (e.target.classList.contains("dripBtn")) {
            toggleDrip(index);
        }
    });

    addBtn.addEventListener("click", addPosition);

    renderTable();
    calculateTotals();
});

