import { FinanceNav } from '@/components/finance/FinanceNav';
import { PageHeader } from '@/components/shared/PageHeader';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Finanza" subtitle="Soldi in banca, soldi in arrivo, soldi in uscita. Sola lettura." />
      <FinanceNav />
      {children}
    </>
  );
}
