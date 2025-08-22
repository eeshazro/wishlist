// // import express from 'express';
// // import cors from 'cors';
// // import pkg from 'pg';
// // import { nanoid } from 'nanoid';
// // const { Pool } = pkg;

// // const app = express();
// // app.use(cors());
// // app.use(express.json());
// // const PORT = process.env.PORT || 3003;
// // const pool = new Pool({ connectionString: process.env.DATABASE_URL });


// // const WISHLIST_SVC_URL = process.env.WISHLIST_SVC_URL || 'http://wishlist-service:3002';


// // function userId(req){ return parseInt(req.headers['x-user-id']||'0',10); }

// // app.get('/health', (req,res)=>res.json({ok:true, service:'collaboration-service'}));

// // // Access listings for current user
// // app.get('/access/mine', async (req,res)=>{
// //   const uid = userId(req);
// //   const { rows } = await pool.query('SELECT wishlist_id, role FROM "collab".wishlist_access WHERE user_id=$1',[uid]);
// //   res.json(rows);
// // });

// // // Owner-only: list collaborators
// // app.get('/wishlists/:id/access', async (req,res)=>{
// //   const wid = parseInt(req.params.id,10);
// //   const ownerId = parseInt(req.headers['x-owner-id']||'0',10); // gateway sets this after checking ownership
// //   if(!ownerId) return res.status(403).json({error:'owner required'});
// //   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_access WHERE wishlist_id=$1',[wid]);
// //   res.json(rows);
// // });

// // app.delete('/wishlists/:id/access/:userId', async (req,res)=>{
// //   await pool.query('DELETE FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',[req.params.id, req.params.userId]);
// //   res.status(204).end();
// // });


// // app.post('/wishlists/:id/invites', async (req,res)=>{
// //   const wid = parseInt(req.params.id,10);
// //   const token = nanoid(16);

// //   // compute expiry in JS (72 hours from now)
// //   const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

// //   const { rows } = await pool.query(
// //     'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at) VALUES ($1,$2,$3) RETURNING *',
// //     [wid, token, expiresAt]
// //   );

// //   res.status(201).json({ token: rows[0].token, expires_at: rows[0].expires_at });
// // });


// // app.get('/invites/:token', async (req,res)=>{
// //   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
// //   if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
// //   res.json(rows[0]);
// // });

// // app.post('/invites/:token/accept', async (req,res)=>{
// //   const uid = userId(req);
// //   const role = req.body.role || 'view_only';
// //   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
// //   if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
// //   const wid = rows[0].wishlist_id;
// //   await pool.query(`INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by)
// //                     VALUES ($1,$2,$3,$4) ON CONFLICT (wishlist_id, user_id) DO UPDATE SET role=EXCLUDED.role`,
// //                     [wid, uid, role, uid]);
// //   res.json({ ok:true, wishlist_id: wid, role });
// // });

// // // Comments
// // app.get('/items/:itemId/comments', async (req,res)=>{
// //   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at DESC',[req.params.itemId]);
// //   res.json(rows);
// // });

// // app.post('/items/:itemId/comments', async (req,res)=>{
// //   const uid = userId(req);
// //   const { comment_text } = req.body;
// //   const { rows } = await pool.query('INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES ($1,$2,$3) RETURNING *',[req.params.itemId, uid, comment_text]);
// //   res.status(201).json(rows[0]);
// // });

// // // COMMENTS — list and add per wishlist item

// // // helper: who can comment?
// // async function canComment(userId, wishlistId) {
// //   // Ask the Wishlist service for the owner (don't couple to their schema)
// //   try {
// //     const r = await fetch(`${WISHLIST_SVC_URL}/wishlists/${wishlistId}`);
// //     if (r.ok) {
// //       const w = await r.json();
// //       if (Number(w.owner_id) === Number(userId)) return true; // owners can always comment
// //     }
// //   } catch (error) {
// //     console.error('Error checking wishlist ownership:', error);
// //     // If the wishlist svc is down, keep checking collab access; don't crash
// //   }

