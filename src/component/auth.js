import axiosInstance from "./utility";

/**
 * Handles the user logout process.
 * - Calls the backend to invalidate the refresh token (HttpOnly cookie).
 * - Clears client-side access token from localStorage.
 * - Redirects the user to the login page.
 */
export const logout = async () => {
  try {
    // Call your Django backend's logout endpoint.
    // The browser will automatically send the HttpOnly 'refresh_token' cookie with this request
    // because your axiosInstance is configured with `withCredentials: true`.
    console.log("Attempting to log out on backend...");
    // Assuming your Django logout endpoint is accessible via /api/logout/
    await axiosInstance.post('/logout/');
    console.log("Backend logout successful.");
  } catch (error) {
    // Log any errors from the backend logout call.
    // It might return an error if the refresh token was already invalid/missing,
    // but we still want to clear client-side state regardless.
    console.error("Error during backend logout:", error.response?.data || error.message);
  } finally {
    // Always clear client-side tokens and redirect, regardless of backend success/failure.
    console.log("Clearing client-side tokens and redirecting.");
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_in');
    // Optionally, clear any other user-specific data from localStorage/sessionStorage

    // Redirect to the login page.
    // Using window.location.href for a full page reload ensures all React state is reset.
    window.location.href = '/login';
  }
};
