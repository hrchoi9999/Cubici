import { useEffect, useMemo, useState } from 'react';
import { fetchMemberPayments } from '../api/management.js';

const PAGE_SIZE = 20;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function beforeIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

export function MemberPaymentPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, paid_count: 0 });
  const [sums, setSums] = useState({ amount: 0, payment_fee: 0, vat: 0, profit: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: beforeIso(3650),
    to_date: todayIso(),
    user_type: 'USER',
    order_by: 'payment_date_desc',
  });
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userId: '',
    userType: 'USER',
    fromDate: filters.from_date,
    toDate: filters.to_date,
    orderBy: 'payment_date_desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadPayments() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMemberPayments({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? { total_count: 0, paid_count: 0 });
          setSums(data.sums ?? { amount: 0, payment_fee: 0, vat: 0, profit: 0 });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, paid_count: 0 });
          setSums({ amount: 0, payment_fee: 0, vat: 0, profit: 0 });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPayments();

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
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_id: formValues.userId,
      user_type: formValues.userType,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
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
          <li className="active"><a href="/admin/cubici/manageMember/payment_tab1">결제 현황</a></li>
          <li><a href="/admin/cubici/manageMember/payment_tab2">요금변경 관리</a></li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="paymentUserName">회원명</label>
            <input id="paymentUserName" name="userName" type="text" value={formValues.userName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentFirmName">회사명</label>
            <input id="paymentFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentUserId">회원ID</label>
            <input id="paymentUserId" name="userId" type="text" value={formValues.userId} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentUserType">회원구분</label>
            <select id="paymentUserType" name="userType" value={formValues.userType} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="USER">사용자</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="paymentFrom">결제 시작</label>
            <input id="paymentFrom" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentTo">결제 종료</label>
            <input id="paymentTo" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentOrder">보기설정</label>
            <select id="paymentOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="payment_date_desc">결제일자 최신</option>
              <option value="payment_date_asc">결제일자 과거</option>
              <option value="amount_desc">결제금액 높은순</option>
              <option value="amount_asc">결제금액 낮은순</option>
              <option value="name_asc">회원명</option>
              <option value="firm_name_asc">회사명</option>
            </select>
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      <div className="inquirySummary paymentSummary">
        <span>결제건수 {formatNumber(counts.total_count)}건</span>
        <span>결제금액 {formatNumber(sums.amount)}원</span>
        <span>결제수수료 {formatNumber(sums.payment_fee)}원</span>
        <span>부가세 {formatNumber(sums.vat)}원</span>
        <span>순수입 {formatNumber(sums.profit)}원</span>
        <span>{isLoading ? '조회 중' : `페이지 ${currentPage} / ${pageCount}`}</span>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll">
        <table className="m-table memberPaymentTable">
          <thead>
            <tr>
              <th>No</th>
              <th>요금제</th>
              <th>가입일자</th>
              <th>회원ID</th>
              <th>회원명</th>
              <th>회사명</th>
              <th>핸드폰</th>
              <th>대표전화</th>
              <th>쇼핑몰 수</th>
              <th>회사주소</th>
              <th>만료일자</th>
              <th>결제일자</th>
              <th>결제상태</th>
              <th>결제금액</th>
              <th>결제수수료</th>
              <th>부가세</th>
              <th>순수입</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.seq}>
                <td>{row.row_no}</td>
                <td>{row.charge_name ?? '-'}</td>
                <td>{formatDateTime(row.reg_date)}</td>
                <td>{row.user_id ?? '-'}</td>
                <td className="subject">{row.user_name ?? '-'}</td>
                <td className="subject">{row.firm_name ?? '-'}</td>
                <td>{row.user_phone ?? '-'}</td>
                <td>{row.firm_tel ?? '-'}</td>
                <td>{formatNumber(row.shop_count)}</td>
                <td className="subject">{row.firm_addr ?? '-'}</td>
                <td>{formatDateTime(row.expire_date)}</td>
                <td>{formatDateTime(row.payment_date)}</td>
                <td>{row.payment_status_label ?? row.payment_status ?? '-'}</td>
                <td>{formatNumber(row.amount)}원</td>
                <td>{formatNumber(row.payment_fee)}원</td>
                <td>{formatNumber(row.vat)}원</td>
                <td>{formatNumber(row.profit)}원</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="17">조회된 결제 데이터가 없습니다.</td>
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
    </>
  );
}
