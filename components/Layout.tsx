import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="text-xl font-bold hover:text-gray-200">Defect Tracker</Link>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-4 items-center">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-hover ${isActive('/dashboard') ? 'bg-primary-hover' : ''}`}>Projects</Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/manage-access" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-hover">Manage Access</Link>
                                    )}
                                    <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-hover flex items-center gap-2">
                                        <User size={16} /> Profile
                                    </Link>
                                    <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-hover flex items-center gap-2">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hover:bg-primary-hover px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                    <Link to="/register" className="hover:bg-primary-hover px-3 py-2 rounded-md text-sm font-medium">Register</Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-primary-hover focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary border-t border-primary-hover">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Projects</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/manage-access" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Manage Access</Link>
                                )}
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Profile</Link>
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Login</Link>
                                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-hover">Register</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
            
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>

            <footer className="bg-white border-t py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Defect Tracker. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;