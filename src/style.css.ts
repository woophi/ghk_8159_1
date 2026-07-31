import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

globalStyle('html, body', {
  margin: 0,
  minWidth: 320,
  minHeight: '100%',
  background: '#fff',
  color: '#030306',
  overscrollBehaviorX: 'none',
});

globalStyle('*', { boxSizing: 'border-box' });
globalStyle('button, input', { fontFamily: 'inherit' });

export const appSt = {
  shell: style({ minHeight: '100dvh', background: '#fff' }),
  page: style({
    width: '100%',
    maxWidth: 560,
    minWidth: 0,
    margin: '0 auto',
    padding: 'calc(20px + env(safe-area-inset-top, 0px)) 16px calc(120px + env(safe-area-inset-bottom, 0px))',
  }),
  hero: style({ display: 'grid', gap: 12, paddingTop: 4 }),
  lead: style({ maxWidth: 420 }),
  section: style({ display: 'grid', gap: 12, marginTop: 24 }),
  card: style({
    display: 'grid',
    gap: 14,
    width: '100%',
    minWidth: 0,
    padding: 16,
    border: '1px solid #e7e8eb',
    borderRadius: 8,
    background: '#fff',
  }),
  accountRow: style({
    display: 'grid',
    gridTemplateColumns: '44px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    padding: '12px 0',
    selectors: { '& + &': { borderTop: '1px solid #eceef2' } },
  }),
  accountMeta: style({ display: 'grid', gap: 2, minWidth: 0 }),
  iconWrap: style({
    display: 'grid',
    placeItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 14,
    background: '#f2f3f5',
    color: '#030306',
  }),
  amountButton: style({
    minHeight: 44,
    maxWidth: 132,
    padding: '0 12px',
    border: 0,
    borderRadius: 22,
    background: '#f2f3f5',
    color: '#030306',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }),
  remainder: style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    minWidth: 0,
    padding: '12px 14px',
    borderRadius: 8,
    background: '#f7f8fa',
  }),
  footer: style({
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
    borderTop: '1px solid #eceef2',
    background: '#fff',
  }),
  footerInner: style({ width: '100%', maxWidth: 560, margin: '0 auto' }),
  sheetBody: style({ display: 'grid', gap: 16, padding: '0 0 20px' }),
  thankYou: style({
    position: 'fixed',
    inset: 0,
    zIndex: 40,
    display: 'grid',
    alignContent: 'center',
    width: '100%',
    minWidth: 320,
    padding: '24px 16px calc(24px + env(safe-area-inset-bottom, 0px))',
    background: '#fff',
    animation: `${fadeIn} 180ms ease-out`,
  }),
  thankYouInner: style({ display: 'grid', gap: 18, width: '100%', maxWidth: 560, margin: '0 auto' }),
  note: style({ borderRadius: 8 }),
};

export const amountTone = recipe({
  base: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  variants: {
    empty: {
      true: { color: '#898991' },
      false: {},
    },
  },
});
