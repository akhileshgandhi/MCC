import { toast } from 'react-toastify';

export const handleLogout = async () => {
  localStorage.clear();
  toast.info('Signing you out securely...', { autoClose: 2000 });
  window.location.href = "/_layouts/15/SignOut.aspx";
};
