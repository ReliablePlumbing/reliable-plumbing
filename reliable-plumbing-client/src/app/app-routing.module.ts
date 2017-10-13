import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { AuthGuard } from "./services/auth-guard.service";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'loginrequired', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'test', component: TestComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
