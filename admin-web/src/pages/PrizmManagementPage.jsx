import { useEffect, useMemo, useState } from 'react';
import { fetchRiskResults } from '../api/riskResults.js';

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

function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined) {
    return '-';
  }

  return Number(value).toLocaleString('ko-KR', {
    maximumFractionDigits: digits,
  });
}

function mapRiskResultToRow(item) {
  return {
    id: `${item.mbid ?? 'NO_MBID'}-${item.user_no ?? 'NO_USER'}`,
    mbid: item.mbid,
    userNo: item.user_no,
    pcsNo: item.pcs_no,
    prizmGrade: item.prizm_grade,
    prizmScore: item.prizm_score,
    pmsNo: item.pms_no,
    pmsGrade: item.pms_grade,
    pmsScore: item.pms_score,
    salesTotalScore: item.sales_total_score,
    manageTotalScore: item.manage_total_score,
    monthSalesValue: item.month_sales_value,
    monthSettlementAmount: item.month_settlement_amount,
    monthReturnRate: item.month_return_rate,
    cbScoreCurrent: item.cb_score_current,
    pcsRegDate: item.pcs_reg_date,
    pmsRegDate: item.pms_reg_date,
    source: item,
  };
}

export function PrizmManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({
    mbid: '',
    userNo: '',
    prizmGrade: '',
    pmsGrade: '',
    fromDate: '',
    toDate: '',
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let ignore = false;

    async function loadRiskResults() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchRiskResults({ limit: PAGE_SIZE, offset, ...filters });
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

    loadRiskResults();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items.map(mapRiskResultToRow), [items]);
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
    setSelected(null);
    setFilters({
      mbid: formValues.mbid,
      user_no: formValues.userNo,
      prizm_grade: formValues.prizmGrade,
      pms_grade: formValues.pmsGrade,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
    });
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">프리즘 지표 관리</a>
          </li>
        </ul>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="prizmMbid">MBID</label>
            <input id="prizmMbid" name="mbid" type="text" value={formValues.mbid} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="prizmUserNo">회원번호</label>
            <input id="prizmUserNo" name="userNo" type="number" min="1" value={formValues.userNo} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="prizmGrade">PCS 등급</label>
            <input id="prizmGrade" name="prizmGrade" type="text" value={formValues.prizmGrade} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="pmsGrade">PMS 등급</label>
            <input id="pmsGrade" name="pmsGrade" type="text" value={formValues.pmsGrade} onChange={updateFormValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="prizmFromDate">시작일</label>
            <input id="prizmFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="prizmToDate">종료일</label>
            <input id="prizmToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      {message ? <p className="detailMessage">{message}</p> : null}
      <div id="fixTable" className="fixTable legacyListTable table-scroll">
        <div className="overflowBox">
        <table className="m-shadowTable prizmTable">
          <caption className="caption">프리즘 지표 목록</caption>
          <thead>
            <tr>
              <th scope="col">MBID</th>
              <th scope="col">회원번호</th>
              <th scope="col">PCS No</th>
              <th scope="col">PCS 등급</th>
              <th scope="col">PCS 점수</th>
              <th scope="col">PMS No</th>
              <th scope="col">PMS 등급</th>
              <th scope="col">PMS 점수</th>
              <th scope="col">매출점수</th>
              <th scope="col">관리점수</th>
              <th scope="col">월매출액</th>
              <th scope="col">월정산액</th>
              <th scope="col">반품율</th>
              <th scope="col">CB점수</th>
              <th scope="col">PCS일자</th>
              <th scope="col">PMS일자</th>
              <th scope="col">상세</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="17">프리즘 지표를 조회 중입니다.</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="17">조회된 프리즘 지표가 없습니다.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.mbid ?? '-'}</td>
                <td>{row.userNo ?? '-'}</td>
                <td>{row.pcsNo ?? '-'}</td>
                <td>{row.prizmGrade ?? '-'}</td>
                <td>{formatDecimal(row.prizmScore)}</td>
                <td>{row.pmsNo ?? '-'}</td>
                <td>{row.pmsGrade ?? '-'}</td>
                <td>{formatDecimal(row.pmsScore)}</td>
                <td>{formatDecimal(row.salesTotalScore)}</td>
                <td>{formatDecimal(row.manageTotalScore)}</td>
                <td>{formatNumber(row.monthSalesValue)}</td>
                <td>{formatNumber(row.monthSettlementAmount)}</td>
                <td>{formatDecimal(row.monthReturnRate)}</td>
                <td>{formatNumber(row.cbScoreCurrent)}</td>
                <td>{formatDate(row.pcsRegDate)}</td>
                <td>{formatDate(row.pmsRegDate)}</td>
                <td>
                  <button className="sColorLB refund-btn" type="button" onClick={() => setSelected(row.source)}>
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
              <span className="txt">전체</span>
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
      <PrizmDetailPanel detail={selected} />
    </>
  );
}

