

export const environment = {
  production: true,
  apiUrl: '/api/',
  socketsUrl: '/',
  filesUrl: '/files/',
  mapsApiKey: 'AIzaSyAmYRB--nxsm_OprcUO2RzrdlJTy6qLI4c',
  socialMedia: {
    facebook: {
      clientId: '1865444587114627',
      url: 'https://www.facebook.com/v2.10/dialog/oauth?client_id={clientId}&redirect_uri={redirectUri}&scope=email'
    },
    google: {
      clientId: '683536496260-v9qshpnrqn1t83m2mle5f449rap989e7.apps.googleusercontent.com',
      url: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={clientId}&redirect_uri={redirectUri}&scope=email%20profile'
    },
    redirectUri: '/social-media-authenticate'
  }
};
