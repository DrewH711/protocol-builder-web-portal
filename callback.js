const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const returnedState = params.get('state');

if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('State mismatch — possible CSRF');
}

const res = await fetch(`${baseUrl}/token`, {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${webUrl}/callback.html`,
    client_id: '3d5890b5-e93a-4722-b0e4-da44c0cbe4b9',
    code_verifier: sessionStorage.getItem('pkce_verifier'),
    resource: `${baseUrl}/mcp`
  }),
});

if (!res.ok) {
  document.body.textContent = 'Login failed: ' + await res.text();
} else {

  const { access_token, expires_in } = await res.json();
  sessionStorage.setItem('access_token', access_token);
  sessionStorage.setItem('expires_in', expires_in);
  window.location = '/index.html';
}