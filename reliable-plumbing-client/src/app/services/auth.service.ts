import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SocialMediaProvider } from '../models/enums';
import { HttpExtensionService } from './http-extension.service';
import { EnvironmentService } from './environment.service';
import { Http, Response, URLSearchParams } from '@angular/http';

@Injectable()
export class AuthService {

  protected basePath = environment.apiUrl + 'users/';

  constructor(private httpService: HttpExtensionService, private environmentService: EnvironmentService) { }

  redirectToSocialLogin(provider: SocialMediaProvider) {
    let url = this.getSocialMediaProviderUrl(provider);

    sessionStorage.setItem('socialMediaLoginProvider', provider.toString());
    window.location.href = url;
  }

  getSocialUserDataAndToken(provider: SocialMediaProvider, code) {

    let providerStr = SocialMediaProvider[provider].toLowerCase();
    var body = {
      provider: provider,
      code: code,
      clientId: environment.socialMedia[providerStr].clientId,
      redirectUri: environment.socialMedia.redirectUri
    };

    return this.httpService.post(this.basePath + 'socialLogin', body, false)
      .map((response: Response) => {
        if (response.status == 401)
          return false;
        let resData = response.json();
        if (resData == null || resData.token == null || resData.user == null)
          return false;
        this.environmentService.currentUser = null;
        this.environmentService.setUserLoginInfo(resData);
        return true;
      });
  }

  private getSocialMediaProviderUrl(provider: SocialMediaProvider) {

    let redirectUri = environment.socialMedia.redirectUri;

    let providerStr = SocialMediaProvider[provider].toLowerCase();

    return this.replaceUrlParams(environment.socialMedia[providerStr], redirectUri);

  }

  private replaceUrlParams(providerConfig, redirectUri) {
    let url = providerConfig.url;
    let urlParams = url.match(/{(.*?)}/g).map(param => param.replace(/[\{\}]/g, ''));
    for (let param of urlParams) {
      if (param == 'redirectUri')
        url = url.replace(`{redirectUri}`, redirectUri);
      else {
        let paramValue = providerConfig[param];
        url = url.replace(`{${param}}`, paramValue);
      }
    }

    return url;
  }

}


























// let windowRef: Window = window.open(url, '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400');
// let accessToken = null;
// windowRef.addEventListener('beforeunload', (w) => {
//   accessToken = (<any>windowRef).accessToken;
//   // alert(accessToken);
//   if (!windowRef.closed)
//     windowRef.close();
// })