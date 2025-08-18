-- USER schema
CREATE TABLE IF NOT EXISTS "user".user (
  id SERIAL PRIMARY KEY,
  public_name VARCHAR(255) NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WISHLIST schema
CREATE TABLE IF NOT EXISTS "wishlist".wishlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INT NOT NULL,
  privacy VARCHAR(20) NOT NULL, -- Private | Public | Shared
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "wishlist".wishlist_item (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  wishlist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  priority INT DEFAULT 0,
  comments TEXT,
  added_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (wishlist_id, product_id)
);

-- COLLAB schema
CREATE TABLE IF NOT EXISTS "collab".wishlist_invite (
  id SERIAL PRIMARY KEY,
  wishlist_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "collab".wishlist_access (
  wishlist_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(20) NOT NULL, -- view_only | view_edit | comment_only
  invited_by INT,
  invited_at TIMESTAMP DEFAULT NOW(),
  display_name VARCHAR(255), -- per-wishlist collaborator name
  PRIMARY KEY (wishlist_id, user_id)
);

CREATE TABLE IF NOT EXISTS "collab".wishlist_item_comment (
  id SERIAL PRIMARY KEY,
  wishlist_item_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);