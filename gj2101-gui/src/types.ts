export interface ManifestItem {
  path: string;
  size: number;
}

export type ManifestData = ManifestItem[];

export type Call = {
  exp: number;
  file_num: number;
  event_type: "alarm" | "string"
  channel: number;
  start_time_file_sec: number;
  stop_time_file_sec: number;
  duration_sec: number;
  start_time_real: string;
  stop_time_real: string;
  start_time_experiment: string;
  stop_time_experiment: string;
  start_time_experiment_sec: number;
  stop_time_experiment_sec: number;
  assigned_location: "underground" | "arena_1" | "arena_2" | string;
  RMS_areaa_1: string;
  RMS_arena_2: string;
  RMS_underground: string;
  source: "vox" | string;
  bout_id: number;
  position_in_bout: number;
  caller_id: string;
};

export type Bout = {
  exp: number;
  file_num: number;
  channel: number;
  start_time_file_sec: number;
  stop_time_file_sec: number;
  duration_sec: number;
  assigned_location: "underground" | "arena_1" | "arena_2" | string;
  bout_id: number;
  caller_id: string;
  calls: Call[];
}

export interface MediaByLocation {
  videos: ManifestData;
  audios: ManifestData;
}

export type MediaLocationMap = Record<string, MediaByLocation>;

export type ActiveLocationsMap = Record<string, boolean>;

export interface BoutTag {
  bout: number;
  name: string;
}

export interface BoutNote {
  bout: number;
  note: string;
}

export interface LocationStorageData {
  activeLocations: ActiveLocationsMap;
  baseUrl: string;
}
