<template>
  <div class="export-container">
    <div class="export-card">
      <h2>📥 Exportar Datos</h2>

      <div class="export-options">
        <!-- Opción 1: Exportar Transacciones -->
        <div class="option">
          <h3>📊 Exportar Transacciones</h3>
          <p>Descarga todas tus transacciones en diferentes formatos</p>
          <div class="option-controls">
            <div>
              <label class="form-label">Tipo</label>
              <select v-model="filters.type" class="form-select form-select-sm">
                <option value="">Todas</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>

            <div>
              <label class="form-label">Desde</label>
              <input v-model="filters.startDate" type="date" class="form-control form-control-sm" />
            </div>

            <div>
              <label class="form-label">Hasta</label>
              <input v-model="filters.endDate" type="date" class="form-control form-control-sm" />
            </div>

            <div>
              <label class="form-label">Formato</label>
              <select v-model="transactionsFormat" class="form-select form-select-sm">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
                <option value="txt">TXT</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-primary"
            @click="exportTransactions"
            :disabled="exporting"
          >
            <span v-if="exporting" class="spinner-border spinner-border-sm me-2"></span>
            {{ exporting ? 'Exportando...' : '⬇️ Descargar' }}
          </button>
        </div>

        <!-- Opción 2: Exportar Resumen -->
        <div class="option">
          <h3>📈 Exportar Resumen</h3>
          <p>Descarga un resumen con totales de ingresos, gastos y balance</p>
          <div class="option-controls">
            <div>
              <label class="form-label">Formato</label>
              <select v-model="summaryFormat" class="form-select form-select-sm">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
                <option value="txt">TXT</option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-success"
            @click="exportSummary"
            :disabled="exporting"
          >
            <span v-if="exporting" class="spinner-border spinner-border-sm me-2"></span>
            {{ exporting ? 'Exportando...' : '⬇️ Descargar Resumen' }}
          </button>
        </div>

        <!-- Opción 3: Exportar Gráficas -->
        <div class="option">
          <h3>📸 Exportar Gráficas</h3>
          <p>Captura las gráficas como imágenes</p>
          <div class="option-controls">
            <div>
              <label class="form-label">Formato</label>
              <select v-model="chartFormat" class="form-select form-select-sm">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label class="form-label">Calidad</label>
              <select v-model="chartQuality" class="form-select form-select-sm">
                <option value="1">Normal</option>
                <option value="2">Alta</option>
                <option value="3">Máxima</option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-info"
            @click="exportCharts"
            :disabled="exporting"
          >
            <span v-if="exporting" class="spinner-border spinner-border-sm me-2"></span>
            {{ exporting ? 'Exportando...' : '📸 Capturar Gráficas' }}
          </button>
        </div>

        <!-- Opción 4: Información -->
        <div class="option info">
          <h3>ℹ️ Información</h3>
          <ul>
            <li>✅ Múltiples formatos disponibles</li>
            <li>✅ Excel compatible con todas las versiones</li>
            <li>✅ PDF con diseño profesional</li>
            <li>✅ Datos seguros y privados</li>
            <li>✅ Las gráficas se exportan como imágenes</li>
          </ul>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="exportSuccess" class="alert alert-success mt-3" role="alert">
        ✅ {{ exportSuccess }}
      </div>

      <!-- Mensaje de error -->
      <div v-if="exportError" class="alert alert-danger mt-3" role="alert">
        ❌ {{ exportError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getTransactions, getTransactionsSummary } from '../services/transactionsService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exporting = ref(false);
const exportSuccess = ref('');
const exportError = ref('');

const filters = ref({
  type: '',
  startDate: '',
  endDate: '',
});

const transactionsFormat = ref('csv');
const summaryFormat = ref('csv');
const chartFormat = ref('png');
const chartQuality = ref('2');

// ===== EXPORTAR TRANSACCIONES (MULTIPLES FORMATOS) =====
const exportTransactions = async () => {
  exporting.value = true;
  exportSuccess.value = '';
  exportError.value = '';

  try {
    const filterParams = {};
    if (filters.value.type) filterParams.type = filters.value.type;
    if (filters.value.startDate) filterParams.startDate = filters.value.startDate;
    if (filters.value.endDate) filterParams.endDate = filters.value.endDate;

    const result = await getTransactions(filterParams);

    if (!result.success) {
      throw new Error(result.error);
    }

    const transactions = result.data;

    if (transactions.length === 0) {
      exportError.value = 'No hay transacciones para exportar';
      return;
    }

    // Preparar datos para exportación
    const exportData = prepareTransactionsData(transactions);
    
    switch (transactionsFormat.value) {
      case 'csv':
        exportToCSV(exportData, 'transacciones.csv');
        break;
      case 'xlsx':
        exportToExcel(exportData, 'transacciones.xlsx', 'Transacciones');
        break;
      case 'json':
        exportToJSON(transactions, 'transacciones.json');
        break;
      case 'txt':
        exportToTXT(exportData, 'transacciones.txt');
        break;
      case 'pdf':
        await exportTransactionsToPDF(exportData, 'transacciones.pdf', 'Lista de Transacciones');
        break;
    }
    
    exportSuccess.value = `✅ ${transactions.length} transacciones exportadas en formato ${transactionsFormat.value.toUpperCase()}`;
  } catch (error) {
    exportError.value = 'Error al exportar: ' + error.message;
  } finally {
    exporting.value = false;
  }
};

// ===== EXPORTAR RESUMEN (MULTIPLES FORMATOS) =====
const exportSummary = async () => {
  exporting.value = true;
  exportSuccess.value = '';
  exportError.value = '';

  try {
    const result = await getTransactionsSummary();

    if (!result.success) {
      throw new Error(result.error);
    }

    const summary = result.data;
    const today = new Date().toLocaleDateString('es-ES');
    const balance = summary.totalIncome - summary.totalExpenses;

    const summaryData = [
      ['RESUMEN FINANCIERO'],
      [`Generado: ${today}`],
      [''],
      ['CONCEPTO', 'MONTO'],
      ['Ingresos Totales', `$${summary.totalIncome?.toFixed(2) || '0.00'}`],
      ['Gastos Totales', `$${summary.totalExpenses?.toFixed(2) || '0.00'}`],
      ['Balance', `$${balance.toFixed(2)}`],
      ['Total de Transacciones', summary.transactionCount || 0]
    ];

    switch (summaryFormat.value) {
      case 'csv':
        exportSummaryToCSV(summary, today, balance);
        break;
      case 'xlsx':
        exportToExcel(summaryData, 'resumen-financiero.xlsx', 'Resumen');
        break;
      case 'pdf':
        await exportSummaryToPDF(summaryData, 'resumen-financiero.pdf', 'Resumen Financiero');
        break;
      case 'txt':
        exportSummaryToTXT(summary, today, balance);
        break;
    }
    
    exportSuccess.value = `✅ Resumen exportado en formato ${summaryFormat.value.toUpperCase()}`;
  } catch (error) {
    exportError.value = 'Error al exportar: ' + error.message;
  } finally {
    exporting.value = false;
  }
};

// ===== EXPORTAR GRÁFICAS =====
const exportCharts = async () => {
  exporting.value = true;
  exportSuccess.value = '';
  exportError.value = '';

  try {
    // Buscar los canvas de las gráficas
    const charts = [
      { id: 'chart-pie', name: 'distribucion-gastos' },
      { id: 'chart-bar', name: 'ingresos-vs-gastos' },
      { id: 'chart-line', name: 'tendencia-balance' }
    ];

    const capturedImages = [];

    for (const chart of charts) {
      const canvas = document.getElementById(chart.id);
      if (canvas) {
        let quality = 1;
        if (chartQuality.value === '2') quality = 1.5;
        if (chartQuality.value === '3') quality = 2;
        
        const dataUrl = canvas.toDataURL(`image/${chartFormat.value === 'jpg' ? 'jpeg' : 'png'}`, quality);
        capturedImages.push({ name: chart.name, dataUrl });
      }
    }

    if (capturedImages.length === 0) {
      throw new Error('No se encontraron gráficas para exportar');
    }

    if (chartFormat.value === 'pdf') {
      // Exportar a PDF múltiples páginas
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      let pageIndex = 0;
      
      for (const image of capturedImages) {
        if (pageIndex > 0) pdf.addPage();
        
        const img = new Image();
        img.src = image.dataUrl;
        
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 250;
            const imgHeight = (img.height * imgWidth) / img.width;
            pdf.addImage(img, chartFormat.value === 'jpg' ? 'JPEG' : 'PNG', 20, 20, imgWidth, imgHeight);
            resolve();
          };
        });
        
        pageIndex++;
      }
      
      pdf.save('graficas-financieras.pdf');
    } else {
      // Exportar cada gráfica como imagen individual
      for (const image of capturedImages) {
        const link = document.createElement('a');
        link.download = `${image.name}.${chartFormat.value}`;
        link.href = image.dataUrl;
        link.click();
      }
    }
    
    exportSuccess.value = `✅ ${capturedImages.length} gráficas exportadas en formato ${chartFormat.value.toUpperCase()}`;
  } catch (error) {
    exportError.value = 'Error al exportar gráficas: ' + error.message;
  } finally {
    exporting.value = false;
  }
};

