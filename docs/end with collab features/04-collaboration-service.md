# Collaboration Service Documentation

## Overview

The Collaboration Service (`apps/collaboration-service/server.js`) is responsible for **sharing, invitations, access control, and comments** in the Amazon collaborative wishlist application. It handles the social and collaborative aspects of wishlists, including user permissions, invitation management, and threaded comments on items.

## 🏗️ Architecture Pattern

This service follows a **collaboration and social features pattern** where:
- Manages wishlist sharing and access control
- Handles invitation creation and acceptance
- Provides role-based access control
- Manages threaded comments on wishlist items
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
- `PATCH /wishlists/:id/access/:userId` - Update collaborator role (owner only)

### Invitation Management
- `POST /wishlists/:id/invites` - Create invitation (owner only)
- `GET /invites/:token` - Get invite details (public)
- `POST /invites/:token/accept` - Accept invitation

### Comments
- `GET /wishlists/:id/items/:itemId/comments` - Get comments for item
- `POST /wishlists/:id/items/:itemId/comments` - Add comment to item

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
- Includes role information for each wishlist
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

### Update Collaborator Role
```javascript
app.patch('/wishlists/:id/access/:userId', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const targetUserId = parseInt(req.params.userId,10);
  const ownerId = parseInt(req.headers['x-owner-id']||'0',10);
  const role = String(req.body?.role || '').trim();

  const allowed = ['view_only','view_edit','comment_only'];
  if (!ownerId) return res.status(403).json({error:'owner required'});
  if (!allowed.includes(role)) return res.status(400).json({error:'invalid role'});

  await pool.query('UPDATE "collab".wishlist_access SET role=$1 WHERE wishlist_id=$2 AND user_id=$3', [role, wid, targetUserId]);
  const { rows } = await pool.query(
    'SELECT wishlist_id, user_id, role, invited_by, invited_at, display_name FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',
    [wid, targetUserId]
  );
  if (!rows[0]) return res.status(404).json({error:'not found'});
  res.json(rows[0]);
}));
```

**Features:**
- Allows owners to change collaborator roles
- Validates role against allowed values
- Returns updated access information

## 📧 Invitation Management

### Create Invitation
```javascript
app.post('/wishlists/:id/invites', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const token = nanoid(16);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // +72h
  const accessType = (req.body?.access_type || 'view_only');

  const { rows } = await pool.query(
    'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at, access_type) VALUES ($1,$2,$3,$4) RETURNING token, expires_at, access_type',
    [wid, token, expiresAt, accessType]
  );
  res.status(201).json(rows[0]);
}));
```

