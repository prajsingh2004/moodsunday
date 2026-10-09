import './Button.css';

/**
 * <Button> renders a link when `href` is given, otherwise a real <button>.
 * variant: primary | ghost | accent   ·   tone: light (default) | dark (on ink backgrounds)
 * arrow: "→" or "↗" slides on hover.
 */
export default function Button({
  href,
  variant = 'primary',
  tone = 'light',
  arrow,
  children,
  className = '',
  external = false,
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${tone} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className={`btn__arrow ${arrow === '↗' ? 'btn__arrow--up' : ''}`} aria-hidden="true">
          {arrow}
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <a
        className={classes}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
