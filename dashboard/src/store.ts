import { configureStore, createSlice } from '@reduxjs/toolkit';

/**
 * Store mínima do dashboard (Redux Toolkit) — placeholder do EPIC 0.
 * No EPIC 1/2 vira a store de auth + resumo/gráficos.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: { busPings: 0 },
  reducers: {
    registerBusPing: (state) => {
      state.busPings += 1;
    },
  },
});

export const { registerBusPing } = uiSlice.actions;

export const store = configureStore({
  reducer: { ui: uiSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
