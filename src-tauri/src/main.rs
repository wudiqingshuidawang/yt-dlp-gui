use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub duration: u64,
    pub formats: Vec<Format>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Format {
    pub format_id: String,
    pub ext: String,
    pub resolution: String,
    pub filesize: u64,
    pub quality: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub status: String,
    pub progress: f64,
    pub speed: String,
    pub eta: String,
}

/// 获取视频信息
#[command]
pub async fn get_video_info(url: String) -> Result<VideoInfo, String> {
    let output = Command::new("yt-dlp")
        .args(&[
            "--dump-json",
            "--no-download",
            &url,
        ])
        .output()
        .map_err(|e| format!("执行 yt-dlp 失败: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp 错误: {}", error));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let video_info: VideoInfo = serde_json::from_str(&json_str)
        .map_err(|e| format!("解析视频信息失败: {}", e))?;

    Ok(video_info)
}

/// 开始下载视频
#[command]
pub async fn download_video(
    url: String,
    format_id: String,
    output_path: String,
) -> Result<String, String> {
    let output = Command::new("yt-dlp")
        .args(&[
            "--format", &format_id,
            "--output", &output_path,
            &url,
        ])
        .output()
        .map_err(|e| format!("执行 yt-dlp 失败: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("下载失败: {}", error));
    }

    Ok("下载完成".to_string())
}

/// 获取下载进度
#[command]
pub async fn get_download_progress() -> Result<DownloadProgress, String> {
    // TODO: 实现下载进度监控
    Ok(DownloadProgress {
        status: "idle".to_string(),
        progress: 0.0,
        speed: String::new(),
        eta: String::new(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_video_info,
            download_video,
            get_download_progress,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
