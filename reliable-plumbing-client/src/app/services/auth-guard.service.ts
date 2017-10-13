import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { EnvironmentService } from './environment.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private environmentService: EnvironmentService) { }

    canActivate() {
        if (!this.environmentService.isUserLoggedIn) {
            this.router.navigate(['/login']);
        }
        return true;
    }
}


@Injectable()
export class LoginAuthGuard implements CanActivate {

    constructor(private router: Router, private environmentService: EnvironmentService) { }

    canActivate() {
        if (this.environmentService.isUserLoggedIn) {
            this.router.navigate(['/']);
        }
        return true;
    }
}