import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import {MainFormComponent} from './form/form.component';


const routes: Routes = [     
  { path: '', redirectTo: '/mainForm', pathMatch: 'full' },
      {
  path: 'mainForm',
  component: MainFormComponent
},
{
  path: 'graph',
  component: GraphComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
