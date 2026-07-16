const existingToken = sessionStorage.getItem('access_token');
const expires_in = sessionStorage.getItem('expires_in');

const mcpBaseUrl = 'https://protocol-builder-mcp.calmforest-c0a43ae0.eastus2.azurecontainerapps.io';
const redirectUri = `${window.location.origin}/callback.html`;
const clientId = 'BUKGLKFt30eAII8a';

export { mcpBaseUrl, redirectUri, clientId };

if (!existingToken){
  try{
    document.getElementById("default-content").hidden = false;
    document.getElementById("protected-content").hidden = true;

    function base64url(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } 
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    sessionStorage.setItem('pkce_verifier', verifier);

    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${mcpBaseUrl}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    // authUrl.searchParams.set('resource', `${mcpBaseUrl}/mcp`);
    authUrl.searchParams.set('scope', 'openid email profile')

    window.location = authUrl;
  } catch (err) {
    console.log(err);
  }
}
else{
    document.getElementById("default-content").hidden = true;
    document.getElementById("protected-content").hidden = false;
}