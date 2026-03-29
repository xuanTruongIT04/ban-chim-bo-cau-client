import { Select } from 'antd';
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
    if (category.children?.length > 0) {
      result.push(...flattenCategories(category.children));
    }
  }
  return result;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useCategories();

  const flatCategories = flattenCategories(categories);

  const options = [
    { value: undefined, label: 'Tất cả' },
    ...flatCategories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      loading={isLoading}
      style={{ width: '100%', minWidth: 200 }}
      placeholder="Tất cả"
    />
  );
}
