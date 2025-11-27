/**
 * Redux Slice - Planilla y pagos del personal (Administrador)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../../services/adminService';

const getRegistroId = (registro) => registro?.id || registro?._id || registro?._id?.toString();

const initialState = {
  registros: [],
  planillas: [],
  estadisticas: null,
  loading: false,
  error: null,
  successMessage: null,
  filtros: {
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    semana: '',
    estado: '',
  },
  colaboradores: [],
  colaboradoresLoading: false,
};

const flattenPlanillas = (planillas = []) =>
  planillas.flatMap((planilla) =>
    Object.values(planilla.semanas || {}).flatMap((semana) =>
      Object.entries(semana.dias || {}).map(([diaKey, dia]) => ({
        ...dia,
        id: dia._id || `${planilla.año}-${planilla.mes}-${semana.semana}-${diaKey}`,
        diaSemana: dia.diaSemana || diaKey,
        semana: semana.semana,
        mes: planilla.mes,
        año: planilla.año,
        colaborador: dia.colaborador || dia.empleado || null,
      }))
    )
  );

export const fetchPagosPlanilla = createAsyncThunk(
  'adminPagos/fetchPlanilla',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getPagosPlanillaRegistros();
      const planillas = response?.data?.planillas || response?.planillas || [];
      return planillas;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al obtener planilla');
    }
  }
);

export const createPagoRegistro = createAsyncThunk(
  'adminPagos/createRegistro',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminService.createOrUpdatePagoPersonal(data);
      return response.data || response.registro || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al crear registro');
    }
  }
);

export const updatePagoRegistro = createAsyncThunk(
  'adminPagos/updateRegistro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminService.updatePagoPersonal(id, data);
      return response.data || response.registro || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al actualizar registro');
    }
  }
);

export const deletePagoRegistro = createAsyncThunk(
  'adminPagos/deleteRegistro',
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deletePagoPersonal(id);
      return id;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al eliminar registro');
    }
  }
);

export const fetchPagosColaboradores = createAsyncThunk(
  'adminPagos/fetchColaboradores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getColaboradores({
        estado: 'activo',
        limit: 100,
        ...params,
      });
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar personal');
    }
  }
);

const adminPagosSlice = createSlice({
  name: 'adminPagos',
  initialState,
  reducers: {
    setAdminPagosFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    clearAdminPagosMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPagosPlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPagosPlanilla.fulfilled, (state, action) => {
        state.loading = false;
        state.planillas = action.payload;
        state.registros = flattenPlanillas(action.payload);
      })
      .addCase(fetchPagosPlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPagoRegistro.fulfilled, (state, action) => {
        state.successMessage = 'Registro creado correctamente';
        state.registros = [action.payload, ...state.registros];
      })
      .addCase(createPagoRegistro.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updatePagoRegistro.fulfilled, (state, action) => {
        state.successMessage = 'Registro actualizado correctamente';
        const updatedId = getRegistroId(action.payload);
        state.registros = state.registros.map((registro) => (getRegistroId(registro) === updatedId ? action.payload : registro));
      })
      .addCase(updatePagoRegistro.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deletePagoRegistro.fulfilled, (state, action) => {
        state.successMessage = 'Registro eliminado';
        state.registros = state.registros.filter((registro) => getRegistroId(registro) !== action.payload);
      })
      .addCase(deletePagoRegistro.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchPagosColaboradores.pending, (state) => {
        state.colaboradoresLoading = true;
      })
      .addCase(fetchPagosColaboradores.fulfilled, (state, action) => {
        state.colaboradoresLoading = false;
        state.colaboradores = action.payload;
      })
      .addCase(fetchPagosColaboradores.rejected, (state, action) => {
        state.colaboradoresLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setAdminPagosFiltros, clearAdminPagosMessages } = adminPagosSlice.actions;
export const selectAdminPagosState = (state) => state.adminPagos;

export default adminPagosSlice.reducer;


