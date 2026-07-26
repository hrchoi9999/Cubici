import { useEffect, useMemo, useState } from 'react';
import { fetchManagementUsageDetail } from '../api/management.js';

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

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function yesNo(value) {
  if (value === '1' || value === 'Y' || value === true) {
    return 'Y';
  }
  if (value === '0' || value === 'N' || value === false) {
    return 'N';
  }
  return value ?? '-';
}

export function ManagementUsageDetailPage() {
  const mbid = useMemo(() => new URLSearchParams(window.location.search).get('mbid') ?? '', []);
  const [detail, setDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchManagementUsageDetail(mbid);
        if (!ignore) {
          setDetail(data);
        }
      } catch (error) {
        if (!ignore) {
          setDetail(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (mbid) {
      loadDetail();
    } else {
      setIsLoading(false);
      setMessage('MBID가 지정되지 않았습니다.');
    }

    return () => {
      ignore = true;
    };
  }, [mbid]);

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">회원 상세정보</a>
          </li>
        </ul>
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      {isLoading ? <p className="detailMessage">이용상세를 조회 중입니다.</p> : null}
      {detail ? (
        <>
          <MemberSummary detail={detail} />
          <div className="m-tab managementDetailTabs">
            <ul>
              <li className={activeTab === 'basic' ? 'active' : ''}>
                <button type="button" onClick={() => setActiveTab('basic')}>기본정보</button>
              </li>
              <li className={activeTab === 'moneybank' ? 'active' : ''}>
                <button type="button" onClick={() => setActiveTab('moneybank')}>머니뱅크</button>
              </li>
              <li className={activeTab === 'documents' ? 'active' : ''}>
                <button type="button" onClick={() => setActiveTab('documents')}>추가서류</button>
              </li>
              <li className={activeTab === 'history' ? 'active' : ''}>
                <button type="button" onClick={() => setActiveTab('history')}>상환이력</button>
              </li>
            </ul>
          </div>
          {activeTab === 'basic' ? <BasicInfoTab detail={detail} /> : null}
          {activeTab === 'moneybank' ? <MoneybankInfoTab detail={detail} /> : null}
          {activeTab === 'documents' ? <DocumentInfoTab detail={detail} /> : null}
          {activeTab === 'history' ? <RedemptionHistoryTab detail={detail} /> : null}
          <div className="c-boardSet">
            <div className="button-box">
              <a className="bBtn2 sColorN listBtn" href="/admin/moneybank/management/usageList">목록</a>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

function MemberSummary({ detail }) {
  const { user, usage } = detail;

  return (
    <section className="managementDetailSummary">
      <article className="m-modalGrid">
        <header>
          <h3>회원 정보</h3>
        </header>
        <table className="detailInfoTable">
          <caption className="caption">회원 정보</caption>
          <tbody>
            <tr>
              <th scope="row">회원상태</th>
              <td>{usage.usage_status}</td>
              <th scope="row">회원명</th>
              <td>{user.user_name ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">회원ID</th>
              <td>{user.user_email ?? '-'}</td>
              <th scope="row">핸드폰</th>
              <td>{user.phone ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">회사명</th>
              <td>{user.firm_name ?? '-'}</td>
              <th scope="row">사업자등록번호</th>
              <td>{user.biz_num ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">설립연도</th>
              <td>{user.biz_setup_date ?? '-'}</td>
              <th scope="row">최초가입</th>
              <td>{formatDate(user.user_reg_date)}</td>
            </tr>
            <tr>
              <th scope="row">사업자 유형</th>
              <td>{user.biz_type ?? '-'}</td>
              <th scope="row">업종</th>
              <td>{user.sectors ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">우편번호</th>
              <td>{user.zip_code ?? '-'}</td>
              <th scope="row">회사주소</th>
              <td>{user.address ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">이용서비스</th>
              <td>{usage.product_code ?? '-'}</td>
              <th scope="row">계약만료</th>
              <td>{formatDate(usage.expire_date)}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  );
}

function BasicInfoTab({ detail }) {
  return (
    <section className="detailPanel">
      <div className="detailSection">
        <h3>기본정보</h3>
        <table className="detailInfoTable">
          <caption className="caption">기본정보</caption>
          <tbody>
            <tr>
              <th scope="row">사용 쇼핑몰</th>
              <td>{detail.shops.length ? detail.shops.map((shop) => `${shop.shop_type ?? '-'}:${shop.shop_id ?? '-'}`).join(', ') : '-'}</td>
              <th scope="row">월 매출액</th>
              <td>{formatNumber(detail.usage.sales_amount)}</td>
            </tr>
            <tr>
              <th scope="row">주거래계좌</th>
              <td>관리자 계약 상세에서 확인</td>
              <th scope="row">정산계좌</th>
              <td>관리자 계약 상세에서 확인</td>
            </tr>
            <tr>
              <th scope="row">PCS 등급</th>
              <td>{detail.usage.prizm_grade ?? '-'}</td>
              <th scope="row">PCS 점수</th>
              <td>{detail.usage.prizm_score ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MoneybankInfoTab({ detail }) {
  const { usage } = detail;

  return (
    <section className="detailPanel">
      <div className="detailSection">
        <h3>머니뱅크 이용 현황</h3>
        <table className="detailInfoTable">
          <caption className="caption">머니뱅크 이용 현황</caption>
          <tbody>
            <tr>
              <th scope="row">머니뱅크 최초신청</th>
              <td>{formatDate(usage.request_date)}</td>
              <th scope="row">이용서비스</th>
              <td>{usage.product_code ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">MBID</th>
              <td>{detail.mbid}</td>
              <th scope="row">상태</th>
              <td>{usage.usage_status}</td>
            </tr>
            <tr>
              <th scope="row">신청일자</th>
              <td>{formatDate(usage.request_date)}</td>
              <th scope="row">계약일자</th>
              <td>{formatDate(usage.contract_date)}</td>
            </tr>
            <tr>
              <th scope="row">계약만료</th>
              <td>{formatDate(usage.expire_date)}</td>
              <th scope="row">수수료/지급율</th>
              <td>{formatPercent(usage.fee_rate)} / {usage.payment_rate ?? '-'}%</td>
            </tr>
            <tr>
              <th scope="row">선정산금액</th>
              <td>{formatNumber(usage.provision_amount)}</td>
              <th scope="row">누적상환</th>
              <td>{formatNumber(usage.repayment_amount)}</td>
            </tr>
            <tr>
              <th scope="row">상환잔액</th>
              <td>{formatNumber(usage.outstanding_balance)}</td>
              <th scope="row">Fintech</th>
              <td>{usage.fintech_name ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ContractHistoryTable items={detail.contract_history} />
    </section>
  );
}

function ContractHistoryTable({ items }) {
  return (
    <div className="detailSection">
      <h3>이전 이력</h3>
      <div className="table-scroll detailTableScroll">
        <table className="m-shadowTable managementUsageHistoryTable">
          <caption className="caption">서비스 계약 이력</caption>
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">계약 일자</th>
              <th scope="col">이용서비스</th>
              <th scope="col">이용총액</th>
              <th scope="col">계약완료</th>
              <th scope="col">서비스기간</th>
              <th scope="col">수수료</th>
              <th scope="col">PCS점수</th>
              <th scope="col">PMS점수</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="9">조회된 계약 이력이 없습니다.</td>
              </tr>
            ) : items.map((item, index) => (
              <tr key={item.mbid}>
                <td>{index + 1}</td>
                <td>{formatDate(item.contract_date)}</td>
                <td>{item.product_code ?? '-'}</td>
                <td>{formatNumber(item.provision_amount)}</td>
                <td>{formatDate(item.expire_date)}</td>
                <td>{item.service_days ?? '-'}</td>
                <td>{formatPercent(item.fee_rate)}</td>
                <td>{item.prizm_grade ?? '-'}</td>
                <td>{item.pms_grade ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentInfoTab({ detail }) {
  const document = detail.document;

  return (
    <section className="detailPanel">
      <div className="detailSection">
        <h3>사업자 증빙서류</h3>
        <table className="detailInfoTable">
          <caption className="caption">사업자 증빙서류</caption>
          <tbody>
            <tr>
              <th scope="row">사업자등록증</th>
              <td>{document?.business_no ? 'Y' : 'N'}</td>
              <th scope="row">CB 확인</th>
              <td>{yesNo(document?.cb_check)}</td>
            </tr>
            <tr>
              <th scope="row">국세완납증명</th>
              <td>{yesNo(document?.national_tax_full_payment)}</td>
              <th scope="row">지방세완납증명</th>
              <td>{yesNo(document?.local_tax_full_payment)}</td>
            </tr>
            <tr>
              <th scope="row">의료보험완납</th>
              <td>{yesNo(document?.health_insurance_full_payment)}</td>
              <th scope="row">의료보험 납부금액</th>
              <td>{formatNumber(document?.health_insurance_paid_amount)}</td>
            </tr>
            <tr>
              <th scope="row">첨부파일</th>
              <td>{formatNumber(document?.file_count ?? 0)} 건</td>
              <th scope="row">최종확인자</th>
              <td>{document?.final_confirm_admin ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ContractHistoryTable items={detail.contract_history} />
    </section>
  );
}

function RedemptionHistoryTab({ detail }) {
  return (
    <section className="detailPanel">
      <div className="detailSection">
        <h3>상환 이력</h3>
        <div className="table-scroll detailTableScroll">
          <table className="m-shadowTable managementUsageHistoryTable">
            <caption className="caption">상환 이력</caption>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">일자</th>
                <th scope="col">누적선정산</th>
                <th scope="col">누적상환</th>
                <th scope="col">상환잔액</th>
              </tr>
            </thead>
            <tbody>
              {detail.redemption_history.length === 0 ? (
                <tr>
                  <td colSpan="5">조회된 상환 이력이 없습니다.</td>
                </tr>
              ) : detail.redemption_history.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(item.reg_date)}</td>
                  <td>{formatNumber(item.cumulative_provision_amount)}</td>
                  <td>{formatNumber(item.cumulative_repayment_amount)}</td>
                  <td>{formatNumber(item.outstanding_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
