import { useEffect, useMemo, useState } from 'react';
import {
  cancelRedemptionOperation,
  createRedemptionProvision,
  createRedemptionRepayment,
  fetchRedemptionDetail,
  fetchRedemptionOperationHistory,
  fetchRedemptions,
} from '../api/redemptions.js';

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

function formatBalanceCheckStatus(value) {
  const labels = {
    OK: '일치',
    DIFF: '차이',
    NO_HISTORY: '이력없음',
    NOT_CHECKED: '미검산',
  };
  return labels[value] ?? value ?? '-';
}

function mapRedemptionToRow(item) {
  return {
    mbid: item.mbid,
    provisionCount: item.provision_count,
    provisionAmount: item.total_provision_amount,
    latestProvisionDate: item.latest_provision_date,
    repaymentCount: item.repayment_count,
    repaymentAmount: item.total_repayment_amount,
    depositCount: item.deposit_count,
    depositAmount: item.total_deposit_amount,
    salesCount: item.sales_count,
    salesPaymentAmount: item.sales_payment_amount,
    outstandingBalance: item.latest_outstanding_balance,
    balanceCheckStatus: item.latest_balance_check_status,
    balanceDifference: item.latest_balance_difference,
    latestHistoryDate: item.latest_history_date,
  };
}

function makeOperationCode(prefix) {
  return `${prefix}${Date.now().toString().slice(-12)}`.slice(0, 15);
}

function toNumber(value) {
  return Number(value || 0);
}

function formatOperationType(value) {
  if (value === 'PROVISION') {
    return '지급';
  }
  if (value === 'REPAYMENT') {
    return '상환';
  }
  if (value === 'PROVISION_CANCEL') {
    return '지급취소';
  }
  if (value === 'REPAYMENT_CANCEL') {
    return '상환취소';
  }
  return value || '-';
}

function getOperationStatus(item) {
  if (item.is_reversal) {
    return '취소이력';
  }
  if (item.canceled_by_operation_history_id) {
    return '취소됨';
  }
  return '정상';
}

function canCancelOperation(item) {
  return ['PROVISION', 'REPAYMENT'].includes(item.operation_type)
    && !item.is_reversal
    && !item.canceled_by_operation_history_id;
}

function formatPayload(payload) {
  if (!payload) {
    return '{}';
  }

  return JSON.stringify(payload, null, 2);
}

function getOperationAmount(item) {
  const provisionDelta = Math.abs(
    Number(item.new_cumulative_provision_amount ?? 0)
      - Number(item.previous_cumulative_provision_amount ?? 0),
  );
  const repaymentDelta = Math.abs(
    Number(item.new_cumulative_repayment_amount ?? 0)
      - Number(item.previous_cumulative_repayment_amount ?? 0),
  );

  return Math.max(provisionDelta, repaymentDelta);
}

function matchesHistoryFilters(item, filters) {
  const regDate = item.reg_date ? item.reg_date.slice(0, 10) : '';
  const amount = getOperationAmount(item);
  const minAmount = filters.minAmount === '' ? null : Number(filters.minAmount);
  const maxAmount = filters.maxAmount === '' ? null : Number(filters.maxAmount);

  if (filters.fromDate && regDate < filters.fromDate) {
    return false;
  }
  if (filters.toDate && regDate > filters.toDate) {
    return false;
  }
  if (filters.status && getOperationStatus(item) !== filters.status) {
    return false;
  }
  if (minAmount !== null && amount < minAmount) {
    return false;
  }
  if (maxAmount !== null && amount > maxAmount) {
    return false;
  }

  return true;
}

