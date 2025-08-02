import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Devocional, TopicalStudy } from "./firestore";

// Función para dar formato a la fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Función auxiliar para manejar múltiples páginas cortando el contenido
const addImageToPDF = (pdf: jsPDF, canvas: HTMLCanvasElement) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Calcular el ancho escalado manteniendo la proporción
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pageWidth / imgWidth;
  const scaledWidth = pageWidth;
  const scaledHeight = imgHeight * ratio;
  
  // Calcular cuánta altura de la imagen cabe en una página
  const pageContentHeight = pageHeight;
  const imgHeightPerPage = pageContentHeight / ratio; // Altura en píxeles de la imagen original que cabe en una página
  
  let srcY = 0; // Posición Y de donde empezar a cortar en la imagen original
  let pageNumber = 0;
  
  while (srcY < imgHeight) {
    if (pageNumber > 0) {
      pdf.addPage();
    }
    
    // Calcular cuánta altura tomar de la imagen original para esta página
    const remainingHeight = imgHeight - srcY;
    const heightToTake = Math.min(imgHeightPerPage, remainingHeight);
    
    // Crear un canvas temporal para la porción de esta página
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = imgWidth;
    tempCanvas.height = heightToTake;
    
    // Copiar la porción correspondiente de la imagen original
    tempCtx.drawImage(
      canvas,
      0, srcY, imgWidth, heightToTake, // Fuente: x, y, width, height
      0, 0, imgWidth, heightToTake     // Destino: x, y, width, height
    );
    
    // Convertir a imagen y añadir al PDF
    const pageImgData = tempCanvas.toDataURL('image/png');
    const scaledHeightForThisPage = heightToTake * ratio;
    
    pdf.addImage(pageImgData, 'PNG', 0, 0, scaledWidth, scaledHeightForThisPage);
    
    srcY += heightToTake;
    pageNumber++;
  }
};

