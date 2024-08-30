import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { AssessmentComponent } from './pages/perception-test/assessment/assessment.component';
import { PerceptionTestComponent } from './pages/perception-test/perception-test.component';

export const routes: Routes = [
  { path: 'perception-test', component: PerceptionTestComponent },
  { path: 'perception-test/assessment', component: AssessmentComponent },
  { path: 'landing', component: LandingComponent },
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
];
