# Collaboration Service Documentation - Basic Version

## Overview

The Collaboration Service (`apps/collaboration-service/server.js`) is responsible for **basic sharing and invitation management** in the Amazon collaborative wishlist application. This basic version handles invitation creation, acceptance, and access tracking - without advanced features like comments and role-based access control.

## 🏗️ Architecture Pattern

This service follows a **basic collaboration pattern** where:
- Manages wishlist sharing and access control
- Handles invitation creation and acceptance
- Provides simple view-only access control
- Tracks who has access to shared wishlists
- Integrates with other services for permission validation

## 🔧 Key Components

### Database Connection
```javascript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

Uses PostgreSQL connection pool for database operations.

### Service Integration
```javascript
const WISHLIST_SVC_URL = process.env.WISHLIST_SVC_URL || 'http://wishlist-service:3002';
```

Connects to wishlist service for ownership validation.

### User Context Helper
```javascript
function uid(req){ return parseInt(req.headers['x-user-id']||'0',10); }
```

Extracts user ID from the `x-user-id` header (set by the API gateway).

### Error Handling & Safety Nets
```javascript
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED_REJECTION', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION', err);
});
```

## 📡 API Routes

### Health Check
- `GET /health` - Returns service status and name

### Access Management
- `GET /access/mine` - Get current user's access to wishlists
- `GET /wishlists/:id/access` - List collaborators (owner only)
- `DELETE /wishlists/:id/access/:userId` - Remove collaborator (owner only)

### Invitation Management
- `POST /wishlists/:id/invites` - Create invitation (owner only)
- `GET /invites/:token` - Get invite details (public)
- `POST /invites/:token/accept` - Accept invitation

## 🔐 Access Control Operations

### Get User's Access
```javascript
app.get('/access/mine', wrap(async (req,res)=>{
  const userId = uid(req);
  const { rows } = await pool.query('SELECT wishlist_id, role FROM "collab".wishlist_access WHERE user_id=$1',[userId]);
  res.json(rows);
}));
```

**Features:**
- Returns all wishlists the current user has access to
- Includes role information for each wishlist (always 'view_only')
- Used by API gateway to determine user permissions

### List Collaborators (Owner Only)
```javascript
app.get('/wishlists/:id/access', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const ownerId = parseInt(req.headers['x-owner-id']||'0',10);
  if(!ownerId) return res.status(403).json({error:'owner required'});
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_access WHERE wishlist_id=$1',[wid]);
  res.json(rows);
}));
```

**Features:**
- Only wishlist owners can view collaborators
- Validates ownership via `x-owner-id` header
- Returns all users with access to the wishlist

### Remove Collaborator
```javascript
app.delete('/wishlists/:id/access/:userId', wrap(async (req,res)=>{
  await pool.query('DELETE FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',[req.params.id, req.params.userId]);
  res.status(204).end();
}));
```

Removes a user's access to a wishlist.

## 📧 Invitation Management

### Create Invitation
```javascript
app.post('/wishlists/:id/invites', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const token = nanoid(16);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // +72h

  const { rows } = await pool.query(
    'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at) VALUES ($1,$2,$3) RETURNING token, expires_at',
    [wid, token, expiresAt]
  );
  res.status(201).json(rows[0]);
}));
```

**Features:**
- Generates unique 16-character invitation token
- Sets 72-hour expiration
- All invitations are view-only (no access_type field)
- Returns token for sharing

### Get Invitation Details
```javascript
app.get('/invites/:token', wrap(async (req,res)=>{
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
  if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
  res.json(rows[0]);
}));
```

**Features:**
- Public endpoint (no authentication required)
- Validates token and expiration
- Returns invitation details for preview

### Accept Invitation
```javascript
app.post('/invites/:token/accept', wrap(async (req,res)=>{
  const userId = uid(req);
  const displayName = (req.body.display_name || '').trim() || null;

  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
  if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
  const wid = rows[0].wishlist_id;

  await pool.query(
    `INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by, display_name)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (wishlist_id, user_id)
     DO UPDATE SET role=EXCLUDED.role, display_name=COALESCE(EXCLUDED.display_name, "collab".wishlist_access.display_name)`,
    [wid, userId, 'view_only', userId, displayName]
  );

  res.json({ ok:true, wishlist_id: wid, role: 'view_only', display_name: displayName });
}));
```

**Features:**
- Validates invitation token and expiration
- Creates access record with 'view_only' role (fixed)
- Supports custom display names
- Handles duplicate acceptances gracefully

## 🗄️ Database Schema

### Wishlist Invite Table (`collab.wishlist_invite`)
```sql
CREATE TABLE "collab".wishlist_invite (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES "wishlist".wishlist(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL
);
```

**Purpose**: Manages invitation tokens for sharing wishlists (view-only access).

**Fields:**
- `id`: Primary key, auto-incrementing invite identifier
- `wishlist_id`: Foreign key to wishlist being shared (required)
- `token`: Unique invitation token for sharing (required, unique)
- `expires_at`: Token expiration timestamp (required)
- **Note**: No `access_type` field - all invites are view-only

**Constraints:**
- Foreign key constraint on `wishlist_id` references `wishlist.wishlist(id)`
- Unique constraint on `token`
- NOT NULL constraints on all fields

**Indexes:**
- Primary key on `id`
- Unique index on `token` for fast token lookups
- Index on `wishlist_id` for wishlist-specific queries
- Index on `expires_at` for cleanup operations

### Wishlist Access Table (`collab.wishlist_access`)
```sql
CREATE TABLE "collab".wishlist_access (
    wishlist_id INTEGER NOT NULL REFERENCES "wishlist".wishlist(id),
    user_id INTEGER NOT NULL REFERENCES "user".user(id),
    role VARCHAR(50) NOT NULL,
    invited_by INTEGER NOT NULL REFERENCES "user".user(id),
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    display_name VARCHAR(255),
    PRIMARY KEY (wishlist_id, user_id)
);
```

**Purpose**: Tracks who has access to shared wishlists (for Manage People modal).

**Fields:**
- `wishlist_id`: Composite primary key with user_id, foreign key to wishlist (required)
- `user_id`: Composite primary key with wishlist_id, foreign key to user (required)
- `role`: Access role (always 'view_only' in this simple version)
- `invited_by`: Foreign key to user who sent the invitation (required)
- `invited_at`: When access was granted (default: current timestamp)
- `display_name`: Custom name for this user in this wishlist (optional)

**Constraints:**
- Composite primary key on `(wishlist_id, user_id)`
- Foreign key constraint on `wishlist_id` references `wishlist.wishlist(id)`
- Foreign key constraint on `user_id` references `user.user(id)`
- Foreign key constraint on `invited_by` references `user.user(id)`
- NOT NULL constraints on `wishlist_id`, `user_id`, `role`, `invited_by`

**Indexes:**
- Composite primary key on `(wishlist_id, user_id)`
- Index on `user_id` for user access queries
- Index on `invited_by` for invitation tracking

## 🔗 Key Relationships

### One-to-Many Relationships
1. **User → Wishlist Access**: A user can have access to multiple wishlists
2. **Wishlist → Wishlist Invite**: A wishlist can have multiple invitation tokens
3. **Wishlist → Wishlist Access**: A wishlist can be shared with multiple users

### Many-to-Many Relationships
1. **User ↔ Wishlist**: Through `wishlist_access` table (collaboration)

## 🔐 Access Control Flow

### 1. Wishlist Creation
```sql
-- User creates a wishlist (becomes owner)
INSERT INTO "wishlist".wishlist (name, owner_id, privacy) 
VALUES ('My Birthday List', 1, 'Private');
```

### 2. Invitation Generation
```sql
-- Owner generates invitation token (view-only)
INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at)
VALUES (1, 'abc123def456', '2024-01-15 12:00:00');
```

### 3. Invitation Acceptance
```sql
-- Invited user accepts and gets view-only access
INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by, display_name)
VALUES (1, 2, 'view_only', 1, 'Alice');
```

### 4. Access Levels
- **view_only**: Can view items (all invited access is view-only)
- **owner**: Full access to wishlist

## 📊 Data Flow Examples

### Creating a Wishlist with Items
```sql
-- 1. Create wishlist
INSERT INTO "wishlist".wishlist (name, owner_id, privacy) 
VALUES ('Christmas List', 1, 'Private') RETURNING id;

