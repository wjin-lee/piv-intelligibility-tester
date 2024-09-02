#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![play_wav_file])
        .invoke_handler(tauri::generate_handler![play_test_tone])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{OutputCallbackInfo, StreamConfig};
use hound::WavReader;
use std::sync::Arc;

#[tauri::command]
async fn play_wav_file(file_path: String, decibel_adjustment: i32) -> Result<(), String> {
    let host = cpal::default_host();
    let default_output_device = host
        .default_output_device()
        .ok_or_else(|| "No output device available".to_string())?;

    // Load WAV file
    let wav_reader =
        WavReader::open(file_path.clone()).map_err(|_| "Could not open file".to_string())?;
    let spec = wav_reader.spec();

    println!(
        "Playing {} through {} ({} channels). {}db adjustment",
        file_path.clone(),
        default_output_device.name().unwrap(),
        spec.channels,
        decibel_adjustment
    );

    // Load samples and standardise amplitude based on bits per sample.
    let samples: Vec<f32> = wav_reader
        .into_samples::<i32>()
        .map(|s| {
            s.unwrap() as f32 / (f32::powi(2.0, (spec.bits_per_sample - 1) as i32))
                * ((10 as f32).powf(decibel_adjustment as f32 / 20 as f32) as f32)
            // Global decibel adjustment for each environment.
        })
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

#[tauri::command]
async fn play_test_tone(speaker_index: i32) -> Result<(), String> {
    let host = cpal::default_host();
    let default_output_device: cpal::Device = host
        .default_output_device()
        .ok_or_else(|| "No output device available".to_string())?;

    println!("Testing speaker {}.", speaker_index);

    // Constants for the tone generation
    let frequency = 1000.0; // Test tone frequency
    let sample_rate = 48000 as f32;
    let amplitude = 0.5; // VOLUME WATCH OUT
    let channels = 2;

    // Generate a 1 kHz sine wave for one period
    let test_tone: Vec<f32> = (0..sample_rate as usize)
        .map(|i| {
            let sample = amplitude
                * (2.0 * std::f32::consts::PI * frequency * (i as f32) / sample_rate).sin();
            sample
        })
        .collect();

    let total_samples = test_tone.len() * channels as usize;
    let mut sample_data = vec![0.0; total_samples];
    for (i, sample) in test_tone.iter().enumerate() {
        for channel in 0..channels as usize {
            sample_data[i * channels as usize + channel] = *sample;
        }
    }

    // Create a buffer
    let sample_data = Arc::new(sample_data);

    // Create a CPAL stream
    let stream_config: StreamConfig = StreamConfig {
        channels: 2,
        sample_rate: cpal::SampleRate(sample_rate as u32),
        buffer_size: cpal::BufferSize::Default,
    };

    let audio_clip_duration = (sample_data.len() as f32 / sample_rate as f32) / (channels as f32);

    let mut sample_index = 0;
    let stream = default_output_device
        .build_output_stream(
            &stream_config,
            move |data: &mut [f32], _: &OutputCallbackInfo| {
                for sample in data.iter_mut() {
                    if sample_index < sample_data.len() {
                        let channel_index: usize = sample_index % channels as usize;
                        if (channel_index as i32) == speaker_index {
                            // Only play the current channel
                            *sample = sample_data[sample_index];
                        } else {
                            *sample = 0.0; // Mute all other channels
                        }
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
