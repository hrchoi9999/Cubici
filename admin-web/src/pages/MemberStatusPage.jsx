import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMemberStatusDetail } from '../api/management.js';
import { formatContractStatus } from '../utils/contractStatus.js';

function getUserNoFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('code') || params.get('user_no') || '';
}

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function bitLabel(value) {
  if (value === '1' || value === 'Y' || value === true) {
    return 'Y';
  }
  if (value === '0' || value === 'N' || value === false) {
    return 'N';
  }
  return value ?? '-';
}

function MemberStatusTableScroll({ children, label }) {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, max: 0 });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    function updateScrollState() {
      setScrollState({
        left: Math.round(container.scrollLeft),
        max: Math.max(0, Math.round(container.scrollWidth - container.clientWidth)),
      });
    }

    updateScrollState();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  function moveScroll(direction) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: container.scrollLeft + direction * Math.max(240, container.clientWidth * 0.65),
      behavior: 'smooth',
    });
  }

  return (
    <>
      <div className="tableScroll" ref={scrollRef}>{children}</div>
      {scrollState.max > 0 ? <div className="horizontalTableScrollbar" aria-label={`${label} 좌우 스크롤`}>
        <button type="button" aria-label={`${label} 왼쪽으로 스크롤`} onClick={() => moveScroll(-1)} disabled={scrollState.left <= 0}>&lt;</button>
        <input
          type="range"
          aria-label={`${label} 가로 스크롤`}
          min="0"
          max={scrollState.max}
          step="1"
          value={Math.min(scrollState.left, scrollState.max)}
          onChange={(event) => scrollRef.current?.scrollTo({ left: Number(event.target.value) })}
        />
        <button type="button" aria-label={`${label} 오른쪽으로 스크롤`} onClick={() => moveScroll(1)} disabled={scrollState.left >= scrollState.max}>&gt;</button>
      </div> : null}
    </>
  );
}

