// // // // // apps/web-frontend/src/pages/WishlistView.jsx
// // // // import React from 'react';
// // // // import { useParams } from 'react-router-dom';
// // // // import { API } from '../lib/api';
// // // // import LeftNav from '../components/LeftNav';
// // // // import ShareButton from '../components/ShareButton';
// // // // import CommentThread from '../components/CommentThread';
// // // // import AddItemModal from '../components/AddItemModal';
// // // // import InviteModal from '../components/InviteModal';

// // // // export default function WishlistView({auth}){
// // // //   const { id } = useParams();
// // // //   const [data,setData] = React.useState(null);
// // // //   const [products,setProducts] = React.useState([]);
// // // //   const [myLists,setMyLists] = React.useState([]);
// // // //   const [showAdd,setShowAdd] = React.useState(false);
// // // //   const [showInvite,setShowInvite] = React.useState(false);
// // // //   const [collabs,setCollabs] = React.useState([]);

// // // //   React.useEffect(()=>{
// // // //     if(!auth.token) return;
// // // //     fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // // //       .then(r=>r.json()).then(setData);
// // // //     fetch(`${API}/products`).then(r=>r.json()).then(setProducts);
// // // //     fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // // //       .then(r=>r.json()).then(setMyLists);
// // // //   },[id,auth.token]);

// // // //   // Load collaborators if owner (for avatars)
// // // //   React.useEffect(()=>{
// // // //     if(!auth.token) return;
// // // //     if(!data || data.role !== 'owner') { setCollabs([]); return; }
// // // //     fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // // //       .then(async r => r.ok ? r.json() : [])
// // // //       .then(arr => Array.isArray(arr) ? arr : [])
// // // //       .then(setCollabs)
// // // //       .catch(()=>setCollabs([]));
// // // //   }, [id, auth.token, data?.role]);

// // // //   const addProduct = async (p)=>{
// // // //     if(!p) return;
// // // //     const r = await fetch(`${API}/api/wishlists/${id}/items`, {
// // // //       method:'POST',
// // // //       headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
// // // //       body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 })
// // // //     });
// // // //     const item = await r.json();
// // // //     setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}));
// // // //   };

// // // //   if(!data) return <div className="a-container">Loading…</div>;

// // // //   const canComment = ['owner','view_edit','comment_only'].includes(data.role);
// // // //   const canAdd = (data.role==='owner' || data.role==='view_edit');

// // // //   // simple avatar render (placeholder person icon inside circle)
// // // //   const avatars = (collabs || []).slice(0, 6).map(c => (
// // // //     <div key={c.user_id} className="avatar" title={`User ${c.user_id}`} aria-label={`User ${c.user_id}`}>👤</div>
// // // //   ));

// // // //   return (
// // // //     <div className="a-container">
// // // //       <div className="wl-layout">
// // // //         <LeftNav lists={myLists} currentId={id} />
// // // //         <div>
// // // //           <div className="wl-header">
// // // //             <div className="wl-titlebar">
// // // //               {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
// // // //               {(data.role === 'owner' || (collabs && collabs.length)) && (
// // // //                 <div className="row mt-8" style={{ gap: 6 }}>
// // // //                   {avatars}
// // // //                   {data.role==='owner' && (
// // // //                     <button
// // // //                       className="a-button a-button-small"
// // // //                       aria-label="Invite collaborators"
// // // //                       onClick={()=>setShowInvite(true)}
// // // //                       title="Invite collaborators"
// // // //                     >+</button>
// // // //                   )}
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //             <div className="wl-controls">
// // // //               {canAdd && <button className="a-button a-button-primary" onClick={()=>setShowAdd(true)}>Add item</button>}
// // // //               {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
// // // //             </div>
// // // //           </div>

