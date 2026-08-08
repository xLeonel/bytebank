import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Shim de `next/navigation` sobre o react-router. Cobre o que a Fase 1 usa:
 * useRouter().push/replace/back, usePathname, useSearchParams, useParams.
 */
export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export { useParams };
