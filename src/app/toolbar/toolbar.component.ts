import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from '../services/authentication.service';
import { Role } from '../Models/Role';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  currentUser: User;


  isUserLoggedIn: boolean = false;

  constructor(private loginService: AuthenticationService) {
    this.loginService.currentUser.subscribe(x => this.currentUser = x)
  }

  ngOnInit() {
    this.isUserLoggedIn = this.loginService.isUserLoggedIn("toolbar init");
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.roles.indexOf(Role.Admin) > -1;
  }


  message = "OSAT";
}
