import { useState } from 'react';

import { MASTER_ADMIN_EMAIL, loginMasterAdmin } from '../auth/adminAuth.js';

function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: MASTER_ADMIN_EMAIL, password: '' });
  const [state, setState] = useState({ submitting: false, message: '' });

  function updateValue(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ submitting: true, message: '' });
    try {
      const session = await loginMasterAdmin(form);
      setState({ submitting: false, message: '' });
      onLogin(session);
    } catch (error) {
      setState({ submitting: false, message: error.message });
    }
  }

  return (
    <main className="adminLoginPage adminIntroContents">
      <form className="adminLoginCard" onSubmit={submit}>
        <img src="/resources/rudicks/img/logo.svg" alt="Cubici" />
        <h1>관리자 로그인</h1>
        <label>
          관리자 계정
          <input
            autoComplete="username"
            name="email"
            onChange={updateValue}
            type="email"
            value={form.email}
          />
        </label>
        <label>
          비밀번호
          <input
            autoComplete="current-password"
            autoFocus
            name="password"
            onChange={updateValue}
            type="password"
            value={form.password}
          />
        </label>
        <button disabled={state.submitting} type="submit">
          {state.submitting ? '확인 중' : '로그인'}
        </button>
        {state.message ? <p className="adminLoginMessage">{state.message}</p> : null}
      </form>
    </main>
  );
}

export { AdminLoginPage };