// // // //           <div className="control-bar">
// // // //             <div className="search">
// // // //               <input className="a-input-text" placeholder="Search this list" />
// // // //             </div>
// // // //             <div className="filters">
// // // //               <label>Sort by:</label>
// // // //               <select defaultValue="default">
// // // //                 <option value="default">Default</option>
// // // //                 <option value="priority">Priority (high to low)</option>
// // // //                 <option value="price-asc">Price (low to high)</option>
// // // //                 <option value="price-desc">Price (high to high)</option>
// // // //               </select>
// // // //             </div>
// // // //           </div>

// // // //           <div className="items-list">
// // // //             {(data.items || []).map(it=>(
// // // //               <div className="row-card" key={it.id}>
// // // //                 <img src={it.product?.image_url} alt="" />
// // // //                 <div className="row-main">
// // // //                   <div className="row-head">
// // // //                     <div>
// // // //                       <div className="item-title">{it.title}</div>
// // // //                       <div className="item-price">${it.product?.price}</div>
// // // //                     </div>
// // // //                   </div>
// // // //                   <CommentThread auth={auth} wid={id} itemId={it.id} canComment={canComment} />
// // // //                 </div>
// // // //               </div>
// // // //             ))}
// // // //           </div>

// // // //           <AddItemModal
// // // //             open={showAdd}
// // // //             onClose={()=>setShowAdd(false)}
// // // //             products={products}
// // // //             onPick={addProduct}
// // // //           />
// // // //           <InviteModal
// // // //             open={showInvite}
// // // //             onClose={()=>setShowInvite(false)}
// // // //             auth={auth}
// // // //             id={id}
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // // apps/web-frontend/src/pages/WishlistView.jsx
// // // import React from 'react';
// // // import { useParams } from 'react-router-dom';
// // // import { API } from '../lib/api';
// // // import LeftNav from '../components/LeftNav';
// // // import ShareButton from '../components/ShareButton';
// // // import CommentThread from '../components/CommentThread';
// // // import AddItemModal from '../components/AddItemModal';
// // // import InviteModal from '../components/InviteModal';
// // // import ManagePeopleModal from '../components/ManagePeopleModal';

// // // export default function WishlistView({auth}){
// // //   const { id } = useParams();
// // //   const [data,setData] = React.useState(null);
// // //   const [products,setProducts] = React.useState([]);
// // //   const [myLists,setMyLists] = React.useState([]);
// // //   const [showAdd,setShowAdd] = React.useState(false);
// // //   const [showInvite,setShowInvite] = React.useState(false);
// // //   const [showManage,setShowManage] = React.useState(false);
// // //   const [collabs,setCollabs] = React.useState([]);

// // //   React.useEffect(()=>{
// // //     if(!auth.token) return;
// // //     fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // //       .then(r=>r.json()).then(setData);
// // //     fetch(`${API}/products`).then(r=>r.json()).then(setProducts);
// // //     fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // //       .then(r=>r.json()).then(setMyLists);
// // //   },[id,auth.token]);

// // //   // Load collaborators if owner (for avatars)
// // //   React.useEffect(()=>{
// // //     if(!auth.token) return;
// // //     if(!data || data.role !== 'owner') { setCollabs([]); return; }
// // //     fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // //       .then(async r => r.ok ? r.json() : [])
// // //       .then(arr => Array.isArray(arr) ? arr : [])
// // //       .then(setCollabs)
// // //       .catch(()=>setCollabs([]));
// // //   }, [id, auth.token, data?.role]);

// // //   const addProduct = async (p)=>{
// // //     if(!p) return;
// // //     const r = await fetch(`${API}/api/wishlists/${id}/items`, {
// // //       method:'POST',
// // //       headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
// // //       body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 })
// // //     });
// // //     const item = await r.json();
// // //     setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}));
// // //   };

// // //   if(!data) return <div className="a-container">Loading…</div>;

// // //   const canComment = ['owner','view_edit','comment_only'].includes(data.role);
// // //   const canAdd = (data.role==='owner' || data.role==='view_edit');

