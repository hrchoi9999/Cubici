import { useEffect, useMemo, useState } from 'react';
import {
  createFintechMockTransferRequest,
  fetchFintechStatus,
  fetchFintechTradeRequestDetail,
  fetchFintechTradeRequests,
} from '../api/fintech.js';

const PAGE_SIZE = 20;

function makeDefaultSeqNo() {
  return String(Date.now() % 1000000).padStart(6, '0');
}

const INITIAL_MOCK_FORM = {
  mbid: '',
  comp_code: '',
  bank_code: '039',
  seq_no: makeDefaultSeqNo(),
  amount: '',
  withdrawal_account_number: '',
  deposit_bank_code: '088',
  deposit_account_number: '',
  deposit_summary: '',
  withdrawal_summary: '',
};

function formatDateTime(dateValue, timeValue) {
  if (!dateValue && !timeValue) {
    return '-';
  }
  const date = dateValue && dateValue.length === 8
    ? `${dateValue.slice(0, 4)}-${dateValue.slice(4, 6)}-${dateValue.slice(6, 8)}`
    : dateValue ?? '';
  const time = timeValue && timeValue.length === 6
    ? `${timeValue.slice(0, 2)}:${timeValue.slice(2, 4)}:${timeValue.slice(4, 6)}`
    : timeValue ?? '';
  return `${date} ${time}`.trim();
}

function flagLabel(value) {
  return value || '-';
}

function flagClass(value) {
  if (value === 'Y') {
    return 'sColorLS';
  }
  if (value === 'N') {
    return 'sColorY';
  }
  return 'sColorR';
}

function policyClass(value) {
  if (value === '정상') {
    return 'sColorLS';
  }
  if (value === '재조회 필요') {
    return 'sColorY';
  }
  if (value === '실패·반려') {
    return 'sColorR';
  }
  return 'sColorLB';
}

function rowKey(row) {
  return `${row.req_date}-${row.bank_code}-${row.comp_code}-${row.seq_no}`;
}

function fieldMap(parsed) {
  return Object.fromEntries((parsed?.fields ?? []).map((field) => [field.name, field]));
}

function fieldValue(fields, name) {
  return fields[name]?.value ?? fields[name]?.int_value ?? '-';
}

