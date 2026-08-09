import { useEffect, useMemo, useState } from 'react';
import {
  createMoneybankProduct,
  fetchMoneybankProduct,
  fetchMoneybankProducts,
  updateMoneybankProduct,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  firmId: '',
  firmName: '',
  repName: '',
  firmZip: '',
  firmAddress: '',
  managerName: '',
  managerRank: '',
  managerPhone: '',
  developerName: '',
  developerRank: '',
  developerPhone: '',
  csName: '',
  csRank: '',
  csPhone: '',
  firmTel: '',
  firmFax: '',
  firmEmail: '',
  division: '',
  productName: '',
  productStatus: '00',
  minSalesAmount: '',
  minBusinessPeriod: '',
  minCalcAmount: '',
  creditRate: '',
  cubiciPeriod: '',
  amountLimit: '',
  otherConditions: '',
  serviceAmountStandard: '',
  serviceAmountMin: '',
  serviceAmountMax: '',
  serviceAmountUnit: '만원',
  executeAmountStandard: '',
  executeAmountMin: '',
  executeAmountMax: '',
  executeAmountUnit: '만원',
  serviceFeeStandard: '',
  serviceFeeMin: '',
  serviceFeeMax: '',
  annualFeeRate: '',
  interestStandard: '',
  interestMin: '',
  interestMax: '',
  limitChangeYn: 'N',
  serviceRepayPeriod: '',
  serviceRepayMin: '',
  serviceRepayMax: '',
  serviceRepayMethod: '',
  extensionYn: 'N',
  launchDate: '',
  expireDate: '',
  repaymentCount: '',
  repayAmount: '',
  midRepayYn: 'N',
  b2bFirmName: '',
  productType: '',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return Number(value).toLocaleString();
}

function formatRate(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return `${Number(value).toLocaleString()}%`;
}

function toInputDate(value) {
  return value ? value.slice(0, 10) : '';
}

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function normalizeNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

function mapProductToForm(product) {
  return {
    firmId: product.firm_id ?? '',
    firmName: product.firm_name ?? '',
    repName: product.rep_name ?? '',
    firmZip: product.firm_zip ?? '',
    firmAddress: product.firm_address ?? '',
    managerName: product.manager_name ?? '',
    managerRank: product.manager_rank ?? '',
    managerPhone: product.manager_phone ?? '',
    developerName: product.developer_name ?? '',
    developerRank: product.developer_rank ?? '',
    developerPhone: product.developer_phone ?? '',
    csName: product.cs_name ?? '',
    csRank: product.cs_rank ?? '',
    csPhone: product.cs_phone ?? '',
    firmTel: product.firm_tel ?? '',
    firmFax: product.firm_fax ?? '',
    firmEmail: product.firm_email ?? '',
    division: product.division ?? '',
    productName: product.product_name ?? '',
    productStatus: product.product_status ?? '00',
    minSalesAmount: product.min_sales_amount ?? '',
    minBusinessPeriod: product.min_business_period ?? '',
    minCalcAmount: product.min_calc_amount ?? '',
    creditRate: product.credit_rate ?? '',
    cubiciPeriod: product.cubici_period ?? '',
    amountLimit: product.amount_limit ?? '',
    otherConditions: product.other_conditions ?? '',
    serviceAmountStandard: product.service_amount_standard ?? '',
    serviceAmountMin: product.service_amount_min ?? '',
    serviceAmountMax: product.service_amount_max ?? '',
    serviceAmountUnit: product.service_amount_unit ?? '만원',
    executeAmountStandard: product.execute_amount_standard ?? '',
    executeAmountMin: product.execute_amount_min ?? '',
    executeAmountMax: product.execute_amount_max ?? '',
    executeAmountUnit: product.execute_amount_unit ?? '만원',
    serviceFeeStandard: product.service_fee_standard ?? '',
    serviceFeeMin: product.service_fee_min ?? '',
    serviceFeeMax: product.service_fee_max ?? '',
    annualFeeRate: product.annual_fee_rate ?? '',
    interestStandard: product.interest_standard ?? '',
    interestMin: product.interest_min ?? '',
    interestMax: product.interest_max ?? '',
    limitChangeYn: product.limit_change_yn ?? 'N',
    serviceRepayPeriod: product.service_repay_period ?? '',
    serviceRepayMin: product.service_repay_min ?? '',
    serviceRepayMax: product.service_repay_max ?? '',
    serviceRepayMethod: product.service_repay_method ?? '',
    extensionYn: product.extension_yn ?? 'N',
    launchDate: toInputDate(product.launch_date),
    expireDate: toInputDate(product.expire_date),
    repaymentCount: product.repayment_count ?? '',
    repayAmount: product.repay_amount ?? '',
    midRepayYn: product.mid_repay_yn ?? 'N',
    b2bFirmName: product.b2b_firm_name ?? '',
    productType: product.product_type ?? '',
  };
}

