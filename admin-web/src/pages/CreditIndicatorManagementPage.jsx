import { useEffect, useMemo, useState } from 'react';

import { fetchPrizmConfigItems, updatePrizmConfigItem } from '../api/preferences.js';

const STANDARD_FIELDS = Array.from({ length: 5 }, (_, index) => ({
  low: `item_standard_low${index + 1}`,
  high: `item_standard_high${index + 1}`,
}));

const SUBJECT_LABELS = {
  1: {
    1: '기업개요',
    2: '매출지표',
    3: '정산지표',
    4: '운영지표',
    5: '금융건전성 지표',
  },
  2: {
    1: '핵심리스크',
    2: '매출리스크',
    3: '운영리스크',
  },
};

const GRADE_LABELS = ['E', 'D', 'C', 'B', 'A'];

function normalizeValue(value) {
  return value ?? '';
}

function itemKey(item) {
  return `${item.division}-${item.subject_no}-${item.item_no}`;
}

function mapItems(items) {
  return Object.fromEntries(items.map((item) => [itemKey(item), {
    ...item,
    item_weight: normalizeValue(item.item_weight),
    ...Object.fromEntries(
      STANDARD_FIELDS.flatMap(({ low, high }) => [
        [low, normalizeValue(item[low])],
        [high, normalizeValue(item[high])],
      ]),
    ),
  }]));
}

function buildUpdatePayload(item) {
  return {
    item_definition: item.item_definition || null,
    item_weight: item.item_weight || null,
    ...Object.fromEntries(
      STANDARD_FIELDS.flatMap(({ low, high }) => [
        [low, item[low] || null],
        [high, item[high] || null],
      ]),
    ),
    admin_id: 'admin-web',
    update_memo: '신용평가지표 화면 일괄 조정',
  };
}

function ValueInput({ ariaLabel, field, item, onChange }) {
  return (
    <input
      aria-label={ariaLabel}
      className="creditIndicatorInput"
      type="text"
      value={item[field]}
      onChange={(event) => onChange(itemKey(item), field, event.target.value)}
    />
  );
}

function StandardCells({ item, onChange }) {
  if (item.division === 2 && item.subject_no === 1) {
    const warning = item.item_no === 1 ? 'YES(경고)' : 'YES(주의)';
    return (
      <>
        <td className="creditIndicatorBoolean" colSpan="3">NO(정상)</td>
        <td className="creditIndicatorBoolean" colSpan="3">{warning}</td>
        {STANDARD_FIELDS.slice(2).map(({ low, high }, index) => (
          <FragmentCells
            key={low}
            grade={index + 3}
            high={high}
            item={item}
            low={low}
            onChange={onChange}
          />
        ))}
      </>
    );
  }

  return STANDARD_FIELDS.map(({ low, high }, index) => (
    <FragmentCells
      key={low}
      grade={index + 1}
      high={high}
      item={item}
      low={low}
      onChange={onChange}
    />
  ));
}

function FragmentCells({ grade, high, item, low, onChange }) {
  return (
    <>
      <td>
        <ValueInput
          ariaLabel={`${item.item_nm} ${grade}구간 최소값`}
          field={low}
          item={item}
          onChange={onChange}
        />
      </td>
      <td className="creditIndicatorRange">~</td>
      <td>
        <ValueInput
          ariaLabel={`${item.item_nm} ${grade}구간 최대값`}
          field={high}
          item={item}
          onChange={onChange}
        />
      </td>
    </>
  );
}

