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
      lecture_2m: 50,
      lecture_10m: 50,
      seminar_2m: 50,
      seminar_10m: 50,
      neon_2m: 50,
      neon_10m: 50,
    };
  }
}
