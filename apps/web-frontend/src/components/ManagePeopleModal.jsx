// // // // // apps/web-frontend/src/components/ManagePeopleModal.jsx
// // // // import React from 'react';
// // // // import { API } from '../lib/api';

// // // // export default function ManagePeopleModal({ open, onClose, auth, id, onChanged }) {
// // // //   const [rows, setRows] = React.useState([]);
// // // //   const [busyId, setBusyId] = React.useState(null);
// // // //   const [error, setError] = React.useState(null);

// // // //   React.useEffect(() => {
// // // //     if (!open) return;
// // // //     setError(null);
// // // //     setBusyId(null);
// // // //     fetch(`${API}/api/wishlists/${id}/access`, { headers: { authorization: `Bearer ${auth.token}` } })
// // // //       .then(async r => r.ok ? r.json() : Promise.reject(await r.json()))
// // // //       .then(data => setRows(Array.isArray(data) ? data : []))
// // // //       .catch(e => setError(e?.error || 'Failed to load collaborators'));
// // // //   }, [open, id, auth.token]);

// // // //   if (!open) return null;

// // // //   const overlay = {
// // // //     position: 'fixed',
// // // //     inset: 0,
// // // //     background: 'rgba(0,0,0,.4)',
// // // //     display: 'flex',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     zIndex: 1000
// // // //   };
// // // //   const modal = {
// // // //     width: '640px',
// // // //     maxWidth: '95vw',
// // // //     maxHeight: '85vh',
// // // //     background: '#fff',
// // // //     borderRadius: '10px',
// // // //     padding: '16px',
// // // //     overflow: 'auto',
// // // //     boxShadow: '0 10px 30px rgba(0,0,0,.25)'
// // // //   };
// // // //   const header = {
// // // //     display: 'flex',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'space-between',
// // // //     marginBottom: '12px'
// // // //   };

// // // //   const removeUser = async (userId) => {
// // // //     if (!userId) return;
// // // //     try {
// // // //       setBusyId(userId);
// // // //       setError(null);
// // // //       const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
// // // //         method: 'DELETE',
// // // //         headers: { authorization: `Bearer ${auth.token}` }
// // // //       });
// // // //       if (!r.ok) {
// // // //         const data = await r.json();
// // // //         throw new Error(data.error || 'Failed to remove');
// // // //       }
// // // //       setRows(rs => rs.filter(r => r.user_id !== userId));
// // // //       onChanged?.();
// // // //     } catch (e) {
// // // //       setError(e.message || 'Failed to remove');
// // // //     } finally {
// // // //       setBusyId(null);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div style={overlay} onClick={onClose}>
// // // //       <div style={modal} onClick={e => e.stopPropagation()}>
// // // //         <div style={header}>
// // // //           <div style={{ fontSize: 18, fontWeight: 700 }}>Manage people</div>
// // // //           <button className="a-button" onClick={onClose} aria-label="Close">✕</button>
// // // //         </div>

// // // //         {error && <div className="a-alert mb-12">Error: {error}</div>}

// // // //         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// // // //           {rows.map(r => (
// // // //             <div key={`${r.user_id}-${r.role}`} className="row" style={{ justifyContent: 'space-between' }}>
// // // //               <div className="row" style={{ gap: 10 }}>
// // // //                 <div className="avatar" aria-hidden>
// // // //                   {r.user?.icon_url ? <img src={r.user.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : '👤'}
// // // //                 </div>
// // // //                 <div>
// // // //                   <div style={{ fontWeight: 600 }}>{r.user?.public_name || `User ${r.user_id}`}</div>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="row" style={{ gap: 10 }}>
// // // //                 <span className="badge">{r.role === 'owner' ? 'Owner' : r.role}</span>
// // // //                 {r.role !== 'owner' && (
// // // //                   <button
// // // //                     className="a-button a-button-small"
// // // //                     onClick={() => removeUser(r.user_id)}
// // // //                     disabled={busyId === r.user_id}
// // // //                     aria-label={`Remove ${r.user?.public_name || `User ${r.user_id}`}`}
// // // //                   >{busyId === r.user_id ? 'Removing…' : '✕'}</button>
// // // //                 )}
// // // //               </div>
// // // //             </div>
// // // //           ))}
// // // //           {!rows.length && <div className="a-muted">No collaborators yet.</div>}
// // // //         </div>

