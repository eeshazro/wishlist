// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'

// const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// function useAuth(){
//   const [token,setToken] = React.useState(localStorage.getItem('token')||'')
//   const [me,setMe] = React.useState(null)
//   React.useEffect(()=>{
//     if(!token) return setMe(null)
//     fetch(`${API}/api/me`, { headers:{ authorization: `Bearer ${token}` } }).then(r=>r.json()).then(setMe)
//   },[token])
//   return { token, setToken, me }
// }

// function Header({auth}){
//   const users = ['alice','bob','carol','dave']
//   const login = async (u)=>{
//     const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ user: u }) })
//     const data = await r.json()
//     if(data.accessToken){ localStorage.setItem('token', data.accessToken); auth.setToken(data.accessToken) }
//   }
//   return <div style={{display:'flex',gap:12,alignItems:'center',padding:12, borderBottom:'1px solid #eee'}}>
//     <Link to="/wishlist">My Wishlists</Link>
//     <Link to="/wishlist/friends">Friends</Link>
//     <div style={{marginLeft:'auto'}}>
//       <select defaultValue="" onChange={e=>e.target.value && login(e.target.value)}>
//         <option value="">Log in as…</option>
//         {users.map(u=><option key={u} value={u}>{u}</option>)}
//       </select>
//       {auth.me && <span style={{marginLeft:8}}>Hello, {auth.me.public_name}</span>}
//     </div>
//   </div>
// }

// function MyLists({auth}){
//   const [lists,setLists] = React.useState([])
//   const [name,setName] = React.useState('New List')
//   React.useEffect(()=>{
//     if(!auth.token) return
//     fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } }).then(r=>r.json()).then(setLists)
//   },[auth.token])
//   const createList = async ()=>{
//     const r = await fetch(`${API}/api/wishlists`, { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}`}, body: JSON.stringify({ name, privacy:'Shared' }) })
//     const a = await r.json(); setLists([...lists,a])
//   }
//   return <div style={{padding:16}}>
//     <h2>My Wishlists</h2>
//     {!auth.token && <p>Log in to continue.</p>}
//     {auth.token && <div>
//       <div style={{margin:'12px 0'}}>
//         <input value={name} onChange={e=>setName(e.target.value)} />
//         <button onClick={createList} style={{marginLeft:8}}>Create</button>
//       </div>
//       <ul>{lists.map(l=><li key={l.id}><Link to={`/wishlist/${l.id}`}>{l.name}</Link></li>)}</ul>
//     </div>}
//   </div>
// }

// function FriendsLists({auth}){
//   const [lists,setLists] = React.useState([])
//   React.useEffect(()=>{
//     if(!auth.token) return
//     fetch(`${API}/api/wishlists/friends`, { headers:{ authorization:`Bearer ${auth.token}` } }).then(r=>r.json()).then(setLists)
//   },[auth.token])
//   return <div style={{padding:16}}>
//     <h2>Friends' Wishlists</h2>
//     <ul>{lists.map(l=><li key={l.id}><Link to={`/wishlist/${l.id}`}>{l.name}</Link> <em>({l.role})</em></li>)}</ul>
//   </div>
// }

// function InviteAccept({auth}){
//   const { token } = useParams()
//   const [invite,setInvite] = React.useState(null)
//   const nav = useNavigate()
//   React.useEffect(()=>{
//     fetch(`${API}/api/invites/${token}`).then(r=>r.json()).then(setInvite)
//   },[token])
//   const accept = async ()=>{
//     await fetch(`${API}/api/invites/${token}/accept`, { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` }, body: JSON.stringify({ role:'view_only' }) })
//     nav(`/wishlist/${invite.wishlist_id}`)
//   }
//   if(!invite) return <div style={{padding:16}}>Loading…</div>
//   return <div style={{padding:16}}>
//     <h2>Invite</h2>
//     <p>Wishlist ID: {invite.wishlist_id}</p>
//     {auth.token ? <button onClick={accept}>Accept Invite</button> : <p>Log in to accept.</p>}
//   </div>
// }

