# Audio/Subtitle Downloads & UI Improvements Design

## Overview

Add audio-only and subtitle download capabilities to the YT-DLP GUI, fix the video+audio merge bug that causes frozen end frames, enrich format/progress data, and restructure the VideoInfo UI with tabs.

## Scope

**In scope:**
- Fix 3 critical bugs: video merge issue, file_path never set, format filtering removes audio
- Audio download: format selection (MP3/WAV/FLAC/AAC/OGG), quality (0-9), audio-only mode
- Subtitle download: language selection, embed-in-video option
- Tabbed UI: Video / Audio / Subtitles tabs in VideoInfo card
- Enriched format data: codec, bitrate, filesize per format
- Enriched progress: downloaded size / total size

**Out of scope:**
- Proxy/cookies browser configuration
- Settings persistence across restarts
- Playlist/batch support
- Dark mode

## Architecture

### Approach: Unified Download Command

A single `download` Tauri command replaces `download_video`, accepting a `DownloadType` enum that dispatches to different yt-dlp flag sets. This avoids duplicating progress parsing and child process management.

---

## Backend Changes (src-tauri/src/main.rs)

### 1. Enriched Data Types

**Format struct** — add codec, bitrate fields:
```rust
pub struct Format {
    pub format_id: String,
    pub ext: String,
    pub resolution: String,
    pub filesize: u64,
    pub quality: String,
    pub vcodec: String,    // NEW: "avc1", "vp9", "none", etc.
    pub acodec: String,    // NEW: "mp4a", "opus", "none", etc.
    pub bitrate: f64,      // NEW: total bitrate in kbps from tbr field
}
```

**VideoInfo struct** — add audio_formats and subtitles:
```rust
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub duration: u64,
    pub formats: Vec<Format>,          // video formats (existing)
    pub audio_formats: Vec<Format>,    // NEW: audio-only formats
    pub subtitles: Vec<SubtitleInfo>,  // NEW: available subtitles
}
```

**New SubtitleInfo struct:**
```rust
pub struct SubtitleInfo {
    pub lang: String,       // "en", "zh-Hans", etc.
    pub name: String,       // "English", "Chinese (Simplified)", etc.
}
```

**New DownloadType enum:**
```rust
#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum DownloadType {
    #[serde(rename = "video")]
    Video { format_id: String },
    #[serde(rename = "audio")]
    Audio { audio_format: String, audio_quality: u8 },
    #[serde(rename = "subtitle")]
    Subtitle { languages: Vec<String>, embed: bool },
}
```

**Enriched DownloadProgress** — add size fields:
```rust
pub struct DownloadProgress {
    // ... existing fields ...
    pub downloaded_size: Option<String>,  // NEW: "45.2MiB"
    pub total_size: Option<String>,       // NEW: "123.45MiB"
}
```

### 2. Fix Format Filtering (get_video_info)

Current code (line 127-131) discards all audio-only formats. Change to build two separate lists:

**Video formats**: filter where `vcodec != "none"` and `resolution != "audio only"` (keep existing logic but also capture vcodec/acodec/bitrate).

**Audio formats**: filter where `vcodec == "none"` and `acodec` is present and not "none". These are audio-only streams. Sort by bitrate descending.

**Subtitles**: parse the `subtitles` and `automatic_captions` fields from yt-dlp JSON output. Return unique language codes with display names.

### 3. Fix Video Merge (download command)

Replace `download_video` with a unified `download` command:

```rust
#[tauri::command]
async fn download(
    url: String,
    download_type: DownloadType,
    output_dir: String,
    filename_template: String,
    download_id: String,
    window: Window,
    state: State<'_, AppState>,
) -> Result<(), String>
```

**For Video type:**
- Format selector: `<format_id>+bestaudio` (pairs video with best audio stream)
- Add `--merge-output-format mp4` flag (fixes the freeze-frame issue)
- Add `--format-sort-force` to ensure proper merging

**For Audio type:**
- Flags: `--extract-audio --audio-format <fmt> --audio-quality <0-9>`
- No merge needed

**For Subtitle type:**
- Flags: `--write-subs --sub-langs <comma-separated-langs>`
- If embed: add `--embed-subs` flag
- Also add `--skip-download` since we only want subs

### 4. Fix file_path on Completion

After the yt-dlp process exits with code 0, determine the output file path:

**Approach**: Parse yt-dlp's stderr output for `[download] Destination: <path>` lines, which yt-dlp prints before downloading each file. Capture this path and emit it in the "completed" event's `file_path` field.

This is reliable because yt-dlp always prints the destination path before downloading. For merged video+audio, yt-dlp also prints `[download] <path> has already been downloaded` or the merge destination. Track the last "Destination" path seen during the download.

**Fallback**: If no Destination line is found (edge case), construct path as `<output_dir>/<title>.<ext>` where ext is `mp4` for video, the audio format for audio, or `srt` for subtitles.

### 5. Fix Progress Parsing

Extend `parse_progress_line` to also extract downloaded/total size:
```
[download]  45.2% of ~123.45MiB at 1.23MiB/s ETA 01:02
```
Parse: `downloaded_size` = "45.2% of ~123.45MiB" → extract "55.94MiB" (computed), `total_size` = "~123.45MiB".

Also detect merge/post-processing messages on stderr (not stdout) and emit "merging" status.

### 6. Remove Hardcoded Chrome Cookies

Remove `--cookies-from-browser chrome` from both `get_video_info` and `download` commands. This flag causes failures on systems without Chrome. No replacement — yt-dlp works without browser cookies for most public content. Cookie support can be added as a future setting.

