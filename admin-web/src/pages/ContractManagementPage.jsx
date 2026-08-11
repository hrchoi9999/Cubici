import { useEffect, useState } from 'react';
import { fetchContractDetail, fetchContracts, updateContractStatus } from '../api/contracts.js';
import { canCancelContractStatus, canMakeContractStatus, formatContractStatus } from '../utils/contractStatus.js';

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

function formatRate(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function formatService(value) {
  return value === 'MP' ? '선정산' : (value ?? '-');
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function mapContractToRow(contract) {
  return {
    id: contract.mbid,
    status: formatContractStatus(contract.status),
    mbid: contract.mbid,
    service: formatService(contract.product_code),
    paymentGroup: contract.fintech_name ?? '큐빅아이',
    contractedAt: formatDate(contract.contract_date),
    userId: contract.user_email ?? '-',
    firmName: contract.firm_name ?? '-',
    userName: contract.user_name ?? '-',
    paymentRate: formatRate(contract.latest_payment_rate),
    salesLimitPerOrder: formatNumber(contract.latest_sales_limit_per_order),
    maxOutstandingBalance: formatNumber(contract.latest_max_outstanding_balance),
    outstandingBalance: formatNumber(contract.latest_outstanding_balance ?? 0),
  };
}

export function ContractManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [exportMessage, setExportMessage] = useState('');
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
        const data = await fetchContracts({ limit: PAGE_SIZE, offset, contract_scope: true, ...filters });
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

  const rows = items.map(mapContractToRow);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

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
      contract_stage: formValues.status,
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
        const data = await fetchContracts({ limit: 100, offset: exportOffset, contract_scope: true, ...filters });
        const pageItems = data.items ?? [];
        exportTotal = data.total ?? pageItems.length;
        exportItems.push(...pageItems);
        exportOffset += pageItems.length;
        if (pageItems.length === 0) break;
      } while (exportOffset < exportTotal && exportOffset < 10000);

      const headers = ['상태', 'MBID', '이용서비스', '지급그룹사', '계약일자', '아이디', '회사명', '회원명', '지급율', '주문건당한도', '최대 미상환금', '미상환금'];
      const csvRows = exportItems.map((item) => {
        const row = mapContractToRow(item);
        return [row.status, row.mbid, row.service, row.paymentGroup, row.contractedAt, row.userId, row.firmName, row.userName, row.paymentRate, row.salesLimitPerOrder, row.maxOutstandingBalance, row.outstandingBalance];
      });
      const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      const blobUrl = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cubici-contracts-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      setExportMessage(`${formatNumber(exportItems.length)}건을 내려받았습니다.`);
    } catch (error) {
      setExportMessage(error.message);
    } finally {
      setIsExporting(false);
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
    <section className="contractLvPage">
      <div className="m-tab contractLvTabs">
        <ul>
          <li className="active"><a href="/admin/moneybank/approval_tab2">계약 관리</a></li>
          <li><a href="/admin/moneybank/redemption">상환 관리</a></li>
        </ul>
      </div>

      <div className="m-options contractLvBaseDate">
        <div className="pRight"><span className="baseDate"><b>기준</b> {new Date().toLocaleDateString('ko-KR')}</span></div>
      </div>

      <form className="m-search searchArea contractLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox"><label htmlFor="contractUserName">회원명</label><input id="contractUserName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} /></div>
          <div className="inputBox"><label htmlFor="contractFirmName">회사명</label><input id="contractFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} /></div>
          <div className="inputBox"><label htmlFor="contractProductCode">이용서비스</label><select id="contractProductCode" name="productCode" value={formValues.productCode} onChange={updateFormValue}><option value="">전체</option><option value="MP">선정산</option></select></div>
        </div>
        <div className="line">
          <div className="inputBox"><label htmlFor="contractStatus">상태</label><select id="contractStatus" name="status" value={formValues.status} onChange={updateFormValue}><option value="">전체</option><option value="wait">대기</option><option value="contract">계약</option><option value="end">종료</option></select></div>
          <div className="inputBox contractLvDateRange"><label htmlFor="contractFromDate">신청일자</label><input id="contractFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} /><span>~</span><input id="contractToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} /></div>
          <button className="sBtn sColorLB" type="submit">검색</button>
        </div>
      </form>

      <div className="m-options contractLvTableOptions">
        <div className="pRight">
          <div className="fwBox contractLvOrderBox"><label htmlFor="contractOrderBy">보기기준</label><select id="contractOrderBy" name="orderBy" value={formValues.orderBy} onChange={handleOrderByChange}><option value="request_date_desc">최근순</option><option value="request_date_asc">과거순</option></select></div>
          <button className="contractLvDownloadButton" type="button" onClick={handleExport} disabled={isExporting}>{isExporting ? '내려받는 중' : '엑셀 다운로드'}</button>
        </div>
        {exportMessage ? <p className="contractLvExportMessage" role="status">{exportMessage}</p> : null}
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll contractLvTable">
        <div className="overflowBox">
          <table className="m-shadowTable contractManagementTable">
            <caption className="caption">계약 관리 목록</caption>
            <thead><tr><th>상태</th><th>MBID</th><th>이용서비스</th><th>지급그룹사</th><th>계약일자</th><th>아이디</th><th>회사명</th><th>회원명</th><th>지급율</th><th>주문건당한도</th><th>최대 미상환금</th><th>미상환금</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan="12">계약 목록을 조회 중입니다.</td></tr> : rows.length === 0 ? <tr><td colSpan="12">조회된 계약 데이터가 없습니다.</td></tr> : rows.map((row) => (
                <tr key={row.id} onDoubleClick={() => openDetail(row.id)}>
                  <td>{row.status}</td><td><button className="contractLvMbidButton" type="button" onClick={() => openDetail(row.id)}>{row.mbid}</button></td><td>{row.service}</td><td>{row.paymentGroup}</td><td>{row.contractedAt}</td><td>{row.userId}</td><td>{row.firmName}</td><td>{row.userName}</td><td>{row.paymentRate}</td><td>{row.salesLimitPerOrder} 원</td><td>{row.maxOutstandingBalance} 원</td><td>{row.outstandingBalance} 원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="m-paging paging" id="pagingButton"><ul><li><button className="oiBtn prev" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button></li><li><a className="num active" href="javascript:;">{currentPage}</a></li><li><button className="oiBtn next" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button></li></ul></div>

      <ContractDetailPanel detail={detail} message={detailMessage} onStatusAction={handleStatusAction} />
    </section>
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
  const cancelContractEnabled = canCancelContractStatus(contract?.status);

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
            {makeContractEnabled ? (
              <button
                className="sBtn sColorLB"
                onClick={() => onStatusAction('contract_ready', 'contract readied by admin')}
                type="button"
              >
                체결
              </button>
            ) : null}
            {cancelContractEnabled ? (
              <button
                className="sBtn sColorG"
                onClick={() => onStatusAction('cancel', 'contract terminated by admin')}
                type="button"
              >
                해지
              </button>
            ) : null}
            <span>
              {makeContractEnabled
                ? '계약 체결 후 계좌대기 단계로 전환합니다.'
                : cancelContractEnabled
                  ? '계약 해지 후 사용자 현황과 휴면/해지 목록에 반영합니다.'
                  : '현재 상태에서 처리 가능한 계약 액션이 없습니다.'}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
