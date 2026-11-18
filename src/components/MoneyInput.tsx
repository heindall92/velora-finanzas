import { forwardRef, type InputHTMLAttributes } from 'react';
import { currencySymbol, type CurrencyCode } from '../lib/money';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  currency: CurrencyCode;
  invalid?: boolean;
  /** 'lg' for the hero amount in the entry sheet. */
  size?: 'md' | 'lg';
  tone?: 'muted' | 'money';
};

/** Amount field. Text input + inputMode="decimal": iOS shows the numeric keypad with the comma. */
const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { currency, invalid, size = 'md', tone = 'muted', className = '', style, ...rest },
  ref,
) {
  const lg = size === 'lg';
  return (
    <label className={`money-field ${className}`} data-invalid={invalid ? 'true' : undefined}>
      <span aria-hidden="true" className={lg ? 'text-xl font-semibold' : ''} style={tone === 'money' ? { color: 'var(--color-money)' } : undefined}>
        {currencySymbol(currency)}
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        aria-invalid={invalid ? true : undefined}
        className={lg ? 'display font-semibold' : ''}
        style={lg ? { fontSize: '2rem', ...style } : style}
        {...rest}
      />
    </label>
  );
});

export default MoneyInput;
