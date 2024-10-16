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
      bin_seminar_2m: 60, // -30.5
      bin_lecture_2m: 66.6, //-23.9
      bin_lecture_10m: 72.6, // -17.9
      bin_atrium_2m: 58.7, // -31.8
      bin_atrium_10m: 72.4, // -18.1

      seminar_2m: 93.9,
      seminar_10m: 89.1,
      lecture_2m: 79.7,
      lecture_10m: 89.5,
      neon_2m: 92.1,
      neon_10m: 90.5,

      clear_seminar_2m: 90,
      clear_seminar_10m: 100,
      clear_lecture_2m: 90,
      clear_lecture_10m: 105,
      clear_neon_2m: 90,
      clear_neon_10m: 102,

      negative_ten: this.desiredNoiseDecibels + 10, // -10 db adjustment
    };
  }
}