// function WishlistView({auth}){
//   const { id } = useParams()
//   const [data,setData] = React.useState(null)
//   const [products,setProducts] = React.useState([])
//   const [prod,setProd] = React.useState(1)
//   React.useEffect(()=>{
//     if(!auth.token) return
//     fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } }).then(r=>r.json()).then(setData)
//     fetch(`${API}/products`).then(r=>r.json()).then(setProducts)
//   },[id,auth.token])
//   const add = async ()=>{
//     const p = products.find(p=>p.id==prod)
//     const r = await fetch(`${API}/api/wishlists/${id}/items`, { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` }, body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 }) })
//     const item = await r.json()
//     setData({...data, items:[...data.items, {...item, product: p}]})
//   }
//   if(!data) return <div style={{padding:16}}>Loading…</div>
//   return <div style={{padding:16}}>
//     <h2>{data.wishlist.name} <small>({data.role})</small></h2>
//     <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
//       <select value={prod} onChange={e=>setProd(parseInt(e.target.value))}>
//         {products.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
//       </select>
//       {(data.role==='owner' || data.role==='view_edit') && <button onClick={add}>Add Product</button>}
//       {(data.role==='owner') && <ShareButton auth={auth} id={id} />}
//     </div>
//     <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12}}>
//       {data.items.map(it=>(
//         <div key={it.id} style={{border:'1px solid #ddd', padding:8, borderRadius:8}}>
//           <img src={it.product?.image_url} style={{width:'100%', height:140, objectFit:'cover', borderRadius:6}} />
//           <div style={{fontWeight:600, marginTop:8}}>{it.title}</div>
//           <div>${it.product?.price}</div>
//         </div>
//       ))}
//     </div>
//   </div>
// }

// function ShareButton({auth, id}){
//   const [link,setLink] = React.useState(null)
//   const make = async ()=>{
//     const r = await fetch(`${API}/api/wishlists/${id}/invites`, { method:'POST', headers:{ authorization:`Bearer ${auth.token}` } })
//     const data = await r.json()
//     setLink(data.inviteLink)
//   }
//   return <span>
//     <button onClick={make}>Generate Invite</button>
//     {link && <input readOnly value={link} style={{marginLeft:8, width:320}}/>}
//   </span>
// }

// function App(){
//   const auth = useAuth()
//   return <BrowserRouter>
//     <Header auth={auth} />
//     <Routes>
//       <Route path="/" element={<MyLists auth={auth} />} />
//       <Route path="/wishlist" element={<MyLists auth={auth} />} />
//       <Route path="/wishlist/friends" element={<FriendsLists auth={auth} />} />
//       <Route path="/wishlist/:id" element={<WishlistView auth={auth} />} />
//       <Route path="/invite/:token" element={<InviteAccept auth={auth} />} />
//     </Routes>
//   </BrowserRouter>
// }

// createRoot(document.getElementById('root')).render(<App />)




import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import './amazon.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function useAuth(){
  const [token,setToken] = React.useState(localStorage.getItem('token')||'')
  const [me,setMe] = React.useState(null)
  React.useEffect(()=>{
    if(!token){ setMe(null); return }
    fetch(`${API}/api/me`, { headers:{ authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(setMe).catch(()=>setMe(null))
  },[token])
  return { token, setToken, me }
}

function Tabs(){
  const loc = useLocation()
  const isMine = loc.pathname.startsWith('/wishlist') && !loc.pathname.startsWith('/wishlist/friends')
  const isFriends = loc.pathname.startsWith('/wishlist/friends')
  return (
    <ul className="a-tabs" role="tablist">
      <li className={`a-tab-heading ${isMine ? 'a-active' : ''}`} role="presentation">
        <Link to="/wishlist" role="tab" aria-selected={isMine ? 'true':'false'}><div role="heading" aria-level="1">Your Lists</div></Link>
      </li>
      <li className={`a-tab-heading ${isFriends ? 'a-active' : ''}`} role="presentation">
        <Link to="/wishlist/friends" role="tab" aria-selected={isFriends ? 'true':'false'}>Your Friends</Link>
      </li>
      <div className="a-text-right" style={{marginLeft:'auto'}}>
        <Link className="a-link-normal" to="https://www.amazon.com/gp/help/customer/display.html?nodeId=897204" target="_blank">List help</Link>
      </div>
    </ul>
  )
}

function Header({auth}){
  const users = ['alice','bob','carol','dave']
  const login = async (u)=>{
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ user: u }) })
    const data = await r.json()
    if(data.accessToken){ localStorage.setItem('token', data.accessToken); auth.setToken(data.accessToken) }
  }
  return (
    <div className="a-container">
      <Tabs />
      <div className="row mb-12 mt-12">
        <div className="mr-auto"></div>
        <select defaultValue="" onChange={e=>e.target.value && login(e.target.value)} className="a-input-text" style={{height:36}}>
          <option value="">Log in as…</option>
          {users.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
        {auth.me && <span style={{marginLeft:8}}>Hello, <strong>{auth.me.public_name}</strong></span>}
      </div>
    </div>
  )
}

