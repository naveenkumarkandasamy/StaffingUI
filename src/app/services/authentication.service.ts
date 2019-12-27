import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';


export class User {
  constructor(
    public status: string,
    public authData: string,
  ) { }

}


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private httpClient: HttpClient) { }

  authenticate(username, password) {
    const headers = new HttpHeaders({ Authorization: 'Basic ' + btoa(username + ':' + password) });
    return this.httpClient.get<User>('http://localhost:8086/Staffing/api/validateLogin', { headers }).pipe(
      map(
        userData => {
          if (userData) {
            // store user details and basic auth credentials in local storage 
            // to keep user logged in between page refreshes
            userData.authData = window.btoa(username + ':' + password);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
          return userData;
        }
      )
    );
  }

  isUserLoggedIn(value) {
    let user = localStorage.getItem('currentUser')
    return !(user === null)
  }

  logOut() {
    localStorage.removeItem('currentUser')
  }
}
