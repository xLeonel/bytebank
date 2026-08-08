import type { CSSProperties } from 'react';

type BbBaseProps = {
  id?: string;
  class?: string;
  style?: string | CSSProperties | Record<string, string | number>;
  children?: unknown;
  onClick?: (e: MouseEvent) => void;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'bb-button': BbBaseProps & {
        label?: string;
        variant?: 'primary' | 'secondary' | 'danger' | 'success';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        'full-width'?: boolean;
      };
      'bb-card': BbBaseProps & { title?: string; size?: 'sm' | 'md' | 'lg' };
      'bb-badge': BbBaseProps & {
        label?: string;
        variant?: 'success' | 'warning' | 'error' | 'info';
      };
    }
  }
}
