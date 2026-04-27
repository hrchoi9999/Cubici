(function () {
  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var configuredApiBase = String(window.CUBICI_API_BASE || '').trim();
  if (configuredApiBase.indexOf('%VITE_') === 0) configuredApiBase = '';
  if (!isLocal && !configuredApiBase) return;

  var apiBase = configuredApiBase || 'http://127.0.0.1:18080';
  var numberFormatter = new Intl.NumberFormat('ko-KR');

  function formatAmount(value) {
    return numberFormatter.format(Number(value || 0));
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function updateDashboard(summary) {
    window.CUBICI_DASHBOARD_SUMMARY = summary;

    var topAmounts = document.querySelectorAll('.sec-1 .data-in');
    setText(topAmounts[0], formatAmount(summary.sales && summary.sales.totalAmount));
    setText(topAmounts[1], formatAmount(summary.settlement && summary.settlement.depositAmount));

    var moneybank = summary.moneybank || {};
    var moneybankAmounts = document.querySelectorAll('.mony-bank .data-in');
    setText(moneybankAmounts[0], formatAmount(moneybank.serviceBalance));
    setText(moneybankAmounts[1], formatAmount(moneybank.totalProvisionPrincipal));
    setText(moneybankAmounts[2], formatAmount(moneybank.totalRepaymentPrincipal));

    updateMoneybankHistory(moneybank.histories || []);
  }

  function updateMoneybankHistory(histories) {
    var table = document.querySelector('.bank-item.item-3 table');
    if (!table) return;

    var colgroup = table.querySelector('colgroup');
    table.textContent = '';
    if (colgroup) table.appendChild(colgroup);

    if (!histories.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.textContent = '이용 내역 없음';
      emptyRow.appendChild(emptyCell);
      table.appendChild(emptyRow);
      return;
    }

    histories.slice(0, 5).forEach(function (history) {
      var row = document.createElement('tr');
      var dateCell = document.createElement('th');
      var typeCell = document.createElement('td');
      var amountCell = document.createElement('td');
      var balanceCell = document.createElement('td');
      var amount = document.createElement('span');
      var balance = document.createElement('span');

      amount.className = 'data-in';
      balance.className = 'data-in';
      dateCell.textContent = history.date || '-';
      typeCell.textContent = history.type || '-';
      amount.textContent = formatAmount(history.amount);
      balance.textContent = history.balance == null ? '-' : formatAmount(history.balance);

      amountCell.appendChild(amount);
      balanceCell.appendChild(balance);
      row.appendChild(dateCell);
      row.appendChild(typeCell);
      row.appendChild(amountCell);
      row.appendChild(balanceCell);
      table.appendChild(row);
    });
  }

  fetch(apiBase + '/api/health')
    .then(function (response) {
      if (!response.ok) throw new Error('Backend health check failed: ' + response.status);
      return response.json();
    })
    .then(function (health) {
      window.CUBICI_BACKEND_HEALTH = health;
      document.body.dataset.backendStatus = health.status || 'UNKNOWN';
      document.body.dataset.backendUsers = String((health.database && health.database.users) || 0);
      console.info('[Cubici] Backend connected', health);
      return fetch(apiBase + '/api/dashboard/summary');
    })
    .then(function (response) {
      if (!response) return null;
      if (!response.ok) throw new Error('Dashboard summary failed: ' + response.status);
      return response.json();
    })
    .then(function (summary) {
      if (summary) updateDashboard(summary);
    })
    .catch(function (error) {
      document.body.dataset.backendStatus = 'DOWN';
      console.warn('[Cubici] Backend connection failed', error);
    });
})();