function PrizmDetailPanel({ detail }) {
  if (!detail) {
    return null;
  }

  return (
    <section className="detailPanel">
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="javascript:;">프리즘 지표 상세</a>
          </li>
        </ul>
      </div>
      <div className="detailSection">
        <h3>PCS 평가 결과</h3>
        <table className="detailInfoTable">
          <caption className="caption">PCS 평가 결과</caption>
          <tbody>
            <tr>
              <th scope="row">MBID</th>
              <td>{detail.mbid ?? '-'}</td>
              <th scope="row">회원번호</th>
              <td>{detail.user_no ?? '-'}</td>
            </tr>
            <tr>
              <th scope="row">PCS No</th>
              <td>{detail.pcs_no ?? '-'}</td>
              <th scope="row">등급/점수</th>
              <td>{detail.prizm_grade ?? '-'} / {formatDecimal(detail.prizm_score)}</td>
            </tr>
            <tr>
              <th scope="row">사업기간</th>
              <td>{formatDecimal(detail.business_period)}</td>
              <th scope="row">운영기간</th>
              <td>{formatDecimal(detail.operating_period)}</td>
            </tr>
            <tr>
              <th scope="row">쇼핑몰수</th>
              <td>{formatNumber(detail.shop_count)}</td>
              <th scope="row">월매출수량</th>
              <td>{formatNumber(detail.month_sales_quantity)}</td>
            </tr>
            <tr>
              <th scope="row">월매출액</th>
              <td>{formatNumber(detail.month_sales_value)}</td>
              <th scope="row">월정산액</th>
              <td>{formatNumber(detail.month_settlement_amount)}</td>
            </tr>
            <tr>
              <th scope="row">정산기간</th>
              <td>{formatDecimal(detail.month_settlement_period)}</td>
              <th scope="row">정산/매출율</th>
              <td>{formatDecimal(detail.month_settlement_to_sales_rate)}</td>
            </tr>
            <tr>
              <th scope="row">프로모션율</th>
              <td>{formatDecimal(detail.month_promotion_rate)}</td>
              <th scope="row">배송기간</th>
              <td>{formatDecimal(detail.month_delivery_period)}</td>
            </tr>
            <tr>
              <th scope="row">반품율</th>
              <td>{formatDecimal(detail.month_return_rate)}</td>
              <th scope="row">평가일자</th>
              <td>{formatDate(detail.pcs_reg_date)}</td>
            </tr>
            <tr>
              <th scope="row">CB현재점수</th>
              <td>{formatNumber(detail.cb_score_current)}</td>
              <th scope="row">CB등급/변동율</th>
              <td>{formatNumber(detail.cb_score_rank)} / {formatDecimal(detail.cb_score_change_rate)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="detailSection">
        <h3>PMS 평가 결과</h3>
        <table className="detailInfoTable">
          <caption className="caption">PMS 평가 결과</caption>
          <tbody>
            <tr>
              <th scope="row">PMS No</th>
              <td>{detail.pms_no ?? '-'}</td>
              <th scope="row">등급/점수</th>
              <td>{detail.pms_grade ?? '-'} / {formatDecimal(detail.pms_score)}</td>
            </tr>
            <tr>
              <th scope="row">매출총점</th>
              <td>{formatDecimal(detail.sales_total_score)}</td>
              <th scope="row">관리총점</th>
              <td>{formatDecimal(detail.manage_total_score)}</td>
            </tr>
            <tr>
              <th scope="row">BSVC</th>
              <td>{formatDecimal(detail.bsvc)}</td>
              <th scope="row">BSQC</th>
              <td>{formatDecimal(detail.bsqc)}</td>
            </tr>
            <tr>
              <th scope="row">BAUPC</th>
              <td>{formatDecimal(detail.baupc)}</td>
              <th scope="row">BDSR</th>
              <td>{formatDecimal(detail.bdsr)}</td>
            </tr>
            <tr>
              <th scope="row">BPRC</th>
              <td>{formatDecimal(detail.bprc)}</td>
              <th scope="row">BRRC</th>
              <td>{formatDecimal(detail.brrc)}</td>
            </tr>
            <tr>
              <th scope="row">BSTSC</th>
              <td>{formatDecimal(detail.bstsc)}</td>
              <th scope="row">BDLTC</th>
              <td>{formatDecimal(detail.bdltc)}</td>
            </tr>
            <tr>
              <th scope="row">평가일자</th>
              <td>{formatDate(detail.pms_reg_date)}</td>
              <th scope="row">소스</th>
              <td>prizm_pms_result</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
