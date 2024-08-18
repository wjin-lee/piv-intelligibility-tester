import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'piv-intelligibility-tester';

  constructor() {}

  playAudio(url: string) {
    // Invoke the command
    invoke('play_wav_file', {
      filePath: url,
    })
      .then(() => {
        console.log('Finished playing audio clip!');
      })
      .catch((err) => {
        console.log('ERRORED!');
        console.log(err);
      });
  }
}
