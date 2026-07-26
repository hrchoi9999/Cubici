import { useEffect, useMemo, useState } from 'react';
import {
  createRawDataFormula,
  deleteRawDataFormula,
  fetchRawDataColumns,
  fetchRawDataFormulas,
  fetchRawDataTables,
  previewRawData,
  updateRawDataFormula,
} from '../api/preferences.js';

const emptyFormula = {
  rawDataId: '',
  rawDataShop: '',
  rawDataTitle: '',
  rawDataContent: '',
};

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function tableTypeLabel(value) {
  return {
    '00': '매출',
    '01': '반품',
    '02': '정산/출금',
    '03': '상품',
    '04': '재고',
  }[value] ?? '기타';
}

function mapFormulaToForm(formula) {
  return {
    rawDataId: formula.raw_data_id ?? '',
    rawDataShop: formula.raw_data_shop ?? '',
    rawDataTitle: formula.raw_data_title ?? '',
    rawDataContent: formula.raw_data_content ?? '',
  };
}

function buildFormulaPayload(form) {
  return {
    raw_data_id: form.rawDataId.trim(),
    raw_data_shop: normalizeNullableText(form.rawDataShop),
    raw_data_title: form.rawDataTitle.trim(),
    raw_data_content: form.rawDataContent.trim(),
  };
}