// //   // Check collaboration roles in OUR schema
// //   try {
// //     const r2 = await pool.query(
// //       'SELECT role FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',
// //       [wishlistId, userId]
// //     );
// //     if (!r2.rows.length) return false;
// //     const role = r2.rows[0].role;
// //     return role === 'view_edit' || role === 'comment_only';
// //   } catch (error) {
// //     console.error('Error checking collaboration access:', error);
// //     return false;
// //   }
// // }


// // // GET comments for item
// // app.get('/wishlists/:id/items/:itemId/comments', async (req, res) => {
// //   const itemId = parseInt(req.params.itemId, 10);
// //   const { rows } = await pool.query(
// //     'SELECT id, wishlist_item_id, user_id, comment_text, created_at FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at ASC',
// //     [itemId]
// //   );
// //   res.json(rows);
// // });

// // // POST a new comment
// // app.post('/wishlists/:id/items/:itemId/comments', async (req, res) => {
// //   const wid = parseInt(req.params.id, 10);
// //   const itemId = parseInt(req.params.itemId, 10);
// //   const userId = parseInt(req.headers['x-user-id'] || '0', 10);
// //   const text = (req.body?.comment_text || '').trim();
// //   if (!userId) return res.status(401).json({ error: 'missing user' });
// //   if (!text) return res.status(400).json({ error: 'comment_text required' });
// //   if (!(await canComment(userId, wid))) return res.status(403).json({ error: 'forbidden' });

// //   const { rows } = await pool.query(
// //     'INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES ($1,$2,$3) RETURNING id, wishlist_item_id, user_id, comment_text, created_at',
// //     [itemId, userId, text]
// //   );
// //   res.status(201).json(rows[0]);
// // });



// // app.listen(PORT, ()=>console.log('collaboration-service on', PORT));



// import express from 'express';
// import cors from 'cors';
// import pkg from 'pg';
// import { nanoid } from 'nanoid';

// const { Pool } = pkg;
// const app = express();

// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 3003;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const WISHLIST_SVC_URL = process.env.WISHLIST_SVC_URL || 'http://wishlist-service:3002';

// // ---------- Safety nets ----------
// const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// process.on('unhandledRejection', (err) => {
//   console.error('UNHANDLED_REJECTION', err);
// });
// process.on('uncaughtException', (err) => {
//   console.error('UNCAUGHT_EXCEPTION', err);
// });

// // Express error handler (last)
// function errorHandler(err, req, res, next) {
//   console.error('COLLAB_ERROR', err);
//   const status = err.status || 500;
//   const message = typeof err === 'string' ? err : err.message || 'Internal error';
//   res.status(status).json({ error: message });
// }
// // ----------------------------------

// function uid(req){ return parseInt(req.headers['x-user-id']||'0',10); }

// app.get('/health', (req,res)=>res.json({ok:true, service:'collaboration-service'}));

// // Access listings for current user
// app.get('/access/mine', wrap(async (req,res)=>{
//   const userId = uid(req);
//   const { rows } = await pool.query('SELECT wishlist_id, role FROM "collab".wishlist_access WHERE user_id=$1',[userId]);
//   res.json(rows);
// }));

// // Owner-only: list collaborators
// app.get('/wishlists/:id/access', wrap(async (req,res)=>{
//   const wid = parseInt(req.params.id,10);
//   const ownerId = parseInt(req.headers['x-owner-id']||'0',10);
//   console.log('[COLLAB] GET /wishlists/:id/access', { wid, ownerId });
//   if(!ownerId) return res.status(403).json({error:'owner required'});
//   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_access WHERE wishlist_id=$1',[wid]);
//   console.log('[COLLAB] access rows', rows);
//   res.json(rows);
// }));

// app.delete('/wishlists/:id/access/:userId', wrap(async (req,res)=>{
//   await pool.query('DELETE FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',[req.params.id, req.params.userId]);
//   res.status(204).end();
// }));

// // Create invite
// app.post('/wishlists/:id/invites', wrap(async (req,res)=>{
//   const wid = parseInt(req.params.id,10);
//   const token = nanoid(16);
//   const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // +72h

