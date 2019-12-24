import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  isUserLoggedIn:boolean = false;

  constructor(private loginService:AuthenticationService) { }

  ngOnInit() {
    this.isUserLoggedIn=this.loginService.isUserLoggedIn("toolbar init"); 
  }

  message ="Optimal Shift Generation Tool";
}
