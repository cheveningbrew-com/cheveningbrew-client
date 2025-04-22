import { googleLogout } from '@react-oauth/google';
import { clearAuthData } from '../../utils/auth';
import { SignOut_clearUser } from '../../services/api';

export const handleSignOut = (logout, navigate, email) => {
  SignOut_clearUser("email");
  googleLogout();
  logout();
  clearAuthData();
  navigate('/');
};
