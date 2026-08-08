import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Shim de `next/link` sobre o react-router. Mantém a API `href` usada no
 * código da Fase 1, mapeando para o `to` do react-router. Aliased no Vite
 * como `next/link`, então os imports originais continuam funcionando.
 */
type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

const NextLink = forwardRef<HTMLAnchorElement, NextLinkProps>(function NextLink(
  { href, prefetch: _prefetch, scroll: _scroll, replace, children, ...rest },
  ref,
) {
  return (
    <RouterLink ref={ref} to={href} replace={replace} {...rest}>
      {children}
    </RouterLink>
  );
});

export default NextLink;
