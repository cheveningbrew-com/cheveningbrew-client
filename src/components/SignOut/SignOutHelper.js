import { googleLogout } from '@react-oauth/google';
import { clearAuthData } from '../../utils/auth';
import { SignOut_clearUser, Delete_suser } from '../../services/api';
import { getUserId } from '../../services/api';

export const handleSignOut = async (logout, navigate, user_id) => {
  const uid = user_id || getUserId();

  try {
    const deleteResponse = await Delete_suser(uid);

    if (deleteResponse.message.includes("deleted")) {
      console.log("User and data deleted");
    }
  } catch (error) {
    if (
      error.message.includes("Some interviews are not completed") ||
      error.message.includes("Active attempts found")
    ) {
      console.log("Deletion blocked, fallback to signout only");
    }
  }

  try {
    await SignOut_clearUser(uid);
  } catch (e) {
    console.warn("Fallback signout failed, forcing client-side logout");
  }

  // Always logout client-side
  googleLogout();
  logout();
  clearAuthData();
  navigate('/');
};