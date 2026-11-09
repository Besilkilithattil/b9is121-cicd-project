/* All displayed request results come from this app's real endpoints. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const expectedVersion = document.body.dataset.version;
  const endpoints = {
    health: {method: 'GET', path: '/api/health', expected: 200},
    version: {method: 'GET', path: '/api/version', expected: 200},
    missing: {method: 'GET', path: '/does-not-exist', expected: 404},
    method: {method: 'POST', path: '/', expected: 405}
  };
  let lastResponse = null;
  let responseTab = 'body';
  let suiteRunning = false;
  let toastTimer;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  $('runtime-label').textContent = local ? 'Local preview' : location.hostname.endsWith('.azurecontainerapps.io') ? 'Azure cloud' : 'Web deployment';
  function notify(message) {
    clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
    toastTimer = setTimeout(() => {$('toast').hidden = true;}, 2600);
  }
  async function request(key) {
    const endpoint = endpoints[key];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const start = performance.now();
    try {
      const response = await fetch(endpoint.path, {method: endpoint.method, cache: 'no-store', signal: controller.signal});
      const raw = await response.text();
      let json = null;
      try {json = JSON.parse(raw);} catch (_) { /* HTML error responses are expected. */ }
      return {status: response.status, statusText: response.statusText, ms: Math.round(performance.now() - start),
        raw, json, headers: Array.from(response.headers, ([k,v]) => `${k}: ${v}`).join('\n'), key};
    } finally {clearTimeout(timer);}
  }
  function updateConnection(result) {
    if (result.key !== 'health') return;
    const healthy = result.status === 200 && result.json?.status === 'healthy';
    const status = $('connection-status'); status.className = `status-pill ${healthy ? 'ok' : 'error'}`;
    status.replaceChildren(); const dot = document.createElement('i'); status.append(dot, document.createTextNode(healthy ? 'Application responding' : 'Health check failed'));
  }
  function connectionFailed() {
    const status = $('connection-status'); status.className = 'status-pill error';
    status.replaceChildren(); status.append(document.createElement('i'), document.createTextNode('Application unreachable'));
  }
  function renderResponse() {
    if (!lastResponse) return;
    $('response-output').textContent = responseTab === 'headers' ? lastResponse.headers : lastResponse.json !== null ? JSON.stringify(lastResponse.json, null, 2) : lastResponse.raw;
    $('terminal-filename').textContent = responseTab === 'headers' ? 'response.headers' : lastResponse.json !== null ? 'response.json' : 'response.html';
  }
  function display(result) {
    lastResponse = result; renderResponse(); updateConnection(result);
    const expected = result.status === endpoints[result.key].expected;
    $('response-status').textContent = `HTTP ${result.status}`;
    $('response-status').className = expected ? result.status >= 400 ? 'expected' : 'ok' : 'error';
    $('response-time').textContent = `${result.ms} ms`;
    $('latency-value').textContent = `${result.ms} ms`;
    $('copy-response').disabled = false;
    $('request-note').textContent = result.status >= 400 && expected ? `Expected ${result.status}: this request deliberately checks error handling.` : `Received from ${location.origin}${endpoints[result.key].path}. Timing is for this request only.`;
  }
  $('endpoint').addEventListener('change', () => {
    const endpoint = endpoints[$('endpoint').value];
    $('request-method').textContent = endpoint.method; $('request-path').textContent = endpoint.path;
  });
  async function sendSelected() {
    const button = $('send-request'); const key = $('endpoint').value;
    button.disabled = true; $('endpoint').disabled = true;
    $('response-status').className = ''; $('response-status').textContent = 'Sending…';
    $('request-note').textContent = 'Waiting for this application to respond…';
    try {display(await request(key));}
    catch (error) {
      lastResponse = null; $('copy-response').disabled = true;
      $('response-status').className = 'error'; $('response-status').textContent = 'Request failed'; $('response-time').textContent = '—';
      $('response-output').textContent = error.name === 'AbortError' ? 'The request timed out after 15 seconds. The app may be starting up. Try again.' : 'Could not reach this application. Check that the server is running, then retry.';
      $('request-note').textContent = 'No successful response was received. You can retry the request.';
      if (key === 'health') connectionFailed();
    } finally {button.disabled = false; $('endpoint').disabled = false;}
  }
  $('send-request').addEventListener('click', sendSelected);
  const responseButtons = [...document.querySelectorAll('[data-response-tab]')];
  function activateResponseTab(button) {
    responseTab = button.dataset.responseTab;
    for (const tab of responseButtons) {const active = tab === button; tab.classList.toggle('selected', active); tab.setAttribute('aria-selected', active); tab.tabIndex = active ? 0 : -1;}
    $('response-output').setAttribute('aria-labelledby', button.id); renderResponse();
  }
  for (const button of responseButtons) {
    button.addEventListener('click', () => activateResponseTab(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const next = event.key === 'Home' ? responseButtons[0] : event.key === 'End' ? responseButtons[1] : responseButtons.find(b => b !== button);
      activateResponseTab(next); next.focus();
    });
  }
  $('headers-tab').tabIndex = -1;
  $('copy-response').addEventListener('click', async () => {
    try {await navigator.clipboard.writeText($('response-output').textContent); notify('Response copied to clipboard');}
    catch (_) {notify('Select the response text and copy it with your keyboard.');}
  });
  function checkRow(key, state, label) {
    const row = document.querySelector(`[data-check="${key}"]`);
    row.className = state; row.querySelector('.check-result').textContent = label;
    row.querySelector('.check-state').textContent = state === 'passed' ? '✓' : state === 'failed' ? '!' : state === 'running' ? '…' : String(Object.keys(endpoints).indexOf(key) + 1).padStart(2,'0');
  }
  async function runChecks() {
    if (suiteRunning) return;
    suiteRunning = true; $('hero-run').disabled = true; $('run-checks').disabled = true;
    let passed = 0;
    for (const key of Object.keys(endpoints)) checkRow(key, '', 'Waiting');
    $('checks-count').textContent = '0/4'; $('check-summary').textContent = 'Running…'; $('checks-note').textContent = 'Sending four requests to this application…';
    for (const key of Object.keys(endpoints)) {
      checkRow(key, 'running', 'Running');
      try {
        const result = await request(key); updateConnection(result);
        let ok = result.status === endpoints[key].expected;
        if (key === 'health') ok = ok && result.json?.status === 'healthy';
        if (key === 'version') ok = ok && result.json?.version === expectedVersion;
        if (ok) passed += 1;
        checkRow(key, ok ? 'passed' : 'failed', ok ? `Passed · ${result.ms} ms` : `Failed · HTTP ${result.status}`);
      } catch (_) {checkRow(key, 'failed', 'Network error'); if (key === 'health') connectionFailed();}
      $('checks-count').textContent = `${passed}/4`;
    }
    $('check-summary').textContent = `${passed} / 4 passed`;
    $('checks-note').textContent = `${passed === 4 ? 'All checks passed' : 'Some checks failed. Review the results and retry'} · ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
    $('hero-run').disabled = false; $('run-checks').disabled = false; suiteRunning = false;
  }
  $('run-checks').addEventListener('click', runChecks);
  $('hero-run').addEventListener('click', () => {$('playground').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); runChecks();});
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.mobile-toggle');
  toggle.addEventListener('click', () => {const open = sidebar.classList.toggle('open'); toggle.setAttribute('aria-expanded', open);});
  const navLinks = [...document.querySelectorAll('.nav-item')];
  function activeNav(id) {
    for (const nav of navLinks) {const active = nav.hash === `#${id}`; nav.classList.toggle('active', active); if (active) nav.setAttribute('aria-current','location'); else nav.removeAttribute('aria-current');}
    const active = navLinks.find(n => n.hash === `#${id}`); if (active) document.querySelector('.breadcrumb strong').textContent = active.textContent.trim();
  }
  for (const nav of navLinks) nav.addEventListener('click', () => {activeNav(nav.hash.slice(1)); sidebar.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');});
  const observer = new IntersectionObserver(entries => {for (const entry of entries) if (entry.isIntersecting) activeNav(entry.target.id);}, {rootMargin:'-120px 0px -50% 0px',threshold:0});
  document.querySelectorAll('.section-anchor').forEach(section => observer.observe(section));
  // One real request on load populates the console; the four-check suite waits for a click.
  sendSelected();
})();
