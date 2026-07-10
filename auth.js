const existingToken = sessionStorage.getItem('access_token');
const expires_in = sessionStorage.getItem('expires_in');

const baseUrl = 'https://protocol-builder-mcp.calmforest-c0a43ae0.eastus2.azurecontainerapps.io'
const webUrl = 'https://brave-coast-082803d0f.7.azurestaticapps.net'

if (!existingToken){

    function base64url(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } 
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    sessionStorage.setItem('pkce_verifier', verifier);

    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${baseUrl}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', '3d5890b5-e93a-4722-b0e4-da44c0cbe4b9');
    authUrl.searchParams.set('redirect_uri', `${webUrl}/callback.html`);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('resource', `${baseUrl}/mcp`);

    window.location = authUrl;
}