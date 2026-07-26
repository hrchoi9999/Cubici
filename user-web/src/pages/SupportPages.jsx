import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  Tabs,
  DocumentNotice,
  ReadOnlyField,
  ContractStatusStrip,
  TermsDecisionPanel,
  REQUEST_DOCUMENT_ACCEPT,
  contractDetailPath,
  contractDocumentDownloadUrl,
  createInquiryForUser,
  deleteJson,
  fetchAuthJson,
  fetchChargePlans,
  fetchContractDetailForUser,
  fetchContractDocumentsForUser,
  fetchInquiryDetailForUser,
  fetchJson,
  formatAmount,
  formatBankAccount,
  formatChargeType,
  formatContractStatus,
  formatDate,
  formatPercent,
  formatPeriod,
  formatProductCode,
  latestContractFee,
  latestFeeDetail,
  moneybankTabs,
  plainText,
  postAuthJson,
  postJson,
  putJson,
  readAuthSession,
  saveAuthSession,
  shopOptions,
  statusKey,
  supportBoardConfig,
  updateContractDocumentStatus,
  uploadDocumentFile,
  useAuthenticatedShopPairs,
  useUserDashboardData,
  validateRequestDocuments,
} from '../shared/UserCore.jsx';

function SupportBoardPage({ kind }) {
  const [auth] = useState(readAuthSession);
  const config = supportBoardConfig(kind);
  const userNo = auth?.user?.user_no;
  const [state, setState] = useState({
    loading: kind !== 'qa' || Boolean(userNo),
    error: '',
    total: 0,
    answeredCount: 0,
    waitingCount: 0,
    items: [],
  });
  const [form, setForm] = useState({
    type: 'CUBICI',
    title: '',
    content: '',
    visibility: 'private',
  });
  const [submitState, setSubmitState] = useState({ submitting: false, message: '' });
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    let active = true;
    async function load() {
      if (kind === 'qa' && !userNo) {
        setState({
          loading: false,
          error: '로그인 후 내 문의 내역을 확인할 수 있습니다.',
          total: 0,
          answeredCount: 0,
          waitingCount: 0,
          items: [],
        });
        return;
      }
      setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const path = kind === 'qa'
          ? `/v1/api/support/inquiries?limit=30&offset=0&user_no=${encodeURIComponent(userNo)}`
          : config.endpoint;
        const response = await fetchJson(path);
        if (!active) return;
        setState({
          loading: false,
          error: '',
          total: response.total ?? 0,
          answeredCount: response.answered_count ?? 0,
          waitingCount: response.waiting_count ?? 0,
          items: response.items ?? [],
        });
      } catch (error) {
        if (!active) return;
        setState({
          loading: false,
          error: `고객지원 조회 실패: ${error.message}`,
          total: 0,
          answeredCount: 0,
          waitingCount: 0,
          items: [],
        });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [config.endpoint, kind, userNo]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitInquiry() {
    if (!userNo) {
      setSubmitState({ submitting: false, message: '로그인 후 문의를 등록할 수 있습니다.' });
      return;
    }
    setSubmitState({ submitting: true, message: '문의 등록 중' });
    try {
      const response = await createInquiryForUser({
        user_no: userNo,
        type: form.type,
        title: form.title,
        content: form.content,
        visibility: form.visibility,
        operated_by: auth?.user?.name ?? auth?.user?.email ?? 'user-web',
      });
      window.location.href = `/board/qa/${encodeURIComponent(response.qna_id)}`;
    } catch (error) {
      setSubmitState({ submitting: false, message: `문의 등록 실패: ${error.message}` });
    }
  }

  const typeOptions = useMemo(() => {
    const seen = new Map();
    state.items.forEach((item) => {
      const value = item.type ?? item.type_label ?? '-';
      const label = item.type_label ?? item.type ?? '-';
      if (!seen.has(value)) seen.set(value, label);
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [state.items]);
  const visibleItems = useMemo(() => {
    if (kind === 'qa' || selectedType === 'all') return state.items;
    return state.items.filter((item) => (item.type ?? item.type_label ?? '-') === selectedType);
  }, [kind, selectedType, state.items]);

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title={config.title} text={config.text} />
        <section className="support-summary">
          <div>
            <span>전체</span>
            <strong>{state.loading ? '조회 중' : `${state.total.toLocaleString('ko-KR')}건`}</strong>
          </div>
          {kind === 'qa' ? (
            <>
              <div>
                <span>답변완료</span>
                <strong>{state.answeredCount.toLocaleString('ko-KR')}건</strong>
              </div>
              <div>
                <span>답변대기</span>
                <strong>{state.waitingCount.toLocaleString('ko-KR')}건</strong>
              </div>
            </>
          ) : null}
        </section>
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        {kind !== 'qa' && typeOptions.length > 1 ? (
          <section className="form-panel">
            <h2>{kind === 'faq' ? 'FAQ 분류' : '공지 분류'}</h2>
            <div className="field-grid">
              <label>
                구분
                <select onChange={(event) => setSelectedType(event.target.value)} value={selectedType}>
                  <option value="all">전체</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <ReadOnlyField label="표시 건수" value={`${visibleItems.length.toLocaleString('ko-KR')}건`} />
            </div>
          </section>
        ) : null}
        {kind === 'qa' ? (
          <section className="form-panel">
            <h2>문의 등록</h2>
            <div className="field-grid">
              <label>
                구분
                <select onChange={(event) => updateForm('type', event.target.value)} value={form.type}>
                  <option value="CUBICI">큐빅아이</option>
                  <option value="MONEYBANK">머니뱅크</option>
                </select>
              </label>
              <label>
                공개 여부
                <select onChange={(event) => updateForm('visibility', event.target.value)} value={form.visibility}>
                  <option value="private">비공개</option>
                  <option value="public">공개</option>
                </select>
              </label>
            </div>
            <label className="wide-field">
              제목
              <input onChange={(event) => updateForm('title', event.target.value)} type="text" value={form.title} />
            </label>
            <label className="wide-field">
              내용
              <textarea onChange={(event) => updateForm('content', event.target.value)} rows="7" value={form.content} />
            </label>
            <button className="primary-action" disabled={submitState.submitting || !userNo} onClick={submitInquiry} type="button">
              {submitState.submitting ? '등록 중' : '문의 등록'}
            </button>
            {submitState.message ? <p className={submitState.message.includes('실패') || submitState.message.includes('로그인') ? 'auth-message error' : 'auth-message success'}>{submitState.message}</p> : null}
          </section>
        ) : null}
        <section className="data-table-wrap">
          <h2>{config.title} 목록</h2>
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>구분</th>
                <th>제목</th>
                {kind === 'qa' ? <th>상태</th> : null}
                <th>작성자</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length ? visibleItems.map((item) => (
                <tr key={`${kind}-${item.post_id ?? item.qna_id}`}>
                  <td>{item.post_id ?? item.qna_id}</td>
                  <td>{item.type_label ?? item.type ?? '-'}</td>
                  <td>
                    {kind === 'qa' ? (
                      <a className="support-title support-title-link" href={`/board/qa/${encodeURIComponent(item.qna_id)}`}>{item.title ?? '-'}</a>
                    ) : (
                      <a className="support-title support-title-link" href={`/board/${kind}/${encodeURIComponent(item.post_id)}`}>{item.title ?? '-'}</a>
                    )}
                    <span className="support-snippet">{plainText(item.content)}</span>
                  </td>
                  {kind === 'qa' ? <td>{item.answer_status ?? '-'}</td> : null}
                  <td>{item.created_by ?? '-'}</td>
                  <td>{formatDate(item.reg_date)}</td>
                </tr>
              )) : (
                <tr><td colSpan={kind === 'qa' ? 6 : 5}>{state.loading ? '조회 중입니다.' : config.empty}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </Layout>
  );
}

function BoardDetailPage({ kind, postId }) {
  const config = supportBoardConfig(kind);
  const [state, setState] = useState({ loading: true, error: '', detail: null });

  useEffect(() => {
    let active = true;
    async function load() {
      setState({ loading: true, error: '', detail: null });
      try {
        const response = await fetchJson(`/v1/api/support/boards/${kind}/${encodeURIComponent(postId)}`);
        if (!active) return;
        setState({ loading: false, error: '', detail: response });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: `${config.title} 상세 조회 실패: ${error.message}`, detail: null });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [config.title, kind, postId]);

  const post = state.detail;

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title={`${config.title} 상세`} text="게시글 내용을 확인합니다." />
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        <section className="data-table-wrap">
          <h2>{config.title} 내용</h2>
          {state.loading ? <p className="api-note">조회 중입니다.</p> : null}
          {post ? (
            <div className="support-detail">
              <dl>
                <div><dt>번호</dt><dd>{post.post_id}</dd></div>
                <div><dt>구분</dt><dd>{post.type_label ?? post.type ?? '-'}</dd></div>
                <div><dt>작성자</dt><dd>{post.created_by ?? '-'}</dd></div>
                <div><dt>등록일</dt><dd>{formatDate(post.reg_date)}</dd></div>
                <div><dt>수정일</dt><dd>{formatDate(post.modified_date)}</dd></div>
              </dl>
              <h3>{post.title}</h3>
              <p>{plainText(post.content)}</p>
              <p className="api-note">보안 정책: 게시글 본문은 HTML 태그를 실행하지 않고 텍스트로만 표시합니다.</p>
            </div>
          ) : null}
          <a className="secondary-link" href={`/board/${kind}/index`}>목록으로</a>
        </section>
      </main>
    </Layout>
  );
}

function InquiryDetailPage({ qnaId }) {
  const [auth] = useState(readAuthSession);
  const userNo = auth?.user?.user_no;
  const [state, setState] = useState({ loading: Boolean(userNo), error: '', detail: null });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    type: 'CUBICI',
    title: '',
    content: '',
    visibility: 'private',
  });
  const [actionState, setActionState] = useState({ busy: false, message: '' });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!userNo) {
        setState({ loading: false, error: '로그인 후 문의 상세를 확인할 수 있습니다.', detail: null });
        return;
      }
      setState({ loading: true, error: '', detail: null });
      try {
        const response = await fetchInquiryDetailForUser(qnaId, userNo);
        if (!active) return;
        setState({ loading: false, error: '', detail: response });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: `문의 상세 조회 실패: ${error.message}`, detail: null });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [qnaId, userNo]);

  const inquiry = state.detail?.inquiry;
  const replies = state.detail?.replies ?? [];
  const canEdit = Boolean(userNo && inquiry?.user_no === userNo && replies.length === 0);

  useEffect(() => {
    if (!inquiry) return;
    setEditForm({
      type: inquiry.type ?? 'CUBICI',
      title: inquiry.title ?? '',
      content: plainText(inquiry.content ?? ''),
      visibility: inquiry.visibility === '1' || inquiry.visibility === 'public' ? 'public' : 'private',
    });
    setEditMode(false);
  }, [inquiry]);

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function saveInquiry() {
    if (!userNo) return;
    setActionState({ busy: true, message: '문의 수정 중' });
    try {
      const response = await putJson(`/v1/api/support/inquiries/${encodeURIComponent(qnaId)}`, {
        user_no: userNo,
        type: editForm.type,
        title: editForm.title,
        content: editForm.content,
        visibility: editForm.visibility,
        operated_by: auth?.user?.name ?? auth?.user?.email ?? 'user-web',
      });
      setState({ loading: false, error: '', detail: response.detail });
      setEditMode(false);
      setActionState({ busy: false, message: '문의가 수정되었습니다.' });
    } catch (error) {
      setActionState({ busy: false, message: `문의 수정 실패: ${error.message}` });
    }
  }

  async function removeInquiry() {
    if (!userNo) return;
    setActionState({ busy: true, message: '문의 삭제 중' });
    try {
      await deleteJson(`/v1/api/support/inquiries/${encodeURIComponent(qnaId)}?user_no=${encodeURIComponent(userNo)}`);
      window.location.href = '/board/qa/index';
    } catch (error) {
      setActionState({ busy: false, message: `문의 삭제 실패: ${error.message}` });
    }
  }

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="Q&A 상세" text="문의 내용과 답변을 확인합니다." />
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        <section className="data-table-wrap">
          <h2>문의 내용</h2>
          {state.loading ? <p className="api-note">조회 중입니다.</p> : null}
          {inquiry ? (
            <div className="support-detail">
              <dl>
                <div><dt>번호</dt><dd>{inquiry.qna_id}</dd></div>
                <div><dt>구분</dt><dd>{inquiry.type_label ?? inquiry.type ?? '-'}</dd></div>
                <div><dt>상태</dt><dd>{inquiry.answer_status ?? '-'}</dd></div>
                <div><dt>공개여부</dt><dd>{inquiry.visibility_label ?? '-'}</dd></div>
                <div><dt>등록일</dt><dd>{formatDate(inquiry.reg_date)}</dd></div>
              </dl>
              {editMode ? (
                <div className="support-edit-form">
                  <div className="field-grid">
                    <label>
                      구분
                      <select onChange={(event) => updateEditForm('type', event.target.value)} value={editForm.type}>
                        <option value="CUBICI">큐빅아이</option>
                        <option value="MONEYBANK">머니뱅크</option>
                      </select>
                    </label>
                    <label>
                      공개 여부
                      <select onChange={(event) => updateEditForm('visibility', event.target.value)} value={editForm.visibility}>
                        <option value="private">비공개</option>
                        <option value="public">공개</option>
                      </select>
                    </label>
                  </div>
                  <label className="wide-field">
                    제목
                    <input onChange={(event) => updateEditForm('title', event.target.value)} type="text" value={editForm.title} />
                  </label>
                  <label className="wide-field">
                    내용
                    <textarea onChange={(event) => updateEditForm('content', event.target.value)} rows="7" value={editForm.content} />
                  </label>
                </div>
              ) : (
                <>
                  <h3>{inquiry.title}</h3>
                  <p>{plainText(inquiry.content)}</p>
                </>
              )}
              {canEdit ? (
                <div className="form-actions">
                  {editMode ? (
                    <>
                      <button className="primary-action" disabled={actionState.busy} onClick={saveInquiry} type="button">
                        {actionState.busy ? '저장 중' : '저장'}
                      </button>
                      <button className="secondary-button" disabled={actionState.busy} onClick={() => setEditMode(false)} type="button">취소</button>
                    </>
                  ) : (
                    <>
                      <button className="secondary-button" disabled={actionState.busy} onClick={() => setEditMode(true)} type="button">수정</button>
                      <button className="danger-button" disabled={actionState.busy} onClick={removeInquiry} type="button">삭제</button>
                    </>
                  )}
                </div>
              ) : inquiry.user_no === userNo ? (
                <p className="api-note">답변이 등록된 문의는 수정 또는 삭제할 수 없습니다.</p>
              ) : null}
              {actionState.message ? <p className={actionState.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{actionState.message}</p> : null}
            </div>
          ) : null}
        </section>
        <section className="data-table-wrap">
          <h2>답변</h2>
          {replies.length ? replies.map((reply) => (
            <article className="support-reply" key={reply.reply_id}>
              <strong>{reply.created_by ?? '관리자'}</strong>
              <span>{formatDate(reply.reg_date)}</span>
              <p>{plainText(reply.content)}</p>
            </article>
          )) : (
            <p className="api-note">등록된 답변이 없습니다.</p>
          )}
          <a className="secondary-link" href="/board/qa/index">목록으로</a>
        </section>
      </main>
    </Layout>
  );
}

