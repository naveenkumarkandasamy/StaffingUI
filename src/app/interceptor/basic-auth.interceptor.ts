import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthenticationService) { }
    refreshingAccessToken: boolean;
    accessTokenRefreshed: Subject<any> = new Subject();

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        // add authorization header with basic auth credentials if available
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.authData && currentUser.accessToken) {
            request = this.addAuthHeader(request);
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                 // refresh the access token
                 return this.refreshAccessToken()
                  .pipe(
                    switchMap(() => {
                      request = this.addAuthHeader(request);
                      return next.handle(request);
                    }),
                    catchError((err: any) => {
                      this.authService.logOut();
                      return empty();
                    })
                  )
              }
              return throwError(error);
            })
          );
    }

    refreshAccessToken() {
        if (this.refreshingAccessToken) {
            return new Observable(observer => {
            this.accessTokenRefreshed.subscribe(() => {
                observer.next();
                observer.complete();
            })
        })
        } else {
            this.refreshingAccessToken = true;
            return this.authService.getNewAccessToken().pipe(
            tap(() => {
                this.refreshingAccessToken = false;
                this.accessTokenRefreshed.next();
            })
           )
        }
    }

    addAuthHeader(request: HttpRequest<any>) {
        // get the access token
        let token = this.authService.getBearerToken();
        if (token) {
          // append the access token to the request header
          return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
          });
        }
        return request;
    }
}
