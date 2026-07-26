import { useEffect, useMemo, useState } from 'react';
import { fetchMemberWithdrawals } from '../api/management.js';

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

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function statusClass(status) {
  if (status === 'terminated') {
    return 'sColorR';
  }
  if (status === 'requested') {
    return 'sColorY';
  }
  return 'sColorN';
}

export function MemberWithdrawalPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    total_count: 0,
    terminated_count: 0,
    requested_count: 0,
    dormant_count: 0,
    moneybank_count: 0,
    cubici_count: 0,
  });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: beforeIso(3650),
    to_date: todayIso(),
    status: 'all',
    order_by: 'event_date_desc',
  });
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userId: '',
    partnerCode: '',
    productCode: '',
    status: 'all',
    fromDate: filters.from_date,
    toDate: filters.to_date,
    orderBy: 'event_date_desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMemberWithdrawals({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({
            total_count: 0,
            terminated_count: 0,
            requested_count: 0,
            dormant_count: 0,
            moneybank_count: 0,
            cubici_count: 0,
          });
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
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_id: formValues.userId,
      partner_code: formValues.partnerCode,
      product_code: formValues.productCode,
      status: formValues.status,
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
          <li><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
          <li><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
          <li className="active"><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="withdrawalUserName">회원명</label>
            <input id="withdrawalUserName" name="userName" type="text" value={formValues.userName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalFirmName">회사명</label>
            <input id="withdrawalFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalUserId">회원ID</label>
            <input id="withdrawalUserId" name="userId" type="text" value={formValues.userId} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalStatus">구분</label>
            <select id="withdrawalStatus" name="status" value={formValues.status} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="terminated">해지</option>
              <option value="requested">해지 신청</option>
              <option value="dormant">휴면 후보</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalPartner">협력사</label>
            <input id="withdrawalPartner" name="partnerCode" type="text" value={formValues.partnerCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalProduct">서비스 구분</label>
            <input id="withdrawalProduct" name="productCode" type="text" value={formValues.productCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalFrom">시작일</label>
            <input id="withdrawalFrom" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalTo">종료일</label>
            <input id="withdrawalTo" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="withdrawalOrder">보기설정</label>
            <select id="withdrawalOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="event_date_desc">기준일 최신</option>
              <option value="event_date_asc">기준일 과거</option>
              <option value="name_asc">회원명</option>
              <option value="firm_name_asc">회사명</option>
              <option value="shop_count_desc">운영몰 수</option>
            </select>
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      <div className="inquirySummary">
        <span>전체 {formatNumber(counts.total_count)}건</span>
        <span>해지 {formatNumber(counts.terminated_count)}명</span>
        <span>해지 신청 {formatNumber(counts.requested_count)}명</span>
        <span>휴면 후보 {formatNumber(counts.dormant_count)}명</span>
        <span>큐빅아이 {formatNumber(counts.cubici_count)}명</span>
        <span>머니뱅크 {formatNumber(counts.moneybank_count)}명</span>
        <span>{isLoading ? '조회 중' : `페이지 ${currentPage} / ${pageCount}`}</span>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll">
        <table className="m-table memberWithdrawalTable">
          <thead>
            <tr>
              <th>해지신청</th>
              <th>해지서비스</th>
              <th>해지일자</th>
              <th>상태</th>
              <th>회원명</th>
              <th>회사명</th>
              <th>회원ID</th>
              <th>핸드폰</th>
              <th>운영 쇼핑몰</th>
              <th>선정산 잔액</th>
              <th>선정산 서비스</th>
              <th>최근 로그인</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.user_no}-${row.service_code}-${row.event_date ?? index}`}>
                <td>{formatDate(row.withdrawal_request_date)}</td>
                <td><span className={`sBtn ${row.service_code === 'moneybank' ? 'sColorN' : 'sColorLS'} rBtn`}>{row.service_label}</span></td>
                <td>{formatDate(row.withdrawal_date)}</td>
                <td><span className={`sBtn ${statusClass(row.withdrawal_status)} rBtn`}>{row.withdrawal_status_label}</span></td>
                <td className="subject"><a href={`/admin/cubici/manageMember/userstatus?code=${encodeURIComponent(row.user_no)}`}>{row.user_name ?? '-'}</a></td>
                <td className="subject"><a href={`/admin/cubici/manageMember/userstatus?code=${encodeURIComponent(row.user_no)}`}>{row.firm_name ?? '-'}</a></td>
                <td>{row.user_id ?? '-'}</td>
                <td>{row.phone ?? '-'}</td>
                <td>{formatNumber(row.shop_count)}개</td>
                <td>{formatNumber(row.outstanding_balance)}원</td>
                <td>{row.product_code ?? '-'}</td>
                <td>{formatDate(row.last_login_date)}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="12">조회된 데이터가 없습니다.</td>
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
