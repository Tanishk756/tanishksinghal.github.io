import { MediaItem } from '../types/content';

export const mediaRegistry: Record<string, MediaItem> = {
  avatar: {
    id: "avatar",
    title: "Tanishk Singhal Profile Avatar",
    type: "image",
    url: "https://avatars.githubusercontent.com/u/132895444?v=4",
    altText: "Tanishk Singhal - Robotics Researcher",
    tags: ["profile", "avatar"]
  }
};

export const mediaRegistryData = [
  {
    id: "avatar",
    filename: "avatar_tanishk.png",
    title: "Tanishk Singhal Profile Avatar",
    altText: "Tanishk Singhal - Robotics Researcher",
    caption: "Official developer and robotics profile avatar",
    type: "image" as const,
    url: "https://avatars.githubusercontent.com/u/132895444?v=4",
    associatedContentType: "profile",
    associatedContentId: "tanishk-singhal",
    source: "GitHub Avatar",
    sourceUrl: "https://avatars.githubusercontent.com/u/132895444?v=4",
    verificationStatus: "GITHUB_VERIFIED" as const,
    lastVerified: "2026-09-05",
    notes: "Verified GitHub profile image."
  }
];

export function getMedia(id: string): MediaItem | undefined {
  return mediaRegistry[id];
}