function buildPayload(form) {
  return {
    firm_id: form.firmId.trim(),
    firm_name: form.firmName.trim(),
    rep_name: form.repName.trim(),
    firm_zip: normalizeNullableText(form.firmZip),
    firm_address: form.firmAddress.trim(),
    manager_name: normalizeNullableText(form.managerName),
    manager_rank: normalizeNullableText(form.managerRank),
    manager_phone: normalizeNullableText(form.managerPhone),
    developer_name: normalizeNullableText(form.developerName),
    developer_rank: normalizeNullableText(form.developerRank),
    developer_phone: normalizeNullableText(form.developerPhone),
    cs_name: normalizeNullableText(form.csName),
    cs_rank: normalizeNullableText(form.csRank),
    cs_phone: normalizeNullableText(form.csPhone),
    firm_tel: normalizeNullableText(form.firmTel),
    firm_fax: normalizeNullableText(form.firmFax),
    firm_email: normalizeNullableText(form.firmEmail),
    division: normalizeNullableText(form.division),
    product_name: form.productName.trim(),
    product_status: form.productStatus,
    min_sales_amount: normalizeNullableNumber(form.minSalesAmount),
    min_business_period: normalizeNullableText(form.minBusinessPeriod),
    min_calc_amount: normalizeNullableNumber(form.minCalcAmount),
    credit_rate: normalizeNullableText(form.creditRate),
    cubici_period: normalizeNullableText(form.cubiciPeriod),
    amount_limit: normalizeNullableNumber(form.amountLimit),
    other_conditions: normalizeNullableText(form.otherConditions),
    service_amount_standard: normalizeNullableText(form.serviceAmountStandard),
    service_amount_min: normalizeNullableNumber(form.serviceAmountMin),
    service_amount_max: normalizeNullableNumber(form.serviceAmountMax),
    service_amount_unit: normalizeNullableText(form.serviceAmountUnit),
    execute_amount_standard: normalizeNullableText(form.executeAmountStandard),
    execute_amount_min: normalizeNullableNumber(form.executeAmountMin),
    execute_amount_max: normalizeNullableNumber(form.executeAmountMax),
    execute_amount_unit: normalizeNullableText(form.executeAmountUnit),
    service_fee_standard: normalizeNullableText(form.serviceFeeStandard),
    service_fee_min: normalizeNullableNumber(form.serviceFeeMin),
    service_fee_max: normalizeNullableNumber(form.serviceFeeMax),
    annual_fee_rate: normalizeNullableNumber(form.annualFeeRate),
    interest_standard: normalizeNullableText(form.interestStandard),
    interest_min: normalizeNullableNumber(form.interestMin),
    interest_max: normalizeNullableNumber(form.interestMax),
    limit_change_yn: normalizeNullableText(form.limitChangeYn),
    service_repay_period: normalizeNullableText(form.serviceRepayPeriod),
    service_repay_min: normalizeNullableNumber(form.serviceRepayMin),
    service_repay_max: normalizeNullableNumber(form.serviceRepayMax),
    service_repay_method: normalizeNullableText(form.serviceRepayMethod),
    extension_yn: normalizeNullableText(form.extensionYn),
    launch_date: normalizeNullableText(form.launchDate),
    expire_date: normalizeNullableText(form.expireDate),
    repayment_count: normalizeNullableNumber(form.repaymentCount),
    repay_amount: normalizeNullableNumber(form.repayAmount),
    mid_repay_yn: normalizeNullableText(form.midRepayYn),
    b2b_firm_name: normalizeNullableText(form.b2bFirmName),
    product_type: normalizeNullableText(form.productType),
  };
}

