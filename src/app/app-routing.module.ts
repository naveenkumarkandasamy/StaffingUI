import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { MainFormComponent } from './form/form.component';
import { AutorunComponent } from './autorun/autorun.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AuthGuardService } from './services/auth-guard.service';
import { JobListComponent } from './job-list/job-list.component';
import { Role } from './Models/Role';


const routes: Routes = [
  { path: '', component: MainFormComponent ,canActivate:[AuthGuardService]   },
  {
    path: 'mainForm',
    component: MainFormComponent,
    canActivate:[AuthGuardService]
  },
  {
    path: 'graph',
    component: GraphComponent,
    canActivate:[AuthGuardService]
  },
  {
    path: 'autorun',
    component: AutorunComponent,
    canActivate:[AuthGuardService],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'joblist',
    component: JobListComponent,
    canActivate:[AuthGuardService]
  },
  { path: 'login', component: LoginComponent,  },
  { path: 'logout', component: LogoutComponent ,canActivate:[AuthGuardService] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
