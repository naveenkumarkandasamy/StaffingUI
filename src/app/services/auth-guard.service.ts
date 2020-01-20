import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router,
    private authService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // check if route is restricted by role
      if (route.data.roles && route.data.roles.indexOf(currentUser.roles[0]) === -1) {
          // role not authorised so redirect to home page
          this.router.navigate(['/']);
          return false;
      }

      // authorised so return true
      return true;
  }

  // not logged in so redirect to login page with the return url
  this.router.navigate(['/login'] );
  return false;
  }

}