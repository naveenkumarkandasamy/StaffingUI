import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AgGridModule } from 'ag-grid-angular';
import { MatToolbarModule, MatIconModule, MatSidenavModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatPaginatorModule, MatRadioModule, MatCardModule, MatDialogModule } from "@angular/material";
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { CronEditorModule } from 'ngx-cron-editor';


import { AppRoutingModule } from './app-routing.module';
//Components
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MainFormComponent } from './form/form.component';
import { AutorunComponent } from "./autorun/autorun.component";
import { JobListComponent } from './job-list/job-list.component';
import { JobListPopupComponent} from './job-list/job-list-popup/job-list-popup.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';

//Services
import { DataService } from "./services/data.service";
import { ConstantsService } from "./services/constants.service";
import { AuthenticationService } from './services/authentication.service';
import { HttpClientService } from './services/http-client.service';

//Interceptors
import { BasicAuthInterceptor, ErrorInterceptor } from './interceptor/index';

import { CronGeneratorComponent } from './cron-generator/cron-generator.component';
import { JobformComponent } from './jobform/jobform.component';
import { ExcelService } from './services/excel.service';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ToolbarComponent,
    MainFormComponent,
    AutorunComponent,
    LoginComponent,
    LogoutComponent,
    JobListComponent,
    CronGeneratorComponent,
    JobformComponent,
    JobListPopupComponent
  ],
  imports: [
    MatDialogModule,
    MatCardModule,
    CronEditorModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatPaginatorModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
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

  entryComponents: [
    JobListPopupComponent
  ],
  providers: [ExcelService, DataService, ConstantsService, AuthenticationService, HttpClientService,
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },],
  // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
