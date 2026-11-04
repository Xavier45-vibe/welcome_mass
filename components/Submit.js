"use client";

import { useFormStatus } from "react-dom";

export function Submit({ children }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? <span className="spinner" aria-label="Loading" /> : children}
    </button>
  );
}