// // //   const avatars = (collabs || [])
// // //     .filter(c => c.role !== 'owner')
// // //     .slice(0, 6)
// // //     .map(c => (
// // //       <div key={c.user_id} className="avatar" title={c.user?.public_name || `User ${c.user_id}`} aria-label={c.user?.public_name || `User ${c.user_id}`}>👤</div>
// // //     ));

// // //   return (
// // //     <div className="a-container">
// // //       <div className="wl-layout">
// // //         <LeftNav lists={myLists} currentId={id} />
// // //         <div>
// // //           <div className="wl-header">
// // //             <div className="wl-titlebar">
// // //               {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
// // //               {(data.role === 'owner' || (collabs && collabs.length)) && (
// // //                 <div className="row mt-8" style={{ gap: 6 }}>
// // //                   {avatars}
// // //                   {data.role==='owner' && (
// // //                     <>
// // //                       <button
// // //                         className="a-button a-button-small"
// // //                         aria-label="Invite collaborators"
// // //                         onClick={()=>setShowInvite(true)}
// // //                         title="Invite collaborators"
// // //                       >+</button>
// // //                       <button
// // //                         className="a-button a-button-small"
// // //                         aria-label="Manage people"
// // //                         onClick={()=>setShowManage(true)}
// // //                         title="Manage people"
// // //                       >⋯</button>
// // //                     </>
// // //                   )}
// // //                 </div>
// // //               )}
// // //             </div>
// // //             <div className="wl-controls">
// // //               {canAdd && <button className="a-button a-button-primary" onClick={()=>setShowAdd(true)}>Add item</button>}
// // //               {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
// // //             </div>
// // //           </div>

// // //           <div className="control-bar">
// // //             <div className="search">
// // //               <input className="a-input-text" placeholder="Search this list" />
// // //             </div>
// // //             <div className="filters">
// // //               <label>Sort by:</label>
// // //               <select defaultValue="default">
// // //                 <option value="default">Default</option>
// // //                 <option value="priority">Priority (high to low)</option>
// // //                 <option value="price-asc">Price (low to high)</option>
// // //                 <option value="price-desc">Price (high to high)</option>
// // //               </select>
// // //             </div>
// // //           </div>

// // //           <div className="items-list">
// // //             {(data.items || []).map(it=>(
// // //               <div className="row-card" key={it.id}>
// // //                 <img src={it.product?.image_url} alt="" />
// // //                 <div className="row-main">
// // //                   <div className="row-head">
// // //                     <div>
// // //                       <div className="item-title">{it.title}</div>
// // //                       <div className="item-price">${it.product?.price}</div>
// // //                     </div>
// // //                   </div>
// // //                   <CommentThread auth={auth} wid={id} itemId={it.id} canComment={canComment} />
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           <AddItemModal
// // //             open={showAdd}
// // //             onClose={()=>setShowAdd(false)}
// // //             products={products}
// // //             onPick={addProduct}
// // //           />

// // //           <InviteModal
// // //             open={showInvite}
// // //             onClose={()=>setShowInvite(false)}
// // //             auth={auth}
// // //             id={id}
// // //           />

// // //           <ManagePeopleModal
// // //             open={showManage}
// // //             onClose={()=>setShowManage(false)}
// // //             auth={auth}
// // //             id={id}
// // //             onChanged={()=>{
// // //               // refresh avatars list after changes
// // //               fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
// // //                 .then(async r => r.ok ? r.json() : [])
// // //                 .then(arr => Array.isArray(arr) ? arr : [])
// // //                 .then(setCollabs)
// // //                 .catch(()=>setCollabs([]));
// // //             }}
// // //           />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // apps/web-frontend/src/pages/WishlistView.jsx
// // import React from 'react';
// // import { useParams } from 'react-router-dom';
// // import { API } from '../lib/api';
// // import LeftNav from '../components/LeftNav';
// // import ShareButton from '../components/ShareButton';
// // import CommentThread from '../components/CommentThread';
// // import AddItemModal from '../components/AddItemModal';
// // import InviteModal from '../components/InviteModal';
// // import ManagePeopleModal from '../components/ManagePeopleModal';

