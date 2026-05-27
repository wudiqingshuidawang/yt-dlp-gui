use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Manager, State, Window};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Format {
    pub format_id: String,
    pub ext: String,
    pub resolution: String,
    pub filesize: u64,
    pub quality: String,
    pub vcodec: String,
    pub acodec: String,
    pub bitrate: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SubtitleInfo {
    pub lang: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub duration: u64,
    pub formats: Vec<Format>,
    pub audio_formats: Vec<Format>,
    pub subtitles: Vec<SubtitleInfo>,
}

#[derive(Debug, Serialize, Clone)]
pub struct DownloadProgress {
    pub download_id: String,
    pub progress: f64,
    pub speed: String,
    pub eta: String,
    pub status: String,
    pub error: Option<String>,
    pub file_path: Option<String>,
    pub downloaded_size: Option<String>,
    pub total_size: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum DownloadType {
    #[serde(rename = "video")]
    Video { format_id: String },
    #[serde(rename = "audio")]
    Audio {
        audio_format: String,
        audio_quality: u8,
    },
    #[serde(rename = "subtitle")]
    Subtitle {
        languages: Vec<String>,
        embed: bool,
    },
}

#[derive(Debug, Serialize, Deserialize)]
struct YtdlpFormat {
    format_id: Option<String>,
    ext: Option<String>,
    resolution: Option<String>,
    filesize: Option<u64>,
    format_note: Option<String>,
    vcodec: Option<String>,
    acodec: Option<String>,
    tbr: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct YtdlpSubtitleEntry {
    ext: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct YtdlpInfo {
    id: Option<String>,
    title: Option<String>,
    thumbnail: Option<String>,
    duration: Option<u64>,
    formats: Option<Vec<YtdlpFormat>>,
    subtitles: Option<HashMap<String, Vec<YtdlpSubtitleEntry>>>,
    automatic_captions: Option<HashMap<String, Vec<YtdlpSubtitleEntry>>>,
}

struct ActiveDownload {
    kill_handle: tauri::api::process::CommandChild,
}

struct AppState {
    active_downloads: Mutex<HashMap<String, ActiveDownload>>,
}

fn parse_progress_line(line: &str) -> Option<(f64, String, String, Option<String>, Option<String>)> {
    if !line.contains("[download]") || !line.contains('%') {
        return None;
    }

    let percent_str = line.split('%').next()?;
    let percent: f64 = percent_str
        .split_whitespace()
        .last()?
        .parse()
        .ok()?;

    let speed = if let Some(at_pos) = line.find(" at ") {
        let after_at = &line[at_pos + 4..];
        if let Some(eta_pos) = after_at.find(" ETA ") {
            after_at[..eta_pos].trim().to_string()
        } else {
            after_at.trim().to_string()
        }
    } else {
        String::new()
    };

    let eta = if let Some(eta_pos) = line.find(" ETA ") {
        line[eta_pos + 5..].trim().to_string()
    } else {
        String::new()
    };

    // Parse size info: "[download]  45.2% of ~123.45MiB at 1.23MiB/s ETA 01:02"
    let (downloaded_size, total_size) = if let Some(of_pos) = line.find(" of ") {
        let after_of = &line[of_pos + 4..];
        let total = if let Some(at_pos) = after_of.find(" at ") {
            after_of[..at_pos].trim().to_string()
        } else {
            after_of.trim().to_string()
        };
        if !total.is_empty() {
            (Some(format!("{:.1}%", percent)), Some(total))
        } else {
            (None, None)
        }
    } else {
        (None, None)
    };

    Some((percent, speed, eta, downloaded_size, total_size))
}

#[tauri::command]
async fn get_video_info(url: String) -> Result<VideoInfo, String> {
    let output = tauri::api::process::Command::new("yt-dlp")
        .args(["--dump-json", "--no-download", &url])
        .output()
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        let stderr = output.stderr.trim();
        if stderr.contains("ERROR") {
            let msg = stderr
                .lines()
                .find(|l| l.contains("ERROR"))
                .unwrap_or(stderr);
            return Err(msg.to_string());
        }
        return Err(format!("yt-dlp failed: {}", stderr));
    }

    let stdout = output.stdout.trim();
    let json_start = stdout
        .find('{')
        .ok_or("No JSON found in yt-dlp output")?;
    let json_str = &stdout[json_start..];

    let info: YtdlpInfo =
        serde_json::from_str(json_str).map_err(|e| format!("Failed to parse video info: {}", e))?;

    // Video formats: has video codec and resolution
    let mut formats: Vec<Format> = info
        .formats
        .as_ref()
        .unwrap_or(&vec![])
        .iter()
        .filter(|f| {
            let vcodec = f.vcodec.as_deref().unwrap_or("none");
            let resolution = f.resolution.as_deref().unwrap_or("none");
            vcodec != "none" && resolution != "none" && resolution != "audio only"
        })
        .filter_map(|f| {
            let format_id = f.format_id.clone()?;
            let ext = f.ext.clone().unwrap_or_default();
            let resolution = f.resolution.clone().unwrap_or_default();
            let filesize = f.filesize.unwrap_or(0);
            let quality = f
                .format_note
                .clone()
                .unwrap_or_else(|| resolution.clone());
            let vcodec = f.vcodec.clone().unwrap_or_else(|| "none".to_string());
            let acodec = f.acodec.clone().unwrap_or_else(|| "none".to_string());
            let bitrate = f.tbr.unwrap_or(0.0);

            Some(Format {
                format_id,
                ext,
                resolution,
                filesize,
                quality,
                vcodec,
                acodec,
                bitrate,
            })
        })
        .collect();

    if formats.is_empty() {
        formats.push(Format {
            format_id: "best".to_string(),
            ext: "mp4".to_string(),
            resolution: "best".to_string(),
            filesize: 0,
            quality: "Best".to_string(),
            vcodec: "unknown".to_string(),
            acodec: "unknown".to_string(),
            bitrate: 0.0,
        });
    }

    formats.sort_by(|a, b| {
        let a_res: u32 = a
            .resolution
            .split('x')
            .last()
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        let b_res: u32 = b
            .resolution
            .split('x')
            .last()
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        b_res.cmp(&a_res)
    });

    // Audio formats: no video codec, has audio codec
    let mut audio_formats: Vec<Format> = info
        .formats
        .as_ref()
        .unwrap_or(&vec![])
        .iter()
        .filter(|f| {
            let vcodec = f.vcodec.as_deref().unwrap_or("none");
            let acodec = f.acodec.as_deref().unwrap_or("none");
            vcodec == "none" && acodec != "none"
        })
        .filter_map(|f| {
            let format_id = f.format_id.clone()?;
            let ext = f.ext.clone().unwrap_or_default();
            let resolution = "audio only".to_string();
            let filesize = f.filesize.unwrap_or(0);
            let quality = f
                .format_note
                .clone()
                .unwrap_or_else(|| ext.clone());
            let vcodec = "none".to_string();
            let acodec = f.acodec.clone().unwrap_or_else(|| "unknown".to_string());
            let bitrate = f.tbr.unwrap_or(0.0);

            Some(Format {
                format_id,
                ext,
                resolution,
                filesize,
                quality,
                vcodec,
                acodec,
                bitrate,
            })
        })
        .collect();

    audio_formats.sort_by(|a, b| b.bitrate.partial_cmp(&a.bitrate).unwrap_or(std::cmp::Ordering::Equal));

    // Subtitles: merge manual and auto captions, deduplicate by lang
    let mut sub_map: HashMap<String, String> = HashMap::new();
    if let Some(ref subs) = info.subtitles {
        for lang in subs.keys() {
            let name = lang_display_name(lang);
            sub_map.insert(lang.clone(), name);
        }
    }
    if let Some(ref auto) = info.automatic_captions {
        for lang in auto.keys() {
            sub_map.entry(lang.clone()).or_insert_with(|| lang_display_name(lang));
        }
    }
    let mut subtitles: Vec<SubtitleInfo> = sub_map
        .into_iter()
        .map(|(lang, name)| SubtitleInfo { lang, name })
        .collect();
    subtitles.sort_by(|a, b| a.lang.cmp(&b.lang));

    Ok(VideoInfo {
        id: info.id.unwrap_or_default(),
        title: info.title.unwrap_or_else(|| "Untitled".to_string()),
        thumbnail: info.thumbnail.unwrap_or_default(),
        duration: info.duration.unwrap_or(0),
        formats,
        audio_formats,
        subtitles,
    })
}

fn lang_display_name(lang: &str) -> String {
    match lang {
        "en" => "English".to_string(),
        "zh-Hans" => "Chinese (Simplified)".to_string(),
        "zh-Hant" => "Chinese (Traditional)".to_string(),
        "zh" => "Chinese".to_string(),
        "ja" => "Japanese".to_string(),
        "ko" => "Korean".to_string(),
        "es" => "Spanish".to_string(),
        "fr" => "French".to_string(),
        "de" => "German".to_string(),
        "pt" => "Portuguese".to_string(),
        "ru" => "Russian".to_string(),
        "ar" => "Arabic".to_string(),
        "hi" => "Hindi".to_string(),
        "it" => "Italian".to_string(),
        "th" => "Thai".to_string(),
        "vi" => "Vietnamese".to_string(),
        "id" => "Indonesian".to_string(),
        "tr" => "Turkish".to_string(),
        "pl" => "Polish".to_string(),
        "nl" => "Dutch".to_string(),
        other => other.to_string(),
    }
}

#[tauri::command]
async fn download(
    url: String,
    download_type: DownloadType,
    output_dir: String,
    filename_template: String,
    download_id: String,
    window: Window,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let output_template = format!("{}/{}", output_dir, filename_template);

    let mut args = vec![
        "--newline".to_string(),
        "--progress".to_string(),
        "--output".to_string(),
        output_template,
        "--no-overwrites".to_string(),
    ];

    match &download_type {
        DownloadType::Video { format_id } => {
            args.push("--format".to_string());
            args.push(format!("{}+bestaudio", format_id));
            args.push("--merge-output-format".to_string());
            args.push("mp4".to_string());
        }
        DownloadType::Audio {
            audio_format,
            audio_quality,
        } => {
            args.push("--extract-audio".to_string());
            args.push("--audio-format".to_string());
            args.push(audio_format.clone());
            args.push("--audio-quality".to_string());
            args.push(audio_quality.to_string());
        }
        DownloadType::Subtitle { languages, embed } => {
            args.push("--write-subs".to_string());
            args.push("--sub-langs".to_string());
            args.push(languages.join(","));
            if *embed {
                args.push("--embed-subs".to_string());
            }
            args.push("--skip-download".to_string());
        }
    }

    args.push(url);

    let (mut rx, child) = tauri::api::process::Command::new("yt-dlp")
        .args(&args)
        .spawn()
        .map_err(|e| format!("Failed to spawn yt-dlp: {}", e))?;

    state
        .active_downloads
        .lock()
        .unwrap()
        .insert(download_id.clone(), ActiveDownload { kill_handle: child });

    let mut last_progress = 0.0f64;
    let mut last_file_path: Option<String> = None;

    while let Some(event) = rx.recv().await {
        match event {
            tauri::api::process::CommandEvent::Stderr(line) => {
                // Track destination file path
                if line.contains("[download] Destination: ") {
                    if let Some(pos) = line.find("Destination: ") {
                        last_file_path = Some(line[pos + 13..].trim().to_string());
                    }
                }

                // Also detect already-downloaded paths
                if line.contains("has already been downloaded") {
                    if let Some(pos) = line.find("[download] ") {
                        let after = &line[pos + 11..];
                        if let Some(end) = after.find(" has already") {
                            last_file_path = Some(after[..end].trim().to_string());
                        }
                    }
                }

                if line.contains("[download]") && line.contains('%') {
                    if let Some((percent, speed, eta, downloaded_size, total_size)) =
                        parse_progress_line(&line)
                    {
                        if percent > last_progress || percent >= 100.0 {
                            last_progress = percent;
                            let _ = window.emit(
                                "download-progress",
                                DownloadProgress {
                                    download_id: download_id.clone(),
                                    progress: percent,
                                    speed,
                                    eta,
                                    status: "downloading".to_string(),
                                    error: None,
                                    file_path: None,
                                    downloaded_size,
                                    total_size,
                                },
                            );
                        }
                    }
                } else if line.contains("Merging") || line.contains("merging") {
                    let _ = window.emit(
                        "download-progress",
                        DownloadProgress {
                            download_id: download_id.clone(),
                            progress: 99.0,
                            speed: String::new(),
                            eta: String::new(),
                            status: "merging".to_string(),
                            error: None,
                            file_path: None,
                            downloaded_size: None,
                            total_size: None,
                        },
                    );
                } else if line.contains("ERROR") || line.contains("error:") {
                    let _ = window.emit(
                        "download-progress",
                        DownloadProgress {
                            download_id: download_id.clone(),
                            progress: last_progress,
                            speed: String::new(),
                            eta: String::new(),
                            status: "error".to_string(),
                            error: Some(line.trim().to_string()),
                            file_path: None,
                            downloaded_size: None,
                            total_size: None,
                        },
                    );
                }
            }
            tauri::api::process::CommandEvent::Terminated(status) => {
                state.active_downloads.lock().unwrap().remove(&download_id);

                if status.code == Some(0) {
                    let _ = window.emit(
                        "download-progress",
                        DownloadProgress {
                            download_id: download_id.clone(),
                            progress: 100.0,
                            speed: String::new(),
                            eta: String::new(),
                            status: "completed".to_string(),
                            error: None,
                            file_path: last_file_path.clone(),
                            downloaded_size: None,
                            total_size: None,
                        },
                    );
                } else {
                    let _ = window.emit(
                        "download-progress",
                        DownloadProgress {
                            download_id: download_id.clone(),
                            progress: last_progress,
                            speed: String::new(),
                            eta: String::new(),
                            status: "error".to_string(),
                            error: Some(format!(
                                "Process exited with code {}",
                                status.code.unwrap_or(-1)
                            )),
                            file_path: None,
                            downloaded_size: None,
                            total_size: None,
                        },
                    );
                }
            }
            _ => {}
        }
    }

    Ok(())
}

#[tauri::command]
async fn cancel_download(
    download_id: String,
    state: State<'_, AppState>,
    window: Window,
) -> Result<(), String> {
    let mut downloads = state.active_downloads.lock().unwrap();
    if let Some(download) = downloads.remove(&download_id) {
        download
            .kill_handle
            .kill()
            .map_err(|e| format!("Failed to kill process: {}", e))?;

        let _ = window.emit(
            "download-progress",
            DownloadProgress {
                download_id,
                progress: 0.0,
                speed: String::new(),
                eta: String::new(),
                status: "cancelled".to_string(),
                error: None,
                file_path: None,
                downloaded_size: None,
                total_size: None,
            },
        );
    }
    Ok(())
}

#[tauri::command]
async fn open_path(path: String) -> Result<(), String> {
    open::that(&path).map_err(|e| format!("Failed to open: {}", e))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            active_downloads: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            get_video_info,
            download,
            cancel_download,
            open_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
