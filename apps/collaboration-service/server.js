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

function userId(req){ return parseInt(req.headers['x-user-id']||'0',10); }

app.get('/health', (req,res)=>res.json({ok:true, service:'collaboration-service'}));

// Access listings for current user
app.get('/access/mine', async (req,res)=>{
  const uid = userId(req);
  const { rows } = await pool.query('SELECT wishlist_id, role FROM "collab".wishlist_access WHERE user_id=$1',[uid]);
  res.json(rows);
});

// Owner-only: list collaborators
app.get('/wishlists/:id/access', async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const ownerId = parseInt(req.headers['x-owner-id']||'0',10); // gateway sets this after checking ownership
  if(!ownerId) return res.status(403).json({error:'owner required'});
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_access WHERE wishlist_id=$1',[wid]);
  res.json(rows);
});

app.delete('/wishlists/:id/access/:userId', async (req,res)=>{
  await pool.query('DELETE FROM "collab".wishlist_access WHERE wishlist_id=$1 AND user_id=$2',[req.params.id, req.params.userId]);
  res.status(204).end();
});


app.post('/wishlists/:id/invites', async (req,res)=>{
  const wid = parseInt(req.params.id,10);
  const token = nanoid(16);

  // compute expiry in JS (72 hours from now)
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const { rows } = await pool.query(
    'INSERT INTO "collab".wishlist_invite (wishlist_id, token, expires_at) VALUES ($1,$2,$3) RETURNING *',
    [wid, token, expiresAt]
  );

  res.status(201).json({ token: rows[0].token, expires_at: rows[0].expires_at });
});


app.get('/invites/:token', async (req,res)=>{
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
  if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
  res.json(rows[0]);
});

app.post('/invites/:token/accept', async (req,res)=>{
  const uid = userId(req);
  const role = req.body.role || 'view_only';
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_invite WHERE token=$1 AND expires_at > NOW()',[req.params.token]);
  if(!rows[0]) return res.status(404).json({error:'invalid or expired'});
  const wid = rows[0].wishlist_id;
  await pool.query(`INSERT INTO "collab".wishlist_access (wishlist_id, user_id, role, invited_by)
                    VALUES ($1,$2,$3,$4) ON CONFLICT (wishlist_id, user_id) DO UPDATE SET role=EXCLUDED.role`,
                    [wid, uid, role, uid]);
  res.json({ ok:true, wishlist_id: wid, role });
});

// Comments
app.get('/items/:itemId/comments', async (req,res)=>{
  const { rows } = await pool.query('SELECT * FROM "collab".wishlist_item_comment WHERE wishlist_item_id=$1 ORDER BY created_at DESC',[req.params.itemId]);
  res.json(rows);
});

app.post('/items/:itemId/comments', async (req,res)=>{
  const uid = userId(req);
  const { comment_text } = req.body;
  const { rows } = await pool.query('INSERT INTO "collab".wishlist_item_comment (wishlist_item_id, user_id, comment_text) VALUES ($1,$2,$3) RETURNING *',[req.params.itemId, uid, comment_text]);
  res.status(201).json(rows[0]);
});

app.listen(PORT, ()=>console.log('collaboration-service on', PORT));