import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchPrizmConfigItem,
  fetchPrizmConfigItems,
  fetchPrizmConfigUpdateRecords,
  updatePrizmConfigItem,
} from '../api/preferences.js';

const PAGE_SIZE = 100;

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

function sumWeights(items) {
  return items.reduce((sum, item) => sum + (Number.parseFloat(item.item_weight) || 0), 0);
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
  const [selectedSubjectNo, setSelectedSubjectNo] = useState(null);
  const listScrollRef = useRef(null);
  const [listScroll, setListScroll] = useState({ left: 0, max: 0 });

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
  const activeDivision = searchForm.division === '2' ? 2 : 1;
  const activeRows = useMemo(
    () => rows.filter((item) => item.division === activeDivision),
    [rows, activeDivision],
  );
  const dimensionGroups = useMemo(() => {
    const groups = new Map();
    activeRows.forEach((item) => {
      if (!groups.has(item.subject_no)) {
        groups.set(item.subject_no, {
          subjectNo: item.subject_no,
          subjectName: item.subject_name,
          items: [],
        });
      }
      groups.get(item.subject_no).items.push(item);
    });
    return [...groups.values()];
  }, [activeRows]);
  const effectiveSubjectNo = selectedSubjectNo ?? dimensionGroups[0]?.subjectNo ?? null;
  const subjectItems = useMemo(
    () => activeRows.filter((item) => item.subject_no === effectiveSubjectNo),
    [activeRows, effectiveSubjectNo],
  );
  useEffect(() => {
    const firstItem = activeRows[0];
    if (!firstItem) {
      setSelected(null);
      setConfigForm(emptyForm);
      return;
    }

    if (!activeRows.some((item) => item.subject_no === selectedSubjectNo)) {
      setSelectedSubjectNo(firstItem.subject_no);
    }

    setSelected((current) => {
      const stillAvailable = current && activeRows.some((item) => (
        item.division === current.division
        && item.subject_no === current.subject_no
        && item.item_no === current.item_no
      ));
      if (stillAvailable) {
        return current;
      }
      setConfigForm(mapItemToForm(firstItem));
      return firstItem;
    });
  }, [activeRows, selectedSubjectNo]);

  useEffect(() => {
    const container = listScrollRef.current;
    if (!container) {
      return undefined;
    }

    function updateScrollState() {
      setListScroll({
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
  }, [rows]);

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
      division: 'all',
      subject_no: searchForm.subjectNo,
      item_name: searchForm.itemName,
    });
  }

  function selectDivision(division) {
    const value = String(division);
    setOffset(0);
    setSelected(null);
    setSelectedSubjectNo(null);
    setSearchForm((current) => ({ ...current, division: value, subjectNo: '', itemName: '' }));
    setFilters({ division: 'all', subject_no: '', item_name: '' });
  }

  function selectSubject(subjectNo) {
    setSelectedSubjectNo(subjectNo);
    const firstItem = activeRows.find((item) => item.subject_no === subjectNo);
    if (firstItem) {
      setSelected(firstItem);
      setConfigForm(mapItemToForm(firstItem));
    }
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

  function changeListScroll(event) {
    if (listScrollRef.current) {
      listScrollRef.current.scrollLeft = Number(event.target.value);
    }
  }

  function moveListScroll(direction) {
    const container = listScrollRef.current;
    if (container) {
      container.scrollBy({ left: direction * Math.max(220, container.clientWidth * 0.7), behavior: 'smooth' });
    }
  }

  return (
    <section className="adminPage prizmLvPage">
      <div className="legacyTabs prizmLvTabs" aria-label="Prism System 설정 구분">
        <button type="button" className={activeDivision === 1 ? 'active' : ''} onClick={() => selectDivision(1)}>Prizm</button>
        <button type="button" className={activeDivision === 2 ? 'active' : ''} onClick={() => selectDivision(2)}>CRA Index</button>
        <a href="/admin/cubici/adminPreference/prizmRawData">RawData</a>
      </div>

      <div className="prizmLvTopline">
        <div className="prizmLvSummary" aria-label="Prism 설정 집계">
          <span>전체 <strong>{formatNumber(counts.total_count ?? 0)}</strong></span>
          <span>Prizm <strong>{formatNumber(counts.prizm_count ?? 0)}</strong></span>
          <span>CRA <strong>{formatNumber(counts.cra_count ?? 0)}</strong></span>
          <span>미완성 <strong>{formatNumber(counts.incomplete_count ?? 0)}</strong></span>
          <span>변경이력 <strong>{formatNumber(recordTotal)}</strong></span>
        </div>
        <form className="m-search prizmLvSearch" onSubmit={handleSearch}>
          <div className="line">
            <div className="inputBox">
              <label htmlFor="prizmSubjectSearch">주제번호</label>
              <input id="prizmSubjectSearch" name="subjectNo" type="number" min="1" value={searchForm.subjectNo} onChange={updateSearchValue} />
            </div>
            <div className="inputBox">
              <label htmlFor="prizmItemSearch">항목명</label>
              <input id="prizmItemSearch" name="itemName" value={searchForm.itemName} onChange={updateSearchValue} />
            </div>
            <button type="submit" className="sBtn sColorLB">검색</button>
          </div>
        </form>
      </div>

      {message ? <p className="formMessage">{message}</p> : null}

      <div className="prizmLvSelector">
        <article className="prizmLvSelectPanel">
          <header><h3>차원 List</h3></header>
          <div className="prizmLvSelectHead"><span>List</span><span>비중</span></div>
          <div className="prizmLvChoiceList">
            {dimensionGroups.map((group) => (
              <button
                type="button"
                key={group.subjectNo}
                className={effectiveSubjectNo === group.subjectNo ? 'active' : ''}
                onClick={() => selectSubject(group.subjectNo)}
              >
                <span>{group.subjectName}</span>
                <strong>{sumWeights(group.items).toLocaleString()}</strong>
              </button>
            ))}
          </div>
          <footer><span>{dimensionGroups.length}차원</span><strong>{sumWeights(activeRows).toLocaleString()}</strong></footer>
        </article>

        <article className="prizmLvSelectPanel">
          <header><h3>평가지표</h3></header>
          <div className="prizmLvSelectHead"><span>List</span><span>비중</span></div>
          <div className="prizmLvChoiceList">
            {subjectItems.map((item) => (
              <button
                type="button"
                key={`${item.division}-${item.subject_no}-${item.item_no}`}
                className={selected?.item_no === item.item_no && selected?.subject_no === item.subject_no ? 'active' : ''}
                onClick={() => loadDetail(item)}
              >
                <span>{item.item_nm || `항목 ${item.item_no}`}</span>
                <strong>{item.item_weight || '-'}</strong>
              </button>
            ))}
          </div>
          <footer><span>{subjectItems.length}항목</span><strong>{sumWeights(subjectItems).toLocaleString()}</strong></footer>
        </article>

        <form className="prizmConfigPanel prizmLvDetailPanel" onSubmit={handleSave}>
          <div className="prizmConfigHeader">
            <div>
              <h4>세부지표 설정</h4>
              <span>{selected ? `${selected.division_label} · ${selected.subject_name} · ${selected.item_nm || `항목 ${selected.item_no}`}` : '평가지표를 선택하세요.'}</span>
            </div>
          </div>
          <div className="prizmConfigGrid">
            <label className="wide definitionField">
              <span>지표 정의</span>
              <textarea name="itemDefinition" value={configForm.itemDefinition} onChange={updateConfigValue} disabled={!selected} />
            </label>
            <label>
              <span>가중치</span>
              <input name="itemWeight" value={configForm.itemWeight} onChange={updateConfigValue} disabled={!selected} />
            </label>
            {Array.from({ length: 5 }, (_, index) => {
              const number = index + 1;
              return (
                <div className="prizmStandardRow" key={number}>
                  <strong>{number}</strong>
                  <label>
                    <span>하한</span>
                    <input name={`itemStandardLow${number}`} value={configForm[`itemStandardLow${number}`]} onChange={updateConfigValue} disabled={!selected} />
                  </label>
                  <label>
                    <span>상한</span>
                    <input name={`itemStandardHigh${number}`} value={configForm[`itemStandardHigh${number}`]} onChange={updateConfigValue} disabled={!selected} />
                  </label>
                </div>
              );
            })}
            <label className="wide">
              <span>변경메모</span>
              <input name="updateMemo" value={configForm.updateMemo} onChange={updateConfigValue} disabled={!selected} />
            </label>
          </div>
          <div className="prizmConfigActions">
            <button type="submit" className="sBtn sColorLB" disabled={!selected || isSaving}>수정</button>
          </div>
        </form>
      </div>

      <section className="prizmLvOverview">
        <header>
          <h3>종합 지표 현황</h3>
          <span>{activeDivision === 1 ? 'Prizm' : 'CRA Index'} · {activeRows.length}개 지표</span>
        </header>
        <div className="tableScroll" ref={listScrollRef}>
          <table className="prizmConfigTable prizmLvTable" aria-label="종합 지표 현황">
            <thead>
              <tr>
                <th>구분</th>
                <th>차원</th>
                <th>평가지표</th>
                <th>설정상태</th>
                <th>지표정의</th>
                <th>가중치</th>
                <th>1구간</th>
                <th>2구간</th>
                <th>3구간</th>
                <th>4구간</th>
                <th>5구간</th>
                <th>선택</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="12">Prism 설정을 조회 중입니다.</td></tr>
              ) : activeRows.length === 0 ? (
                <tr><td colSpan="12">조회 결과가 없습니다.</td></tr>
              ) : activeRows.map((row) => (
                <tr key={`${row.division}-${row.subject_no}-${row.item_no}`}>
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
                  <td><button type="button" className="tableBtn" onClick={() => loadDetail(row)}>선택</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {listScroll.max > 0 ? <div className="horizontalTableScrollbar prizmHorizontalScrollbar" aria-label="종합 지표 현황 좌우 스크롤">
          <button type="button" aria-label="종합 지표 현황 왼쪽으로 스크롤" onClick={() => moveListScroll(-1)} disabled={listScroll.left <= 0}>&lt;</button>
          <input type="range" aria-label="종합 지표 현황 가로 스크롤" min="0" max={listScroll.max} step="1" value={Math.min(listScroll.left, listScroll.max)} onChange={changeListScroll} />
          <button type="button" aria-label="종합 지표 현황 오른쪽으로 스크롤" onClick={() => moveListScroll(1)} disabled={listScroll.left >= listScroll.max}>&gt;</button>
        </div> : null}
      </section>

      <div className="prizmRecordPanel">
        <h4>지표 변경 이력관리</h4>
        <div className="prizmRecordScroll">
          <table className="prizmRecordTable">
            <thead><tr><th>일시</th><th>항목</th><th>관리자</th><th>메모</th></tr></thead>
            <tbody>
              {records.length === 0 ? <tr><td colSpan="4">변경이력이 없습니다.</td></tr> : records.map((record) => (
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
      </div>
    </section>
  );
}
