// First, declare the types for the libraries in your global.d.ts or a similar declaration file
declare global {
  interface Window {
    html2canvas: (
      element: HTMLElement,
      options?: {
        scale?: number;
        ignoreElements?: (element: HTMLElement) => boolean;
        logging?: boolean;
        useCORS?: boolean;
        allowTaint?: boolean;
      }
    ) => Promise<HTMLCanvasElement>;
    jspdf: {
      jsPDF: new (options?: {
        orientation?: 'portrait' | 'landscape';
        unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
        format?: string | number[];
      }) => any;
    };
  }
}

export const generatePDF = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  try {
    // Now TypeScript knows these exist on window
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(element, {
      scale: 2,
      ignoreElements: (el: HTMLElement) => el.classList.contains('no-print'),
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: 'a4'
    });

    const props = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (props.height * pdfWidth) / props.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};