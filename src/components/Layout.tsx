import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-[#f5f5f7] flex flex-col">
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
