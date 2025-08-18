import React from 'react';
import { Link } from 'react-router-dom';

export default function LeftNav({lists = [], currentId}){
  return (
    <div className="wl-left">
      <div>
        {lists.map(l=>{
          const selected = String(l.id)===String(currentId);
          return (
            <div className={`wl-list ${selected?'selected':''}`} key={l.id}>
              <Link to={`/wishlist/${l.id}`}>
                <div className="wl-title">{l.name}</div>
                <div className="wl-meta">{l.privacy}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
