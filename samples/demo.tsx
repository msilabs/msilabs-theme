import { useState, type ReactNode } from 'react';

/* Block comment: user types */
interface User {
  id: number;
  name: string;
  active?: boolean;
}

type Role = 'admin' | 'guest';

enum Status {
  Idle,
  Loading = 2,
}

// Line comment: fetch with generics
async function load<T>(url: string): Promise<T> {
  const res = await fetch(`${url}?t=${Date.now()}`);
  if (!res.ok) throw new Error('Request failed\n');
  return res.json() as Promise<T>;
}

/** @deprecated use load() */
const oldLoad = (url: string) => load<User>(url);

const EMAIL = /^[\w.]+@[\w.]+\.\w+$/i;

function Card({ user, children }: { user: User; children?: ReactNode }) {
  const [count, setCount] = useState<number>(0);
  const label = user.active && count > 3 ? 'hot' : null;

  return (
    <section className="card" data-id={user.id}>
      <h1>{user.name}</h1>
      {label && <Badge text={label} />}
      <button onClick={() => setCount(count + 1)}>Clicked {count}</button>
      {children}
    </section>
  );
}

export default Card;
