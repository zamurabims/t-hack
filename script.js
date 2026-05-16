
let transactions = [];

window.addEventListener('load', function () {
  const saved = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }

  document.getElementById('tx-date').value = getTodayDate();

  renderTransactions();
  updateStats();
});

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function saveToStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

document.getElementById('tx-form').addEventListener('submit', function (e) {

  e.preventDefault();

  const type = document.getElementById('tx-type').value;
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const category = document.getElementById('tx-category').value;
  const date = document.getElementById('tx-date').value;
  const comment = document.getElementById('tx-comment').value.trim();

  if (!category || !amount || amount <= 0) return;


  const newTransaction = {
    id: Date.now().toString(),
    type: type,
    amount: amount,
    category: category,
    date: date,
    comment: comment
  };

  transactions.unshift(newTransaction);

  saveToStorage();

  renderTransactions();
  updateStats();

  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-category').value = '';
  document.getElementById('tx-comment').value = '';
});

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });

  saveToStorage();
  renderTransactions();
  updateStats();
}

function renderTransactions() {
  const listEl = document.getElementById('transactions-list');

  // Если транзакций нет — показываем заглушку
  if (transactions.length === 0) {
    listEl.innerHTML = '<div class="empty-state">Транзакций пока нет. Добавьте первую!</div>';
    return;
  }

  const html = transactions.map(function (t) {
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : '−';
    const amountClass = isIncome ? 'income' : 'expense';

    const dateFormatted = new Date(t.date + 'T12:00:00').toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });


    const commentHtml = t.comment ? ' · ' + t.comment : '';

    return `
      <div class="tx-row">
        <div class="tx-info">
          <div class="tx-category">${t.category}</div>
          <div class="tx-meta">${dateFormatted}${commentHtml}</div>
        </div>
        <div class="tx-amount ${amountClass}">${sign}${formatMoney(t.amount)}</div>
        <button class="btn-delete" onclick="deleteTransaction('${t.id}')">Удалить</button>
      </div>
    `;
  }).join('');

  listEl.innerHTML = html;
}

function updateStats() {
  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  const totalIncome = transactions
    .filter(function (t) { return t.type === 'income'; })
    .reduce(function (sum, t) { return sum + t.amount; }, 0);

  const totalExpense = transactions
    .filter(function (t) { return t.type === 'expense'; })
    .reduce(function (sum, t) { return sum + t.amount; }, 0);

  const balance = totalIncome - totalExpense;

  const monthIncome = transactions
    .filter(function (t) { return t.type === 'income' && t.date.startsWith(currentMonth); })
    .reduce(function (sum, t) { return sum + t.amount; }, 0);

  const monthExpense = transactions
    .filter(function (t) { return t.type === 'expense' && t.date.startsWith(currentMonth); })
    .reduce(function (sum, t) { return sum + t.amount; }, 0);

  document.getElementById('stat-balance').textContent = formatMoney(balance) + ' ₽';
  document.getElementById('stat-income').textContent = '+' + formatMoney(monthIncome) + ' ₽';
  document.getElementById('stat-expense').textContent = '−' + formatMoney(monthExpense) + ' ₽';
}

function formatMoney(amount) {
  return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}