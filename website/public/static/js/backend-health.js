(function () {
  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocal) return;

  var apiBase = window.CUBICI_API_BASE || 'http://127.0.0.1:18080';

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
    })
    .catch(function (error) {
      document.body.dataset.backendStatus = 'DOWN';
      console.warn('[Cubici] Backend connection failed', error);
    });
})();
