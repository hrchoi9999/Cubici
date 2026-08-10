import { useEffect, useMemo, useState } from 'react';
import {
  adjustContractFee,
  confirmContractDocuments,
  createContractReviewNote,
  fetchContractDetail,
  fetchContractDocumentFiles,
  fetchContractReviewNotes,
  fetchContracts,
  getContractDocumentDownloadUrl,
  uploadContractDocumentFile,
  updateContractDocumentChecks,
  updateContractStatus,
} from '../api/contracts.js';
import {
  canCancelContractStatus,
  canMoveToReviewStatus,
  canRejectContractStatus,
  canRequestDocumentSupplementStatus,
  formatContractStatus,
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

function formatFlag(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (value === true || value === 'true' || value === '1' || value === 1 || value === 'Y') {
    return 'Y';
  }
  if (value === false || value === 'false' || value === '0' || value === 0 || value === 'N') {
    return 'N';
  }

  return String(value);
}

function flagToFormValue(value) {
  if (value === true || value === 'true' || value === '1' || value === 1 || value === 'Y') {
    return '1';
  }
  if (value === false || value === 'false' || value === '0' || value === 0 || value === 'N') {
    return '0';
  }
  return '';
}

function valueOrEmpty(value) {
  return value === null || value === undefined ? '' : String(value);
}

function toNullableInt(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}

function toNullableFlag(value) {
  return value === '' ? null : value;
}

function mapContractToRow(contract) {
  return {
    id: contract.mbid,
    status: formatContractStatus(contract.status),
    count: contract.use_count > 0 ? `${contract.use_count}회` : '신규',
    requestedAt: formatDate(contract.request_date),
    userId: contract.user_email ?? contract.user_no ?? '-',
    userName: contract.user_name ?? '-',
    amount: formatNumber(Math.round(Number(contract.sales_amount ?? 0) / 1000)),
    shop: contract.request_shop ?? contract.contract_shop_count ?? 0,
    documents: `${contract.sub_complete ?? 'N'} (${contract.document_file_count ?? 0}건)`,
    score: contract.prizm_score ?? '계산',
  };
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function AdminDashboardPage() {
  const [contracts, setContracts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailMode, setDetailMode] = useState('status');
  const [documentFiles, setDocumentFiles] = useState([]);
  const [reviewNotes, setReviewNotes] = useState([]);
  const [detailMessage, setDetailMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [feeMessage, setFeeMessage] = useState('');
  const [fileMessage, setFileMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [requestSummary, setRequestSummary] = useState({ total: 0, progress: 0, complete: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [formValues, setFormValues] = useState({
    userId: '',
    userName: '',
    firmName: '',
    requestStage: '',
    productCode: '',
    minSalesAmount: '',
    maxSalesAmount: '',
    fromDate: '',
    toDate: '',
    orderBy: 'request_date_desc',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadContracts() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchContracts({ limit: PAGE_SIZE, offset, request_scope: true, ...filters });
        if (!ignore) {
          setContracts(data.items ?? []);
          setTotal(data.total ?? 0);
          setRequestSummary(data.request_summary ?? {
            total: data.total ?? 0,
            progress: 0,
            complete: 0,
          });
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
          setContracts([]);
          setTotal(0);
          setRequestSummary({ total: 0, progress: 0, complete: 0 });
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
  }, [offset, filters]);

  const rows = useMemo(() => contracts.map(mapContractToRow), [contracts]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = [
    { label: '총 신청 접수', value: `${formatNumber(requestSummary.total)} 건` },
    { label: '신청 진행', value: `${formatNumber(requestSummary.progress)} 건` },
    { label: '신청 완료', value: `${formatNumber(requestSummary.complete)} 건` },
  ];

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
    setFilters({
      request_stage: formValues.requestStage,
      user_id: formValues.userId,
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      product_code: formValues.productCode,
      min_sales_amount: formValues.minSalesAmount,
      max_sales_amount: formValues.maxSalesAmount,
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
      const items = [];
      let exportOffset = 0;
      let exportTotal = 0;

      do {
        const data = await fetchContracts({
          limit: 100,
          offset: exportOffset,
          request_scope: true,
          ...filters,
        });
        const pageItems = data.items ?? [];
        exportTotal = data.total ?? pageItems.length;
        items.push(...pageItems);
        exportOffset += pageItems.length;
        if (pageItems.length === 0) break;
      } while (exportOffset < exportTotal && exportOffset < 10000);

      const headers = ['상태', '재이용', '신청일자', '회원ID', '회원명', '월결제액(천원)', '등록쇼핑몰', '제출서류 확인', '프리즘 점수'];
      const csvRows = items.map((contract) => {
        const row = mapContractToRow(contract);
        return [row.status, row.count, row.requestedAt, row.userId, row.userName, row.amount, row.shop, row.documents, row.score];
      });
      const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      const blobUrl = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cubici-moneybank-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      setExportMessage(`${formatNumber(items.length)}건을 내려받았습니다.`);
    } catch (error) {
      setExportMessage(error.message);
    } finally {
      setIsExporting(false);
    }
  }

  async function openDetail(mbid, mode = 'status') {
    setDetail(null);
    setDetailMode(mode);
    setDocumentFiles([]);
    setReviewNotes([]);
    setDetailMessage(`${getDetailModeLabel(mode)} 정보를 조회 중입니다.`);
    setStatusMessage('');
    setFeeMessage('');
    setFileMessage('');
    setReviewMessage('');

    try {
      const [data, files, notes] = await Promise.all([
        fetchContractDetail(mbid),
        fetchContractDocumentFiles(mbid),
        fetchContractReviewNotes(mbid),
      ]);
      setDetail(data);
      setDocumentFiles(files.items ?? []);
      setReviewNotes(notes.items ?? []);
      setDetailMessage('');
    } catch (error) {
      setDetailMessage(error.message);
    }
  }

  async function refreshDocumentFiles(mbid) {
    const files = await fetchContractDocumentFiles(mbid);
    setDocumentFiles(files.items ?? []);
  }

  async function refreshContractDetail(mbid) {
    const data = await fetchContractDetail(mbid);
    setDetail(data);
    setContracts((current) => current.map((contract) => (
      contract.mbid === mbid ? data.contract : contract
    )));
  }

  async function refreshReviewNotes(mbid) {
    const notes = await fetchContractReviewNotes(mbid);
    setReviewNotes(notes.items ?? []);
  }

  async function handleDocumentUpload({ mbid, documentType, file }) {
    setFileMessage('제출서류를 업로드 중입니다.');
    try {
      await uploadContractDocumentFile(mbid, {
        documentType,
        uploadedBy: 'local-admin',
        file,
      });
      await refreshDocumentFiles(mbid);
      await refreshContractDetail(mbid);
      setFileMessage('제출서류 업로드가 완료되었습니다.');
    } catch (error) {
      setFileMessage(error.message);
    }
  }

  async function handleDocumentConfirm(mbid) {
    setFileMessage('제출서류 최종 확인을 처리 중입니다.');
    try {
      await confirmContractDocuments(mbid, {
        confirmedBy: 'local-admin',
      });
      await refreshContractDetail(mbid);
      setFileMessage('제출서류 최종 확인이 완료되었습니다.');
    } catch (error) {
      setFileMessage(error.message);
    }
  }

  async function handleDocumentCheckSave(mbid, values) {
    setFileMessage('서류 확인값을 저장 중입니다.');
    try {
      await updateContractDocumentChecks(mbid, {
        updated_by: 'local-admin',
        cb_score_current: toNullableInt(values.cbScoreCurrent),
        cb_score_rank: toNullableInt(values.cbScoreRank),
        cb_score_past: toNullableInt(values.cbScorePast),
        debt_status: toNullableFlag(values.debtStatus),
        financial_disorder_status: toNullableFlag(values.financialDisorderStatus),
        public_information_status: toNullableFlag(values.publicInformationStatus),
        overdue_status: toNullableFlag(values.overdueStatus),
        national_tax_full_payment: toNullableFlag(values.nationalTaxFullPayment),
        local_tax_full_payment: toNullableFlag(values.localTaxFullPayment),
        health_insurance_full_payment: toNullableFlag(values.healthInsuranceFullPayment),
        health_insurance_paid_amount: toNullableInt(values.healthInsurancePaidAmount),
      });
      await refreshContractDetail(mbid);
      setFileMessage('서류 확인값 저장이 완료되었습니다.');
    } catch (error) {
      setFileMessage(error.message);
    }
  }

  async function handleReviewNoteCreate(mbid, values) {
    setReviewMessage('심사 메모를 등록 중입니다.');
    try {
      await createContractReviewNote(mbid, {
        reviewer: values.reviewer,
        title: values.title,
        detail: values.detail,
      });
      await refreshReviewNotes(mbid);
      setReviewMessage('심사 메모 등록이 완료되었습니다.');
    } catch (error) {
      setReviewMessage(error.message);
    }
  }

  async function handleContractStatusChange(mbid, action) {
    setStatusMessage('계약 상태를 변경 중입니다.');
    try {
      await updateContractStatus(mbid, {
        action,
        changed_by: 'local-admin',
        reason: getStatusActionLabel(action),
      });
      await refreshContractDetail(mbid);
      setStatusMessage('계약 상태 변경이 완료되었습니다.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleContractFeeAdjust(mbid, values) {
    setFeeMessage('계약 조건을 변경 중입니다.');
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
      await refreshContractDetail(mbid);
      setFeeMessage('계약 조건 변경이 완료되었습니다.');
    } catch (error) {
      setFeeMessage(error.message);
    }
  }

  return (
    <section className="requestLvPage">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">신청 현황</a>
          </li>
        </ul>
      </div>

      <div className="m-options requestLvBaseDate">
        <div className="pRight">
          <span className="baseDate"><b>기준</b> {new Date().toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      <div className="contentGrid">
        <form className="m-search searchArea requestLvSearch" onSubmit={handleSearch}>
          <div className="line requestLvSearchGrid">
            <div className="inputBox">
              <label htmlFor="userName">회원명</label>
              <input id="userName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} />
            </div>
            <div className="inputBox">
              <label htmlFor="firmName">회사명</label>
              <input id="firmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} />
            </div>
            <div className="inputBox">
              <label htmlFor="userId">회원ID</label>
              <input id="userId" name="userId" type="text" value={formValues.userId} onChange={updateFormValue} />
            </div>
            <div className="inputBox">
              <label htmlFor="productCode">서비스 구분</label>
              <select id="productCode" name="productCode" value={formValues.productCode} onChange={updateFormValue}>
                <option value="">전체</option>
                <option value="MP">머니뱅크</option>
              </select>
            </div>
          </div>
          <div className="line requestLvSearchGrid">
            <div className="inputBox">
              <label htmlFor="selectStatus">신청상태</label>
              <select id="selectStatus" name="requestStage" value={formValues.requestStage} onChange={updateFormValue}>
                <option value="">전체</option>
                <option value="progress">신청</option>
                <option value="complete">완료</option>
              </select>
            </div>
            <div className="inputBox requestLvRange">
              <label htmlFor="minSalesAmount">월결제액</label>
              <input id="minSalesAmount" name="minSalesAmount" type="number" value={formValues.minSalesAmount} onChange={updateFormValue} />
              <span>~</span>
              <input id="maxSalesAmount" name="maxSalesAmount" type="number" value={formValues.maxSalesAmount} onChange={updateFormValue} />
            </div>
            <div className="inputBox requestLvRange">
              <label htmlFor="fromDate">신청일자</label>
              <input id="fromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
              <span>~</span>
              <input id="toDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
            </div>
            <button className="sBtn sColorLB" type="submit">
              검색
            </button>
          </div>
        </form>

        <div className="m-options requestLvTableOptions">
          <div className="pRight">
            <div className="fwBox requestLvOrderBox">
              <label htmlFor="orderBy">보기기준</label>
              <select id="orderBy" name="orderBy" value={formValues.orderBy} onChange={handleOrderByChange}>
                <option value="request_date_desc">신청일 최신순</option>
                <option value="request_date_asc">신청일 오래된순</option>
                <option value="sales_amount_desc">월결제액 높은순</option>
                <option value="sales_amount_asc">월결제액 낮은순</option>
              </select>
            </div>
            <button className="requestLvDownloadButton" type="button" onClick={handleExport} disabled={isExporting}>
              {isExporting ? '내려받는 중' : '엑셀 다운로드'}
            </button>
          </div>
          {exportMessage ? <p className="requestLvExportMessage" role="status">{exportMessage}</p> : null}
        </div>

        <div id="fixTable" className="fixTable legacyListTable table-scroll requestLvTable">
          <div className="overflowBox">
          <table className="m-shadowTable requestTable">
            <caption className="caption">신청 접수 목록</caption>
            <thead>
              <tr>
                <th scope="col">상태</th>
                <th scope="col">재이용</th>
                <th scope="col">신청일자</th>
                <th scope="col">회원ID</th>
                <th scope="col">회원명</th>
                <th scope="col">월결제액(천원)</th>
                <th scope="col">등록쇼핑몰</th>
                <th scope="col">제출서류 확인</th>
                <th scope="col">프리즘 점수</th>
              </tr>
            </thead>
            <tbody id="fixTbody">
              {isLoading ? (
                <tr>
                  <td colSpan="9">조회 중입니다.</td>
                </tr>
              ) : null}
              {!isLoading && errorMessage ? (
                <tr>
                  <td colSpan="9">{errorMessage}</td>
                </tr>
              ) : null}
              {!isLoading && !errorMessage && rows.length === 0 ? (
                <tr>
                  <td colSpan="9">조회된 결과가 없습니다.</td>
                </tr>
              ) : null}
              {!isLoading && !errorMessage ? rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="linkButton" type="button" onClick={() => openDetail(row.id, 'status')}>
                      {row.status}
                    </button>
                  </td>
                  <td>{row.count}</td>
                  <td>{row.requestedAt}</td>
                  <td>{row.userId}</td>
                  <td>{row.userName}</td>
                  <td>{row.amount}</td>
                  <td>{row.shop}</td>
                  <td>
                    <button className="sColorLB refund-btn" type="button" onClick={() => openDetail(row.id, 'documents')}>
                      {row.documents}
                    </button>
                  </td>
                  <td>
                    <button className="linkButton" type="button" onClick={() => openDetail(row.id, 'score')}>
                      {row.score}
                    </button>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
          </div>
          <div className="fixBottom">
            <ul className="tableTotal">
              {summary.map((item) => (
                <li key={item.label}>
                  <span className="txt">{item.label}</span>
                  <span className="result">{item.value}</span>
                </li>
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
        <ContractDetailPanel
          detail={detail}
          mode={detailMode}
          documentFiles={documentFiles}
          fileMessage={fileMessage}
          message={detailMessage}
          reviewMessage={reviewMessage}
          reviewNotes={reviewNotes}
          feeMessage={feeMessage}
          statusMessage={statusMessage}
          onContractFeeAdjust={handleContractFeeAdjust}
          onContractStatusChange={handleContractStatusChange}
          onDocumentConfirm={handleDocumentConfirm}
          onDocumentCheckSave={handleDocumentCheckSave}
          onDocumentUpload={handleDocumentUpload}
          onReviewNoteCreate={handleReviewNoteCreate}
        />
      </div>
    </section>
  );
}

function getDetailModeLabel(mode) {
  if (mode === 'documents') {
    return '서류';
  }
  if (mode === 'score') {
    return 'Prism Score';
  }
  return '상태';
}

function getStatusActionLabel(action) {
  if (action === 'approve') {
    return '심사대기 전환';
  }
  if (action === 'document_pending') {
    return '서류보완 요청';
  }
  if (action === 'reject') {
    return '거부';
  }
  if (action === 'cancel') {
    return '해지';
  }
  return action;
}

function ContractDetailPanel({
  detail,
  mode,
  documentFiles,
  fileMessage,
  feeMessage,
  message,
  reviewMessage,
  reviewNotes,
  statusMessage,
  onContractFeeAdjust,
  onContractStatusChange,
  onDocumentConfirm,
  onDocumentCheckSave,
  onDocumentUpload,
  onReviewNoteCreate,
}) {
  if (!detail && !message) {
    return null;
  }

  const contract = detail?.contract;
  const document = detail?.document;
  const fees = detail?.fees ?? [];
  const redemption = detail?.redemption;
  const riskResult = detail?.risk_result;
  const title = getDetailModeLabel(mode);

  return (
    <div className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">{title} 상세</a>
          </li>
        </ul>
      </div>
      {message ? <p className="detailMessage">{message}</p> : null}
      {contract ? (
        <>
          {mode === 'status' ? (
            <StatusDetailSections
              contract={contract}
              feeMessage={feeMessage}
              fees={fees}
              message={statusMessage}
              redemption={redemption}
              onFeeAdjust={onContractFeeAdjust}
              onStatusChange={onContractStatusChange}
            />
          ) : null}

          {mode === 'documents' ? (
            <DocumentDetailSections
              contract={contract}
              document={document}
              documentFiles={documentFiles}
              fileMessage={fileMessage}
              reviewMessage={reviewMessage}
              reviewNotes={reviewNotes}
              riskResult={riskResult}
              onDocumentCheckSave={onDocumentCheckSave}
              onDocumentConfirm={onDocumentConfirm}
              onDocumentUpload={onDocumentUpload}
              onReviewNoteCreate={onReviewNoteCreate}
            />
          ) : null}

          {mode === 'score' ? (
            <ScoreDetailSection contract={contract} riskResult={riskResult} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function StatusDetailSections({ contract, feeMessage, fees, message, redemption, onFeeAdjust, onStatusChange }) {
  const canCancel = canCancelContractStatus(contract.status);
  const canMoveToReview = canMoveToReviewStatus(contract.status);
  const canRequestSupplement = canRequestDocumentSupplementStatus(contract.status);
  const canReject = canRejectContractStatus(contract.status);
  const hasAction = canMoveToReview || canRequestSupplement || canReject || canCancel;

  return (
    <>
      <section className="detailSection">
        <h3>회원정보</h3>
        <table className="detailInfoTable">
          <caption className="caption">회원정보</caption>
          <tbody>
            <tr>
              <th scope="row">신청서비스</th>
              <td>{contract.product_code ?? '-'}</td>
              <th scope="row">상태</th>
              <td>{formatContractStatus(contract.status)}</td>
            </tr>
            <tr>
              <th scope="row">회원명</th>
              <td>{contract.user_name ?? '-'}</td>
              <th scope="row">회원ID</th>
              <td>{contract.user_email ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">회사명</th>
              <td>{contract.firm_name ?? '-'}</td>
              <th scope="row">신청일자</th>
              <td>{formatDate(contract.request_date)}</td>
            </tr>
            <tr>
              <th scope="row">월결제액</th>
              <td>{formatNumber(contract.sales_amount)}</td>
              <th scope="row">등록쇼핑몰</th>
              <td>{contract.request_shop ?? contract.contract_shop_count ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="detailSection">
        <h3>신청 상태</h3>
        <table className="detailInfoTable">
          <caption className="caption">신청 상태</caption>
          <tbody>
            <tr>
              <th scope="row">신청일</th>
              <td>{formatDate(contract.request_date)}</td>
              <th scope="row">승인일</th>
              <td>{formatDate(contract.approval_date)}</td>
            </tr>
            <tr>
              <th scope="row">동의일</th>
              <td>{formatDate(contract.agree_date)}</td>
              <th scope="row">계약일</th>
              <td>{formatDate(contract.contract_date)}</td>
            </tr>
            <tr>
              <th scope="row">만료일</th>
              <td>{formatDate(contract.expire_date)}</td>
              <th scope="row">취소요청일</th>
              <td>{formatDate(contract.cancel_request_date)}</td>
            </tr>
            <tr>
              <th scope="row">상환 판매건수</th>
              <td>{redemption?.sales_count ?? 0}</td>
              <th scope="row">미상환잔액</th>
              <td>{formatNumber(redemption?.latest_outstanding_balance)}</td>
            </tr>
          </tbody>
        </table>
        <div className="statusActions">
          {canMoveToReview ? (
            <button className="sBtn sColorLB" type="button" onClick={() => onStatusChange(contract.mbid, 'approve')}>
              심사대기 전환
            </button>
          ) : null}
          {canRequestSupplement ? (
            <button className="sBtn sColorN" type="button" onClick={() => onStatusChange(contract.mbid, 'document_pending')}>
              서류보완 요청
            </button>
          ) : null}
          {canReject ? (
            <button className="sBtn sColorN" type="button" onClick={() => onStatusChange(contract.mbid, 'reject')}>
              거부
            </button>
          ) : null}
          {canCancel ? (
            <button className="sBtn sColorG" type="button" onClick={() => onStatusChange(contract.mbid, 'cancel')}>
              해지
            </button>
          ) : null}
        </div>
        {!hasAction ? <p className="detailMessage">현재 상태에서 처리 가능한 신청 상태 액션이 없습니다.</p> : null}
        {message ? <p className="detailMessage">{message}</p> : null}
      </section>
      <ContractFeeAdjustPanel
        fees={fees}
        mbid={contract.mbid}
        message={feeMessage}
        onAdjust={onFeeAdjust}
      />
    </>
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
    <section className="detailSection">
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
                    type="text"
                    value={rate.feeType}
                    onChange={(event) => updateRate(index, 'feeType', event.target.value)}
                  />
                </td>
                <td>
                  <input
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
    </section>
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

function DocumentDetailSections({
  contract,
  document,
  documentFiles,
  fileMessage,
  reviewMessage,
  reviewNotes,
  riskResult,
  onDocumentCheckSave,
  onDocumentConfirm,
  onDocumentUpload,
  onReviewNoteCreate,
}) {
  return (
    <>
      <section className="detailSection">
        <h3>신용정보 입력</h3>
        <DocumentCheckForm
          document={document}
          mbid={contract.mbid}
          onSave={onDocumentCheckSave}
        />
        <table className="detailInfoTable">
          <caption className="caption">신용정보 입력</caption>
          <tbody>
            <tr>
              <th scope="row">현 CB 점수</th>
              <td>{formatNumber(document?.cb_score_current)}</td>
              <th scope="row">CB 등수</th>
              <td>{formatNumber(document?.cb_score_rank)}</td>
            </tr>
            <tr>
              <th scope="row">6개월 CB 점수</th>
              <td>{formatNumber(document?.cb_score_past)}</td>
              <th scope="row">CB 확인</th>
              <td>{formatFlag(document?.cb_check)}</td>
            </tr>
            <tr>
              <th scope="row">채무불이행</th>
              <td>{formatFlag(document?.debt_status)}</td>
              <th scope="row">금융질서문란</th>
              <td>{formatFlag(document?.financial_disorder_status)}</td>
            </tr>
            <tr>
              <th scope="row">공공정보</th>
              <td>{formatFlag(document?.public_information_status)}</td>
              <th scope="row">연체정보</th>
              <td>{formatFlag(document?.overdue_status)}</td>
            </tr>
            <tr>
              <th scope="row">CB 확인자</th>
              <td>{document?.cb_confirm_admin ?? '-'}</td>
              <th scope="row">프리즘 등급</th>
              <td>{contract.prizm_score ?? riskResult?.prizm_grade ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="detailSection">
        <h3>서류 확인</h3>
        <table className="detailInfoTable">
          <caption className="caption">서류 확인</caption>
          <tbody>
            <tr>
              <th scope="row">사업자번호</th>
              <td>{document?.business_no ?? '-'}</td>
              <th scope="row">사업개시일</th>
              <td>{document?.business_start_date ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">과세유형</th>
              <td>{document?.tax_type ?? '-'}</td>
              <th scope="row">제출서류</th>
              <td>{contract.sub_complete ?? 'N'} ({contract.document_file_count ?? 0}건)</td>
            </tr>
            <tr>
              <th scope="row">국세 완납</th>
              <td>{formatFlag(document?.national_tax_full_payment)}</td>
              <th scope="row">지방세 완납</th>
              <td>{formatFlag(document?.local_tax_full_payment)}</td>
            </tr>
            <tr>
              <th scope="row">건강보험 완납</th>
              <td>{formatFlag(document?.health_insurance_full_payment)}</td>
              <th scope="row">건강보험 납부총액</th>
              <td>{formatNumber(document?.health_insurance_paid_amount)}</td>
            </tr>
            <tr>
              <th scope="row">최종 확인자</th>
              <td>{document?.final_confirm_admin ?? '-'}</td>
              <th scope="row">상태</th>
              <td>{contract.sub_complete ?? 'N'}</td>
            </tr>
          </tbody>
        </table>
        <DocumentFileManager
          mbid={contract.mbid}
          files={documentFiles}
          fileMessage={fileMessage}
          isComplete={contract.sub_complete === 'Y'}
          onConfirm={onDocumentConfirm}
          onUpload={onDocumentUpload}
        />
      </section>

      <section className="detailSection">
        <h3>안내 전화</h3>
        <ReviewNotePanel
          mbid={contract.mbid}
          message={reviewMessage}
          notes={reviewNotes}
          onCreate={onReviewNoteCreate}
        />
      </section>
    </>
  );
}

function ScoreDetailSection({ contract, riskResult }) {
  return (
    <section className="detailSection">
      <h3>Prism Score</h3>
      <table className="detailInfoTable">
        <caption className="caption">Prism Score</caption>
        <tbody>
          <tr>
            <th scope="row">MBID</th>
            <td>{contract.mbid}</td>
            <th scope="row">회원명</th>
            <td>{contract.user_name ?? '-'}</td>
          </tr>
          <tr>
            <th scope="row">PCS 등급</th>
            <td>{riskResult?.prizm_grade ?? contract.prizm_score ?? '-'}</td>
            <th scope="row">PCS 점수</th>
            <td>{formatNumber(riskResult?.prizm_score)}</td>
          </tr>
          <tr>
            <th scope="row">PMS 등급</th>
            <td>{riskResult?.pms_grade ?? '-'}</td>
            <th scope="row">PMS 점수</th>
            <td>{formatNumber(riskResult?.pms_score)}</td>
          </tr>
          <tr>
            <th scope="row">월 매출액</th>
            <td>{formatNumber(riskResult?.month_sales_value)}</td>
            <th scope="row">월 정산액</th>
            <td>{formatNumber(riskResult?.month_settlement_amount)}</td>
          </tr>
          <tr>
            <th scope="row">반품률</th>
            <td>{formatNumber(riskResult?.month_return_rate)}</td>
            <th scope="row">배송기간</th>
            <td>{formatNumber(riskResult?.month_delivery_period)}</td>
          </tr>
          <tr>
            <th scope="row">영업기간</th>
            <td>{formatNumber(riskResult?.operating_period)}</td>
            <th scope="row">쇼핑몰 수</th>
            <td>{formatNumber(riskResult?.shop_count)}</td>
          </tr>
          <tr>
            <th scope="row">PCS 산출일</th>
            <td>{formatDate(riskResult?.pcs_reg_date)}</td>
            <th scope="row">PMS 산출일</th>
            <td>{formatDate(riskResult?.pms_reg_date)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function ReviewNotePanel({ mbid, message, notes, onCreate }) {
  const [values, setValues] = useState({
    title: '',
    reviewer: 'local-admin',
    detail: '',
  });

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    onCreate(mbid, values);
    setValues((current) => ({
      ...current,
      title: '',
      detail: '',
    }));
  }

  return (
    <div className="reviewNotePanel">
      <form className="reviewNoteForm" onSubmit={submitForm}>
        <input name="title" type="text" placeholder="제목 입력" value={values.title} onChange={updateValue} required />
        <input name="reviewer" type="text" value={values.reviewer} onChange={updateValue} required />
        <input name="detail" type="text" placeholder="내용 입력" value={values.detail} onChange={updateValue} required />
        <button className="sBtn sColorLB" type="submit">
          추가
        </button>
      </form>
      {message ? <p className="detailMessage">{message}</p> : null}
      <table className="reviewNoteTable">
        <caption className="caption">안내 전화</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">안내</th>
            <th scope="col">담당자</th>
            <th scope="col">통화내역</th>
            <th scope="col">통화일시</th>
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 ? (
            <tr>
              <td colSpan="5">등록된 심사 메모가 없습니다.</td>
            </tr>
          ) : notes.map((note, index) => (
            <tr key={note.id}>
              <td>{index + 1}</td>
              <td>{note.title}</td>
              <td>{note.reviewer}</td>
              <td>{note.detail}</td>
              <td>{formatDate(note.reg_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentCheckForm({ document, mbid, onSave }) {
  const [values, setValues] = useState(() => toDocumentCheckFormValues(document));

  useEffect(() => {
    setValues(toDocumentCheckFormValues(document));
  }, [document]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSave(mbid, values);
  }

  return (
    <form className="documentCheckForm" onSubmit={submitForm}>
      <div className="documentCheckGrid">
        <label>
          현 CB 점수
          <input name="cbScoreCurrent" type="number" value={values.cbScoreCurrent} onChange={updateValue} />
        </label>
        <label>
          CB 등수
          <input name="cbScoreRank" type="number" value={values.cbScoreRank} onChange={updateValue} />
        </label>
        <label>
          6개월 CB 점수
          <input name="cbScorePast" type="number" value={values.cbScorePast} onChange={updateValue} />
        </label>
        <FlagSelect label="채무불이행" name="debtStatus" value={values.debtStatus} onChange={updateValue} />
        <FlagSelect label="금융질서문란" name="financialDisorderStatus" value={values.financialDisorderStatus} onChange={updateValue} />
        <FlagSelect label="공공정보" name="publicInformationStatus" value={values.publicInformationStatus} onChange={updateValue} />
        <FlagSelect label="연체정보" name="overdueStatus" value={values.overdueStatus} onChange={updateValue} />
        <FlagSelect label="국세 완납" name="nationalTaxFullPayment" value={values.nationalTaxFullPayment} onChange={updateValue} />
        <FlagSelect label="지방세 완납" name="localTaxFullPayment" value={values.localTaxFullPayment} onChange={updateValue} />
        <FlagSelect label="건강보험 완납" name="healthInsuranceFullPayment" value={values.healthInsuranceFullPayment} onChange={updateValue} />
        <label>
          건강보험 납부총액
          <input name="healthInsurancePaidAmount" type="number" value={values.healthInsurancePaidAmount} onChange={updateValue} />
        </label>
      </div>
      <div className="documentCheckActions">
        <button className="sBtn sColorLB" type="submit">
          확인값 저장
        </button>
      </div>
    </form>
  );
}

function FlagSelect({ label, name, value, onChange }) {
  return (
    <label>
      {label}
      <select name={name} value={value} onChange={onChange}>
        <option value="">미입력</option>
        <option value="1">Y</option>
        <option value="0">N</option>
      </select>
    </label>
  );
}

function toDocumentCheckFormValues(document) {
  return {
    cbScoreCurrent: valueOrEmpty(document?.cb_score_current),
    cbScoreRank: valueOrEmpty(document?.cb_score_rank),
    cbScorePast: valueOrEmpty(document?.cb_score_past),
    debtStatus: flagToFormValue(document?.debt_status),
    financialDisorderStatus: flagToFormValue(document?.financial_disorder_status),
    publicInformationStatus: flagToFormValue(document?.public_information_status),
    overdueStatus: flagToFormValue(document?.overdue_status),
    nationalTaxFullPayment: flagToFormValue(document?.national_tax_full_payment),
    localTaxFullPayment: flagToFormValue(document?.local_tax_full_payment),
    healthInsuranceFullPayment: flagToFormValue(document?.health_insurance_full_payment),
    healthInsurancePaidAmount: valueOrEmpty(document?.health_insurance_paid_amount),
  };
}

function DocumentFileManager({ mbid, files, fileMessage, isComplete, onConfirm, onUpload }) {
  const [documentType, setDocumentType] = useState('CBInfo');
  const [selectedFile, setSelectedFile] = useState(null);

  function submitUpload(event) {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }
    onUpload({ mbid, documentType, file: selectedFile });
    event.currentTarget.reset();
    setSelectedFile(null);
  }

  return (
    <div className="documentFiles">
      <form className="documentUpload" onSubmit={submitUpload}>
        <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} aria-label="제출서류 유형">
          <option value="CBInfo">CB 스코어</option>
          <option value="regNo">주민등록/사업자 확인</option>
          <option value="demand">입금계좌 확인</option>
          <option value="main">주계좌 확인</option>
        </select>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.hwp,.pdf"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
        <button className="sBtn sColorLB" type="submit" disabled={!selectedFile}>
          업로드
        </button>
      </form>
      {fileMessage ? <p className="detailMessage">{fileMessage}</p> : null}
      <div className="documentConfirm">
        <button className="big-blue-btn2" type="button" onClick={() => onConfirm(mbid)} disabled={isComplete || files.length === 0}>
          {isComplete ? '입력완료' : '입력완료'}
        </button>
      </div>
      <table className="documentFileTable">
        <caption className="caption">제출서류 파일</caption>
        <thead>
          <tr>
            <th scope="col">구분</th>
            <th scope="col">파일명</th>
            <th scope="col">크기</th>
            <th scope="col">등록일</th>
            <th scope="col">다운로드</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan="5">등록된 제출서류 파일이 없습니다.</td>
            </tr>
          ) : files.map((file) => (
            <tr key={file.uuid}>
              <td>{file.file_division}</td>
              <td>{file.origin_file_name}.{file.file_ext}</td>
              <td>{formatNumber(file.file_size)}</td>
              <td>{formatDate(file.input_date)}</td>
              <td>
                <a href={getContractDocumentDownloadUrl(mbid, file.uuid)}>다운로드</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
