import { useTheme } from './ThemeContext';

export default function CityBackground() {
  const { dark } = useTheme();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: dark ? '#0d0d0f' : '#f5f0e8',
      overflow: 'hidden',
      pointerEvents: 'none',
      transition: 'background 0.5s ease'
    }}>
      {/* Orb 1 — top left */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-150px',
        width: '600px', height: '600px',
        background: dark ? '#6e3fa3' : '#c9a96e',
        borderRadius: '50%',
        filter: 'blur(90px)',
        opacity: dark ? 0.2 : 0.15,
        animation: 'orbDrift1 18s ease-in-out infinite alternate',
        transition: 'background 0.5s, opacity 0.5s'
      }} />

      {/* Orb 2 — bottom right */}
      <div style={{
        position: 'absolute', bottom: '-180px', right: '-120px',
        width: '500px', height: '500px',
        background: dark ? '#c9a96e' : '#8b6914',
        borderRadius: '50%',
        filter: 'blur(90px)',
        opacity: dark ? 0.18 : 0.12,
        animation: 'orbDrift2 18s ease-in-out infinite alternate',
        animationDelay: '-6s',
        transition: 'background 0.5s, opacity 0.5s'
      }} />

      {/* Orb 3 — center */}
      <div style={{
        position: 'absolute', top: '40%', left: '35%',
        width: '350px', height: '350px',
        background: dark ? '#3f6ea3' : '#d4a843',
        borderRadius: '50%',
        filter: 'blur(90px)',
        opacity: dark ? 0.15 : 0.1,
        animation: 'orbDrift1 22s ease-in-out infinite alternate',
        animationDelay: '-12s',
        transition: 'background 0.5s, opacity 0.5s'
      }} />

      <style>{`
        @keyframes orbDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes orbDrift2 {
          from { transform: translate(0, 0) scale(1.05); }
          to   { transform: translate(-40px, 30px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}