// // // //         <div className="row mt-12" style={{ justifyContent: 'flex-end', gap: 8 }}>
// // // //           <button className="a-button" onClick={onClose}>Done</button>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // import React from 'react';
// // // import { API } from '../lib/api';

// // // export default function ManagePeopleModal({ open, onClose, auth, id, onChanged }) {
// // //   const [rows, setRows] = React.useState([]);
// // //   const [busyId, setBusyId] = React.useState(null);
// // //   const [error, setError] = React.useState(null);

// // //   React.useEffect(() => {
// // //     if (!open) return;
// // //     setError(null);
// // //     setBusyId(null);
// // //     fetch(`${API}/api/wishlists/${id}/access`, { headers: { authorization: `Bearer ${auth.token}` } })
// // //       .then(async r => r.ok ? r.json() : Promise.reject(await r.json()))
// // //       .then(data => setRows(Array.isArray(data) ? data : []))
// // //       .catch(e => setError(e?.error || 'Failed to load collaborators'));
// // //   }, [open, id, auth.token]);

// // //   if (!open) return null;

// // //   const overlay = {
// // //     position: 'fixed',
// // //     inset: 0,
// // //     background: 'rgba(0,0,0,.4)',
// // //     display: 'flex',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     zIndex: 1000
// // //   };
// // //   const modal = {
// // //     width: '640px',
// // //     maxWidth: '95vw',
// // //     maxHeight: '85vh',
// // //     background: '#fff',
// // //     borderRadius: '10px',
// // //     padding: '16px',
// // //     overflow: 'auto',
// // //     boxShadow: '0 10px 30px rgba(0,0,0,.25)'
// // //   };
// // //   const header = {
// // //     display: 'flex',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     marginBottom: '12px'
// // //   };

// // //   const removeUser = async (userId) => {
// // //     if (!userId) return;
// // //     try {
// // //       setBusyId(userId);
// // //       setError(null);
// // //       const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
// // //         method: 'DELETE',
// // //         headers: { authorization: `Bearer ${auth.token}` }
// // //       });
// // //       if (!r.ok) {
// // //         const data = await r.json();
// // //         throw new Error(data.error || 'Failed to remove');
// // //       }
// // //       setRows(rs => rs.filter(r => r.user_id !== userId));
// // //       onChanged?.();
// // //     } catch (e) {
// // //       setError(e.message || 'Failed to remove');
// // //     } finally {
// // //       setBusyId(null);
// // //     }
// // //   };

// // //   return (
// // //     <div style={overlay} onClick={onClose}>
// // //       <div style={modal} onClick={e => e.stopPropagation()}>
// // //         <div style={header}>
// // //           <div style={{ fontSize: 18, fontWeight: 700 }}>Manage people</div>
// // //           <button className="a-button" onClick={onClose} aria-label="Close">✕</button>
// // //         </div>

// // //         {error && <div className="a-alert mb-12">Error: {error}</div>}

