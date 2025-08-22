import React from 'react';
import { API } from '../lib/api';

export default function useAuth(){
  const [token,setToken] = React.useState(localStorage.getItem('token')||'');
  const [me,setMe] = React.useState(null);

  React.useEffect(()=>{
    if(!token){ 
      setMe(null); 
      return; 
    }
    // Clear me state immediately when token changes
    setMe(null);
    // Add a small delay to ensure the state is cleared before fetching new data
    const timeoutId = setTimeout(() => {
      fetch(`${API}/api/me`, { headers:{ authorization: `Bearer ${token}` } })
        .then(r=>r.json()).then(setMe).catch(()=>setMe(null));
    }, 0);
    
    return () => clearTimeout(timeoutId);
  },[token]);

  return { token, setToken, me };
}
