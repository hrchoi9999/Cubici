import { useEffect, useMemo, useState } from 'react';
import { adjustContractFee, fetchContractDetail, fetchContracts, updateContractStatus } from '../api/contracts.js';
import {
  canPresentTermsStatus,
  formatContractStatus,
  hasContractStatus,
} from '../utils/contractStatus.js';

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

function valueOrEmpty(value) {
  return value === null || value === undefined ? '' : String(value);
}

function toNullableInt(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}

function formatBusinessPeriod(value) {
  const digits = String(value ?? '').replaceAll(/\D/g, '');
  if (digits.length !== 8) return '-';
  const setupDate = new Date(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T00:00:00`);
  if (Number.isNaN(setupDate.getTime())) return '-';
  const today = new Date();
  const months = Math.max(0, (today.getFullYear() - setupDate.getFullYear()) * 12 + today.getMonth() - setupDate.getMonth());
  return `${Math.floor(months / 12)}년 ${months % 12}개월`;
}

function approvalStatusLabel(contract) {
  if (hasContractStatus(contract.status, ['PENDING_REVIEW', '03'])) return '심사대기';
  if (hasContractStatus(contract.status, ['CONDITIONS_REFUSED', 'TERMS_REFUSED', 'REJECTED', '41', '51'])) return '거부';
  if (contract.fee_adjusted) return '조정';
  if (hasContractStatus(contract.status, ['CONDITIONS_ACCEPT', 'USE_AGREE', '04', '05'])) return '승인';
  return formatContractStatus(contract.status);
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function mapContractToApprovalRow(contract) {
  const scoreValue = contract.prizm_score_value ?? (typeof contract.prizm_score === 'number' ? contract.prizm_score : null);
  return {
    id: contract.mbid,
    status: approvalStatusLabel(contract),
    requestedAt: formatDate(contract.request_date),
    userName: contract.user_name ?? '-',
    firmName: contract.firm_name ?? '-',
    service: contract.product_code === 'MP' ? '머니플러스' : (contract.product_code ?? '-'),
    businessPeriod: formatBusinessPeriod(contract.biz_setup_date),
    salesAmount: formatNumber(Math.round(Number(contract.sales_amount ?? 0) / 1000)),
    prizmScore: scoreValue == null ? (contract.prizm_score ?? '-') : formatNumber(scoreValue),
    recommendationApproved: scoreValue == null ? '-' : (scoreValue > 500 ? '승인' : '거부'),
    recommendationFee: contract.latest_fee_rate == null ? '-' : `${formatNumber(contract.latest_fee_rate)}%`,
    recommendationPaymentRate: contract.latest_payment_rate == null ? '-' : `${formatNumber(contract.latest_payment_rate)}%`,
    rawStatus: contract.status,
  };
}

export function ApprovalManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [feeMessage, setFeeMessage] = useState('');
  const [approvalSummary, setApprovalSummary] = useState({
    total: 0, wait: 0, complete: 0, accept: 0, adjust: 0, refuse: 0, refuse_rate: 0,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userId: '',
    productCode: '',
    approvalStatus: '',
    fromDate: '',
    toDate: '',
    orderBy: 'request_date_desc',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadApprovals() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchContracts({ limit: PAGE_SIZE, offset, approval_scope: true, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setApprovalSummary(data.approval_summary ?? {
            total: data.total ?? 0, wait: 0, complete: 0, accept: 0, adjust: 0, refuse: 0, refuse_rate: 0,
          });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setApprovalSummary({ total: 0, wait: 0, complete: 0, accept: 0, adjust: 0, refuse: 0, refuse_rate: 0 });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadApprovals();

    return () => {
      ignore = true;
    };
  }, [offset, filters, reloadKey]);

  const rows = useMemo(() => items.map(mapContractToApprovalRow), [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = [
    { label: '총', value: `${formatNumber(approvalSummary.total)} 건` },
    { label: '심사대기', value: `${formatNumber(approvalSummary.wait)} 건` },
    { label: '심사완료', value: `${formatNumber(approvalSummary.complete)} 건` },
    { label: '승인', value: `${formatNumber(approvalSummary.accept)} 건` },
    { label: '조정', value: `${formatNumber(approvalSummary.adjust)} 건` },
    { label: '거부', value: `${formatNumber(approvalSummary.refuse)} 건` },
    { label: '거부율', value: `${formatNumber(approvalSummary.refuse_rate)}%` },
  ];

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
    setFeeMessage('');
    setFilters({
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_id: formValues.userId,
      product_code: formValues.productCode,
      approval_stage: formValues.approvalStatus,
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
        const data = await fetchContracts({
          limit: 100,
          offset: exportOffset,
          approval_scope: true,
          ...filters,
        });
        const pageItems = data.items ?? [];
        exportTotal = data.total ?? pageItems.length;
        exportItems.push(...pageItems);
        exportOffset += pageItems.length;
        if (pageItems.length === 0) break;
      } while (exportOffset < exportTotal && exportOffset < 10000);

      const headers = ['승인상태', '신청일자', '회원명', '회사명', '신청서비스', '사업기간', '월결제액(천원)', '프리즘 점수', '추천승인', '추천수수료', '추천지급율'];
      const csvRows = exportItems.map((contract) => {
        const row = mapContractToApprovalRow(contract);
        return [row.status, row.requestedAt, row.userName, row.firmName, row.service, row.businessPeriod, row.salesAmount, row.prizmScore, row.recommendationApproved, row.recommendationFee, row.recommendationPaymentRate];
      });
      const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      const blobUrl = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cubici-moneybank-approvals-${new Date().toISOString().slice(0, 10)}.csv`;
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
    setDetailMessage('심사 상세를 조회 중입니다.');
    setFeeMessage('');
    try {
      const data = await fetchContractDetail(mbid);
      setDetail(data);
      setDetailMessage('');
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  async function handleFeeAdjust(mbid, values) {
    setFeeMessage('계약 조건을 저장 중입니다.');
    try {
      await adjustContractFee(mbid, {
        adjusted_by: 'local-admin',
        reason: values.reason,
        payment_rate: toNullableInt(values.paymentRate),
        sales_limit_per_order: toNullableInt(values.salesLimitPerOrder),
        max_outstanding_balance: toNullableInt(values.maxOutstandingBalance),
        fee_rates: values.rates
          .filter((rate) => rate.feeType && rate.feeRate !== '')
          .map((rate) => ({
            fee_type: rate.feeType,
            fee_rate: Number(rate.feeRate),
          })),
      });
      const data = await fetchContractDetail(mbid);
      setDetail(data);
      setFeeMessage('계약 조건 저장이 완료되었습니다.');
      setReloadKey((value) => value + 1);
    } catch (error) {
      setFeeMessage(error.message);
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
    <section className="approvalLvPage">
      <div className="m-tab approvalLvTabs">
        <ul>
          <li className="active">
            <a href="/admin/moneybank/approval_tab1">심사 승인</a>
          </li>
          <li>
            <a href="/admin/moneybank/approval_tab2">계약 관리</a>
          </li>
        </ul>
      </div>

      <div className="m-options approvalLvBaseDate">
        <div className="pRight">
          <span className="baseDate"><b>기준</b> {new Date().toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      <form className="m-search searchArea approvalLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="approvalUserName">회원명</label>
            <input id="approvalUserName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="approvalFirmName">회사명</label>
            <input id="approvalFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="approvalUserId">회원 ID</label>
            <input id="approvalUserId" name="userId" type="text" value={formValues.userId} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="approvalProductCode">서비스</label>
            <select id="approvalProductCode" name="productCode" value={formValues.productCode} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="MP">머니플러스</option>
            </select>
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="approvalStatus">승인상태</label>
            <select id="approvalStatus" name="approvalStatus" value={formValues.approvalStatus} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="wait">대기</option>
              <option value="accept">승인</option>
              <option value="adjust">조정</option>
              <option value="refuse">거부</option>
            </select>
          </div>
          <div className="inputBox approvalLvDateRange">
            <label htmlFor="approvalFromDate">신청일자</label>
            <input id="approvalFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
            <span>~</span>
            <input id="approvalToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <div className="m-options approvalLvTableOptions">
        <div className="pRight">
          <div className="fwBox approvalLvOrderBox">
            <label htmlFor="approvalOrderBy">보기기준</label>
            <select id="approvalOrderBy" name="orderBy" value={formValues.orderBy} onChange={handleOrderByChange}>
              <option value="request_date_desc">최근순</option>
              <option value="request_date_asc">과거순</option>
              <option value="sales_amount_desc">월결제액 높은순</option>
              <option value="sales_amount_asc">월결제액 낮은순</option>
            </select>
          </div>
          <button className="approvalLvDownloadButton" type="button" onClick={handleExport} disabled={isExporting}>
            {isExporting ? '내려받는 중' : '엑셀 다운로드'}
          </button>
        </div>
        {exportMessage ? <p className="approvalLvExportMessage" role="status">{exportMessage}</p> : null}
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll approvalLvTable">
        <div className="overflowBox">
          <table className="m-shadowTable approvalTable">
            <caption className="caption">심사 승인 목록</caption>
            <thead>
              <tr>
                <th rowSpan="2" scope="col">승인상태</th>
                <th rowSpan="2" scope="col">신청일자</th>
                <th rowSpan="2" scope="col">회원명</th>
                <th rowSpan="2" scope="col">회사명</th>
                <th rowSpan="2" scope="col">신청서비스</th>
                <th rowSpan="2" scope="col">사업기간</th>
                <th rowSpan="2" scope="col">월결제액(천원)</th>
                <th rowSpan="2" scope="col">프리즘 점수</th>
                <th colSpan="3" scope="colgroup">프리즘 추천</th>
                <th rowSpan="2" scope="col">조건심사</th>
              </tr>
              <tr>
                <th scope="col">승인</th>
                <th scope="col">수수료</th>
                <th scope="col">지급율</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12">심사 목록을 조회 중입니다.</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="12">조회된 심사 데이터가 없습니다.</td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.status}</td>
                  <td>{row.requestedAt}</td>
                  <td>{row.userName}</td>
                  <td>{row.firmName}</td>
                  <td>{row.service}</td>
                  <td>{row.businessPeriod}</td>
                  <td>{row.salesAmount}</td>
                  <td>{row.prizmScore}</td>
                  <td>{row.recommendationApproved}</td>
                  <td>{row.recommendationFee}</td>
                  <td>{row.recommendationPaymentRate}</td>
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
            {summary.map((item) => (
              <li key={item.label}><span className="txt">{item.label} :</span><span className="result">{item.value}</span></li>
            ))}
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

      <ApprovalDetailPanel
        detail={detail}
        feeMessage={feeMessage}
        message={detailMessage}
        onFeeAdjust={handleFeeAdjust}
        onStatusAction={handleStatusAction}
      />
    </section>
  );
}

function ApprovalDetailPanel({ detail, feeMessage, message, onFeeAdjust, onStatusAction }) {
  if (!detail && !message) {
    return null;
  }

  const contract = detail?.contract;
  const document = detail?.document;
  const riskResult = detail?.risk_result;
  const latestFee = detail?.fees?.[0];
  const rates = latestFee?.rates ?? [];
  const canPresent = canPresentTermsStatus(contract?.status);
  const hasFee = Boolean(latestFee);

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">심사 상세</a>
          </li>
        </ul>
      </div>
      {message ? <p className="detailMessage">{message}</p> : null}
      {contract ? (
        <div className="detailSection">
          <h3>심사 정보</h3>
          <table className="detailInfoTable">
            <caption className="caption">심사 정보</caption>
            <tbody>
              <tr>
                <th scope="row">MBID</th>
                <td>{contract.mbid}</td>
                <th scope="row">승인상태</th>
                <td>{formatContractStatus(contract.status)}</td>
              </tr>
              <tr>
                <th scope="row">회원명</th>
                <td>{contract.user_name ?? '-'}</td>
                <th scope="row">회사명</th>
                <td>{contract.firm_name ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">신청일자</th>
                <td>{formatDate(contract.request_date)}</td>
                <th scope="row">승인일자</th>
                <td>{formatDate(contract.approval_date)}</td>
              </tr>
              <tr>
                <th scope="row">월결제액</th>
                <td>{formatNumber(contract.sales_amount)}</td>
                <th scope="row">제출서류</th>
                <td>{contract.sub_complete ?? 'N'} ({contract.document_file_count ?? 0}건)</td>
              </tr>
              <tr>
                <th scope="row">PCS 점수</th>
                <td>{formatNumber(riskResult?.prizm_score)}</td>
                <th scope="row">PCS 등급</th>
                <td>{riskResult?.prizm_grade ?? contract.prizm_score ?? '-'}</td>
              </tr>
              <tr>
                <th scope="row">CB 점수</th>
                <td>{formatNumber(document?.cb_score_current)}</td>
                <th scope="row">연체정보</th>
                <td>{document?.overdue_status ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {contract ? (
        <ContractFeeAdjustPanel
          fees={detail?.fees ?? []}
          mbid={contract.mbid}
          message={feeMessage}
          onAdjust={onFeeAdjust}
        />
      ) : null}
      {contract ? (
        <div className="detailSection">
          <h3>조건 제시</h3>
          <table className="detailInfoTable">
            <caption className="caption">조건 제시</caption>
            <tbody>
              <tr>
                <th scope="row">지급율</th>
                <td>{latestFee?.payment_rate == null ? '-' : `${latestFee.payment_rate}%`}</td>
                <th scope="row">수수료율</th>
                <td>{rates.length > 0 ? rates.map((rate) => `${rate.fee_type}: ${rate.fee_rate}%`).join(', ') : '-'}</td>
              </tr>
              <tr>
                <th scope="row">주문한도</th>
                <td>{formatNumber(latestFee?.sales_limit_per_order)}</td>
                <th scope="row">최대잔액</th>
                <td>{formatNumber(latestFee?.max_outstanding_balance)}</td>
              </tr>
            </tbody>
          </table>
          <div className="detailActionRow">
            <button
              className="sBtn sColorLB"
              disabled={!canPresent || !hasFee}
              onClick={() => onStatusAction('present_terms', 'terms presented by admin')}
              type="button"
            >
              조건 제시
            </button>
            <span>{hasFee ? '사용자 이용조건 확인 단계로 전환합니다.' : '수수료 조건 등록 후 조건 제시가 가능합니다.'}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ContractFeeAdjustPanel({ fees, mbid, message, onAdjust }) {
  const fee = useMemo(() => {
    if (!fees || fees.length === 0) {
      return null;
    }
    return [...fees].sort((left, right) => Number(right.id) - Number(left.id))[0];
  }, [fees]);
  const [values, setValues] = useState(() => toContractFeeFormValues(fee));

  useEffect(() => {
    setValues(toContractFeeFormValues(fee));
  }, [fee]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateRate(index, field, value) {
    setValues((current) => ({
      ...current,
      rates: current.rates.map((rate, rateIndex) => (
        rateIndex === index ? { ...rate, [field]: value } : rate
      )),
    }));
  }

  function addRate() {
    setValues((current) => ({
      ...current,
      rates: [...current.rates, { feeType: '', feeRate: '' }],
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    onAdjust(mbid, values);
  }

  return (
    <div className="detailSection">
      <h3>계약 조건 조정</h3>
      <form className="contractFeeForm" onSubmit={submitForm}>
        <div className="contractFeeGrid">
          <label>
            지급율(%)
            <input name="paymentRate" type="number" value={values.paymentRate} onChange={updateValue} />
          </label>
          <label>
            건당 주문한도
            <input name="salesLimitPerOrder" type="number" value={values.salesLimitPerOrder} onChange={updateValue} />
          </label>
          <label>
            최대 미상환잔액
            <input name="maxOutstandingBalance" type="number" value={values.maxOutstandingBalance} onChange={updateValue} />
          </label>
          <label>
            조정사유
            <input name="reason" type="text" value={values.reason} onChange={updateValue} required />
          </label>
        </div>
        <table className="contractFeeRateTable">
          <caption className="caption">수수료율(%)</caption>
          <thead>
            <tr>
              <th scope="col">구분</th>
              <th scope="col">수수료율(%)</th>
            </tr>
          </thead>
          <tbody>
            {values.rates.length === 0 ? (
              <tr>
                <td colSpan="2">등록된 수수료율이 없습니다.</td>
              </tr>
            ) : values.rates.map((rate, index) => (
              <tr key={`${rate.feeType}-${index}`}>
                <td>
                  <input
                    aria-label={`수수료 구분 ${index + 1}`}
                    type="text"
                    value={rate.feeType}
                    onChange={(event) => updateRate(index, 'feeType', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`수수료율 ${index + 1}`}
                    type="number"
                    step="0.0001"
                    value={rate.feeRate}
                    onChange={(event) => updateRate(index, 'feeRate', event.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="contractFeeActions">
          <button className="sBtn sColorN" type="button" onClick={addRate}>
            수수료율 추가
          </button>
          <button className="sBtn sColorLB" type="submit">
            조건 저장
          </button>
        </div>
      </form>
      {message ? <p className="detailMessage">{message}</p> : null}
    </div>
  );
}

function toContractFeeFormValues(fee) {
  return {
    paymentRate: valueOrEmpty(fee?.payment_rate),
    salesLimitPerOrder: valueOrEmpty(fee?.sales_limit_per_order),
    maxOutstandingBalance: valueOrEmpty(fee?.max_outstanding_balance),
    reason: '',
    rates: (fee?.rates ?? []).map((rate) => ({
      feeType: rate.fee_type ?? '',
      feeRate: valueOrEmpty(rate.fee_rate),
    })),
  };
}
