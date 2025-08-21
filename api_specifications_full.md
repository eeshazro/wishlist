# API Specifications - Full Collaborative Version

## Overview
This document describes the API endpoints for the Amazon Collaborative Wishlist system with full collaboration features including comments, role-based access control, and advanced sharing.

## Base URLs
- **API Gateway**: `http://localhost:3000`
- **User Service**: `http://localhost:3001`
- **Wishlist Service**: `http://localhost:3002`
- **Collaboration Service**: `http://localhost:3003`

---

## User Service API

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### `GET /api/users/profile`
Get current user's profile information.

**Response:**
```json
{
  "id": 1,
  "public_name": "John Doe",
  "icon_url": "https://example.com/avatar.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `PUT /api/users/profile`
Update current user's profile.

**Request Body:**
```json
{
  "public_name": "John Doe",
  "icon_url": "https://example.com/avatar.jpg"
}
```

#### `GET /api/users/:userId`
Get user profile by ID.

**Response:**
```json
{
  "id": 1,
  "public_name": "John Doe",
  "icon_url": "https://example.com/avatar.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Wishlist Service API

### Endpoints

#### `GET /api/wishlists`
Get all wishlists for current user (owned and shared).

**Query Parameters:**
- `type`: `owned` | `shared` | `all` (default: `all`)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Birthday Wishlist",
    "owner_id": 1,
    "privacy": "shared",
    "created_at": "2024-01-15T10:30:00Z",
    "owner": {
      "id": 1,
      "public_name": "John Doe",
      "icon_url": "https://example.com/avatar.jpg"
    },
    "access": {
      "role": "owner",
      "display_name": "John Doe"
    }
  }
]
```

#### `POST /api/wishlists`
Create a new wishlist.

**Request Body:**
```json
{
  "name": "Birthday Wishlist",
  "privacy": "private"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Birthday Wishlist",
  "owner_id": 1,
  "privacy": "private",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /api/wishlists/:wishlistId`
Get wishlist details by ID.

**Response:**
```json
{
  "id": 1,
  "name": "Birthday Wishlist",
  "owner_id": 1,
  "privacy": "shared",
  "created_at": "2024-01-15T10:30:00Z",
  "owner": {
    "id": 1,
    "public_name": "John Doe",
    "icon_url": "https://example.com/avatar.jpg"
  },
  "access": {
    "role": "view_edit",
    "display_name": "John Doe"
  },
  "items": [
    {
      "id": 1,
      "product_id": 123,
      "title": "Wireless Headphones",
      "priority": 1,
      "comments": "High quality sound",
      "added_by": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "added_by_user": {
        "id": 1,
        "public_name": "John Doe",
        "icon_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### `PUT /api/wishlists/:wishlistId`
Update wishlist details.

**Request Body:**
```json
{
  "name": "Updated Wishlist Name",
  "privacy": "public"
}
```

#### `DELETE /api/wishlists/:wishlistId`
Delete a wishlist.

#### `POST /api/wishlists/:wishlistId/items`
Add item to wishlist.

**Request Body:**
```json
{
  "product_id": 123,
  "title": "Wireless Headphones",
  "priority": 1,
  "comments": "High quality sound"
}
```

#### `PUT /api/wishlists/:wishlistId/items/:itemId`
Update wishlist item.

**Request Body:**
```json
{
  "title": "Updated Item Title",
  "priority": 2,
  "comments": "Updated comments"
}
```

#### `DELETE /api/wishlists/:wishlistId/items/:itemId`
Remove item from wishlist.

---

## Collaboration Service API

### Endpoints

#### `POST /api/collab/wishlists/:wishlistId/invites`
Create invitation for wishlist.

**Request Body:**
```json
{
  "access_type": "view_edit",
  "expires_in_hours": 168
}
```

**Response:**
```json
{
  "id": 1,
  "wishlist_id": 1,
  "token": "abc123def456",
  "expires_at": "2024-01-22T10:30:00Z",
  "access_type": "view_edit"
}
```

#### `GET /api/collab/invites/:token`
Get invitation details by token.

**Response:**
```json
{
  "id": 1,
  "wishlist_id": 1,
  "token": "abc123def456",
  "expires_at": "2024-01-22T10:30:00Z",
  "access_type": "view_edit",
  "wishlist": {
    "id": 1,
    "name": "Birthday Wishlist",
    "owner": {
      "id": 1,
      "public_name": "John Doe"
    }
  }
}
```

#### `POST /api/collab/invites/:token/accept`
Accept invitation.

**Request Body:**
```json
{
  "display_name": "Jane Smith"
}
```

**Response:**
```json
{
  "wishlist_id": 1,
  "user_id": 2,
  "role": "view_edit",
  "display_name": "Jane Smith"
}
```

#### `GET /api/collab/wishlists/:wishlistId/access`
Get all users with access to wishlist.

**Response:**
```json
[
  {
    "wishlist_id": 1,
    "user_id": 1,
    "role": "owner",
    "invited_by": null,
    "invited_at": "2024-01-15T10:30:00Z",
    "display_name": "John Doe",
    "user": {
      "id": 1,
      "public_name": "John Doe",
      "icon_url": "https://example.com/avatar.jpg"
    }
  },
  {
    "wishlist_id": 1,
    "user_id": 2,
    "role": "view_edit",
    "invited_by": 1,
    "invited_at": "2024-01-16T10:30:00Z",
    "display_name": "Jane Smith",
    "user": {
      "id": 2,
      "public_name": "Jane Smith",
      "icon_url": "https://example.com/avatar2.jpg"
    }
  }
]
```

#### `DELETE /api/collab/wishlists/:wishlistId/access/:userId`
Remove user access to wishlist.

#### `PUT /api/collab/wishlists/:wishlistId/access/:userId`
Update user's role in wishlist.

**Request Body:**
```json
{
  "role": "comment_only",
  "display_name": "Updated Name"
}
```

#### `POST /api/collab/items/:itemId/comments`
Add comment to wishlist item.

**Request Body:**
```json
{
  "comment_text": "This looks great! I have one similar."
}
```

**Response:**
```json
{
  "id": 1,
  "wishlist_item_id": 1,
  "user_id": 2,
  "comment_text": "This looks great! I have one similar.",
  "created_at": "2024-01-16T10:30:00Z",
  "user": {
    "id": 2,
    "public_name": "Jane Smith",
    "icon_url": "https://example.com/avatar2.jpg"
  }
}
```

#### `GET /api/collab/items/:itemId/comments`
Get all comments for wishlist item.

**Response:**
```json
[
  {
    "id": 1,
    "wishlist_item_id": 1,
    "user_id": 2,
    "comment_text": "This looks great! I have one similar.",
    "created_at": "2024-01-16T10:30:00Z",
    "user": {
      "id": 2,
      "public_name": "Jane Smith",
      "icon_url": "https://example.com/avatar2.jpg"
    }
  }
]
```

#### `DELETE /api/collab/comments/:commentId`
Delete comment (only by comment author or wishlist owner).

---

## Public Wishlist API

### Endpoints

#### `GET /api/public/wishlists/:wishlistId`
Get public wishlist (no authentication required).

**Response:**
```json
{
  "id": 1,
  "name": "Birthday Wishlist",
  "privacy": "public",
  "created_at": "2024-01-15T10:30:00Z",
  "owner": {
    "id": 1,
    "public_name": "John Doe",
    "icon_url": "https://example.com/avatar.jpg"
  },
  "items": [
    {
      "id": 1,
      "product_id": 123,
      "title": "Wireless Headphones",
      "priority": 1,
      "comments": "High quality sound",
      "added_by": 1,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INVITE_EXPIRED`: Invitation token expired
- `INVITE_INVALID`: Invalid invitation token

---

## Role-Based Access Control

### Roles
- **owner**: Full access (create, read, update, delete, manage users)
- **view_edit**: Can view, edit items, and comment
- **view_only**: Can view items and comments only
- **comment_only**: Can view items and add comments

### Permission Matrix

| Action | owner | view_edit | view_only | comment_only |
|--------|-------|-----------|-----------|--------------|
| View wishlist | ✅ | ✅ | ✅ | ✅ |
| Edit wishlist details | ✅ | ❌ | ❌ | ❌ |
| Add items | ✅ | ✅ | ❌ | ❌ |
| Edit items | ✅ | ✅ | ❌ | ❌ |
| Delete items | ✅ | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ❌ | ✅ |
| Delete comments | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Delete wishlist | ✅ | ❌ | ❌ | ❌ | 