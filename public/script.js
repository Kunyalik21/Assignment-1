const apiBase = '';

async function fetchMe() {
  const res = await fetch(`${apiBase}/api/auth/me`, { credentials: 'include' });
  const data = await res.json();
  const meEl = document.getElementById('me');
  meEl.textContent = data.user ? `Logged in as ${data.user.username}` : 'Not logged in';
}

async function refreshFiles() {
  const listEl = document.getElementById('files');
  listEl.innerHTML = '';
  const res = await fetch(`${apiBase}/api/files`, { credentials: 'include' });
  if (!res.ok) return;
  const data = await res.json();
  data.files.forEach((f) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = f.url;
    a.textContent = `${f.originalName} (${Math.round(f.size / 1024)} KB)`;
    a.target = '_blank';
    li.appendChild(a);
    listEl.appendChild(li);
  });
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const username = form.username.value.trim();
  const password = form.password.value;
  const res = await fetch(`${apiBase}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  document.getElementById('authMsg').textContent = res.ok ? `Registered as ${data.user.username}` : (data.error || 'Failed');
  await fetchMe();
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const username = form.username.value.trim();
  const password = form.password.value;
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  document.getElementById('authMsg').textContent = res.ok ? `Logged in as ${data.user.username}` : (data.error || 'Failed');
  await fetchMe();
  await refreshFiles();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  const res = await fetch(`${apiBase}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  document.getElementById('authMsg').textContent = res.ok ? 'Logged out' : 'Failed';
  await fetchMe();
  await refreshFiles();
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const res = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: formData, credentials: 'include' });
  const data = await res.json();
  document.getElementById('uploadMsg').textContent = res.ok ? `Uploaded ${data.file.originalName}` : (data.error || 'Failed');
  await refreshFiles();
});

fetchMe();
refreshFiles();


