import { useEffect, useMemo, useState } from 'react';
import { fetchSettlementDetail, fetchSettlements } from '../api/settlements.js';

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
  };
}

export function SettlementManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [formValues, setFormValues] = useState({
    shopType: '',
    shopId: '',
    status: '',
    fromDate: '',
    toDate: '',
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
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
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
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
    });
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
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">정산 관리</a>
          </li>
        </ul>
      </div>

      <form className="searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="settlementShopType">쇼핑몰</label>
            <input id="settlementShopType" name="shopType" type="text" value={formValues.shopType} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="settlementShopId">상점ID</label>
            <input id="settlementShopId" name="shopId" type="text" value={formValues.shopId} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="settlementStatus">상태</label>
            <input id="settlementStatus" name="status" type="text" value={formValues.status} onChange={updateFormValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="settlementFromDate">시작일</label>
            <input id="settlementFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="settlementToDate">종료일</label>
            <input id="settlementToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <div className="resultArea">
        <div>
          전체 <strong className="result">{formatNumber(total)}</strong> 건
        </div>
        <div>
          페이지 <strong className="result">{currentPage} / {pageCount}</strong>
        </div>
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div className="table-scroll">
        <table className="baseTable settlementTable">
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
              <th scope="col">은행</th>
              <th scope="col">예금주</th>
              <th scope="col">계좌번호</th>
              <th scope="col">상태</th>
              <th scope="col">상세</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="15">정산 목록을 조회 중입니다.</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="15">조회된 정산 데이터가 없습니다.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.shopType ?? '-'}</td>
                <td>{row.shopId ?? '-'}</td>
                <td>{row.type ?? '-'}</td>
                <td>{formatDate(row.date)}</td>
                <td>{formatNumber(row.totalSale)}</td>
                <td>{formatNumber(row.serviceFee)}</td>
                <td>{formatNumber(row.targetAmount)}</td>
                <td>{formatNumber(row.settlementAmount)}</td>
                <td>{formatNumber(row.pendingReleasedAmount)}</td>
                <td>{row.bankName ?? '-'}</td>
                <td>{row.bankAccountHolder ?? '-'}</td>
                <td>{row.bankAccount ?? '-'}</td>
                <td>{row.status ?? '-'}</td>
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

      <div className="paging" id="pagingButton">
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
    </>
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
          <table>
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
