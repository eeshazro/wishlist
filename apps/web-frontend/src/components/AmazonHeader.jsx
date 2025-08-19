// apps/web-frontend/src/components/AmazonHeader.jsx
import React from 'react';
import '../amazon.css';

export default function AmazonHeader({
  userName = 'Eesha',
  cartCount = 1,
  zipLabel = 'Deerfield 100',
}) {
  return (
    <header className="amz-header">
    {/* TOP NAV */}
    <div className="amz-header-topnav">
        <div className="amz-header-container amz-header-row amz-header-topnav-row">
        <div className="amz-header-left amz-header-row">
            <button className="amz-hamburger" aria-label="Open menu">
            <span /><span /><span />
            </button>

            <a className="amz-header-logo" href="#" aria-label="Amazon Home">
            <span className="amz-header-logo-word">amazon</span>
            <span className="amz-header-logo-smile" aria-hidden>︶</span>
            <span className="amz-header-logo-dot" aria-hidden>.</span>
            <span className="amz-header-logo-tld" aria-hidden>com</span>
            </a>

            <div className="amz-header-location">
            <div className="amz-header-pin" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
            </div>
            <div className="amz-header-location-text">
                <div className="amz-header-muted">Deliver to {userName}</div>
                <div className="amz-header-strong">{zipLabel}</div>
            </div>
            </div>
        </div>

        {/* Search */}
        <div className="amz-header-search">
            <select className="amz-header-search-scope" aria-label="Search in">
            <option>All</option>
            </select>
            <input className="amz-header-search-input" placeholder="Search Amazon" aria-label="Search Amazon" />
            <button className="amz-header-search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </button>
        </div>

        {/* Right cluster */}
        <div className="amz-header-right amz-header-row">
            <a className="amz-header-lang" href="#" aria-label="Language EN">
            <span className="amz-header-flag" aria-hidden>🇺🇸</span> EN
            </a>
            <a className="amz-header-account" href="#">
            <span className="amz-header-muted">Hello, {userName}</span>
            <span className="amz-header-strong">Account &amp; Lists</span>
            </a>
            <a className="amz-header-returns" href="#">
            <span className="amz-header-muted">Returns</span>
            <span className="amz-header-strong">&amp; Orders</span>
            </a>
            <a className="amz-header-cart" href="#" aria-label="Cart">
            <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.17 14h8.94a2 2 0 0 0 1.94-1.5l1.6-6.4A1 1 0 0 0 18.7 4H6.3L5.8 2H2v2h2l3 11z"/></svg>
            <span className="amz-header-cart-count">{cartCount}</span>
            <span className="amz-header-strong">Cart</span>
            </a>
        </div>
        </div>
    </div>

    {/* DARK SUBNAV */}
    <nav className="amz-header-subnav">
        <div className="amz-header-container amz-header-row amz-header-subnav-row">
        <a href="#" className="amz-header-subnav-item"><span className="amz-header-burger">≡</span> All</a>
        <a href="#" className="amz-header-subnav-item">Amazon Haul</a>
        <a href="#" className="amz-header-subnav-item">Same-Day Delivery</a>
        <a href="#" className="amz-header-subnav-item">Medical Care ▾</a>
        <a href="#" className="amz-header-subnav-item">Luxury Stores</a>
        <a href="#" className="amz-header-subnav-item">Customer Service</a>
        <a href="#" className="amz-header-subnav-item">Amazon Basics</a>
        <a href="#" className="amz-header-subnav-item">Buy Again</a>
        <a href="#" className="amz-header-subnav-item">Browsing History</a>
        <a href="#" className="amz-header-subnav-item">Pet Supplies</a>
        <div className="amz-header-grow" />
        <a href="#" className="amz-header-subnav-item">Hello, {userName}</a>
        </div>
    </nav>

    {/* WHITE "LISTS" RAIL */}
    <div className="amz-header-tertiary">
        <div className="amz-header-container amz-header-row amz-header-tertiary-row">
        <a href="#" className="amz-header-tertiary-link amz-header-tertiary-active">Your Lists</a>
        <a href="#" className="amz-header-tertiary-link">Gift Finder</a>
        <a href="#" className="amz-header-tertiary-link">Baby Registry</a>
        <a href="#" className="amz-header-tertiary-link">Birthday Gift List</a>
        <a href="#" className="amz-header-tertiary-link">Wedding Registry</a>
        <a href="#" className="amz-header-tertiary-link">Amazon Gift Cards</a>
        <a href="#" className="amz-header-tertiary-link">Custom Gift List</a>
        <a href="#" className="amz-header-tertiary-link">Lists Help</a>
        </div>
    </div>
    </header>

  );
}