export function RedemptionManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyMessage, setHistoryMessage] = useState('');
  const [operationMessage, setOperationMessage] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelValues, setCancelValues] = useState(() => makeCancelDefaults());
  const [formValues, setFormValues] = useState({
    mbid: '',
    outstandingOnly: false,
    fromDate: '',
    toDate: '',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadRedemptions() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchRedemptions({ limit: PAGE_SIZE, offset, ...filters });
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

    loadRedemptions();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items.map(mapRedemptionToRow), [items]);
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
    const { name, type, checked, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setDetail(null);
    setDetailMessage('');
    setOperationHistory([]);
    setHistoryMessage('');
    setOperationMessage('');
    setCancelTarget(null);
    setFilters({
      mbid: formValues.mbid,
      outstanding_only: formValues.outstandingOnly,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
    });
  }

  async function openDetail(mbid) {
    setDetail(null);
    setOperationHistory([]);
    setDetailMessage('상환 상세를 조회 중입니다.');
    setHistoryMessage('');
    setOperationMessage('');
    setCancelTarget(null);
    try {
      const [detailData, historyData] = await Promise.all([
        fetchRedemptionDetail(mbid),
        fetchRedemptionOperationHistory(mbid),
      ]);
      setDetail(detailData);
      setOperationHistory(historyData.items ?? []);
      setDetailMessage('');
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  async function refreshList() {
    const data = await fetchRedemptions({ limit: PAGE_SIZE, offset, ...filters });
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }

  async function refreshDetail(mbid) {
    const [detailData, historyData] = await Promise.all([
      fetchRedemptionDetail(mbid),
      fetchRedemptionOperationHistory(mbid),
    ]);
    setDetail(detailData);
    setOperationHistory(historyData.items ?? []);
  }

  async function handleProvisionCreate(mbid, values) {
    setOperationMessage('지급 등록 중입니다.');

    const payload = {
      request_code: values.requestCode || null,
      provision_code: values.provisionCode,
      total_payment_amount: toNumber(values.totalPaymentAmount),
      total_usage_fee: toNumber(values.totalUsageFee),
      total_provision_amount: toNumber(values.totalProvisionAmount),
      status: values.status || 'PROVISION',
      operated_by: values.operatedBy || 'local-admin',
      reason: values.reason || null,
      sales: values.salesCode ? [
        {
          sales_code: values.salesCode,
          class_code: values.classCode || null,
          order_no: values.orderNo || null,
          payment_amount: toNumber(values.salesPaymentAmount || values.totalPaymentAmount),
          usage_fee: toNumber(values.salesUsageFee || values.totalUsageFee),
          provision_amount: toNumber(values.salesProvisionAmount || values.totalProvisionAmount),
        },
      ] : [],
    };

    try {
      const result = await createRedemptionProvision(mbid, payload);
      await refreshDetail(mbid);
      await refreshList();
      setOperationMessage(`지급 등록 완료: ${result.operation_code}`);
    } catch (error) {
      setOperationMessage(error.message);
    }
  }

  async function handleRepaymentCreate(mbid, values) {
    setOperationMessage('상환 등록 중입니다.');

    const payload = {
      repayment_code: values.repaymentCode,
      repayment_amount: toNumber(values.repaymentAmount),
      repayment_usage_fee: toNumber(values.repaymentUsageFee),
      remittance_fee: toNumber(values.remittanceFee),
      balance_provision_amount: toNumber(values.balanceProvisionAmount),
      status: values.status || 'END',
      operated_by: values.operatedBy || 'local-admin',
      reason: values.reason || null,
      deposits: values.depositCode ? [
        {
          deposit_code: values.depositCode,
          deposit_date: values.depositDate,
          deposit_amount: toNumber(values.depositAmount || values.repaymentAmount),
        },
      ] : [],
    };

    try {
      const result = await createRedemptionRepayment(mbid, payload);
      await refreshDetail(mbid);
      await refreshList();
      setOperationMessage(`상환 등록 완료: ${result.operation_code}`);
    } catch (error) {
      setOperationMessage(error.message);
    }
  }

  function openOperationCancel(item) {
    setCancelTarget(item);
    setCancelValues(makeCancelDefaults());
    setOperationMessage('');
  }

  async function handleOperationCancel(values) {
    if (!detail || !cancelTarget) {
      return;
    }

    setOperationMessage('상환 작업 취소 중입니다.');
    try {
      const result = await cancelRedemptionOperation(detail.mbid, cancelTarget.id, {
        cancel_code: values.cancelCode || null,
        operated_by: values.operatedBy || 'local-admin',
        reason: values.reason,
      });
      await refreshDetail(detail.mbid);
      await refreshList();
      setCancelTarget(null);
      setOperationMessage(`상환 작업 취소 완료: ${result.operation_code}`);
    } catch (error) {
      setOperationMessage(error.message);
    }
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">상환 관리</a>
          </li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="redemptionMbid">MBID</label>
            <input id="redemptionMbid" name="mbid" type="text" value={formValues.mbid} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="redemptionFromDate">시작일</label>
            <input id="redemptionFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="redemptionToDate">종료일</label>
            <input id="redemptionToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <label className="checkBoxLabel">
            <input name="outstandingOnly" type="checkbox" checked={formValues.outstandingOnly} onChange={updateFormValue} />
            미상환잔액 있음
          </label>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable wide legacyListTable table-scroll">
        <div className="overflowBox">
        <table className="m-shadowTable redemptionTable">
          <caption className="caption">상환 관리 목록</caption>
          <thead>
            <tr>
              <th scope="col">MBID</th>
              <th scope="col">지급건수</th>
              <th scope="col">지급금액</th>
              <th scope="col">최근지급일</th>
              <th scope="col">상환건수</th>
              <th scope="col">상환금액</th>
              <th scope="col">입금건수</th>
              <th scope="col">입금금액</th>
              <th scope="col">판매건수</th>
              <th scope="col">판매결제액</th>
              <th scope="col">미상환잔액</th>
              <th scope="col">잔액검산</th>
              <th scope="col">최근이력일</th>
              <th scope="col">상세</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="14">상환 목록을 조회 중입니다.</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="14">조회된 상환 데이터가 없습니다.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.mbid}>
                <td>{row.mbid}</td>
                <td>{formatNumber(row.provisionCount)}</td>
                <td>{formatNumber(row.provisionAmount)}</td>
                <td>{formatDate(row.latestProvisionDate)}</td>
                <td>{formatNumber(row.repaymentCount)}</td>
                <td>{formatNumber(row.repaymentAmount)}</td>
                <td>{formatNumber(row.depositCount)}</td>
                <td>{formatNumber(row.depositAmount)}</td>
                <td>{formatNumber(row.salesCount)}</td>
                <td>{formatNumber(row.salesPaymentAmount)}</td>
                <td>{formatNumber(row.outstandingBalance)}</td>
                <td>{formatBalanceCheckStatus(row.balanceCheckStatus)} ({formatNumber(row.balanceDifference)})</td>
                <td>{formatDate(row.latestHistoryDate)}</td>
                <td>
                  <button className="sColorLB refund-btn" type="button" onClick={() => openDetail(row.mbid)}>
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
              <span className="txt">총 상환건수</span>
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
      <RedemptionDetailPanel
        detail={detail}
        message={detailMessage}
        operationHistory={operationHistory}
        historyMessage={historyMessage}
        operationMessage={operationMessage}
        onOperationCancel={openOperationCancel}
        onProvisionCreate={handleProvisionCreate}
        onRepaymentCreate={handleRepaymentCreate}
      />
      {cancelTarget ? (
        <RedemptionCancelModal
          item={cancelTarget}
          values={cancelValues}
          onChange={setCancelValues}
          onClose={() => setCancelTarget(null)}
          onSubmit={handleOperationCancel}
        />
      ) : null}
    </>
  );
}

function RedemptionDetailPanel({
  detail,
  message,
  operationHistory,
  historyMessage,
  operationMessage,
  onOperationCancel,
  onProvisionCreate,
  onRepaymentCreate,
}) {
  if (!detail && !message) {
    return null;
  }

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">상환 상세</a>
          </li>
        </ul>
      </div>
      {message ? <p className="detailMessage">{message}</p> : null}
      {detail ? (
        <div className="detailSection">
          <table className="detailInfoTable">
            <caption className="caption">상환 상세</caption>
            <tbody>
              <tr>
                <th scope="row">MBID</th>
                <td>{detail.mbid}</td>
                <th scope="row">최근이력일</th>
                <td>{formatDate(detail.latest_history_date)}</td>
              </tr>
              <tr>
                <th scope="row">지급건수</th>
                <td>{formatNumber(detail.provision_count)}</td>
                <th scope="row">지급총액</th>
                <td>{formatNumber(detail.total_provision_amount)}</td>
              </tr>
              <tr>
                <th scope="row">결제총액</th>
                <td>{formatNumber(detail.total_payment_amount)}</td>
                <th scope="row">이용료총액</th>
                <td>{formatNumber(detail.total_usage_fee)}</td>
              </tr>
              <tr>
                <th scope="row">최근지급일</th>
                <td>{formatDate(detail.latest_provision_date)}</td>
                <th scope="row">상환건수</th>
                <td>{formatNumber(detail.repayment_count)}</td>
              </tr>
              <tr>
                <th scope="row">상환총액</th>
                <td>{formatNumber(detail.total_repayment_amount)}</td>
                <th scope="row">상환이용료</th>
                <td>{formatNumber(detail.total_repayment_usage_fee)}</td>
              </tr>
              <tr>
                <th scope="row">송금수수료</th>
                <td>{formatNumber(detail.total_remittance_fee)}</td>
                <th scope="row">잔여지급액</th>
                <td>{formatNumber(detail.total_balance_provision_amount)}</td>
              </tr>
              <tr>
                <th scope="row">입금건수</th>
                <td>{formatNumber(detail.deposit_count)}</td>
                <th scope="row">입금총액</th>
                <td>{formatNumber(detail.total_deposit_amount)}</td>
              </tr>
              <tr>
                <th scope="row">판매건수</th>
                <td>{formatNumber(detail.sales_count)}</td>
                <th scope="row">판매결제액</th>
                <td>{formatNumber(detail.sales_payment_amount)}</td>
              </tr>
              <tr>
                <th scope="row">누적지급액</th>
                <td>{formatNumber(detail.latest_cumulative_provision_amount)}</td>
                <th scope="row">누적상환액</th>
                <td>{formatNumber(detail.latest_cumulative_repayment_amount)}</td>
              </tr>
              <tr>
                <th scope="row">미상환잔액</th>
                <td>{formatNumber(detail.latest_outstanding_balance)}</td>
                <th scope="row">최근판매지급일</th>
                <td>{formatDate(detail.latest_sales_paid_date)}</td>
              </tr>
              <tr>
                <th scope="row">검산잔액</th>
                <td>{formatNumber(detail.latest_balance_check_amount)}</td>
                <th scope="row">잔액차이</th>
                <td>{formatBalanceCheckStatus(detail.latest_balance_check_status)} ({formatNumber(detail.latest_balance_difference)})</td>
              </tr>
            </tbody>
          </table>
          <RedemptionOperationHistoryTable
            items={operationHistory}
            message={historyMessage}
            onOperationCancel={onOperationCancel}
          />
          {operationMessage ? <p className="detailMessage">{operationMessage}</p> : null}
          <div className="redemptionOperationForms">
            <RedemptionProvisionForm mbid={detail.mbid} onSubmit={onProvisionCreate} />
            <RedemptionRepaymentForm
              mbid={detail.mbid}
              outstandingBalance={detail.latest_outstanding_balance}
              onSubmit={onRepaymentCreate}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RedemptionOperationHistoryTable({ items, message, onOperationCancel }) {
  const [payloadItem, setPayloadItem] = useState(null);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    minAmount: '',
    maxAmount: '',
    status: '',
  });
  const filteredItems = useMemo(
    () => items.filter((item) => matchesHistoryFilters(item, filters)),
    [items, filters],
  );

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      fromDate: '',
      toDate: '',
      minAmount: '',
      maxAmount: '',
      status: '',
    });
  }

  return (
    <div className="redemptionOperationHistory">
      <h3>최근 작업 이력</h3>
      {message ? <p className="detailMessage">{message}</p> : null}
      <div className="redemptionHistoryFilters">
        <label>
          시작일
          <input name="fromDate" type="date" value={filters.fromDate} onChange={updateFilter} />
        </label>
        <label>
          종료일
          <input name="toDate" type="date" value={filters.toDate} onChange={updateFilter} />
        </label>
        <label>
          최소금액
          <input name="minAmount" type="number" min="0" value={filters.minAmount} onChange={updateFilter} />
        </label>
        <label>
          최대금액
          <input name="maxAmount" type="number" min="0" value={filters.maxAmount} onChange={updateFilter} />
        </label>
        <label>
          상태
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">전체</option>
            <option value="정상">정상</option>
            <option value="취소됨">취소됨</option>
            <option value="취소이력">취소이력</option>
          </select>
        </label>
        <button className="sColorLB refund-btn" type="button" onClick={resetFilters}>
          초기화
        </button>
        <span className="redemptionHistoryFilterCount">
          {formatNumber(filteredItems.length)} / {formatNumber(items.length)} 건
        </span>
      </div>
      <div className="table-scroll detailTableScroll">
        <table className="m-shadowTable redemptionOperationHistoryTable">
          <caption className="caption">상환 작업 이력</caption>
          <thead>
            <tr>
              <th scope="col">일시</th>
              <th scope="col">구분</th>
              <th scope="col">작업코드</th>
              <th scope="col">이전지급</th>
              <th scope="col">이전상환</th>
              <th scope="col">이전잔액</th>
              <th scope="col">신규지급</th>
              <th scope="col">신규상환</th>
              <th scope="col">신규잔액</th>
              <th scope="col">상태</th>
              <th scope="col">처리자</th>
              <th scope="col">사유</th>
              <th scope="col">상세</th>
              <th scope="col">취소</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="14">조회된 작업 이력이 없습니다.</td>
              </tr>
            ) : filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.reg_date)}</td>
                <td>{formatOperationType(item.operation_type)}</td>
                <td>{item.operation_code}</td>
                <td>{formatNumber(item.previous_cumulative_provision_amount)}</td>
                <td>{formatNumber(item.previous_cumulative_repayment_amount)}</td>
                <td>{formatNumber(item.previous_outstanding_balance)}</td>
                <td>{formatNumber(item.new_cumulative_provision_amount)}</td>
                <td>{formatNumber(item.new_cumulative_repayment_amount)}</td>
                <td>{formatNumber(item.new_outstanding_balance)}</td>
                <td>{getOperationStatus(item)}</td>
                <td>{item.operated_by}</td>
                <td>{item.reason || '-'}</td>
                <td>
                  <button className="sColorLB refund-btn" type="button" onClick={() => setPayloadItem(item)}>
                    보기
                  </button>
                </td>
                <td>
                  {canCancelOperation(item) ? (
                    <button className="sColorLB refund-btn" type="button" onClick={() => onOperationCancel(item)}>
                      취소
                    </button>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payloadItem ? (
        <RedemptionPayloadModal item={payloadItem} onClose={() => setPayloadItem(null)} />
      ) : null}
    </div>
  );
}

