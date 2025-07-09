import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState<string>('');

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    return (
        <header className="header">
            <nav>
                <NavLink to="/add-category" className={activeLink === '/add-category' ? 'active' : ''}>Add Category</NavLink>
                <NavLink to="/add-sub-category" className={activeLink === '/add-sub-category' ? 'active' : ''}>Add Sub-Category</NavLink>
                <NavLink to="/additional-details" className={activeLink === '/additional-details' ? 'active' : ''}>Additional Details</NavLink>
                <NavLink to="/add-reference-data" className={activeLink === '/add-reference-data' ? 'active' : ''}>Add Reference Data</NavLink>
                <NavLink to="/complete-sub-category" className={activeLink === '/complete-sub-category' ? 'active' : ''}>Add Sub Category Details</NavLink>
            </nav>
        </header>
    );
};

export default Header;
