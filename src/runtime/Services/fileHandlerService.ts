import { SupportedMimeTypes } from '../Enums/supportedMimeTypes';

export function handleFile(fileDetails): void {
  switch (fileDetails.blob.type) {
    case SupportedMimeTypes.PDF:
      openPdf(fileDetails.blob);
      break;
      case SupportedMimeTypes.JPEG:
      case SupportedMimeTypes.PNG:
      case SupportedMimeTypes.GIF:
      case SupportedMimeTypes.SVG:
      openImage(fileDetails.blob);
      break;
      case SupportedMimeTypes.DOCX:
      case SupportedMimeTypes.XLS:
      case SupportedMimeTypes.XLSX:
      case SupportedMimeTypes.ACAD:
      case SupportedMimeTypes.DOC:
      downloadFile(fileDetails.blob, fileDetails.fileName); 
      break;
    default:
      console.error(`Unsupported MIME type: ${fileDetails.blob.type}`);
  }
}

function openPdf(blob: Blob): void {
  const downloadUrl = URL.createObjectURL(blob);
  window.open(downloadUrl, "_blank");
}

function openImage(blob: Blob): void {
  const downloadUrl = URL.createObjectURL(blob);
  const newWindow = window.open('', '_blank');
  const img = newWindow.document.createElement("img");
  img.src = downloadUrl;
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";
  newWindow.document.body.appendChild(img);
}

function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.setAttribute('charset', 'UTF-8');
  link.click();
  URL.revokeObjectURL(url);
}

