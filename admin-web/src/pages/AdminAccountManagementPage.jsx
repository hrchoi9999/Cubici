import { useEffect, useMemo, useRef, useState } from 'react';
import {
  approveAdminAccount,
  checkAdminId,
  deleteAdminAccount,
  fetchAdminAccount,
  fetchAdminAccounts,
  requestAdminAccount,
  updateAdminAccount,
} from '../api/preferences.js';

const PAGE_SIZE = 20;

const emptyForm = {
  adminId: '',
  adminType: '00',
  adminName: '',
  adminPhone: '',
  adminEmail: '',
  adminDepartment: '',
  adminGrade: '00',
  password: '',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function normalizePhone(value) {
  return String(value ?? '').replace(/[^0-9]/g, '');
}

function formatPhone(value) {
  const raw = normalizePhone(value);
  if (raw.length === 11) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  }
  if (raw.length === 10) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  return value || '-';
}

function mapAccountToForm(account) {
  return {
    adminId: account.admin_id ?? '',
    adminType: account.admin_type ?? '00',
    adminName: account.admin_name ?? '',
    adminPhone: account.admin_phone ?? '',
    adminEmail: account.admin_email ?? '',
    adminDepartment: account.admin_department ?? '',
    adminGrade: account.admin_grade === '02' ? '00' : account.admin_grade,
    password: '',
  };
}

function isPending(account) {
  return account?.admin_approval_date === null || account?.approval_status === '대기';
}

