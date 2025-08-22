# Amazon Collaborative Wishlist - Migration Guide

This guide explains the differences between the **Basic Version** and **Full Version** of the Amazon Collaborative Wishlist application, and provides instructions for migrating between them.

## 📋 Version Comparison

| Feature | Basic Version | Full Version |
|---------|---------------|--------------|
| **Comments System** | ❌ Not Available | ✅ Full Support |
| **Role-Based Access Control** | ❌ View-only only | ✅ Granular roles |
| **Advanced Invitations** | ❌ View-only only | ✅ Multiple access types |
| **Frontend Components** | ❌ Simple cards | ✅ Comment threads |
| **Database Schema** | ❌ Simplified | ✅ Full features |
| **API Endpoints** | ❌ Limited | ✅ Complete |

## 🏗️ Architecture Differences

### Basic Version Architecture
```
apps-basic/
├── api-gateway/          # Basic routing and enrichment
├── user-service/         # Authentication and profiles
├── wishlist-service/     # Wishlist CRUD operations
├── collaboration-service/ # Basic sharing (view-only)
└── web-frontend/         # Simple UI without comments

db-basic/
└── init/                 # Simplified schema

ops-basic/
└── docker-compose.yml    # Basic deployment
```

### Full Version Architecture
```
apps/
├── api-gateway/          # Advanced routing with comments
├── user-service/         # Authentication and profiles
├── wishlist-service/     # Wishlist CRUD operations
├── collaboration-service/ # Full collaboration features
└── web-frontend/         # Complete UI with comments

db/
└── init/                 # Full schema with comments

ops/
└── docker-compose.yml    # Complete deployment
```

## 🔧 Service Differences

### API Gateway

#### Basic Version
- **File**: `apps-basic/api-gateway/server.js`
- **Features**:
  - Basic routing and authentication
  - Simple data enrichment
  - No comment endpoints
  - No role management endpoints

#### Full Version
- **File**: `apps/api-gateway/server.js`
- **Features**:
  - Advanced routing with comments
  - Complete data enrichment
  - Comment endpoints with user enrichment
  - Role management endpoints (PATCH)

### Collaboration Service

#### Basic Version
- **File**: `apps-basic/collaboration-service/server.js`
- **Features**:
  - View-only invitations
  - Simple access control
  - Display name management
  - No comments system

#### Full Version
- **File**: `apps/collaboration-service/server.js`
- **Features**:
  - Multiple invitation types (view_only, view_edit, comment_only)
  - Role-based access control
  - Complete comments system
  - Advanced permission validation

### Web Frontend

#### Basic Version
- **File**: `apps-basic/web-frontend/src/components/AmazonItemCard.jsx`
- **Features**:
  - Simple item cards
  - No comment UI
  - Basic sharing interface

#### Full Version
- **File**: `apps/web-frontend/src/components/AmazonItemCard.jsx`
- **Features**:
  - Expandable comment threads
  - Comment input and display
  - Advanced sharing options
  - Role management UI

## 🗄️ Database Schema Differences

### Basic Version Schema

```sql
-- Basic collaboration tables
CREATE TABLE "collab".wishlist_invite (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES "wishlist".wishlist(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "collab".wishlist_access (
    wishlist_id INTEGER NOT NULL REFERENCES "wishlist".wishlist(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "user".user(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'view_only' CHECK (role IN ('view_only')),
    invited_by INTEGER REFERENCES "user".user(id) ON DELETE SET NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    display_name VARCHAR(255),
    PRIMARY KEY (wishlist_id, user_id)
);
```

### Full Version Schema

```sql
-- Full collaboration tables
CREATE TABLE "collab".wishlist_invite (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    access_type VARCHAR(20) NOT NULL DEFAULT 'view_only'
);

CREATE TABLE "collab".wishlist_access (
    wishlist_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    invited_by INTEGER,
    invited_at TIMESTAMP DEFAULT NOW(),
    display_name VARCHAR(255),
    PRIMARY KEY (wishlist_id, user_id)
);

-- Comments table (Full version only)
CREATE TABLE "collab".wishlist_item_comment (
    id SERIAL PRIMARY KEY,
    wishlist_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📡 API Endpoint Differences

### Basic Version Endpoints

```javascript
// Collaboration endpoints (Basic)
GET    /api/wishlists/:id/access                    // List collaborators
DELETE /api/wishlists/:id/access/:userId            // Remove collaborator
PUT    /api/wishlists/:id/access/:userId            // Update display name
POST   /api/wishlists/:id/invites                   // Create invitation (view-only)
GET    /api/invites/:token                          // Get invite details
POST   /api/invites/:token/accept                   // Accept invitation

// No comment endpoints in basic version
```

### Full Version Endpoints

```javascript
// Collaboration endpoints (Full)
GET    /api/wishlists/:id/access                    // List collaborators
DELETE /api/wishlists/:id/access/:userId            // Remove collaborator
PATCH  /api/wishlists/:id/access/:userId            // Update collaborator role
POST   /api/wishlists/:id/invites                   // Create invitation with access type
GET    /api/invites/:token                          // Get invite details
POST   /api/invites/:token/accept                   // Accept invitation

// Comment endpoints (Full version only)
GET    /api/wishlists/:id/items/:itemId/comments    // Get comments for item
POST   /api/wishlists/:id/items/:itemId/comments    // Add comment to item
```

## 🔄 Migration Paths

### Basic → Full Version Migration

#### 1. Database Migration

```sql
-- Add access_type column to invitations
ALTER TABLE "collab".wishlist_invite 
ADD COLUMN access_type VARCHAR(20) NOT NULL DEFAULT 'view_only';