// Función principal para exportar a PDF (versión mejorada)
export const exportDevocionalToPDF = async (devocional: Devocional) => {
  // 1. Crear un contenedor temporal para el contenido del PDF
  const pdfContainer = document.createElement("div");
  pdfContainer.style.position = "absolute";
  pdfContainer.style.left = "-9999px";
  pdfContainer.style.width = "800px";
  pdfContainer.style.padding = "20px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.color = "#333";
  pdfContainer.style.backgroundColor = "#fff";

  // 2. Construir el HTML del contenido del PDF
  let contentHTML = `
    <div style="border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
      <h1 style="font-size: 28px; margin: 0; color: #1a73e8;">Devocional Bíblico</h1>
      <p style="font-size: 16px; margin: 5px 0 0;">${formatDate(
        devocional.fecha
      )}</p>
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 22px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Cita Principal: ${
        devocional.citaBiblica
      }</h2>
      <p style="font-size: 16px; line-height: 1.6;">${
        devocional.textoDevocional
      }</p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 20px; color: #1a73e8;">Aprendizaje General</h3>
      <p style="font-size: 16px; line-height: 1.6; font-style: italic;">${
        devocional.aprendizajeGeneral
      }</p>
    </div>
  `;

  // 3. Añadir versículos específicos si existen
  if (devocional.versiculos && devocional.versiculos.length > 0) {
    contentHTML += `<div style="margin-bottom: 20px;">
      <h3 style="font-size: 20px; color: #1a73e8;">Versículos Clave</h3>`;
    devocional.versiculos.forEach((v) => {
      contentHTML += `
        <div style="margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #1a73e8;">
          <strong style="font-size: 18px;">${v.referencia}</strong>
          <p style="font-size: 16px; line-height: 1.6; margin: 5px 0;">${v.texto}</p>
          <p style="font-size: 15px; line-height: 1.5; color: #555; font-style: italic;"><strong>Aprendizaje:</strong> ${v.aprendizaje}</p>
        </div>
      `;
    });
    contentHTML += `</div>`;
  }

  // 4. Añadir referencias si existen
  if (devocional.referencias && devocional.referencias.length > 0) {
    contentHTML += `<div style="margin-bottom: 20px;">
      <h3 style="font-size: 20px; color: #1a73e8;">Referencias Adicionales</h3>
      <ul style="list-style: none; padding: 0;">`;
    devocional.referencias.forEach((r) => {
      contentHTML += `
        <li style="margin-bottom: 10px;">
          <a href="${r.url}" style="font-size: 16px; color: #1a73e8; text-decoration: none;">${r.url}</a>
          <p style="font-size: 15px; line-height: 1.5; margin: 5px 0 0;">${r.descripcion}</p>
        </li>
      `;
    });
    contentHTML += `</ul></div>`;
  }

  // 5. Añadir etiquetas si existen
  if (devocional.tags && devocional.tags.length > 0) {
    contentHTML += `
      <div style="border-top: 2px solid #ccc; padding-top: 10px; margin-top: 20px;">
        <strong style="font-size: 16px;">Temas:</strong>
        <span style="font-size: 16px; color: #555;">${devocional.tags.join(
          ", "
        )}</span>
      </div>
    `;
  }

  pdfContainer.innerHTML = contentHTML;
  document.body.appendChild(pdfContainer);

  try {
    // 6. Usar html2canvas para capturar el contenido
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // 7. Crear el PDF con jspdf
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // 8. Usar la función auxiliar para manejar múltiples páginas
    addImageToPDF(pdf, canvas);

    // 9. Descargar el PDF
    pdf.save(`Devocional-${devocional.fecha}-${devocional.citaBiblica}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
  } finally {
    // Limpiar el DOM
    document.body.removeChild(pdfContainer);
  }
};

// Función mejorada para exportar Estudio por Tema a PDF
export const exportTopicalStudyToPDF = async (topic: TopicalStudy) => {
  // 1. Crear contenedor temporal
  const pdfContainer = document.createElement("div");
  pdfContainer.style.position = "absolute";
  pdfContainer.style.left = "-9999px";
  pdfContainer.style.width = "800px";
  pdfContainer.style.padding = "20px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.color = "#333";
  pdfContainer.style.backgroundColor = "#fff";

  // 2. Construir el HTML del contenido del PDF
  let contentHTML = `
    <div style="border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
      <h1 style="font-size: 28px; margin: 0; color: #1a73e8;">Estudio Bíblico por Tema</h1>
      <p style="font-size: 22px; margin: 5px 0 0; color: #333;">${
        topic.name
      }</p>
    </div>
  `;

  // 3. Añadir entradas de estudio
  if (topic.entries && topic.entries.length > 0) {
    console.log('Esta es mi referencia: ', topic.entries)
    topic.entries.forEach((entry, index) => {
      contentHTML += `
        <div style="margin-bottom: 20px; padding-left: 15px; border-left: 3px solid #1a73e8;">
          <h3 style="font-size: 20px; margin-bottom: 5px;">${
            entry.referencia
          }</h3>
          <p style="font-size: 16px; line-height: 1.6; font-style: italic;">${
            entry.learning
          }</p>
        </div>
      `;
    });
  } else {
    contentHTML += '<p>Este tema aún no tiene entradas.</p>';
  }

  pdfContainer.innerHTML = contentHTML;
  document.body.appendChild(pdfContainer);

  try {
    // 4. Usar html2canvas y jspdf para crear y descargar el PDF
    const canvas = await html2canvas(pdfContainer, { 
      scale: 2, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Usar la función auxiliar para manejar múltiples páginas
    addImageToPDF(pdf, canvas);

    pdf.save(`Estudio-${topic.name}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
  } finally {
    // Limpiar el DOM
    document.body.removeChild(pdfContainer);
  }
};

// Alternativa usando jsPDF directamente (sin html2canvas) - MÁS EFICIENTE
export const exportDevocionalToPDFAlternative = async (devocional: Devocional) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - 2 * margin;
  
  let yPosition = margin;

  // Función auxiliar para añadir texto con salto de página automático
  const addText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', color: string = '#000000') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(color);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 1.2;
    
    // Verificar si necesitamos nueva página
    if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * lineHeight + 10;
  };

  // Contenido del PDF
  addText('Devocional Bíblico', 24, 'bold', '#1a73e8');
  addText(formatDate(devocional.fecha), 14);
  yPosition += 10;
  
  addText(`Cita Principal: ${devocional.citaBiblica}`, 18, 'bold');
  addText(devocional.textoDevocional, 12);
  yPosition += 10;
  
  addText('Aprendizaje General', 16, 'bold', '#1a73e8');
  addText(devocional.aprendizajeGeneral, 12);
  
  // Versículos
  if (devocional.versiculos && devocional.versiculos.length > 0) {
    yPosition += 10;
    addText('Versículos Clave', 16, 'bold', '#1a73e8');
    
    devocional.versiculos.forEach(v => {
      addText(v.referencia, 14, 'bold');
      addText(v.texto ?? '', 12);
      addText(`Aprendizaje: ${v.aprendizaje}`, 11);
      yPosition += 5;
    });
  }
  
  // Referencias
  if (devocional.referencias && devocional.referencias.length > 0) {
    yPosition += 10;
    addText('Referencias Adicionales', 16, 'bold', '#1a73e8');
    
    devocional.referencias.forEach(r => {
      addText(r.url, 11, 'normal', '#1a73e8');
      addText(r.descripcion, 11);
    });
  }
  
  // Tags
  if (devocional.tags && devocional.tags.length > 0) {
    yPosition += 10;
    addText(`Temas: ${devocional.tags.join(', ')}`, 12);
  }

  pdf.save(`Devocional-${devocional.fecha}-${devocional.citaBiblica}.pdf`);
};