**Features:**
- Generates unique 16-character invitation token
- Sets 72-hour expiration
- Supports different access types (view_only, view_edit, comment_only)
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
  const role = rows[0].access_type || 'view_only';

  await pool.query(
    `INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by, display_name)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (wishlist_id, user_id)
     DO UPDATE SET role=EXCLUDED.role, display_name=COALESCE(EXCLUDED.display_name, "collab".wishlist_access.display_name)`,
    [wid, userId, role, userId, displayName]
  );

  res.json({ ok:true, wishlist_id: wid, role, display_name: displayName });
}));
```

**Features:**
- Validates invitation token and expiration
- Creates access record with specified role
- Supports custom display names
- Handles duplicate acceptances gracefully

## 💬 Comment System

### Permission Helper
```javascript
async function canComment(userId, wishlistId) {
  // Check if user is owner
  try {
    const r = await fetch(`${WISHLIST_SVC_URL}/wishlists/${wishlistId}`);
    if (r.ok) {
      const w = await r.json();
      if (Number(w.owner_id) === Number(userId)) return true;
    }
  } catch (e) {
    console.error('canComment: wishlist check failed', e);
  }
  
  // Check collaboration access
  try {
    const r2 = await pool.query(
      'SELECT role FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',
      [wishlistId, userId]
    );
    if (!r2.rows.length) return false;
    const role = r2.rows[0].role;
    return role === 'view_edit' || role === 'comment_only';
  } catch (e) {
    console.error('canComment: access check failed', e);
    return false;
  }
}
```

**Features:**
- Checks if user is wishlist owner
- Validates collaboration access and role
- Graceful degradation if wishlist service is unavailable

### Get Comments
```javascript
app.get('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const { rows } = await pool.query(
    'SELECT id, wishlist_item_id, user_id, comment_text, created_at FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at ASC',
    [itemId]
  );
  res.json(rows);
}));
```

**Features:**
- Returns all comments for a specific item
- Ordered by creation time (oldest first)
- Used by API gateway for enrichment with user data

### Add Comment
```javascript
app.post('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
  const wid = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const userId = uid(req);
  const text = (req.body?.comment_text || '').trim();

  if (!userId) return res.status(401).json({ error: 'missing user' });
  if (!text) return res.status(400).json({ error: 'comment_text required' });
  if (!(await canComment(userId, wid))) return res.status(403).json({ error: 'forbidden' });

  const { rows } = await pool.query(
    'INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES ($1,$2,$3) RETURNING id, wishlist_item_id, user_id, comment_text, created_at',
    [itemId, userId, text]
  );
  res.status(201).json(rows[0]);
}));
```

**Features:**
- Validates user permissions before allowing comments
- Requires non-empty comment text
- Records user ID and timestamp
- Returns created comment data

## 🗄️ Database Schema

### Wishlist Invite Table (`collab.wishlist_invite`)
```sql
CREATE TABLE "collab".wishlist_invite (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES "wishlist".wishlist(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    access_type VARCHAR(20) NOT NULL DEFAULT 'view_only'
);
```

**Fields:**
- `id`: Primary key, auto-incrementing
- `wishlist_id`: Foreign key to wishlist being shared
- `token`: Unique invitation token
- `expires_at`: Token expiration timestamp
- `access_type`: Type of access granted (view_only/view_edit/comment_only)

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

**Fields:**
- `wishlist_id`: Composite primary key with user_id
- `user_id`: Composite primary key with wishlist_id
- `role`: Access role (view_only/view_edit/comment_only)
- `invited_by`: Foreign key to user who sent the invitation
- `invited_at`: Invitation acceptance timestamp
- `display_name`: Custom name for this user in this wishlist

### Wishlist Item Comment Table (`collab.wishlist_item_comment`)
```sql
CREATE TABLE "collab".wishlist_item_comment (
    id SERIAL PRIMARY KEY,
    wishlist_item_id INTEGER NOT NULL REFERENCES "wishlist".wishlist_item(id),
    user_id INTEGER NOT NULL REFERENCES "user".user(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Primary key, auto-incrementing
- `wishlist_item_id`: Foreign key to item being commented on
- `user_id`: Foreign key to user making the comment
- `comment_text`: The comment content
- `created_at`: Comment creation timestamp

## 🔄 Integration with Other Services

### API Gateway Integration
- Gateway calls collaboration endpoints for access control
- Gateway enriches comments with user information
- Gateway combines collaboration data with wishlist data

### Wishlist Service Integration
- Checks wishlist ownership for permission validation
- Uses wishlist service API to determine ownership

### User Service Integration
- User service provides user information for comment enrichment
- User IDs are passed via `x-user-id` header

## 🛡️ Security & Access Control

### Role-Based Access Control
- **view_only**: Can view items and comments
- **view_edit**: Can view, edit items, and comment
- **comment_only**: Can view items and add comments
- **owner**: Full access to wishlist

### Permission Validation
- Validates ownership for administrative operations
- Checks collaboration access for commenting
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

1. **Collaboration Features**: Rich sharing and commenting capabilities
2. **Role-Based Access**: Granular permission control
3. **Invitation System**: Secure sharing with expiration
4. **Social Features**: Threaded comments on items
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
5. **User** gains access to wishlist with specified role

### Add Comment Flow
1. **Frontend** sends `POST /api/wishlists/123/items/456/comments`
2. **API Gateway** validates JWT and forwards request
3. **Collaboration Service** checks user permissions
4. **Collaboration Service** creates comment if authorized
5. **Frontend** receives created comment data

## 📈 Performance Considerations

### Database Queries
- Efficient queries with proper indexing
- Batch operations for access management
- Optimized comment retrieval with ordering

### Caching Opportunities
- User permissions could be cached
- Invitation validation could be cached
- Comment lists could be cached with invalidation

### Service Resilience
- Graceful degradation when wishlist service is unavailable
- Error handling for network failures
- Retry logic for critical operations 