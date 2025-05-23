import { googleLogout } from '@react-oauth/google';
import { clearAuthData } from '../../utils/auth';
import { signOutUser } from '../../services/api';

export const handleSignOut = (logout, navigate) => {
  signOutUser();
  googleLogout();
  logout();
  clearAuthData();
  navigate('/');
};