//   const { rows } = await pool.query(
//     'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at) VALUES ($1,$2,$3) RETURNING token, expires_at',
//     [wid, token, expiresAt]
//   );
//   res.status(201).json(rows[0]);
// }));

// // Get invite
// app.get('/invites/:token', wrap(async (req,res)=>{
//   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
//   if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
//   res.json(rows[0]);
// }));


// // Accept invite
// app.post('/invites/:token/accept', wrap(async (req,res)=>{
//   const userId = uid(req);
//   const role = req.body.role || 'view_only';
//   const displayName = (req.body.display_name || '').trim() || null;
//   console.log('[COLLAB] POST /invites/:token/accept', { token: req.params.token, userId, role, displayName });

//   const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
//   if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
//   const wid = rows[0].wishlist_id;

//   await pool.query(
//     `INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by, display_name)
//      VALUES ($1,$2,$3,$4,$5)
//      ON CONFLICT (wishlist_id, user_id)
//      DO UPDATE SET role=EXCLUDED.role, display_name=COALESCE(EXCLUDED.display_name, "collab".wishlist_access.display_name)`,
//     [wid, userId, role, userId, displayName]
//   );

//   console.log('[COLLAB] accepted invite -> access upserted', { wid, userId, role, displayName });
//   res.json({ ok:true, wishlist_id: wid, role, display_name: displayName });
// }));


// // ---------- Comments helpers ----------
// async function canComment(userId, wishlistId) {
//   // Owners can always comment (check Wishlist svc, but don’t crash if it’s down)
//   try {
//     const r = await fetch(`${WISHLIST_SVC_URL}/wishlists/${wishlistId}`);
//     if (r.ok) {
//       const w = await r.json();
//       if (Number(w.owner_id) === Number(userId)) return true;
//     }
//   } catch (e) {
//     console.error('canComment: wishlist check failed', e);
//   }
//   // Otherwise must be collaborator with comment rights
//   try {
//     const r2 = await pool.query(
//       'SELECT role FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',
//       [wishlistId, userId]
//     );
//     if (!r2.rows.length) return false;
//     const role = r2.rows[0].role;
//     return role === 'view_edit' || role === 'comment_only';
//   } catch (e) {
//     console.error('canComment: access check failed', e);
//     return false;
//   }
// }
// // --------------------------------------

// // List comments for an item
// app.get('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
//   const itemId = parseInt(req.params.itemId, 10);
//   const { rows } = await pool.query(
//     'SELECT id, wishlist_item_id, user_id, comment_text, created_at FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at ASC',
//     [itemId]
//   );
//   res.json(rows);
// }));

// // Add a comment to an item
// app.post('/wishlists/:id/items/:itemId/comments', wrap(async (req, res) => {
//   const wid = parseInt(req.params.id, 10);
//   const itemId = parseInt(req.params.itemId, 10);
//   const userId = uid(req);
//   const text = (req.body?.comment_text || '').trim();

//   if (!userId) return res.status(401).json({ error: 'missing user' });
//   if (!text) return res.status(400).json({ error: 'comment_text required' });
//   if (!(await canComment(userId, wid))) return res.status(403).json({ error: 'forbidden' });

//   const { rows } = await pool.query(
//     'INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES ($1,$2,$3) RETURNING id, wishlist_item_id, user_id, comment_text, created_at',
//     [itemId, userId, text]
//   );
//   res.status(201).json(rows[0]);
// }));

// // NOTE: Removed the older standalone /items/:itemId/comments routes to avoid ambiguity.

// // Register error handler LAST
// app.use(errorHandler);

// app.listen(PORT, ()=>console.log('collaboration-service on', PORT));



// apps/collaboration-service/server.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import { nanoid } from 'nanoid';

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const WISHLIST_SVC_URL = process.env.WISHLIST_SVC_URL || 'http://wishlist-service:3002';

// ---------- Safety nets ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED_REJECTION', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION', err);
});

// Express error handler (last)
function errorHandler(err, req, res, next) {
  console.error('COLLAB_ERROR', err);
  const status = err.status || 500;
  const message = typeof err === 'string' ? err : err.message || 'Internal error';
  res.status(status).json({ error: message });
}
// ----------------------------------

