import React from 'react';
import { Link } from 'react-router-dom';
import { API } from '../lib/api';
import LeftNav from '../components/LeftNav';

export default function FriendsLists({auth}){
  const [lists,setLists] = React.useState([]);

  React.useEffect(()=>{
    if(!auth.token) return;
    fetch(`${API}/api/wishlists/friends`, { headers:{ authorization:`Bearer ${auth.token}` } })
      .then(r=>r.json()).then(setLists);
  },[auth.token]);

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
  );
}
