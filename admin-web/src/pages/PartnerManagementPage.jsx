import { useEffect, useMemo, useState } from 'react';
import {
  checkPartnerCode,
  checkPartnerId,
  createPartner,
  deletePartner,
  fetchPartner,
  fetchPartners,
  updatePartner,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  partnerId: '',
  partnerCode: '',
  partnerName: '',
  repName: '',
  partnerZip: '',
  partnerAddress: '',
  partnerStatus: '00',
  partnerType: 'BA',
  divisionCode: '',
  memo: '',
  supervisorName: '',
  supervisorRank: '',
  supervisorEmail: '',
  supervisorPhone: '',
  managerName: '',
  managerRank: '',
  managerEmail: '',
  managerPhone: '',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function formatPhone(value) {
  const raw = String(value ?? '').replace(/[^0-9]/g, '');
  if (raw.length === 11) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  }
  if (raw.length === 10) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  return value || '-';
}

function buildPartnerCode(form) {
  return `${form.partnerType}${form.divisionCode}`.slice(0, 5);
}

function managerValue(managers, type, key) {
  return managers.find((manager) => manager.manager_type === type)?.[key] ?? '';
}

function mapPartnerToForm(detail) {
  const { partner, managers } = detail;
  const divisionCode = String(partner.partner_code ?? '').slice(2);
  return {
    partnerId: partner.partner_id ?? '',
    partnerCode: partner.partner_code ?? '',
    partnerName: partner.partner_name ?? '',
    repName: partner.rep_name ?? '',
    partnerZip: partner.partner_zip ?? '',
    partnerAddress: partner.partner_address ?? '',
    partnerStatus: partner.partner_status ?? '00',
    partnerType: partner.partner_type ?? String(partner.partner_code ?? '').slice(0, 2) ?? 'BA',
    divisionCode,
    memo: partner.memo ?? '',
    supervisorName: managerValue(managers, '00', 'manager_name'),
    supervisorRank: managerValue(managers, '00', 'manager_rank'),
    supervisorEmail: managerValue(managers, '00', 'manager_email'),
    supervisorPhone: managerValue(managers, '00', 'manager_phone'),
    managerName: managerValue(managers, '01', 'manager_name'),
    managerRank: managerValue(managers, '01', 'manager_rank'),
    managerEmail: managerValue(managers, '01', 'manager_email'),
    managerPhone: managerValue(managers, '01', 'manager_phone'),
  };
}

function buildManagers(form) {
  return [
    {
      manager_type: '00',
      manager_name: normalizeNullableText(form.supervisorName),
      manager_rank: normalizeNullableText(form.supervisorRank),
      manager_email: normalizeNullableText(form.supervisorEmail),
      manager_phone: normalizeNullableText(form.supervisorPhone),
    },
    {
      manager_type: '01',
      manager_name: normalizeNullableText(form.managerName),
      manager_rank: normalizeNullableText(form.managerRank),
      manager_email: normalizeNullableText(form.managerEmail),
      manager_phone: normalizeNullableText(form.managerPhone),
    },
  ];
}

