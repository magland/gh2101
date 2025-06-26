import { useEffect, useState } from 'react';
import { ManifestData, MediaLocationMap } from '../types';

interface UseMediaOrganizationProps {
  manifest: ManifestData;
  fileIndex: number;
}

export const useMediaOrganization = ({ manifest, fileIndex }: UseMediaOrganizationProps) => {
  const [mediaByLocation, setMediaByLocation] = useState<MediaLocationMap>({});
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    // Group media files by location
    const newMediaByLocation = manifest.reduce((acc, item) => {
      const name = item.path.split("/").pop()?.split(".")[0];
      const bbb = name?.split("_") || [];
      let location: string;
      let fileIndex0: number;
      if (item.path.endsWith(".mp4")) {
        location = bbb.length >= 2 ? bbb[1] : "";
        fileIndex0 = bbb.length >= 1 ? parseInt(bbb[bbb.length - 1]) || 0 : 0;
      }
      else {
        location = bbb.length >= 2 ? bbb.slice(0, bbb.length - 1).join("_") : "";
        fileIndex0 = bbb.length >= 1 ? parseInt(bbb[bbb.length - 1]) || 0 : 0;
      }

      if (fileIndex0 !== fileIndex) {
        return acc; // Skip items that are not from the file index
      }

      if (!acc[location]) {
        acc[location] = { videos: [], audios: [] };
      }

      if (item.path.endsWith('.mp4')) {
        acc[location].videos.push(item);
      } else if (item.path.endsWith('.wav')) {
        acc[location].audios.push(item);
      }

      return acc;
    }, {} as MediaLocationMap);

    setMediaByLocation(newMediaByLocation);

    // Sort and filter locations
    const sortedLocations = Object.keys(newMediaByLocation).sort((a, b) => {
      if (a.startsWith("channel_") && !b.startsWith("channel_")) return 1;
      if (!a.startsWith("channel_") && b.startsWith("channel_")) return -1;
      const aHasTop = newMediaByLocation[a].videos.some(v => v.path.split('_')[2] === 'top');
      const bHasTop = newMediaByLocation[b].videos.some(v => v.path.split('_')[2] === 'top');
      if (aHasTop && !bHasTop) return -1;
      if (!aHasTop && bHasTop) return 1;
      return a.localeCompare(b);
    });

    console.log('--- sorted locations', sortedLocations);

    setLocations(sortedLocations);
  }, [manifest, fileIndex]);

  const sortVideos = (videos: ManifestData) => {
    return videos.sort((a, b) => {
      const aIsTop = a.path.split('_')[2] === 'top';
      const bIsTop = b.path.split('_')[2] === 'top';
      if (aIsTop && !bIsTop) return -1;
      if (!aIsTop && bIsTop) return 1;
      return 0;
    });
  };

  console.log('--- locations', locations);

  return {
    mediaByLocation,
    locations,
    sortVideos
  };
};
