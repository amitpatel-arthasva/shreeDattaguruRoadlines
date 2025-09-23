import React from 'react';
import Modal from '../common/Modal';
import MemoPrintTemplate from './MemoPrintTemplate';

const MemoViewModal = ({ isOpen, onClose, memo }) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  if (!memo) return null;

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.1, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]" className="min-h-[90vh]">
      <div className="bg-white h-full flex flex-col">
        {/* Modal Header - Print Controls */}
        {/* Modal Header - Controls (Print removed) */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Memo Details</h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
              <button onClick={handleZoomOut} className="bg-white text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-1 text-sm" title="Zoom Out">🔍➖</button>
              <span className="px-2 text-sm font-medium text-gray-700">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomIn} className="bg-white text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-1 text-sm" title="Zoom In">🔍➕</button>
              <button onClick={handleResetZoom} className="bg-white text-gray-700 px-2 py-2 rounded hover:bg-gray-100 text-xs" title="Reset Zoom">100%</button>
            </div>
            <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
          </div>
        </div>
        {/* Scrollable Bill Content */}
        <div className="flex-1 overflow-auto p-6">
          <div 
            className="bill-content max-w-none"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`
            }}
          >
            <MemoPrintTemplate memo={memo} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MemoViewModal;
