import React, { useState } from "react";

export function AuthModal({ mode, onClose, onLogin, switchMode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const submit = () => {
    if (mode === "login") {
      if (!email || !pass) return;
      onLogin(email.split("@")[0]);
    } else {
      if (!name || !email || !pass) return;
      onLogin(name);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{mode === "login" ? "WELCOME BACK" : "JOIN MASH"}</h2>
        <p className="modal-sub">{mode === "login" ? "Log in to your account" : "Create your free account"}</p>
        
        {mode === "signup" && (
          <div className="form-field">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div className="form-field">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        
        <button className="modal-submit" onClick={submit}>
          {mode === "login" ? "LOG IN" : "CREATE ACCOUNT"}
        </button>
        
        <div className="modal-switch">
          {mode === "login" ? (
            <>Don't have an account? <button onClick={() => switchMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => switchMode("login")}>Log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
