# Migration Guide: Basic to Full Version

This guide explains how to upgrade from the basic version to the full version of the Amazon Collaborative Wishlist application, adding advanced collaboration features step by step.

## 🎯 Overview

The basic version provides a solid foundation with:
- User authentication and wishlist management
- Basic sharing with view-only invitations
- Simple user management

The full version adds:
- Comments system on wishlist items
- Role-based access control (view_only, view_edit, comment_only)
- Advanced invitation types
- Enhanced collaboration features

## 📋 Migration Checklist

### Phase 1: Database Schema Updates
- [ ] Add comment tables
- [ ] Add role management columns
- [ ] Update invitation schema

### Phase 2: Backend Services
- [ ] Update collaboration service with comment endpoints
- [ ] Add role management endpoints
- [ ] Update API gateway with comment routes
- [ ] Add permission checking

### Phase 3: Frontend Components
- [ ] Add comment UI components
- [ ] Update invitation modal with role selection
- [ ] Add role management in user management modal
- [ ] Update permission checks throughout UI

## 🔄 Step-by-Step Migration

### Step 1: Database Schema Migration

#### 1.1 Add Comment Tables
```sql
-- Add to db/init/01_tables.sql
CREATE TABLE IF NOT EXISTS "collab"."wishlist_item_comment" (
    id SERIAL PRIMARY KEY,
    wishlist_item_id INTEGER NOT NULL REFERENCES "wishlist"."wishlist_item"(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "user"."user"(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wishlist_item_comment_item ON "collab"."wishlist_item_comment"(wishlist_item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_comment_user ON "collab"."wishlist_item_comment"(user_id);
```

#### 1.2 Update Invitation Schema
```sql
-- Add access_type column to wishlist_invite
ALTER TABLE "collab".wishlist_invite ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) NOT NULL DEFAULT 'view_only';

-- Update role constraints in wishlist_access
ALTER TABLE "collab".wishlist_access DROP CONSTRAINT IF EXISTS wishlist_access_role_check;
ALTER TABLE "collab".wishlist_access ADD CONSTRAINT wishlist_access_role_check 
    CHECK (role IN ('view_only', 'view_edit', 'comment_only'));
```

### Step 2: Collaboration Service Updates

#### 2.1 Add Comment Endpoints
```javascript
// Add to apps/collaboration-service/server.js

// List comments for an item
app.get('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const { rows } = await pool.query(
    'SELECT id, wishlist_item_id, user_id, comment_text, created_at FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at ASC',
    [itemId]
  );
  res.json(rows);
}));

// Add a comment to an item
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

#### 2.2 Add Role Management
```javascript
// Add role update endpoint
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

#### 2.3 Update Invitation System
```javascript
// Update invitation creation to support access_type
app.post('/wishlists/:id/invites', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const token = nanoid(16);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const accessType = (req.body?.access_type || 'view_only');

  const { rows } = await pool.query(
    'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at, access_type) VALUES ($1,$2,$3,$4) RETURNING token, expires_at, access_type',
    [wid, token, expiresAt, accessType]
  );
  res.status(201).json(rows[0]);
}));
```

### Step 3: API Gateway Updates

