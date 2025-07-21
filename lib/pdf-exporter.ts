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

// Función principal para exportar a PDF
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

  // 6. Usar html2canvas para capturar el contenido
  const canvas = await html2canvas(pdfContainer, {
    scale: 2, // Aumenta la resolución para mejor calidad
    useCORS: true,
  });

  document.body.removeChild(pdfContainer); // Limpiar el DOM

  // 7. Crear el PDF con jspdf
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  // 8. Descargar el PDF
  pdf.save(`Devocional-${devocional.fecha}-${devocional.citaBiblica}.pdf`);
};

// --- Nueva Función para Exportar Estudio por Tema a PDF ---
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
    topic.entries.forEach((entry, index) => {
      contentHTML += `
        <div style="margin-bottom: 20px; padding-left: 15px; border-left: 3px solid #1a73e8;">
          <h3 style="font-size: 20px; margin-bottom: 5px;">${
            entry.reference
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

  // 4. Usar html2canvas y jspdf para crear y descargar el PDF
  const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true });
  document.body.removeChild(pdfContainer);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  pdf.save(`Estudio-${topic.name}.pdf`);
}; 