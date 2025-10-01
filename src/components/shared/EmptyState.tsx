import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
