import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AgGridModule } from 'ag-grid-angular';
import { MatToolbarModule, MatIconModule, MatSidenavModule, MatButtonModule, MatCheckboxModule } from "@angular/material";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MainFormComponent } from './form/form.component';
import { AutorunComponent } from "./autorun/autorun.component"
import { MatGridListModule } from '@angular/material/grid-list';

//Services
import { DataService } from "./services/data.service";
import { ConstantsService } from "./services/constants.service";
import { AuthenticationService } from './services/authentication.service';
import { HttpClientService } from './services/http-client.service';

//Components
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';

//Interceptors
import { BasicAuthInterceptor, ErrorInterceptor } from './interceptor/index';



@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ToolbarComponent,
    MainFormComponent,
    AutorunComponent,
    LoginComponent,
    LogoutComponent,

  ],
  imports: [
    MatGridListModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
    ToastrModule.forRoot(),
  ],
  providers: [DataService, ConstantsService, AuthenticationService, HttpClientService,
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },],
  // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