export function MemberStatusPage() {
  const userNo = getUserNoFromQuery();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!userNo) {
        setMessage('회원 번호가 없습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage('');
      try {
        const response = await fetchMemberStatusDetail(userNo);
        if (!ignore) {
          setData(response);
        }
      } catch (error) {
        if (!ignore) {
          setData(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [userNo]);

  const user = data?.user;
  const contracts = useMemo(() => data?.contracts ?? [], [data]);
  const fees = useMemo(() => data?.fees ?? [], [data]);
  const shops = useMemo(() => data?.shops ?? [], [data]);
  const redemptionHistory = useMemo(() => data?.redemption_history ?? [], [data]);

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active"><a href="javascript:;">회원 상세정보</a></li>
        </ul>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}
      {isLoading ? <div className="m-alert">조회 중입니다.</div> : null}

      {user ? (
        <>
          <section className="memberStatusPanel">
            <h4>회원 정보</h4>
            <div className="memberStatusGrid">
              <div><span>회원상태</span><strong>{user.status_label}</strong></div>
              <div><span>회원명</span><strong>{user.user_name ?? '-'}</strong></div>
              <div><span>회원ID</span><strong>{user.user_id ?? '-'}</strong></div>
              <div><span>핸드폰</span><strong>{user.phone ?? '-'}</strong></div>
              <div><span>회사명</span><strong>{user.firm_name ?? '-'}</strong></div>
              <div><span>사업자등록번호</span><strong>{user.business_no ?? '-'}</strong></div>
              <div><span>설립연도</span><strong>{user.biz_setup_date ?? '-'}</strong></div>
              <div><span>사업자 유형</span><strong>{user.biz_type ?? '-'}</strong></div>
              <div><span>업종</span><strong>{user.sectors ?? '-'}</strong></div>
              <div><span>최초가입</span><strong>{formatDate(user.reg_date)}</strong></div>
              <div><span>최근 로그인</span><strong>{formatDateTime(user.last_login_date)}</strong></div>
              <div><span>운영몰</span><strong>{formatNumber(user.shop_count)}개</strong></div>
              <div><span>우편번호</span><strong>{user.zip_code ?? '-'}</strong></div>
              <div className="wide"><span>회사주소</span><strong>{user.address ?? '-'}</strong></div>
            </div>
          </section>

          <div className="m-tab memberStatusTabs">
            <ul>
              <li className={activeTab === 'basic' ? 'active' : ''}><a href="#member-basic" onClick={(event) => { event.preventDefault(); setActiveTab('basic'); }}>기본정보</a></li>
              <li className={activeTab === 'payment' ? 'active' : ''}><a href="#member-payment" onClick={(event) => { event.preventDefault(); setActiveTab('payment'); }}>결제현황</a></li>
              <li className={activeTab === 'moneybank' ? 'active' : ''}><a href="#member-moneybank" onClick={(event) => { event.preventDefault(); setActiveTab('moneybank'); }}>머니뱅크</a></li>
              <li className={activeTab === 'documents' ? 'active' : ''}><a href="#member-documents" onClick={(event) => { event.preventDefault(); setActiveTab('documents'); }}>추가서류</a></li>
            </ul>
          </div>

          {activeTab === 'basic' ? (
            <section className="memberStatusPanel">
              <h4>운영 쇼핑몰</h4>
              <MemberStatusTableScroll label="운영 쇼핑몰 목록">
                <table className="m-table memberStatusTable">
                  <thead>
                    <tr>
                      <th>쇼핑몰</th>
                      <th>계정 ID</th>
                      <th>상태</th>
                      <th>정산</th>
                      <th>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop) => (
                      <tr key={shop.id}>
                        <td>{shop.shop_type ?? '-'}</td>
                        <td>{shop.shop_id ?? '-'}</td>
                        <td>{shop.status ?? '-'}</td>
                        <td>{shop.settlement ?? '-'}</td>
                        <td>{formatDateTime(shop.reg_date)}</td>
                      </tr>
                    ))}
                    {shops.length === 0 ? <tr><td colSpan="5">조회된 데이터가 없습니다.</td></tr> : null}
                  </tbody>
                </table>
              </MemberStatusTableScroll>
            </section>
          ) : null}

          {activeTab === 'payment' ? (
            <section className="memberStatusPanel">
              <h4>요금/수수료 정보</h4>
              <MemberStatusTableScroll label="요금 수수료 목록">
                <table className="m-table memberStatusTable">
                  <thead>
                    <tr>
                      <th>MBID</th>
                      <th>선정산 비율</th>
                      <th>평균 수수료율</th>
                      <th>주문한도</th>
                      <th>잔액한도</th>
                      <th>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={`${fee.mbid}-${fee.reg_date}`}>
                        <td>{fee.mbid}</td>
                        <td>{fee.payment_rate == null ? '-' : `${fee.payment_rate}%`}</td>
                        <td>{fee.average_fee_rate == null ? '-' : `${fee.average_fee_rate.toFixed(2)}%`}</td>
                        <td>{formatNumber(fee.sales_limit_per_order)}원</td>
                        <td>{formatNumber(fee.max_outstanding_balance)}원</td>
                        <td>{formatDateTime(fee.reg_date)}</td>
                      </tr>
                    ))}
                    {fees.length === 0 ? <tr><td colSpan="6">조회된 데이터가 없습니다.</td></tr> : null}
                  </tbody>
                </table>
              </MemberStatusTableScroll>
            </section>
          ) : null}

          {activeTab === 'moneybank' ? (
            <>
              <section className="memberStatusPanel">
                <h4>머니뱅크 계약/상환</h4>
                <MemberStatusTableScroll label="머니뱅크 계약 목록">
                  <table className="m-table memberStatusTable">
                    <thead>
                      <tr>
                        <th>MBID</th>
                        <th>상태</th>
                        <th>상품</th>
                        <th>신청일</th>
                        <th>계약일</th>
                        <th>만료일</th>
                        <th>매출액</th>
                        <th>누적 선정산</th>
                        <th>누적 상환</th>
                        <th>잔액</th>
                        <th>수수료율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.mbid}>
                          <td>{contract.mbid}</td>
                          <td>{formatContractStatus(contract.status)}</td>
                          <td>{contract.product_code ?? '-'}</td>
                          <td>{formatDate(contract.request_date)}</td>
                          <td>{formatDate(contract.contract_date)}</td>
                          <td>{formatDate(contract.expire_date)}</td>
                          <td>{formatNumber(contract.sales_amount)}원</td>
                          <td>{formatNumber(contract.cumulative_provision_amount)}원</td>
                          <td>{formatNumber(contract.cumulative_repayment_amount)}원</td>
                          <td>{formatNumber(contract.outstanding_balance)}원</td>
                          <td>{contract.fee_rate == null ? '-' : `${contract.fee_rate.toFixed(2)}%`}</td>
                        </tr>
                      ))}
                      {contracts.length === 0 ? <tr><td colSpan="11">조회된 데이터가 없습니다.</td></tr> : null}
                    </tbody>
                  </table>
                </MemberStatusTableScroll>
              </section>

              <section className="memberStatusPanel">
                <h4>최근 상환 이력</h4>
                <MemberStatusTableScroll label="최근 상환 이력 목록">
                  <table className="m-table memberStatusTable">
                    <thead>
                      <tr>
                        <th>MBID</th>
                        <th>누적 선정산</th>
                        <th>누적 상환</th>
                        <th>잔액</th>
                        <th>등록일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptionHistory.map((row) => (
                        <tr key={row.id}>
                          <td>{row.mbid}</td>
                          <td>{formatNumber(row.cumulative_provision_amount)}원</td>
                          <td>{formatNumber(row.cumulative_repayment_amount)}원</td>
                          <td>{formatNumber(row.outstanding_balance)}원</td>
                          <td>{formatDateTime(row.reg_date)}</td>
                        </tr>
                      ))}
                      {redemptionHistory.length === 0 ? <tr><td colSpan="5">조회된 데이터가 없습니다.</td></tr> : null}
                    </tbody>
                  </table>
                </MemberStatusTableScroll>
              </section>
            </>
          ) : null}

          {activeTab === 'documents' ? (
            <section className="memberStatusPanel">
              <h4>추가서류 확인</h4>
              <MemberStatusTableScroll label="추가서류 목록">
                <table className="m-table memberStatusTable">
                  <thead>
                    <tr>
                      <th>MBID</th>
                      <th>CB</th>
                      <th>국세</th>
                      <th>지방세</th>
                      <th>건강보험</th>
                      <th>인증서 만료일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.mbid}>
                        <td>{contract.mbid}</td>
                        <td>{bitLabel(contract.cb_check)}</td>
                        <td>{bitLabel(contract.national_tax_full_payment)}</td>
                        <td>{bitLabel(contract.local_tax_full_payment)}</td>
                        <td>{bitLabel(contract.health_insurance_full_payment)}</td>
                        <td>{formatDate(contract.certificate_expiration_date)}</td>
                      </tr>
                    ))}
                    {contracts.length === 0 ? <tr><td colSpan="6">조회된 데이터가 없습니다.</td></tr> : null}
                  </tbody>
                </table>
              </MemberStatusTableScroll>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}
