import { useEffect, useMemo, useState } from 'react';
import {
  createInquiryReply,
  fetchInquiries,
  fetchInquiryDetail,
  updateInquiryReply,
} from '../api/support.js';

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) {
    return '-';
  }
  return value.slice(0, 10);
}

function stripHtml(value) {
  if (!value) {
    return '-';
  }
  return value.replace(/<[^>]*>/g, '').trim() || '-';
}

function statusClassName(status) {
  return status === '답변완료' ? 'sColorLB' : 'sColorLG';
}

export function CustomerInquiryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState('-');
  const [notificationPendingCount, setNotificationPendingCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ order_by: 'reg_date_desc' });
  const [formValues, setFormValues] = useState({ keyword: '' });
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadInquiries() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchInquiries({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setAnsweredCount(data.answered_count ?? 0);
          setWaitingCount(data.waiting_count ?? 0);
          setWorkflowStatus(data.workflow_status_label ?? '-');
          setNotificationPendingCount(data.notification_pending_count ?? data.waiting_count ?? 0);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setAnsweredCount(0);
          setWaitingCount(0);
          setWorkflowStatus('-');
          setNotificationPendingCount(0);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInquiries();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = useMemo(() => items, [items]);

  function updateFormValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      keyword: formValues.keyword,
      order_by: 'reg_date_desc',
    });
  }

  async function loadDetail(qnaId) {
    setDetailLoading(true);
    setMessage('');

    try {
      const data = await fetchInquiryDetail(qnaId);
      setSelected(data);
      setReplyContent(stripHtml(data.replies?.[0]?.content ?? ''));
    } catch (error) {
      setSelected(null);
      setMessage(error.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function reloadCurrentList() {
    const data = await fetchInquiries({ limit: PAGE_SIZE, offset, ...filters });
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setAnsweredCount(data.answered_count ?? 0);
    setWaitingCount(data.waiting_count ?? 0);
    setWorkflowStatus(data.workflow_status_label ?? '-');
    setNotificationPendingCount(data.notification_pending_count ?? data.waiting_count ?? 0);
  }

  async function handleReplySave(event) {
    event.preventDefault();
    if (!selected) {
      return;
    }

    const trimmedContent = replyContent.trim();
    if (!trimmedContent) {
      setMessage('답변 내용을 입력하세요.');
      return;
    }

    setIsSavingReply(true);
    setMessage('');

    try {
      const payload = {
        content: trimmedContent,
        user_no: 99,
        operated_by: 'admin',
      };
      const firstReply = selected.replies?.[0];
      const result = firstReply
        ? await updateInquiryReply(selected.inquiry.qna_id, firstReply.reply_id, payload)
        : await createInquiryReply(selected.inquiry.qna_id, payload);

      setSelected(result.detail);
      setReplyContent(stripHtml(result.detail.replies?.[0]?.content ?? ''));
      await reloadCurrentList();
      setMessage(result.action === 'created' ? '답변을 등록했습니다.' : '답변을 수정했습니다.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSavingReply(false);
    }
  }

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= total ? value : next;
    });
  }

  function goToPage(page) {
    setOffset((page - 1) * PAGE_SIZE);
    setSelected(null);
  }

  function returnToList() {
    setSelected(null);
    setReplyContent('');
    setMessage('');
  }

  const visiblePages = Array.from(
    { length: Math.min(10, pageCount) },
    (_, index) => Math.floor((currentPage - 1) / 10) * 10 + index + 1,
  ).filter((page) => page <= pageCount);

  return (
    <section className="customerInquiryLvPage">
      {!selected ? (
        <>
          <div className="customerInquiryLvMeta" aria-label={`전체 ${total}건, 답변완료 ${answeredCount}건, 답변대기 ${waitingCount}건, 알림대기 ${notificationPendingCount}건, workflow ${workflowStatus}`} />
          <form className="customerInquiryLvToolbar" onSubmit={handleSearch}>
            <div className="customerInquiryLvSearch">
              <input
                aria-label="검색"
                id="inquiryKeyword"
                name="keyword"
                placeholder="검색"
                type="search"
                value={formValues.keyword}
                onChange={updateFormValue}
              />
              <button aria-label="검색" className="oiBtn search" title="검색" type="submit" />
            </div>
          </form>

          {message ? <p className="formMessage error">{message}</p> : null}

          <div className="customerInquiryLvList">
            <div className="table-scroll">
              <table className="inquiryTable inquiryLvTable">
                <caption className="caption">고객문의 목록</caption>
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">공개여부</th>
                    <th scope="col">구분</th>
                    <th scope="col">작성자</th>
                    <th scope="col">제목</th>
                    <th scope="col">등록일자</th>
                    <th scope="col">답변일자</th>
                    <th scope="col">답변상태</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <tr><td colSpan="8">조회 중입니다.</td></tr> : null}
                  {!isLoading && rows.length === 0 ? <tr><td colSpan="8">조회된 결과가 없습니다.</td></tr> : null}
                  {!isLoading && rows.map((item, index) => (
                    <tr key={item.qna_id}>
                      <td>{total - offset - index}</td>
                      <td>{item.visibility_label}</td>
                      <td>{item.type_label}</td>
                      <td>{item.created_by ?? '-'}</td>
                      <td className="subject">
                        <button className="linkButton" type="button" onClick={() => loadDetail(item.qna_id)}>
                          {item.title}
                        </button>
                      </td>
                      <td>{formatDate(item.reg_date)}</td>
                      <td>{item.latest_reply_date ? formatDate(item.latest_reply_date) : '답변요청'}</td>
                      <td>
                        <span className={`sBtn rBtn ${statusClassName(item.answer_status)}`}>{item.answer_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="lvBoardPager" aria-label="고객문의 페이지">
              <button type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
              {visiblePages.map((page) => (
                <button
                  className={page === currentPage ? 'active' : ''}
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
            </nav>
          </div>
        </>
      ) : null}

      {detailLoading && !selected ? <p className="customerInquiryLvLoading">상세 조회 중입니다.</p> : null}

      {selected ? (
        <section className="customerInquiryLvDetail">
          <div className="customerInquiryLvDetailTitle">
            <h3>{selected.inquiry.title}</h3>
            <dl>
              <div><dt>작성자</dt><dd>{selected.inquiry.created_by ?? '-'}</dd></div>
              <div><dt>회원번호</dt><dd>{selected.inquiry.user_no ?? '-'}</dd></div>
              <div><dt>구분</dt><dd>{selected.inquiry.type_label}</dd></div>
              <div><dt>공개여부</dt><dd>{selected.inquiry.visibility_label}</dd></div>
              <div><dt>작성일</dt><dd>{formatDate(selected.inquiry.reg_date)}</dd></div>
            </dl>
          </div>

          <div className="customerInquiryLvArticle">
            <h4>문의 내용</h4>
            <p>{stripHtml(selected.inquiry.content)}</p>
          </div>

          <div className="customerInquiryLvArticle customerInquiryLvReply">
            <h4>답변</h4>
            {selected.replies.length === 0 ? <p>등록된 답변이 없습니다.</p> : selected.replies.map((reply) => (
              <p key={reply.reply_id}>{stripHtml(reply.content)}</p>
            ))}
          </div>

          <dl className="customerInquiryLvWorkflow">
            <div><dt>답변상태</dt><dd>{selected.inquiry.answer_status}</dd></div>
            <div><dt>후속상태</dt><dd>{selected.inquiry.follow_up_status_label ?? '-'}</dd></div>
            <div><dt>알림</dt><dd>{selected.inquiry.notification_status_label ?? '알림 미연동'}</dd></div>
          </dl>

          <form className="inquiryReplyForm" onSubmit={handleReplySave}>
            <label htmlFor="inquiryReplyContent">답변 등록/수정</label>
            <textarea
              id="inquiryReplyContent"
              name="replyContent"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              rows={5}
            />
            {message ? <p className="formMessage">{message}</p> : null}
            <div className="customerInquiryLvActions">
              <button className="bBtn2 sColorLB" type="submit" disabled={isSavingReply}>
                {selected.replies.length === 0 ? '답변등록' : '답변수정'}
              </button>
              <button className="bBtn2 sColorN" type="button" onClick={returnToList}>목록</button>
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
}