// // //         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// // //           {rows.map(r => (
// // //             <div key={`${r.user_id}-${r.role}`} className="row" style={{ justifyContent: 'space-between' }}>
// // //               <div className="row" style={{ gap: 10 }}>
// // //                 <div className="avatar" aria-hidden>
// // //                   {r.user?.icon_url ? <img src={r.user.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : '👤'}
// // //                 </div>
// // //                 <div>
// // //                   <div style={{ fontWeight: 600 }}>
// // //                     {r.display_name || r.user?.public_name || `User ${r.user_id}`}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //               <div className="row" style={{ gap: 10 }}>
// // //                 <span className="badge">{r.role === 'owner' ? 'Owner' : r.role}</span>
// // //                 {r.role !== 'owner' && (
// // //                   <button
// // //                     className="a-button a-button-small"
// // //                     onClick={() => removeUser(r.user_id)}
// // //                     disabled={busyId === r.user_id}
// // //                     aria-label={`Remove ${r.display_name || r.user?.public_name || `User ${r.user_id}`}`}
// // //                   >{busyId === r.user_id ? 'Removing…' : '✕'}</button>
// // //                 )}
// // //               </div>
// // //             </div>
// // //           ))}
// // //           {!rows.length && <div className="a-muted">No collaborators yet.</div>}
// // //         </div>

// // //         <div className="row mt-12" style={{ justifyContent: 'flex-end', gap: 8 }}>
// // //           <button className="a-button" onClick={onClose}>Done</button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // apps/web-frontend/src/components/ManagePeopleModal.jsx
// // import React from 'react';
// // import { API } from '../lib/api';

// // export default function ManagePeopleModal({ open, onClose, auth, id, onChanged }) {
// //   const [rows, setRows] = React.useState([]);
// //   const [busyId, setBusyId] = React.useState(null);
// //   const [error, setError] = React.useState(null);

// //   React.useEffect(() => {
// //     if (!open) return;
// //     setError(null);
// //     setBusyId(null);
// //     fetch(`${API}/api/wishlists/${id}/access`, { headers: { authorization: `Bearer ${auth.token}` } })
// //       .then(async r => r.ok ? r.json() : Promise.reject(await r.json()))
// //       .then(data => {
// //         const arr = Array.isArray(data) ? data : [];
// //         console.log('ManagePeopleModal loaded access:', arr);
// //         setRows(arr);
// //       })
// //       .catch(e => setError(e?.error || 'Failed to load collaborators'));
// //   }, [open, id, auth.token]);

// //   React.useEffect(() => {
// //     if (!open) return;
// //     console.log('ManagePeopleModal rows state:', rows);
// //   }, [open, rows]);

// //   if (!open) return null;

// //   const overlay = {
// //     position: 'fixed',
// //     inset: 0,
// //     background: 'rgba(0,0,0,.4)',
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     zIndex: 1000
// //   };
// //   const modal = {
// //     width: '640px',
// //     maxWidth: '95vw',
// //     maxHeight: '85vh',
// //     background: '#fff',
// //     borderRadius: '10px',
// //     padding: '16px',
// //     overflow: 'auto',
// //     boxShadow: '0 10px 30px rgba(0,0,0,.25)'
// //   };
// //   const header = {
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: '12px'
// //   };

// //   const removeUser = async (userId) => {
// //     if (!userId) return;
// //     try {
// //       setBusyId(userId);
// //       setError(null);
// //       const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
// //         method: 'DELETE',
// //         headers: { authorization: `Bearer ${auth.token}` }
// //       });
// //       if (!r.ok) {
// //         const data = await r.json();
// //         throw new Error(data.error || 'Failed to remove');
// //       }
// //       console.log('ManagePeopleModal removed collaborator:', userId);
// //       setRows(rs => rs.filter(r => r.user_id !== userId));
// //       onChanged?.();
// //     } catch (e) {
// //       setError(e.message || 'Failed to remove');
// //     } finally {
// //       setBusyId(null);
// //     }
// //   };

// //   return (
// //     <div style={overlay} onClick={onClose}>
// //       <div style={modal} onClick={e => e.stopPropagation()}>
// //         <div style={header}>
// //           <div style={{ fontSize: 18, fontWeight: 700 }}>Manage people</div>
// //           <button className="a-button" onClick={onClose} aria-label="Close">✕</button>
// //         </div>

