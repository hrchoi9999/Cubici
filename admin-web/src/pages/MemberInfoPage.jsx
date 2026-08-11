import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMemberInfo } from '../api/management.js';

const PAGE_SIZE = 20;

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

export function MemberInfoPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, cubici_count: 0, moneybank_count: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    use_service: 'all',
    order_by: 'reg_date_desc',
  });
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userId: '',
    useService: 'all',
    fromDate: filters.from_date,
    toDate: filters.to_date,
    orderBy: 'reg_date_desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const listScrollRef = useRef(null);
  const [listScroll, setListScroll] = useState({ left: 0, max: 0 });

  useEffect(() => {
    let ignore = false;

    async function loadMembers() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMemberInfo({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? { total_count: 0, cubici_count: 0, moneybank_count: 0 });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, cubici_count: 0, moneybank_count: 0 });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  useEffect(() => {
    const container = listScrollRef.current;
    if (!container) {
      return undefined;
    }

    function updateScrollState() {
      setListScroll({
        left: Math.round(container.scrollLeft),
        max: Math.max(0, Math.round(container.scrollWidth - container.clientWidth)),
      });
    }

    updateScrollState();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [rows]);

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
      use_service: formValues.useService,
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

  function moveListScroll(direction) {
    const container = listScrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: container.scrollLeft + direction * Math.max(240, container.clientWidth * 0.65),
      behavior: 'smooth',
    });
  }

  function changeListScroll(event) {
    listScrollRef.current?.scrollTo({ left: Number(event.target.value) });
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
          <li className="active"><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
          <li><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="memberInfoName">회원명</label>
            <input id="memberInfoName" name="userName" type="text" value={formValues.userName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoFirm">회사명</label>
            <input id="memberInfoFirm" name="firmName" type="text" value={formValues.firmName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoId">회원ID</label>
            <input id="memberInfoId" name="userId" type="text" value={formValues.userId} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoService">이용 서비스</label>
            <select id="memberInfoService" name="useService" value={formValues.useService} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="cubici">큐빅아이</option>
              <option value="moneybank">머니뱅크</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoFrom">가입 시작</label>
            <input id="memberInfoFrom" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoTo">가입 종료</label>
            <input id="memberInfoTo" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberInfoOrder">보기설정</label>
            <select id="memberInfoOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">가입일자 최신</option>
              <option value="reg_date_asc">가입일자 과거</option>
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
        <span>큐빅아이 회원 {formatNumber(counts.cubici_count)}명</span>
        <span>머니뱅크 회원 {formatNumber(counts.moneybank_count)}명</span>
        <span>{isLoading ? '조회 중' : `페이지 ${currentPage} / ${pageCount}`}</span>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll" ref={listScrollRef}>
        <table className="m-table memberInfoTable">
          <thead>
            <tr>
              <th>이용서비스</th>
              <th>가입일자</th>
              <th>회원ID</th>
              <th>회원명</th>
              <th>회사명</th>
              <th>핸드폰</th>
              <th>대표전화</th>
              <th>운영몰</th>
              <th>주소</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user_no}>
                <td><span className={`sBtn ${row.service_code === 'moneybank' ? 'sColorN' : 'sColorLS'} rBtn`}>{row.service_label}</span></td>
                <td>{formatDate(row.reg_date)}</td>
                <td>{row.user_id ?? '-'}</td>
                <td className="subject"><a href={`/admin/cubici/manageMember/userstatus?code=${encodeURIComponent(row.user_no)}`}>{row.user_name ?? '-'}</a></td>
                <td className="subject">{row.firm_name ?? '-'}</td>
                <td>{row.phone ?? '-'}</td>
                <td>{row.firm_tel ?? '-'}</td>
                <td>{formatNumber(row.shop_count)}</td>
                <td className="subject">{row.address ?? '-'}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="9">조회된 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {listScroll.max > 0 ? <div className="horizontalTableScrollbar" aria-label="회원정보 목록 좌우 스크롤">
        <button type="button" aria-label="회원정보 목록 왼쪽으로 스크롤" onClick={() => moveListScroll(-1)} disabled={listScroll.left <= 0}>&lt;</button>
        <input
          type="range"
          aria-label="회원정보 목록 가로 스크롤"
          min="0"
          max={listScroll.max}
          step="1"
          value={Math.min(listScroll.left, listScroll.max)}
          onChange={changeListScroll}
        />
        <button type="button" aria-label="회원정보 목록 오른쪽으로 스크롤" onClick={() => moveListScroll(1)} disabled={listScroll.left >= listScroll.max}>&gt;</button>
      </div> : null}

      <div className="pagination">
        <button className="m-btn" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button className="m-btn" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
      </div>
    </>
  );
}
