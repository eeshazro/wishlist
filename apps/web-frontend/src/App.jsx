import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './amazon.css';

import useAuth from './hooks/useAuth';
import Header from './components/Header';
import MyLists from './pages/MyLists';
import FriendsLists from './pages/FriendsLists';
import WishlistView from './pages/WishlistView';
import InviteAccept from './pages/InviteAccept';
import AmazonHeader from './components/AmazonHeader';


export default function App(){
  const auth = useAuth();
  return (
    <>
      <AmazonHeader userName={ 'Eesha'} cartCount={1} />
      <Header auth={auth} />
      <Routes>
        <Route path="/" element={<MyLists auth={auth} />} />
        <Route path="/wishlist" element={<MyLists auth={auth} />} />
        <Route path="/wishlist/friends" element={<FriendsLists auth={auth} />} />
        <Route path="/wishlist/:id" element={<WishlistView auth={auth} />} />
        <Route path="/invite/:token" element={<InviteAccept auth={auth} />} />
      </Routes>
    </>
  );
}