export function RawDataConfigPage() {
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [formulaForm, setFormulaForm] = useState(emptyFormula);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadTables() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchRawDataTables();
        if (!ignore) {
          setTables(data ?? []);
        }
      } catch (error) {
        if (!ignore) {
          setTables([]);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTables();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadColumnsAndFormulas() {
      if (!selectedTable) {
        setColumns([]);
        setSelectedColumns([]);
        setFormulas([]);
        setPreview(null);
        return;
      }
      setMessage('');
      try {
        const [columnData, formulaData] = await Promise.all([
          fetchRawDataColumns(selectedTable),
          fetchRawDataFormulas({ raw_data_shop: selectedTable }),
        ]);
        if (!ignore) {
          setColumns(columnData ?? []);
          setSelectedColumns([]);
          setFormulas(formulaData ?? []);
          setPreview(null);
        }
      } catch (error) {
        if (!ignore) {
          setColumns([]);
          setFormulas([]);
          setMessage(error.message);
        }
      }
    }

    loadColumnsAndFormulas();

    return () => {
      ignore = true;
    };
  }, [selectedTable]);

  const selectedTableMeta = useMemo(
    () => tables.find((table) => table.table_name === selectedTable),
    [tables, selectedTable],
  );

  function toggleColumn(columnName) {
    setSelectedColumns((current) => (
      current.includes(columnName)
        ? current.filter((item) => item !== columnName)
        : [...current, columnName]
    ));
  }

  function selectFormula(formula) {
    setSelectedFormula(formula);
    setFormulaForm(mapFormulaToForm(formula));
    setMessage('');
  }

  function handleNewFormula() {
    setSelectedFormula(null);
    setFormulaForm({
      ...emptyFormula,
      rawDataId: selectedColumns[0] ?? '',
      rawDataShop: selectedTable,
    });
    setMessage('');
  }

  function updateFormulaValue(event) {
    const { name, value } = event.target;
    setFormulaForm((current) => ({ ...current, [name]: value }));
  }

  async function reloadFormulas() {
    const data = await fetchRawDataFormulas({ raw_data_shop: selectedTable });
    setFormulas(data ?? []);
  }

  async function handleSaveFormula(event) {
    event.preventDefault();
    if (!formulaForm.rawDataId.trim() || !formulaForm.rawDataTitle.trim() || !formulaForm.rawDataContent.trim()) {
      setMessage('타입, 제목, 계산식을 입력하세요.');
      return;
    }

    setMessage('');
    try {
      const payload = buildFormulaPayload(formulaForm);
      const result = selectedFormula
        ? await updateRawDataFormula(selectedFormula.raw_data_no, payload)
        : await createRawDataFormula(payload);
      setSelectedFormula(result.formula);
      if (result.formula) {
        setFormulaForm(mapFormulaToForm(result.formula));
      }
      await reloadFormulas();
      setMessage(result.action === 'created' ? '계산식을 등록했습니다.' : '계산식을 수정했습니다.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDeleteFormula() {
    if (!selectedFormula) {
      return;
    }
    setMessage('');
    try {
      await deleteRawDataFormula(selectedFormula.raw_data_no);
      setSelectedFormula(null);
      setFormulaForm({ ...emptyFormula, rawDataShop: selectedTable });
      await reloadFormulas();
      setMessage('계산식을 삭제했습니다.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handlePreview() {
    if (!selectedTable || selectedColumns.length === 0) {
      setMessage('테이블과 컬럼을 선택하세요.');
      return;
    }
    setMessage('');
    try {
      const data = await previewRawData({
        table_name: selectedTable,
        columns: selectedColumns,
        limit: 20,
      });
      setPreview(data);
    } catch (error) {
      setPreview(null);
      setMessage(error.message);
    }
  }

  return (
    <section className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h2>환경설정</h2>
          <p>Prism RawData 테이블, 컬럼, 계산식을 관리합니다.</p>
        </div>
        <div className="summaryPills">
          <span>테이블 {tables.length.toLocaleString()}개</span>
          <span>컬럼 {columns.length.toLocaleString()}개</span>
          <span>선택 {selectedColumns.length.toLocaleString()}개</span>
          <span>계산식 {formulas.length.toLocaleString()}개</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a href="/admin/cubici/adminPreference/prizmConfig">Prizm</a>
        <a href="/admin/cubici/adminPreference/craConfig">CRA Index</a>
        <a className="active" href="/admin/cubici/adminPreference/prizmRawData">RawData</a>
      </div>

      <div className="rawDataLayout">
        <section className="rawDataPanel">
          <header>
            <h4>{selectedTableMeta?.table_label ?? '테이블을 선택해 주세요.'}</h4>
            <select value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>
              <option value="">선택</option>
              {tables.map((table) => (
                <option key={table.table_name} value={table.table_name}>
                  {table.table_label} ({tableTypeLabel(table.table_type)})
                </option>
              ))}
            </select>
          </header>
          <div className="rawDataColumnList">
            {isLoading ? <p>테이블 목록을 조회 중입니다.</p> : null}
            {!isLoading && columns.length === 0 ? <p>선택된 테이블의 컬럼이 없습니다.</p> : null}
            {columns.map((column) => (
              <label key={column.column_name}>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column.column_name)}
                  onChange={() => toggleColumn(column.column_name)}
                />
                <span>{column.column_label}</span>
                <small>{column.data_type}</small>
              </label>
            ))}
          </div>
          <div className="rawDataActions">
            <button type="button" className="lineButton" onClick={() => setSelectedColumns([])}>목록 초기화</button>
            <button type="button" className="primaryButton" onClick={handlePreview}>Preview</button>
          </div>
        </section>

        <section className="rawDataPanel">
          <header>
            <h4>계산식</h4>
            <button type="button" className="lineButton" onClick={handleNewFormula}>계산식 등록</button>
          </header>
          <div className="rawDataFormulaList">
            {formulas.length === 0 ? <p>등록된 계산식이 없습니다.</p> : null}
            {formulas.map((formula) => (
              <button
                key={formula.raw_data_no}
                type="button"
                className={selectedFormula?.raw_data_no === formula.raw_data_no ? 'active' : ''}
                onClick={() => selectFormula(formula)}
              >
                <strong>{formula.raw_data_title}</strong>
                <span>{formula.raw_data_id}</span>
                <span>{formula.formula_status_label ?? '-'}</span>
              </button>
            ))}
          </div>

          <form className="rawDataFormulaForm" onSubmit={handleSaveFormula}>
            <label>
              <span>타입</span>
              <input name="rawDataId" value={formulaForm.rawDataId} onChange={updateFormulaValue} />
            </label>
            <label>
              <span>쇼핑몰</span>
              <input name="rawDataShop" value={formulaForm.rawDataShop} onChange={updateFormulaValue} />
            </label>
            <label>
              <span>제목</span>
              <input name="rawDataTitle" value={formulaForm.rawDataTitle} onChange={updateFormulaValue} />
            </label>
            <label className="wide">
              <span>계산식</span>
              <textarea name="rawDataContent" value={formulaForm.rawDataContent} onChange={updateFormulaValue} />
            </label>
            <div className="rawDataActions">
              <button type="submit" className="primaryButton">{selectedFormula ? '수정' : '등록'}</button>
              <button type="button" className="lineButton danger" disabled={!selectedFormula} onClick={handleDeleteFormula}>삭제</button>
            </div>
          </form>
        </section>
      </div>

      {message ? <p className="statusMessage">{message}</p> : null}

      <section className="rawDataPreviewPanel">
        <h4>Preview</h4>
        <div className="legacyTableWrap">
          <table className="legacyTable rawDataPreviewTable">
            <thead>
              <tr>
                {(preview?.columns ?? []).map((column) => (
                  <th key={column.column_name}>{column.column_label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(preview?.rows ?? []).length === 0 ? (
                <tr><td>Preview 데이터가 없습니다.</td></tr>
              ) : preview.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {preview.columns.map((column) => (
                    <td key={column.column_name}>{String(row[column.column_name] ?? '-')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
