import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import { useTheme } from './hooks/useTheme';
import { initDB, getCurrentUser, logoutUser } from './store/db';

import SplashScreen from './components/layout/SplashScreen';
import PageLoader from './components/layout/PageLoader';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HeroCanvas from './components/home/HeroCanvas';
import FeaturedGrid from './components/home/FeaturedGrid';
import StatsBar from './components/home/StatsBar';
import WhyChooseUs from './components/home/WhyChooseUs';
import LandlordCTA from './components/home/LandlordCTA';

import ListingsView from './components/listings/ListingsView';
import DetailView from './components/detail/DetailView';
import AuthView from './components/auth/AuthView';
import LandlordView from './components/landlord/LandlordView';

import AboutView from './components/pages/AboutView';
import ContactView from './components/pages/ContactView';

export default function App() {
    const [activeView, setActiveView] = useState('home');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showSplash, setShowSplash] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        initDB();

        const currentUser = getCurrentUser();

        if (currentUser) {
            setUser(currentUser);
        }

        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        setToast({
            message,
            type
        });

        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    const navigate = useCallback((view, listing = null) => {
        setPageLoading(true);

        if (listing) {
            setSelectedListing(listing);
        }

        setTimeout(() => {
            setActiveView(view);
            setPageLoading(false);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 300);
    }, []);

    const handleLogin = useCallback(
        (loggedInUser) => {
            setUser(loggedInUser);
            showToast('Welcome back!');
            navigate('home');
        },
        [navigate, showToast]
    );

    const handleLogout = useCallback(() => {
        logoutUser();
        setUser(null);
        showToast('You have been logged out.');
        navigate('home');
    }, [navigate, showToast]);

    const handleListingSelect = useCallback(
        (listing) => {
            setSelectedListing(listing);
            navigate('detail', listing);
        },
        [navigate]
    );

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <div className={`app ${theme}`}>
            <Header
                activeView={activeView}
                onNavigate={navigate}
                user={user}
                onLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            {pageLoading && <PageLoader />}

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <main id="app-root">

                {/* Home page */}
                {activeView === 'home' && (
                    <>
                        <HeroCanvas onNavigate={navigate} />

                        <FeaturedGrid
                            onListingSelect={handleListingSelect}
                            onNavigate={navigate}
                        />

                        <StatsBar />

                        <WhyChooseUs />

                        <LandlordCTA onNavigate={navigate} />
                    </>
                )}

                {/* Listings page */}
                {activeView === 'listings' && (
                    <ListingsView
                        onListingSelect={handleListingSelect}
                        onNavigate={navigate}
                    />
                )}

                {/* Property details */}
                {activeView === 'detail' && selectedListing && (
                    <DetailView
                        listing={selectedListing}
                        onNavigate={navigate}
                        onToast={showToast}
                    />
                )}

                {/* Authentication */}
                {activeView === 'auth' && (
                    <AuthView
                        onLogin={handleLogin}
                        onNavigate={navigate}
                        onToast={showToast}
                    />
                )}

                {/* Landlord dashboard */}
                {activeView === 'landlord' && (
                    <LandlordView
                        user={user}
                        onNavigate={navigate}
                        onToast={showToast}
                    />
                )}

                {/* About page */}
                {activeView === 'about' && (
                    <AboutView onNavigate={navigate} />
                )}

                {/* Contact page */}
                {activeView === 'contact' && (
                    <ContactView
                        onNavigate={navigate}
                        onToast={showToast}
                    />
                )}

            </main>

            <Footer onNavigate={navigate} />
        </div>
    );
}


