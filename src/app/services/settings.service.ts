import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  desiredNoiseDecibels = 60;

  constructor() {}

  getCalibrationMap(): Record<string, number> {
    // Measured "ground-truth" values in decibels.
    return {
      seminar_2m: 91.1,
      seminar_10m: 86.6,
      lecture_2m: 77.7,
      lecture_10m: 87,
      neon_2m: 89.5,
      neon_10m: 88,
      negative_ten: this.desiredNoiseDecibels + 10, // -10 db adjustment
    };
  }
}
