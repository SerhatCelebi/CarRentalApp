import React, { createContext, useContext, useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { jwtUtils } from '../utils/jwt';

const MemberContext = createContext();

export const useMemberContext = () => {
    const context = useContext(MemberContext);
    if (!context) {
        throw new Error('useMemberContext must be used within a MemberProvider');
    }
    return context;
};

export const MemberProvider = ({ children }) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const token = jwtUtils.getToken();
            if (token && !jwtUtils.isTokenExpired(token)) {
                const memberData = jwtUtils.getUserFromToken(token);
                if (memberData) {
                    setMember(memberData);
                    setIsAuthenticated(true);
                    
                    // Optionally refresh member data from server
                    try {
                        const freshMemberData = await memberService.getProfile();
                        if (freshMemberData) {
                            setMember(freshMemberData);
                        }
                    } catch (error) {
                        console.warn('Failed to refresh member data:', error);
                    }
                }
            } else {
                // Token is expired or doesn't exist
                logout();
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await memberService.login(credentials);
            
            if (response.success && response.token) {
                jwtUtils.setToken(response.token);
                setMember(response.member);
                setIsAuthenticated(true);
                return { success: true, member: response.member };
            } else {
                return { success: false, error: response.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (memberData) => {
        try {
            setLoading(true);
            const response = await memberService.register(memberData);
            
            if (response.success && response.token) {
                jwtUtils.setToken(response.token);
                setMember(response.member);
                setIsAuthenticated(true);
                return { success: true, member: response.member };
            } else {
                return { success: false, error: response.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        jwtUtils.removeToken();
        setMember(null);
        setIsAuthenticated(false);
        setLoading(false);
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await memberService.updateProfile(profileData);
            if (response.success) {
                setMember(prev => ({ ...prev, ...response.member }));
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    };

    const refreshToken = async () => {
        try {
            const response = await memberService.refreshToken();
            if (response.success && response.token) {
                jwtUtils.setToken(response.token);
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            logout();
            return false;
        }
    };

    const isLoggedIn = () => {
        return isAuthenticated && member && !jwtUtils.isTokenExpired(jwtUtils.getToken());
    };

    const hasRole = (role) => {
        return member?.roles?.includes(role) || false;
    };

    const isAdmin = () => {
        return hasRole('Admin');
    };

    const isVip = () => {
        return member?.isVip || member?.membershipLevel === 'Gold' || member?.membershipLevel === 'Platinum';
    };

    const getMembershipLevel = () => {
        return member?.membershipLevel || 'Bronze';
    };

    const getLoyaltyPoints = () => {
        return member?.loyaltyPoints || 0;
    };

    const contextValue = {
        // State
        member,
        loading,
        isAuthenticated,
        
        // Auth methods
        login,
        register,
        logout,
        updateProfile,
        refreshToken,
        
        // Utility methods
        isLoggedIn,
        hasRole,
        isAdmin,
        isVip,
        getMembershipLevel,
        getLoyaltyPoints,
        
        // Member info
        memberLevel: getMembershipLevel(),
        loyaltyPoints: getLoyaltyPoints(),
        isVipMember: isVip()
    };

    return (
        <MemberContext.Provider value={contextValue}>
            {children}
        </MemberContext.Provider>
    );
};
