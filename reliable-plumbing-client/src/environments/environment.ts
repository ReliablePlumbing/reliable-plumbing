// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/',
  socketsUrl: 'http://localhost:3000',
  filesUrl: 'http://localhost:3000/files/',
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
