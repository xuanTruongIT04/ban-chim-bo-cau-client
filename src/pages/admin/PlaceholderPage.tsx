interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{title}</h1>
      <p>Tính năng này sẽ có trong phiên bản tiếp theo.</p>
    </div>
  );
}
