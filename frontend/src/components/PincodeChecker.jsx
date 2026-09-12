import { useState } from 'react';
import { MapPin, Truck, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../lib/axios';
import './PincodeChecker.css';

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await api.get(`/shipping/pincode/${pincode.trim()}`);
      setResult(res.data?.data || null);
    } catch (err) {
      // Local fallback — all Indian 6-digit pincodes are deliverable
      const isMetro = ['11','12','40','41','56','50','60','70'].includes(pincode.slice(0,2));
      setResult({
        deliverable: true,
        estimatedDays: isMetro ? '2 - 3 Business Days' : '4 - 6 Business Days',
        estimatedDate: 'Expected by ' + new Date(Date.now() + (isMetro ? 3 : 6) * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        codAvailable: true,
        courierPartner: isMetro ? 'BlueDart Air' : 'Delhivery Surface',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pincode-checker">
      <div className="pincode-checker__label">
        <MapPin size={14} />
        <span>Check Delivery & COD Availability</span>
      </div>
      <form className="pincode-checker__form" onSubmit={handleCheck}>
        <input
          type="text"
          className="pincode-checker__input"
          placeholder="Enter PIN code"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPincode(val);
            setResult(null);
            setError('');
          }}
          maxLength={6}
          inputMode="numeric"
          aria-label="PIN code input"
        />
        <button
          type="submit"
          className="pincode-checker__btn"
          disabled={loading || pincode.length !== 6}
        >
          {loading ? <Loader size={14} className="pincode-spinner" /> : 'Check'}
        </button>
      </form>

      {error && (
        <p className="pincode-checker__error">
          <XCircle size={14} /> {error}
        </p>
      )}

      {result && (
        <div className={`pincode-checker__result ${result.deliverable ? 'deliverable' : 'not-deliverable'}`}>
          {result.deliverable ? (
            <>
              <div className="pincode-result__row">
                <CheckCircle size={14} className="pincode-result__icon--ok" />
                <span>Delivery available via <strong>{result.courierPartner}</strong></span>
              </div>
              <div className="pincode-result__row">
                <Truck size={14} />
                <span><strong>{result.estimatedDays}</strong> — {result.estimatedDate}</span>
              </div>
              {result.codAvailable && (
                <div className="pincode-result__row">
                  <CheckCircle size={14} className="pincode-result__icon--ok" />
                  <span>Cash on Delivery Available</span>
                </div>
              )}
            </>
          ) : (
            <div className="pincode-result__row">
              <XCircle size={14} className="pincode-result__icon--err" />
              <span>Delivery not available at this PIN code</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
