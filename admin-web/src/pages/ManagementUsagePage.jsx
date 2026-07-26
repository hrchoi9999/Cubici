import { useEffect, useMemo, useState } from 'react';
import { fetchManagementUsage } from '../api/management.js';

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return value.slice(0, 10);
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return Number(value).toLocaleString('ko-KR');
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function statusClassName(status) {
  if (status === '신청') {
    return 'sColorY';
  }
  if (status === '심사') {
    return 'sColorGN';
  }
  if (status === '상환') {
    return 'sColorLS';
  }
  if (status === '거부') {
    return 'sColorR';
  }
  if (status === '만료') {
    return 'sColorR';
  }
  return 'sColorN';
}

export function ManagementUsagePage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [sums, setSums] = useState(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userEmail: '',
    productCode: '',
    status: '',
    fromDate: '',
    toDate: '',
    orderBy: 'request_date_desc',
  });
  const [filters, setFilters] = useState({ order_by: 'request_date_desc' });

  useEffect(() => {
    let ignore = false;

    async function loadUsage() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchManagementUsage({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setCounts(data.counts ?? null);
          setSums(data.sums ?? null);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setCounts(null);
          setSums(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadUsage();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = useMemo(() => items, [items]);

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= total ? value : next;
    });
  }

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
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_email: formValues.userEmail,
      product_code: formValues.productCode,
      status: formValues.status,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
  }

  return (
    <>
      <div className="m-options managementOptions">
        <div className="pRight">
          <span className="baseDate pRight">
            <b>기준</b>이관 DB 최신 데이터
          </span>
        </div>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="usageUserName">회원명</label>
            <input id="usageUserName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageFirmName">회사명</label>
            <input id="usageFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageUserEmail">회원ID</label>
            <input id="usageUserEmail" name="userEmail" type="text" value={formValues.userEmail} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageProductCode">서비스</label>
            <select id="usageProductCode" name="productCode" value={formValues.productCode} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="MP">머니플러스</option>
            </select>
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="usageStatus">이용상태</label>
            <select id="usageStatus" name="status" value={formValues.status} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="approval">신청</option>
              <option value="judge">심사</option>
              <option value="repayment">상환</option>
              <option value="refuse">거부</option>
              <option value="expire">만료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="usageFromDate">신청시작</label>
            <input id="usageFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageToDate">신청종료</label>
            <input id="usageToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <div className="tableSet">
        <div className="m-options">
          <div className="pRight">
            <div className="fwBox">
              <span className="ft">보기기준</span>
              <div className="input">
                <select name="orderBy" value={formValues.orderBy} onChange={updateFormValue}>
                  <option value="request_date_desc">최근 순</option>
                  <option value="request_date_asc">과거 순</option>
                </select>
              </div>
            </div>
            <span className="btns">
              <a href="javascript:;" className="sBtn sColorLG excel">엑셀 다운로드</a>
            </span>
          </div>
        </div>

        {message ? <p className="detailMessage">{message}</p> : null}
        <div id="fixTable" className="fixTable wide legacyListTable table-scroll">
          <div className="overflowBox">
          <table className="m-shadowTable managementUsageTable">
            <caption className="caption">머니뱅크 이용상세 목록</caption>
            <thead>
              <tr>
                <th scope="col">이용상태</th>
                <th scope="col">신청일자</th>
                <th scope="col">회원ID</th>
                <th scope="col">회사명</th>
                <th scope="col">회원명</th>
                <th scope="col">이용서비스</th>
                <th scope="col">시작일자</th>
                <th scope="col">종료일자</th>
                <th scope="col">수수료</th>
                <th scope="col">지급율</th>
                <th scope="col">이용금액</th>
                <th scope="col">누적상환</th>
                <th scope="col">상환잔액</th>
                <th scope="col">PCS</th>
                <th scope="col">상세</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="15">이용상세 목록을 조회 중입니다.</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="15">조회된 이용상세 데이터가 없습니다.</td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.mbid}>
                  <td>
                    <span className={`sBtn ${statusClassName(row.usage_status)} rBtn`}>
                      {row.usage_status}
                    </span>
                  </td>
                  <td>{formatDate(row.request_date)}</td>
                  <td>{row.user_email ?? '-'}</td>
                  <td>{row.firm_name ?? '-'}</td>
                  <td>{row.user_name ?? '-'}</td>
                  <td>{row.product_code ?? '-'}</td>
                  <td>{formatDate(row.contract_date)}</td>
                  <td>{formatDate(row.expire_date)}</td>
                  <td>{formatPercent(row.fee_rate)}</td>
                  <td>{row.payment_rate === null || row.payment_rate === undefined ? '-' : `${row.payment_rate}%`}</td>
                  <td>{formatNumber(row.provision_amount || row.sales_amount)}</td>
                  <td>{formatNumber(row.repayment_amount)}</td>
                  <td>{formatNumber(row.outstanding_balance)}</td>
                  <td>{row.prizm_grade ?? '-'}</td>
                  <td>
                    <button
                      className="sColorLB refund-btn"
                      type="button"
                      onClick={() => {
                        window.location.href = `/admin/moneybank/management/usageDetail?mbid=${encodeURIComponent(row.mbid)}`;
                      }}
                    >
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <UsageSummary counts={counts} sums={sums} total={total} />
        </div>

        <div className="m-paging paging" id="pagingButton">
          <ul>
            <li>
              <button className="oiBtn prev" type="button" onClick={goToPreviousPage} disabled={offset === 0}>
                이전
              </button>
            </li>
            <li>
              <a className="num active" href="javascript:;">
                {currentPage}
              </a>
            </li>
            <li>
              <button className="oiBtn next" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>
                다음
              </button>
            </li>
          </ul>
        </div>
      </div>
      <UsageDetailPanel detail={selected} />
    </>
  );
}

