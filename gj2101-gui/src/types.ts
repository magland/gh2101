export interface ManifestItem {
  path: string;
  size: number;
}

export type ManifestData = ManifestItem[];

export type Bout = {
  exp: number;
  file_index: number;
  bout_id: number;
  bout_start_seconds: number;
  bout_end_seconds: number;
  n_calls: number;
  bout_duration_seconds: number;
};

export interface MediaByLocation {
  videos: ManifestData;
  audios: ManifestData;
}

export type MediaLocationMap = Record<string, MediaByLocation>;

export type ActiveLocationsMap = Record<string, boolean>;

export interface LocationStorageData {
  activeLocations: ActiveLocationsMap;
  baseUrl: string;
}
