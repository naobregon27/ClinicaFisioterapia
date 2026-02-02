/**
 * Utilidad para exportar datos a PDF
 * Usa jsPDF y jsPDF-AutoTable para generar PDFs del lado del cliente
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuración de fuentes y estilos
const COLORS = {
  primary: '#0d4d61',
  secondary: '#6fb0b8',
  success: '#48bb78',
  error: '#f56565',
  warning: '#f6ad55',
  lightGray: '#f7fafc',
  darkGray: '#2d3748',
};

/**
 * Agrega el encabezado estándar al PDF
 */
const addHeader = (doc, title) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Rectángulo de encabezado
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(
    `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
    pageWidth / 2,
    30,
    { align: 'center' }
  );
};

/**
 * Agrega el pie de página al PDF
 */
const addFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Clínica de Fisioterapia - Sistema de Gestión',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
};

/**
 * Exporta la planilla diaria a PDF
 */
export const exportPlanillaDiariaPDF = (datos) => {
  const doc = new jsPDF();
  
  // Encabezado
  addHeader(doc, 'Planilla Diaria de Sesiones');
  
  // Información de la fecha
  doc.setFontSize(14);
  doc.setTextColor(COLORS.darkGray);
  doc.setFont(undefined, 'bold');
  doc.text(`Fecha: ${datos.fecha}`, 14, 55);
  
  // Tabla de sesiones
  if (datos.sesiones && datos.sesiones.length > 0) {
    doc.autoTable({
      startY: 65,
      head: [['Orden', 'Paciente', 'DNI', 'Hora', 'Duración', 'Monto', 'Estado', 'Pago']],
      body: datos.sesiones.map((sesion) => [
        sesion.orden || '-',
        sesion.paciente || '-',
        sesion.dni || '-',
        `${sesion.horaEntrada} - ${sesion.horaSalida}`,
        sesion.duracion || '-',
        `$${sesion.monto?.toLocaleString() || 0}`,
        sesion.estado || '-',
        sesion.pagado === 'Sí' ? '✓' : '✗',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 25 },
        7: { cellWidth: 15, halign: 'center' },
      },
    });
  }
  
  // Totales
  const finalY = doc.lastAutoTable.finalY || 65;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  
  // Rectángulo de totales
  doc.setFillColor(COLORS.lightGray);
  doc.rect(14, finalY + 10, 182, 40, 'F');
  
  doc.setTextColor(COLORS.darkGray);
  doc.text(`Total Sesiones: ${datos.totales?.sesiones || 0}`, 20, finalY + 25);
  doc.text(`Ingresos: $${datos.totales?.ingresos?.toLocaleString() || 0}`, 20, finalY + 35);
  doc.text(`Pendientes: $${datos.totales?.pendientes?.toLocaleString() || 0}`, 20, finalY + 45);
  
  // Pie de página
  addFooter(doc);
  
  // Descargar
  doc.save(`Planilla_Diaria_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

/**
 * Exporta la ficha de paciente a PDF
 */
export const exportFichaPacientePDF = (datos) => {
  const doc = new jsPDF();
  
  // Encabezado
  addHeader(doc, 'Ficha de Paciente');
  
  // Información del paciente
  doc.setFontSize(14);
  doc.setTextColor(COLORS.darkGray);
  doc.setFont(undefined, 'bold');
  doc.text('Datos del Paciente', 14, 55);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const paciente = datos.paciente;
  let yPos = 65;
  
  const infoPaciente = [
    ['Nombre Completo:', paciente.nombreCompleto],
    ['DNI:', paciente.dni],
    ['Fecha de Nacimiento:', paciente.fechaNacimiento],
    ['Edad:', `${paciente.edad} años`],
    ['Género:', paciente.genero],
    ['Teléfono:', paciente.telefono],
    ['Email:', paciente.email || '-'],
    ['Dirección:', paciente.direccion || '-'],
    ['Obra Social:', paciente.obraSocial || '-'],
    ['Diagnóstico:', paciente.diagnostico || '-'],
    ['Estado:', paciente.estado],
    ['Fecha de Alta:', paciente.fechaAlta],
  ];
  
  infoPaciente.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 14, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), 70, yPos);
    yPos += 8;
  });
  
  // Estadísticas
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Estadísticas', 14, yPos);
  yPos += 10;
  
  doc.setFillColor(COLORS.lightGray);
  doc.rect(14, yPos, 182, 30, 'F');
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Sesiones: ${paciente.estadisticas?.totalSesiones || 0}`, 20, yPos + 10);
  doc.text(`Total Abonado: $${paciente.estadisticas?.totalAbonado?.toLocaleString() || 0}`, 20, yPos + 18);
  doc.text(`Saldo Pendiente: $${paciente.estadisticas?.saldoPendiente?.toLocaleString() || 0}`, 20, yPos + 26);
  
  // Historial de sesiones (nueva página si es necesario)
  if (datos.sesiones && datos.sesiones.length > 0) {
    doc.addPage();
    addHeader(doc, 'Historial de Sesiones');
    
    doc.autoTable({
      startY: 55,
      head: [['Fecha', 'Sesión #', 'Profesional', 'Estado', 'Monto', 'Pagado']],
      body: datos.sesiones.map((sesion) => [
        sesion.fecha,
        sesion.numeroSesion,
        sesion.profesional || '-',
        sesion.estado,
        `$${sesion.monto?.toLocaleString() || 0}`,
        sesion.pagado === 'Sí' ? '✓' : '✗',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
    });
    
    addFooter(doc);
  }
  
  // Descargar
  doc.save(`Ficha_Paciente_${paciente.dni}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

