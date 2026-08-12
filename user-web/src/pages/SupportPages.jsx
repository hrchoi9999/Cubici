import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  Tabs,
  LegacyPanel,
  LegacyBoardList,
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

const supportTabs = [
  ['요금안내', '/chargeInfo'],
  ['서비스 공지', '/board/notice/index'],
  ['Q&A', '/board/qa/index'],
  ['FAQ', '/board/faq/index'],
  ['블로그', '#n'],
];

const NOTICE_PAGE_SIZE = 5;
const QA_PAGE_SIZE = 10;
const FAQ_PAGE_SIZE = 10;
const QA_TYPE_OPTIONS = [
  ['CUBICI', '큐빅아이'],
  ['가입해지', '가입해지'],
  ['서비스 소개', '서비스 소개'],
  ['MONEYBANK', '머니뱅크'],
  ['고객지원', '고객지원'],
  ['회원가입', '회원가입'],
  ['기타', '기타'],
  ['이용요금', '이용요금'],
  ['서비스이용', '서비스이용'],
];

function NoticeBoardList({ items, loading, emptyMessage, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(items.length / NOTICE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * NOTICE_PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + NOTICE_PAGE_SIZE);
  const pageButtonCount = Math.min(totalPages, 5);
  const firstVisiblePage = Math.min(
    Math.max(1, currentPage - 2),
    Math.max(1, totalPages - pageButtonCount + 1),
  );
  const visiblePages = Array.from({ length: pageButtonCount }, (_, index) => firstVisiblePage + index);

  return (
    <section className="u18-notice-board">
      <div className="table-r-border">
        <div className="board-table u18-notice-table">
          <table>
            <colgroup>
              <col className="u18-col-number" />
              <col className="u18-col-type" />
              <col />
              <col className="u18-col-date" />
              <col className="u18-col-action" />
            </colgroup>
            <thead>
              <tr>
                <th className="pc">NO.</th>
                <th>구분</th>
                <th>제목</th>
                <th>등록일</th>
                <th>공지사항</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length ? pageItems.map((item, index) => {
                const href = `/board/notice/${encodeURIComponent(item.post_id)}`;
                return (
                  <tr key={`notice-${item.post_id}`}>
                    <td className="num pc">{items.length - startIndex - index}</td>
                    <td className="type">{item.type_label ?? item.type ?? '-'}</td>
                    <td className="title"><a href={href}>{item.title ?? '-'}</a></td>
                    <td className="date">{formatDate(item.reg_date)}</td>
                    <td className="answer"><a className="btn rs-btn btn-color1" href={href}>공지보기</a></td>
                  </tr>
                );
              }) : (
                <tr className="null"><td colSpan="5">{loading ? '조회 중입니다.' : emptyMessage}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <nav aria-label="서비스 공지 페이지" className="u18-pagination">
        <button aria-label="첫 페이지" disabled={currentPage === 1} onClick={() => onPageChange(1)} type="button">«</button>
        <button aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} type="button">‹</button>
        {visiblePages.map((pageNumber) => (
          <button aria-current={currentPage === pageNumber ? 'page' : undefined} className={currentPage === pageNumber ? 'active' : ''} key={pageNumber} onClick={() => onPageChange(pageNumber)} type="button">{pageNumber}</button>
        ))}
        <button aria-label="다음 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} type="button">›</button>
        <button aria-label="마지막 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} type="button">»</button>
      </nav>
    </section>
  );
}

function QaBoardList({ items, loading, emptyMessage, page, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / QA_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * QA_PAGE_SIZE;
  const pageButtonCount = Math.min(totalPages, 5);
  const firstVisiblePage = Math.min(
    Math.max(1, currentPage - 2),
    Math.max(1, totalPages - pageButtonCount + 1),
  );
  const visiblePages = Array.from({ length: pageButtonCount }, (_, index) => firstVisiblePage + index);

  return (
    <section className="u18-notice-board u19-qa-board">
      <div className="table-r-border">
        <div className="board-table u18-notice-table u19-qa-table">
          <table>
            <colgroup>
              <col className="u19-col-number" />
              <col className="u19-col-type" />
              <col className="u19-col-writer" />
              <col />
              <col className="u19-col-date" />
              <col className="u19-col-answer" />
            </colgroup>
            <thead>
              <tr>
                <th className="pc">NO.</th>
                <th>구분</th>
                <th>작성자</th>
                <th>제목</th>
                <th>등록일</th>
                <th>답변상태</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((item, index) => {
                const href = `/board/qa/${encodeURIComponent(item.qna_id)}`;
                const answered = String(item.answer_status ?? '').includes('완료');
                return (
                  <tr key={`qa-${item.qna_id}`}>
                    <td className="num pc">{total - startIndex - index}</td>
                    <td className="type">{item.type_label ?? item.type ?? '-'}</td>
                    <td className="writer">{item.created_by ?? '-'}</td>
                    <td className="title"><a href={href}>{item.title ?? '-'}</a></td>
                    <td className="date">{formatDate(item.reg_date)}</td>
                    <td className="answer"><span className={answered ? 'completion' : 'u19-waiting'}>{answered ? '답변완료' : item.answer_status ?? '답변대기'}</span></td>
                  </tr>
                );
              }) : (
                <tr className="null"><td colSpan="6">{loading ? '조회 중입니다.' : emptyMessage}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <nav aria-label="Q&A 페이지" className="u18-pagination u19-pagination">
        <button aria-label="첫 페이지" disabled={currentPage === 1} onClick={() => onPageChange(1)} type="button">«</button>
        <button aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} type="button">‹</button>
        {visiblePages.map((pageNumber) => (
          <button aria-current={currentPage === pageNumber ? 'page' : undefined} className={currentPage === pageNumber ? 'active' : ''} key={pageNumber} onClick={() => onPageChange(pageNumber)} type="button">{pageNumber}</button>
        ))}
        <button aria-label="다음 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} type="button">›</button>
        <button aria-label="마지막 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} type="button">»</button>
      </nav>
    </section>
  );
}

function FaqBoardList({ items, loading, emptyMessage, page, onPageChange, openFaqId, onToggle }) {
  const totalPages = Math.max(1, Math.ceil(items.length / FAQ_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * FAQ_PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + FAQ_PAGE_SIZE);
  const pageButtonCount = Math.min(totalPages, 5);
  const firstVisiblePage = Math.min(
    Math.max(1, currentPage - 2),
    Math.max(1, totalPages - pageButtonCount + 1),
  );
  const visiblePages = Array.from({ length: pageButtonCount }, (_, index) => firstVisiblePage + index);

  return (
    <section className="u18-notice-board u20-faq-board">
      <div className="table-r-border">
        <div className="board-table u18-notice-table u20-faq-table">
          <table>
            <colgroup>
              <col className="u20-col-number" />
              <col className="u20-col-type" />
              <col />
              <col className="u20-col-answer" />
            </colgroup>
            <thead>
              <tr>
                <th className="pc">NO.</th>
                <th>구분</th>
                <th>제목</th>
                <th>답변</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length ? pageItems.map((item, index) => {
                const itemId = String(item.post_id);
                const isOpen = openFaqId === itemId;
                const numericId = Number(item.post_id);
                const displayNumber = Number.isFinite(numericId) ? numericId : items.length - startIndex - index;
                return (
                  <Fragment key={`faq-${itemId}`}>
                    <tr className={isOpen ? 'u20-faq-question active' : 'u20-faq-question'}>
                      <td className="num pc">{displayNumber}</td>
                      <td className="type">{item.type_label ?? item.type ?? '-'}</td>
                      <td className="title">{item.title ?? '-'}</td>
                      <td className="answer"><button aria-expanded={isOpen} className="btn u20-faq-toggle" onClick={() => onToggle(itemId)} type="button">{isOpen ? '닫기' : '보기'}</button></td>
                    </tr>
                    {isOpen ? (
                      <tr className="u20-faq-answer-row">
                        <td colSpan="4"><div><strong>A.</strong><p>{plainText(item.content)}</p></div></td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              }) : (
                <tr className="null"><td colSpan="4">{loading ? '조회 중입니다.' : emptyMessage}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <nav aria-label="FAQ 페이지" className="u18-pagination u20-pagination">
        <button aria-label="첫 페이지" disabled={currentPage === 1} onClick={() => onPageChange(1)} type="button">«</button>
        <button aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} type="button">‹</button>
        {visiblePages.map((pageNumber) => (
          <button aria-current={currentPage === pageNumber ? 'page' : undefined} className={currentPage === pageNumber ? 'active' : ''} key={pageNumber} onClick={() => onPageChange(pageNumber)} type="button">{pageNumber}</button>
        ))}
        <button aria-label="다음 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} type="button">›</button>
        <button aria-label="마지막 페이지" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} type="button">»</button>
      </nav>
    </section>
  );
}

function SupportBoardPage({ kind, mode = 'list' }) {
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
  const [noticeSearchInput, setNoticeSearchInput] = useState('');
  const [noticeSearchQuery, setNoticeSearchQuery] = useState('');
  const [noticePage, setNoticePage] = useState(1);
  const [qaSearchInput, setQaSearchInput] = useState('');
  const [qaSearchQuery, setQaSearchQuery] = useState('');
  const [qaPage, setQaPage] = useState(1);
  const [faqSearchInput, setFaqSearchInput] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqPage, setFaqPage] = useState(1);
  const [openFaqId, setOpenFaqId] = useState(null);
  const isQaWrite = kind === 'qa' && mode === 'write';

  useEffect(() => {
    let active = true;
    async function load() {
      if (isQaWrite) {
        setState((current) => ({ ...current, loading: false, error: '' }));
        return;
      }
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
        const qaQuery = new URLSearchParams({
          limit: String(QA_PAGE_SIZE),
          offset: String((qaPage - 1) * QA_PAGE_SIZE),
          user_no: String(userNo),
        });
        if (qaSearchQuery) qaQuery.set('keyword', qaSearchQuery);
        const path = kind === 'qa'
          ? `/v1/api/support/inquiries?${qaQuery.toString()}`
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
  }, [config.endpoint, isQaWrite, kind, qaPage, qaSearchQuery, userNo]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitInquiry(event) {
    event?.preventDefault();
    if (!userNo) {
      setSubmitState({ submitting: false, message: '로그인 후 문의를 등록할 수 있습니다.' });
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setSubmitState({ submitting: false, message: '제목과 내용을 입력해 주세요.' });
      return;
    }
    setSubmitState({ submitting: true, message: '문의 등록 중' });
    try {
      const response = await createInquiryForUser({
        user_no: userNo,
        type: form.type,
        title: form.title.trim(),
        content: form.content.trim(),
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
  const noticeItems = useMemo(() => {
    if (kind !== 'notice' || !noticeSearchQuery) return state.items;
    const query = noticeSearchQuery.toLocaleLowerCase('ko-KR');
    return state.items.filter((item) => [item.title, item.type_label, item.type, item.content]
      .some((value) => String(value ?? '').toLocaleLowerCase('ko-KR').includes(query)));
  }, [kind, noticeSearchQuery, state.items]);
  const faqItems = useMemo(() => {
    if (kind !== 'faq' || !faqSearchQuery) return state.items;
    const query = faqSearchQuery.toLocaleLowerCase('ko-KR');
    return state.items.filter((item) => [item.title, item.type_label, item.type, item.content]
      .some((value) => String(value ?? '').toLocaleLowerCase('ko-KR').includes(query)));
  }, [faqSearchQuery, kind, state.items]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(noticeItems.length / NOTICE_PAGE_SIZE));
    setNoticePage((current) => Math.min(current, totalPages));
  }, [noticeItems.length]);

  useEffect(() => {
    if (kind !== 'qa') return;
    const totalPages = Math.max(1, Math.ceil(state.total / QA_PAGE_SIZE));
    setQaPage((current) => Math.min(current, totalPages));
  }, [kind, state.total]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(faqItems.length / FAQ_PAGE_SIZE));
    setFaqPage((current) => Math.min(current, totalPages));
    setOpenFaqId(null);
  }, [faqItems.length]);

  function submitNoticeSearch(event) {
    event.preventDefault();
    setNoticeSearchQuery(noticeSearchInput.trim());
    setNoticePage(1);
  }

  function submitQaSearch(event) {
    event.preventDefault();
    setQaSearchQuery(qaSearchInput.trim());
    setQaPage(1);
  }

  function submitFaqSearch(event) {
    event.preventDefault();
    setFaqSearchQuery(faqSearchInput.trim());
    setFaqPage(1);
    setOpenFaqId(null);
  }

  return (
    <Layout>
      <PageTitle title="고객지원" />
      <Tabs activeHref={kind === 'qa' ? '/board/qa/index' : null} tabs={supportTabs} />
      <main className={`content-wrap ${kind === 'notice' ? 'c5p2 u18-notice-page' : kind === 'qa' ? `${isQaWrite ? 'qnawrite u21-qa-write-page' : 'c5p3 u19-qa-page'}` : 'c5p4 u20-faq-page'} final-core-page final-support-page`} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">{config.title}</h2>
          <div className="inner">
        {kind !== 'notice' && kind !== 'qa' && kind !== 'faq' ? <section className="support-summary">
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
        </section> : null}
        {state.error ? <p className="auth-message error">{state.error}</p> : null}
        {isQaWrite ? (
          <form className="u21-qa-write-form" onSubmit={submitInquiry}>
            <div className="form-wrap write-box">
              <div className="input-group align-center">
                <label className="input-tit" htmlFor="qa-writer">작성자</label>
                <input className="qna-input" id="qa-writer" readOnly type="text" value={auth?.user?.name ?? auth?.user?.email ?? ''} />
              </div>
              <div className="input-group align-center select-z-index">
                <label className="input-tit" htmlFor="qa-type">구분</label>
                <div className="select-wrap">
                  <select className="qna-input" id="qa-type" onChange={(event) => updateForm('type', event.target.value)} value={form.type}>
                    {QA_TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group align-center">
                <label className="input-tit" htmlFor="qa-title">제목</label>
                <input className="qna-input" id="qa-title" maxLength="50" onChange={(event) => updateForm('title', event.target.value)} placeholder="제목을 입력해 주세요. (50자 이내)" required type="text" value={form.title} />
              </div>
              <div className="input-group u21-content-group">
                <label className="input-tit" htmlFor="qa-content">내용</label>
                <textarea className="txt-box" id="qa-content" maxLength="20000" onChange={(event) => updateForm('content', event.target.value)} required value={form.content} />
              </div>
            </div>
            <div className="btn-box txt-center u21-qa-actions">
              <button className="btn m-btn btn-color1" disabled={submitState.submitting || !userNo} type="submit">{submitState.submitting ? '등록 중' : '등록'}</button>
              <a className="btn m-btn btn-color2" href="/board/qa/index">취소</a>
            </div>
            {submitState.message ? <p className={submitState.message.includes('실패') || submitState.message.includes('로그인') ? 'auth-message error' : 'auth-message success'}>{submitState.message}</p> : null}
          </form>
        ) : null}
        {kind === 'notice' ? (
          <>
            <form className="u18-notice-search" onSubmit={submitNoticeSearch}>
              <label className="hidden" htmlFor="notice-search">서비스 공지 검색</label>
              <input id="notice-search" onChange={(event) => setNoticeSearchInput(event.target.value)} placeholder="검색" type="search" value={noticeSearchInput} />
              <button aria-label="검색" type="submit"><i aria-hidden="true" className="fi icon-search-1" /></button>
            </form>
            <NoticeBoardList
              emptyMessage={noticeSearchQuery ? '검색 결과가 없습니다.' : config.empty}
              items={noticeItems}
              loading={state.loading}
              onPageChange={setNoticePage}
              page={noticePage}
            />
          </>
        ) : kind === 'qa' && !isQaWrite ? (
          <>
            <div className="u19-qa-toolbar">
              <a className="btn sm-btn u19-write-button" href="/board/qa/write">글쓰기</a>
              <form className="u18-notice-search u19-qa-search" onSubmit={submitQaSearch}>
                <label className="hidden" htmlFor="qa-search">Q&A 검색</label>
                <input id="qa-search" onChange={(event) => setQaSearchInput(event.target.value)} placeholder="검색" type="search" value={qaSearchInput} />
                <button aria-label="검색" type="submit"><i aria-hidden="true" className="fi icon-search-1" /></button>
              </form>
            </div>
            <QaBoardList
              emptyMessage={qaSearchQuery ? '검색 결과가 없습니다.' : config.empty}
              items={state.items}
              loading={state.loading}
              onPageChange={setQaPage}
              page={qaPage}
              total={state.total}
            />
          </>
        ) : kind === 'faq' ? (
          <>
            <form className="u18-notice-search u20-faq-search" onSubmit={submitFaqSearch}>
              <label className="hidden" htmlFor="faq-search">FAQ 검색</label>
              <input id="faq-search" onChange={(event) => setFaqSearchInput(event.target.value)} placeholder="검색" type="search" value={faqSearchInput} />
              <button aria-label="검색" type="submit"><i aria-hidden="true" className="fi icon-search-1" /></button>
            </form>
            <FaqBoardList
              emptyMessage={faqSearchQuery ? '검색 결과가 없습니다.' : config.empty}
              items={faqItems}
              loading={state.loading}
              onPageChange={(pageNumber) => {
                setFaqPage(pageNumber);
                setOpenFaqId(null);
              }}
              onToggle={(itemId) => setOpenFaqId((current) => (current === itemId ? null : itemId))}
              openFaqId={openFaqId}
              page={faqPage}
            />
          </>
        ) : !isQaWrite ? (
          <LegacyBoardList
            title={`${config.title} 목록`}
            items={visibleItems}
            kind={kind}
            loading={state.loading}
            emptyMessage={config.empty}
          />
        ) : null}
          </div>
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
      <PageTitle title="고객지원" />
      <Tabs activeHref={`/board/${kind}/index`} centerActiveOnMobile={false} className="u25-support-tabs" tabs={supportTabs} />
      <main className={`content-wrap view u25-support-detail-page u25-${kind}-detail-page final-core-page final-support-page final-support-detail-page`} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">{`${config.title} 상세`}</h2>
          <div className="inner">
            {state.error ? <p className="auth-message error">{state.error}</p> : null}
            {state.loading ? <p className="u25-detail-loading">조회 중입니다.</p> : null}
            {post ? <LvSupportArticle article={post} /> : null}
            <SupportDetailListButton href={`/board/${kind}/index`} />
          </div>
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
      <PageTitle title="고객지원" />
      <Tabs activeHref="/board/qa/index" centerActiveOnMobile={false} className="u25-support-tabs" tabs={supportTabs} />
      <main className="content-wrap view u25-support-detail-page u25-qa-detail-page final-core-page final-support-page final-support-detail-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">Q&A 상세</h2>
          <div className="inner">
            {state.error ? <p className="auth-message error">{state.error}</p> : null}
            {state.loading ? <p className="u25-detail-loading">조회 중입니다.</p> : null}
            {inquiry ? (
              <>
                {editMode ? (
                  <section className="u25-support-article u25-support-edit noti">
                    <div className="noti-twrap"><h3 className="noti-tit">문의 수정</h3></div>
                    <div className="noti-main support-edit-form">
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
                  </section>
                ) : <LvSupportArticle article={inquiry} status={inquiry.answer_status} />}
                {canEdit ? (
                  <div className="form-actions u25-detail-actions">
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
                  <p className="u25-detail-note">답변이 등록된 문의는 수정 또는 삭제할 수 없습니다.</p>
                ) : null}
                {actionState.message ? <p className={actionState.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{actionState.message}</p> : null}
              </>
            ) : null}
            <section className="u25-reply-list" aria-label="답변">
              {replies.length ? replies.map((reply) => (
                <LvSupportArticle
                  article={{ ...reply, title: '답변', created_by: reply.created_by ?? '관리자' }}
                  className="u25-support-reply"
                  key={reply.reply_id ?? reply.id}
                />
              )) : !state.loading ? (
                <div className="u25-empty-reply"><h3>답변</h3><p>등록된 답변이 없습니다.</p></div>
              ) : null}
            </section>
            <SupportDetailListButton href="/board/qa/index" />
          </div>
        </section>
      </main>
    </Layout>
  );
}

function LvSupportArticle({ article, className = '', status = '' }) {
  const attachmentLabel = article.attachment_name
    ?? article.origin_file_name
    ?? article.attachment_status_label
    ?? '';
  const attachmentSize = article.attachment_size ?? article.file_size ?? '';
  const attachmentUrl = article.attachment_url ?? article.download_url ?? '';

  return (
    <article className={`u25-support-article noti ${className}`.trim()}>
      <header className="noti-twrap">
        <h3 className="noti-tit">{article.title ?? '-'}</h3>
        <div className="noti-write">
          {status ? <span className="u25-detail-status">{status}</span> : null}
          <p className="nwrite">작성자: <span>{article.created_by ?? '-'}</span></p>
          <time className="date" dateTime={article.reg_date ?? ''}>{formatDate(article.reg_date)}</time>
        </div>
      </header>
      <div className="noti-main">
        {attachmentLabel ? attachmentUrl ? (
          <a className="attachment" href={attachmentUrl}>
            <span>{attachmentLabel}</span>{attachmentSize ? <span>{attachmentSize}</span> : null}
          </a>
        ) : (
          <div className="attachment u25-attachment-status">
            <span>{attachmentLabel}</span>{attachmentSize ? <span>{attachmentSize}</span> : null}
          </div>
        ) : null}
        <div className="noti-mwrap">
          <h4 className="noti-mtit">{article.title ?? '-'}</h4>
          <p className="noti-mtxt">{supportArticleText(article.content)}</p>
        </div>
      </div>
    </article>
  );
}

function supportArticleText(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || '-';
}

function SupportDetailListButton({ href }) {
  return (
    <div className="btn-box txt-center u25-list-button">
      <a className="btn sm-btn btn-color1" href={href}>목록</a>
    </div>
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
      <PageTitle title="요금안내" text="큐빅아이 서비스 이용요금과 적용기간을 확인합니다." />
      <main className="content-wrap c6p2 final-core-page final-charge-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">요금안내</h2>
          <div className="inner">
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
          </div>
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
      <PageTitle title="요금안내" text="선택한 요금제의 운영 조건을 확인합니다." />
      <main className="content-wrap view final-core-page final-charge-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">요금 상세</h2>
          <div className="inner">
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

export { SupportBoardPage, BoardDetailPage, InquiryDetailPage, ChargeInfoPage, ChargeDetailPage };
