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

        calculateTotals();
    }

    function addPosition() {
        const ticker = document.getElementById("ticker").value.toUpperCase();
        const shares = parseFloat(document.getElementById("shares").value);
        const price = parseFloat(document.getElementById("price").value);
        const dividend = parseFloat(document.getElementById("dividend").value);

        if (!ticker || isNaN(shares) || isNaN(price) || isNaN(dividend)) {
            alert("Please fill all fields correctly.");
            return;
        }

        positions.push({
            ticker,
            shares,
            price,
            dividend,
            drip: false
        });

        savePositions();
        renderTable();
    }

    function editPosition(index) {
        const pos = positions[index];

        const newShares = parseFloat(prompt("Enter new share amount:", pos.shares));
        const newPrice = parseFloat(prompt("Enter new price:", pos.price));
        const newDividend = parseFloat(prompt("Enter new dividend:", pos.dividend));

        if (isNaN(newShares) || isNaN(newPrice) || isNaN(newDividend)) {
            alert("Invalid input.");
            return;
        }

        pos.shares = newShares;
        pos.price = newPrice;
        pos.dividend = newDividend;

        savePositions();
        renderTable();
    }

    function deletePosition(index) {
        positions.splice(index, 1);
        savePositions();
        renderTable();
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
        }

        if (e.target.classList.contains("deleteBtn")) {
            deletePosition(index);
        }

        if (e.target.classList.contains("dripBtn")) {
            toggleDrip(index);
        }
    });

    addBtn.addEventListener("click", addPosition);

    renderTable();
});
