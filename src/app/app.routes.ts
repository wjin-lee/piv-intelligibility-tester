import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { PerceptionTestComponent } from './pages/perception-test/perception-test.component';

export const routes: Routes = [
  { path: 'perception-test', component: PerceptionTestComponent },
  { path: 'landing', component: LandingComponent },
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
];
