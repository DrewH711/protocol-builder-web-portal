const baseUrl="https://protocol-builder-mcp.calmforest-c0a43ae0.eastus2.azurecontainerapps.io"

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
    client_id: 'BUKGLKFt30eAII8a',
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