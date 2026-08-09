import { useEffect, useMemo, useState } from 'react';
import {
  fetchPrizmConfigItem,
  fetchPrizmConfigItems,
  fetchPrizmConfigUpdateRecords,
  updatePrizmConfigItem,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  itemDefinition: '',
  itemWeight: '',
  itemStandardLow1: '',
  itemStandardHigh1: '',
  itemStandardLow2: '',
  itemStandardHigh2: '',
  itemStandardLow3: '',
  itemStandardHigh3: '',
  itemStandardLow4: '',
  itemStandardHigh4: '',
  itemStandardLow5: '',
  itemStandardHigh5: '',
  updateMemo: '',
};

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function mapItemToForm(item) {
  return {
    itemDefinition: item.item_definition ?? '',
    itemWeight: item.item_weight ?? '',
    itemStandardLow1: item.item_standard_low1 ?? '',
    itemStandardHigh1: item.item_standard_high1 ?? '',
    itemStandardLow2: item.item_standard_low2 ?? '',
    itemStandardHigh2: item.item_standard_high2 ?? '',
    itemStandardLow3: item.item_standard_low3 ?? '',
    itemStandardHigh3: item.item_standard_high3 ?? '',
    itemStandardLow4: item.item_standard_low4 ?? '',
    itemStandardHigh4: item.item_standard_high4 ?? '',
    itemStandardLow5: item.item_standard_low5 ?? '',
    itemStandardHigh5: item.item_standard_high5 ?? '',
    updateMemo: '',
  };
}

function buildPayload(form) {
  return {
    item_definition: normalizeNullableText(form.itemDefinition),
    item_weight: normalizeNullableText(form.itemWeight),
    item_standard_low1: normalizeNullableText(form.itemStandardLow1),
    item_standard_high1: normalizeNullableText(form.itemStandardHigh1),
    item_standard_low2: normalizeNullableText(form.itemStandardLow2),
    item_standard_high2: normalizeNullableText(form.itemStandardHigh2),
    item_standard_low3: normalizeNullableText(form.itemStandardLow3),
    item_standard_high3: normalizeNullableText(form.itemStandardHigh3),
    item_standard_low4: normalizeNullableText(form.itemStandardLow4),
    item_standard_high4: normalizeNullableText(form.itemStandardHigh4),
    item_standard_low5: normalizeNullableText(form.itemStandardLow5),
    item_standard_high5: normalizeNullableText(form.itemStandardHigh5),
    admin_id: 'admin',
    update_memo: normalizeNullableText(form.updateMemo),
  };
}

function updateRecordLabel(record) {
  const itemName = record.item_name || `항목 ${record.item_no}`;
  return `${record.division === 1 ? 'Prizm' : 'CRA'} / 주제 ${record.subject_no} / ${itemName}`;
}

