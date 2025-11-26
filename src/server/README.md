# Bansfield Connections - Database Setup

This directory contains the database setup and server API for the Bansfield Connections app.

## Database Type: SQLite

This project uses SQLite, a lightweight file-based database that requires no separate server installation. The database file (`bansfield_connections.db`) is created automatically in the `server/` directory.

## Database Schema

The database consists of 5 main tables:

### 1. **users**

- `id` (Primary Key, Auto-increment)
- `username` (Unique)
- `created_at` (Timestamp)

### 2. **games**

- `id` (Primary Key, Auto-increment)
- `title`
- `creator_id` (Foreign Key to users)
- `created_at` (Timestamp)

### 3. **categories**

- `id` (Primary Key, Auto-increment)
- `game_id` (Foreign Key to games)
- `category_name`
- `difficulty_level` (1-4, where 1 is easiest and 4 is hardest)
- `description`

### 4. **words**

- `id` (Primary Key, Auto-increment)
- `category_id` (Foreign Key to categories)
- `word`

### 5. **user_played_games** (Junction Table)

- `user_id` (Foreign Key to users)
- `game_id` (Foreign Key to games)
- `played_at` (Timestamp)

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- That's it! No database server needed!

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database and Insert Mock Data

Run the setup script to create the database, tables, and insert mock data:

```bash
npm run setup-db
```

This will:

- Create the `bansfield_connections.db` SQLite database file
- Create all necessary tables with foreign key constraints
- Insert one mock user: `john_doe`
- Insert one mock game: "Tech Terms" with 4 categories and 16 words
- Display all the data in your terminal to verify

### Step 3: Start the API Server

```bash
npm run server
```

The server will run on `http://localhost:3001`

## API Endpoints

### Users

#### Get all users

```
GET /api/users
```

#### Get user by ID (includes created and played games)

```
GET /api/users/:id
```

Response example:

```json
{
  "id": 1,
  "username": "john_doe",
  "created_at": "2024-01-01 12:00:00",
  "created_games": [1, 2, 3],
  "played_games": [1, 2, 3, 4]
}
```

#### Create a new user

```
POST /api/users
Body: { "username": "string" }
```

#### Mark a game as played

```
POST /api/users/:userId/played/:gameId
```

### Games

#### Get all games

```
GET /api/games
```

#### Get game by ID (includes all categories and words)

```
GET /api/games/:id
```

Response example:

```json
{
  "id": 1,
  "title": "Tech Terms",
  "creator_id": 1,
  "creator_name": "john_doe",
  "created_at": "2024-01-01 12:00:00",
  "categories": [
    {
      "id": 1,
      "category_name": "Programming Languages",
      "difficulty_level": 1,
      "description": "Popular programming languages",
      "words": ["PYTHON", "JAVASCRIPT", "JAVA", "RUBY"]
    }
  ]
}
```

#### Create a new game

```
POST /api/games
Body: {
  "title": "string",
  "creator_id": number,
  "categories": [
    {
      "category_name": "string",
      "difficulty_level": number (1-4),
      "description": "string",
      "words": ["word1", "word2", "word3", "word4"]
    }
  ]
}
```

**Note:** Each game must have exactly 4 categories, and each category must have exactly 4 words.

## Mock Data

The setup script creates one mock game with the following structure:

**Game:** "Tech Terms" (created by john_doe)

| Category              | Difficulty  | Words                             |
| --------------------- | ----------- | --------------------------------- |
| Programming Languages | 1 (Easiest) | PYTHON, JAVASCRIPT, JAVA, RUBY    |
| Web Technologies      | 2           | REACT, ANGULAR, VUE, SVELTE       |
| Database Systems      | 3           | MYSQL, POSTGRESQL, MONGODB, REDIS |
| Cloud Providers       | 4 (Hardest) | AWS, AZURE, GCP, ORACLE           |

## Testing the API

You can test the API using curl or any API client like Postman:

```bash
# Get all games
curl http://localhost:3001/api/games

# Get specific game with all details
curl http://localhost:3001/api/games/1

# Get user with their games
curl http://localhost:3001/api/users/1

# Create a new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"jane_smith"}'

# Mark a game as played
curl -X POST http://localhost:3001/api/users/1/played/1
```

## Database Relationships

- Users can **create** multiple games (one-to-many via `games.creator_id`)
- Users can **play** multiple games (many-to-many via `user_played_games`)
- Each game has exactly **4 categories** (one-to-many via `categories.game_id`)
- Each category has exactly **4 words** (one-to-many via `words.category_id`)

## Database File Location

The SQLite database file is stored at:

```
server/bansfield_connections.db
```

You can view/edit it with any SQLite browser tool, or query it directly using the `sqlite3` command-line tool:

```bash
sqlite3 server/bansfield_connections.db
```

## Advantages of SQLite

- ✅ No separate database server needed
- ✅ Zero configuration
- ✅ Database is just a file (easy to backup/share)
- ✅ Perfect for development and small-to-medium production apps
- ✅ Cross-platform compatibility
