export default {
  oAuthInfo: {
    clientId: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    grnatType: 'authorization_code',
    redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
    scopes: 'https://www.googleapis.com/auth/drive'
  },
  codeBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenBaseUrl: 'https://www.googleapis.com/oauth2/v4/token',
  uploadBaseUrl: 'https://www.googleapis.com/upload/drive/v3/files'
}
