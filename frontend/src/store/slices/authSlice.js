// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk for login
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    return data; // { user, accessToken, refreshToken }
  } catch (err) {
    return rejectWithValue({ msg: 'Network error' });
  }
});

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null; state.accessToken = null; state.refreshToken = null; state.status = 'idle'; state.error = null;
      try { localStorage.removeItem('user'); localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); } catch (e) {}
    },
    loadFromStorage(state) {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        const a = localStorage.getItem('accessToken');
        const r = localStorage.getItem('refreshToken');
        if (u) state.user = u;
        if (a) state.accessToken = a;
        if (r) state.refreshToken = r;
      } catch (e) {}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        try { localStorage.setItem('user', JSON.stringify(payload.user)); localStorage.setItem('accessToken', payload.accessToken); localStorage.setItem('refreshToken', payload.refreshToken); } catch (e) {}
      })
      .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || action.error; });
  }
});

export const { logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
