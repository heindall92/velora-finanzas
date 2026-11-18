import type { AccountKind, Lang } from './types';

/**
 * Brazilian banks people actually have, as colour + initials badges (not logos: their logos are
 * trademarks and an image would also break the strict CSP). Colours are each brand's primary hue.
 */
export interface BankPreset {
  id: string;
  name: string;
  initials: string;
  bg: string;
  fg: string;
}

export const BANKS: BankPreset[] = [
  { id: 'nubank', name: 'Nubank', initials: 'Nu', bg: '#820ad1', fg: '#ffffff' },
  { id: 'inter', name: 'Inter', initials: 'In', bg: '#ff7a00', fg: '#ffffff' },
  { id: 'itau', name: 'Itaú', initials: 'It', bg: '#ec7000', fg: '#ffffff' },
  { id: 'bradesco', name: 'Bradesco', initials: 'Br', bg: '#cc092f', fg: '#ffffff' },
  { id: 'bb', name: 'Banco do Brasil', initials: 'BB', bg: '#fcf800', fg: '#2a2a8f' },
  { id: 'caixa', name: 'Caixa', initials: 'Cx', bg: '#005ca9', fg: '#ffffff' },
  { id: 'santander', name: 'Santander', initials: 'Sa', bg: '#ec0000', fg: '#ffffff' },
  { id: 'c6', name: 'C6 Bank', initials: 'C6', bg: '#1f1f1f', fg: '#ffffff' },
  { id: 'picpay', name: 'PicPay', initials: 'Pi', bg: '#11c76f', fg: '#ffffff' },
  { id: 'mercadopago', name: 'Mercado Pago', initials: 'MP', bg: '#00b1ea', fg: '#ffffff' },
  { id: 'xp', name: 'XP', initials: 'XP', bg: '#111111', fg: '#f5c400' },
  { id: 'btg', name: 'BTG Pactual', initials: 'BT', bg: '#0a2b55', fg: '#ffffff' },
  { id: 'wallet', name: 'Carteira', initials: '', bg: '#0a7d4f', fg: '#ffffff' },
  { id: 'other', name: '', initials: '', bg: '#5b6472', fg: '#ffffff' },
];

const BY_ID = new Map(BANKS.map((b) => [b.id, b]));

export function getBank(id: string): BankPreset {
  return BY_ID.get(id) ?? BY_ID.get('other')!;
}

export const ACCOUNT_KINDS: AccountKind[] = ['checking', 'credit', 'savings', 'cash'];

export const KIND_LABEL: Record<AccountKind, Record<Lang, string>> = {
  checking: { pt: 'Conta corrente', es: 'Cuenta corriente' },
  credit: { pt: 'Cartão de crédito', es: 'Tarjeta de crédito' },
  savings: { pt: 'Poupança / investimento', es: 'Ahorro / inversión' },
  cash: { pt: 'Dinheiro', es: 'Efectivo' },
};
