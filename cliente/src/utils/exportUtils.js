/**
 * Utilidades para exportar datos a Excel e imprimir
 */

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Exporta datos a Excel
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {String} filename - Nombre del archivo (sin extensión)
 * @param {Array} columns - Array de objetos con { key, label } para las columnas
 */
export const exportToExcel = (data, filename = 'export', columns = null) => {
  try {
    // Si se proporcionan columnas, mapear los datos
    let exportData = data;
    
    if (columns && columns.length > 0) {
      exportData = data.map((item) => {
        const row = {};
        columns.forEach((col) => {
          const value = getNestedValue(item, col.key);
          // Si el valor es un objeto, intentar convertirlo a string
          let formattedValue = formatValue(value, col.format);
          if (formattedValue === null || formattedValue === undefined) {
            formattedValue = '';
          }
          row[col.label] = formattedValue;
        });
        return row;
      });
    }

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ajustar ancho de columnas
    const colWidths = [];
    if (columns && columns.length > 0) {
      columns.forEach(() => {
        colWidths.push({ wch: 20 });
      });
    } else if (data.length > 0) {
      Object.keys(data[0]).forEach(() => {
        colWidths.push({ wch: 20 });
      });
    }
    ws['!cols'] = colWidths;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // Generar nombre de archivo con fecha
    const fecha = format(new Date(), 'yyyy-MM-dd_HH-mm-ss', { locale: es });
    const fileName = `${filename}_${fecha}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw error;
  }
};

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 */
const getNestedValue = (obj, path) => {
  if (!path) return '';
  try {
    const value = path.split('.').reduce((current, prop) => {
      if (current === null || current === undefined) return null;
      return current[prop];
    }, obj);
    return value ?? '';
  } catch (error) {
    return '';
  }
};

/**
 * Formatea un valor según el tipo especificado
 */
const formatValue = (value, formatType) => {
  if (value === null || value === undefined) return '';
  
  // Si formatType es una función, usarla directamente
  if (typeof formatType === 'function') {
    return formatType(value);
  }
  
  switch (formatType) {
    case 'date':
      if (value instanceof Date) {
        return format(value, 'dd/MM/yyyy', { locale: es });
      }
      if (typeof value === 'string') {
        try {
          return format(new Date(value), 'dd/MM/yyyy', { locale: es });
        } catch {
          return value;
        }
      }
      return value;
    case 'datetime':
      if (value instanceof Date) {
        return format(value, 'dd/MM/yyyy HH:mm', { locale: es });
      }
      if (typeof value === 'string') {
        try {
          return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch {
          return value;
        }
      }
      return value;
    case 'currency':
      return typeof value === 'number' ? `$${value.toLocaleString('es-AR')}` : value;
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('es-AR') : value;
    case 'boolean':
      return value ? 'Sí' : 'No';
    default:
      return value;
  }
};

/**
 * Prepara la página para imprimir
 * @param {String} title - Título del documento
 * @param {Function} printFunction - Función que contiene el contenido a imprimir
 */
export const printPage = (title = 'Documento', printFunction) => {
  // Crear ventana de impresión
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para imprimir');
    return;
  }

  // Escribir contenido HTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4 landscape;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #0d4d61;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #0d4d61;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .no-print {
              display: none;
            }
          }
          @media screen {
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #0d4d61;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #0d4d61;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Fecha de impresión: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
        </div>
        ${printFunction()}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Esperar a que se cargue el contenido y luego imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Cerrar ventana después de imprimir (opcional)
      // printWindow.close();
    }, 250);
  };
};

/**
 * Genera HTML de tabla para imprimir
 */
export const generateTableHTML = (data, columns, title = '') => {
  if (!data || data.length === 0) {
    return '<p>No hay datos para mostrar</p>';
  }

  let html = '';
  if (title) {
    html += `<h2>${title}</h2>`;
  }
  
  html += '<table>';
  
  // Encabezados
  html += '<thead><tr>';
  columns.forEach((col) => {
    html += `<th>${col.label}</th>`;
  });
  html += '</tr></thead>';
  
  // Filas
  html += '<tbody>';
  data.forEach((item) => {
    html += '<tr>';
    columns.forEach((col) => {
      const value = getNestedValue(item, col.key);
      const formattedValue = formatValue(value, col.format);
      // Escapar HTML para seguridad
      const safeValue = String(formattedValue || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `<td>${safeValue}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table>';
  
  return html;
};

