import { useEffect, useMemo, useState } from 'react';
import {
  createPromotion,
  deletePromotion,
  fetchPromotion,
  fetchPromotionOptions,
  fetchPromotions,
  updatePromotion,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  promoCode: '',
  promoName: '',
  promoTarget: 'N',
  partnerDivision: 'CBCI',
  partnerCode: 'CBCI',
  chargeCodes: [],
  startDate: '',
  expireDate: '',
  subId: '',
  period: '',
  periodUnit: '',
  discountRate: '',
  discountAmount: '',
  promoDetail: '',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
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

function buildPromoCode(form) {
  const partner = form.partnerCode || 'CBCI';
  return `${form.promoTarget}${partner}`.slice(0, 255);
}

function mapPromotionToForm(promotion) {
  return {
    promoCode: promotion.promo_code ?? '',
    promoName: promotion.promo_name ?? '',
    promoTarget: promotion.promo_target ?? 'N',
    partnerDivision: promotion.partner_code === 'CBCI' ? 'CBCI' : String(promotion.partner_code ?? '').slice(0, 2),
    partnerCode: promotion.partner_code ?? 'CBCI',
    chargeCodes: promotion.charge_codes ?? [],
    startDate: promotion.start_date ?? '',
    expireDate: promotion.expire_date ?? '',
    subId: promotion.sub_id ?? '',
    period: promotion.period ?? '',
    periodUnit: promotion.period_unit ?? '',
    discountRate: promotion.discount_rate ?? '',
    discountAmount: promotion.discount_amount ?? '',
    promoDetail: promotion.promo_detail ?? '',
  };
}

export function PromotionManagementPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, operating_count: 0, ended_count: 0 });
  const [options, setOptions] = useState({ targets: [], partner_divisions: [], partners: [], charges: [] });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', order_by: 'start_date_desc' });
  const [formValues, setFormValues] = useState({ promoCode: '', status: 'all', partnerName: '', orderBy: 'start_date_desc' });
  const [selected, setSelected] = useState(null);
  const [promotionForm, setPromotionForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');

      try {
        const [listData, optionData] = await Promise.all([
          fetchPromotions({ limit: PAGE_SIZE, offset, ...filters }),
          fetchPromotionOptions({ partner_division: promotionForm.partnerDivision }),
        ]);
        if (!ignore) {
          setItems(listData.items ?? []);
          setCounts(listData.counts ?? {});
          setOptions(optionData);
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

  useEffect(() => {
    let ignore = false;

    async function loadOptions() {
      try {
        const optionData = await fetchPromotionOptions({ partner_division: promotionForm.partnerDivision });
        if (!ignore) {
          setOptions(optionData);
        }
      } catch {
        if (!ignore) {
          setOptions((current) => ({ ...current, partners: [] }));
        }
      }
    }

    loadOptions();

    return () => {
      ignore = true;
    };
  }, [promotionForm.partnerDivision]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  async function reloadList(nextOffset = offset) {
    const data = await fetchPromotions({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updatePromotionValue(event) {
    const { name, value, checked } = event.target;
    if (name === 'chargeCodes') {
      setPromotionForm((current) => ({
        ...current,
        chargeCodes: checked
          ? [...current.chargeCodes, value]
          : current.chargeCodes.filter((item) => item !== value),
      }));
      return;
    }

    setPromotionForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'promoTarget' || name === 'partnerCode') {
        next.promoCode = buildPromoCode(next);
      }
      if (name === 'partnerDivision') {
        next.partnerCode = value === 'CBCI' ? 'CBCI' : '';
        next.promoCode = buildPromoCode(next);
      }
      return next;
    });
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      promo_code: formValues.promoCode,
      status: formValues.status,
      partner_name: formValues.partnerName,
      order_by: formValues.orderBy,
    });
  }

  function handleNew() {
    const next = { ...emptyForm, promoCode: buildPromoCode(emptyForm) };
    setSelected(null);
    setPromotionForm(next);
    setMessage('');
  }

  async function loadDetail(promoCode) {
    setMessage('');
    try {
      const data = await fetchPromotion(promoCode);
      setSelected(data);
      setPromotionForm(mapPromotionToForm(data));
    } catch (error) {
      setSelected(null);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!promotionForm.promoName.trim()) {
      return '연계코드명을 입력하세요.';
    }
    if (!promotionForm.startDate || !promotionForm.expireDate) {
      return '시작일자와 종료일자를 입력하세요.';
    }
    if (promotionForm.startDate >= promotionForm.expireDate) {
      return '종료일자는 시작일자보다 이후여야 합니다.';
    }
    if (!promotionForm.promoTarget) {
      return '대상을 선택하세요.';
    }
    if (!promotionForm.partnerDivision) {
      return '구분을 선택하세요.';
    }
    if (promotionForm.partnerDivision !== 'CBCI' && !promotionForm.partnerCode) {
      return '협력사코드를 선택하세요.';
    }
    if (promotionForm.chargeCodes.length === 0) {
      return '연계요금제를 선택하세요.';
    }
    if (promotionForm.period && !promotionForm.periodUnit) {
      return '무료 기간 단위를 선택하세요.';
    }
    if (promotionForm.periodUnit && !promotionForm.period) {
      return '무료 기간을 입력하세요.';
    }
    if (promotionForm.discountRate && promotionForm.discountAmount) {
      return '% 할인과 금액 할인은 동시에 입력할 수 없습니다.';
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
      promo_code: promotionForm.promoCode || buildPromoCode(promotionForm),
      promo_name: promotionForm.promoName.trim(),
      promo_target: promotionForm.promoTarget,
      partner_code: promotionForm.partnerCode || 'CBCI',
      charge_codes: promotionForm.chargeCodes,
      start_date: promotionForm.startDate,
      expire_date: promotionForm.expireDate,
      sub_id: normalizeNullableNumber(promotionForm.subId),
      discount_rate: normalizeNullableNumber(promotionForm.discountRate),
      discount_amount: normalizeNullableNumber(promotionForm.discountAmount),
      period: normalizeNullableNumber(promotionForm.period),
      period_unit: normalizeNullableText(promotionForm.periodUnit),
      promo_detail: normalizeNullableText(promotionForm.promoDetail),
    };

    setIsSaving(true);
    setMessage('');

    try {
      const result = selected
        ? await updatePromotion(selected.promo_code, payload)
        : await createPromotion(payload);
      setSelected(result.promotion);
      if (result.promotion) {
        setPromotionForm(mapPromotionToForm(result.promotion));
      }
      await reloadList();
      setMessage(result.action === 'created' ? '연계코드를 등록했습니다.' : '연계코드를 수정했습니다.');
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
      await deletePromotion(selected.promo_code);
      setSelected(null);
      setPromotionForm({ ...emptyForm, promoCode: buildPromoCode(emptyForm) });
      await reloadList(0);
      setMessage('연계코드를 삭제했습니다.');
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
            <label htmlFor="promoCodeSearch">연계코드</label>
            <input id="promoCodeSearch" name="promoCode" type="text" value={formValues.promoCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="promoStatusSearch">운영상태</label>
            <select id="promoStatusSearch" name="status" value={formValues.status} onChange={updateSearchValue}>
              <option value="all">선택</option>
              <option value="Y">운영</option>
              <option value="N">종료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="promoPartnerSearch">협력사</label>
            <input id="promoPartnerSearch" name="partnerName" type="text" value={formValues.partnerName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="promoOrder">보기기준</label>
            <select id="promoOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="start_date_desc">최근순</option>
              <option value="start_date_asc">시작일 과거순</option>
              <option value="promo_code_asc">연계코드</option>
              <option value="promo_name_asc">연계이름</option>
            </select>
          </div>
        </div>
        <div className="line">
          <button type="submit" className="searchBtn">검색</button>
          <button type="button" className="grayBtn" onClick={handleNew}>연계코드 추가</button>
        </div>
      </form>

      <div className="fixBottom">
        <div className="tableTotal promotionSummary">
          <span>전체 : {formatNumber(counts.total_count)}개</span>
          <span>운영 : {formatNumber(counts.operating_count)}개</span>
          <span>종료 : {formatNumber(counts.ended_count)}개</span>
          <span>{currentPage} / {pageCount} page</span>
        </div>
      </div>

      {message ? <p className="formMessage">{message}</p> : null}

      <div className="legacyListTable table-scroll">
        <div className="overflowBox">
          <table className="promotionManagementTable">
            <caption>연계코드 관리</caption>
            <thead>
              <tr>
                <th>상태</th>
                <th>시작 일자</th>
                <th>협력사명</th>
                <th>연계이름</th>
                <th>연계코드</th>
                <th>주요대상</th>
                <th>연계요금제</th>
                <th>% 할인</th>
                <th>금액할인</th>
                <th>무료기간</th>
                <th>단위</th>
                <th>제공ID수</th>
                <th>상세 보기</th>
              </tr>
            </thead>
            <tbody id="fixTbody">
              {isLoading ? (
                <tr><td colSpan="13">연계코드 정보를 불러오는 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="13">조회된 결과가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.promo_code}>
                  <td>{row.status_label}</td>
                  <td>{formatDate(row.start_date)}</td>
                  <td>{row.partner_name}</td>
                  <td className="subject">{row.promo_name}</td>
                  <td>{row.promo_code}</td>
                  <td>{row.promo_target_label}</td>
                  <td className="subject">{row.charge_names.join(', ') || '-'}</td>
                  <td>{row.discount_rate ?? ''}</td>
                  <td>{row.discount_amount ? `${formatNumber(row.discount_amount)}원` : ''}</td>
                  <td>{row.period ?? ''}</td>
                  <td>{row.period_unit_label}</td>
                  <td>{row.sub_id_label}</td>
                  <td><button type="button" className="tableBtn" onClick={() => loadDetail(row.promo_code)}>상세보기</button></td>
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

      <form className="promotionEditorPanel" onSubmit={handleSave}>
        <div className="promotionEditorHeader">
          <h4>{selected ? '연계코드 상세' : '연계코드 등록'}</h4>
          <span>{selected ? selected.status_label : '신규 연계코드'}</span>
        </div>
        <div className="promotionEditorGrid">
          <label>
            <span>연계코드명</span>
            <input name="promoName" value={promotionForm.promoName} onChange={updatePromotionValue} />
          </label>
          <label>
            <span>연계코드</span>
            <input name="promoCode" value={promotionForm.promoCode} onChange={updatePromotionValue} readOnly={Boolean(selected)} />
          </label>
          <label>
            <span>시작일자</span>
            <input name="startDate" type="date" value={promotionForm.startDate} onChange={updatePromotionValue} />
          </label>
          <label>
            <span>종료일자</span>
            <input name="expireDate" type="date" value={promotionForm.expireDate} onChange={updatePromotionValue} />
          </label>
          <label>
            <span>대상</span>
            <select name="promoTarget" value={promotionForm.promoTarget} onChange={updatePromotionValue} disabled={Boolean(selected)}>
              {(options.targets ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>구분</span>
            <select name="partnerDivision" value={promotionForm.partnerDivision} onChange={updatePromotionValue} disabled={Boolean(selected)}>
              {(options.partner_divisions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>협력사코드</span>
            <select name="partnerCode" value={promotionForm.partnerCode} onChange={updatePromotionValue} disabled={Boolean(selected) || promotionForm.partnerDivision === 'CBCI'}>
              <option value="CBCI">자체</option>
              {(options.partners ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>제공 ID 수</span>
            <select name="subId" value={promotionForm.subId} onChange={updatePromotionValue}>
              <option value="">선택</option>
              <option value="99">무제한</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>{value} 개</option>)}
            </select>
          </label>
          <div className="promotionChargeBox">
            <span>연계요금제</span>
            <div>
              {(options.charges ?? []).map((option) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    name="chargeCodes"
                    value={option.value}
                    checked={promotionForm.chargeCodes.includes(option.value)}
                    onChange={updatePromotionValue}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <label>
            <span>무료 기간</span>
            <input name="period" type="number" value={promotionForm.period} onChange={updatePromotionValue} />
          </label>
          <label>
            <span>단위</span>
            <select name="periodUnit" value={promotionForm.periodUnit} onChange={updatePromotionValue}>
              <option value="">선택</option>
              <option value="M">개월</option>
              <option value="W">주</option>
            </select>
          </label>
          <label>
            <span>% 할인</span>
            <input name="discountRate" type="number" value={promotionForm.discountRate} onChange={updatePromotionValue} />
          </label>
          <label>
            <span>금액 할인</span>
            <input name="discountAmount" type="number" value={promotionForm.discountAmount} onChange={updatePromotionValue} />
          </label>
          <label className="wide">
            <span>기타혜택</span>
            <textarea name="promoDetail" value={promotionForm.promoDetail} onChange={updatePromotionValue} />
          </label>
        </div>
        <div className="promotionEditorActions">
          <button type="submit" className="searchBtn" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
          <button type="button" className="grayBtn" onClick={handleNew} disabled={isSaving}>초기화</button>
          {selected ? <button type="button" className="grayBtn" onClick={handleDelete} disabled={isSaving}>삭제</button> : null}
        </div>
      </form>
    </>
  );
}
