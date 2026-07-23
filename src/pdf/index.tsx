import React from 'react';
import { createRoot } from 'react-dom/client';
import PdfViewerApp from './PdfViewerApp';
import './pdf.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PdfViewerApp />);
}
