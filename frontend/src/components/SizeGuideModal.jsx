import { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SizeGuideModal.css';

const DEFAULT_SIZE_CHART = [
  { size: 'XS', chest: '34', waist: '28', hip: '38', length: '46' },
  { size: 'S',  chest: '36', waist: '30', hip: '40', length: '46' },
  { size: 'M',  chest: '38', waist: '32', hip: '42', length: '47' },
  { size: 'L',  chest: '40', waist: '34', hip: '44', length: '47' },
  { size: 'XL', chest: '42', waist: '36', hip: '46', length: '48' },
];

export default function SizeGuideModal({ isOpen, onClose, sizeChart, category }) {
  const [unit, setUnit] = useState('in');
  const chart = sizeChart && sizeChart.length > 0 ? sizeChart : DEFAULT_SIZE_CHART;

  const cmConvert = (val) => {
    if (!val || isNaN(Number(val))) return val;
    return (Number(val) * 2.54).toFixed(1);
  };

  const displayVal = (val) => unit === 'cm' ? cmConvert(val) : val;

  // Determine table columns from chart keys (excluding 'size')
  const columns = chart.length > 0
    ? Object.keys(chart[0]).filter((k) => k !== 'size')
    : ['chest', 'waist', 'hip', 'length'];

  const columnLabels = {
    chest: 'Chest',
    waist: 'Waist',
    hip: 'Hip / Bust',
    length: 'Length',
    shoulder: 'Shoulder',
    lehenga_length: 'Lehenga Length',
    width: 'Width',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sgm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="sgm-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Size Guide"
          >
            <div className="sgm-header">
              <div className="sgm-header__title">
                <Ruler size={18} />
                <span>Size Guide</span>
              </div>
              <button className="sgm-close" onClick={onClose} aria-label="Close size guide">
                <X size={20} />
              </button>
            </div>

            <div className="sgm-body">
              <p className="sgm-subtitle">
                {category || 'All measurements in inches unless converted.'}
              </p>

              <div className="sgm-unit-toggle">
                <button
                  className={`sgm-unit-btn ${unit === 'in' ? 'active' : ''}`}
                  onClick={() => setUnit('in')}
                >
                  Inches
                </button>
                <button
                  className={`sgm-unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => setUnit('cm')}
                >
                  CM
                </button>
              </div>

              <div className="sgm-table-wrap">
                <table className="sgm-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      {columns.map((col) => (
                        <th key={col}>{columnLabels[col] || col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.map((row) => (
                      <tr key={row.size}>
                        <td className="sgm-size-cell">{row.size}</td>
                        {columns.map((col) => (
                          <td key={col}>{displayVal(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sgm-measuring-guide">
                <p className="sgm-guide-title">How to Measure</p>
                <ul>
                  <li><strong>Chest</strong> — Measure around the fullest part of the bust, keeping the tape parallel to the floor.</li>
                  <li><strong>Waist</strong> — Measure at the narrowest part of the natural waistline.</li>
                  <li><strong>Hip</strong> — Measure around the fullest part of the hips.</li>
                  <li><strong>Length</strong> — Measured from the shoulder tip to the desired hem.</li>
                </ul>
              </div>

              <div className="sgm-note">
                <p>All our pieces are cut with a 1-inch ease. For a relaxed fit, size up. For fit queries, contact our concierge at <a href="mailto:care@tiyacollections.com">care@tiyacollections.com</a></p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
