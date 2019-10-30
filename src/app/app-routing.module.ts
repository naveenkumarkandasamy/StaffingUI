import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import {TutorialComponent} from './tutorial/tutorial.component';


const routes: Routes = [         {
  path: 'tutorial',
  component: TutorialComponent
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
