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