function uid(req){ return parseInt(req.headers['x-user-id']||'0',10); }

app.get('/health', (req,res)=>res.json({ok:true, service:'collaboration-service'}));

// Startup migration to ensure new column exists
async function ensureMigrations() {
  await pool.query('ALTER TABLE "collab".wishlist_access ADD COLUMN IF NOT EXISTS display_name VARCHAR(255)');
  await pool.query('ALTER TABLE "collab".wishlist_invite ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) NOT NULL DEFAULT \'view_only\'');
  console.log('[COLLAB] Migration ensured: wishlist_access.display_name exists');
}

// Access listings for current user
app.get('/access/mine', wrap(async (req,res)=>{
  const userId = uid(req);
  const { rows } = await pool.query('SELECT wishlist_id, role FROM "collab".wishlist_access WHERE user_id=$1',[userId]);
  res.json(rows);
}));

// Owner-only: list collaborators
app.get('/wishlists/:id/access', wrap(async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const ownerId = parseInt(req.headers['x-owner-id']||'0',10);
  console.log('[COLLAB] GET /wishlists/:id/access', { wid, ownerId });
  if(!ownerId) return res.status(403).json({error:'owner required'});
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_access WHERE wishlist_id=$1',[wid]);
  console.log('[COLLAB] access rows', rows);
  res.json(rows);
}));

app.delete('/wishlists/:id/access/:userId', wrap(async (req,res)=>{
  await pool.query('DELETE FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',[req.params.id, req.params.userId]);
  res.status(204).end();
}));


// update roles on a wishlist
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



// Create invite
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

// Get invite
app.get('/invites/:token', wrap(async (req,res)=>{
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
  if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
  
  const invite = rows[0];
  const wid = invite.wishlist_id;
  
  // Get wishlist details
  let wishlist = null;
  try {
    const wishlistRes = await fetch(`${WISHLIST_SVC_URL}/wishlists/${wid}`);
    if (wishlistRes.ok) {
      wishlist = await wishlistRes.json();
    }
  } catch (e) {
    console.error('Failed to fetch wishlist details:', e);
  }
  
  // Get inviter details (wishlist owner)
  let inviter = null;
  if (wishlist) {
    try {
      const userRes = await fetch(`${process.env.USER_SVC_URL || 'http://user-service:3001'}/users/${wishlist.owner_id}`);
      if (userRes.ok) {
        inviter = await userRes.json();
      }
    } catch (e) {
      console.error('Failed to fetch inviter details:', e);
    }
  }
  
  res.json({
    ...invite,
    wishlist_name: wishlist?.name || 'Unknown Wishlist',
    inviter_name: inviter?.public_name || `User ${wishlist?.owner_id || 'Unknown'}`
  });
}));

// Accept invite
app.post('/invites/:token/accept', wrap(async (req,res)=>{
  const userId = uid(req);
  const displayName = (req.body.display_name || '').trim() || null;
  console.log('[COLLAB] POST /invites/:token/accept', { token: req.params.token, userId, displayName });

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

  console.log('[COLLAB] accepted invite -> access upserted', { wid, userId, role, displayName });
  res.json({ ok:true, wishlist_id: wid, role, display_name: displayName });
}));

// Comments permission helper
async function canComment(userId, wishlistId) {
  try {
    const r = await fetch(`${WISHLIST_SVC_URL}/wishlists/${wishlistId}`);
    if (r.ok) {
      const w = await r.json();
      if (Number(w.owner_id) === Number(userId)) return true;
    }
  } catch (e) {
    console.error('canComment: wishlist check failed', e);
  }
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

// Register error handler LAST and start server after migrations
app.use(errorHandler);

ensureMigrations()
  .then(() => {
    app.listen(PORT, ()=>console.log('collaboration-service on', PORT));
  })
  .catch(err => {
    console.error('[COLLAB] Migration failed (continuing to start):', err);
    app.listen(PORT, ()=>console.log('collaboration-service on', PORT));
  });