-- 2. Add items
INSERT INTO "wishlist".wishlist_item (product_id, wishlist_id, title, priority, added_by)
VALUES 
  (101, 1, 'Wireless Headphones', 1, 1),
  (102, 1, 'Coffee Maker', 2, 1);
```

### Sharing a Wishlist
```sql
-- 1. Create invitation (view-only)
INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at)
VALUES (1, 'xyz789abc123', '2024-01-20 12:00:00');

-- 2. User accepts invitation (gets view-only access)
INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by)
VALUES (1, 2, 'view_only', 1);
```

## 🔄 Integration with Other Services

### API Gateway Integration
- Gateway calls collaboration endpoints for access control
- Gateway enriches access data with user information
- Gateway combines collaboration data with wishlist data

### Wishlist Service Integration
- Checks wishlist ownership for permission validation
- Uses wishlist service API to determine ownership

### User Service Integration
- User service provides user information for access enrichment
- User IDs are passed via `x-user-id` header

## 🛡️ Security & Access Control

### Simple Access Control
- **view_only**: Can view items (all invited access)
- **owner**: Full access to wishlist

### Permission Validation
- Validates ownership for administrative operations
- Simple access checking (owner or viewer)
- Graceful degradation if services are unavailable

### Token Security
- Unique invitation tokens with expiration
- Secure token generation using nanoid
- Automatic cleanup of expired invitations

## 🔧 Environment Variables

- `PORT`: Service port (default: 3003)
- `DATABASE_URL`: PostgreSQL connection string
- `WISHLIST_SVC_URL`: Wishlist service URL

## 📊 Health Check

- `GET /health` - Returns service status and name

## 🎯 Key Benefits

1. **Basic Collaboration**: Simple sharing and invitation capabilities
2. **View-Only Access**: Controlled sharing with limited permissions
3. **Invitation System**: Secure sharing with expiration
4. **Access Tracking**: Manage who has access to wishlists
5. **Service Integration**: Seamless integration with other services

## 🔍 Request Flow Examples

### Create Invitation Flow
1. **Frontend** sends `POST /api/wishlists/123/invites` (owner only)
2. **API Gateway** validates ownership and forwards request
3. **Collaboration Service** generates unique token
4. **Frontend** receives invitation token for sharing

### Accept Invitation Flow
1. **User** clicks invitation link with token
2. **Frontend** sends `POST /api/invites/token123/accept`
3. **API Gateway** validates JWT and forwards request
4. **Collaboration Service** validates token and creates access
5. **User** gains view-only access to wishlist

## 📈 Performance Considerations

### Database Queries
- Efficient queries with proper indexing
- Batch operations for access management
- Optimized invitation validation

### Caching Opportunities
- User permissions could be cached
- Invitation validation could be cached
- Access lists could be cached with invalidation

### Service Resilience
- Graceful degradation when wishlist service is unavailable
- Error handling for network failures
- Retry logic for critical operations

## ❌ Features NOT Included in Basic Version

### Comments System
- No comment endpoints (`/wishlists/:id/items/:itemId/comments`)
- No comment permission checking
- No comment-related database tables

### Role-Based Access Control
- No role management endpoints (`PATCH /wishlists/:id/access/:userId`)
- Simplified roles: only 'view_only' for invited users
- No granular permission control

### Advanced Invitation Features
- No `access_type` field in invitations
- All invitations are view-only
- No role specification during invitation acceptance

## 🔄 Migration Path to Full Version

To upgrade from basic to full version:

1. **Add Comments Table**:
   ```sql
   CREATE TABLE "collab".wishlist_item_comment (
       id SERIAL PRIMARY KEY,
       wishlist_item_id INTEGER NOT NULL REFERENCES "wishlist".wishlist_item(id),
       user_id INTEGER NOT NULL REFERENCES "user".user(id),
       comment_text TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Add Comment Endpoints**:
   ```javascript
   app.get('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
     // Get comments for item
   }));
   
   app.post('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
     // Add comment to item
   }));
   ```

3. **Add Role Management**:
   ```javascript
   app.patch('/wishlists/:id/access/:userId', wrap(async (req,res)=>{
     // Update collaborator role
   }));
   ```

4. **Enhance Invitation System**:
   ```sql
   ALTER TABLE "collab".wishlist_invite 
   ADD COLUMN access_type VARCHAR(20) NOT NULL DEFAULT 'view_only';
   ```

This basic version provides a solid foundation that can be extended with advanced collaboration features as needed. 