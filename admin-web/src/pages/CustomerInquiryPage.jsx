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
  const [formValues, setFormValues] = useState({
    keyword: '',
    inquiryType: '',
    answerStatus: '',
    orderBy: 'reg_date_desc',
  });
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
      inquiry_type: formValues.inquiryType,
      answer_status: formValues.answerStatus,
      order_by: formValues.orderBy,
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

  return (
    <>
      <div className="m-options managementOptions">
        <div className="pRight">
          <span className="baseDate pRight">
            <b>기준</b>이관 DB qna/qna_reply
          </span>
          <span className="baseDate pRight">
            <b>Workflow</b>{workflowStatus}
          </span>
          <span className="baseDate pRight">
            <b>알림</b>실발송 미연동
          </span>
        </div>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="inquiryKeyword">검색</label>
            <input id="inquiryKeyword" name="keyword" type="text" value={formValues.keyword} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="inquiryType">구분</label>
            <select id="inquiryType" name="inquiryType" value={formValues.inquiryType} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="CUBICI">큐빅아이</option>
              <option value="MONEYBANK">머니뱅크</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="answerStatus">답변상태</label>
            <select id="answerStatus" name="answerStatus" value={formValues.answerStatus} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="waiting">답변대기</option>
              <option value="answered">답변완료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="inquiryOrderBy">정렬</label>
            <select id="inquiryOrderBy" name="orderBy" value={formValues.orderBy} onChange={updateFormValue}>
              <option value="reg_date_desc">최근 순</option>
              <option value="reg_date_asc">과거 순</option>
            </select>
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      {message ? <p className="formMessage error">{message}</p> : null}

      <section className="detailSection">
        <div className="summaryStrip inquirySummary">
          <span>전체 {total.toLocaleString('ko-KR')}건</span>
          <span>답변완료 {answeredCount.toLocaleString('ko-KR')}건</span>
          <span>답변대기 {waitingCount.toLocaleString('ko-KR')}건</span>
          <span>알림대기 {notificationPendingCount.toLocaleString('ko-KR')}건</span>
        </div>

        <div className="table-scroll">
          <table className="m-shadowTable inquiryTable">
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
                <th scope="col">후속상태</th>
                <th scope="col">알림</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10">조회 중입니다.</td>
                </tr>
              ) : null}
              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan="10">조회된 결과가 없습니다.</td>
                </tr>
              ) : null}
              {!isLoading && rows.map((item, index) => (
                <tr key={item.qna_id}>
                  <td>{offset + index + 1}</td>
                  <td>{item.visibility_label}</td>
                  <td>{item.type_label}</td>
                  <td>{item.created_by ?? '-'}</td>
                  <td className="subject">
                    <button className="linkButton" type="button" onClick={() => loadDetail(item.qna_id)}>
                      {item.title}
                    </button>
                  </td>
                  <td>{formatDate(item.reg_date)}</td>
                  <td>{formatDate(item.latest_reply_date)}</td>
                  <td>
                    <span className={`sBtn rBtn ${statusClassName(item.answer_status)}`}>{item.answer_status}</span>
                  </td>
                  <td>{item.follow_up_status_label ?? '-'}</td>
                  <td>{item.notification_status_label ?? '알림 미연동'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagingControls">
          <button className="sBtn sColorN" type="button" onClick={goToPreviousPage} disabled={offset === 0}>
            이전
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button className="sBtn sColorN" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>
            다음
          </button>
        </div>
      </section>

      <section className="detailSection inquiryDetail">
        <h3>문의 상세</h3>
        {detailLoading ? <p>상세 조회 중입니다.</p> : null}
        {!detailLoading && !selected ? <p>목록에서 문의를 선택하세요.</p> : null}
        {!detailLoading && selected ? (
          <>
            <table className="detailInfoTable">
              <caption className="caption">고객문의 상세</caption>
              <tbody>
                <tr>
                  <th scope="row">제목</th>
                  <td>{selected.inquiry.title}</td>
                  <th scope="row">작성자</th>
                  <td>{selected.inquiry.created_by ?? '-'}</td>
                </tr>
                <tr>
                  <th scope="row">구분</th>
                  <td>{selected.inquiry.type_label}</td>
                  <th scope="row">공개여부</th>
                  <td>{selected.inquiry.visibility_label}</td>
                </tr>
                <tr>
                  <th scope="row">등록일자</th>
                  <td>{formatDate(selected.inquiry.reg_date)}</td>
                  <th scope="row">답변상태</th>
                  <td>{selected.inquiry.answer_status}</td>
                </tr>
                <tr>
                  <th scope="row">후속상태</th>
                  <td>{selected.inquiry.follow_up_status_label ?? '-'}</td>
                  <th scope="row">알림</th>
                  <td>{selected.inquiry.notification_status_label ?? '알림 미연동'}</td>
                </tr>
              </tbody>
            </table>
            <div className="inquiryContent">
              <h4>문의 내용</h4>
              <p>{stripHtml(selected.inquiry.content)}</p>
            </div>
            <div className="inquiryContent">
              <h4>답변</h4>
              {selected.replies.length === 0 ? (
                <p>등록된 답변이 없습니다.</p>
              ) : selected.replies.map((reply) => (
                <p key={reply.reply_id}>{stripHtml(reply.content)}</p>
              ))}
            </div>
            <form className="inquiryReplyForm" onSubmit={handleReplySave}>
              <label htmlFor="inquiryReplyContent">답변 등록/수정</label>
              <textarea
                id="inquiryReplyContent"
                name="replyContent"
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                rows={5}
              />
              <div className="inquiryReplyActions">
                <button className="sBtn sColorLB" type="submit" disabled={isSavingReply}>
                  {selected.replies.length === 0 ? '답변등록' : '답변수정'}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </section>
    </>
  );
}
