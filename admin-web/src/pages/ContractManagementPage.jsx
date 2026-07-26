import { useEffect, useMemo, useState } from 'react';
import { fetchContractDetail, fetchContracts, updateContractStatus } from '../api/contracts.js';
import { canMakeContractStatus, formatContractStatus, hasContractStatus } from '../utils/contractStatus.js';

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

function formatRate(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function mapStatusFilter(value) {
  if (value === 'conditions_accept') {
    return 'CONDITIONS_ACCEPT';
  }
  if (value === 'account_standby') {
    return 'ACCOUNT_STANDBY';
  }
  if (value === 'normal') {
    return 'CONTRACT';
  }
  if (value === 'use_agree') {
    return 'USE_AGREE';
  }
  if (value === 'expi_normal') {
    return 'SELF_TERMINATION';
  }
  return '';
}

function mapContractToRow(contract) {
  return {
    id: contract.mbid,
    status: formatContractStatus(contract.status),
    approvedAt: formatDate(contract.approval_date),
    userName: contract.user_name ?? '-',
    firmName: contract.firm_name ?? '-',
    service: contract.product_code ?? '-',
    shopCount: contract.request_shop ?? contract.contract_shop_count ?? 0,
    prizmScore: contract.prizm_score ?? '-',
    salesAmount: formatNumber(contract.sales_amount),
    feeRate: formatRate(contract.latest_fee_rate),
    paymentRate: formatRate(contract.latest_payment_rate),
    contractedAt: formatDate(contract.contract_date),
    rawStatus: contract.status,
  };
}

export function ContractManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    productCode: '',
    status: '',
    fromDate: '',
    toDate: '',
    orderBy: 'request_date_desc',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadContracts() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchContracts({ limit: PAGE_SIZE, offset, ...filters });
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

    loadContracts();

    return () => {
      ignore = true;
    };
  }, [offset, filters, reloadKey]);

  const rows = useMemo(() => items.map(mapContractToRow), [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const waitingCount = rows.filter((row) => hasContractStatus(row.rawStatus, ['CONDITIONS_ACCEPT', 'USE_AGREE', '04', '05'])).length;
  const contractCount = rows.filter((row) => hasContractStatus(row.rawStatus, ['ACCOUNT_STANDBY', 'CONTRACT', '06', '81'])).length;
  const endedCount = rows.filter((row) => hasContractStatus(row.rawStatus, ['CONDITIONS_REFUSED', 'TERMS_REFUSED', 'REJECTED', 'SELF_TERMINATION', '41', '51', '72'])).length;

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
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      product_code: formValues.productCode,
      status: mapStatusFilter(formValues.status),
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
      return next >= total ? value : next;
    });
  }

  async function openDetail(mbid) {
    setDetail(null);
    setDetailMessage('계약 상세를 조회 중입니다.');
    try {
      const data = await fetchContractDetail(mbid);
      setDetail(data);
      setDetailMessage('');
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  async function handleStatusAction(action, reason) {
    const mbid = detail?.contract?.mbid;
    if (!mbid) {
      return;
    }
    setDetailMessage('계약 상태를 변경 중입니다.');
    try {
      await updateContractStatus(mbid, {
        action,
        changed_by: 'local-admin',
        reason,
      });
      const data = await fetchContractDetail(mbid);
      setDetail(data);
      setDetailMessage('계약 상태 변경이 완료되었습니다.');
      setReloadKey((value) => value + 1);
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li>
            <a href="/admin/moneybank/approval_tab1">심사 승인</a>
          </li>
          <li className="active">
            <a href="/admin/moneybank/approval_tab2">계약 관리</a>
          </li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="contractUserName">회원명</label>
            <input id="contractUserName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="contractFirmName">회사명</label>
            <input id="contractFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="contractProductCode">서비스</label>
            <input id="contractProductCode" name="productCode" type="text" value={formValues.productCode} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="contractStatus">진행상태</label>
            <select id="contractStatus" name="status" value={formValues.status} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="conditions_accept">조건</option>
              <option value="use_agree">동의</option>
              <option value="account_standby">계좌대기</option>
              <option value="normal">계약</option>
              <option value="expi_normal">종료</option>
            </select>
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="contractFromDate">승인일자</label>
            <input id="contractFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="contractToDate">종료일</label>
            <input id="contractToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="contractOrderBy">보기기준</label>
            <select id="contractOrderBy" name="orderBy" value={formValues.orderBy} onChange={updateFormValue}>
              <option value="request_date_desc">최근순</option>
              <option value="request_date_asc">과거순</option>
            </select>
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll">
        <div className="overflowBox">
          <table className="m-shadowTable contractManagementTable">
            <caption className="caption">계약 관리 목록</caption>
            <thead>
              <tr>
                <th scope="col">진행상태</th>
                <th scope="col">승인일자</th>
                <th scope="col">회원명</th>
                <th scope="col">회사명</th>
                <th scope="col">신청서비스</th>
                <th scope="col">신청쇼핑몰</th>
                <th scope="col">PCS 점수</th>
                <th scope="col">월결제액</th>
                <th scope="col">수수료</th>
                <th scope="col">지급율</th>
                <th scope="col">계약일자</th>
                <th scope="col">계약내역</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12">계약 목록을 조회 중입니다.</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="12">조회된 계약 데이터가 없습니다.</td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.status}</td>
                  <td>{row.approvedAt}</td>
                  <td>{row.userName}</td>
                  <td>{row.firmName}</td>
                  <td>{row.service}</td>
                  <td>{row.shopCount}</td>
                  <td>{row.prizmScore}</td>
                  <td>{row.salesAmount}</td>
                  <td>{row.feeRate}</td>
                  <td>{row.paymentRate}</td>
                  <td>{row.contractedAt}</td>
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
            <li><span className="txt">총 :</span><span className="result">{formatNumber(total)} 건</span></li>
            <li><span className="txt">대기건수 :</span><span className="result">{formatNumber(waitingCount)} 건</span></li>
            <li><span className="txt">계약건수 :</span><span className="result">{formatNumber(contractCount)} 건</span></li>
            <li><span className="txt">종료건수 :</span><span className="result">{formatNumber(endedCount)} 건</span></li>
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

      <ContractDetailPanel detail={detail} message={detailMessage} onStatusAction={handleStatusAction} />
    </>
  );
}

function ContractDetailPanel({ detail, message, onStatusAction }) {
  if (!detail && !message) {
    return null;
  }

  const contract = detail?.contract;
  const latestFee = detail?.fees?.[0];
  const rates = latestFee?.rates ?? [];
  const makeContractEnabled = canMakeContractStatus(contract?.status);

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">계약 상세</a>
          </li>
        </ul>
      </div>
      {message ? <p className="detailMessage">{message}</p> : null}
      {contract ? (
        <div className="detailSection">
          <h3>계약 정보</h3>
          <table className="detailInfoTable">
            <caption className="caption">계약 정보</caption>
            <tbody>
              <tr>
                <th scope="row">MBID</th>
                <td>{contract.mbid}</td>
                <th scope="row">진행상태</th>
                <td>{formatContractStatus(contract.status)}</td>
              </tr>
              <tr>
                <th scope="row">회원명</th>
                <td>{contract.user_name ?? '-'}</td>
                <th scope="row">회사명</th>
                <td>{contract.firm_name ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">승인일자</th>
                <td>{formatDate(contract.approval_date)}</td>
                <th scope="row">이용조건 동의일자</th>
                <td>{formatDate(contract.agree_date)}</td>
              </tr>
              <tr>
                <th scope="row">계약일자</th>
                <td>{formatDate(contract.contract_date)}</td>
                <th scope="row">만료일자</th>
                <td>{formatDate(contract.expire_date)}</td>
              </tr>
              <tr>
                <th scope="row">월결제액</th>
                <td>{formatNumber(contract.sales_amount)}</td>
                <th scope="row">신청쇼핑몰</th>
                <td>{contract.request_shop ?? contract.contract_shop_count ?? 0}</td>
              </tr>
              <tr>
                <th scope="row">지급율</th>
                <td>{formatRate(latestFee?.payment_rate)}</td>
                <th scope="row">건당주문한도</th>
                <td>{formatNumber(latestFee?.sales_limit_per_order)}</td>
              </tr>
              <tr>
                <th scope="row">최대 미상환잔액</th>
                <td>{formatNumber(latestFee?.max_outstanding_balance)}</td>
                <th scope="row">수수료율</th>
                <td>{rates.length > 0 ? rates.map((rate) => `${rate.fee_type}: ${formatRate(rate.fee_rate)}`).join(', ') : '-'}</td>
              </tr>
            </tbody>
          </table>
          <div className="detailActionRow">
            <button
              className="sBtn sColorLB"
              disabled={!makeContractEnabled}
              onClick={() => onStatusAction('contract_ready', 'contract readied by admin')}
              type="button"
            >
              체결
            </button>
            <span>{makeContractEnabled ? '계약 체결 후 계좌대기 단계로 전환합니다.' : '사용자 이용조건 동의 상태에서만 체결할 수 있습니다.'}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
