import logoImg from './assets/Logo2.png';

export default function Logo({ size = 34 }) {
  return (
    <img
      src={logoImg}
      alt="Fixora Logo"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}