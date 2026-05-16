// === КАТЕГОРИИ ДЛЯ ДОХОДОВ И ТРАТ ===
const categoriesMap = {
  income: [
    { value: "Переводы", text: "Переводы" },
    { value: "Пополнение", text: "Пополнение" },
    { value: "Другое", text: "Другое" }
  ],
  expense: [
    { value: "Еда", text: "Еда" },
    { value: "Транспорт", text: "Транспорт" },
    { value: "Развлечения", text: "Развлечения" },
    { value: "Учёба", text: "Учёба" },
    { value: "Другое", text: "Другое" }
  ]
};

// Функция для динамического обновления списка категорий
function updateCategories() {
  const txType = document.getElementById("tx-type");
  const txCategory = document.getElementById("tx-category");
  const selectedType = txType.value; // "income" или "expense"
  const currentCategories = categoriesMap[selectedType];

  txCategory.innerHTML = ""; // Очищаем старые категории

  currentCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.value;
    option.textContent = category.text;
    txCategory.appendChild(option);
  });
}

// Слушатель для изменения типа транзакции вручную
document.getElementById("tx-type").addEventListener("change", updateCategories);

// === ВАШ ИСХОДНЫЙ КОД С ИНТЕГРАЦИЕЙ ===
let transactions = [];

window.addEventListener('load', function () {
  const saved = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
  document.getElementById('tx-date').value = getTodayDate();
  
  // Инициализируем правильные категории при первой загрузке страницы
  updateCategories(); 
  
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

  // Очистка полей формы после успешной отправки
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-comment').value = '';
  // Вместо пустой строки обновляем категории, чтобы сбросить на дефолтную доступную
  updateCategories(); 
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
  if (transactions.length === 0) {
    listEl.innerHTML = '<div class="empty-state">Транзакций пока нет. Добавьте</div>';
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
  return amount.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
