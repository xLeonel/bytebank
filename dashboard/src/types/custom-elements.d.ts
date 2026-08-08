// Module augmentation for Bytebank Design System Web Components.
// `export {}` is required so TypeScript treats this as a MODULE augmenting
// `react` rather than an ambient replacement that wipes all existing exports.
export {};

import type { CSSProperties } from 'react';

type BbBaseProps = {
  ref?: unknown;
  key?: string | number;
  id?: string;
  class?: string;
  style?: string | CSSProperties | Record<string, string | number>;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
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
      'bb-card': BbBaseProps & {
        title?: string;
        size?: 'sm' | 'md' | 'lg';
      };
      'bb-badge': BbBaseProps & {
        label?: string;
        variant?: 'success' | 'warning' | 'error' | 'info';
      };
      'bb-field': BbBaseProps & {
        label?: string;
        placeholder?: string;
        type?: string;
        value?: string;
      };
      'bb-modal': BbBaseProps & {
        title?: string;
        size?: 'sm' | 'md' | 'lg';
        open?: boolean;
      };
      'bb-sidebar': BbBaseProps & {
        /** Active route — Lit re-renders the highlighted link without remounting */
        'current-path'?: string;
      };
      'bb-balance-card': BbBaseProps & {
        'greeting-name'?: string;
        today?: string;
        'account-type'?: string;
        balance?: number | string;
      };
      'bb-transaction-list': BbBaseProps & {
        'group-by-month'?: boolean;
      };
      'bb-new-transaction-modal': BbBaseProps & {
        open?: boolean;
      };
      'bb-new-transaction-list': BbBaseProps;
      'bb-transaction-detail-modal': BbBaseProps & {
        open?: boolean;
      };
    }
  }
}