function RedemptionPayloadModal({ item, onClose }) {
  return (
    <div className="redemptionModalOverlay" role="presentation">
      <section className="redemptionModal" role="dialog" aria-modal="true" aria-labelledby="redemptionPayloadTitle">
        <div className="redemptionModalHeader">
          <h3 id="redemptionPayloadTitle">작업 상세</h3>
          <button className="sColorLB refund-btn" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
        <table className="detailInfoTable">
          <caption className="caption">작업 상세 정보</caption>
          <tbody>
            <tr>
              <th scope="row">구분</th>
              <td>{formatOperationType(item.operation_type)}</td>
              <th scope="row">작업코드</th>
              <td>{item.operation_code}</td>
            </tr>
            <tr>
              <th scope="row">상태</th>
              <td>{getOperationStatus(item)}</td>
              <th scope="row">처리자</th>
              <td>{item.operated_by}</td>
            </tr>
          </tbody>
        </table>
        <pre className="redemptionPayload">{formatPayload(item.payload)}</pre>
      </section>
    </div>
  );
}

function RedemptionCancelModal({ item, values, onChange, onClose, onSubmit }) {
  function updateValue(event) {
    const { name, value } = event.target;
    onChange((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="redemptionModalOverlay" role="presentation">
      <section className="redemptionModal" role="dialog" aria-modal="true" aria-labelledby="redemptionCancelTitle">
        <div className="redemptionModalHeader">
          <h3 id="redemptionCancelTitle">작업 취소</h3>
          <button className="sColorLB refund-btn" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
        <table className="detailInfoTable">
          <caption className="caption">취소 대상 작업</caption>
          <tbody>
            <tr>
              <th scope="row">구분</th>
              <td>{formatOperationType(item.operation_type)}</td>
              <th scope="row">작업코드</th>
              <td>{item.operation_code}</td>
            </tr>
            <tr>
              <th scope="row">신규잔액</th>
              <td>{formatNumber(item.new_outstanding_balance)}</td>
              <th scope="row">처리자</th>
              <td>{item.operated_by}</td>
            </tr>
          </tbody>
        </table>
        <form className="redemptionCancelForm" onSubmit={handleSubmit}>
          <div className="redemptionOperationGrid">
            <label>
              취소코드
              <input name="cancelCode" type="text" value={values.cancelCode} onChange={updateValue} />
            </label>
            <label>
              처리자
              <input name="operatedBy" type="text" value={values.operatedBy} onChange={updateValue} required />
            </label>
            <label className="redemptionCancelReason">
              취소사유
              <input name="reason" type="text" value={values.reason} onChange={updateValue} required />
            </label>
          </div>
          <div className="redemptionOperationActions">
            <button className="sBtn sColorLB" type="submit">
              취소 실행
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function RedemptionProvisionForm({ mbid, onSubmit }) {
  const [values, setValues] = useState(() => makeProvisionDefaults());

  useEffect(() => {
    setValues(makeProvisionDefaults());
  }, [mbid]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(mbid, values);
  }

  return (
    <form className="redemptionOperationForm" onSubmit={handleSubmit}>
      <h3>지급 등록</h3>
      <div className="redemptionOperationGrid">
        <label>
          지급코드
          <input name="provisionCode" type="text" value={values.provisionCode} onChange={updateValue} required />
        </label>
        <label>
          요청코드
          <input name="requestCode" type="text" value={values.requestCode} onChange={updateValue} />
        </label>
        <label>
          결제총액
          <input name="totalPaymentAmount" type="number" min="0" value={values.totalPaymentAmount} onChange={updateValue} required />
        </label>
        <label>
          이용료
          <input name="totalUsageFee" type="number" min="0" value={values.totalUsageFee} onChange={updateValue} />
        </label>
        <label>
          지급총액
          <input name="totalProvisionAmount" type="number" min="0" value={values.totalProvisionAmount} onChange={updateValue} required />
        </label>
        <label>
          판매코드
          <input name="salesCode" type="text" value={values.salesCode} onChange={updateValue} />
        </label>
        <label>
          주문번호
          <input name="orderNo" type="text" value={values.orderNo} onChange={updateValue} />
        </label>
        <label>
          분류코드
          <input name="classCode" type="text" value={values.classCode} onChange={updateValue} />
        </label>
        <label>
          처리자
          <input name="operatedBy" type="text" value={values.operatedBy} onChange={updateValue} />
        </label>
        <label>
          사유
          <input name="reason" type="text" value={values.reason} onChange={updateValue} />
        </label>
      </div>
      <div className="redemptionOperationActions">
        <button className="sBtn sColorLB" type="submit">
          지급 등록
        </button>
      </div>
    </form>
  );
}

function RedemptionRepaymentForm({ mbid, outstandingBalance, onSubmit }) {
  const [values, setValues] = useState(() => makeRepaymentDefaults(outstandingBalance));

  useEffect(() => {
    setValues(makeRepaymentDefaults(outstandingBalance));
  }, [mbid, outstandingBalance]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(mbid, values);
  }

  return (
    <form className="redemptionOperationForm" onSubmit={handleSubmit}>
      <h3>상환 등록</h3>
      <p className="redemptionOperationGuide">현재 미상환잔액: {formatNumber(outstandingBalance)}</p>
      <div className="redemptionOperationGrid">
        <label>
          상환코드
          <input name="repaymentCode" type="text" value={values.repaymentCode} onChange={updateValue} required />
        </label>
        <label>
          상환원금
          <input name="repaymentAmount" type="number" min="0" value={values.repaymentAmount} onChange={updateValue} required />
        </label>
        <label>
          상환이용료
          <input name="repaymentUsageFee" type="number" min="0" value={values.repaymentUsageFee} onChange={updateValue} />
        </label>
        <label>
          송금수수료
          <input name="remittanceFee" type="number" min="0" value={values.remittanceFee} onChange={updateValue} />
        </label>
        <label>
          잔여지급액
          <input name="balanceProvisionAmount" type="number" min="0" value={values.balanceProvisionAmount} onChange={updateValue} />
        </label>
        <label>
          입금코드
          <input name="depositCode" type="text" value={values.depositCode} onChange={updateValue} />
        </label>
        <label>
          입금일
          <input name="depositDate" type="date" value={values.depositDate} onChange={updateValue} />
        </label>
        <label>
          입금액
          <input name="depositAmount" type="number" min="0" value={values.depositAmount} onChange={updateValue} />
        </label>
        <label>
          처리자
          <input name="operatedBy" type="text" value={values.operatedBy} onChange={updateValue} />
        </label>
        <label>
          사유
          <input name="reason" type="text" value={values.reason} onChange={updateValue} />
        </label>
      </div>
      <div className="redemptionOperationActions">
        <button className="sBtn sColorLB" type="submit">
          상환 등록
        </button>
      </div>
    </form>
  );
}

function makeProvisionDefaults() {
  return {
    requestCode: '',
    provisionCode: makeOperationCode('PV'),
    totalPaymentAmount: '',
    totalUsageFee: '0',
    totalProvisionAmount: '',
    status: 'PROVISION',
    operatedBy: 'local-admin',
    reason: '',
    salesCode: '',
    classCode: '',
    orderNo: '',
  };
}

function makeRepaymentDefaults(outstandingBalance) {
  const balanceValue = outstandingBalance ? String(Math.max(0, Number(outstandingBalance))) : '';
  return {
    repaymentCode: makeOperationCode('RP'),
    repaymentAmount: balanceValue,
    repaymentUsageFee: '0',
    remittanceFee: '0',
    balanceProvisionAmount: '0',
    status: 'END',
    depositCode: makeOperationCode('DP'),
    depositDate: new Date().toISOString().slice(0, 10),
    depositAmount: balanceValue,
    operatedBy: 'local-admin',
    reason: '',
  };
}

function makeCancelDefaults() {
  return {
    cancelCode: makeOperationCode('CX'),
    operatedBy: 'local-admin',
    reason: '',
  };
}
