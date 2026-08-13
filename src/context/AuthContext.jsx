import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateProfile
} from '../firebase';
import { profileApi } from '../api/profileApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMongoProfile = async (baseUser) => {
    try {
      const dbProfile = await profileApi.getProfile();
      if (dbProfile) {
        setUser(prev => {
          if (!prev) return baseUser;
          return {
            ...prev,
            name: dbProfile.name || prev.name || baseUser.name,
            avatar: dbProfile.avatarUrl !== undefined && dbProfile.avatarUrl !== '' ? dbProfile.avatarUrl : (prev.avatar || baseUser.avatar),
            dbProfile
          };
        });
      }
    } catch (err) {
      console.warn('MongoDB profile fetch notice:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const baseUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Store Owner',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || '',
          storeName: 'MerchHQ Store',
          role: 'Admin'
        };
        setUser(baseUser);
        fetchMongoProfile(baseUser);
      } else {
        const saved = localStorage.getItem('merchhq_user');
        const savedAuth = localStorage.getItem('merchhq_auth');
        if (savedAuth === 'true' && saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      const dbProfile = await profileApi.getProfile();
      if (dbProfile) {
        setUser(prev => {
          if (!prev) return null;
          const updatedUser = {
            ...prev,
            name: dbProfile.name || prev.name,
            avatar: dbProfile.avatarUrl !== undefined ? dbProfile.avatarUrl : prev.avatar,
            dbProfile
          };
          localStorage.setItem('merchhq_user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        return dbProfile;
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email, password, rememberMe = true) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: res.user.uid,
      name: res.user.displayName || email.split('@')[0],
      email: res.user.email,
      avatar: res.user.photoURL || '',
      storeName: 'MerchHQ Store',
      role: 'Admin'
    };
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('merchhq_user', JSON.stringify(userData));
      localStorage.setItem('merchhq_auth', 'true');
    }
    fetchMongoProfile(userData);
    return userData;
  };

  const signUpWithEmail = async (fullName, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user) {
      await updateProfile(res.user, { displayName: fullName });
    }
    const userData = {
      uid: res.user.uid,
      name: fullName,
      email,
      avatar: '',
      storeName: 'MerchHQ Store',
      role: 'Admin'
    };
    setUser(userData);
    localStorage.setItem('merchhq_user', JSON.stringify(userData));
    localStorage.setItem('merchhq_auth', 'true');
    fetchMongoProfile(userData);
    return userData;
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const userData = {
      uid: res.user.uid,
      name: res.user.displayName || 'Google User',
      email: res.user.email,
      avatar: res.user.photoURL || '',
      storeName: 'MerchHQ Store',
      role: 'Admin'
    };
    setUser(userData);
    localStorage.setItem('merchhq_user', JSON.stringify(userData));
    localStorage.setItem('merchhq_auth', 'true');
    fetchMongoProfile(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    localStorage.removeItem('merchhq_auth');
    localStorage.removeItem('merchhq_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