#### 3.1 Add Comment Routes
```javascript
// Add to apps/api-gateway/server.js

// Comments — list (enrich with author info)
app.get('/api/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
  const comments = await jget(`${COLLAB_URL}/wishlists/${req.params.id}/items/${req.params.itemId}/comments`);

  let usersResponse = [];
  try {
    const ids = Array.from(new Set((comments || []).map(c => c && c.user_id).filter(Boolean)));
    if (ids.length) {
      const r = await jget(`${USER_URL}/users?ids=${ids.join(',')}`);
      usersResponse = Array.isArray(r) ? r : (Array.isArray(r?.rows) ? r.rows : []);
    }
  } catch (e) {
    console.warn('User enrichment failed, proceeding with minimal user objects:', e.message);
  }

  const byId = {};
  for (const u of usersResponse) {
    if (u && typeof u.id !== 'undefined') byId[u.id] = u;
  }

  const safeComments = (comments || []).filter(c => c && typeof c === 'object');

  res.json(safeComments.map(c => ({
    ...c,
    user: byId[c.user_id] || { id: c.user_id, public_name: `User ${c.user_id}`, icon_url: null }
  })));
}));

// Comments — create (and return enriched)
app.post('/api/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
  const created = await jpost(
    `${COLLAB_URL}/wishlists/${req.params.id}/items/${req.params.itemId}/comments`,
    req.body,
    { headers: { 'x-user-id': req.user.id, 'content-type': 'application/json' } }
  );

  let user = { id: req.user.id, public_name: req.user.name, icon_url: null };
  try {
    const r = await jget(`${USER_URL}/users?ids=${req.user.id}`);
    const arr = Array.isArray(r) ? r : (Array.isArray(r?.rows) ? r.rows : []);
    if (arr[0]) user = arr[0];
  } catch (e) {
    console.warn('Self enrichment failed, returning minimal user:', e.message);
  }

  res.status(201).json({ ...created, user });
}));
```

#### 3.2 Add Role Management Routes
```javascript
// Add role update route
app.patch('/api/wishlists/:id/access/:userId', wrap(async (req,res)=>{
  const w = await jget(`${WISHLIST_URL}/wishlists/${req.params.id}`);
  if (w.owner_id !== req.user.id) return res.status(403).json({error:'owner required'});

  const resp = await fetch(`${COLLAB_URL}/wishlists/${req.params.id}/access/${req.params.userId}`, {
    method: 'PATCH',
    headers: { 'x-owner-id': req.user.id, 'content-type': 'application/json' },
    body: JSON.stringify({ role: req.body?.role })
  });
  const ct = resp.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await resp.json() : { error: (await resp.text()) };
  if (!resp.ok) return res.status(resp.status).json(data);
  res.json(data);
}));
```

### Step 4: Frontend Updates

#### 4.1 Update CommentThread Component
Replace the basic placeholder with the full comment functionality:

```javascript
// apps/web-frontend/src/components/CommentThread.jsx
import React from 'react';
import { API } from '../lib/api';

export default function CommentThread({ auth, wid, itemId, canComment }){
  const [comments,setComments] = React.useState([]);
  const [text,setText] = React.useState('');
  const [loading,setLoading] = React.useState(true);

  React.useEffect(()=>{
    setLoading(true);
    fetch(`${API}/api/wishlists/${wid}/items/${itemId}/comments`, {
      headers: auth.token ? { authorization:`Bearer ${auth.token}` } : {}
    })
      .then(r=>r.json()).then(setComments)
      .finally(()=>setLoading(false));
  }, [wid, itemId, auth.token]);

  const add = async ()=>{
    const body = { comment_text: text.trim() };
    if(!body.comment_text) return;
    const r = await fetch(`${API}/api/wishlists/${wid}/items/${itemId}/comments`, {
      method:'POST',
      headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
      body: JSON.stringify(body)
    });
    const c = await r.json();
    if(!r.ok){ alert(c.error || 'Failed to comment'); return; }
    setComments(prev => [...prev, c]);
    setText('');
  };

  return (
    <div className="comments">
      {loading && <div className="a-size-small">Loading comments…</div>}
      {!loading && comments.length===0 && <div className="a-size-small" style={{color:'var(--amz-muted)'}}>No comments yet.</div>}
      {comments.filter(Boolean).map(c=>{
        const name = c.user?.public_name || `User ${c.user_id ?? '?'}`;
        const initial = name.charAt(0).toUpperCase();
        return (
          <div className="comment" key={c.id ?? `${c.user_id}-${c.created_at ?? Math.random()}`}>
            <div className="avatar">{initial}</div>
            <div>
              <div className="meta"><strong>{name}</strong> • {c.created_at ? new Date(c.created_at).toLocaleString() : 'just now'}</div>
              <div>{c.comment_text}</div>
            </div>
          </div>
        );
      })}

      {canComment && (
        <div className="comment-form">
          <input
            className="a-input-text"
            placeholder="Add a comment…"
            value={text}
            onChange={e=>setText(e.target.value)}
          />
            <button className="a-button" onClick={add} disabled={!text.trim()}>Post</button>
        </div>
      )}
    </div>
  );
}
```