// //         {error && <div className="a-alert mb-12">Error: {error}</div>}

// //         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //           {rows.map(r => {
// //             const display = r.name || r.display_name || r.user?.public_name || `User ${r.user_id}`;
// //             return (
// //               <div key={`${r.user_id}-${r.role}`} className="row" style={{ justifyContent: 'space-between' }}>
// //                 <div className="row" style={{ gap: 10 }}>
// //                   <div className="avatar" aria-hidden>
// //                     {r.user?.icon_url ? <img src={r.user.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : '👤'}
// //                   </div>
// //                   <div>
// //                     <div style={{ fontWeight: 600 }}>{display}</div>
// //                   </div>
// //                 </div>
// //                 <div className="row" style={{ gap: 10 }}>
// //                   <span className="badge">{r.role === 'owner' ? 'Owner' : r.role}</span>
// //                   {r.role !== 'owner' && (
// //                     <button
// //                       className="a-button a-button-small"
// //                       onClick={() => removeUser(r.user_id)}
// //                       disabled={busyId === r.user_id}
// //                       aria-label={`Remove ${display}`}
// //                     >{busyId === r.user_id ? 'Removing…' : '✕'}</button>
// //                   )}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //           {!rows.length && <div className="a-muted">No collaborators yet.</div>}
// //         </div>

// //         <div className="row mt-12" style={{ justifyContent: 'flex-end', gap: 8 }}>
// //           <button className="a-button" onClick={onClose}>Done</button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // apps/web-frontend/src/components/ManagePeopleModal.jsx
// import React from 'react';
// import { API } from '../lib/api';

// export default function ManagePeopleModal({ open, onClose, auth, id, onChanged }) {
// 	const [rows, setRows] = React.useState([]);
// 	const [busyId, setBusyId] = React.useState(null);
// 	const [error, setError] = React.useState(null);

// 	React.useEffect(() => {
// 		if (!open) return;
// 		setError(null);
// 		setBusyId(null);
// 		fetch(`${API}/api/wishlists/${id}/access`, { headers: { authorization: `Bearer ${auth.token}` } })
// 			.then(async r => r.ok ? r.json() : Promise.reject(await r.json()))
// 			.then(data => {
// 				const arr = Array.isArray(data) ? data : [];
// 				console.log('ManagePeopleModal loaded access:', arr);
// 				setRows(arr);
// 			})
// 			.catch(e => setError(e?.error || 'Failed to load collaborators'));
// 	}, [open, id, auth.token]);

// 	React.useEffect(() => {
// 		if (!open) return;
// 		console.log('ManagePeopleModal rows state:', rows);
// 	}, [open, rows]);

// 	if (!open) return null;

// 	const overlay = {
// 		position: 'fixed',
// 		inset: 0,
// 		background: 'rgba(0,0,0,.4)',
// 		display: 'flex',
// 		alignItems: 'center',
// 		justifyContent: 'center',
// 		zIndex: 1000
// 	};
// 	const modal = {
// 		width: '640px',
// 		maxWidth: '95vw',
// 		maxHeight: '85vh',
// 		background: '#fff',
// 		borderRadius: '10px',
// 		padding: '16px',
// 		overflow: 'auto',
// 		boxShadow: '0 10px 30px rgba(0,0,0,.25)'
// 	};
// 	const header = {
// 		display: 'flex',
// 		alignItems: 'center',
// 		justifyContent: 'space-between',
// 		marginBottom: '12px'
// 	};

// 	const removeUser = async (userId) => {
// 		if (!userId) return;
// 		try {
// 			setBusyId(userId);
// 			setError(null);
// 			const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
// 				method: 'DELETE',
// 				headers: { authorization: `Bearer ${auth.token}` }
// 			});
// 			if (!r.ok) {
// 				const data = await r.json();
// 				throw new Error(data.error || 'Failed to remove');
// 			}
// 			console.log('ManagePeopleModal removed collaborator:', userId);
// 			setRows(rs => rs.filter(r => r.user_id !== userId));
// 			onChanged?.();
// 		} catch (e) {
// 			setError(e.message || 'Failed to remove');
// 		} finally {
// 			setBusyId(null);
// 		}
// 	};