// // export default function WishlistView({auth}){
// //   const { id } = useParams();
// //   const [data,setData] = React.useState(null);
// //   const [products,setProducts] = React.useState([]);
// //   const [myLists,setMyLists] = React.useState([]);
// //   const [showAdd,setShowAdd] = React.useState(false);
// //   const [showInvite,setShowInvite] = React.useState(false);
// //   const [showManage,setShowManage] = React.useState(false);
// //   const [collabs,setCollabs] = React.useState([]);

// //   React.useEffect(()=>{
// //     if(!auth.token) return;
// //     fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
// //       .then(r=>r.json()).then(setData);
// //     fetch(`${API}/products`).then(r=>r.json()).then(setProducts);
// //     fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
// //       .then(r=>r.json()).then(setMyLists);
// //   },[id,auth.token]);

// //   React.useEffect(()=>{
// //     if(!auth.token) return;
// //     if(!data || data.role !== 'owner') { setCollabs([]); return; }
// //     fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
// //       .then(async r => r.ok ? r.json() : [])
// //       .then(arr => Array.isArray(arr) ? arr : [])
// //       .then(setCollabs)
// //       .catch(()=>setCollabs([]));
// //   }, [id, auth.token, data?.role]);

// //   const addProduct = async (p)=>{
// //     if(!p) return;
// //     const r = await fetch(`${API}/api/wishlists/${id}/items`, {
// //       method:'POST',
// //       headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
// //       body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 })
// //     });
// //     const item = await r.json();
// //     setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}));
// //   };

// //   if(!data) return <div className="a-container">Loading…</div>;

// //   const canComment = ['owner','view_edit','comment_only'].includes(data.role);
// //   const canAdd = (data.role==='owner' || data.role==='view_edit');

// //   const avatars = (collabs || [])
// //     .filter(c => c.role !== 'owner')
// //     .slice(0, 6)
// //     .map(c => (
// //       <div
// //         key={c.user_id}
// //         className="avatar"
// //         title={(c.display_name || c.user?.public_name || `User ${c.user_id}`)}
// //         aria-label={(c.display_name || c.user?.public_name || `User ${c.user_id}`)}
// //       >👤</div>
// //     ));

// //   return (
// //     <div className="a-container">
// //       <div className="wl-layout">
// //         <LeftNav lists={myLists} currentId={id} />
// //         <div>
// //           <div className="wl-header">
// //             <div className="wl-titlebar">
// //               {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
// //               {(data.role === 'owner' || (collabs && collabs.length)) && (
// //                 <div className="row mt-8" style={{ gap: 6 }}>
// //                   {avatars}
// //                   {data.role==='owner' && (
// //                     <>
// //                       <button
// //                         className="a-button a-button-small"
// //                         aria-label="Invite collaborators"
// //                         onClick={()=>setShowInvite(true)}
// //                         title="Invite collaborators"
// //                       >+</button>
// //                       <button
// //                         className="a-button a-button-small"
// //                         aria-label="Manage people"
// //                         onClick={()=>setShowManage(true)}
// //                         title="Manage people"
// //                       >⋯</button>
// //                     </>
// //                   )}
// //                 </div>
// //               )}
// //             </div>
// //             <div className="wl-controls">
// //               {canAdd && <button className="a-button a-button-primary" onClick={()=>setShowAdd(true)}>Add item</button>}
// //               {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
// //             </div>
// //           </div>

// //           <div className="control-bar">
// //             <div className="search">
// //               <input className="a-input-text" placeholder="Search this list" />
// //             </div>
// //             <div className="filters">
// //               <label>Sort by:</label>
// //               <select defaultValue="default">
// //                 <option value="default">Default</option>
// //                 <option value="priority">Priority (high to low)</option>
// //                 <option value="price-asc">Price (low to high)</option>
// //                 <option value="price-desc">Price (high to high)</option>
// //               </select>
// //             </div>
// //           </div>