#### 4.2 Update InviteModal with Role Selection
Add role selection to the invitation modal:

```javascript
// Update apps/web-frontend/src/components/InviteModal.jsx
// Add state for different invitation types
const [busyView, setBusyView] = React.useState(false);
const [busyEdit, setBusyEdit] = React.useState(false);
const [linkView, setLinkView] = React.useState(null);
const [linkEdit, setLinkEdit] = React.useState(null);

// Add role selection UI
<div>
  <div className="a-muted" style={{ marginBottom: 6 }}>Invite someone to</div>
  <div style={{ fontWeight: 700, marginBottom: 4 }}>VIEW ONLY</div>
  <div className="a-muted" style={{ marginBottom: 8 }}>
    Anyone with a link can view your list without making edits
  </div>
  <div className="invite-box">
    <button className="a-button a-button-primary" onClick={() => generate('view_only')} disabled={busyView}>
      {busyView ? 'Generating…' : (linkView ? 'Regenerate link' : 'Generate link')}
    </button>
    {/* ... link display logic */}
  </div>
</div>

<div>
  <div style={{ fontWeight: 700, marginBottom: 4 }}>VIEW AND EDIT</div>
  <div className="a-muted" style={{ marginBottom: 8 }}>
    Invited people can add or remove items from your list
  </div>
  <div className="invite-box">
    <button className="a-button a-button-primary" onClick={() => generate('view_edit')} disabled={busyEdit}>
      {busyEdit ? 'Generating…' : (linkEdit ? 'Regenerate link' : 'Generate link')}
    </button>
    {/* ... link display logic */}
  </div>
</div>
```

#### 4.3 Update ManagePeopleModal with Role Management
Add role selection dropdowns:

```javascript
// Update apps/web-frontend/src/components/ManagePeopleModal.jsx
// Add role update function
const updateRole = async (userId, role) => {
  if (!userId || !role) return;
  try {
    setBusyId(userId);
    setError(null);
    const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${auth.token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const ct = r.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
    if (!r.ok) throw new Error(data.error || 'Failed to update role');
    setRows(rs => rs.map(row => row.user_id === userId ? { ...row, role: data.role } : row));
    onChanged?.();
  } catch (e) {
    setError(e.message || 'Failed to update role');
  } finally {
    setBusyId(null);
  }
};

// Add role selection dropdown in the UI
{isOwner ? (
  <span className="badge">Owner</span>
) : (
  <select
    className="a-input-text"
    value={r.role}
    onChange={(e) => updateRole(r.user_id, e.target.value)}
    disabled={busyId === r.user_id}
    aria-label={`Role for ${display}`}
  >
    <option value="view_only">view_only</option>
    <option value="comment_only">comment_only</option>
    <option value="view_edit">view_edit</option>
  </select>
)}
```

#### 4.4 Update Permission Checks
Update the permission logic in WishlistView:

```javascript
// Update apps/web-frontend/src/pages/WishlistView.jsx
const canComment = ['owner','view_edit','comment_only'].includes(data.role);
const canAdd = (data.role==='owner' || data.role==='view_edit');
const canDelete = (data.role==='owner' || data.role==='view_edit');

// Pass canComment to AmazonItemCard
<AmazonItemCard 
  key={it.id}
  item={it}
  auth={auth}
  wid={id}
  canComment={canComment}
  canDelete={canDelete}
  onDelete={deleteItem}
/>
```

## 🧪 Testing the Migration

### 1. Database Migration Test
```bash
# Test database schema
docker-compose -f ops/docker-compose.yml exec postgres psql -U wishlist_user -d wishlist_db -c "\dt"
```

### 2. API Endpoint Tests
```bash
# Test comment endpoints
curl -X GET "http://localhost:8080/api/wishlists/1/items/1/comments" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST "http://localhost:8080/api/wishlists/1/items/1/comments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment_text": "Test comment"}'
```

