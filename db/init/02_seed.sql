-- Users
INSERT INTO "user".user (public_name, icon_url) VALUES
 ('alice','https://i.pravatar.cc/100?img=1'),
 ('bob','https://i.pravatar.cc/100?img=2'),
 ('carol','https://i.pravatar.cc/100?img=3'),
 ('dave','https://i.pravatar.cc/100?img=4');

-- Wishlists (owned by Alice id=1)
INSERT INTO "wishlist".wishlist (name, owner_id, privacy) VALUES
 ('Alice''s Birthday', 1, 'Shared'),
 ('Office Setup', 1, 'Shared');

-- Items (product ids correspond to products.json)
INSERT INTO "wishlist".wishlist_item (product_id, wishlist_id, title, priority, comments, added_by) VALUES
 (1, 1, 'Noise-cancelling Headphones', 1, 'These look great', 1),
 (2, 1, 'Kindle Paperwhite', 2, NULL, 1),
 (3, 2, 'Mechanical Keyboard', 1, 'Low profile?', 1),
 (4, 2, '4K Monitor', 2, NULL, 1),
 (5, 2, 'USB-C Dock', 3, NULL, 1);

-- Access: Bob edit on Office Setup, Carol comment on Birthday, Dave view-only
INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by) VALUES
 (2, 2, 'view_edit', 1),
 (1, 3, 'comment_only', 1),
 (1, 4, 'view_only', 1);

-- A pending invite for Dave to Office Setup
INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at) VALUES
 (2, 'invite-token-demo', NOW() + INTERVAL '72 hours');

-- Example comment
INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES
 (1, 3, 'Love these!');