import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Pagination,
} from '@mui/material';
import {
  fetchAuditoriaAcciones,
  fetchAuditoriaEstadisticas,
  setAuditoriaFiltros,
  selectAdminAuditoriaState,
} from '../slices/adminAuditoriaSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const accionOptions = [
  { value: '', label: 'Todas las acciones' },
  { value: 'crear', label: 'Crear' },
  { value: 'actualizar', label: 'Actualizar' },
  { value: 'eliminar', label: 'Eliminar' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'cambiar_estado', label: 'Cambiar estado' },
];

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'exitoso', label: 'Exitoso' },
  { value: 'fallido', label: 'Fallido' },
];

const AdminAuditoriaPage = () => {
  const dispatch = useDispatch();
  const { acciones, estadisticas, filtros, loading, pagination } = useSelector(selectAdminAuditoriaState);

  useEffect(() => {
    dispatch(fetchAuditoriaAcciones(filtros));
  }, [dispatch, filtros]);

  useEffect(() => {
    dispatch(fetchAuditoriaEstadisticas());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(
      setAuditoriaFiltros({
        ...filtros,
        [key]: value,
        page: key === 'page' ? value : 1,
      })
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Auditoría del sistema
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Monitorea todas las acciones críticas en tiempo real.
      </Typography>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Usuario ID / Email"
                fullWidth
                value={filtros.usuario}
                onChange={(e) => handleFilterChange('usuario', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Acción" fullWidth value={filtros.accion} onChange={(e) => handleFilterChange('accion', e.target.value)}>
                {accionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Estado"
                fullWidth
                value={filtros.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                {estadoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Recurso"
                fullWidth
                value={filtros.recurso}
                onChange={(e) => handleFilterChange('recurso', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha desde"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filtros.fechaDesde}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha hasta"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filtros.fechaHasta}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Cargando acciones..." />
      ) : (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total acciones
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {estadisticas?.totales || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Exitosas
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {estadisticas?.exitosas || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fallidas
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {estadisticas?.fallidas || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuarios activos
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {estadisticas?.usuariosActivos || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {acciones.map((accion) => (
                  <TableRow key={accion._id || accion.id} hover>
                    <TableCell>{accion.createdAt ? new Date(accion.createdAt).toLocaleString() : '--'}</TableCell>
                    <TableCell>
                      <Stack direction="column">
                        <Typography fontWeight={600}>{accion.usuario?.nombre || accion.usuarioNombre || 'Sistema'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accion.usuario?.email || accion.usuarioEmail || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{accion.accion}</TableCell>
                    <TableCell>
                      <Stack direction="column">
                        <Typography fontWeight={600}>{accion.recurso?.tipo || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accion.recurso?.nombre || accion.recurso?.id}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{accion.descripcion || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={accion.estado || 'exitoso'}
                        color={accion.estado === 'fallido' ? 'error' : 'success'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {acciones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron registros con los filtros aplicados.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                color="primary"
                page={pagination.page}
                count={pagination.totalPages || 1}
                onChange={(_, value) => handleFilterChange('page', value)}
                shape="rounded"
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminAuditoriaPage;