// //           <div className="items-list">
// //             {(data.items || []).map(it=>(
// //               <div className="row-card" key={it.id}>
// //                 <img src={it.product?.image_url} alt="" />
// //                 <div className="row-main">
// //                   <div className="row-head">
// //                     <div>
// //                       <div className="item-title">{it.title}</div>
// //                       <div className="item-price">${it.product?.price}</div>
// //                     </div>
// //                   </div>
// //                   <CommentThread auth={auth} wid={id} itemId={it.id} canComment={canComment} />
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           <AddItemModal
// //             open={showAdd}
// //             onClose={()=>setShowAdd(false)}
// //             products={products}
// //             onPick={addProduct}
// //           />

// //           <InviteModal
// //             open={showInvite}
// //             onClose={()=>setShowInvite(false)}
// //             auth={auth}
// //             id={id}
// //           />

// //           <ManagePeopleModal
// //             open={showManage}
// //             onClose={()=>setShowManage(false)}
// //             auth={auth}
// //             id={id}
// //             onChanged={()=>{
// //               fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
// //                 .then(async r => r.ok ? r.json() : [])
// //                 .then(arr => Array.isArray(arr) ? arr : [])
// //                 .then(setCollabs)
// //                 .catch(()=>setCollabs([]));
// //             }}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // apps/web-frontend/src/pages/WishlistView.jsx
// // apps/web-frontend/src/pages/WishlistView.jsx
// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { API } from '../lib/api';
// import LeftNav from '../components/LeftNav';
// import ShareButton from '../components/ShareButton';
// import CommentThread from '../components/CommentThread';
// import AddItemModal from '../components/AddItemModal';
// import InviteModal from '../components/InviteModal';
// import ManagePeopleModal from '../components/ManagePeopleModal';

// export default function WishlistView({auth}){
//   const { id } = useParams();
//   const [data,setData] = React.useState(null);
//   const [products,setProducts] = React.useState([]);
//   const [myLists,setMyLists] = React.useState([]);
//   const [showAdd,setShowAdd] = React.useState(false);
//   const [showInvite,setShowInvite] = React.useState(false);
//   const [showManage,setShowManage] = React.useState(false);
//   const [collabs,setCollabs] = React.useState([]);

//   React.useEffect(()=>{
//     if(!auth.token) return;
//     fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
//       .then(r=>r.json()).then(setData);
//     fetch(`${API}/products`).then(r=>r.json()).then(setProducts);
//     fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
//       .then(r=>r.json()).then(setMyLists);
//   },[id,auth.token]);

//   React.useEffect(()=>{
//     if(!auth.token) return;
//     if(!data || data.role !== 'owner') { setCollabs([]); return; }
//     fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
//       .then(async r => r.ok ? r.json() : [])
//       .then(arr => Array.isArray(arr) ? arr : [])
//       .then(setCollabs)
//       .catch(()=>setCollabs([]));
//   }, [id, auth.token, data?.role]);

//   const addProduct = async (p)=>{
//     if(!p) return;
//     const r = await fetch(`${API}/api/wishlists/${id}/items`, {
//       method:'POST',
//       headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
//       body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 })
//     });
//     const item = await r.json();
//     setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}));
//   };

//   if(!data) return <div className="a-container">Loading…</div>;

//   const canComment = ['owner','view_edit','comment_only'].includes(data.role);
//   const canAdd = (data.role==='owner' || data.role==='view_edit');

//   const avatars = (collabs || [])
//     .filter(c => c.role !== 'owner')
//     .slice(0, 6)
//     .map(c => (
//       <div
//         key={c.user_id}
//         className="avatar"
//         title={c.name}
//         aria-label={c.name}
//       >👤</div>
//     ));

