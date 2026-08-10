import { useEffect, useMemo, useState } from 'react';
import { fetchSettlementDetail, fetchSettlements } from '../api/settlements.js';

const PAGE_SIZE = 10;

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

function formatSettlementCheckStatus(value) {
  const labels = {
    OK: '일치',
    DIFF: '차이',
    LEGACY_BATCH_VALUE: '원본산출',
    NOT_CHECKED: '미검산',
  };
  return labels[value] ?? value ?? '-';
}

function formatShopType(value) {
  const labels = {
    NAVER: '스마트스토어',
    COUPANG: '쿠팡',
    STREET11: '11번가',
    GMARKET: 'G마켓',
    AUCTION: '옥션',
    INTERPARK: '인터파크',
  };
  return labels[String(value ?? '').toUpperCase()] ?? value ?? '-';
}

function formatSettlementStatus(value) {
  const labels = { READY: '대기', PAID: '지급완료', DONE: '완료', HOLD: '보류' };
  return labels[String(value ?? '').toUpperCase()] ?? value ?? '-';
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function mapSettlementToRow(item) {
  return {
    id: item.settlements_id,
    shopType: item.shop_type,
    shopId: item.shop_id,
    type: item.settlement_type,
    date: item.settlement_date,
    totalSale: item.total_sale,
    serviceFee: item.service_fee,
    targetAmount: item.settlement_target_amount,
    settlementAmount: item.settlement_amount,
    pendingReleasedAmount: item.pending_released_amount,
    bankName: item.bank_name,
    bankAccountHolder: item.bank_account_holder,
    bankAccount: item.bank_account,
    status: item.status,
    checkStatus: item.settlement_check_status,
    checkDifference: item.settlement_difference,
  };
}

export function SettlementManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    total_count: 0,
    ok_count: 0,
    diff_count: 0,
    legacy_batch_value_count: 0,
    unchecked_count: 0,
    total_difference: 0,
    absolute_difference: 0,
    check_status_label: '미검산',
  });
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [formValues, setFormValues] = useState({
    shopType: '',
    shopId: '',
    status: '',
    keyword: '',
    fromDate: '',
    toDate: '',
    orderBy: 'date_desc',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadSettlements() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchSettlements({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setCounts({
            total_count: 0,
            ok_count: 0,
            diff_count: 0,
            legacy_batch_value_count: 0,
            unchecked_count: 0,
            total_difference: 0,
            absolute_difference: 0,
            check_status_label: '조회 실패',
          });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSettlements();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items.map(mapSettlementToRow), [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
    setDetail(null);
    setDetailMessage('');
    setFilters({
      shop_type: formValues.shopType,
      shop_id: formValues.shopId,
      status: formValues.status,
      keyword: formValues.keyword,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
  }

  function handleOrderByChange(event) {
    const { value } = event.target;
    setFormValues((current) => ({ ...current, orderBy: value }));
    setFilters((current) => ({ ...current, order_by: value }));
    setOffset(0);
  }

  async function handleExport() {
    setIsExporting(true);
    setExportMessage('');
    try {
      const exportItems = [];
      let exportOffset = 0;
      let exportTotal = 0;
      do {
        const data = await fetchSettlements({ limit: 100, offset: exportOffset, ...filters });
        const pageItems = data.items ?? [];
        exportTotal = data.total ?? pageItems.length;
        exportItems.push(...pageItems);
        exportOffset += pageItems.length;
        if (pageItems.length === 0) break;
      } while (exportOffset < exportTotal && exportOffset < 10000);

      const headers = ['정산ID', '쇼핑몰', '상점ID', '정산구분', '정산일', '총매출', '서비스수수료', '정산대상액', '정산액', '보류해제액', '은행', '검산', '상태'];
      const csvRows = exportItems.map((item) => {
        const row = mapSettlementToRow(item);
        return [row.id, formatShopType(row.shopType), row.shopId, row.type, formatDate(row.date), row.totalSale, row.serviceFee, row.targetAmount, row.settlementAmount, row.pendingReleasedAmount, row.bankName, `${formatSettlementCheckStatus(row.checkStatus)} (${formatNumber(row.checkDifference)})`, formatSettlementStatus(row.status)];
      });
      const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      const blobUrl = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cubici-settlements-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      setExportMessage(`${formatNumber(exportItems.length)}건을 내려받았습니다.`);
    } catch (error) {
      setExportMessage(error.message);
    } finally {
      setIsExporting(false);
    }
  }

  async function openDetail(settlementsId) {
    setDetail(null);
    setDetailMessage('정산 상세를 조회 중입니다.');
    try {
      const data = await fetchSettlementDetail(settlementsId);
      setDetail(data);
      setDetailMessage('');
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  return (
    <section className="settlementLvPage">
      <div className="m-tab settlementLvTabs">
        <ul>
          <li className="active">
            <a href="javascript:;">정산 관리</a>
          </li>
        </ul>
      </div>

      <div className="m-options settlementLvBaseDate">
        <div className="pRight"><span className="baseDate"><b>기준</b> {new Date().toLocaleDateString('ko-KR')}</span></div>
      </div>

      <form className="m-search searchArea settlementLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="settlementShopType">쇼핑몰</label>
            <select id="settlementShopType" name="shopType" value={formValues.shopType} onChange={updateFormValue}>
              <option value="">전체</option><option value="NAVER">스마트스토어</option><option value="COUPANG">쿠팡</option><option value="STREET11">11번가</option><option value="GMARKET">G마켓</option><option value="AUCTION">옥션</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="settlementShopId">상점ID</label>
            <input id="settlementShopId" name="shopId" type="text" value={formValues.shopId} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="settlementStatus">상태</label>
            <select id="settlementStatus" name="status" value={formValues.status} onChange={updateFormValue}>
              <option value="">전체</option><option value="READY">대기</option><option value="PAID">지급완료</option><option value="DONE">완료</option><option value="HOLD">보류</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="settlementKeyword">통합검색</label>
            <input id="settlementKeyword" name="keyword" type="text" value={formValues.keyword} onChange={updateFormValue} placeholder="정산ID·정산구분·은행" />
          </div>
        </div>
        <div className="line">
          <div className="inputBox settlementLvDateRange">
            <label htmlFor="settlementFromDate">정산일자</label>
            <input id="settlementFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
            <span>~</span>
            <input id="settlementToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <div className="m-options settlementLvTableOptions">
        <div className="pRight">
          <div className="fwBox settlementLvOrderBox"><label htmlFor="settlementOrderBy">보기기준</label><select id="settlementOrderBy" name="orderBy" value={formValues.orderBy} onChange={handleOrderByChange}><option value="date_desc">최근순</option><option value="date_asc">과거순</option><option value="amount_desc">정산액 높은순</option><option value="amount_asc">정산액 낮은순</option></select></div>
          <button className="settlementLvDownloadButton" type="button" onClick={handleExport} disabled={isExporting}>{isExporting ? '내려받는 중' : '엑셀 다운로드'}</button>
        </div>
        {exportMessage ? <p className="settlementLvExportMessage" role="status">{exportMessage}</p> : null}
      </div>

      <div className="settlementLvSummary" aria-label="정산 검산 요약">
        <span><b>검산</b>{counts.check_status_label ?? '-'}</span>
        <span><b>전체</b>{formatNumber(counts.total_count ?? 0)}건</span>
        <span><b>일치</b>{formatNumber(counts.ok_count ?? 0)}건</span>
        <span><b>차이</b>{formatNumber(counts.diff_count ?? 0)}건</span>
        <span><b>원본산출</b>{formatNumber(counts.legacy_batch_value_count ?? 0)}건</span>
        <span><b>절대차이</b>{formatNumber(counts.absolute_difference ?? 0)}원</span>
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll settlementLvTable">
        <div className="overflowBox">
        <table className="m-shadowTable settlementTable">
          <caption className="caption">정산 관리 목록</caption>
          <thead>
            <tr>
              <th scope="col">정산ID</th>
              <th scope="col">쇼핑몰</th>
              <th scope="col">상점ID</th>
              <th scope="col">정산구분</th>
              <th scope="col">정산일</th>
              <th scope="col">총매출</th>
              <th scope="col">서비스수수료</th>
              <th scope="col">정산대상액</th>
              <th scope="col">정산액</th>
              <th scope="col">보류해제액</th>
              <th scope="col">검산</th>
              <th scope="col">상태</th>
              <th scope="col">상세</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="13">정산 목록을 조회 중입니다.</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="13">조회된 정산 데이터가 없습니다.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{formatShopType(row.shopType)}</td>
                <td>{row.shopId ?? '-'}</td>
                <td>{row.type ?? '-'}</td>
                <td>{formatDate(row.date)}</td>
                <td>{formatNumber(row.totalSale)}</td>
                <td>{formatNumber(row.serviceFee)}</td>
                <td>{formatNumber(row.targetAmount)}</td>
                <td>{formatNumber(row.settlementAmount)}</td>
                <td>{formatNumber(row.pendingReleasedAmount)}</td>
                <td>{formatSettlementCheckStatus(row.checkStatus)} ({formatNumber(row.checkDifference)})</td>
                <td>{formatSettlementStatus(row.status)}</td>
                <td>
                  <button className="sColorLB refund-btn" type="button" onClick={() => openDetail(row.id)}>
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="fixBottom">
          <ul className="tableTotal">
            <li>
              <span className="txt">전체</span>
              <span className="result">{formatNumber(total)} 건</span>
            </li>
            <li>
              <span className="txt">페이지</span>
              <span className="result">{currentPage} / {pageCount}</span>
            </li>
          </ul>
        </div>
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
      <SettlementDetailPanel detail={detail} message={detailMessage} />
    </section>
  );
}

function SettlementDetailPanel({ detail, message }) {
  if (!detail && !message) {
    return null;
  }

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">정산 상세</a>
          </li>
        </ul>
      </div>
      {message ? <p className="detailMessage">{message}</p> : null}
      {detail ? (
        <div className="detailSection">
          <table className="detailInfoTable">
            <caption className="caption">정산 상세</caption>
            <tbody>
              <tr>
                <th scope="row">정산ID</th>
                <td>{detail.settlements_id}</td>
                <th scope="row">상태</th>
                <td>{detail.status ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">쇼핑몰</th>
                <td>{detail.shop_type ?? '-'}</td>
                <th scope="row">상점ID</th>
                <td>{detail.shop_id ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">정산구분</th>
                <td>{detail.settlement_type ?? '-'}</td>
                <th scope="row">정산일</th>
                <td>{formatDate(detail.settlement_date)}</td>
              </tr>
              <tr>
                <th scope="row">총매출</th>
                <td>{formatNumber(detail.total_sale)}</td>
                <th scope="row">서비스수수료</th>
                <td>{formatNumber(detail.service_fee)}</td>
              </tr>
              <tr>
                <th scope="row">정산대상액</th>
                <td>{formatNumber(detail.settlement_target_amount)}</td>
                <th scope="row">정산액</th>
                <td>{formatNumber(detail.settlement_amount)}</td>
              </tr>
              <tr>
                <th scope="row">보류해제액</th>
                <td>{formatNumber(detail.pending_released_amount)}</td>
                <th scope="row">전주채무</th>
                <td>{formatNumber(detail.debt_of_last_week)}</td>
              </tr>
              <tr>
                <th scope="row">검산 정산액</th>
                <td>{formatNumber(detail.settlement_check_amount)}</td>
                <th scope="row">검산 차이</th>
                <td>{formatSettlementCheckStatus(detail.settlement_check_status)} ({formatNumber(detail.settlement_difference)})</td>
              </tr>
              <tr>
                <th scope="row">판매자쿠폰</th>
                <td>{formatNumber(detail.seller_discount_coupon)}</td>
                <th scope="row">다운로드쿠폰</th>
                <td>{formatNumber(detail.downloadable_coupon)}</td>
              </tr>
              <tr>
                <th scope="row">판매자서비스수수료</th>
                <td>{formatNumber(detail.seller_service_fee)}</td>
                <th scope="row">스토어수수료할인</th>
                <td>{formatNumber(detail.store_fee_discount)}</td>
              </tr>
              <tr>
                <th scope="row">은행</th>
                <td>{detail.bank_name ?? '-'}</td>
                <th scope="row">예금주</th>
                <td>{detail.bank_account_holder ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">계좌번호</th>
                <td>{detail.bank_account ?? '-'}</td>
                <th scope="row">등록일</th>
                <td>{formatDate(detail.reg_date)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
