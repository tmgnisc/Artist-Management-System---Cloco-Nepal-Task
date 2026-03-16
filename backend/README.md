# Backend API Documentation

Node.js + Express.js + MySQL backend for the Interview Task. This document covers setup and all available REST APIs.

## Tech Stack

- Node.js (ES modules)
- Express.js
- MySQL (mysql2/promise, raw SQL)
- JWT authentication
- bcrypt password hashing
- express-validator
- multer (file upload)
- fast-csv (CSV export)

## Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (see `.env.example`):

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=interview_task

JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d
```

4. (Optional but recommended) Configure initial super admin for seeding:

```env
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=StrongPass123
```

5. Start the server:

```bash
npm run dev
# or
npm start
```

The backend will be available at `http://localhost:5000`.

---

## Super admin seed

The system expects exactly one initial `super_admin` user to be created by a seed script. Public registration is only intended for `artist_manager` accounts, and all other users are managed by the super admin.

1. Ensure database tables are created by starting the server once (this triggers automatic migrations).

2. Configure the super admin details in `.env` (as shown above).

3. Run the seed script:

```bash
cd backend
npm run seed:superadmin
```

4. Behavior:

- If a user with role `super_admin` already exists, the script logs the existing email and exits without changes.
- If not, it creates a new user with:
  - `role = super_admin`
  - Name and credentials from `SUPER_ADMIN_*` environment variables.

5. After seeding, log in using the seeded super admin credentials, and use the user management APIs or admin UI to create artists and additional artist managers.

## Conventions

- Base URL for all APIs: `http://localhost:5000/api`
- All JSON responses follow:

```json
{
  "success": true | false,
  "message": "optional success message",
  "data": {},
  "error": {
    "message": "error message",
    "errors": [
      { "field": "fieldName", "message": "validation message" }
    ]
  }
}
```

- Authenticated routes require header:

```http
Authorization: Bearer <accessToken>
```

- Roles:
  - `super_admin`
  - `artist_manager`
  - `artist`

---

## Health

### GET `/api/health`

Simple API health check.

- Response 200:

```json
{
  "success": true,
  "status": "OK",
  "message": "API health check passed"
}
```

### GET `/health`

Server level health check.

- Response 200:

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Authentication

### POST `/api/auth/register`

Public user registration.

- Body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+11234567890",
  "dob": "1990-01-01",
  "gender": "m",
  "address": "optional address",
  "role": "artist"  
}
```

- Notes:
  - `email` must be unique.
  - `password` is hashed before storing.
  - `role` defaults to `artist` if omitted.

- Response 201:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": 1, "email": "john@example.com", "role": "artist" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST `/api/auth/login`

- Body:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

- Response 200: same token structure as register.

### POST `/api/auth/refresh-token`

- Body:

```json
{
  "refreshToken": "..."
}
```

- Response 200: new `accessToken`.

### GET `/api/auth/profile`

- Requires authentication.
- Returns the current user profile.

### PUT `/api/auth/profile`

- Requires authentication.
- Body: any subset of `first_name, last_name, phone, dob, gender, address`.

### PUT `/api/auth/change-password`

- Requires authentication.

- Body:

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

## User Management (super_admin only)

Base path: `/api/users`

All routes require:

```http
Authorization: Bearer <super_admin accessToken>
```

### GET `/api/users`

List users with pagination and filters.

- Query params:
  - `page` (default 1)
  - `limit` (default 10, max 100)
  - `search` (matches first_name, last_name, email)
  - `role` (super_admin | artist_manager | artist)

### POST `/api/users`

Create user (any role).

- Body similar to register, plus `role`.

### GET `/api/users/:id`

Get user details by id.

### PUT `/api/users/:id`

Update user fields (including optional password change).

### DELETE `/api/users/:id`

Delete a user.

- Safety:
  - Cannot delete self.
  - Cannot delete another super_admin.

---

## Artist Module (super_admin, artist)

Base path: `/api/artists`

All routes require:

```http
Authorization: Bearer <accessToken with role super_admin or artist>
```

### GET `/api/artists`

List artists with pagination and search by name.

- Query params:
  - `page`, `limit`
  - `search` (matches `name`)

### POST `/api/artists`

Create a new artist.

- Body:

```json
{
  "name": "Artist Name",
  "dob": "1990-01-01",
  "gender": "m",
  "address": "optional address",
  "first_release_year": 2010,
  "no_of_albums_released": 3
}
```

### GET `/api/artists/:id`

Get artist by id.

### PUT `/api/artists/:id`

Update artist fields.

### DELETE `/api/artists/:id`

Delete artist (songs deleted automatically due to cascade).

### GET `/api/artists/:id/songs`

List all songs for a given artist.

### POST `/api/artists/:artistId/songs`

Create a song for an artist.

- Body:

```json
{
  "title": "Song Title",
  "album_name": "Album Name",
  "genre": "rock"
}
```

---

## Artist CSV Import / Export

### POST `/api/artists/import/csv`

Upload a CSV file and bulk-insert artists.

- Auth: `super_admin` or `artist`.
- Content type: `multipart/form-data`.
- File field name: `file`.
- Expected header line:

```text
name,dob,gender,address,first_release_year,no_of_albums_released
```

### GET `/api/artists/export/csv`

Export all artists as a CSV file.

---

## Song Module

### Admin Song Routes (super_admin, artist_manager)

Base path: `/api/songs`

All routes require:

```http
Authorization: Bearer <accessToken with role super_admin or artist_manager>
```

#### GET `/api/songs`

List all songs with pagination and filters.

- Query params:
  - `page`, `limit`
  - `genre` (rnb | country | classic | rock | jazz)
  - `artistId`
  - `title` (substring match)

#### GET `/api/songs/:id`

Get a single song by id (includes artist_name).

#### PUT `/api/songs/:id`

Update song fields.

- Body (any subset):

```json
{
  "title": "New Title",
  "album_name": "New Album",
  "genre": "jazz"
}
```

#### DELETE `/api/songs/:id`

Delete a song.

### Artist Song Creation

As documented in the Artist section:

- `POST /api/artists/:artistId/songs` for creating a song under a specific artist.

---

## Error Handling

- All errors go through a global error handler.
- Validation errors include an `errors` array with field-level messages.
- In production, stack traces are hidden; in development they are included in the response.

