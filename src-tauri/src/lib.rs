#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![play_wav_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{OutputCallbackInfo, StreamConfig};
use hound::WavReader;
use std::sync::Arc;

#[tauri::command]
async fn play_wav_file(file_path: String) -> Result<(), String> {
    let host = cpal::default_host();
    let default_output_device = host
        .default_output_device()
        .ok_or_else(|| "No output device available".to_string())?;

    // Load WAV file
    let wav_reader =
        WavReader::open(file_path.clone()).map_err(|_| "Could not open file".to_string())?;
    let spec = wav_reader.spec();

    println!(
        "Playing {} through {} ({} channels).",
        file_path.clone(),
        default_output_device.name().unwrap(),
        spec.channels
    );

    // Load samples and standardise amplitude based on bits per sample.
    let samples: Vec<f32> = wav_reader
        .into_samples::<i32>()
        .map(|s| s.unwrap() as f32 / (f32::powi(2.0, (spec.bits_per_sample - 1) as i32)))
        .collect();

    // Create a buffer
    let sample_data = Arc::new(samples);

    // Create a CPAL stream
    let stream_config: StreamConfig = StreamConfig {
        channels: spec.channels,
        sample_rate: cpal::SampleRate(spec.sample_rate),
        buffer_size: cpal::BufferSize::Default,
    };

    let mut sample_index = 0;

    let audio_clip_duration =
        (sample_data.len() as f32 / spec.sample_rate as f32) / (spec.channels as f32);
    println!("{}", audio_clip_duration);
    let stream = default_output_device
        .build_output_stream(
            &stream_config,
            move |data: &mut [f32], _: &OutputCallbackInfo| {
                for sample in data.iter_mut() {
                    if sample_index < sample_data.len() {
                        *sample = sample_data[sample_index];
                        sample_index += 1;
                    }
                }
            },
            |err| {
                eprintln!("Stream error: {:?}", err);
            },
            None,
        )
        .map_err(|_| "Failed to build output stream.".to_string())?;

    // Start the stream
    stream
        .play()
        .map_err(|_| "Failed to play stream.".to_string())?;
    // TODO: Handle async sleeping properly. tokio::time::sleep(std::time::Duration::from_secs_f32(audio_clip_duration)).await;
    std::thread::sleep(std::time::Duration::from_secs_f32(audio_clip_duration));
    println!("Finished playing audio clip.");

    Ok(())
}
