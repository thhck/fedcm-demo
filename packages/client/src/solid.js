
import { buildAuthenticatedFetch, createDpopHeader, generateDpopKeyPair } from '@inrupt/solid-client-authn-core';




export async function fetchRessource(url, accessToken, dpopKey) {
  if (dpopKey) {
    const authFetch = await buildAuthenticatedFetch(accessToken, { dpopKey })
    const resp = await authFetch(url)
    const body = await resp.text()
    console.log("auth fetch")
    console.log(body)
    return body
  } else {
    const resp = await fetch(url)
    return await resp.text()
  }
}

export function extractWebID(jwt) {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: The token must consist of three parts.');
  }
  const payload = parts[1];

  // Decode the payload from base64-url to a JSON string
  const decodedPayload = atob(payload.replace(/_/g, '/').replace(/-/g, '+'));
  const payloadObj = JSON.parse(decodedPayload);

  return payloadObj.webid;
}



export async function startFedcmLogin(cssUrl) {
  console.log('startFedcmLogin')
  const dpopKey = await generateDpopKeyPair();
  const tokenUrl = `${cssUrl}.oidc/token`;
  const dpopHeader = await createDpopHeader(tokenUrl, 'POST', dpopKey);
  const cliendId = window.location.origin + '/clientid'

  const identity_registered = {
    "providers": [
      {
        "configURL": `any`,
        "clientId": `${cliendId}`,
        "registered": true,
        "grant type": "webid",
        "nonce": `${dpopHeader}`
      }
    ]
  }
  console.log('requesting navigator\'s API with: ', identity_registered)
	
  try {
    const access_token = await navigator.credentials.get({
      identity: identity_registered
    })    
    console.log('access_token', access_token)
    return { access_token, dpopKey }
  } catch (error) {
    console.log("Client Error calling the navigator api: ", error);
    return 

  }
}


