import { mcpBaseUrl, redirectUri, clientId } from './auth.js';
console.log('hello...?')
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const returnedState = params.get('state');
console.log('here1')
if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('State mismatch — possible CSRF');
}
console.log('here2');
const res = await fetch(`${mcpBaseUrl}/token`, {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: sessionStorage.getItem('pkce_verifier')
  }),
});
console.log('fetched');
if (!res.ok) {
    console.log('res bad');
  document.body.textContent = 'Login failed: ' + await res.text();
} else {
    console.log('res good');
  const { access_token, expires_in } = await res.json();
  sessionStorage.setItem('access_token', access_token);
  sessionStorage.setItem('expires_in', expires_in);
  window.location = '/index.html';
}