function ChargeInfoPage() {
  const [auth] = useState(readAuthSession);
  const [state, setState] = useState({
    loading: true,
    error: '',
    counts: { total_count: 0, operating_count: 0, ended_count: 0 },
    items: [],
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const response = await fetchChargePlans();
        if (!active) return;
        setState({
          loading: false,
          error: '',
          counts: response.counts ?? { total_count: 0, operating_count: 0, ended_count: 0 },
          items: response.items ?? [],
        });
      } catch (error) {
        if (!active) return;
        setState({
          loading: false,
          error: `요금안내 조회 실패: ${error.message}`,
          counts: { total_count: 0, operating_count: 0, ended_count: 0 },
          items: [],
        });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const operatingItems = state.items.filter((item) => item.status === '운영');
  const visibleItems = operatingItems.length ? operatingItems : state.items;
  const currentChargeCode = auth?.user?.charge_code ?? auth?.user?.current_charge_code ?? null;
  const currentCharge = state.items.find((item) => item.charge_code === currentChargeCode) ?? null;

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="요금안내" text="큐빅아이 서비스 이용요금과 적용기간을 확인합니다." />
        <section className="support-summary">
          <div>
            <span>전체 요금제</span>
            <strong>{state.loading ? '조회 중' : `${state.counts.total_count.toLocaleString('ko-KR')}건`}</strong>
          </div>
          <div>
            <span>운영중</span>
            <strong>{state.counts.operating_count.toLocaleString('ko-KR')}건</strong>
          </div>
          <div>
            <span>종료</span>
            <strong>{state.counts.ended_count.toLocaleString('ko-KR')}건</strong>
          </div>
        </section>
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        <section className="form-panel">
          <h2>현재 이용요금</h2>
          {currentCharge ? (
            <div className="field-grid">
              <ReadOnlyField label="요금코드" value={currentCharge.charge_code} />
              <ReadOnlyField label="요금명" value={currentCharge.charge_name} />
              <ReadOnlyField label="금액" value={formatAmount(currentCharge.amount)} />
              <ReadOnlyField label="상태" value={currentCharge.status} />
            </div>
          ) : (
            <p className="api-note">사용자 현재 이용요금 조회 API는 아직 연결되지 않았습니다. 운영 재현 시 회원 요금 변경/결제 이력 API와 연결이 필요합니다.</p>
          )}
          <p className="api-note">결제 식별정보, 카드번호, 계좌번호는 사용자 화면과 git 대상 산출물에 저장하지 않습니다.</p>
        </section>
        <section className="charge-plan-grid">
          {visibleItems.length ? visibleItems.map((item) => (
            <article key={item.charge_code}>
              <div>
                <span>{formatChargeType(item.charge_type)}</span>
                <strong>{item.status}</strong>
              </div>
              <h2>{item.charge_name}</h2>
              <p className="charge-price">{formatAmount(item.amount)}</p>
              <dl>
                <div><dt>기간</dt><dd>{formatPeriod(item.period, item.period_unit)}</dd></div>
                <div><dt>매출 기준</dt><dd>{item.sales_count ?? '-'}</dd></div>
                <div><dt>상품 기준</dt><dd>{item.product_count ?? '-'}</dd></div>
                <div><dt>적용일</dt><dd>{formatDate(item.start_date)} ~ {formatDate(item.expire_date)}</dd></div>
              </dl>
              <p>{item.charge_detail ?? '상세 조건은 관리자 설정 기준으로 적용됩니다.'}</p>
              <a className="secondary-link" href={`/chargeInfo/${encodeURIComponent(item.charge_code)}`}>상세보기</a>
            </article>
          )) : (
            <p className="api-note">{state.loading ? '조회 중입니다.' : '등록된 요금제가 없습니다.'}</p>
          )}
        </section>
        <section className="data-table-wrap">
          <h2>전체 요금제</h2>
          <table>
            <thead>
              <tr>
                <th>요금코드</th>
                <th>요금명</th>
                <th>구분</th>
                <th>상태</th>
                <th>금액</th>
                <th>기간</th>
                <th>적용일</th>
              </tr>
            </thead>
            <tbody>
              {state.items.length ? state.items.map((item) => (
                <tr key={item.charge_code}>
                  <td>{item.charge_code}</td>
                  <td><a className="support-title-link" href={`/chargeInfo/${encodeURIComponent(item.charge_code)}`}>{item.charge_name}</a></td>
                  <td>{formatChargeType(item.charge_type)}</td>
                  <td>{item.status}</td>
                  <td>{formatAmount(item.amount)}</td>
                  <td>{formatPeriod(item.period, item.period_unit)}</td>
                  <td>{formatDate(item.start_date)} ~ {formatDate(item.expire_date)}</td>
                </tr>
              )) : (
                <tr><td colSpan="7">{state.loading ? '조회 중입니다.' : '등록된 요금제가 없습니다.'}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </Layout>
  );
}

function ChargeDetailPage({ chargeCode }) {
  const [state, setState] = useState({ loading: true, error: '', detail: null });

  useEffect(() => {
    let active = true;
    async function load() {
      setState({ loading: true, error: '', detail: null });
      try {
        const response = await fetchJson(`/v1/api/preferences/charges/${encodeURIComponent(chargeCode)}`);
        if (!active) return;
        setState({ loading: false, error: '', detail: response });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: `요금 상세 조회 실패: ${error.message}`, detail: null });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [chargeCode]);

  const charge = state.detail;

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="요금 상세" text="선택한 요금제의 운영 조건을 확인합니다." />
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        <section className="data-table-wrap">
          <h2>요금 조건</h2>
          {state.loading ? <p className="api-note">조회 중입니다.</p> : null}
          {charge ? (
            <div className="support-detail">
              <dl>
                <div><dt>요금코드</dt><dd>{charge.charge_code}</dd></div>
                <div><dt>요금명</dt><dd>{charge.charge_name}</dd></div>
                <div><dt>구분</dt><dd>{formatChargeType(charge.charge_type)}</dd></div>
                <div><dt>상태</dt><dd>{charge.status}</dd></div>
                <div><dt>금액</dt><dd>{formatAmount(charge.amount)}</dd></div>
                <div><dt>기간</dt><dd>{formatPeriod(charge.period, charge.period_unit)}</dd></div>
                <div><dt>매출 기준</dt><dd>{charge.sales_count ?? '-'}</dd></div>
                <div><dt>상품 기준</dt><dd>{charge.product_count ?? '-'}</dd></div>
                <div><dt>적용일</dt><dd>{formatDate(charge.start_date)} ~ {formatDate(charge.expire_date)}</dd></div>
              </dl>
              <h3>{charge.charge_name}</h3>
              <p>{plainText(charge.charge_detail ?? '상세 조건은 관리자 설정 기준으로 적용됩니다.')}</p>
              <p className="api-note">사용자 결제 이력은 별도 API가 확인되지 않아 이번 화면에는 연결하지 않았습니다.</p>
            </div>
          ) : null}
          <a className="secondary-link" href="/chargeInfo">목록으로</a>
        </section>
      </main>
    </Layout>
  );
}

export { SupportBoardPage, BoardDetailPage, InquiryDetailPage, ChargeInfoPage, ChargeDetailPage };
