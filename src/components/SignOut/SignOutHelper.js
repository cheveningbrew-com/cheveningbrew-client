import { googleLogout } from '@react-oauth/google';
import { clearAuthData } from '../../utils/auth';
import { SignOut_clearUser } from '../../services/api';

export const handleSignOut = (logout, navigate, user_id) => {
  SignOut_clearUser(user_id);
  googleLogout();
  logout();
  clearAuthData();
  navigate('/');
};