-- Add comments table
CREATE TABLE "collab".wishlist_item_comment (
    id SERIAL PRIMARY KEY,
    wishlist_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_wishlist_item_comment_item ON "collab".wishlist_item_comment(wishlist_item_id);
CREATE INDEX idx_wishlist_item_comment_user ON "collab".wishlist_item_comment(user_id);
```

#### 2. Service Updates

**Collaboration Service**:
- Add comment endpoints
- Add role management (PATCH)
- Add permission validation for comments
- Add access_type support in invitations

**API Gateway**:
- Add comment routing and enrichment
- Add role management endpoints
- Add comment user enrichment

**Frontend**:
- Add CommentThread component
- Add comment UI to item cards
- Add role management interface

#### 3. Configuration Updates

```bash
# Update environment variables
COLLAB_SVC_URL=http://collaboration-service:3003
USER_SVC_URL=http://user-service:3001

# Update Docker Compose
docker-compose -f ops/docker-compose.yml up -d
```

### Full → Basic Version Migration

#### 1. Database Cleanup

```sql
-- Remove comments table
DROP TABLE IF EXISTS "collab".wishlist_item_comment;

-- Remove access_type column (optional - can keep for compatibility)
ALTER TABLE "collab".wishlist_invite 
DROP COLUMN IF EXISTS access_type;

-- Update all roles to view_only
UPDATE "collab".wishlist_access 
SET role = 'view_only' 
WHERE role IN ('view_edit', 'comment_only');
```

#### 2. Service Updates

**Collaboration Service**:
- Remove comment endpoints
- Remove role management (PATCH)
- Simplify invitation creation (view-only only)

**API Gateway**:
- Remove comment routing
- Remove role management endpoints
- Remove comment enrichment

**Frontend**:
- Remove CommentThread component
- Simplify item cards
- Remove comment UI

#### 3. Configuration Updates

```bash
# Update environment variables
COLLAB_SVC_URL=http://collaboration-service:3003

# Update Docker Compose
docker-compose -f ops-basic/docker-compose.yml up -d
```

## 🎯 Feature Comparison Details

### Comments System

#### Basic Version
- ❌ No comment functionality
- ❌ No comment database table
- ❌ No comment API endpoints
- ❌ No comment UI components

#### Full Version
- ✅ Complete comment system
- ✅ Comment database table with relationships
- ✅ Comment API endpoints (GET/POST)
- ✅ Comment UI with threads and input
- ✅ Comment permission validation
- ✅ Comment user enrichment

### Role-Based Access Control

#### Basic Version
- ❌ Only 'owner' and 'view_only' roles
- ❌ No role management endpoints
- ❌ No role specification in invitations
- ❌ No granular permissions

#### Full Version
- ✅ Multiple roles: 'owner', 'view_only', 'view_edit', 'comment_only'
- ✅ Role management endpoint (PATCH)
- ✅ Role specification in invitations
- ✅ Granular permission validation
- ✅ Role-based UI controls

### Invitation System

#### Basic Version
- ❌ All invitations are view-only
- ❌ No access_type field
- ❌ No role selection during acceptance
- ❌ Simple invitation flow

#### Full Version
- ✅ Multiple invitation types
- ✅ access_type field in database
- ✅ Role selection during acceptance
- ✅ Advanced invitation options
- ✅ Enhanced invitation details

### Frontend Features

#### Basic Version
- ❌ Simple item cards
- ❌ No comment UI
- ❌ Basic sharing interface
- ❌ No role management UI

#### Full Version
- ✅ Expandable comment threads
- ✅ Comment input and display
- ✅ Advanced sharing options
- ✅ Role management interface
- ✅ Rich user interactions

## 🚀 Deployment Differences

### Basic Version Deployment

```bash
# Use basic configuration
cd ops-basic
docker-compose up -d

# Access at http://localhost:5173
# API at http://localhost:8080
```

### Full Version Deployment

```bash
# Use full configuration
cd ops
docker-compose up -d

# Access at http://localhost:5173
# API at http://localhost:8080
```

## 📊 Performance Considerations

### Basic Version
- **Faster startup**: Simpler services and database
- **Lower memory usage**: No comment data
- **Simpler queries**: No comment joins
- **Less network traffic**: No comment enrichment

### Full Version
- **More features**: Complete collaboration system
- **Higher complexity**: Comment system overhead
- **More database queries**: Comment enrichment
- **Enhanced user experience**: Rich interactions

## 🔧 Development Workflow

### Working with Basic Version
1. Start with basic version for learning
2. Understand microservices architecture
3. Learn API Gateway patterns
4. Practice with simple collaboration

### Working with Full Version
1. Build on basic version knowledge
2. Add comment system incrementally
3. Implement role-based access control
4. Enhance frontend with rich features

## 📚 Documentation

- **Basic Version**: `docs/starter basic/`
- **Full Version**: `docs/end with collab features/`
- **Migration Guide**: This document

## 🎯 Learning Path

1. **Start with Basic Version**: Learn fundamentals
2. **Understand Architecture**: Study service interactions
3. **Practice with Basic Features**: Master simple collaboration
4. **Migrate to Full Version**: Add advanced features
5. **Customize and Extend**: Build on the foundation

This migration guide provides a comprehensive overview of the differences between versions and clear paths for upgrading or downgrading as needed.