import { Check } from 'lucide-react';
import { Category } from '../types/game';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ category, selected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 w-full h-[120px] md:h-[150px] lg:h-[170px]"
      style={{ backgroundColor: category.color }}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-blue-600" />
        </div>
      )}

      <div className="text-4xl md:text-5xl">{category.icon}</div>
      <div className="text-white font-bold text-sm md:text-base">{category.name}</div>
      <div className="text-white/80 text-xs">{category.words.length} words</div>
    </button>
  );
}