export function AdminAccountManagementPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, pending_count: 0, approved_count: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', order_by: 'reg_date_desc' });
  const [formValues, setFormValues] = useState({
    adminType: 'all',
    adminGrade: 'all',
    adminName: '',
    status: 'all',
    orderBy: 'reg_date_desc',
  });
  const [selected, setSelected] = useState(null);
  const [accountForm, setAccountForm] = useState(emptyForm);
  const [idCheckResult, setIdCheckResult] = useState('');
  const [mode, setMode] = useState('request');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const listScrollRef = useRef(null);
  const [listScroll, setListScroll] = useState({ left: 0, max: 0 });

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchAdminAccounts({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? {});
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, pending_count: 0, approved_count: 0 });
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
    const data = await fetchAdminAccounts({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setCounts(data.counts ?? {});
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateAccountValue(event) {
    const { name, value } = event.target;
    setAccountForm((current) => ({ ...current, [name]: value }));
    if (name === 'adminId') {
      setIdCheckResult('');
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setMode('request');
    setIsEditorOpen(false);
    setFilters({
      admin_type: formValues.adminType,
      admin_grade: formValues.adminGrade,
      admin_name: formValues.adminName,
      status: formValues.status,
      order_by: formValues.orderBy,
    });
  }

  function handleNew() {
    setSelected(null);
    setAccountForm(emptyForm);
    setMode('request');
    setMessage('');
    setIdCheckResult('');
    setIsEditorOpen(true);
  }

  async function loadDetail(adminId) {
    setMessage('');
    setIdCheckResult('');

    try {
      const data = await fetchAdminAccount(adminId);
      setSelected(data);
      setAccountForm(mapAccountToForm(data));
      setMode(isPending(data) ? 'approval' : 'update');
      setIsEditorOpen(true);
      window.requestAnimationFrame(() => listScrollRef.current?.scrollTo({ left: 0 }));
    } catch (error) {
      setSelected(null);
      setMode('request');
      setIsEditorOpen(false);
      setMessage(error.message);
    }
  }

  async function handleIdCheck() {
    if (!accountForm.adminId.trim()) {
      setIdCheckResult('ID를 입력해주세요.');
      return;
    }

    try {
      const result = await checkAdminId(accountForm.adminId.trim());
      setIdCheckResult(result.exists ? '중복된 아이디 입니다.' : '사용 가능한 아이디 입니다.');
    } catch (error) {
      setIdCheckResult(error.message);
    }
  }

  function validateForm() {
    if (!accountForm.adminName.trim()) {
      return '이름을 입력하세요.';
    }
    if (!accountForm.adminDepartment.trim()) {
      return '부서명을 입력하세요.';
    }
    if (mode !== 'request' && !accountForm.adminId.trim()) {
      return '관리자 아이디를 입력하세요.';
    }
    if ((mode === 'approval' || mode === 'request') && !accountForm.password.trim()) {
      return mode === 'approval' ? '승인 비밀번호를 입력하세요.' : '';
    }
    return '';
  }

  function buildCommonPayload() {
    return {
      admin_type: accountForm.adminType,
      admin_name: accountForm.adminName.trim(),
      admin_phone: normalizePhone(accountForm.adminPhone) || null,
      admin_email: accountForm.adminEmail.trim() || null,
      admin_department: accountForm.adminDepartment.trim() || null,
      admin_grade: accountForm.adminGrade,
    };
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
      let result;
      if (mode === 'request') {
        result = await requestAdminAccount(buildCommonPayload());
      } else if (mode === 'approval') {
        result = await approveAdminAccount(selected.admin_id, {
          new_admin_id: accountForm.adminId.trim(),
          password: accountForm.password,
          admin_grade: accountForm.adminGrade,
        });
      } else {
        result = await updateAdminAccount(selected.admin_id, {
          ...buildCommonPayload(),
          password: accountForm.password.trim() || null,
        });
      }

      setSelected(result.account);
      if (result.account) {
        setAccountForm(mapAccountToForm(result.account));
        setMode(isPending(result.account) ? 'approval' : 'update');
      }
      await reloadList();
      setMessage({
        created: '관리자 신청을 등록했습니다.',
        approved: '관리자를 승인했습니다.',
        updated: '관리자 정보를 수정했습니다.',
      }[result.action] ?? '처리했습니다.');
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
      await deleteAdminAccount(selected.admin_id);
      setSelected(null);
      setAccountForm(emptyForm);
      setMode('request');
      setIsEditorOpen(false);
      await reloadList(0);
      setMessage('관리자 등록을 해지했습니다.');
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
    <section className="adminAccountLvPage">
      <div className="m-tab adminAccountLvTabs">
        <ul>
          <li className="active"><a href="/admin/cubici/adminPreference/adminRegister_tab1">등록 관리자</a></li>
          <li><a href="/admin/cubici/adminPreference/adminRegister_tab2">접근권한</a></li>
        </ul>
      </div>

      <form className="m-search searchArea adminAccountLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="adminType">회사명</label>
            <select id="adminType" name="adminType" value={formValues.adminType} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="00">큐빅아이</option>
              <option value="01">투게더</option>
              <option value="02">헬로펀딩</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="adminGrade">접근권한</label>
            <select id="adminGrade" name="adminGrade" value={formValues.adminGrade} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="00">권한1</option>
              <option value="01">권한2</option>
              <option value="02">승인대기</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="adminStatus">상태</label>
            <select id="adminStatus" name="status" value={formValues.status} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="pending">대기</option>
              <option value="approved">승인완료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="adminName">이름</label>
            <input id="adminName" name="adminName" type="text" value={formValues.adminName} onChange={updateSearchValue} />
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="adminOrder">보기기준</label>
            <select id="adminOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">최근 신청순</option>
              <option value="approval_date_desc">최근 승인순</option>
              <option value="name_asc">이름순</option>
              <option value="admin_id_asc">아이디순</option>
            </select>
          </div>
          <button type="submit" className="sBtn sColorLB">검색</button>
          <button type="button" className="sBtn sColorN" onClick={handleNew}>신청 등록</button>
        </div>
      </form>

      {message ? <p className="formMessage">{message}</p> : null}

      <div className="adminAccountLvList">
        <div className="tableScroll" ref={listScrollRef}>
          <table className="adminAccountTable adminAccountLvTable" aria-label="등록 관리자 목록">
            <thead>
              <tr>
                <th>#</th>
                <th>회사명</th>
                <th>부서명</th>
                <th>이름</th>
                <th>핸드폰</th>
                <th>이메일</th>
                <th>신청일자</th>
                <th>승인일자</th>
                <th>접근권한</th>
                <th>상태</th>
                <th>수정</th>
              </tr>
            </thead>
            <tbody id="fixTbody">
              {isLoading ? (
                <tr><td colSpan="11">관리자 목록을 불러오는 중입니다.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="11">검색결과가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.admin_id}>
                  <td>{row.row_no}</td>
                  <td>{row.admin_type_label}</td>
                  <td>{row.admin_department ?? '-'}</td>
                  <td>{row.admin_name}</td>
                  <td>{formatPhone(row.admin_phone)}</td>
                  <td>{row.admin_email ?? '-'}</td>
                  <td>{formatDate(row.admin_reg_date)}</td>
                  <td>{formatDate(row.admin_approval_date)}</td>
                  <td>{row.admin_grade_label}</td>
                  <td>{row.approval_status}</td>
                  <td><button type="button" className="tableBtn" onClick={() => loadDetail(row.admin_id)}>보기</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listScroll.max > 0 ? <div className="horizontalTableScrollbar adminAccountHorizontalScrollbar" aria-label="등록 관리자 목록 좌우 스크롤">
          <button type="button" aria-label="관리자 목록 왼쪽으로 스크롤" onClick={() => moveListScroll(-1)} disabled={listScroll.left <= 0}>&lt;</button>
          <input
            type="range"
            aria-label="관리자 목록 가로 스크롤"
            min="0"
            max={listScroll.max}
            step="1"
            value={Math.min(listScroll.left, listScroll.max)}
            onChange={changeListScroll}
          />
          <button type="button" aria-label="관리자 목록 오른쪽으로 스크롤" onClick={() => moveListScroll(1)} disabled={listScroll.left >= listScroll.max}>&gt;</button>
        </div> : null}

        <div className="adminAccountLvTotals" aria-label="관리자 등록 집계">
          <div><span>전체</span><strong>{formatNumber(counts.total_count)}명</strong></div>
          <div><span>승인 대기</span><strong>{formatNumber(counts.pending_count)}명</strong></div>
          <div><span>승인 완료</span><strong>{formatNumber(counts.approved_count)}명</strong></div>
          <div><span>현재 페이지</span><strong>{currentPage} / {pageCount}</strong></div>
        </div>

        <div className="pagination pagingControls">
        <button type="button" className="grayBtn" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button type="button" className="grayBtn" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
        </div>
      </div>

      {isEditorOpen ? <form className="adminAccountPanel" onSubmit={handleSave}>
        <div className="adminAccountHeader">
          <h4>{mode === 'approval' ? '관리자 등록 승인' : mode === 'update' ? '관리자 정보 수정' : '관리자 신청 등록'}</h4>
          <div>
            <span>{selected ? selected.approval_status : '신규 신청'}</span>
            <button type="button" onClick={() => setIsEditorOpen(false)}>닫기</button>
          </div>
        </div>
        {selected ? <div className="adminAccountAuditSummary">
          <div><span>권한범위</span><strong>{selected.permission_scope_label ?? '-'}</strong></div>
          <div><span>Audit</span><strong>{selected.audit_status_label ?? '-'}</strong></div>
        </div> : null}
        <div className="adminAccountGrid">
          {mode !== 'request' ? (
            <label>
              <span>관리자 아이디</span>
              <input name="adminId" value={accountForm.adminId} onChange={updateAccountValue} readOnly={mode === 'update'} />
            </label>
          ) : null}
          {mode === 'approval' ? (
            <button type="button" className="sBtn sColorLB idCheckButton" onClick={handleIdCheck}>중복확인</button>
          ) : null}
          <label>
            <span>관리자 비밀번호</span>
            <input name="password" type="password" value={accountForm.password} onChange={updateAccountValue} placeholder={mode === 'update' ? '변경 시 입력' : ''} />
          </label>
          <label>
            <span>회사명</span>
            <select name="adminType" value={accountForm.adminType} onChange={updateAccountValue} disabled={mode === 'approval'}>
              <option value="00">큐빅아이</option>
              <option value="01">투게더</option>
              <option value="02">헬로펀딩</option>
            </select>
          </label>
          <label>
            <span>부서명</span>
            <input name="adminDepartment" value={accountForm.adminDepartment} onChange={updateAccountValue} readOnly={mode === 'approval'} />
          </label>
          <label>
            <span>이름</span>
            <input name="adminName" value={accountForm.adminName} onChange={updateAccountValue} readOnly={mode === 'approval'} />
          </label>
          <label>
            <span>핸드폰</span>
            <input name="adminPhone" value={accountForm.adminPhone} onChange={updateAccountValue} readOnly={mode === 'approval'} />
          </label>
          <label>
            <span>이메일</span>
            <input name="adminEmail" value={accountForm.adminEmail} onChange={updateAccountValue} readOnly={mode === 'approval'} />
          </label>
          <label>
            <span>접근등급</span>
            <select name="adminGrade" value={accountForm.adminGrade} onChange={updateAccountValue}>
              <option value="00">1</option>
              <option value="01">2</option>
            </select>
          </label>
        </div>
        {idCheckResult ? <p className="formMessage">{idCheckResult}</p> : null}
        <div className="adminAccountActions">
          <button type="submit" className="sBtn sColorLB" disabled={isSaving}>
            {mode === 'approval' ? '등록 승인' : mode === 'update' ? '정보 수정' : '신청 등록'}
          </button>
          <button type="button" className="sBtn sColorN" onClick={handleNew} disabled={isSaving}>초기화</button>
          {selected ? <button type="button" className="sBtn sColorP" onClick={handleDelete} disabled={isSaving}>등록 해지</button> : null}
        </div>
      </form> : null}
    </section>
  );
}
