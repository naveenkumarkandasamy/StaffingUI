import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule  }   from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from 'ag-grid-angular';
import { MatTableModule} from "@angular/material";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MainFormComponent } from './form/form.component';

//Services
import { DataService } from "./services/data.service";
import {ConstantsService} from "./services/constants.service";



@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ToolbarComponent,
    MainFormComponent,

  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule     ,
    MatTableModule,
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
  ],
  providers: [DataService, ConstantsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