export function PartnerManagementPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    total_count: 0,
    operating_count: 0,
    ended_count: 0,
    type_ba_count: 0,
    type_bb_count: 0,
    type_co_count: 0,
    type_fi_count: 0,
    type_mn_count: 0,
    type_th_count: 0,
  });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ partner_status: 'all', order_by: 'reg_date_desc' });
  const [formValues, setFormValues] = useState({
    partnerName: '',
    partnerStatus: 'all',
    repName: '',
    partnerCode: '',
    orderBy: 'reg_date_desc',
  });
  const [selected, setSelected] = useState(null);
  const [partnerForm, setPartnerForm] = useState(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bizCheckMessage, setBizCheckMessage] = useState('');
  const [codeCheckMessage, setCodeCheckMessage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchPartners({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
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
    const data = await fetchPartners({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updatePartnerValue(event) {
    const { name, value } = event.target;
    setPartnerForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'partnerType' || name === 'divisionCode') {
        next.partnerCode = buildPartnerCode(next);
        setCodeCheckMessage('');
      }
      if (name === 'partnerId') {
        setBizCheckMessage('');
      }
      return next;
    });
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setIsEditorOpen(false);
    setFilters({
      partner_name: formValues.partnerName,
      partner_status: formValues.partnerStatus,
      rep_name: formValues.repName,
      partner_code: formValues.partnerCode,
      order_by: formValues.orderBy,
    });
  }

  function handleNew() {
    setSelected(null);
    setPartnerForm({ ...emptyForm, partnerCode: buildPartnerCode(emptyForm) });
    setBizCheckMessage('');
    setCodeCheckMessage('');
    setMessage('');
    setIsEditorOpen(true);
  }

  async function loadDetail(partnerId) {
    setMessage('');
    setBizCheckMessage('');
    setCodeCheckMessage('');
    try {
      const data = await fetchPartner(partnerId);
      setSelected(data);
      setPartnerForm(mapPartnerToForm(data));
      setIsEditorOpen(true);
    } catch (error) {
      setSelected(null);
      setIsEditorOpen(false);
      setMessage(error.message);
    }
  }

  async function handleBizCheck() {
    if (!partnerForm.partnerId.trim()) {
      setBizCheckMessage('사업자번호를 입력해주세요.');
      return;
    }
    try {
      const result = await checkPartnerId(partnerForm.partnerId.trim());
      setBizCheckMessage(result.exists ? '중복된 사업자번호입니다.' : '사용 가능한 사업자번호입니다.');
    } catch (error) {
      setBizCheckMessage(error.message);
    }
  }

  async function handleCodeCheck() {
    const partnerCode = partnerForm.partnerCode || buildPartnerCode(partnerForm);
    if (!partnerCode.trim()) {
      setCodeCheckMessage('구분코드를 입력해주세요.');
      return;
    }
    try {
      const result = await checkPartnerCode(partnerCode);
      setCodeCheckMessage(result.exists ? '중복된 코드입니다.' : '사용 가능한 코드입니다.');
    } catch (error) {
      setCodeCheckMessage(error.message);
    }
  }

  function validateForm() {
    if (!partnerForm.partnerName.trim()) {
      return '회사명을 입력하세요.';
    }
    if (!partnerForm.partnerId.trim()) {
      return '사업자번호를 입력하세요.';
    }
    if (!partnerForm.repName.trim()) {
      return '대표이사명을 입력하세요.';
    }
    if (!partnerForm.partnerZip.trim() || !partnerForm.partnerAddress.trim()) {
      return '주소를 입력하세요.';
    }
    if (!selected && !partnerForm.divisionCode.trim()) {
      return '구분코드를 입력하세요.';
    }
    if (partnerForm.supervisorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerForm.supervisorEmail)) {
      return '책임자 이메일 형식이 올바르지 않습니다.';
    }
    if (partnerForm.managerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerForm.managerEmail)) {
      return '담당자 이메일 형식이 올바르지 않습니다.';
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
      partner_id: partnerForm.partnerId.trim(),
      partner_code: partnerForm.partnerCode || buildPartnerCode(partnerForm),
      partner_name: partnerForm.partnerName.trim(),
      rep_name: partnerForm.repName.trim(),
      partner_zip: partnerForm.partnerZip.trim(),
      partner_address: partnerForm.partnerAddress.trim(),
      partner_status: partnerForm.partnerStatus,
      partner_type: partnerForm.partnerType,
      memo: normalizeNullableText(partnerForm.memo),
      managers: buildManagers(partnerForm),
    };

    setIsSaving(true);
    setMessage('');

    try {
      const result = selected
        ? await updatePartner(selected.partner.partner_id, payload)
        : await createPartner(payload);
      setSelected(result.partner);
      if (result.partner) {
        setPartnerForm(mapPartnerToForm(result.partner));
      }
      await reloadList();
      setMessage(result.action === 'created' ? '협력사를 등록했습니다.' : '협력사를 수정했습니다.');
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
      await deletePartner(selected.partner.partner_id);
      setSelected(null);
      setPartnerForm({ ...emptyForm, partnerCode: buildPartnerCode(emptyForm) });
      setIsEditorOpen(false);
      await reloadList(0);
      setMessage('협력사를 삭제했습니다.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="partnerNameSearch">회사명</label>
            <input id="partnerNameSearch" name="partnerName" value={formValues.partnerName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="partnerStatusSearch">운영상태</label>
            <select id="partnerStatusSearch" name="partnerStatus" value={formValues.partnerStatus} onChange={updateSearchValue}>
              <option value="all">선택</option>
              <option value="00">운영</option>
              <option value="01">종료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="repNameSearch">대표자</label>
            <input id="repNameSearch" name="repName" value={formValues.repName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="partnerCodeSearch">협력사코드</label>
            <input id="partnerCodeSearch" name="partnerCode" value={formValues.partnerCode} onChange={updateSearchValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="partnerOrder">보기기준</label>
            <select id="partnerOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">최근순</option>
              <option value="partner_name_asc">회사명</option>
              <option value="partner_code_asc">협력사코드</option>
              <option value="rep_name_asc">대표자</option>
            </select>
          </div>
          <button type="submit" className="searchBtn">검색</button>
          <button type="button" className="grayBtn" onClick={handleNew}>협력사 추가</button>
        </div>
      </form>

      <div className="fixBottom">
        <div className="tableTotal partnerSummary">
          <span>전체 {formatNumber(counts.total_count)}개</span>
          <span>BA {formatNumber(counts.type_ba_count)}개</span>
          <span>BB {formatNumber(counts.type_bb_count)}개</span>
          <span>CO {formatNumber(counts.type_co_count)}개</span>
          <span>FI {formatNumber(counts.type_fi_count)}개</span>
          <span>MN {formatNumber(counts.type_mn_count)}개</span>
          <span>TH {formatNumber(counts.type_th_count)}개</span>
          <span>담당미지정 {formatNumber(counts.missing_manager_count ?? 0)}개</span>
        </div>
      </div>

      {message ? <p className="formMessage">{message}</p> : null}

      <div className="legacyListTable table-scroll">
        <div className="overflowBox">
          <table className="partnerManagementTable">
            <caption>협력사 관리</caption>
            <thead>
              <tr>
                <th>상태</th>
                <th>등록 일자</th>
                <th>업종</th>
                <th>회사명</th>
                <th>협력사 코드</th>
                <th>대표이사</th>
                <th>사업자 번호</th>
                <th>담당자</th>
                <th>담당자 전화</th>
                <th>담당상태</th>
                <th>상세 보기</th>
              </tr>
            </thead>
            <tbody id="fixTbody">
              {isLoading ? (
                <tr><td colSpan="11">협력사 정보를 불러오는 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="11">조회된 결과가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.partner_id}>
                  <td>{row.partner_status_label}</td>
                  <td>{formatDate(row.reg_date)}</td>
                  <td>{row.partner_type_label}</td>
                  <td className="subject">{row.partner_name}</td>
                  <td>{row.partner_code}</td>
                  <td>{row.rep_name}</td>
                  <td>{row.partner_id}</td>
                  <td>{row.manager_name ?? '-'}</td>
                  <td>{formatPhone(row.manager_phone)}</td>
                  <td>{row.manager_status_label ?? '-'}</td>
                  <td><button type="button" className="tableBtn" onClick={() => loadDetail(row.partner_id)}>상세보기</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination pagingControls">
        <button type="button" className="grayBtn" onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button type="button" className="grayBtn" onClick={() => setOffset((value) => (value + PAGE_SIZE >= counts.total_count ? value : value + PAGE_SIZE))} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
      </div>

      {isEditorOpen ? <form className="partnerEditorPanel" onSubmit={handleSave}>
        <div className="partnerEditorHeader">
          <h4>{selected ? '협력사 상세' : '협력사 등록'}</h4>
          <span>{selected ? selected.partner.partner_status_label : '신규 협력사'}</span>
        </div>
        <div className="partnerEditorGrid">
          {selected ? (
            <label>
              <span>협력사코드</span>
              <input name="partnerCode" value={partnerForm.partnerCode} readOnly />
            </label>
          ) : null}
          <label>
            <span>회사명</span>
            <input name="partnerName" value={partnerForm.partnerName} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>사업자 번호</span>
            <input name="partnerId" value={partnerForm.partnerId} onChange={updatePartnerValue} readOnly={Boolean(selected)} />
          </label>
          {!selected ? <button type="button" className="grayBtn" onClick={handleBizCheck}>확인</button> : null}
          <label>
            <span>대표이사</span>
            <input name="repName" value={partnerForm.repName} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>주소 우편번호</span>
            <input name="partnerZip" value={partnerForm.partnerZip} onChange={updatePartnerValue} />
          </label>
          <label className="wide">
            <span>주소</span>
            <input name="partnerAddress" value={partnerForm.partnerAddress} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>운영상태</span>
            <select name="partnerStatus" value={partnerForm.partnerStatus} onChange={updatePartnerValue}>
              <option value="00">운영</option>
              <option value="01">종료</option>
            </select>
          </label>
          <label>
            <span>업종</span>
            <select name="partnerType" value={partnerForm.partnerType} onChange={updatePartnerValue} disabled={Boolean(selected)}>
              {['BA', 'BB', 'CO', 'FI', 'MN', 'TH'].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          {!selected ? (
            <>
              <label>
                <span>구분코드</span>
                <input name="divisionCode" value={partnerForm.divisionCode} onChange={updatePartnerValue} maxLength="2" />
              </label>
              <button type="button" className="grayBtn" onClick={handleCodeCheck}>중복확인</button>
            </>
          ) : null}
          <label>
            <span>책임자명</span>
            <input name="supervisorName" value={partnerForm.supervisorName} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>책임자 직급</span>
            <input name="supervisorRank" value={partnerForm.supervisorRank} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>책임자 이메일</span>
            <input name="supervisorEmail" value={partnerForm.supervisorEmail} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>책임자 전화</span>
            <input name="supervisorPhone" value={partnerForm.supervisorPhone} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>담당자명</span>
            <input name="managerName" value={partnerForm.managerName} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>담당자 직급</span>
            <input name="managerRank" value={partnerForm.managerRank} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>담당자 이메일</span>
            <input name="managerEmail" value={partnerForm.managerEmail} onChange={updatePartnerValue} />
          </label>
          <label>
            <span>담당자 전화</span>
            <input name="managerPhone" value={partnerForm.managerPhone} onChange={updatePartnerValue} />
          </label>
          <label className="wide">
            <span>상세정보</span>
            <textarea name="memo" value={partnerForm.memo} onChange={updatePartnerValue} />
          </label>
        </div>
        {bizCheckMessage ? <p className="formMessage">{bizCheckMessage}</p> : null}
        {codeCheckMessage ? <p className="formMessage">{codeCheckMessage}</p> : null}
        <div className="partnerEditorActions">
          <button type="submit" className="searchBtn" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
          <button type="button" className="grayBtn" onClick={handleNew} disabled={isSaving}>초기화</button>
          {selected ? <button type="button" className="grayBtn" onClick={handleDelete} disabled={isSaving}>삭제</button> : null}
        </div>
      </form> : null}
    </>
  );
}
