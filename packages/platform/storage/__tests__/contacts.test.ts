import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Contact } from "@aios/contracts/models/types";

describe("Database Contacts Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockContact: Contact = {
    id: "contact_1",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    phoneNumbers: ["+1234567890"],
    emails: ["john@example.com"],
    birthday: "1990-01-01",
    company: "ACME Corp",
    jobTitle: "Software Engineer",
    imageUri: undefined,
    isRegistered: false,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  describe("contacts", () => {
    it("should save and retrieve a contact", async () => {
      await db.contacts.save(mockContact);
      const all = await db.contacts.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockContact);
    });

    it("should get a specific contact by id", async () => {
      await db.contacts.save(mockContact);
      const contact = await db.contacts.get("contact_1");

      expect(contact).toEqual(mockContact);
    });

    it("should return null for non-existent contact", async () => {
      const contact = await db.contacts.get("non_existent");
      expect(contact).toBeNull();
    });

    it("should delete a contact", async () => {
      await db.contacts.save(mockContact);
      await db.contacts.delete("contact_1");

      const all = await db.contacts.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing contact on save", async () => {
      await db.contacts.save(mockContact);
      const updated = { ...mockContact, name: "Jane Doe" };
      await db.contacts.save(updated);

      const all = await db.contacts.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Jane Doe");
    });

    it("should sort contacts alphabetically by name", async () => {
      const contact1 = { ...mockContact, id: "contact_1", name: "Charlie" };
      const contact2 = { ...mockContact, id: "contact_2", name: "Alice" };
      const contact3 = { ...mockContact, id: "contact_3", name: "Bob" };

      await db.contacts.save(contact1);
      await db.contacts.save(contact2);
      await db.contacts.save(contact3);

      const sorted = await db.contacts.getAllSorted();

      expect(sorted).toHaveLength(3);
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Charlie");
    });

    it("should sync contacts from native with existing data preservation", async () => {
      // Save a contact marked as registered
      const existingContact = {
        ...mockContact,
        id: "contact_1",
        isRegistered: true,
      };
      await db.contacts.save(existingContact);

      // Sync new contact data from native (isRegistered should be preserved)
      const nativeContacts: Contact[] = [
        {
          ...mockContact,
          id: "contact_1",
          name: "John Updated",
          isRegistered: false, // This should be overridden by existing value
        },
        {
          ...mockContact,
          id: "contact_2",
          name: "Jane Smith",
          isRegistered: false,
        },
      ];

      await db.contacts.syncFromNative(nativeContacts);

      const all = await db.contacts.getAll();
      expect(all).toHaveLength(2);

      const contact1 = all.find((c) => c.id === "contact_1");
      expect(contact1?.name).toBe("John Updated");
      expect(contact1?.isRegistered).toBe(true); // Should preserve registered status

      const contact2 = all.find((c) => c.id === "contact_2");
      expect(contact2?.name).toBe("Jane Smith");
      expect(contact2?.isRegistered).toBe(false); // New contact, not registered
    });

    it("should handle contacts with multiple phone numbers and emails", async () => {
      const contactWithMultiple: Contact = {
        ...mockContact,
        phoneNumbers: ["+1234567890", "+0987654321"],
        emails: ["john@example.com", "john.doe@work.com"],
      };

      await db.contacts.save(contactWithMultiple);
      const retrieved = await db.contacts.get("contact_1");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.phoneNumbers).toHaveLength(2);
      expect(retrieved!.emails).toHaveLength(2);
    });

    it("should save all contacts at once", async () => {
      const contacts: Contact[] = [
        { ...mockContact, id: "contact_1", name: "Alice" },
        { ...mockContact, id: "contact_2", name: "Bob" },
        { ...mockContact, id: "contact_3", name: "Charlie" },
      ];

      await db.contacts.saveAll(contacts);
      const all = await db.contacts.getAll();

      expect(all).toHaveLength(3);
    });
  });
});
