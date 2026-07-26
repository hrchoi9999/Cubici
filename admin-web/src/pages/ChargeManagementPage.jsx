import { useEffect, useMemo, useState } from 'react';
import {
  createCharge,
  deleteCharge,
  fetchCharge,
  fetchCharges,
  updateCharge,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  chargeCode: 'B0101',
  chargeName: '',
  chargeType: 'B',
  startDate: '',
  expireDate: '',
  subId: '',
  salesCount: '',
  productCount: '',
  amount: '',
  period: '1',
  periodUnit: 'M',
  chargeDetail: '',
};

const chargeTypeLabels = {
  B: '기본요금',
  A: '부가요금',
  M: '조건부요금',
  O: '기타요금',
  F: '무료요금',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function toInputDate(value) {
  return value ? value.slice(0, 10) : '';
}

function normalizeNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function suggestedChargeCode(formValues) {
  const period = String(formValues.period || '1').padStart(2, '0').slice(-2);
  return `${formValues.chargeType}${period}01`.slice(0, 5);
}

function mapChargeToForm(charge) {
  return {
    chargeCode: charge.charge_code ?? '',
    chargeName: charge.charge_name ?? '',
    chargeType: charge.charge_type ?? 'B',
    startDate: toInputDate(charge.start_date),
    expireDate: toInputDate(charge.expire_date),
    subId: charge.sub_id ?? '',
    salesCount: charge.sales_count ?? '',
    productCount: charge.product_count ?? '',
    amount: charge.amount ?? '',
    period: charge.period ?? '',
    periodUnit: charge.period_unit ?? 'M',
    chargeDetail: charge.charge_detail ?? '',
  };
}

export function ChargeManagementPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, operating_count: 0, ended_count: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', order_by: 'reg_date_desc' });
  const [formValues, setFormValues] = useState({ status: 'all', chargeCode: '', chargeName: '', orderBy: 'reg_date_desc' });
  const [selected, setSelected] = useState(null);
  const [chargeForm, setChargeForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchCharges({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, operating_count: 0, ended_count: 0 });
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
    const data = await fetchCharges({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateChargeValue(event) {
    const { name, value } = event.target;
    setChargeForm((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      status: formValues.status,
      charge_code: formValues.chargeCode,
      charge_name: formValues.chargeName,
      order_by: formValues.orderBy,
    });
  }

  function handleNew() {
    setSelected(null);
    setChargeForm({ ...emptyForm, chargeCode: suggestedChargeCode(emptyForm) });
    setMessage('');
  }

  async function loadDetail(chargeCode) {
    setMessage('');

    try {
      const data = await fetchCharge(chargeCode);
      setSelected(data);
      setChargeForm(mapChargeToForm(data));
    } catch (error) {
      setSelected(null);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!/^[A-Z0-9]{1,5}$/.test(chargeForm.chargeCode.trim())) {
      return '요금코드는 영문/숫자 5자 이내로 입력하세요.';
    }
    if (!chargeForm.chargeName.trim()) {
      return '요금제명을 입력하세요.';
    }
    if (!chargeForm.startDate || !chargeForm.expireDate) {
      return '시작일과 종료일을 입력하세요.';
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

    const payload = {
      charge_code: chargeForm.chargeCode.trim(),
      charge_name: chargeForm.chargeName.trim(),
      charge_type: chargeForm.chargeType,
      start_date: chargeForm.startDate,
      expire_date: chargeForm.expireDate,
      sub_id: normalizeNullableNumber(chargeForm.subId),
      sales_count: normalizeNullableText(chargeForm.salesCount),
      product_count: normalizeNullableText(chargeForm.productCount),
      amount: normalizeNullableNumber(chargeForm.amount),
      period: normalizeNullableNumber(chargeForm.period),
      period_unit: normalizeNullableText(chargeForm.periodUnit),
      charge_detail: normalizeNullableText(chargeForm.chargeDetail),
    };

    setIsSaving(true);
    setMessage('');

    try {
      const result = selected
        ? await updateCharge(selected.charge_code, payload)
        : await createCharge(payload);
      setSelected(result.charge);
      if (result.charge) {
        setChargeForm(mapChargeToForm(result.charge));
      }
      await reloadList();
      setMessage(result.action === 'created' ? '요금제를 등록했습니다.' : '요금제를 수정했습니다.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      await deleteCharge(selected.charge_code);
      setSelected(null);
      setChargeForm({ ...emptyForm, chargeCode: suggestedChargeCode(emptyForm) });
      await reloadList(0);
      setMessage('요금제를 삭제했습니다.');
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
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= counts.total_count ? value : next;
    });
  }

  return (
    <>
      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="chargeStatus">운영구분</label>
            <select id="chargeStatus" name="status" value={formValues.status} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="operating">운영</option>
              <option value="ended">종료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="chargeCode">요금코드</label>
            <input id="chargeCode" name="chargeCode" type="text" value={formValues.chargeCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeName">요금제명</label>
            <input id="chargeName" name="chargeName" type="text" value={formValues.chargeName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="chargeOrder">보기기준</label>
            <select id="chargeOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">최근 등록순</option>
              <option value="reg_date_asc">과거 등록순</option>
              <option value="amount_desc">금액 높은순</option>
              <option value="charge_name_asc">요금제명</option>
              <option value="charge_code_asc">요금코드</option>
            </select>
          </div>
        </div>
        <div className="line">
          <button type="submit" className="searchBtn">검색</button>
          <button type="button" className="grayBtn" onClick={handleNew}>요금제 추가</button>
        </div>
      </form>

      <div className="fixBottom">
        <div className="tableTotal chargeSummary">
          <span>전체 {formatNumber(counts.total_count)}건</span>
          <span>운영 {formatNumber(counts.operating_count)}건</span>
          <span>종료 {formatNumber(counts.ended_count)}건</span>
          <span>{currentPage} / {pageCount} page</span>
        </div>
      </div>

      {message ? <p className="formMessage">{message}</p> : null}

      <div className="legacyListTable table-scroll">
        <div className="overflowBox">
          <table className="chargeManagementTable">
            <caption>요금제 관리</caption>
            <thead>
              <tr>
                <th>No</th>
                <th>등록 일자</th>
                <th>요금코드</th>
                <th>요금제</th>
                <th>유형</th>
                <th>상태</th>
                <th>시작일</th>
                <th>종료일</th>
                <th>기준금액</th>
                <th>제공 ID</th>
                <th>거래 건수</th>
                <th>상품 수</th>
                <th>상세보기</th>
              </tr>
            </thead>
            <tbody id="fixTbody">
              {isLoading ? (
                <tr><td colSpan="13">요금제 정보를 불러오는 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="13">조회된 요금제가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.charge_code}>
                  <td>{row.row_no}</td>
                  <td>{formatDate(row.reg_date)}</td>
                  <td>{row.charge_code}</td>
                  <td className="subject">{row.charge_name}</td>
                  <td>{chargeTypeLabels[row.charge_type] ?? row.charge_type}</td>
                  <td>{row.status}</td>
                  <td>{formatDate(row.start_date)}</td>
                  <td>{formatDate(row.expire_date)}</td>
                  <td>{formatNumber(row.amount)}원</td>
                  <td>{formatNumber(row.sub_id)}</td>
                  <td>{row.sales_count ?? '-'}</td>
                  <td>{row.product_count ?? '-'}</td>
                  <td><button type="button" className="tableBtn" onClick={() => loadDetail(row.charge_code)}>보기</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button type="button" className="grayBtn" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button type="button" className="grayBtn" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
      </div>

      <form className="chargeEditorPanel" onSubmit={handleSave}>
        <div className="chargeEditorHeader">
          <h4>{selected ? '요금제 수정' : '요금제 등록'}</h4>
          <span>{selected ? `최종 수정 ${formatDateTime(selected.update_date)}` : '신규 요금제'}</span>
        </div>
        <div className="chargeEditorGrid">
          <label>
            <span>요금코드</span>
            <input name="chargeCode" value={chargeForm.chargeCode} onChange={updateChargeValue} readOnly={Boolean(selected)} />
          </label>
          <label>
            <span>요금제명</span>
            <input name="chargeName" value={chargeForm.chargeName} onChange={updateChargeValue} />
          </label>
          <label>
            <span>요금유형</span>
            <select name="chargeType" value={chargeForm.chargeType} onChange={updateChargeValue}>
              <option value="B">기본요금</option>
              <option value="A">부가요금</option>
              <option value="M">조건부요금</option>
              <option value="O">기타요금</option>
              <option value="F">무료요금</option>
            </select>
          </label>
          <label>
            <span>시작일</span>
            <input name="startDate" type="date" value={chargeForm.startDate} onChange={updateChargeValue} />
          </label>
          <label>
            <span>종료일</span>
            <input name="expireDate" type="date" value={chargeForm.expireDate} onChange={updateChargeValue} />
          </label>
          <label>
            <span>제공 ID 수</span>
            <input name="subId" type="number" value={chargeForm.subId} onChange={updateChargeValue} />
          </label>
          <label>
            <span>거래 건수</span>
            <input name="salesCount" value={chargeForm.salesCount} onChange={updateChargeValue} />
          </label>
          <label>
            <span>상품 수</span>
            <input name="productCount" value={chargeForm.productCount} onChange={updateChargeValue} />
          </label>
          <label>
            <span>기준금액</span>
            <input name="amount" type="number" value={chargeForm.amount} onChange={updateChargeValue} />
          </label>
          <label>
            <span>기간</span>
            <input name="period" type="number" value={chargeForm.period} onChange={updateChargeValue} />
          </label>
          <label>
            <span>기간단위</span>
            <select name="periodUnit" value={chargeForm.periodUnit} onChange={updateChargeValue}>
              <option value="M">개월</option>
              <option value="W">주</option>
            </select>
          </label>
          <label className="wide">
            <span>요금제 설명</span>
            <textarea name="chargeDetail" value={chargeForm.chargeDetail} onChange={updateChargeValue} />
          </label>
        </div>
        <div className="chargeEditorActions">
          <button type="submit" className="searchBtn" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
          <button type="button" className="grayBtn" onClick={handleNew} disabled={isSaving}>초기화</button>
          {selected ? <button type="button" className="grayBtn" onClick={handleDelete} disabled={isSaving}>삭제</button> : null}
        </div>
      </form>
    </>
  );
}
