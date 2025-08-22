// // import React from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { API } from '../lib/api';

// // export default function InviteAccept({auth}){
// //   const { token } = useParams();
// //   const [invite,setInvite] = React.useState(null);
// //   const [error,setError] = React.useState(null);
// //   const [busy,setBusy] = React.useState(false);
// //   const nav = useNavigate();

// //   React.useEffect(()=>{
// //     setError(null);
// //     fetch(`${API}/api/invites/${token}`)
// //       .then(async r => {
// //         if (!r.ok) throw new Error((await r.json()).error || 'Failed to load invite');
// //         return r.json();
// //       })
// //       .then(setInvite)
// //       .catch(e => setError(e.message));
// //   }, [token]);

// //   const accept = async ()=>{
// //     try{
// //       setBusy(true);
// //       const r = await fetch(`${API}/api/invites/${token}/accept`, {
// //         method:'POST',
// //         headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
// //         body: JSON.stringify({ role:'view_only' })
// //       });
// //       const data = await r.json();
// //       if(!r.ok) throw new Error(data.error || 'Failed to accept');
// //       nav(`/wishlist/${data.wishlist_id}`);
// //     }catch(e){
// //       setError(e.message);
// //     }finally{
// //       setBusy(false);
// //     }
// //   };

// //   return (
// //     <div className="a-container">
// //       <div className="wl-header">
// //         <div className="wl-titlebar">Invite</div>
// //       </div>
// //       {error && <div className="a-alert">Error: {error}</div>}
// //       {!invite && !error && <p>Loading…</p>}
// //       {invite &&
// //         <div className="invite-box mt-12">
// //           <div>Wishlist ID:</div>
// //           <div className="badge mono">{invite.wishlist_id}</div>
// //           {auth.token
// //             ? <button className="a-button a-button-primary" disabled={busy} onClick={accept}>{busy?'Accepting…':'Accept Invite'}</button>
// //             : <span className="a-muted">Log in to accept.</span>
// //           }
// //         </div>}
// //     </div>
// //   );
// // }

// // apps/web-frontend/src/pages/InviteAccept.jsx
// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { API } from '../lib/api';

// export default function InviteAccept({auth}){
//   const { token } = useParams();
//   const [invite,setInvite] = React.useState(null);
//   const [error,setError] = React.useState(null);
//   const [busy,setBusy] = React.useState(false);
//   const [name,setName] = React.useState('');
//   const nav = useNavigate();

//   React.useEffect(()=>{
//     let cancelled = false;
//     (async () => {
//       setError(null);
//       setInvite(null);
//       try{
//         const r = await fetch(`${API}/api/invites/${token}`);
//         const ct = r.headers.get('content-type') || '';
//         const payload = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
//         if(!r.ok) throw new Error(payload?.error || 'Invalid or expired invite');
//         if(!cancelled) setInvite(payload);
//       }catch(e){
//         if(!cancelled) setError(e.message || 'Failed to load invite');
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [token]);

//   const accept = async ()=>{
//     if(!name.trim()){ setError('Please enter a name to display on this wishlist'); return; }
//     try{
//       setBusy(true);
//       setError(null);
//       const r = await fetch(`${API}/api/invites/${token}/accept`, {
//         method:'POST',
//         headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
//         body: JSON.stringify({ role:'view_only', display_name: name.trim() })
//       });
//       const ct = r.headers.get('content-type') || '';
//       const data = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
//       if(!r.ok) throw new Error(data.error || 'Failed to accept');
//       nav(`/wishlist/${data.wishlist_id}`);
//     }catch(e){
//       setError(e.message || 'Failed to accept');
//     }finally{
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="a-container">
//       <div className="wl-header">
//         <div className="wl-titlebar">Invite</div>
//       </div>
//       {error && <div className="a-alert">Error: {error}</div>}
//       {!invite && !error && <p>Loading…</p>}
//       {invite &&
//         <div className="invite-box mt-12" style={{ alignItems: 'center' }}>
//           <input
//             className="a-input-text"
//             placeholder="Your name for this wishlist"
//             value={name}
//             onChange={e=>setName(e.target.value)}
//           />
//           {auth.token
//             ? <button className="a-button a-button-primary" disabled={busy} onClick={accept}>{busy?'Accepting…':'Accept Invite'}</button>
//             : <span className="a-muted">Log in to accept.</span>
//           }
//         </div>}
//     </div>
//   );
// }


// apps/web-frontend/src/pages/InviteAccept.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../lib/api';

export default function InviteAccept({auth}){
  const { token } = useParams();
  const [invite,setInvite] = React.useState(null);
  const [error,setError] = React.useState(null);
  const [busy,setBusy] = React.useState(false);
  const [name,setName] = React.useState('');
  const nav = useNavigate();

  React.useEffect(()=>{
    let cancelled = false;
    (async () => {
      setError(null);
      setInvite(null);
      try{
        const r = await fetch(`${API}/api/invites/${token}`);
        const ct = r.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
        if(!r.ok) throw new Error(payload?.error || 'Invalid or expired invite');
        if(!cancelled) setInvite(payload);
      }catch(e){
        if(!cancelled) setError(e.message || 'Failed to load invite');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const accept = async ()=>{
    if(!name.trim()){ setError('Please enter a name to display on this wishlist'); return; }
    try{
      setBusy(true);
      setError(null);
      const r = await fetch(`${API}/api/invites/${token}/accept`, {
        method:'POST',
        headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
        body: JSON.stringify({ display_name: name.trim() })
      });
      const ct = r.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
      if(!r.ok) throw new Error(data.error || 'Failed to accept');
      nav(`/wishlist/${data.wishlist_id}`);
    }catch(e){
      setError(e.message || 'Failed to accept');
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
        <div className="invite-box mt-12" style={{ flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="invite-info">
            <h2 className="invite-title">
              {invite.inviter_name} is inviting you to collaborate on their wishlist "{invite.wishlist_name}"
            </h2>
            <p className="invite-description">
              You'll be able to view and comment on items in this wishlist.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '400px' }}>
            <input
              className="a-input-text"
              placeholder="Your name for this wishlist"
              value={name}
              onChange={e=>setName(e.target.value)}
              style={{ width: '100%' }}
            />
            {auth.token
              ? <button className="a-button a-button-primary" disabled={busy} onClick={accept}>{busy?'Accepting…':'Accept Invite'}</button>
              : <span className="a-muted">Log in to accept.</span>
            }
          </div>
        </div>}
    </div>
  );
}