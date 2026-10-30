interface Props {
  status: 'verified' | 'unverified' | 'outdated';
}

export default function StatusBadge({ status }: Props) {
  const config = {
    verified: { label: 'Verified ✓', bg: '#e6f4ed', color: '#1a7a45' },
    unverified: { label: 'Unverified', bg: '#fff8e1', color: '#b45309' },
    outdated: { label: 'Outdated', bg: '#fdecea', color: '#b91c1c' },
  };
  const { label, bg, color } = config[status];
  return (
    <span style={{ backgroundColor: bg, color, padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
      {label}
    </span>
  );
}
