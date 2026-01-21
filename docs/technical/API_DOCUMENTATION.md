# API Documentation

This document provides detailed information about the AIOS Backend API endpoints.

## Base URL

```text
http://localhost:5000/api
```text

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```text
Authorization: Bearer <your-token>
```text

## Response Format

### Success Response

```json
{
  "data": { ... }
}
```text

### Error Response

```json
{
  "status": "error",
  "message": "Error message"
}
```text

## Endpoints

### Authentication

#### Register

Create a new user account.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "username": "string (min 3 characters)",
    "password": "string (min 6 characters)"
  }
  ```text

- **Success Response (201):**

  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "username": "string"
    }
  }
  ```text

#### Login

Authenticate an existing user.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```text

- **Success Response (200):**

  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "username": "string"
    }
  }
  ```text

#### Get Current User

Get the currently authenticated user's information.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):**

  ```json
  {
    "id": "uuid",
    "username": "string"
  }
  ```text

#### Logout

Logout the current user (client-side token removal).

- **URL:** `/api/auth/logout`
- **Method:** `POST`
- **Auth Required:** Yes
- **Success Response (200):**

  ```json
  {
    "message": "Logged out successfully"
  }
  ```text

---

### Recommendations

#### List Recommendations

Get all recommendations for the authenticated user.

- **URL:** `/api/recommendations`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Array of recommendation objects

#### Get Recommendation

Get a specific recommendation by ID.

- **URL:** `/api/recommendations/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Recommendation object

---

### Notes

#### List Notes

Get all notes for the authenticated user.

- **URL:** `/api/notes`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Array of note objects

#### Get Note

Get a specific note by ID.

- **URL:** `/api/notes/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Note object

#### Create Note

Create a new note.

- **URL:** `/api/notes`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

  ```json
  {
    "title": "string",
    "bodyMarkdown": "string",
    "tags": ["string"],
    "links": ["string"]
  }
  ```text

- **Success Response (201):** Created note object

#### Update Note

Update an existing note.

- **URL:** `/api/notes/:id`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:** Partial note object (any fields to update)
- **Success Response (200):** Updated note object

#### Delete Note

Delete a note.

- **URL:** `/api/notes/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Success Response (204):** No content

---

### Tasks

#### List Tasks

Get all tasks for the authenticated user.

- **URL:** `/api/tasks`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Array of task objects

#### Get Task

Get a specific task by ID.

- **URL:** `/api/tasks/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Task object

#### Create Task

Create a new task.

- **URL:** `/api/tasks`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

  ```json
  {
    "title": "string",
    "userNotes": "string",
    "aiNotes": ["string"],
 "priority": "low" | "medium" | "high" | "urgent",
    "dueDate": "ISO 8601 timestamp" | null,
 "status": "pending" | "in_progress" | "completed" | "cancelled",
 "recurrenceRule": "none" | "daily" | "weekly" | "monthly" | "custom",
    "projectId": "uuid" | null,
    "parentTaskId": "uuid" | null,
    "dependencyIds": ["uuid"]
  }
  ```text

- **Success Response (201):** Created task object

#### Update Task

Update an existing task.

- **URL:** `/api/tasks/:id`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:** Partial task object (any fields to update)
- **Success Response (200):** Updated task object

#### Delete Task

Delete a task.

- **URL:** `/api/tasks/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Success Response (204):** No content

---

### Projects

#### List Projects

Get all projects for the authenticated user.

- **URL:** `/api/projects`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Array of project objects

#### Get Project

Get a specific project by ID.

- **URL:** `/api/projects/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Project object

#### Create Project

Create a new project.

- **URL:** `/api/projects`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

  ```json
  {
    "name": "string",
    "description": "string",
    "taskIds": ["uuid"]
  }
  ```text

- **Success Response (201):** Created project object

#### Update Project

Update an existing project.

- **URL:** `/api/projects/:id`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:** Partial project object (any fields to update)
- **Success Response (200):** Updated project object

#### Delete Project

Delete a project.

- **URL:** `/api/projects/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Success Response (204):** No content

---

### Events

#### List Events

Get all calendar events for the authenticated user.

- **URL:** `/api/events`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Array of event objects

#### Get Event

Get a specific event by ID.

- **URL:** `/api/events/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Event object

#### Create Event

Create a new calendar event.

- **URL:** `/api/events`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

  ```json
  {
    "title": "string",
    "description": "string",
    "location": "string",
    "startAt": "ISO 8601 timestamp",
    "endAt": "ISO 8601 timestamp",
    "allDay": boolean,
    "timezone": "string",
 "recurrenceRule": "none" | "daily" | "weekly" | "monthly" | "custom",
    "exceptions": ["ISO 8601 timestamp"],
    "overrides": {},
    "source": "LOCAL"
  }
  ```text

- **Success Response (201):** Created event object

#### Update Event

Update an existing event.

- **URL:** `/api/events/:id`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:** Partial event object (any fields to update)
- **Success Response (200):** Updated event object

#### Delete Event

Delete an event.

- **URL:** `/api/events/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Success Response (204):** No content

---

### Settings

#### Get Settings

Get settings for the authenticated user.

- **URL:** `/api/settings`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response (200):** Settings object

  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "aiName": "string",
    "enabledModules": ["command", "notebook", "planner", "calendar", "email"],
 "aiLimitTier": 0 | 1 | 2 | 3,
    "darkMode": boolean,
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
  ```text

#### Update Settings

Update settings for the authenticated user.

- **URL:** `/api/settings`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:** Partial settings object (any fields to update)

  ```json
  {
    "aiName": "string",
    "enabledModules": ["string"],
 "aiLimitTier": 0 | 1 | 2 | 3,
    "darkMode": boolean
  }
  ```text

- **Success Response (200):** Updated settings object

---

### Translation

#### Translate Text

Translate text from one language to another.

- **URL:** `/api/translate`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "text": "string (text to translate)",
    "sourceLang": "string (source language code, e.g., 'en')",
    "targetLang": "string (target language code, e.g., 'es')"
  }
  ```text

- **Success Response (200):**

  ```json
  {
    "translatedText": "string (translated text)"
  }
  ```text

- **Error Response (400):**

  ```json
  {
    "status": "error",
    "message": "Missing required fields: text, sourceLang, targetLang"
  }
  ```text

- **Error Response (500):**

  ```json
  {
    "status": "error",
    "message": "Translation service unavailable"
  }
  ```text

### Supported Language Codes
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ar` - Arabic
- `hi` - Hindi

---

## Error Codes

- **400 Bad Request:** Invalid request body or validation error
- **401 Unauthorized:** Missing or invalid authentication token
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists (e.g., duplicate username)
- **500 Internal Server Error:** Server error

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing (default: "your-secret-key-change-in-production")
- `PORT`: Server port (default: 5000)

## Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs (v4)
- Password is hashed using bcrypt before storage
- JWT tokens expire after 7 days
- All API routes are prefixed with `/api`