function Field({ label, name, value, onChange, type = 'text', children, wide = false }) {
  return (
    <label className={wide ? 'wide' : ''}>
      <span>{label}</span>
      {children ?? <input name={name} type={type} value={value} onChange={onChange} />}
    </label>
  );
}

export function MoneybankProductPreferencePage() {
  const isRegisterRoute = window.location.pathname.includes('manageMoneybank_tab2');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, operating_count: 0, completed_count: 0, stopped_count: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ product_status: 'all', order_by: 'reg_date_desc' });
  const [searchForm, setSearchForm] = useState({
    productStatus: 'all',
    firmName: '',
    productName: '',
    managerName: '',
    orderBy: 'reg_date_desc',
  });
  const [selected, setSelected] = useState(null);
  const [productForm, setProductForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMoneybankProducts({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, operating_count: 0, completed_count: 0, stopped_count: 0 });
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

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  async function reloadList(nextOffset = offset) {
    const data = await fetchMoneybankProducts({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setSearchForm((current) => ({ ...current, [name]: value }));
  }

  function updateProductValue(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      product_status: searchForm.productStatus,
      firm_name: searchForm.firmName,
      product_name: searchForm.productName,
      manager_name: searchForm.managerName,
      order_by: searchForm.orderBy,
    });
  }

  function handleNew() {
    setSelected(null);
    setProductForm({ ...emptyForm });
    setMessage('');
  }

  async function loadDetail(firmNo) {
    setMessage('');
    try {
      const data = await fetchMoneybankProduct(firmNo);
      setSelected(data);
      setProductForm(mapProductToForm(data));
    } catch (error) {
      setSelected(null);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!productForm.firmId.trim()) {
      return '사업자번호를 입력하세요.';
    }
    if (!productForm.firmName.trim()) {
      return '회사명을 입력하세요.';
    }
    if (!productForm.repName.trim()) {
      return '대표자명을 입력하세요.';
    }
    if (!productForm.firmAddress.trim()) {
      return '회사주소를 입력하세요.';
    }
    if (!productForm.productName.trim()) {
      return '상품명을 입력하세요.';
    }
    return '';
  }

  async function handleSave(event) {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const payload = buildPayload(productForm);
      const result = selected
        ? await updateMoneybankProduct(selected.firm_no, payload)
        : await createMoneybankProduct(payload);
      if (result.product) {
        setSelected(result.product);
        setProductForm(mapProductToForm(result.product));
      }
      await reloadList();
      setMessage(result.action === 'created' ? '머니뱅크 상품을 등록했습니다.' : '머니뱅크 상품을 수정했습니다.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => (currentPage >= pageCount ? value : value + PAGE_SIZE));
  }

  return (
    <section className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h2>환경설정</h2>
          <p>머니뱅크 상품 운영조건과 협력사 담당 정보를 관리합니다.</p>
        </div>
        <div className="summaryPills">
          <span>전체 {formatNumber(counts.total_count ?? 0)}개</span>
          <span>운영 {formatNumber(counts.operating_count ?? 0)}개</span>
          <span>완료 {formatNumber(counts.completed_count ?? 0)}개</span>
          <span>중지 {formatNumber(counts.stopped_count ?? 0)}개</span>
          <span>Master {counts.master_status_label ?? '-'}</span>
          <span>파트너 {formatNumber(counts.partner_count ?? 0)}개</span>
          <span>조건미완 {formatNumber(counts.incomplete_count ?? 0)}개</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a className={!isRegisterRoute ? 'active' : ''} href="/admin/cubici/adminPreference/manageMoneybank_tab1">상품 리스트</a>
        <a className={isRegisterRoute ? 'active' : ''} href="/admin/cubici/adminPreference/manageMoneybank_tab2">상품등록</a>
      </div>

      {!isRegisterRoute ? (
        <form className="legacySearchBox" onSubmit={handleSearch}>
          <label>
            <span>상태</span>
            <select name="productStatus" value={searchForm.productStatus} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="00">운영</option>
              <option value="01">완료</option>
              <option value="02">중지</option>
            </select>
          </label>
          <label>
            <span>회사명</span>
            <input name="firmName" value={searchForm.firmName} onChange={updateSearchValue} />
          </label>
          <label>
            <span>상품명</span>
            <input name="productName" value={searchForm.productName} onChange={updateSearchValue} />
          </label>
          <label>
            <span>담당자</span>
            <input name="managerName" value={searchForm.managerName} onChange={updateSearchValue} />
          </label>
          <label>
            <span>정렬</span>
            <select name="orderBy" value={searchForm.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">등록일 최신순</option>
              <option value="reg_date_asc">등록일 과거순</option>
              <option value="firm_name_asc">회사명순</option>
              <option value="product_name_asc">상품명순</option>
            </select>
          </label>
          <button type="submit" className="primaryButton">검색</button>
        </form>
      ) : null}

      {!isRegisterRoute ? (
        <div className="legacyTableWrap">
          <table className="legacyTable moneybankProductTable">
            <thead>
              <tr>
                <th>번호</th>
                <th>상태</th>
                <th>조건상태</th>
                <th>회사명</th>
                <th>상품명</th>
                <th>최소금액</th>
                <th>최대금액</th>
                <th>최소기간</th>
                <th>최대기간</th>
                <th>최소 수수료</th>
                <th>최대 수수료</th>
                <th>담당자</th>
                <th>전화</th>
                <th>상세보기</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="14">조회 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="14">조회 결과가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.firm_no}>
                  <td>{row.row_no}</td>
                  <td>{row.product_status_label}</td>
                  <td>{row.master_status_label ?? '-'}</td>
                  <td>{row.firm_name}</td>
                  <td>{row.product_name}</td>
                  <td>{formatNumber(row.service_amount_min)}</td>
                  <td>{formatNumber(row.service_amount_max)}</td>
                  <td>{row.service_repay_min ?? '-'}</td>
                  <td>{row.service_repay_max ?? '-'}</td>
                  <td>{formatRate(row.service_fee_min)}</td>
                  <td>{formatRate(row.service_fee_max)}</td>
                  <td>{row.manager_name || '-'}</td>
                  <td>{row.manager_phone || '-'}</td>
                  <td><button type="button" className="lineButton" onClick={() => loadDetail(row.firm_no)}>보기</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isRegisterRoute ? (
        <div className="paginationBar pagingControls">
          <button type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
          <span>{currentPage} / {pageCount}</span>
          <button type="button" onClick={goToNextPage} disabled={currentPage >= pageCount}>다음</button>
        </div>
      ) : null}

      {isRegisterRoute || selected ? <form className="moneybankProductPanel" onSubmit={handleSave}>
        <div className="moneybankProductHeader">
          <div>
            <h4>{selected ? '상품 상세' : '상품등록'}</h4>
            <span>{selected ? `FIRM_NO ${selected.firm_no} · 등록 ${formatDateTime(selected.reg_date)}` : '신규 머니뱅크 상품 조건을 입력합니다.'}</span>
          </div>
          <button type="button" className="lineButton" onClick={handleNew}>신규입력</button>
        </div>

        <div className="moneybankProductSection">
          <h5>기본정보</h5>
          <div className="moneybankProductGrid">
            <Field label="상품명" name="productName" value={productForm.productName} onChange={updateProductValue} />
            <Field label="상태" name="productStatus" value={productForm.productStatus} onChange={updateProductValue}>
              <select name="productStatus" value={productForm.productStatus} onChange={updateProductValue}>
                <option value="00">운영</option>
                <option value="01">완료</option>
                <option value="02">중지</option>
              </select>
            </Field>
            <Field label="사업자번호" name="firmId" value={productForm.firmId} onChange={updateProductValue} />
            <Field label="회사명" name="firmName" value={productForm.firmName} onChange={updateProductValue} />
            <Field label="대표자" name="repName" value={productForm.repName} onChange={updateProductValue} />
            <Field label="우편번호" name="firmZip" value={productForm.firmZip} onChange={updateProductValue} />
            <Field label="런칭일" name="launchDate" value={productForm.launchDate} onChange={updateProductValue} type="date" />
            <Field label="만료일" name="expireDate" value={productForm.expireDate} onChange={updateProductValue} type="date" />
            <Field label="B2B 업체" name="b2bFirmName" value={productForm.b2bFirmName} onChange={updateProductValue} />
            <Field label="상품유형" name="productType" value={productForm.productType} onChange={updateProductValue} />
            <Field label="회사주소" name="firmAddress" value={productForm.firmAddress} onChange={updateProductValue} wide />
          </div>
        </div>

        <div className="moneybankProductSection">
          <h5>담당자</h5>
          <div className="moneybankProductGrid">
            <Field label="담당자" name="managerName" value={productForm.managerName} onChange={updateProductValue} />
            <Field label="직급" name="managerRank" value={productForm.managerRank} onChange={updateProductValue} />
            <Field label="전화" name="managerPhone" value={productForm.managerPhone} onChange={updateProductValue} />
            <Field label="대표전화" name="firmTel" value={productForm.firmTel} onChange={updateProductValue} />
            <Field label="개발담당" name="developerName" value={productForm.developerName} onChange={updateProductValue} />
            <Field label="직급" name="developerRank" value={productForm.developerRank} onChange={updateProductValue} />
            <Field label="전화" name="developerPhone" value={productForm.developerPhone} onChange={updateProductValue} />
            <Field label="팩스" name="firmFax" value={productForm.firmFax} onChange={updateProductValue} />
            <Field label="CS담당" name="csName" value={productForm.csName} onChange={updateProductValue} />
            <Field label="직급" name="csRank" value={productForm.csRank} onChange={updateProductValue} />
            <Field label="전화" name="csPhone" value={productForm.csPhone} onChange={updateProductValue} />
            <Field label="이메일" name="firmEmail" value={productForm.firmEmail} onChange={updateProductValue} />
          </div>
        </div>

        <div className="moneybankProductSection">
          <h5>신청조건</h5>
          <div className="moneybankProductGrid">
            <Field label="최소매출" name="minSalesAmount" value={productForm.minSalesAmount} onChange={updateProductValue} type="number" />
            <Field label="사업기간" name="minBusinessPeriod" value={productForm.minBusinessPeriod} onChange={updateProductValue} />
            <Field label="신용등급" name="creditRate" value={productForm.creditRate} onChange={updateProductValue} />
            <Field label="최소정산" name="minCalcAmount" value={productForm.minCalcAmount} onChange={updateProductValue} type="number" />
            <Field label="이용기간" name="cubiciPeriod" value={productForm.cubiciPeriod} onChange={updateProductValue} />
            <Field label="한도" name="amountLimit" value={productForm.amountLimit} onChange={updateProductValue} type="number" />
            <Field label="기타조건" name="otherConditions" value={productForm.otherConditions} onChange={updateProductValue} wide>
              <textarea name="otherConditions" value={productForm.otherConditions} onChange={updateProductValue} />
            </Field>
          </div>
        </div>

        <div className="moneybankProductSection">
          <h5>운영조건</h5>
          <div className="moneybankProductGrid">
            <Field label="서비스금액 기준" name="serviceAmountStandard" value={productForm.serviceAmountStandard} onChange={updateProductValue} />
            <Field label="서비스 최소" name="serviceAmountMin" value={productForm.serviceAmountMin} onChange={updateProductValue} type="number" />
            <Field label="서비스 최대" name="serviceAmountMax" value={productForm.serviceAmountMax} onChange={updateProductValue} type="number" />
            <Field label="서비스 단위" name="serviceAmountUnit" value={productForm.serviceAmountUnit} onChange={updateProductValue} />
            <Field label="실행금액 기준" name="executeAmountStandard" value={productForm.executeAmountStandard} onChange={updateProductValue} />
            <Field label="실행 최소" name="executeAmountMin" value={productForm.executeAmountMin} onChange={updateProductValue} type="number" />
            <Field label="실행 최대" name="executeAmountMax" value={productForm.executeAmountMax} onChange={updateProductValue} type="number" />
            <Field label="실행 단위" name="executeAmountUnit" value={productForm.executeAmountUnit} onChange={updateProductValue} />
            <Field label="수수료 기준" name="serviceFeeStandard" value={productForm.serviceFeeStandard} onChange={updateProductValue} />
            <Field label="최소 수수료" name="serviceFeeMin" value={productForm.serviceFeeMin} onChange={updateProductValue} type="number" />
            <Field label="최대 수수료" name="serviceFeeMax" value={productForm.serviceFeeMax} onChange={updateProductValue} type="number" />
            <Field label="연 수수료" name="annualFeeRate" value={productForm.annualFeeRate} onChange={updateProductValue} type="number" />
            <Field label="이자 기준" name="interestStandard" value={productForm.interestStandard} onChange={updateProductValue} />
            <Field label="최소 이자" name="interestMin" value={productForm.interestMin} onChange={updateProductValue} type="number" />
            <Field label="최대 이자" name="interestMax" value={productForm.interestMax} onChange={updateProductValue} type="number" />
            <Field label="한도변경" name="limitChangeYn" value={productForm.limitChangeYn} onChange={updateProductValue}>
              <select name="limitChangeYn" value={productForm.limitChangeYn} onChange={updateProductValue}>
                <option value="Y">가능</option>
                <option value="N">불가</option>
              </select>
            </Field>
            <Field label="상환기간" name="serviceRepayPeriod" value={productForm.serviceRepayPeriod} onChange={updateProductValue} />
            <Field label="상환 최소" name="serviceRepayMin" value={productForm.serviceRepayMin} onChange={updateProductValue} type="number" />
            <Field label="상환 최대" name="serviceRepayMax" value={productForm.serviceRepayMax} onChange={updateProductValue} type="number" />
            <Field label="상환방법" name="serviceRepayMethod" value={productForm.serviceRepayMethod} onChange={updateProductValue} />
            <Field label="연장가능" name="extensionYn" value={productForm.extensionYn} onChange={updateProductValue}>
              <select name="extensionYn" value={productForm.extensionYn} onChange={updateProductValue}>
                <option value="Y">가능</option>
                <option value="N">불가</option>
              </select>
            </Field>
            <Field label="상환횟수" name="repaymentCount" value={productForm.repaymentCount} onChange={updateProductValue} type="number" />
            <Field label="상환금액" name="repayAmount" value={productForm.repayAmount} onChange={updateProductValue} type="number" />
            <Field label="중도상환" name="midRepayYn" value={productForm.midRepayYn} onChange={updateProductValue}>
              <select name="midRepayYn" value={productForm.midRepayYn} onChange={updateProductValue}>
                <option value="Y">가능</option>
                <option value="N">불가</option>
              </select>
            </Field>
          </div>
        </div>

        {message ? <p className="statusMessage">{message}</p> : null}
        <div className="moneybankProductActions">
          <button type="submit" className="primaryButton" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
        </div>
      </form> : null}
    </section>
  );
}
