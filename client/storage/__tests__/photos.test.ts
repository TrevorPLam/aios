import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Photo } from "@/models/types";

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
  });
});
