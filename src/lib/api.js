// API service for connecting SnapSeat frontend to the Express/MongoDB backend
const API_BASE = 'http://localhost:3000/api';

// Helper for making JSON requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => null);
    return {
      status: res.status,
      ok: res.ok,
      ...data,
    };
  } catch (error) {
    console.warn(`API call to ${endpoint} failed:`, error.message);
    return null;
  }
}

// 1. Movies
export async function getMovies() {
  const res = await request('/movies');
  return res && res.success ? res.movies : null;
}

export async function getMovieById(id) {
  const res = await request(`/movies/${id}`);
  return res && res.success ? res.movie : null;
}

export async function createMovie(movieData) {
  const res = await request('/movies', {
    method: 'POST',
    body: JSON.stringify(movieData),
  });
  return res;
}

// 2. Theatres & Screens
export async function getTheatres() {
  const res = await request('/theatres');
  return res && res.success ? res.theatres : [];
}

export async function getScreens() {
  const res = await request('/screens');
  return res && res.success ? res.screens : [];
}

// 3. Shows & Seats
export async function getShows() {
  const res = await request('/shows');
  return res;
}

export async function getShowSeats(showId) {
  const res = await request(`/shows/${showId}/seats`);
  return res && res.success ? res : null;
}

export async function createShow(showData) {
  const res = await request('/shows', {
    method: 'POST',
    body: JSON.stringify(showData),
  });
  return res;
}

// 4. Bookings
export async function createBooking({ show, seats }) {
  const res = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({ show, seats }),
  });
  return res;
}

export async function getMyBookings() {
  const res = await request('/bookings/my');
  return res && res.success ? res.bookings : null;
}

export async function getAllBookings() {
  const res = await request('/bookings');
  return res;
}

// 5. Users (Admin)
export async function getUsers() {
  const res = await request('/users');
  return res;
}

// 6. Auth
export async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res && res.success && res.token) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    window.dispatchEvent(new Event('auth-change'));
  }
  return res;
}

export async function register(name, email, password) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return res;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export async function getMe() {
  const res = await request('/auth/me');
  if (res && res.success && res.user) {
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  } else if (res && (res.status === 401 || res.status === 403)) {
    logout();
    return null;
  }
  return getCurrentUser();
}