export function FintechTradeRequestPage() {
  const [status, setStatus] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    send_flag: '',
    recv_flag: '',
    msg_code: '',
    result_policy: '',
    mbid: '',
  });
  const [formValues, setFormValues] = useState(filters);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [mockForm, setMockForm] = useState(INITIAL_MOCK_FORM);
  const [isMockSaving, setIsMockSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [detailMessage, setDetailMessage] = useState('');
  const [mockMessage, setMockMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      try {
        const data = await fetchFintechStatus();
        if (!ignore) {
          setStatus(data);
        }
      } catch {
        if (!ignore) {
          setStatus(null);
        }
      }
    }

    loadStatus();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchFintechTradeRequests({
          limit: PAGE_SIZE,
          offset,
          ...filters,
        });
        if (!ignore) {
          const nextItems = data.items ?? [];
          setItems(nextItems);
          setTotal(data.total ?? 0);
          setSelected((current) => {
            if (current && nextItems.some((item) => rowKey(item) === rowKey(current))) {
              return current;
            }
            return nextItems[0] ?? null;
          });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setSelected(null);
          setDetail(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!selected) {
        setDetail(null);
        return;
      }

      setIsDetailLoading(true);
      setDetailMessage('');
      try {
        const data = await fetchFintechTradeRequestDetail(selected, {
          include_raw: false,
          include_parsed: true,
        });
        if (!ignore) {
          setDetail(data);
        }
      } catch (error) {
        if (!ignore) {
          setDetail(null);
          setDetailMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [selected]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateMockValue(event) {
    const { name, value } = event.target;
    setMockForm((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setDetail(null);
    setFilters(formValues);
  }

  function resetSearch() {
    const next = { send_flag: '', recv_flag: '', msg_code: '', result_policy: '', mbid: '' };
    setFormValues(next);
    setFilters(next);
    setOffset(0);
    setSelected(null);
    setDetail(null);
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

  async function handleMockSubmit(event) {
    event.preventDefault();
    setIsMockSaving(true);
    setMockMessage('');

    const payload = {
      ...mockForm,
      mbid: mockForm.mbid || null,
      amount: Number(mockForm.amount),
      withdrawal_bank_code: mockForm.bank_code,
      withdrawal_account_number: mockForm.withdrawal_account_number || null,
      deposit_bank_code: mockForm.deposit_bank_code || null,
      deposit_account_number: mockForm.deposit_account_number || null,
      deposit_summary: mockForm.deposit_summary || null,
      withdrawal_summary: mockForm.withdrawal_summary || null,
    };

    try {
      const result = await createFintechMockTransferRequest(payload);
      setMockMessage(
        result.created
          ? `MOCK 송금요청 저장 완료: ${result.req_date} ${result.bank_code}/${result.comp_code}/${result.seq_no}`
          : `동일 전문이 이미 존재합니다: ${result.req_date} ${result.bank_code}/${result.comp_code}/${result.seq_no}`,
      );
      const nextFilters = {
        send_flag: 'N',
        recv_flag: 'N',
        msg_code: '0100100',
        result_policy: '재조회 필요',
        mbid: mockForm.mbid,
      };
      setFormValues(nextFilters);
      setFilters(nextFilters);
      setOffset(0);
      setSelected(null);
      setDetail(null);
      setMockForm((current) => ({ ...current, seq_no: makeDefaultSeqNo() }));
    } catch (error) {
      setMockMessage(error.message);
    } finally {
      setIsMockSaving(false);
    }
  }

  return (
    <section className="adminPage fintechTradePage">
      <div className="adminPageHeader">
        <div>
          <h2>펌뱅킹 전문</h2>
          <p>TRADE_REQUEST_BIN 요청/응답 전문을 조회하고 300 byte parser 결과를 확인합니다.</p>
        </div>
        <div className="summaryPills">
          <span>전체 {total.toLocaleString()}건</span>
          <span>실송금 {status?.live_transfer_enabled ? '활성' : '비활성'}</span>
          <span>{isLoading ? '조회 중' : `페이지 ${currentPage} / ${pageCount}`}</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a href="/admin/cubici/adminMonitor/error_report">Error Log</a>
        <a href="/admin/cubici/adminMonitor/server_monitor">서버 관리</a>
        <a className="active" href="/admin/cubici/adminMonitor/fintech_trade">펌뱅킹 전문</a>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="fintechMbid">MBID</label>
            <input id="fintechMbid" name="mbid" type="text" value={formValues.mbid} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="fintechMsgCode">전문코드</label>
            <select id="fintechMsgCode" name="msg_code" value={formValues.msg_code} onChange={updateSearchValue}>
              <option value="">전체</option>
              <option value="0100100">송금 요청</option>
              <option value="0110100">송금 응답</option>
              <option value="0600101">결과조회 요청</option>
              <option value="0610101">결과조회 응답</option>
              <option value="0600300">잔액조회 요청</option>
              <option value="0600400">계좌조회 요청</option>
              <option value="0200300">입금통지 요청</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="fintechSendFlag">전송</label>
            <select id="fintechSendFlag" name="send_flag" value={formValues.send_flag} onChange={updateSearchValue}>
              <option value="">전체</option>
              <option value="N">미전송</option>
              <option value="Y">전송</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="fintechRecvFlag">응답</label>
            <select id="fintechRecvFlag" name="recv_flag" value={formValues.recv_flag} onChange={updateSearchValue}>
              <option value="">전체</option>
              <option value="N">미수신</option>
              <option value="Y">정상</option>
              <option value="C">접속실패</option>
              <option value="T">Timeout</option>
              <option value="F">실패</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="fintechResultPolicy">결과정책</label>
            <select
              id="fintechResultPolicy"
              name="result_policy"
              value={formValues.result_policy}
              onChange={updateSearchValue}
            >
              <option value="">전체</option>
              <option value="정상">정상</option>
              <option value="재조회 필요">재조회 필요</option>
              <option value="실패·반려">실패·반려</option>
              <option value="관리자 확인">관리자 확인</option>
            </select>
          </div>
        </div>
        <div className="line fintechSearchActions">
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
          <button className="m-btn" type="button" onClick={resetSearch}>초기화</button>
        </div>
      </form>

      <form className="m-search searchArea fintechMockForm" onSubmit={handleMockSubmit}>
        <div className="fintechMockHeader">
          <h3>MOCK 송금요청 생성</h3>
          <span>외부 송금 비활성</span>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="mockMbid">MBID</label>
            <input id="mockMbid" name="mbid" type="text" maxLength="10" value={mockForm.mbid} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockCompCode">업체코드</label>
            <input id="mockCompCode" name="comp_code" type="text" maxLength="8" required value={mockForm.comp_code} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockBankCode">출금은행</label>
            <input id="mockBankCode" name="bank_code" type="text" maxLength="3" required value={mockForm.bank_code} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockSeqNo">전문번호</label>
            <input id="mockSeqNo" name="seq_no" type="text" maxLength="6" pattern="[0-9]{6}" required value={mockForm.seq_no} onChange={updateMockValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="mockAmount">금액</label>
            <input id="mockAmount" name="amount" type="number" min="0" required value={mockForm.amount} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockWithdrawalAccount">출금계좌</label>
            <input id="mockWithdrawalAccount" name="withdrawal_account_number" type="text" maxLength="30" value={mockForm.withdrawal_account_number} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockDepositBank">입금은행</label>
            <input id="mockDepositBank" name="deposit_bank_code" type="text" maxLength="3" value={mockForm.deposit_bank_code} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockDepositAccount">입금계좌</label>
            <input id="mockDepositAccount" name="deposit_account_number" type="text" maxLength="30" value={mockForm.deposit_account_number} onChange={updateMockValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="mockDepositSummary">입금적요</label>
            <input id="mockDepositSummary" name="deposit_summary" type="text" maxLength="20" value={mockForm.deposit_summary} onChange={updateMockValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="mockWithdrawalSummary">출금적요</label>
            <input id="mockWithdrawalSummary" name="withdrawal_summary" type="text" maxLength="20" value={mockForm.withdrawal_summary} onChange={updateMockValue} />
          </div>
          <button className="m-btn m-btnPrimary" type="submit" disabled={isMockSaving}>
            {isMockSaving ? '저장 중' : 'MOCK 저장'}
          </button>
          <button
            className="m-btn"
            type="button"
            onClick={() => setMockForm({ ...INITIAL_MOCK_FORM, seq_no: makeDefaultSeqNo() })}
            disabled={isMockSaving}
          >
            입력 초기화
          </button>
        </div>
        {mockMessage ? <div className="fintechMockMessage">{mockMessage}</div> : null}
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll">
        <table className="m-table fintechTradeTable">
          <thead>
            <tr>
              <th>요청일시</th>
              <th>MBID</th>
              <th>SVC</th>
              <th>은행</th>
              <th>업체코드</th>
              <th>전문번호</th>
              <th>전문코드</th>
              <th>전송</th>
              <th>응답</th>
              <th>길이</th>
              <th>결과정책</th>
              <th>처리상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={selected && rowKey(selected) === rowKey(row) ? 'active' : ''}
                onClick={() => setSelected(row)}
              >
                <td>{formatDateTime(row.req_date, row.req_time)}</td>
                <td>{row.mbid ?? '-'}</td>
                <td>{row.svc_type ?? '-'}</td>
                <td>{row.bank_code}</td>
                <td>{row.comp_code}</td>
                <td>{row.seq_no}</td>
                <td>{row.msg_code}</td>
                <td><span className={`sBtn ${flagClass(row.send_flag)} rBtn`}>{flagLabel(row.send_flag)}</span></td>
                <td><span className={`sBtn ${flagClass(row.recv_flag)} rBtn`}>{flagLabel(row.recv_flag)}</span></td>
                <td>{row.send_msg_length} / {row.recv_msg_length}</td>
                <td><span className={`sBtn ${policyClass(row.result_policy)} rBtn`}>{row.result_policy}</span></td>
                <td>{row.process_status ?? '-'}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="12">조회된 전문이 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="m-btn" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button className="m-btn" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
      </div>

      <TradeRequestDetailPanel detail={detail} message={detailMessage} isLoading={isDetailLoading} />
    </section>
  );
}

function TradeRequestDetailPanel({ detail, message, isLoading }) {
  if (!detail && !message && !isLoading) {
    return (
      <section className="detailPanel fintechParserPanel">
        <h3>전문 상세</h3>
        <p className="detailMessage">목록에서 전문을 선택해 주세요.</p>
      </section>
    );
  }

  const sendFields = fieldMap(detail?.parsed_send_msg);
  const recvFields = fieldMap(detail?.parsed_recv_msg);

  return (
    <section className="detailPanel fintechParserPanel">
      <h3>전문 상세</h3>
      {isLoading ? <p className="detailMessage">전문 상세를 조회 중입니다.</p> : null}
      {message ? <p className="detailMessage">{message}</p> : null}
      {detail ? (
        <>
          <div className="detailSection">
            <table className="detailInfoTable">
              <tbody>
                <tr>
                  <th>요청일시</th>
                  <td>{formatDateTime(detail.req_date, detail.req_time)}</td>
                  <th>전송/응답</th>
                  <td>{detail.send_flag} / {detail.recv_flag}</td>
                </tr>
                <tr>
                  <th>결과정책</th>
                  <td><span className={`sBtn ${policyClass(detail.result_policy)} rBtn`}>{detail.result_policy}</span></td>
                  <th>판정사유</th>
                  <td>{detail.result_reason ?? '-'}</td>
                </tr>
                <tr>
                  <th>은행/업체</th>
                  <td>{detail.bank_code} / {detail.comp_code}</td>
                  <th>전문번호</th>
                  <td>{detail.seq_no}</td>
                </tr>
                <tr>
                  <th>SEND</th>
                  <td>{detail.parsed_send_msg?.operation ?? '-'} ({detail.parsed_send_msg?.msg_code ?? '-'})</td>
                  <th>RECV</th>
                  <td>{detail.parsed_recv_msg?.operation ?? '-'} ({detail.parsed_recv_msg?.msg_code ?? '-'})</td>
                </tr>
                <tr>
                  <th>원문 노출</th>
                  <td colSpan="3">비노출. parser 결과만 표시합니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="fintechParserSummary">
            <div>
              <h4>SEND 요약</h4>
              <dl>
                <dt>업체코드</dt>
                <dd>{fieldValue(sendFields, '업체코드')}</dd>
                <dt>전문번호</dt>
                <dd>{fieldValue(sendFields, '전문번호')}</dd>
                <dt>금액</dt>
                <dd>{fieldValue(sendFields, '출금금액')}</dd>
                <dt>입금계좌</dt>
                <dd>{fieldValue(sendFields, '입금계좌번호')}</dd>
              </dl>
            </div>
            <div>
              <h4>RECV 요약</h4>
              <dl>
                <dt>응답코드</dt>
                <dd>{fieldValue(recvFields, '응답코드')}</dd>
                <dt>은행응답</dt>
                <dd>{fieldValue(recvFields, '은행응답코드')}</dd>
                <dt>처리결과</dt>
                <dd>{fieldValue(recvFields, '처리결과')}</dd>
                <dt>수수료</dt>
                <dd>{fieldValue(recvFields, '수수료')}</dd>
              </dl>
            </div>
          </div>

          <ParsedMessageTable title="SEND_MSG parser" parsed={detail.parsed_send_msg} />
          <ParsedMessageTable title="RECV_MSG parser" parsed={detail.parsed_recv_msg} />
        </>
      ) : null}
    </section>
  );
}

function ParsedMessageTable({ title, parsed }) {
  return (
    <div className="detailSection">
      <h3>{title}</h3>
      <div className="tableScroll">
        <table className="m-table fintechParserTable">
          <thead>
            <tr>
              <th>항목</th>
              <th>offset</th>
              <th>length</th>
              <th>type</th>
              <th>값</th>
            </tr>
          </thead>
          <tbody>
            {(parsed?.fields ?? []).map((field) => (
              <tr key={`${title}-${field.name}-${field.offset}`}>
                <td>{field.name}</td>
                <td>{field.offset}</td>
                <td>{field.length}</td>
                <td>{field.field_type}</td>
                <td className="subject">{field.value ?? field.int_value ?? '-'}</td>
              </tr>
            ))}
            {!parsed ? (
              <tr>
                <td colSpan="5">parser 결과가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