---

## Frontend Changes

### 1. Types (src/types.ts)

```typescript
export interface Format {
  format_id: string
  ext: string
  resolution: string
  filesize: number
  quality: string
  vcodec: string      // NEW
  acodec: string      // NEW
  bitrate: number     // NEW
}

export interface SubtitleInfo {
  lang: string
  name: string
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: Format[]
  audio_formats: Format[]       // NEW
  subtitles: SubtitleInfo[]     // NEW
}

export type DownloadType =
  | { type: 'video'; format_id: string }
  | { type: 'audio'; audio_format: string; audio_quality: number }
  | { type: 'subtitle'; languages: string[]; embed: boolean }

export type DownloadMode = 'video' | 'audio' | 'subtitle'

export interface DownloadItem {
  // ... existing fields ...
  downloadType: DownloadMode    // NEW: which tab was active
  downloadedSize?: string       // NEW
  totalSize?: string            // NEW
}

export interface DownloadProgressEvent {
  // ... existing fields ...
  downloaded_size?: string      // NEW
  total_size?: string           // NEW
}
```

### 2. VideoInfo Component — Tabbed UI

Add three tabs: **Video** | **Audio** | **Subtitles**

**Video tab:**
- Same format picker as current, but each button now shows: quality label, resolution, codec (e.g., "avc1"), bitrate (e.g., "2.5 Mbps"), filesize
- Selected format auto-pairs with best audio on backend

**Audio tab:**
- Format dropdown: MP3, WAV, FLAC, AAC, OGG (default: MP3)
- Quality slider: 0 (best) to 9 (worst), default 0
- Shows available audio-only formats from `audio_formats` with codec and bitrate info
- Download button label: "Download Audio"

**Subtitles tab:**
- Checkbox list of available subtitle languages from `subtitles`
- "Embed in video file" checkbox (default: unchecked)
- If no subtitles available, show "No subtitles available for this video"
- Download button label: "Download Subtitles"

The download button text changes based on active tab. The `onDownload` callback receives the active tab and relevant options.

**Props change:**
```typescript
interface VideoInfoProps {
  video: VideoInfoType
  selectedFormat: Format | null
  audioFormat: string
  audioQuality: number
  selectedSubtitles: string[]
  embedSubtitles: boolean
  activeTab: DownloadMode
  onFormatSelect: (format: Format) => void
  onAudioFormatChange: (format: string) => void
  onAudioQualityChange: (quality: number) => void
  onSubtitleToggle: (lang: string) => void
  onEmbedSubtitlesChange: (embed: boolean) => void
  onTabChange: (tab: DownloadMode) => void
  onDownload: () => void
}
```

### 3. DownloadList Component — Richer Progress

- Show `downloadedSize / totalSize` below the progress bar when available
- Show download type badge (Video/Audio/Subtitle) next to each item title
- Existing speed/ETA display kept as-is

### 4. App.tsx State

Add state:
```typescript
const [activeTab, setActiveTab] = useState<DownloadMode>('video')
const [audioFormat, setAudioFormat] = useState('mp3')
const [audioQuality, setAudioQuality] = useState(0)
const [selectedSubtitles, setSelectedSubtitles] = useState<string[]>([])
const [embedSubtitles, setEmbedSubtitles] = useState(false)
```

`handleDownload` builds the appropriate `DownloadType` based on `activeTab`:
- Video: `{ type: 'video', format_id: selectedFormat.format_id }`
- Audio: `{ type: 'audio', audio_format: audioFormat, audio_quality: audioQuality }`
- Subtitle: `{ type: 'subtitle', languages: selectedSubtitles, embed: embedSubtitles }`

Invoke `download` (not `download_video`) with the typed payload.

### 5. CSS Changes (styles.css)

- Tab bar styles: `.tabs`, `.tab`, `.tab.active`
- Audio format dropdown and quality slider styles
- Subtitle checkbox list styles
- Download type badge: `.download-type-badge`
- Size info in progress: `.progress-size`
- Enriched format button: `.format-codec`, `.format-bitrate`

---

## File Change Summary

| File | Changes |
|------|---------|
| `src-tauri/src/main.rs` | Enriched types, split format filtering, unified download command, merge fix, file_path fix, subtitle support, size parsing |
| `src/types.ts` | Add SubtitleInfo, DownloadType, DownloadMode, enrich Format and DownloadItem |
| `src/App.tsx` | Add tab/audio/subtitle state, update handleDownload for unified command, pass new props |
| `src/components/VideoInfo.tsx` | Tabbed UI with Video/Audio/Subtitles tabs, enriched format display |
| `src/components/DownloadList.tsx` | Download type badge, size info in progress |
| `src/styles.css` | Tab styles, audio/subtitle UI styles, enriched format styles |

No new files created. No dependencies added.

---

## Testing

1. **Video download**: Select a 1080p format, download, verify no freeze frames at end (merge fix)
2. **Audio download**: Switch to Audio tab, select MP3, quality 0, download, verify .mp3 file plays correctly
3. **Subtitle download**: Switch to Subtitles tab, select languages, download, verify .srt files appear
4. **Embedded subtitles**: Check "Embed in video", download, verify subs are in the video file
5. **Format details**: Verify codec, bitrate, filesize display correctly in format buttons
6. **Progress details**: Verify downloaded/total size shows during download
7. **file_path**: Verify "Open File" and "Open Folder" buttons appear after completion
8. **Cancel**: Verify cancel works for all three download types