// ===== FUNCIONES AUXILIARES =====

const prepareTransactionsData = (transactions) => {
  let balance = 0;
  return transactions.map(t => {
    if (t.type === 'ingreso') {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
    
    return {
      'Fecha': new Date(t.date).toLocaleDateString('es-ES'),
      'Tipo': t.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      'Categoría': t.category,
      'Descripción': t.description || '',
      'Monto': t.amount.toFixed(2),
      'Balance': balance.toFixed(2)
    };
  });
};

const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });
  
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
};

const exportToExcel = (data, filename, sheetName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

const exportToJSON = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, filename, 'application/json');
};

const exportToTXT = (data, filename) => {
  let txt = '';
  
  if (Array.isArray(data) && data.length > 0) {
    // Datos de transacciones
    const headers = Object.keys(data[0]);
    txt = headers.join('\t') + '\n';
    txt += '='.repeat(80) + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      txt += values.join('\t') + '\n';
    });
  }
  
  downloadFile(txt, filename, 'text/plain;charset=utf-8');
};

const exportTransactionsToPDF = async (data, filename, title) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  // Título
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);
  
  // Fecha
  pdf.setFontSize(10);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
  
  if (data && data.length > 0) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header] || ''));
    
    autoTable(pdf, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
  }
  
  pdf.save(filename);
};

