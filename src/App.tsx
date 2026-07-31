import { AmountInput } from '@alfalab/core-components/amount-input/cssm';
import { BottomSheet } from '@alfalab/core-components/bottom-sheet/cssm';
import { Button } from '@alfalab/core-components/button/cssm';
import { SuperEllipse } from '@alfalab/core-components/icon-view/cssm/super-ellipse';
import { Plate } from '@alfalab/core-components/plate/cssm';
import { Typography } from '@alfalab/core-components/typography/cssm';
import { BanknotesMIcon } from '@alfalab/icons-glyph/BanknotesMIcon';
import { CheckmarkMIcon } from '@alfalab/icons-glyph/CheckmarkMIcon';
import { CategoryInvoiceMIcon } from '@alfalab/icons-glyph/CategoryInvoiceMIcon';
import { type ChangeEvent, type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { amountTone, appSt } from './style.css';
import { trackEvent } from './utils/events';

const SOURCE_AMOUNT = 24_380;
const TRANSFER_CLICK_KEY = 'e013_transfer_click_sent_a1';

type Destination = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  Icon: ComponentType<{ color?: string }>;
};

const formatMoney = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;
const clampAmount = (amount: number) => Math.max(0, Math.min(SOURCE_AMOUNT, Math.round(amount || 0)));

const VARIANT = {
  variant: 'a1',
  lead: 'Распределяйте остаток между счетами — выбирайте суммы, и готово.',
  ctaLabel: (amount: number) => `Перевести ${formatMoney(amount)}`,
  destinations: [
    {
      id: 'saving',
      title: 'Накопительный счёт',
      subtitle: 'На цель: отпуск',
      amount: 1000,
      Icon: CategoryInvoiceMIcon,
    },
  ] satisfies Destination[],
};

