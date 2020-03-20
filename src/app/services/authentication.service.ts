import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export class User {
  constructor(
    public status: string,
    public name: string,
    public roles: Array<string>,
    public authData: string,
  ) { }

}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  private apiUrl:string ="";

  constructor(private httpClient: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    this.apiUrl = environment.apiUrl;
  }


  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }


  public get currentLoggedInUser(): string {
    return this.currentUserSubject.value.name;
  }
  
 authenticate(username, password) {

    const params = new HttpParams()
      .set('username', username)
      .set('pass', password);
    //  const headers = new HttpHeaders({ Authorization: 'Basic ' + btoa(username + ':' + password) });
    return this.httpClient.post<User>(this.apiUrl+'/Staffing/api/login?username=' + username + "&pass=" + password, "").pipe(
      map(
        userData => {
          if (userData) {
            // store user details and basic auth credentials in local storage 
            // to keep user logged in between page refreshes
            userData.authData = window.btoa(username + ':' + password);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUserSubject.next(userData);
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('Bearer');

  }
}