function LeftNav({lists, currentId}){
  return (
    <div className="wl-left">
      <div>
        {lists.map(l=>{
          const selected = String(l.id)===String(currentId)
          return (
            <div className={`wl-list ${selected?'selected':''}`} key={l.id}>
              <Link to={`/wishlist/${l.id}`}>
                <div className="wl-title">{l.name}</div>
                <div className="wl-meta">{l.privacy}</div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MyLists({auth}){
  const [lists,setLists] = React.useState([])
  const [name,setName] = React.useState('New List')
  React.useEffect(()=>{
    if(!auth.token) return
    fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setLists)
  },[auth.token])

  const createList = async ()=>{
    const r = await fetch(`${API}/api/wishlists`, { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}`}, body: JSON.stringify({ name, privacy:'Shared' }) })
    const a = await r.json(); setLists([...lists,a])
  }

  return (
    <div className="a-container">
      {!auth.token && <div className="a-alert">Log in to continue.</div>}
      {auth.token &&
        <div className="wl-layout">
          <LeftNav lists={lists} />
          <div>
            <div className="wl-header">
              <div className="wl-titlebar">Your Lists</div>
              <div className="wl-controls">
                <input className="a-input-text" value={name} onChange={e=>setName(e.target.value)} />
                <button className="a-button a-button-primary" onClick={createList}>Create a List</button>
              </div>
            </div>

            <div className="control-bar">
              <div className="search">
                <input className="a-input-text" placeholder="Search lists" />
              </div>
              <div className="filters">
                <label>Sort by:</label>
                <select><option>Default</option><option>Name</option><option>Created</option></select>
              </div>
            </div>

            <div className="items-grid">
              {lists.map(l=>(
                <div className="item-card" key={l.id}>
                  <div className="item-title">{l.name}</div>
                  <div className="mt-8"><span className="badge">{l.privacy}</span></div>
                  <div className="mt-12">
                    <Link className="a-link-normal" to={`/wishlist/${l.id}`}>Open list</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}
    </div>
  )
}

function FriendsLists({auth}){
  const [lists,setLists] = React.useState([])
  React.useEffect(()=>{
    if(!auth.token) return
    fetch(`${API}/api/wishlists/friends`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setLists)
  },[auth.token])

  return (
    <div className="a-container">
      <div className="wl-layout">
        <LeftNav lists={lists} />
        <div>
          <div className="wl-header">
            <div className="wl-titlebar">Your Friends</div>
          </div>
          <div className="items-grid">
            {lists.map(l=>(
              <div className="item-card" key={l.id}>
                <div className="item-title">{l.name}</div>
                <div className="mt-8"><span className="badge">{l.role}</span></div>
                <div className="mt-12">
                  <Link className="a-link-normal" to={`/wishlist/${l.id}`}>Open list</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InviteAccept({auth}){
  const { token } = useParams()
  const [invite,setInvite] = React.useState(null)
  const [error,setError] = React.useState(null)
  const [busy,setBusy] = React.useState(false)
  const nav = useNavigate()

  React.useEffect(()=>{
    setError(null)
    fetch(`${API}/api/invites/${token}`)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load invite');
        return r.json()
      })
      .then(setInvite)
      .catch(e => setError(e.message))
  }, [token])

  const accept = async ()=>{
    try{
      setBusy(true)
      const r = await fetch(`${API}/api/invites/${token}/accept`, {
        method:'POST',
        headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` },
        body: JSON.stringify({ role:'view_only' })
      })
      const data = await r.json()
      if(!r.ok) throw new Error(data.error || 'Failed to accept')
      nav(`/wishlist/${data.wishlist_id}`)
    }catch(e){
      setError(e.message)
    }finally{
      setBusy(false)
    }
  }

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
  )
}

function WishlistView({auth}){
  const { id } = useParams()
  const [data,setData] = React.useState(null)
  const [products,setProducts] = React.useState([])
  const [prod,setProd] = React.useState(1)
  const [myLists,setMyLists] = React.useState([])

  React.useEffect(()=>{
    if(!auth.token) return
    fetch(`${API}/api/wishlists/${id}`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setData)
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts)
    fetch(`${API}/api/wishlists/mine`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setMyLists)
  },[id,auth.token])

  const add = async ()=>{
    const p = products.find(p=>p.id==prod)
    const r = await fetch(`${API}/api/wishlists/${id}/items`, { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${auth.token}` }, body: JSON.stringify({ product_id: p.id, title: p.title, priority: 1 }) })
    const item = await r.json()
    setData(d=>({...d, items:[...(d?.items||[]), {...item, product: p}]}))
  }

  if(!data) return <div className="a-container">Loading…</div>

  return (
    <div className="a-container">
      <div className="wl-layout">
        <LeftNav lists={myLists} currentId={id} />
        <div>
          <div className="wl-header">
            <div className="wl-titlebar">
              {data.wishlist.name} <span className="badge">{data.role}</span> <span className="badge">{data.wishlist.privacy}</span>
            </div>
            <div className="wl-controls">
              <select value={prod} onChange={e=>setProd(parseInt(e.target.value))} className="a-input-text">
                {products.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              {(data.role==='owner' || data.role==='view_edit') && <button className="a-button a-button-primary" onClick={add}>Add item</button>}
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
                <option value="price-desc">Price (high to low)</option>
              </select>
            </div>
          </div>

          <div className="items-grid">
            {data.items.map(it=>(
              <div className="item-card" key={it.id}>
                <img src={it.product?.image_url} alt="" />
                <div className="item-title">{it.title}</div>
                <div className="item-price">${it.product?.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareButton({auth, id}){
  const [link,setLink] = React.useState(null)
  const [busy,setBusy] = React.useState(false)
  const make = async ()=>{
    setBusy(true)
    try{
      const r = await fetch(`${API}/api/wishlists/${id}/invites`, { method:'POST', headers:{ authorization:`Bearer ${auth.token}` } })
      const data = await r.json()
      if(!r.ok) throw new Error(data.error || 'Failed')
      setLink(data.inviteLink)
    } finally{
      setBusy(false)
    }
  }
  return (
    <div className="invite-box">
      <button className="a-button" onClick={make} disabled={busy}>{busy?'Generating…':'Invite'}</button>
      {link && <input className="a-input-text mono" readOnly value={link} />}
    </div>
  )
}

function App(){
  const auth = useAuth()
  return <BrowserRouter>
    <Header auth={auth} />
    <Routes>
      <Route path="/" element={<MyLists auth={auth} />} />
      <Route path="/wishlist" element={<MyLists auth={auth} />} />
      <Route path="/wishlist/friends" element={<FriendsLists auth={auth} />} />
      <Route path="/wishlist/:id" element={<WishlistView auth={auth} />} />
      <Route path="/invite/:token" element={<InviteAccept auth={auth} />} />
    </Routes>
  </BrowserRouter>
}

createRoot(document.getElementById('root')).render(<App />)
