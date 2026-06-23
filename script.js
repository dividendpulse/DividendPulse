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
     
