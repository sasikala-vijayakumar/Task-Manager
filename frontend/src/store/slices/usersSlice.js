import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch('/api/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    return data;
  } catch (err) {
    return rejectWithValue({ msg: 'Network error' });
  }
});

export const createUser = createAsyncThunk('users/create', async (userData, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchUsers());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, ...userData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchUsers());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data);
    }
    dispatch(fetchUsers());
    return { id };
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || action.error; })
      .addCase(createUser.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(updateUser.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(deleteUser.rejected, (state, action) => { state.error = action.payload || action.error; });
  }
});

export default usersSlice.reducer;