//   return (
//     <div className="a-container">
//       <div className="wl-layout">
//         <LeftNav lists={myLists} currentId={id} />
//         <div>
//           <div className="wl-header">
//             <div className="wl-titlebar">
//               {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
//               {(data.role === 'owner' || (collabs && collabs.length)) && (
//                 <div className="row mt-8" style={{ gap: 6 }}>
//                   {avatars}
//                   {data.role==='owner' && (
//                     <>
//                       <button
//                         className="a-button a-button-small"
//                         aria-label="Invite collaborators"
//                         onClick={()=>setShowInvite(true)}
//                         title="Invite collaborators"
//                       >+</button>
//                       <button
//                         className="a-button a-button-small"
//                         aria-label="Manage people"
//                         onClick={()=>setShowManage(true)}
//                         title="Manage people"
//                       >⋯</button>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//             <div className="wl-controls">
//               {canAdd && <button className="a-button a-button-primary" onClick={()=>setShowAdd(true)}>Add item</button>}
//               {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
//             </div>
//           </div>

//           <div className="control-bar">
//             <div className="search">
//               <input className="a-input-text" placeholder="Search this list" />
//             </div>
//             <div className="filters">
//               <label>Sort by:</label>
//               <select defaultValue="default">
//                 <option value="default">Default</option>
//                 <option value="priority">Priority (high to low)</option>
//                 <option value="price-asc">Price (low to high)</option>
//                 <option value="price-desc">Price (high to high)</option>
//               </select>
//             </div>
//           </div>

//           <div className="items-list">
//             {(data.items || []).map(it=>(
//               <div className="row-card" key={it.id}>
//                 <img src={it.product?.image_url} alt="" />
//                 <div className="row-main">
//                   <div className="row-head">
//                     <div>
//                       <div className="item-title">{it.title}</div>
//                       <div className="item-price">${it.product?.price}</div>
//                     </div>
//                   </div>
//                   <CommentThread auth={auth} wid={id} itemId={it.id} canComment={canComment} />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <AddItemModal
//             open={showAdd}
//             onClose={()=>setShowAdd(false)}
//             products={products}
//             onPick={addProduct}
//           />

//           <InviteModal
//             open={showInvite}
//             onClose={()=>setShowInvite(false)}
//             auth={auth}
//             id={id}
//           />

//           <ManagePeopleModal
//             open={showManage}
//             onClose={()=>setShowManage(false)}
//             auth={auth}
//             id={id}
//             onChanged={()=>{
//               fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
//                 .then(async r => r.ok ? r.json() : [])
//                 .then(arr => Array.isArray(arr) ? arr : [])
//                 .then(setCollabs)
//                 .catch(()=>setCollabs([]));
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// apps/web-frontend/src/pages/WishlistView.jsx
// apps/web-frontend/src/pages/WishlistView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../lib/api';
import LeftNav from '../components/LeftNav';
import ShareButton from '../components/ShareButton';
import CommentThread from '../components/CommentThread';
import AddItemModal from '../components/AddItemModal';
import InviteModal from '../components/InviteModal';
import ManagePeopleModal from '../components/ManagePeopleModal';

