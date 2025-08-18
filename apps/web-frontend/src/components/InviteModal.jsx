// // apps/web-frontend/src/components/InviteModal.jsx
// import React from 'react';
// import { API } from '../lib/api';

// export default function InviteModal({ open, onClose, auth, id }) {
//   const [busy, setBusy] = React.useState(false);
//   const [link, setLink] = React.useState(null);
//   const [error, setError] = React.useState(null);

//   React.useEffect(() => {
//     if (open) {
//       setBusy(false);
//       setLink(null);
//       setError(null);
//     }
//   }, [open]);

//   if (!open) return null;

//   const overlay = {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(0,0,0,.4)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1000
//   };
//   const modal = {
//     width: '560px',
//     maxWidth: '95vw',
//     maxHeight: '85vh',
//     background: '#fff',
//     borderRadius: '10px',
//     padding: '16px',
//     overflow: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,.25)'
//   };
//   const header = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: '12px'
//   };

//   const generate = async () => {
//     try {
//       setBusy(true);
//       setError(null);
//       const r = await fetch(`${API}/api/wishlists/${id}/invites`, {
//         method: 'POST',
//         headers: { authorization: `Bearer ${auth.token}` }
//       });
//       const data = await r.json();
//       if (!r.ok) throw new Error(data.error || 'Failed to generate invite');
//       setLink(data.inviteLink);
//     } catch (e) {
//       setError(e.message || 'Failed to generate invite');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const copy = async () => {
//     if (!link) return;
//     try {
//       await navigator.clipboard.writeText(link);
//     } catch (_) {}
//   };

//   return (
//     <div style={overlay} onClick={onClose}>
//       <div style={modal} onClick={e => e.stopPropagation()}>
//         <div style={header}>
//           <div style={{ fontSize: 18, fontWeight: 700 }}>Invite to list</div>
//           <button className="a-button" onClick={onClose} aria-label="Close">✕</button>
//         </div>

//         <p className="a-muted" style={{ marginTop: 0 }}>
//           Create a share link and send it to friends so they can join this wishlist.
//         </p>

//         {error && <div className="a-alert mb-12">Error: {error}</div>}

//         <div className="invite-box mt-12">
//           <button className="a-button a-button-primary" onClick={generate} disabled={busy}>
//             {busy ? 'Generating…' : (link ? 'Regenerate link' : 'Generate invite link')}
//           </button>
//           {link && (
//             <>
//               <input className="a-input-text mono" readOnly value={link} />
//               <button className="a-button a-button-small" onClick={copy}>Copy</button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// apps/web-frontend/src/components/InviteModal.jsx
import React from 'react';
import { API } from '../lib/api';

export default function InviteModal({ open, onClose, auth, id }) {
  const [busyView, setBusyView] = React.useState(false);
  const [busyEdit, setBusyEdit] = React.useState(false);
  const [linkView, setLinkView] = React.useState(null);
  const [linkEdit, setLinkEdit] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (open) {
      setBusyView(false);
      setBusyEdit(false);
      setLinkView(null);
      setLinkEdit(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };
  const modal = {
    width: '560px',
    maxWidth: '95vw',
    maxHeight: '85vh',
    background: '#fff',
    borderRadius: '10px',
    padding: '16px',
    overflow: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,.25)'
  };
  const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  };

  const generate = async (type) => {
    const setBusy = type === 'view_only' ? setBusyView : setBusyEdit;
    const setLink = type === 'view_only' ? setLinkView : setLinkEdit;
    try {
      setBusy(true);
      setError(null);
      const r = await fetch(`${API}/api/wishlists/${id}/invites`, {
        method: 'POST',
        headers: { authorization: `Bearer ${auth.token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ access_type: type })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to generate invite');
      setLink(data.inviteLink);
    } catch (e) {
      setError(e.message || 'Failed to generate invite');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (link) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch (_) {}
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Invite to list</div>
          <button className="a-button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="a-alert mb-12">Error: {error}</div>}

        <div className="invite-box mt-12" style={{ gap: 16, flexDirection: 'column', alignItems: 'stretch' }}>
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
              {linkView && (
                <>
                  <input className="a-input-text mono" readOnly value={linkView} />
                  <button className="a-button a-button-small" onClick={() => copy(linkView)}>Copy</button>
                </>
              )}
            </div>
          </div>

          <hr />

          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>VIEW AND EDIT</div>
            <div className="a-muted" style={{ marginBottom: 8 }}>
              Invited people can add or remove items from your list
            </div>
            <div className="invite-box">
              <button className="a-button a-button-primary" onClick={() => generate('view_edit')} disabled={busyEdit}>
                {busyEdit ? 'Generating…' : (linkEdit ? 'Regenerate link' : 'Generate link')}
              </button>
              {linkEdit && (
                <>
                  <input className="a-input-text mono" readOnly value={linkEdit} />
                  <button className="a-button a-button-small" onClick={() => copy(linkEdit)}>Copy</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}