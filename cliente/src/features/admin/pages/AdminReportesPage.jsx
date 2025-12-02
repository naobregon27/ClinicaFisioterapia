import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import adminService from '../../../services/adminService';

const normalizeApiResponse = (payload) => payload?.data ?? payload;

const porcentaje = (valor, total) => {
  if (!total || valor === undefined || valor === null) return 0;
  return Math.round((valor / total) * 100);
};

const metricCard = (title, value, subtitle) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AdminReportesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sistema, setSistema] = useState(null);
  const [pagos, setPagos] = useState(null);
  const [auditoria, setAuditoria] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchReportes = async () => {
      try {
        setLoading(true);
        const [sistemaRes, pagosRes, auditoriaRes] = await Promise.all([
          adminService.getEstadisticas(),
          adminService.getPagosEstadisticas({
            año: new Date().getFullYear(),
            mes: new Date().getMonth() + 1,
          }),
          adminService.getAuditoriaEstadisticas(),
        ]);

        if (!active) return;
        setSistema(normalizeApiResponse(sistemaRes));
        setPagos(normalizeApiResponse(pagosRes));
        setAuditoria(normalizeApiResponse(auditoriaRes));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'No se pudieron cargar los reportes.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReportes();

    return () => {
      active = false;
    };
  }, []);

  const auditoriaTopUsuarios = useMemo(() => auditoria?.topUsuarios || [], [auditoria]);

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Generando reportes..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reportes y Estadísticas
          </Typography>
          <Typography color="text.secondary">Visión integral del sistema, pagos y auditoría.</Typography>
        </Box>
      </Box>

      {error && (
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(211,47,47,0.3)', mb: 3 }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Sistema */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Usuarios y Sesiones
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              {metricCard('Usuarios totales', sistema?.usuarios?.total ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Pacientes registrados', sistema?.pacientes?.total ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Sesiones registradas', sistema?.sesiones?.total ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Ingresos por sesiones', `$${sistema?.ingresos?.total?.toLocaleString() || 0}`)}
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Usuarios por rol
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                {Object.entries(sistema?.usuarios?.porRol || {}).map(([rol, cantidad]) => (
                  <Chip key={rol} label={`${rol}: ${cantidad}`} />
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Usuarios por estado
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                {Object.entries(sistema?.usuarios?.porEstado || {}).map(([estado, cantidad]) => (
                  <Chip key={estado} label={`${estado}: ${cantidad}`} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Pagos */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Planilla de Pagos del Personal
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              {metricCard('Monto total', `$${pagos?.totalMonto?.toLocaleString() || 0}`, 'Mes en curso')}
            </Grid>
            <Grid item xs={12} md={4}>
              {metricCard('Registros creados', pagos?.totalRegistros ?? 0, 'Movimientos diarios')}
            </Grid>
            <Grid item xs={12} md={4}>
              {metricCard('Registros pagados', pagos?.porEstado?.pagado ?? 0)}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Distribución por colaborador
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(pagos?.distribucion || {}).map(([clave, monto]) => (
              <Grid item xs={12} md={4} key={clave}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {clave.toUpperCase()}
                    </Typography>
                    <Typography variant="h6">${monto?.toLocaleString() || 0}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={porcentaje(monto, pagos?.totalMonto || 0)}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {(!pagos?.distribucion || Object.keys(pagos.distribucion).length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No hay datos de distribución disponibles.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Auditoría */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Auditoría del Sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              {metricCard('Acciones totales', auditoria?.totalAcciones ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Acciones exitosas', auditoria?.porEstado?.exitoso ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Acciones fallidas', auditoria?.porEstado?.fallido ?? 0)}
            </Grid>
            <Grid item xs={12} md={3}>
              {metricCard('Usuarios monitoreados', auditoriaTopUsuarios.length)}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Acciones por tipo
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {Object.entries(auditoria?.porAccion || {}).map(([accion, cantidad]) => (
              <Chip key={accion} label={`${accion}: ${cantidad}`} />
            ))}
            {(!auditoria?.porAccion || Object.keys(auditoria?.porAccion || {}).length === 0) && (
              <Typography variant="body2" color="text.secondary">
                Aún no hay datos.
              </Typography>
            )}
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Top usuarios más activos
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditoriaTopUsuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Sin actividad registrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {auditoriaTopUsuarios.map((usuario) => (
                <TableRow key={usuario.id || usuario.usuarioId}>
                  <TableCell>{usuario.nombreCompleto || usuario.nombre || 'Sin nombre'}</TableCell>
                  <TableCell>{usuario.rol || '-'}</TableCell>
                  <TableCell align="right">{usuario.totalAcciones || usuario.total || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminReportesPage;