export default function WishlistView({auth}){
  const { id } = useParams();
  const [data,setData] = React.useState(null);
  const [products,setProducts] = React.useState([]);
  const [myLists,setMyLists] = React.useState([]);
  const [showAdd,setShowAdd] = React.useState(false);
  const [showInvite,setShowInvite] = React.useState(false);
  const [showManage,setShowManage] = React.useState(false);
  const [collabs,setCollabs] = React.useState([]);

  React.useEffect(()=>{
    if(!auth.token) return;
    fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setData);
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts);
    fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setMyLists);
  },[id,auth.token]);

  React.useEffect(()=>{
    if(!auth.token) return;
    if(!data || data.role !== 'owner') { setCollabs([]); return; }
    fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(async r => r.ok ? r.json() : [])
      .then(arr => Array.isArray(arr) ? arr : [])
      .then(list => {
        console.log('WishlistView loaded access:', list);
        setCollabs(list);
      })
      .catch(err=>{
        console.warn('WishlistView access load failed:', err);
        setCollabs([]);
      });
  }, [id, auth.token, data?.role]);

  React.useEffect(()=>{
    console.log('WishlistView collabs state:', collabs);
  }, [collabs]);

  const addProduct = async (p)=>{
    if(!p) return;
    const r = await fetch(`${API}/api/wishlists/${id}/items`, {
      method:'POST',
      headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
      body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 })
    });
    const item = await r.json();
    setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}));
  };

  if(!data) return <div className="a-container">Loading…</div>;

  const canComment = ['owner','view_edit','comment_only'].includes(data.role);
  const canAdd = (data.role==='owner' || data.role==='view_edit');

  const avatars = (collabs || [])
    .filter(c => c.role !== 'owner')
    .slice(0, 6)
    .map(c => {
      const n = c.name || c.display_name || c.user?.public_name || `User ${c.user_id}`;
      return (
        <div
          key={c.user_id}
          className="avatar"
          title={n}
          aria-label={n}
        >👤</div>
      );
    });

  return (
    <div className="a-container">
      <div className="wl-layout">
        <LeftNav lists={myLists} currentId={id} />
        <div>
          <div className="wl-header">
            <div className="wl-titlebar">
              {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
              {(data.role === 'owner' || (collabs && collabs.length)) && (
                <div className="row mt-8" style={{ gap: 6 }}>
                  {avatars}
                  {data.role==='owner' && (
                    <>
                      <button
                        className="a-button a-button-small"
                        aria-label="Invite collaborators"
                        onClick={()=>setShowInvite(true)}
                        title="Invite collaborators"
                      >+</button>
                      <button
                        className="a-button a-button-small"
                        aria-label="Manage people"
                        onClick={()=>setShowManage(true)}
                        title="Manage people"
                      >⋯</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="wl-controls">
              {canAdd && <button className="a-button a-button-primary" onClick={()=>setShowAdd(true)}>Add item</button>}
              {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
            </div>
          </div>

          <div className="control-bar">
            <div className="search">
              <input className="a-input-text" placeholder="Search this list" />
            </div>
            <div className="filters">
              <label>Sort by:</label>
              <select defaultValue="default">
                <option value="default">Default</option>
                <option value="priority">Priority (high to low)</option>
                <option value="price-asc">Price (low to high)</option>
                <option value="price-desc">Price (high to high)</option>
              </select>
            </div>
          </div>

          <div className="items-list">
            {(data.items || []).map(it=>(
              <div className="row-card" key={it.id}>
                <img src={it.product?.image_url} alt="" />
                <div className="row-main">
                  <div className="row-head">
                    <div>
                      <div className="item-title">{it.title}</div>
                      <div className="item-price">${it.product?.price}</div>
                    </div>
                  </div>
                  <CommentThread auth={auth} wid={id} itemId={it.id} canComment={canComment} />
                </div>
              </div>
            ))}
          </div>

          <AddItemModal
            open={showAdd}
            onClose={()=>setShowAdd(false)}
            products={products}
            onPick={addProduct}
          />

          <InviteModal
            open={showInvite}
            onClose={()=>setShowInvite(false)}
            auth={auth}
            id={id}
          />

          <ManagePeopleModal
            open={showManage}
            onClose={()=>setShowManage(false)}
            auth={auth}
            id={id}
            onChanged={()=>{
              fetch(`${API}/api/wishlists/${id}/access`, { headers:{ authorization:`Bearer ${auth.token}` } })
                .then(async r => r.ok ? r.json() : [])
                .then(arr => Array.isArray(arr) ? arr : [])
                .then(list => {
                  console.log('WishlistView refreshed access after change:', list);
                  setCollabs(list);
                })
                .catch(()=>setCollabs([]));
            }}
          />
        </div>
      </div>
    </div>
  );
}