export const App = () => {
  const [destinations, setDestinations] = useState(VARIANT.destinations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState(0);
  const [thankYouShown, setThankYouShown] = useState(false);
  const transferSent = useRef(sessionStorage.getItem(TRANSFER_CLICK_KEY) === '1');
  const impressionSent = useRef(false);
  const startAt = useRef<number | null>(null);
  const maxScroll = useRef(0);
  const scrollDepths = useRef(new Set<number>());

  const editingDestination = destinations.find(destination => destination.id === editingId) ?? null;
  const total = useMemo(() => destinations.reduce((sum, destination) => sum + destination.amount, 0), [destinations]);
  const remainder = Math.max(0, SOURCE_AMOUNT - total);

  useEffect(() => {
    document.body.dataset.variant = VARIANT.variant;
    startAt.current = startAt.current ?? Date.now();

    if (!impressionSent.current) {
      impressionSent.current = true;
      trackEvent('e013_landing_impression', { var: VARIANT.variant });
    }

    const observedRows = new Set<string>();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const key = entry.target.getAttribute('data-track');
          if (entry.isIntersecting && key && !observedRows.has(key)) {
            observedRows.add(key);
            trackEvent('e013_mock_row_view', { var: VARIANT.variant, row: key });
          }
        });
      },
      { threshold: 0.6 },
    );

    document.querySelectorAll('[data-track^="dest-row-"]').forEach(row => observer.observe(row));

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const currentDepth = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      maxScroll.current = Math.max(maxScroll.current, Math.min(100, currentDepth));

      [25, 50, 75, 100].forEach(depth => {
        if (maxScroll.current >= depth && !scrollDepths.current.has(depth)) {
          scrollDepths.current.add(depth);
          trackEvent('e013_scroll_depth', { var: VARIANT.variant, depth });
        }
      });
    };

    const handleExit = () => {
      if (!transferSent.current) {
        trackEvent('e013_landing_exit', {
          var: VARIANT.variant,
          dimension_1: Math.round((Date.now() - (startAt.current ?? Date.now())) / 1000),
          depth: maxScroll.current,
        });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handleExit);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handleExit);
    };
  }, []);

  const openAmountEditor = (destination: Destination) => {
    setEditingId(destination.id);
    setDraftAmount(destination.amount);
    trackEvent('e013_amount_edit_open', { var: VARIANT.variant, row: destination.id, amount: destination.amount });
  };

  const closeAmountEditor = () => {
    if (editingDestination) {
      trackEvent('e013_amount_edit_cancel', { var: VARIANT.variant, row: editingDestination.id });
    }
    setEditingId(null);
  };

  const confirmAmount = () => {
    if (!editingDestination) return;

    const nextAmount = clampAmount(draftAmount);
    setDestinations(items =>
      items.map(destination => (destination.id === editingDestination.id ? { ...destination, amount: nextAmount } : destination)),
    );
    trackEvent('e013_amount_edit_confirm', { var: VARIANT.variant, row: editingDestination.id, amount: nextAmount });
    setEditingId(null);
  };

  const handleDraftChange = (_event: ChangeEvent<HTMLInputElement> | null, payload: { value: number | null }) => {
    setDraftAmount(clampAmount(payload.value ?? 0));
  };

  const handleTransfer = () => {
    if (total <= 0 || transferSent.current) return;

    transferSent.current = true;
    sessionStorage.setItem(TRANSFER_CLICK_KEY, '1');
    trackEvent('e013_transfer_click', { var: VARIANT.variant, amount: total });
    setThankYouShown(true);
    trackEvent('e013_thankyou_impression', { var: VARIANT.variant, amount: total });
  };

  const closeThankYou = () => {
    trackEvent('e013_thankyou_close', { var: VARIANT.variant });
    setThankYouShown(false);
  };

  return (
    <div className={appSt.shell} data-variant={VARIANT.variant}>
      <main className={appSt.page}>
        <section className={appSt.hero}>
          <Typography.TitleResponsive tag="h1" view="medium" font="system" weight="semibold">
            Распределить деньги
          </Typography.TitleResponsive>
          <Typography.Text className={appSt.lead} view="primary-medium" color="secondary" tag="p" defaultMargins={false}>
            {VARIANT.lead}
          </Typography.Text>
        </section>

        <section className={appSt.section}>
          <Typography.TitleResponsive tag="h2" view="xsmall" font="system" weight="semibold">
            Откуда
          </Typography.TitleResponsive>
          <div className={appSt.card}>
            <div className={appSt.accountRow}>
              <SuperEllipse size={48} backgroundColor="#f2f3f5">
                <BanknotesMIcon color="#030306" />
              </SuperEllipse>
              <div className={appSt.accountMeta}>
                <Typography.Text view="primary-small" weight="medium">Текущий счёт</Typography.Text>
                <Typography.Text view="secondary-large" color="secondary">Доступно</Typography.Text>
              </div>
              <Typography.Text view="primary-small" weight="medium">{formatMoney(SOURCE_AMOUNT)}</Typography.Text>
            </div>
          </div>
        </section>

        <section className={appSt.section}>
          <Typography.TitleResponsive tag="h2" view="xsmall" font="system" weight="semibold">
            Куда и сколько
          </Typography.TitleResponsive>
          <div className={appSt.card}>
            {destinations.map((destination, index) => {
              const Icon = destination.Icon;
              return (
                <div className={appSt.accountRow} data-track={`dest-row-${index + 1}`} key={destination.id}>
                  <div className={appSt.iconWrap}><Icon color="#030306" /></div>
                  <div className={appSt.accountMeta}>
                    <Typography.Text view="primary-small" weight="medium">{destination.title}</Typography.Text>
                    <Typography.Text view="secondary-large" color="secondary">{destination.subtitle}</Typography.Text>
                  </div>
                  <button
                    className={`${appSt.amountButton} ${amountTone({ empty: destination.amount === 0 })}`}
                    data-track={`amount-pill-${index + 1}`}
                    onClick={() => openAmountEditor(destination)}
                    type="button"
                  >
                    <Typography.Text view="primary-small" weight="medium">+{formatMoney(destination.amount)}</Typography.Text>
                  </button>
                </div>
              );
            })}
            <div className={appSt.remainder}>
              <Typography.Text view="secondary-large" color="secondary">Останется</Typography.Text>
              <Typography.Text view="secondary-large" weight="medium">{formatMoney(remainder)}</Typography.Text>
            </div>
          </div>
        </section>
      </main>

      <footer className={appSt.footer}>
        <div className={appSt.footerInner}>
          <Button block disabled={total === 0} view="primary" onClick={handleTransfer}>
            {VARIANT.ctaLabel(total)}
          </Button>
        </div>
      </footer>

      <BottomSheet
        actionButton={<Button block view="primary" onClick={confirmAmount}>Готово</Button>}
        hasCloser
        onClose={closeAmountEditor}
        open={Boolean(editingDestination)}
        stickyHeader
        title={editingDestination ? `Сумма для «${editingDestination.title}»` : 'Сумма перевода'}
        titleAlign="left"
      >
        <div className={appSt.sheetBody}>
          <AmountInput
            block
            bold={false}
            label="Сумма перевода"
            labelView="outer"
            max={SOURCE_AMOUNT}
            min={0}
            minority={1}
            onChange={handleDraftChange}
            value={draftAmount}
          />
          <Typography.Text view="primary-small" color="secondary">
            Доступно для перевода: до {formatMoney(SOURCE_AMOUNT)}
          </Typography.Text>
        </div>
      </BottomSheet>

      {thankYouShown && (
        <section className={appSt.thankYou}>
          <div className={appSt.thankYouInner}>
            <SuperEllipse size={64} backgroundColor="#0cc44d"><CheckmarkMIcon color="#fff" /></SuperEllipse>
            <Typography.TitleResponsive tag="h2" view="medium" font="system" weight="semibold">
              Запрос отправлен
            </Typography.TitleResponsive>
            <Plate className={appSt.note} view="positive">
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                Ваш запрос отправлен в разработку. Функция находится в работе. Деньги на вашем счёте не изменились.
              </Typography.Text>
            </Plate>
            <Button block view="primary" onClick={closeThankYou}>Хорошо</Button>
          </div>
        </section>
      )}
    </div>
  );
};