function IndicatorTable({ division, items, onChange }) {
  const title = division === 1 ? 'PCS 지표' : 'PMS 지표';
  const rows = items.filter((item) => item.division === division && item.subject_no !== 6);
  const subjectCounts = rows.reduce((counts, item) => ({
    ...counts,
    [item.subject_no]: (counts[item.subject_no] ?? 0) + 1,
  }), {});

  return (
    <div className="creditIndicatorSection">
      <h3>{title}</h3>
      <div className="creditIndicatorTableScroll">
        <table className="creditIndicatorTable creditIndicatorMetricTable">
          <thead>
            <tr>
              <th rowSpan="2">차원</th>
              <th rowSpan="2">평가항목</th>
              <th rowSpan="2">척도<br />가중비</th>
              <th colSpan="15">척도 구간 값(Min~Max)</th>
            </tr>
            <tr>
              {Array.from({ length: 5 }, (_, index) => (
                <th key={index} colSpan="3">{index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={itemKey(item)}>
                {item.item_no === 1 ? (
                  <th className="creditIndicatorDimension" rowSpan={subjectCounts[item.subject_no]}>
                    {SUBJECT_LABELS[division]?.[item.subject_no] ?? `주제 ${item.subject_no}`}
                  </th>
                ) : null}
                <th className="creditIndicatorItemName">{item.item_nm}</th>
                <td>
                  <ValueInput
                    ariaLabel={`${item.item_nm} 척도 가중비`}
                    field="item_weight"
                    item={item}
                    onChange={onChange}
                  />
                </td>
                <StandardCells item={item} onChange={onChange} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradeTable({ division, items, onChange }) {
  const item = items.find((row) => row.division === division && row.subject_no === 6);
  if (!item) return null;

  return (
    <div className="creditIndicatorSection creditIndicatorGradeSection">
      <h3>{division === 1 ? 'PCS 평가등급' : 'PMS 평가등급'}</h3>
      <div className="creditIndicatorTableScroll">
        <table className="creditIndicatorTable creditIndicatorGradeTable">
          <thead>
            <tr>
              <th>평가등급</th>
              {GRADE_LABELS.map((grade) => <th key={grade} colSpan="3">{grade}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="creditIndicatorDimension">구간 값</th>
              {STANDARD_FIELDS.map(({ low, high }, index) => (
                <FragmentCells
                  key={low}
                  grade={GRADE_LABELS[index]}
                  high={high}
                  item={item}
                  low={low}
                  onChange={onChange}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreditIndicatorManagementPage() {
  const [itemsByKey, setItemsByKey] = useState({});
  const [savedItemsByKey, setSavedItemsByKey] = useState({});
  const [dirtyKeys, setDirtyKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchPrizmConfigItems({ limit: 100, offset: 0, division: 'all' })
      .then((data) => {
        if (ignore) return;
        const mapped = mapItems(data.items ?? []);
        setItemsByKey(mapped);
        setSavedItemsByKey(mapped);
      })
      .catch((error) => {
        if (!ignore) setMessage(error.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const items = useMemo(
    () => Object.values(itemsByKey).sort((a, b) => (
      a.division - b.division || a.subject_no - b.subject_no || a.item_no - b.item_no
    )),
    [itemsByKey],
  );

  function updateValue(key, field, value) {
    setItemsByKey((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));
    setDirtyKeys((current) => new Set(current).add(key));
    setMessage('');
  }

  function handleReset() {
    setItemsByKey(savedItemsByKey);
    setDirtyKeys(new Set());
    setMessage('마지막 저장 상태로 초기화했습니다.');
  }

  async function handleSave() {
    if (dirtyKeys.size === 0) {
      setMessage('변경된 설정이 없습니다.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const changedItems = [...dirtyKeys].map((key) => itemsByKey[key]);
      for (const item of changedItems) {
        await updatePrizmConfigItem(
          item.division,
          item.subject_no,
          item.item_no,
          buildUpdatePayload(item),
        );
      }
      const nextSavedItems = { ...itemsByKey };
      setSavedItemsByKey(nextSavedItems);
      setDirtyKeys(new Set());
      setMessage(`${changedItems.length}개 평가항목을 저장했습니다.`);
    } catch (error) {
      setMessage(`${error.message} 저장이 중단되었으므로 변경값을 확인해 주세요.`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="creditIndicatorPage" aria-labelledby="credit-indicator-title">
      <h2 id="credit-indicator-title" className="srOnly">신용평가지표</h2>
      <div className="creditIndicatorTab">재조정</div>

      {isLoading ? <p className="creditIndicatorStatus">평가지표를 불러오는 중입니다.</p> : null}
      {!isLoading && items.length === 0 ? <p className="creditIndicatorStatus">표시할 평가지표가 없습니다.</p> : null}

      {!isLoading && items.length > 0 ? (
        <div className="creditIndicatorContent">
          <IndicatorTable division={1} items={items} onChange={updateValue} />
          <GradeTable division={1} items={items} onChange={updateValue} />
          <IndicatorTable division={2} items={items} onChange={updateValue} />
          <GradeTable division={2} items={items} onChange={updateValue} />
        </div>
      ) : null}

      {message ? <p className="creditIndicatorMessage" role="status">{message}</p> : null}

      <div className="creditIndicatorActions">
        <button className="creditIndicatorReset" type="button" onClick={handleReset} disabled={isLoading || isSaving}>
          초기화
        </button>
        <button className="creditIndicatorSave" type="button" onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? '저장 중' : '저장'}
        </button>
      </div>
    </section>
  );
}
