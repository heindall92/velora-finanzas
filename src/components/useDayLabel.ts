import { addDays, fromDayKey, toDayKey } from '../lib/dates';
import { capFirst, localeOf } from '../lib/i18n';
import { useApp } from '../state/AppState';

/** "Hoje", "Ontem", "Seg., 16 de nov." */
export function useDayLabel() {
  const { t, data, today } = useApp();
  const locale = localeOf(data.profile.language);
  const todayKey = toDayKey(today);
  const yKey = toDayKey(addDays(today, -1));
  return (day: string) => {
    if (day === todayKey) return t('today');
    if (day === yKey) return t('yesterday');
    const d = fromDayKey(day);
    return capFirst(d.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
    }));
  };
}