function UsageSummary({ counts, sums, total }) {
  return (
    <div className="fixBottom">
      <ul className="tableTotal">
        <li><span className="txt">총 :</span><span className="result"> {formatNumber(total)} 건</span></li>
        <li><span className="txt">신청 :</span><span className="result">{formatNumber(counts?.request_count ?? 0)} 건</span></li>
        <li><span className="txt">심사 :</span><span className="result">{formatNumber(counts?.review_count ?? 0)} 건</span></li>
        <li><span className="txt">거부 :</span><span className="result">{formatNumber(counts?.rejected_count ?? 0)} 건</span></li>
        <li><span className="txt">상환 :</span><span className="result">{formatNumber(counts?.repayment_count ?? 0)} 건</span></li>
        <li><span className="txt">만료 :</span><span className="result">{formatNumber(counts?.expired_count ?? 0)} 건</span></li>
        <li><span className="txt">이용금액 :</span><span className="result">{formatNumber(sums?.provision_amount ?? 0)}</span></li>
        <li><span className="txt">상환잔액 :</span><span className="result">{formatNumber(sums?.outstanding_balance ?? 0)}</span></li>
      </ul>
    </div>
  );
}

function UsageDetailPanel({ detail }) {
  if (!detail) {
    return null;
  }

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">이용상세</a>
          </li>
        </ul>
      </div>
      <div className="detailSection">
        <table className="detailInfoTable">
          <caption className="caption">머니뱅크 이용상세</caption>
          <tbody>
            <tr>
              <th scope="row">선정산ID</th>
              <td>{detail.mbid}</td>
              <th scope="row">이용상태</th>
              <td>{detail.usage_status}</td>
            </tr>
            <tr>
              <th scope="row">회원ID</th>
              <td>{detail.user_email ?? '-'}</td>
              <th scope="row">회원명</th>
              <td>{detail.user_name ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">회사명</th>
              <td>{detail.firm_name ?? '-'}</td>
              <th scope="row">서비스</th>
              <td>{detail.product_code ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">신청일자</th>
              <td>{formatDate(detail.request_date)}</td>
              <th scope="row">계약기간</th>
              <td>{formatDate(detail.contract_date)} ~ {formatDate(detail.expire_date)}</td>
            </tr>
            <tr>
              <th scope="row">수수료</th>
              <td>{formatPercent(detail.fee_rate)}</td>
              <th scope="row">지급율</th>
              <td>{detail.payment_rate === null || detail.payment_rate === undefined ? '-' : `${detail.payment_rate}%`}</td>
            </tr>
            <tr>
              <th scope="row">이용금액</th>
              <td>{formatNumber(detail.provision_amount || detail.sales_amount)}</td>
              <th scope="row">누적상환</th>
              <td>{formatNumber(detail.repayment_amount)}</td>
            </tr>
            <tr>
              <th scope="row">상환잔액</th>
              <td>{formatNumber(detail.outstanding_balance)}</td>
              <th scope="row">PCS</th>
              <td>{detail.prizm_grade ?? '-'} / {detail.prizm_score ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
