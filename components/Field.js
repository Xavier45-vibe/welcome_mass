"use client";

import { useState } from "react";
import { passwordScore } from "@/lib/validation";

export function Field({ label, name, type = "text", error, defaultValue, autoComplete, placeholder, meter, right }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const isPw = type === "password";
  const score = passwordScore(val);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="field">
      <div className="field-row">
        <label htmlFor={name}>{label}</label>
        {right}
      </div>
      <div className={`input-wrap${error ? " has-error" : ""}`}>
        <input
          id={name}
          name={name}
          type={isPw && show ? "text" : type}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-err` : undefined}
          onChange={meter ? (e) => setVal(e.target.value) : undefined}
        />
        {isPw && (
          <button type="button" className="toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {meter && val && (
        <div className="meter" aria-live="polite">
          <div className="bars">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={i <= score ? `on s${score}` : ""} />
            ))}
          </div>
          <small>{labels[score]}</small>
        </div>
      )}
      {error && (
        <p className="err" id={`${name}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