const exportSummaryToPDF = async (data, filename, title) => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  // Título
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);
  
  // Fecha
  pdf.setFontSize(10);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
  
  if (data && data.length > 0) {
    autoTable(pdf, {
      body: data,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 12, cellPadding: 5 },
      headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] }
    });
  }
  
  pdf.save(filename);
};

const exportSummaryToCSV = (summary, today, balance) => {
  let csv = 'RESUMEN FINANCIERO\n';
  csv += `Generado,${today}\n\n`;
  csv += 'CONCEPTO,MONTO\n';
  csv += `Ingresos Totales,$${summary.totalIncome?.toFixed(2) || '0.00'}\n`;
  csv += `Gastos Totales,$${summary.totalExpenses?.toFixed(2) || '0.00'}\n`;
  csv += `Balance,$${balance.toFixed(2)}\n`;
  csv += `Total de Transacciones,${summary.transactionCount || 0}\n`;
  
  downloadFile(csv, 'resumen-financiero.csv', 'text/csv;charset=utf-8');
};

const exportSummaryToTXT = (summary, today, balance) => {
  let txt = 'RESUMEN FINANCIERO\n';
  txt += '='.repeat(40) + '\n';
  txt += `Generado: ${today}\n\n`;
  txt += `Ingresos Totales: $${summary.totalIncome?.toFixed(2) || '0.00'}\n`;
  txt += `Gastos Totales: $${summary.totalExpenses?.toFixed(2) || '0.00'}\n`;
  txt += `Balance: $${balance.toFixed(2)}\n`;
  txt += `Total de Transacciones: ${summary.transactionCount || 0}\n`;
  
  downloadFile(txt, 'resumen-financiero.txt', 'text/plain;charset=utf-8');
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.export-container {
  padding: 20px;
}

.export-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.export-card h2 {
  color: #333;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}

.option {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.option:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.option h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.option p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.option.info {
  background: #e7f3ff;
  border-color: #004085;
}

.option.info ul {
  margin: 0;
  padding-left: 20px;
}

.option.info li {
  color: #004085;
  margin-bottom: 8px;
  font-size: 13px;
}

.option-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.option-controls > div {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 13px;
}

.form-select-sm,
.form-control-sm {
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.form-select-sm:focus,
.form-control-sm:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  border: none;
  color: white;
}

.btn-info:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  border-radius: 8px;
  border: none;
}

@media (max-width: 768px) {
  .export-options {
    grid-template-columns: 1fr;
  }

  .option-controls {
    grid-template-columns: 1fr;
  }
}
</style>