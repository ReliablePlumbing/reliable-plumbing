import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
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

// checks if the user is logged in, also checks if user has any role of the roles specified in the route data
@Injectable()
export class LoginAuthGuard implements CanActivate {

    constructor(private router: Router, private environmentService: EnvironmentService) { }

    canActivate(activatedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let roles = activatedRoute.data.roles;
        let isUserLoggedIn = this.environmentService.isUserLoggedIn;

        if (!isUserLoggedIn) {
            this.router.navigate(['/']);
            return false;
        }

        if (roles == null || roles.length == 0) {
            return isUserLoggedIn;
        }
        else {
            let currentUser = this.environmentService.currentUser;
            for (let userRole of currentUser.roles)
                for (let role of roles)
                    if (role == userRole)
                        return true;

            this.router.navigate(['/']);
            return false;
        }
    }
}