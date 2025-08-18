import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../lib/api';

export default function InviteAccept({auth}){
  const { token } = useParams();
  const [invite,setInvite] = React.useState(null);
  const [error,setError] = React.useState(null);
  const [busy,setBusy] = React.useState(false);
  const nav = useNavigate();

  React.useEffect(()=>{
    setError(null);
    fetch(`${API}/api/invites/${token}`)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load invite');
        return r.json();
      })
      .then(setInvite)
      .catch(e => setError(e.message));
  }, [token]);

  const accept = async ()=>{
    try{
      setBusy(true);
      const r = await fetch(`${API}/api/invites/${token}/accept`, {
        method:'POST',
        headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
        body: JSON.stringify({ role:'view_only' })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error || 'Failed to accept');
      nav(`/wishlist/${data.wishlist_id}`);
    }catch(e){
      setError(e.message);
    }finally{
      setBusy(false);
    }
  };

  return (
    <div className="a-container">
      <div className="wl-header">
        <div className="wl-titlebar">Invite</div>
      </div>
      {error && <div className="a-alert">Error: {error}</div>}
      {!invite && !error && <p>Loading…</p>}
      {invite &&
        <div className="invite-box mt-12">
          <div>Wishlist ID:</div>
          <div className="badge mono">{invite.wishlist_id}</div>
          {auth.token
            ? <button className="a-button a-button-primary" disabled={busy} onClick={accept}>{busy?'Accepting…':'Accept Invite'}</button>
            : <span className="a-muted">Log in to accept.</span>
          }
        </div>}
    </div>
  );
}
