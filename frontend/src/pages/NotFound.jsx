import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '8rem 1rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Compass size={64} strokeWidth={1} color="#C9A96E" style={{ marginBottom: '1.5rem' }} />
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C887B', marginBottom: '0.5rem' }}>
        404 — Page Not Found
      </span>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', fontWeight: 500, margin: '0 0 1rem 0' }}>
        The Piece You Seek Has Wandered
      </h1>
      <p style={{ color: '#7A766E', maxWidth: '450px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
        The archival link you followed may be expired, or this particular silhouette has been retired to our permanent catalog.
      </p>
      <Link to="/" className="btn-primary">
        Return to Atelier <ArrowRight size={16} />
      </Link>
    </div>
  );
}