// 	const updateRole = async (userId, role) => {
// 		if (!userId || !role) return;
// 		try {
// 			setBusyId(userId);
// 			setError(null);
// 			const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
// 				method: 'PATCH',
// 				headers: { authorization: `Bearer ${auth.token}`, 'content-type': 'application/json' },
// 				body: JSON.stringify({ role })
// 			});
// 			const ct = r.headers.get('content-type') || '';
// 			const data = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
// 			if (!r.ok) throw new Error(data.error || 'Failed to update role');
// 			setRows(rs => rs.map(row => row.user_id === userId ? { ...row, role: data.role } : row));
// 			onChanged?.();
// 		} catch (e) {
// 			setError(e.message || 'Failed to update role');
// 		} finally {
// 			setBusyId(null);
// 		}
// 	};

// 	return (
// 		<div style={overlay} onClick={onClose}>
// 			<div style={modal} onClick={e => e.stopPropagation()}>
// 				<div style={header}>
// 					<div style={{ fontSize: 18, fontWeight: 700 }}>Manage people</div>
// 					<button className="a-button" onClick={onClose} aria-label="Close">✕</button>
// 				</div>

// 				{error && <div className="a-alert mb-12">Error: {error}</div>}

// 				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// 					{rows.map(r => {
// 						const display = r.name || r.display_name || r.user?.public_name || `User ${r.user_id}`;
// 						const isOwner = r.role === 'owner';
// 						return (
// 							<div key={`${r.user_id}-${r.role}-${display}`} className="row" style={{ justifyContent: 'space-between' }}>
// 								<div className="row" style={{ gap: 10 }}>
// 									<div className="avatar" aria-hidden>
// 										{r.user?.icon_url ? <img src={r.user.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : '👤'}
// 									</div>
// 									<div>
// 										<div style={{ fontWeight: 600 }}>{display}</div>
// 									</div>
// 								</div>
// 								<div className="row" style={{ gap: 10, alignItems: 'center' }}>
// 									{isOwner ? (
// 										<span className="badge">Owner</span>
// 									) : (
// 										<select
// 											className="a-input-text"
// 											value={r.role}
// 											onChange={(e) => updateRole(r.user_id, e.target.value)}
// 											disabled={busyId === r.user_id}
// 											aria-label={`Role for ${display}`}
// 										>
// 											<option value="view_only">view_only</option>
// 											<option value="comment_only">comment_only</option>
// 											<option value="view_edit">view_edit</option>
// 										</select>
// 									)}
// 									{!isOwner && (
// 										<button
// 											className="a-button a-button-small"
// 											onClick={() => removeUser(r.user_id)}
// 											disabled={busyId === r.user_id}
// 											aria-label={`Remove ${display}`}
// 										>{busyId === r.user_id ? 'Removing…' : '✕'}</button>
// 									)}
// 								</div>
// 							</div>
// 						);
// 					})}
// 					{!rows.length && <div className="a-muted">No collaborators yet.</div>}
// 				</div>

// 				<div className="row mt-12" style={{ justifyContent: 'flex-end', gap: 8 }}>
// 					<button className="a-button" onClick={onClose}>Done</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }


// apps/web-frontend/src/components/ManagePeopleModal.jsx
import React from 'react';
import { API } from '../lib/api';

