export default function ShotFrame({ src, alt, label }) {
  return (
    <figure className="shot-frame">
      <div className="shot-frame-chrome" aria-hidden="true">
        <i />
        <i />
        <i />
        {label ? <span>{label}</span> : null}
      </div>
      <img src={src} alt={alt} loading="lazy" />
    </figure>
  );
}
