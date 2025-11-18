/**
 * Redux Slice para UI
 * Maneja el estado de la interfaz de usuario (sidebar, modales, tema, etc.)
 */

import { createSlice } from '@reduxjs/toolkit';

// Estado inicial
const initialState = {
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Modales
  modales: {
    nuevoPaciente: false,
    editarPaciente: false,
    nuevaSesion: false,
    editarSesion: false,
    registrarPago: false,
    confirmarAccion: false,
    altaMedica: false,
  },
  
  // Data para modales
  modalData: null,
  
  // Tema
  tema: localStorage.getItem('tema') || 'light',
  
  // Loading global (para operaciones que bloquean toda la UI)
  globalLoading: false,
  
  // Página actual
  paginaActual: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ========== SIDEBAR ==========
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // ========== MODALES ==========
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      if (state.modales.hasOwnProperty(modal)) {
        state.modales[modal] = true;
        state.modalData = data || null;
      }
    },
    closeModal: (state, action) => {
      const modal = action.payload;
      if (state.modales.hasOwnProperty(modal)) {
        state.modales[modal] = false;
        state.modalData = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modales).forEach(modal => {
        state.modales[modal] = false;
      });
      state.modalData = null;
    },
    
    // ========== TEMA ==========
    toggleTema: (state) => {
      state.tema = state.tema === 'light' ? 'dark' : 'light';
      localStorage.setItem('tema', state.tema);
    },
    setTema: (state, action) => {
      state.tema = action.payload;
      localStorage.setItem('tema', action.payload);
    },
    
    // ========== LOADING GLOBAL ==========
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // ========== PÁGINA ACTUAL ==========
    setPaginaActual: (state, action) => {
      state.paginaActual = action.payload;
    },
  },
});

// Exportar acciones
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  toggleTema,
  setTema,
  setGlobalLoading,
  setPaginaActual,
} = uiSlice.actions;

// Selectores
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModales = (state) => state.ui.modales;
export const selectModalData = (state) => state.ui.modalData;
export const selectTema = (state) => state.ui.tema;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectPaginaActual = (state) => state.ui.paginaActual;

// Exportar reducer
export default uiSlice.reducer;