/**
 * Exporta datos de evolución a PDF
 */
export const exportEvolucionPDF = (datos) => {
  const doc = new jsPDF();
  
  // Encabezado
  addHeader(doc, 'Evolución del Paciente');
  
  // Información del paciente
  doc.setFontSize(14);
  doc.setTextColor(COLORS.darkGray);
  doc.setFont(undefined, 'bold');
  doc.text(`Paciente: ${datos.paciente?.nombre}`, 14, 55);
  doc.text(`DNI: ${datos.paciente?.dni}`, 14, 63);
  
  // Estadísticas generales
  let yPos = 75;
  doc.setFontSize(12);
  doc.text('Estadísticas de Evolución', 14, yPos);
  yPos += 10;
  
  doc.setFillColor(COLORS.lightGray);
  doc.rect(14, yPos, 182, 45, 'F');
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Total de Sesiones: ${datos.estadisticas?.totalSesiones || 0}`, 20, yPos + 10);
  doc.text(
    `Dolor: Inicial ${datos.estadisticas?.dolor?.inicial} → Final ${datos.estadisticas?.dolor?.final} (Mejora: ${datos.estadisticas?.dolor?.mejoraPorcentual}%)`,
    20,
    yPos + 20
  );
  doc.text(
    `Movilidad: ${datos.estadisticas?.movilidad?.inicial} → ${datos.estadisticas?.movilidad?.final}`,
    20,
    yPos + 30
  );
  doc.text(
    `Estado General: ${datos.estadisticas?.estadoGeneral?.inicial} → ${datos.estadisticas?.estadoGeneral?.final}`,
    20,
    yPos + 40
  );
  
  // Historial de sesiones
  if (datos.sesiones && datos.sesiones.length > 0) {
    yPos += 60;
    
    doc.autoTable({
      startY: yPos,
      head: [['Fecha', 'Sesión #', 'Dolor', 'Movilidad', 'Estado', 'Observaciones']],
      body: datos.sesiones.map((sesion) => [
        format(new Date(sesion.fecha), 'dd/MM/yyyy', { locale: es }),
        sesion.numeroSesion,
        sesion.dolor || '-',
        sesion.movilidad || '-',
        sesion.estadoGeneral || '-',
        sesion.observaciones || '-',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        5: { cellWidth: 50 },
      },
    });
  }
  
  // Pie de página
  addFooter(doc);
  
  // Descargar
  doc.save(`Evolucion_${datos.paciente?.dni}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export default {
  exportPlanillaDiariaPDF,
  exportFichaPacientePDF,
  exportEvolucionPDF,
};
