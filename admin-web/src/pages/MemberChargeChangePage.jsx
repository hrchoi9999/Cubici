import { useEffect, useMemo, useState } from 'react';
import {
  fetchMemberChargeChangeRefund,
  fetchMemberChargeChanges,
  finishMemberChargeChangeRefund,
} from '../api/management.js';

const PAGE_SIZE = 20;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function beforeIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function formatPhone(value) {
  const raw = String(value ?? '').replaceAll('-', '');
  if (raw.length === 11) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  }
  return value || '-';
}

export function MemberChargeChangePage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    total_count: 0,
    change_count: 0,
    termination_count: 0,
    refund_pending_count: 0,
  });
  const [sums, setSums] = useState({ add_amount: 0, refund_amount: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: beforeIso(3650),
    to_date: todayIso(),
    division: 'all',
    order_by: 'payment_date_desc',
  });
  const [formValues, setFormValues] = useState({
    division: 'all',
    chargeCode: '',
    userName: '',
    userId: '',
    firmName: '',
    fromDate: filters.from_date,
    toDate: filters.to_date,
    orderBy: 'payment_date_desc',
  });
  const [refundDetail, setRefundDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMemberChargeChanges({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
          setSums(data.sums ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, change_count: 0, termination_count: 0, refund_pending_count: 0 });
          setSums({ add_amount: 0, refund_amount: 0 });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setFilters({
      division: formValues.division,
      charge_code: formValues.chargeCode,
      user_name: formValues.userName,
      user_id: formValues.userId,
      firm_name: formValues.firmName,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
  }

  async function openRefund(row) {
    setMessage('');
    try {
      const detail = await fetchMemberChargeChangeRefund(row.seq);
      setRefundDetail(detail);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function finishRefund() {
    if (!refundDetail) {
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      await finishMemberChargeChangeRefund(refundDetail.new_seq, refundDetail.seq);
      setRefundDetail(null);
      setFilters((current) => ({ ...current }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= counts.total_count ? value : next;
    });
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li><a href="/admin/cubici/manageMember/payment_tab1">결제 현황</a></li>
          <li className="active"><a href="/admin/cubici/manageMember/payment_tab2">요금변경 관리</a></li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="chargeChangeDivision">구분</label>
            <select id="chargeChangeDivision" name="division" value={formValues.division} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="C">변경</option>
              <option value="R">해지</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeCode">요금제</label>
            <input id="chargeChangeCode" name="chargeCode" type="text" value={formValues.chargeCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeFrom">변경 시작</label>
            <input id="chargeChangeFrom" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeTo">변경 종료</label>
            <input id="chargeChangeTo" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeUserName">회원명</label>
            <input id="chargeChangeUserName" name="userName" type="text" value={formValues.userName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeUserId">회원ID</label>
            <input id="chargeChangeUserId" name="userId" type="text" value={formValues.userId} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeFirmName">회사명</label>
            <input id="chargeChangeFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeChangeOrder">보기기준</label>
            <select id="chargeChangeOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="payment_date_desc">최근 순</option>
              <option value="change_date_desc">변경일 최신</option>
              <option value="change_date_asc">변경일 과거</option>
              <option value="amount_desc">차액 높은순</option>
              <option value="name_asc">회원명</option>
              <option value="firm_name_asc">회사명</option>
            </select>
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      <div className="inquirySummary paymentSummary">
        <span>전체 {formatNumber(counts.total_count)}건</span>
        <span>변경 {formatNumber(counts.change_count)}건</span>
        <span>해지 {formatNumber(counts.termination_count)}건</span>
        <span>환급대기 {formatNumber(counts.refund_pending_count)}건</span>
        <span>추가 {formatNumber(sums.add_amount)}원</span>
        <span>환급 {formatNumber(sums.refund_amount)}원</span>
        <span>{isLoading ? '조회 중' : `페이지 ${currentPage} / ${pageCount}`}</span>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll">
        <table className="m-table memberChargeChangeTable">
          <thead>
            <tr>
              <th>No</th>
              <th>구분</th>
              <th>이용 요금제</th>
              <th>가입일자</th>
              <th>회원ID</th>
              <th>회원명</th>
              <th>회사명</th>
              <th>핸드폰</th>
              <th>대표전화</th>
              <th>등록 쇼핑몰</th>
              <th>주소</th>
              <th>변경 신청일</th>
              <th>이전 서비스</th>
              <th>추가</th>
              <th>환급</th>
              <th>환급상태</th>
              <th>예금주</th>
              <th>은행</th>
              <th>계좌</th>
              <th>변경 일자</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.seq}>
                <td>{row.row_no}</td>
                <td>{row.status}</td>
                <td>{row.charge_name || '-'}</td>
                <td>{formatDate(row.start_date)}</td>
                <td>{row.user_id ?? '-'}</td>
                <td className="subject">{row.user_name ?? '-'}</td>
                <td className="subject">{row.firm_name ?? '-'}</td>
                <td>{formatPhone(row.user_phone)}</td>
                <td>{formatPhone(row.firm_tel)}</td>
                <td>{formatNumber(row.shop_count)}</td>
                <td className="subject">{row.firm_addr ?? '-'}</td>
                <td>{formatDate(row.change_date)}</td>
                <td>{row.before_charge ?? '-'}</td>
                <td>{row.pay_status === '추가' ? `${formatNumber(row.amount)}원` : '0원'}</td>
                <td>{row.pay_status === '환급' ? `${formatNumber(row.amount)}원` : '0원'}</td>
                <td>{row.refund_status_label ?? row.refund_status ?? '-'}</td>
                <td>{row.refund_user_name ?? '-'}</td>
                <td>{row.refund_bank ?? '-'}</td>
                <td>{row.refund_account ?? '-'}</td>
                <td>
                  {row.pay_status === '환급' && !row.refund_date ? (
                    <button className="sBtn sColorLB rBtn" type="button" onClick={() => openRefund(row)}>환급</button>
                  ) : formatDate(row.refund_date ?? row.change_date)}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="20">조회된 요금변경 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="m-btn" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button className="m-btn" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
      </div>

      {refundDetail ? (
        <section className="refundDetailPanel">
          <div className="refundDetailHeader">
            <h4>서비스 환급</h4>
            <button className="m-btn" type="button" onClick={() => setRefundDetail(null)}>닫기</button>
          </div>
          <div className="refundDetailGrid">
            <div><span>변경 요청 요금제</span><strong>{refundDetail.charge_name ?? '-'}</strong></div>
            <div><span>회원명</span><strong>{refundDetail.user_name ?? '-'}</strong></div>
            <div><span>회사명</span><strong>{refundDetail.firm_name ?? '-'}</strong></div>
            <div><span>핸드폰</span><strong>{formatPhone(refundDetail.user_phone)}</strong></div>
            <div><span>기존 서비스</span><strong>{refundDetail.ex_charge_name ?? '-'}</strong></div>
            <div><span>서비스만료</span><strong>{formatDate(refundDetail.expire_date)}</strong></div>
            <div><span>잔여일자</span><strong>{formatNumber(refundDetail.rest_date)}일</strong></div>
            <div><span>기존 요금제</span><strong>{formatNumber(refundDetail.ex_amount)}원</strong></div>
            <div><span>신규 요금제</span><strong>{formatNumber(refundDetail.new_amount)}원</strong></div>
            <div><span>실시간 이용요금</span><strong>{formatNumber(refundDetail.balance)}원</strong></div>
            <div><span>카드 취소</span><strong>{formatNumber(refundDetail.refund_card)}원</strong></div>
            <div><span>차액 환급</span><strong>{formatNumber(refundDetail.refund_cash)}원</strong></div>
            <div><span>예금주</span><strong>{refundDetail.refund_user_name ?? '-'}</strong></div>
            <div><span>은행</span><strong>{refundDetail.refund_bank ?? '-'}</strong></div>
            <div><span>계좌번호</span><strong>{refundDetail.refund_account ?? '-'}</strong></div>
          </div>
          <div className="refundDetailActions">
            <button className="m-btn" type="button" onClick={() => setRefundDetail(null)}>취소</button>
            <button className="m-btn m-btnPrimary" type="button" onClick={finishRefund} disabled={isSaving || !refundDetail.seq}>
              {isSaving ? '처리 중' : '환급완료'}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
