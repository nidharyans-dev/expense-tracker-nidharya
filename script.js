// ==========================================
// EXPENSE TRACKER
// ==========================================


// ==========================================
// LOAD TRANSACTIONS FROM LOCAL STORAGE
// ==========================================

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const form = document.getElementById("transaction-form");

const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const totalIncome = document.getElementById("total-income");
const totalExpenses = document.getElementById("total-expenses");
const balance = document.getElementById("balance");

const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");

const transactionList =
    document.getElementById("transaction-list");

const monthlySummary =
    document.getElementById("monthly-summary");

const expenseChart =
    document.getElementById("expense-chart");


// ==========================================
// SAVE TRANSACTIONS
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// ADD TRANSACTION
// ==========================================

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const type = typeInput.value;
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();


    // ======================================
    // VALIDATION
    // ======================================

    if (type === "") {

        alert("Please select transaction type.");
        return;

    }


    if (isNaN(amount) || amount <= 0) {

        alert("Please enter a valid amount.");
        return;

    }


    if (category === "") {

        alert("Please select a category.");
        return;

    }


    if (date === "") {

        alert("Please select a date.");
        return;

    }


    // ======================================
    // CREATE TRANSACTION
    // ======================================

    const transaction = {

        id: Date.now(),

        type: type,

        amount: amount,

        category: category,

        date: date,

        description: description

    };


    transactions.push(transaction);


    // Save data

    saveTransactions();


    // Update everything

    updateSummary();

    displayTransactions();

    updateMonthlySummary();

    updateExpenseChart();


    // Clear form

    form.reset();

});


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    let income = 0;

    let expenses = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        }

        else if (transaction.type === "expense") {

            expenses += Number(transaction.amount);

        }

    });


    const currentBalance = income - expenses;


    totalIncome.textContent =
        "₹" + income.toFixed(2);

    totalExpenses.textContent =
        "₹" + expenses.toFixed(2);

    balance.textContent =
        "₹" + currentBalance.toFixed(2);

}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions() {

    transactionList.innerHTML = "";


    // Get filter values

    const selectedType =
        typeFilter ? typeFilter.value : "all";

    const selectedCategory =
        categoryFilter ? categoryFilter.value : "all";


    // ======================================
    // FILTER TRANSACTIONS
    // ======================================

    const filteredTransactions =
        transactions.filter(function(transaction) {

            const typeMatches =
                selectedType === "all" ||
                transaction.type === selectedType;


            const categoryMatches =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;


            return typeMatches && categoryMatches;

        });


    // ======================================
    // NO TRANSACTIONS
    // ======================================

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p id="empty-message">
                No transactions found.
            </p>
        `;

        return;

    }


    // ======================================
    // DISPLAY TRANSACTIONS
    // ======================================

    filteredTransactions.forEach(function(transaction) {

        const transactionItem =
            document.createElement("div");


        transactionItem.classList.add(
            "transaction-item"
        );


        transactionItem.innerHTML = `

            <div>
                ${transaction.date}
            </div>


            <div>
                ${transaction.description || "No description"}
            </div>


            <div>
                ${transaction.category}
            </div>


            <div class="${transaction.type}">
                ${transaction.type}
            </div>


            <div class="${transaction.type}">

                ${
                    transaction.type === "income"
                    ? "+"
                    : "-"
                }

                ₹${Number(transaction.amount).toFixed(2)}

            </div>


            <div class="action-buttons">

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})">

                    Edit

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">

                    Delete

                </button>

            </div>

        `;


        transactionList.appendChild(
            transactionItem
        );

    });

}


// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );


    if (!confirmDelete) {

        return;

    }


    transactions = transactions.filter(
        function(transaction) {

            return transaction.id !== id;

        }
    );


    saveTransactions();


    updateSummary();

    displayTransactions();

    updateMonthlySummary();

    updateExpenseChart();

}


// ==========================================
// EDIT TRANSACTION
// ==========================================

function editTransaction(id) {

    const transaction = transactions.find(
        function(transaction) {

            return transaction.id === id;

        }
    );


    if (!transaction) {

        return;

    }


    // Put existing values into form

    typeInput.value =
        transaction.type;

    amountInput.value =
        transaction.amount;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;

    descriptionInput.value =
        transaction.description;


    // Remove old transaction

    transactions = transactions.filter(
        function(transaction) {

            return transaction.id !== id;

        }
    );


    saveTransactions();


    updateSummary();

    displayTransactions();

    updateMonthlySummary();

    updateExpenseChart();


    // Scroll to form

    document
        .querySelector(".form-section")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ==========================================
// FILTERS
// ==========================================

if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        function() {

            displayTransactions();

        }
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function() {

            displayTransactions();

        }
    );

}


// ==========================================
// MONTHLY EXPENSE SUMMARY
// ==========================================

function updateMonthlySummary() {

    monthlySummary.innerHTML = "";


    if (transactions.length === 0) {

        monthlySummary.innerHTML = `
            <p>No monthly data available.</p>
        `;

        return;

    }


    const monthlyData = {};


    // Calculate monthly data

    transactions.forEach(function(transaction) {

        const month =
            transaction.date.substring(0, 7);


        if (!monthlyData[month]) {

            monthlyData[month] = {

                income: 0,

                expenses: 0

            };

        }


        if (transaction.type === "income") {

            monthlyData[month].income +=
                Number(transaction.amount);

        }


        else if (transaction.type === "expense") {

            monthlyData[month].expenses +=
                Number(transaction.amount);

        }

    });


    // Display monthly data

    Object.keys(monthlyData)
        .sort()
        .reverse()
        .forEach(function(month) {

            const income =
                monthlyData[month].income;

            const expenses =
                monthlyData[month].expenses;

            const monthlyBalance =
                income - expenses;


            const monthCard =
                document.createElement("div");


            monthCard.classList.add(
                "month-card"
            );


            monthCard.innerHTML = `

                <h3>
                    ${month}
                </h3>

                <p>
                    <strong>Income:</strong>
                    ₹${income.toFixed(2)}
                </p>

                <p>
                    <strong>Expenses:</strong>
                    ₹${expenses.toFixed(2)}
                </p>

                <p>
                    <strong>Balance:</strong>
                    ₹${monthlyBalance.toFixed(2)}
                </p>

            `;


            monthlySummary.appendChild(
                monthCard
            );

        });

}


// ==========================================
// CATEGORY-WISE EXPENSE CHART
// ==========================================

function updateExpenseChart() {

    expenseChart.innerHTML = "";


    const categoryExpenses = {};


    // Calculate expenses by category

    transactions.forEach(function(transaction) {

        if (transaction.type === "expense") {

            if (!categoryExpenses[transaction.category]) {

                categoryExpenses[transaction.category] = 0;

            }


            categoryExpenses[transaction.category] +=
                Number(transaction.amount);

        }

    });


    // No expense data

    if (Object.keys(categoryExpenses).length === 0) {

        expenseChart.innerHTML = `
            <p>No expense data available.</p>
        `;

        return;

    }


    // Find highest expense

    const highestExpense =
        Math.max(
            ...Object.values(categoryExpenses)
        );


    // Create chart bars

    Object.keys(categoryExpenses).forEach(
        function(category) {

            const amount =
                categoryExpenses[category];


            const percentage =
                (amount / highestExpense) * 100;


            const chartItem =
                document.createElement("div");


            chartItem.classList.add(
                "chart-item"
            );


            chartItem.innerHTML = `

                <div class="chart-label">

                    <span>
                        ${category}
                    </span>

                    <span>
                        ₹${amount.toFixed(2)}
                    </span>

                </div>


                <div class="chart-bar-container">

                    <div
                        class="chart-bar"
                        style="width: ${percentage}%">

                    </div>

                </div>

            `;


            expenseChart.appendChild(
                chartItem
            );

        }
    );

}


// ==========================================
// LOAD ALL DATA WHEN PAGE OPENS
// ==========================================

displayTransactions();

updateSummary();

updateMonthlySummary();

updateExpenseChart();