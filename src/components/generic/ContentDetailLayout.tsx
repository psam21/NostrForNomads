import type { ReactNode } from 'react';

interface ContentDetailLayoutProps {
  media: ReactNode;
  main: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ContentDetailLayout({
  media,
  main,
  sidebar,
  footer,
  className = '',
}: ContentDetailLayoutProps) {
  return (
    <div className={`space-y-10 ${className}`}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 xl:col-span-8">
          {media}
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="space-y-6">
            {main}
            {sidebar}
          </div>
        </div>
      </div>
      {footer && (
        <div className="w-full">{footer}</div>
      )}
    </div>
  );
}
