import { useEffect, useMemo, useState } from 'react';

import { createFundingProvider, fetchFundingSummary } from '../api/fintech.js';

const PAGE_SIZE = 10;
const emptyRegistration = { fintechName: '', repaymentPeriod: '30', interestRate: '' };

function formatDate(value) {
  return value ? value.slice(0, 10).replaceAll('-', '.') : '-';
}

function formatAmount(value) {
  return `${Number(value ?? 0).toLocaleString()} 원`;
}

function formatRate(value) {
  return value === null || value === undefined ? '-' : `${Number(value).toLocaleString()}%`;
}

export function FundingManagementPage() {
  const [payload, setPayload] = useState({ counts: { total_count: 0 }, items: [] });
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registration, setRegistration] = useState(emptyRegistration);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setMessage('');
    fetchFundingSummary({ limit: PAGE_SIZE, offset, order_by: 'registered_desc' })
      .then((result) => {
        if (!cancelled) setPayload(result);
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [offset]);

  const total = payload.counts?.total_count ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const rows = useMemo(() => payload.items ?? [], [payload.items]);

  function updateRegistration(event) {
    setRegistration((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleRegistration(event) {
    event.preventDefault();
    setIsRegistering(true);
    setMessage('');
    try {
      const result = await createFundingProvider({
        fintech_name: registration.fintechName.trim(),
        repayment_period: Number(registration.repaymentPeriod),
        interest_rate: Number(registration.interestRate),
      });
      const refreshed = await fetchFundingSummary({ limit: PAGE_SIZE, offset: 0, order_by: 'registered_desc' });
      setOffset(0);
      setPayload(refreshed);
      setSelected(result.provider);
      setRegistration(emptyRegistration);
      setIsRegisterOpen(false);
      setMessage(`${result.provider.fintech_name} 자금조달사가 기본등록되었습니다.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsRegistering(false);
    }
  }

  function calculationLabel(row) {
    if (row.calculation_status === 'LEGACY_SCOPE_MISMATCH') return '이력범위 확인';
    if (row.calculation_status === 'NO_FUNDING') return '조달내역 없음';
    return '검산일치';
  }

  return (
    <section className="fundingLvPage">
      <div className="fundingLvActions">
        <button className="sBtn sColorB" type="button" onClick={() => setIsRegisterOpen((current) => !current)}>자금조달등록</button>
      </div>

      {isRegisterOpen ? (
        <form className="fundingLvRegisterPanel" onSubmit={handleRegistration}>
          <div className="fundingLvRegisterTitle">
            <h4>자금조달사 기본등록</h4>
            <button type="button" onClick={() => setIsRegisterOpen(false)}>닫기</button>
          </div>
          <div className="fundingLvRegisterFields">
            <label htmlFor="fundingProviderName">자금조달사명<input id="fundingProviderName" name="fintechName" value={registration.fintechName} onChange={updateRegistration} maxLength="25" required /></label>
            <label htmlFor="fundingRepaymentPeriod">상환주기(일)<input id="fundingRepaymentPeriod" name="repaymentPeriod" type="number" min="1" max="3650" value={registration.repaymentPeriod} onChange={updateRegistration} required /></label>
            <label htmlFor="fundingInterestRate">수익률(%)<input id="fundingInterestRate" name="interestRate" type="number" min="0" max="99.99" step="0.01" value={registration.interestRate} onChange={updateRegistration} required /></label>
            <button className="sBtn sColorB fundingLvRegisterSubmit" type="submit" disabled={isRegistering}>{isRegistering ? '등록 중' : '등록'}</button>
          </div>
          <p>펌뱅킹 및 계좌 설정은 기본등록 후 별도 보안 절차로 진행합니다.</p>
        </form>
      ) : null}

      {message ? <p className="detailMessage" role="alert">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll fundingLvTable">
        <div className="overflowBox">
          <table className="m-shadowTable fundingTable">
            <caption className="caption">자금조달 관리 목록</caption>
            <thead>
              <tr>
                <th scope="col">No</th><th scope="col">자금조달사명</th><th scope="col">등록일자</th><th scope="col">상환주기</th><th scope="col">수익률</th><th scope="col">자금조달금</th><th scope="col">상환금</th><th scope="col">미상환금</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8">자금조달 목록을 조회 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="8">조회된 자금조달 데이터가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.fintech_id}>
                  <td>{row.row_no}</td>
                  <td><button className="fundingLvNameButton" type="button" onClick={() => setSelected(row)}>{row.fintech_name ?? '-'}</button></td>
                  <td>{formatDate(row.registered_date)}</td>
                  <td>{row.repayment_period ? `${row.repayment_period}일` : '-'}</td>
                  <td>{formatRate(row.interest_rate)}</td>
                  <td>{formatAmount(row.funding_amount)}</td>
                  <td>{formatAmount(row.repayment_amount)}</td>
                  <td>{formatAmount(row.outstanding_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="m-paging paging fundingLvPaging" id="pagingButton">
        <ul>
          <li><button className="oiBtn prev" type="button" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>이전</button></li>
          <li><button className="num active" type="button" disabled>{currentPage}</button></li>
          <li><button className="oiBtn next" type="button" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={offset + PAGE_SIZE >= total}>다음</button></li>
        </ul>
      </div>

      {selected ? (
        <section className="detailPanel fundingLvDetailPanel" aria-label="자금조달사 상세">
          <div className="fundingLvDetailHeader">
            <h4>{selected.fintech_name} 자금조달 현황</h4>
            <button type="button" onClick={() => setSelected(null)}>닫기</button>
          </div>
          <div className="detailTableScroll">
            <table><tbody>
              <tr><th>등록일자</th><td>{formatDate(selected.registered_date)}</td><th>신청건수</th><td>{selected.request_count.toLocaleString()}건</td></tr>
              <tr><th>자금조달금</th><td>{formatAmount(selected.funding_amount)}</td><th>미상환금</th><td>{formatAmount(selected.outstanding_amount)}</td></tr>
              <tr><th>요청 연결</th><td>{selected.linked_request_count.toLocaleString()} / {selected.request_count.toLocaleString()}건</td><th>산식 검산</th><td>{calculationLabel(selected)}</td></tr>
              {selected.repayment_excess_amount > 0 ? <tr><th>원본 상환 초과분</th><td colSpan="3">{formatAmount(selected.repayment_excess_amount)} · 요청별 상환 배분키가 없어 화면 상환금에서는 제외</td></tr> : null}
            </tbody></table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
