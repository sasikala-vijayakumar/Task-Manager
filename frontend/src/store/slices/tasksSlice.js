// src/store/slices/tasksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTasks = createAsyncThunk('tasks/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch('/api/tasks', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    return data;
  } catch (err) {
    return rejectWithValue({ msg: 'Network error' });
  }
});

export const startTask = createAsyncThunk('tasks/start', async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/tasks/${id}/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchTasks());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const stopTask = createAsyncThunk('tasks/stop', async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/tasks/${id}/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchTasks());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const createTask = createAsyncThunk('tasks/create', async (taskData, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(taskData)
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchTasks());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, ...taskData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(taskData)
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    dispatch(fetchTasks());
    return data;
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data);
    }
    dispatch(fetchTasks());
    return { id };
  } catch (err) { return rejectWithValue({ msg: 'Network error' }); }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchTasks.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || action.error; })
      .addCase(startTask.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(stopTask.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(createTask.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(updateTask.rejected, (state, action) => { state.error = action.payload || action.error; })
      .addCase(deleteTask.rejected, (state, action) => { state.error = action.payload || action.error; });
  }
});

export default tasksSlice.reducer;
