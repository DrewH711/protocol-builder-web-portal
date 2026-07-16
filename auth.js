import { Clerk } from "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/+esm";


const clerk = new Clerk('pk_test_c3VwcmVtZS1oYWRkb2NrLTQwLmNsZXJrLmFjY291bnRzLmRldiQ')
await clerk.load();

async function syncAccessToken() {
  const token = clerk.session ? await clerk.session.getToken() : null;
  if (token) sessionStorage.setItem('access_token', token);
  else sessionStorage.removeItem('access_token');
  return token;
}

window.getClerkToken = syncAccessToken;

if (!clerk.isSignedIn) {

  sessionStorage.removeItem('access_token');
  await clerk.redirectToSignIn({
    redirectUrl: `${window.location.origin}/index.html`
  });

} else {

  await syncAccessToken();
  
}