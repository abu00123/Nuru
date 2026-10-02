import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search information...' }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>Search</button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 600 },
  input: { flex: 1, padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '1rem', outline: 'none' },
  button: { padding: '0.75rem 1.5rem', backgroundColor: '#1a3c2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
};