### 3. Frontend Testing
- Test comment functionality on wishlist items
- Test role management in the Manage People modal
- Test different invitation types
- Verify permission checks work correctly

## 🚨 Common Issues

### Database Migration Issues
- **Error**: Column already exists
  - **Solution**: Use `ADD COLUMN IF NOT EXISTS` in migrations

### Service Communication Issues
- **Error**: Service not found
  - **Solution**: Check Docker service names and ports

### Permission Issues
- **Error**: 403 Forbidden on comment endpoints
  - **Solution**: Verify `canComment` function logic

## 📚 Additional Resources

- [Full API Documentation](docs/end%20with%20collab%20features/)
- [Database Schema](docs/end%20with%20collab%20features/05-database-erd-full.md)
- [Service Documentation](docs/end%20with%20collab%20features/)

## 🎉 Success Criteria

You've successfully migrated when:
- ✅ Comments can be added and viewed on wishlist items
- ✅ Role management works in the Manage People modal
- ✅ Different invitation types can be created
- ✅ Permission checks work correctly throughout the UI
- ✅ All existing functionality still works

---

**Need help?** Check the troubleshooting section or refer to the full documentation for detailed implementation guides. 

## 🔧 Fix the Database Issue

### Step 1: Clean Up Everything

First, let's stop all containers and remove the problematic volume:

```bash
# Stop all containers
docker compose down

# Remove the PostgreSQL volume to clear the database
docker volume rm ops-basic_postgres_data

# Also remove any existing containers to ensure a clean start
docker compose down --volumes --remove-orphans
```

### Step 2: Fix the Database Schema

You need to update the `db-basic/init/01_tables.sql` file. The issue is on line 16 where the constraint doesn't allow `'shared'` values.

**Update this line in `db-basic/init/01_tables.sql`:**
```sql
-- Change this line:
privacy VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'public')),

-- To this:
privacy VARCHAR(20) NOT NULL DEFAULT 'private',
```

### Step 3: Alternative - Fix the Seed Data

If you prefer to keep the constraint as is, you can modify `db-basic/init/02_seed.sql` to use `'public'` instead of `'shared'`:

**Update this line in `db-basic/init/02_seed.sql`:**
```sql
-- Change this line:
(1, 'Birthday Wishlist', 1, 'shared'),

-- To this:
(1, 'Birthday Wishlist', 1, 'public'),
```

### Step 4: Restart the Application

After making either of the above changes:

```bash
# Start the application again
docker compose up -d

# Check the logs to see if it's working
docker compose logs -f
```

### Step 5: Verify It's Working

Once the containers are running, you should be able to access:
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080

## 🚨 Quick Debugging

If you're still having issues, let's check what's happening:

```bash
# Check the PostgreSQL logs specifically
docker compose logs postgres

# Check if the volume was properly removed
docker volume ls | grep postgres
```

## 💡 Recommended Approach

I recommend **fixing the schema** (Option 1) because:
- `'shared'` better represents wishlists that are shared via invitations
- `'public'` can be used for truly public wishlists
- This matches the intended behavior of the basic version

The key change is adding `'shared'` to the privacy constraint in the database schema.

Would you like me to help you with any specific part of this fix, or do you have questions about the basic version setup? 

## 🔧 Fix the Web Frontend Issues

### 1. Update `package.json`

The current `package.json` is missing several essential dependencies. Here's the corrected version:

