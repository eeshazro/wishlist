// apps/web-frontend/src/components/InviteModal.jsx
import React from 'react';
import { API } from '../lib/api';

export default function InviteModal({ open, onClose, auth, id }) {
  const [busy, setBusy] = React.useState(false);
  const [link, setLink] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (open) {
      setBusy(false);
      setLink(null);
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

  const generate = async () => {
    try {
      setBusy(true);
      setError(null);
      const r = await fetch(`${API}/api/wishlists/${id}/invites`, {
        method: 'POST',
        headers: { authorization: `Bearer ${auth.token}` }
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

  const copy = async () => {
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

        <p className="a-muted" style={{ marginTop: 0 }}>
          Create a share link and send it to friends so they can join this wishlist.
        </p>

        {error && <div className="a-alert mb-12">Error: {error}</div>}

        <div className="invite-box mt-12">
          <button className="a-button a-button-primary" onClick={generate} disabled={busy}>
            {busy ? 'Generating…' : (link ? 'Regenerate link' : 'Generate invite link')}
          </button>
          {link && (
            <>
              <input className="a-input-text mono" readOnly value={link} />
              <button className="a-button a-button-small" onClick={copy}>Copy</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}