import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerApp() {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get file URL from query params
    const params = new URLSearchParams(window.location.search);
    const file = params.get('file');
    if (file) {
      setFileUrl(decodeURIComponent(file));
      document.title = `LinguaPop PDF - ${file.split('/').pop()}`;
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // The content.ts script handles popup translation.
  // We just need to render the text layer so the user can select text.

  if (!fileUrl) {
    return (
      <div style={{ color: 'white', padding: 20 }}>
        No PDF file specified. Right-click a PDF link and choose "Открыть в LinguaPop PDF".
      </div>
    );
  }

  return (
    <>
      <div className="pdf-toolbar">
        <h1>{fileUrl.split('/').pop()}</h1>
        <div className="pdf-controls">
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            disabled={pageNumber >= (numPages || 1)} 
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
          >
            Next
          </button>
        </div>
      </div>
      <div className="pdf-container">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true} 
            renderAnnotationLayer={true} 
            scale={1.2}
          />
        </Document>
      </div>
    </>
  );
}
