// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/',
  socketsUrl: 'http://localhost:3000',
  mapsApiKey: 'AIzaSyAkTlSLk6H5zLe41EpX1Lhhd0zSRfWQj7o',
  socialMedia: {
    facebook: {
      clientId: '1865444587114627',
      url: 'https://www.facebook.com/v2.10/dialog/oauth?client_id={clientId}&redirect_uri={redirectUri}&scope=email'
    },
    redirectUri: 'http://localhost:4200/social-media-authenticate'
  }
};
