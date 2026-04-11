import { useCategories } from '../../hooks/useCategories';
import type { CategoryResource } from '../../types/api';

interface CategoryFilterProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
}

function flattenCategories(categories: CategoryResource[]): CategoryResource[] {
  const result: CategoryResource[] = [];
  for (const category of categories) {
    result.push(category);
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children));
    }
  }
  return result;
}

// Pill-based category filter — horizontal scrollable, mobile-friendly
// Design rationale: pills are faster to scan than a dropdown, reduce tap count on mobile
export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useCategories();
  const flatCategories = flattenCategories(categories);

  if (isLoading) {
    return (
      <div className="category-pills-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 72 + i * 14,
              height: 36,
              borderRadius: 20,
              background: '#e0d9cc',
              flexShrink: 0,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="category-pills-wrap">
      {/* "Tất cả" pill */}
      <button
        className={`category-pill${value === undefined ? ' active' : ''}`}
        onClick={() => onChange(undefined)}
      >
        Tất cả
      </button>

      {flatCategories.map((cat) => (
        <button
          key={cat.id}
          className={`category-pill${value === cat.id ? ' active' : ''}`}
          onClick={() => onChange(value === cat.id ? undefined : cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
