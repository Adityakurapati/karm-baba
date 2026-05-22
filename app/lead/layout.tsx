export default function LeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      {children}
    </div>
  );
}