```json
{
  "name": "web-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### 2. Add `vite.config.js`

Create a new file `apps-basic/web-frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
```

### 3. Update `index.html`

Make sure your `index.html` has the correct structure:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Amazon Collaborative Wishlist</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4. Update Dockerfile

The Dockerfile looks correct, but let's make sure it's optimized:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## 🚀 Quick Fix Steps

### Option 1: Manual Fix (Recommended)

1. **Update the files** as shown above
2. **Rebuild the frontend container:**
   ```bash
   cd ops-basic
   docker compose build web-frontend
   docker compose up -d
   ```

### Option 2: Copy from Original

If you want to use the working frontend from the original apps:

```bash
# Copy the working frontend
cp -r apps/web-frontend/* apps-basic/web-frontend/

# Rebuild and restart
cd ops-basic
docker compose build web-frontend
docker compose up -d
```

### Option 3: Check Logs First

Let's see what the specific error is:

```bash
# Check the frontend logs
docker compose logs web-frontend

# Or check all logs
docker compose logs
```

## 🔍 Common Issues and Solutions

### Issue 1: Missing Dependencies
- **Solution**: Update `package.json` with all required dependencies

### Issue 2: Vite Configuration
- **Solution**: Add `vite.config.js` with proper server configuration

### Issue 3: Port Binding
- **Solution**: Make sure the Dockerfile exposes port 5173 and the server binds to `0.0.0.0`

### Issue 4: File Permissions
- **Solution**: Make sure all files are properly copied in the Docker build

## 📚 Debugging Commands

```bash
# Check if the container is running
docker compose ps

# Check frontend logs specifically
docker compose logs web-frontend

# Check if the container can start
docker compose up web-frontend

# Rebuild just the frontend
docker compose build web-frontend

# Start with logs visible
docker compose up web-frontend
```

Try the manual fix first (Option 1), and if you're still having issues, run the debugging commands to see the specific error message. The most common issue is missing dependencies in the `package.json` file.

Would you like me to help you with any specific part of this fix? 

## 🔧 Fix 1: Web Frontend Issue

The problem is that the `node_modules` directory is corrupted or incomplete. Let's fix this:

### Step 1: Clean and Rebuild Frontend

```bash
# Stop all containers
docker compose down

# Remove the frontend container and rebuild
docker compose rm -f web-frontend
docker compose build --no-cache web-frontend
```

### Step 2: Update Frontend Dependencies

The issue is likely that the `package.json` is missing the Vite plugin. Let's fix the `apps-basic/web-frontend/package.json`:

```json
{
  "name": "web-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### Step 3: Add Vite Config

Create `apps-basic/web-frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
```

## 🔧 Fix 2: Database Issue

The database constraint still doesn't allow `'shared'`. Let's fix the schema:

### Update `db-basic/init/01_tables.sql`

Change line 16 from:
```sql
privacy VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'public')),
```

To:
```sql
privacy VARCHAR(20) NOT NULL DEFAULT 'private',
```

## 🚀 Complete Fix Process

### Option 1: Quick Fix (Recommended)

```bash
# 1. Stop everything
docker compose down

# 2. Remove the database volume to clear the constraint issue
docker volume rm ops-basic_postgres_data

# 3. Copy the working frontend from the original
cp -r ../apps/web-frontend/* ../apps-basic/web-frontend/

# 4. Rebuild and start
docker compose build --no-cache
docker compose up -d
```

### Option 2: Manual Fix

1. **Fix the database schema** (add `'shared'` to the constraint)
2. **Update the frontend package.json** (add missing dependencies)
3. **Add vite.config.js** file
4. **Clean and rebuild**:
   ```bash
   docker compose down
   docker volume rm ops-basic_postgres_data
   docker compose build --no-cache
   docker compose up -d
   ```

## 🔍 Alternative: Use Original Frontend

The easiest solution might be to just copy the working frontend:

```bash
# Copy the working frontend
rm -rf apps-basic/web-frontend/*
cp -r apps/web-frontend/* apps-basic/web-frontend/

# Rebuild and restart
cd ops-basic
docker compose down
docker volume rm ops-basic_postgres_data
docker compose build --no-cache
docker compose up -d
```

## 📊 Check Status

After fixing, check if everything is working:

```bash
# Check all containers are running
docker compose ps

# Check frontend logs
docker compose logs web-frontend

# Access the application
# Frontend: http://localhost:5173
# API Gateway: http://localhost:8080
```

The main issues are:
1. **Frontend**: Missing Vite plugin and corrupted node_modules
2. **Database**: Constraint doesn't allow 'shared' privacy values

Try the "Quick Fix" option first - it should resolve both issues by using the working frontend and clearing the database volume.