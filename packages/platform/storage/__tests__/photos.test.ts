/**
 * Photos Module - Comprehensive Test Suite
 *
 * Tests all photo storage operations including:
 * - Basic CRUD operations
 * - Favorites management
 * - Album operations
 * - Tag management
 * - Search functionality
 * - Bulk operations
 * - Statistics
 * - Photo Albums
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Photo, PhotoAlbum } from "@contracts/models/types";

describe("Database Photos Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockPhoto: Photo = {
    id: "photo_1",
    uri: "file:///path/to/photo.jpg",
    localPath: "/path/to/photo.jpg",
    width: 800,
    height: 600,
    fileName: "photo.jpg",
    fileSize: 245000,
    mimeType: "image/jpeg",
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
    isBackedUp: false,
    tags: ["nature", "landscape"],
  };

  describe("photos", () => {
    it("should save and retrieve a photo", async () => {
      await db.photos.save(mockPhoto);
      const all = await db.photos.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockPhoto);
    });

    it("should get a specific photo by id", async () => {
      await db.photos.save(mockPhoto);
      const photo = await db.photos.get("photo_1");

      expect(photo).toEqual(mockPhoto);
    });

    it("should return null for non-existent photo", async () => {
      const photo = await db.photos.get("non_existent");
      expect(photo).toBeNull();
    });

    it("should delete a photo", async () => {
      await db.photos.save(mockPhoto);
      await db.photos.delete("photo_1");

      const all = await db.photos.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing photo on save", async () => {
      await db.photos.save(mockPhoto);
      const updated = { ...mockPhoto, fileName: "updated.jpg" };
      await db.photos.save(updated);

      const all = await db.photos.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].fileName).toBe("updated.jpg");
    });

    it("should sort photos by createdAt descending", async () => {
      const photo1 = {
        ...mockPhoto,
        id: "photo_1",
        createdAt: "2026-01-14T10:00:00Z",
      };
      const photo2 = {
        ...mockPhoto,
        id: "photo_2",
        createdAt: "2026-01-14T12:00:00Z",
      };
      const photo3 = {
        ...mockPhoto,
        id: "photo_3",
        createdAt: "2026-01-14T11:00:00Z",
      };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const sorted = await db.photos.getAllSorted();

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe("photo_2");
      expect(sorted[1].id).toBe("photo_3");
      expect(sorted[2].id).toBe("photo_1");
    });

    it("should update backup status", async () => {
      await db.photos.save(mockPhoto);

      await db.photos.updateBackupStatus("photo_1", true);

      const photo = await db.photos.get("photo_1");
      expect(photo).not.toBeNull();
      expect(photo!.isBackedUp).toBe(true);
      expect(new Date(photo!.updatedAt).getTime()).toBeGreaterThan(
        new Date(mockPhoto.updatedAt).getTime(),
      );
    });

    it("should get photos by tag", async () => {
      const photo1 = {
        ...mockPhoto,
        id: "photo_1",
        tags: ["nature", "landscape"],
      };
      const photo2 = {
        ...mockPhoto,
        id: "photo_2",
        tags: ["portrait", "people"],
      };
      const photo3 = {
        ...mockPhoto,
        id: "photo_3",
        tags: ["nature", "wildlife"],
      };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const naturePhotos = await db.photos.getByTag("nature");

      expect(naturePhotos).toHaveLength(2);
      expect(naturePhotos.map((p) => p.id)).toContain("photo_1");
      expect(naturePhotos.map((p) => p.id)).toContain("photo_3");
    });

    it("should handle photo with multiple tags", async () => {
      const photoWithTags: Photo = {
        ...mockPhoto,
        tags: ["nature", "landscape", "sunset", "mountains"],
      };

      await db.photos.save(photoWithTags);
      const retrieved = await db.photos.get("photo_1");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.tags).toHaveLength(4);
      expect(retrieved!.tags).toContain("sunset");
    });

    it("should handle photo with no tags", async () => {
      const photoNoTags: Photo = {
        ...mockPhoto,
        tags: [],
      };

      await db.photos.save(photoNoTags);
      const retrieved = await db.photos.get("photo_1");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.tags).toHaveLength(0);
    });

    it("should delete multiple photos at once", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1" };
      const photo2 = { ...mockPhoto, id: "photo_2" };
      const photo3 = { ...mockPhoto, id: "photo_3" };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      await db.photos.deleteMultiple(["photo_1", "photo_3"]);

      const all = await db.photos.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("photo_2");
    });
  });

  describe("Favorites Management", () => {
    it("should toggle favorite status on a photo", async () => {
      await db.photos.save(mockPhoto);

      // Toggle on
      await db.photos.toggleFavorite("photo_1");
      let photo = await db.photos.get("photo_1");
      expect(photo?.isFavorite).toBe(true);

      // Toggle off
      await db.photos.toggleFavorite("photo_1");
      photo = await db.photos.get("photo_1");
      expect(photo?.isFavorite).toBe(false);
    });

    it("should get all favorite photos", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1", isFavorite: true };
      const photo2 = { ...mockPhoto, id: "photo_2", isFavorite: false };
      const photo3 = { ...mockPhoto, id: "photo_3", isFavorite: true };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const favorites = await db.photos.getFavorites();
      expect(favorites).toHaveLength(2);
      expect(favorites.map((p) => p.id)).toContain("photo_1");
      expect(favorites.map((p) => p.id)).toContain("photo_3");
    });

    it("should return empty array when no favorites exist", async () => {
      await db.photos.save(mockPhoto);

      const favorites = await db.photos.getFavorites();
      expect(favorites).toHaveLength(0);
    });
  });

  describe("Album Management", () => {
    it("should get photos by album", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1", albumId: "album_1" };
      const photo2 = { ...mockPhoto, id: "photo_2", albumId: "album_2" };
      const photo3 = { ...mockPhoto, id: "photo_3", albumId: "album_1" };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const albumPhotos = await db.photos.getByAlbum("album_1");
      expect(albumPhotos).toHaveLength(2);
      expect(albumPhotos.map((p) => p.id)).toContain("photo_1");
      expect(albumPhotos.map((p) => p.id)).toContain("photo_3");
    });

    it("should get photos without album", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1", albumId: "album_1" };
      const photo2 = { ...mockPhoto, id: "photo_2" };
      const photo3 = { ...mockPhoto, id: "photo_3" };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const unassigned = await db.photos.getWithoutAlbum();
      expect(unassigned).toHaveLength(2);
      expect(unassigned.map((p) => p.id)).toContain("photo_2");
      expect(unassigned.map((p) => p.id)).toContain("photo_3");
    });

    it("should move photos to album", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1" };
      const photo2 = { ...mockPhoto, id: "photo_2" };

      await db.photos.save(photo1);
      await db.photos.save(photo2);

      await db.photos.moveToAlbum(["photo_1", "photo_2"], "album_1");

      const photo1Updated = await db.photos.get("photo_1");
      const photo2Updated = await db.photos.get("photo_2");

      expect(photo1Updated?.albumId).toBe("album_1");
      expect(photo2Updated?.albumId).toBe("album_1");
    });

    it("should remove photos from album", async () => {
      const photo1 = { ...mockPhoto, id: "photo_1", albumId: "album_1" };
      const photo2 = { ...mockPhoto, id: "photo_2", albumId: "album_1" };

      await db.photos.save(photo1);
      await db.photos.save(photo2);

      await db.photos.removeFromAlbum(["photo_1", "photo_2"]);

      const photo1Updated = await db.photos.get("photo_1");
      const photo2Updated = await db.photos.get("photo_2");

      expect(photo1Updated?.albumId).toBeUndefined();
      expect(photo2Updated?.albumId).toBeUndefined();
    });
  });

  describe("Tag Management", () => {
    it("should add tags to a photo", async () => {
      await db.photos.save({ ...mockPhoto, tags: ["nature"] });

      await db.photos.addTags("photo_1", ["landscape", "sunset"]);

      const photo = await db.photos.get("photo_1");
      expect(photo?.tags).toHaveLength(3);
      expect(photo?.tags).toContain("nature");
      expect(photo?.tags).toContain("landscape");
      expect(photo?.tags).toContain("sunset");
    });

    it("should not duplicate tags when adding", async () => {
      await db.photos.save({ ...mockPhoto, tags: ["nature", "landscape"] });

      await db.photos.addTags("photo_1", ["landscape", "sunset"]);

      const photo = await db.photos.get("photo_1");
      expect(photo?.tags).toHaveLength(3);
      expect(photo?.tags.filter((t) => t === "landscape")).toHaveLength(1);
    });

    it("should remove tags from a photo", async () => {
      await db.photos.save({
        ...mockPhoto,
        tags: ["nature", "landscape", "sunset"],
      });

      await db.photos.removeTags("photo_1", ["landscape", "sunset"]);

      const photo = await db.photos.get("photo_1");
      expect(photo?.tags).toHaveLength(1);
      expect(photo?.tags).toContain("nature");
    });

    it("should handle removing non-existent tags", async () => {
      await db.photos.save({ ...mockPhoto, tags: ["nature"] });

      await db.photos.removeTags("photo_1", ["nonexistent"]);

      const photo = await db.photos.get("photo_1");
      expect(photo?.tags).toHaveLength(1);
      expect(photo?.tags).toContain("nature");
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      const photo1 = {
        ...mockPhoto,
        id: "photo_1",
        fileName: "sunset.jpg",
        tags: ["nature", "sunset"],
        description: "Beautiful sunset over mountains",
      };
      const photo2 = {
        ...mockPhoto,
        id: "photo_2",
        fileName: "portrait.jpg",
        tags: ["people", "indoor"],
        description: "Family portrait at home",
      };
      const photo3 = {
        ...mockPhoto,
        id: "photo_3",
        fileName: "beach.jpg",
        tags: ["nature", "beach"],
        description: "Sunset at the beach",
      };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);
    });

    it("should search photos by filename", async () => {
      const results = await db.photos.search("portrait");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("photo_2");
    });

    it("should search photos by tags", async () => {
      const results = await db.photos.search("nature");
      expect(results).toHaveLength(2);
      expect(results.map((p) => p.id)).toContain("photo_1");
      expect(results.map((p) => p.id)).toContain("photo_3");
    });

    it("should search photos by description", async () => {
      const results = await db.photos.search("family");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("photo_2");
    });

    it("should search case-insensitively", async () => {
      const results = await db.photos.search("SUNSET");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return multiple matches across different fields", async () => {
      const results = await db.photos.search("sunset");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array for no matches", async () => {
      const results = await db.photos.search("nonexistent");
      expect(results).toHaveLength(0);
    });

    it("should handle empty search query", async () => {
      const results = await db.photos.search("");
      expect(results).toHaveLength(3);
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      const photo1 = {
        ...mockPhoto,
        id: "photo_1",
        fileSize: 100000,
        isBackedUp: true,
        isFavorite: true,
        tags: ["nature"],
        albumId: "album_1",
      };
      const photo2 = {
        ...mockPhoto,
        id: "photo_2",
        fileSize: 200000,
        isBackedUp: false,
        isFavorite: false,
        tags: [],
      };
      const photo3 = {
        ...mockPhoto,
        id: "photo_3",
        fileSize: 150000,
        isBackedUp: true,
        isFavorite: true,
        tags: ["landscape", "sunset"],
        albumId: "album_1",
      };

      await db.photos.save(photo1);
      await db.photos.save(photo2);
      await db.photos.save(photo3);

      const album1: PhotoAlbum = {
        id: "album_1",
        name: "Vacation",
        photoCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.photoAlbums.save(album1);
    });

    it("should calculate correct total photos", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.totalPhotos).toBe(3);
    });

    it("should calculate correct total size", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.totalSize).toBe(450000);
    });

    it("should count backed up photos", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.backedUpCount).toBe(2);
    });

    it("should count favorite photos", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.favoriteCount).toBe(2);
    });

    it("should count albums", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.albumCount).toBe(1);
    });

    it("should count tagged photos", async () => {
      const stats = await db.photos.getStatistics();
      expect(stats.taggedCount).toBe(2);
    });

    it("should handle empty photo library", async () => {
      await AsyncStorage.clear();
      const stats = await db.photos.getStatistics();
      expect(stats.totalPhotos).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.backedUpCount).toBe(0);
      expect(stats.favoriteCount).toBe(0);
    });
  });

  describe("Photo Albums", () => {
    const mockAlbum: PhotoAlbum = {
      id: "album_1",
      name: "Vacation 2026",
      photoCount: 0,
      createdAt: "2026-01-14T00:00:00Z",
      updatedAt: "2026-01-14T00:00:00Z",
      coverPhotoId: "photo_1",
      description: "Summer vacation photos",
    };

    it("should save and retrieve an album", async () => {
      await db.photoAlbums.save(mockAlbum);
      const all = await db.photoAlbums.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockAlbum);
    });

    it("should get a specific album by id", async () => {
      await db.photoAlbums.save(mockAlbum);
      const album = await db.photoAlbums.get("album_1");

      expect(album).toEqual(mockAlbum);
    });

    it("should return null for non-existent album", async () => {
      const album = await db.photoAlbums.get("non_existent");
      expect(album).toBeNull();
    });

    it("should update existing album on save", async () => {
      await db.photoAlbums.save(mockAlbum);
      const updated = { ...mockAlbum, name: "Updated Vacation" };
      await db.photoAlbums.save(updated);

      const all = await db.photoAlbums.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Updated Vacation");
    });

    it("should delete an album", async () => {
      await db.photoAlbums.save(mockAlbum);
      await db.photoAlbums.delete("album_1");

      const all = await db.photoAlbums.getAll();
      expect(all).toHaveLength(0);
    });

    it("should remove album reference from photos when deleting album", async () => {
      // Create album
      await db.photoAlbums.save(mockAlbum);

      // Create photos in album
      const photo1 = { ...mockPhoto, id: "photo_1", albumId: "album_1" };
      const photo2 = { ...mockPhoto, id: "photo_2", albumId: "album_1" };
      await db.photos.save(photo1);
      await db.photos.save(photo2);

      // Delete album
      await db.photoAlbums.delete("album_1");

      // Check photos have albumId removed
      const photo1Updated = await db.photos.get("photo_1");
      const photo2Updated = await db.photos.get("photo_2");

      expect(photo1Updated?.albumId).toBeUndefined();
      expect(photo2Updated?.albumId).toBeUndefined();
    });

    it("should update photo count for an album", async () => {
      await db.photoAlbums.save(mockAlbum);

      // Add photos to album
      const photo1 = { ...mockPhoto, id: "photo_1", albumId: "album_1" };
      const photo2 = { ...mockPhoto, id: "photo_2", albumId: "album_1" };
      await db.photos.save(photo1);
      await db.photos.save(photo2);

      // Update photo count
      await db.photoAlbums.updatePhotoCount("album_1");

      const album = await db.photoAlbums.get("album_1");
      expect(album?.photoCount).toBe(2);
    });

    it("should update album timestamp when updating photo count", async () => {
      await db.photoAlbums.save(mockAlbum);

      const originalTimestamp = new Date(mockAlbum.updatedAt).getTime();

      // Wait to ensure timestamp difference
      // Using a promise-based delay for deterministic testing
      await new Promise((resolve) => setTimeout(resolve, 10));

      await db.photoAlbums.updatePhotoCount("album_1");

      const album = await db.photoAlbums.get("album_1");
      const updatedTimestamp = new Date(album!.updatedAt).getTime();

      // Verify timestamp was updated
      expect(updatedTimestamp).toBeGreaterThan(originalTimestamp);
    });
  });

  describe("Edge Cases", () => {
    it("should handle operations on non-existent photo", async () => {
      await db.photos.toggleFavorite("non_existent");
      await db.photos.addTags("non_existent", ["tag"]);
      await db.photos.removeTags("non_existent", ["tag"]);
      await db.photos.updateBackupStatus("non_existent", true);

      const photo = await db.photos.get("non_existent");
      expect(photo).toBeNull();
    });

    it("should handle empty photo array", async () => {
      const all = await db.photos.getAll();
      expect(all).toHaveLength(0);

      const sorted = await db.photos.getAllSorted();
      expect(sorted).toHaveLength(0);

      const favorites = await db.photos.getFavorites();
      expect(favorites).toHaveLength(0);
    });

    it("should handle deleting non-existent photo", async () => {
      await db.photos.delete("non_existent");
      const all = await db.photos.getAll();
      expect(all).toHaveLength(0);
    });

    it("should handle empty album operations", async () => {
      const albumPhotos = await db.photos.getByAlbum("non_existent");
      expect(albumPhotos).toHaveLength(0);

      await db.photos.moveToAlbum([], "album_1");
      await db.photos.removeFromAlbum([]);

      const all = await db.photos.getAll();
      expect(all).toHaveLength(0);
    });

    it("should handle empty tag operations", async () => {
      await db.photos.save(mockPhoto);

      await db.photos.addTags("photo_1", []);
      await db.photos.removeTags("photo_1", []);

      const photo = await db.photos.get("photo_1");
      expect(photo?.tags).toEqual(mockPhoto.tags);
    });
  });
});
