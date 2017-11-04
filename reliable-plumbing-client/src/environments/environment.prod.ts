

export const environment = {
  production: true,
  apiUrl: 'http://reliableplumbingapi.azurewebsites.net/api/',
  socketsUrl: 'http://reliableplumbingapi.azurewebsites.net',
  mapsApiKey: 'AIzaSyAkTlSLk6H5zLe41EpX1Lhhd0zSRfWQj7o',
  socialMedia: {
    facebook: {
      clientId: '1865444587114627',
      url: 'https://www.facebook.com/v2.10/dialog/oauth?client_id={clientId}&redirect_uri={redirectUri}&scope=email'
    },
    redirectUri: 'http://localhost:4200/social-media-authenticate'
  }
};