export default function ManagePeopleModal({ open, onClose, auth, id, onChanged }) {
	const [rows, setRows] = React.useState([]);
	const [busyId, setBusyId] = React.useState(null);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		if (!open) return;
		setError(null);
		setBusyId(null);
		fetch(`${API}/api/wishlists/${id}/access`, { headers: { authorization: `Bearer ${auth.token}` } })
			.then(async r => r.ok ? r.json() : Promise.reject(await r.json()))
			.then(data => {
				const arr = Array.isArray(data) ? data : [];
				setRows(arr);
			})
			.catch(e => setError(e?.error || 'Failed to load collaborators'));
	}, [open, id, auth.token]);

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
		width: '640px',
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

	const removeUser = async (userId) => {
		if (!userId) return;
		try {
			setBusyId(userId);
			setError(null);
			const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
				method: 'DELETE',
				headers: { authorization: `Bearer ${auth.token}` }
			});
			if (!r.ok) {
				const data = await r.json();
				throw new Error(data.error || 'Failed to remove');
			}
			setRows(rs => rs.filter(r => r.user_id !== userId));
			onChanged?.();
		} catch (e) {
			setError(e.message || 'Failed to remove');
		} finally {
			setBusyId(null);
		}
	};

	const updateRole = async (userId, role) => {
		if (!userId || !role) return;
		try {
			setBusyId(userId);
			setError(null);
			const r = await fetch(`${API}/api/wishlists/${id}/access/${userId}`, {
				method: 'PATCH',
				headers: { authorization: `Bearer ${auth.token}`, 'content-type': 'application/json' },
				body: JSON.stringify({ role })
			});
			const ct = r.headers.get('content-type') || '';
			const data = ct.includes('application/json') ? await r.json() : { error: (await r.text()) };
			if (!r.ok) throw new Error(data.error || 'Failed to update role');
			setRows(rs => rs.map(row => row.user_id === userId ? { ...row, role: data.role } : row));
			onChanged?.();
		} catch (e) {
			setError(e.message || 'Failed to update role');
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div style={overlay} onClick={onClose}>
			<div style={modal} onClick={e => e.stopPropagation()}>
				<div style={header}>
					<div style={{ fontSize: 18, fontWeight: 700 }}>Manage people</div>
					<button className="a-button" onClick={onClose} aria-label="Close">✕</button>
				</div>

				{error && <div className="a-alert mb-12">Error: {error}</div>}

				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					{rows.map(r => {
						const display = r.name || r.display_name || r.user?.public_name || `User ${r.user_id}`;
						const isOwner = r.role === 'owner';
						return (
							<div key={`${r.user_id}-${r.role}-${display}`} className="row" style={{ justifyContent: 'space-between' }}>
								<div className="row" style={{ gap: 10 }}>
									<div className="avatar" aria-hidden>
										{r.user?.icon_url ? <img src={r.user.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : '👤'}
									</div>
									<div>
										<div style={{ fontWeight: 600 }}>{display}</div>
									</div>
								</div>
								<div className="row" style={{ gap: 10, alignItems: 'center' }}>
									{isOwner ? (
										<span className="badge">Owner</span>
									) : (
										<select
											className="a-input-text"
											value={r.role}
											onChange={(e) => updateRole(r.user_id, e.target.value)}
											disabled={busyId === r.user_id}
											aria-label={`Role for ${display}`}
										>
											<option value="view_only">view_only</option>
											<option value="comment_only">comment_only</option>
											<option value="view_edit">view_edit</option>
										</select>
									)}
									{!isOwner && (
										<button
											className="a-button a-button-small"
											onClick={() => removeUser(r.user_id)}
											disabled={busyId === r.user_id}
											aria-label={`Remove ${display}`}
										>{busyId === r.user_id ? 'Removing…' : '✕'}</button>
									)}
								</div>
							</div>
						);
					})}
					{!rows.length && <div className="a-muted">No collaborators yet.</div>}
				</div>

				<div className="row mt-12" style={{ justifyContent: 'flex-end', gap: 8 }}>
					<button className="a-button" onClick={onClose}>Done</button>
				</div>
			</div>
		</div>
	);
}