export function PrizmConfigPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, prizm_count: 0, cra_count: 0 });
  const [records, setRecords] = useState([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ division: 'all' });
  const [searchForm, setSearchForm] = useState({ division: 'all', subjectNo: '', itemName: '' });
  const [selected, setSelected] = useState(null);
  const [configForm, setConfigForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchPrizmConfigItems({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, prizm_count: 0, cra_count: 0 });
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

    async function loadRecords() {
      try {
        const data = await fetchPrizmConfigUpdateRecords({ limit: 5, offset: 0, division: filters.division });
        if (!ignore) {
          setRecords(data.items ?? []);
          setRecordTotal(data.total ?? 0);
        }
      } catch {
        if (!ignore) {
          setRecords([]);
          setRecordTotal(0);
        }
      }
    }

    loadRecords();

    return () => {
      ignore = true;
    };
  }, [filters.division]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  async function reloadList(nextOffset = offset) {
    const data = await fetchPrizmConfigItems({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
    const recordData = await fetchPrizmConfigUpdateRecords({ limit: 5, offset: 0, division: filters.division });
    setRecords(recordData.items ?? []);
    setRecordTotal(recordData.total ?? 0);
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setSearchForm((current) => ({ ...current, [name]: value }));
  }

  function updateConfigValue(event) {
    const { name, value } = event.target;
    setConfigForm((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      division: searchForm.division,
      subject_no: searchForm.subjectNo,
      item_name: searchForm.itemName,
    });
  }

  async function loadDetail(row) {
    setMessage('');
    try {
      const data = await fetchPrizmConfigItem(row.division, row.subject_no, row.item_no);
      setSelected(data);
      setConfigForm(mapItemToForm(data));
    } catch (error) {
      setSelected(null);
      setConfigForm(emptyForm);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!selected) {
      return '수정할 항목을 선택하세요.';
    }
    if (!configForm.itemDefinition.trim()) {
      return '지표정의를 입력하세요.';
    }
    if (!configForm.itemWeight.trim()) {
      return '가중치를 입력하세요.';
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
      const result = await updatePrizmConfigItem(
        selected.division,
        selected.subject_no,
        selected.item_no,
        buildPayload(configForm),
      );
      if (result.item) {
        setSelected(result.item);
        setConfigForm(mapItemToForm(result.item));
      }
      await reloadList();
      setMessage('Prism 설정을 수정했습니다.');
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
          <p>Prism/CRA 평가 항목과 기준값을 관리합니다.</p>
        </div>
        <div className="summaryPills">
          <span>전체 {formatNumber(counts.total_count ?? 0)}개</span>
          <span>Prizm {formatNumber(counts.prizm_count ?? 0)}개</span>
          <span>CRA {formatNumber(counts.cra_count ?? 0)}개</span>
          <span>미완성 {formatNumber(counts.incomplete_count ?? 0)}개</span>
          <span>변경이력 {formatNumber(recordTotal)}건</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a className="active" href="/admin/cubici/adminPreference/prizmConfig">Prizm</a>
        <a href="/admin/cubici/adminPreference/prizmRawData">RawData</a>
      </div>

      <form className="legacySearchBox" onSubmit={handleSearch}>
        <label>
          <span>구분</span>
          <select name="division" value={searchForm.division} onChange={updateSearchValue}>
            <option value="all">전체</option>
            <option value="1">Prizm</option>
            <option value="2">CRA</option>
          </select>
        </label>
        <label>
          <span>주제번호</span>
          <input name="subjectNo" type="number" min="1" value={searchForm.subjectNo} onChange={updateSearchValue} />
        </label>
        <label>
          <span>항목명</span>
          <input name="itemName" value={searchForm.itemName} onChange={updateSearchValue} />
        </label>
        <button type="submit" className="primaryButton">검색</button>
      </form>

      <div className="legacyTableWrap">
        <table className="legacyTable prizmConfigTable">
          <thead>
            <tr>
              <th>번호</th>
              <th>구분</th>
              <th>주제</th>
              <th>항목</th>
              <th>설정상태</th>
              <th>지표정의</th>
              <th>가중치</th>
              <th>1구간</th>
              <th>2구간</th>
              <th>3구간</th>
              <th>4구간</th>
              <th>5구간</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="13">Prism 설정을 조회 중입니다.</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="13">조회 결과가 없습니다.</td></tr>
            ) : rows.map((row) => (
              <tr key={`${row.division}-${row.subject_no}-${row.item_no}`}>
                <td>{row.row_no}</td>
                <td>{row.division_label}</td>
                <td>{row.subject_name}</td>
                <td>{row.item_nm || `항목 ${row.item_no}`}</td>
                <td>{row.config_status_label ?? '-'}</td>
                <td className="leftText">{row.item_definition || '-'}</td>
                <td>{row.item_weight || '-'}</td>
                <td>{row.item_standard_low1 || '-'} ~ {row.item_standard_high1 || '-'}</td>
                <td>{row.item_standard_low2 || '-'} ~ {row.item_standard_high2 || '-'}</td>
                <td>{row.item_standard_low3 || '-'} ~ {row.item_standard_high3 || '-'}</td>
                <td>{row.item_standard_low4 || '-'} ~ {row.item_standard_high4 || '-'}</td>
                <td>{row.item_standard_low5 || '-'} ~ {row.item_standard_high5 || '-'}</td>
                <td><button type="button" className="lineButton" onClick={() => loadDetail(row)}>선택</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="paginationBar pagingControls">
        <button type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button type="button" onClick={goToNextPage} disabled={currentPage >= pageCount}>다음</button>
      </div>

      {selected ? <form className="prizmConfigPanel" onSubmit={handleSave}>
        <div className="prizmConfigHeader">
          <div>
            <h4>{selected ? '평가항목 수정' : '평가항목 선택'}</h4>
            <span>{selected ? `${selected.division_label} · ${selected.subject_name} · ${selected.item_nm || `항목 ${selected.item_no}`}` : '목록에서 수정할 항목을 선택합니다.'}</span>
          </div>
        </div>

        <div className="prizmConfigGrid">
          <label className="wide">
            <span>지표정의</span>
            <input name="itemDefinition" value={configForm.itemDefinition} onChange={updateConfigValue} disabled={!selected} />
          </label>
          <label>
            <span>가중치</span>
            <input name="itemWeight" value={configForm.itemWeight} onChange={updateConfigValue} disabled={!selected} />
          </label>
          <label className="wide">
            <span>변경메모</span>
            <input name="updateMemo" value={configForm.updateMemo} onChange={updateConfigValue} disabled={!selected} />
          </label>
          {Array.from({ length: 5 }, (_, index) => {
            const number = index + 1;
            return (
              <div className="prizmStandardRow" key={number}>
                <strong>{number}구간</strong>
                <label>
                  <span>하한</span>
                  <input
                    name={`itemStandardLow${number}`}
                    value={configForm[`itemStandardLow${number}`]}
                    onChange={updateConfigValue}
                    disabled={!selected}
                  />
                </label>
                <label>
                  <span>상한</span>
                  <input
                    name={`itemStandardHigh${number}`}
                    value={configForm[`itemStandardHigh${number}`]}
                    onChange={updateConfigValue}
                    disabled={!selected}
                  />
                </label>
              </div>
            );
          })}
        </div>

        {message ? <p className="statusMessage">{message}</p> : null}
        <div className="prizmConfigActions">
          <button type="submit" className="primaryButton" disabled={!selected || isSaving}>수정</button>
        </div>
      </form> : null}

      <div className="prizmRecordPanel">
        <h4>최근 변경이력</h4>
        <table className="legacyTable prizmRecordTable">
          <thead>
            <tr>
              <th>일시</th>
              <th>항목</th>
              <th>관리자</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan="4">변경이력이 없습니다.</td></tr>
            ) : records.map((record) => (
              <tr key={record.record_id}>
                <td>{formatDateTime(record.reg_date)}</td>
                <td>{updateRecordLabel(record)}</td>
                <td>{record.admin_id || '-'}</td>
                <td className="leftText">{record.update_memo || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
