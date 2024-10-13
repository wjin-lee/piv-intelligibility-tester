import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { AssessmentComponent } from './pages/perception-test/assessment/assessment.component';
import { PerceptionTestComponent } from './pages/perception-test/perception-test.component';
import { CalibrationComponent } from './pages/calibration/calibration.component';
import { AudioTestComponent } from './pages/audio-test/audio-test.component';

export const routes: Routes = [
  { path: 'calibration', component: CalibrationComponent },
  { path: 'audio-test', component: AudioTestComponent },
  { path: 'perception-test', component: PerceptionTestComponent },
  { path: 'perception-test/assessment', component: AssessmentComponent },
  { path: 'landing', component: LandingComponent },
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
];
