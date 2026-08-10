import { useEffect, useState } from 'react';
import {
  createMessageTemplate,
  deleteMessageTemplate,
  fetchMessageTemplate,
  fetchMessageTemplates,
  updateMessageTemplate,
} from '../api/support.js';

const PAGE_SIZE = 20;

const emptyForm = {
  msgKey: '00',
  msgCode: '',
  msgMenu: 'CB',
  msgDivision: 'SU',
  msgItem: '',
  msgTitle: '',
  msgContent: '',
  regUser: 'admin',
};

function stripHtml(value) {
  if (!value) {
    return '-';
  }
  return value.replace(/<[^>]*>/g, '').trim() || '-';
}

function initialKeyFromPath() {
  return window.location.pathname.includes('/manageEmail') ? '01' : '00';
}

export function MessageTemplatePage() {
  const initialKey = initialKeyFromPath();
  const [activeKey, setActiveKey] = useState(initialKey);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ msg_key: initialKey, order_by: 'menu_asc' });
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ ...emptyForm, msgKey: initialKey });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadTemplates() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchMessageTemplates({ limit: PAGE_SIZE, offset, ...filters });
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

    loadTemplates();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  async function reloadList(nextOffset = offset) {
    const data = await fetchMessageTemplates({ limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }

  function switchKey(nextKey) {
    setActiveKey(nextKey);
    setOffset(0);
    setSelected(null);
    setPreviewTemplate(null);
    setIsEditorOpen(false);
    setTemplateForm({ ...emptyForm, msgKey: nextKey });
    setFilters({ msg_key: nextKey, keyword, order_by: 'menu_asc' });
    const nextPath = nextKey === '01'
      ? '/admin/cubici/supportMember/manageEmail'
      : '/admin/cubici/supportMember/manageSms';
    window.history.replaceState({}, '', nextPath);
  }

  function updateTemplateValue(event) {
    const { name, value } = event.target;
    setTemplateForm((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setIsEditorOpen(false);
    setFilters({
      msg_key: activeKey,
      keyword,
      order_by: 'menu_asc',
    });
  }

  function handleNew() {
    setSelected(null);
    setIsEditorOpen(true);
    setTemplateForm({ ...emptyForm, msgKey: activeKey });
    setMessage('');
  }

  async function loadDetail(messageNo) {
    setMessage('');
    try {
      const data = await fetchMessageTemplate(messageNo);
      setSelected(data);
      setIsEditorOpen(true);
      setTemplateForm({
        msgKey: data.msg_key,
        msgCode: data.msg_code,
        msgMenu: data.msg_menu,
        msgDivision: data.msg_division,
        msgItem: data.msg_item,
        msgTitle: data.msg_title ?? '',
        msgContent: data.msg_content,
        regUser: data.reg_user,
      });
    } catch (error) {
      setSelected(null);
      setIsEditorOpen(false);
      setMessage(error.message);
    }
  }

  async function showEmailPreview(messageNo) {
    setMessage('');
    try {
      const data = await fetchMessageTemplate(messageNo);
      setPreviewTemplate(data);
    } catch (error) {
      setPreviewTemplate(null);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!/^[0-9]{2}$/.test(templateForm.msgCode)) {
      return '코드는 두 자리 숫자로 입력하세요.';
    }
    if (!templateForm.msgItem.trim() || !templateForm.msgTitle.trim() || !templateForm.msgContent.trim()) {
      return '항목, 제목, 내용을 입력하세요.';
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
      msg_key: templateForm.msgKey,
      msg_code: templateForm.msgCode,
      msg_menu: templateForm.msgMenu,
      msg_division: templateForm.msgDivision,
      msg_item: templateForm.msgItem,
      msg_title: templateForm.msgTitle,
      msg_content: templateForm.msgContent,
      reg_user: templateForm.regUser || 'admin',
    };

    setIsSaving(true);
    setMessage('');

    try {
      const result = selected
        ? await updateMessageTemplate(selected.message_no, payload)
        : await createMessageTemplate(payload);
      const savedKey = result.template?.msg_key ?? templateForm.msgKey;
      setActiveKey(savedKey);
      const nextFilters = { msg_key: savedKey, keyword, order_by: 'menu_asc' };
      setFilters(nextFilters);
      setSelected(null);
      setIsEditorOpen(false);
      const data = await fetchMessageTemplates({ limit: PAGE_SIZE, offset: 0, ...nextFilters });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setOffset(0);
      setMessage(result.action === 'created' ? '템플릿을 등록했습니다.' : '템플릿을 수정했습니다.');
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
      await deleteMessageTemplate(selected.message_no);
      setSelected(null);
      setIsEditorOpen(false);
      setTemplateForm({ ...emptyForm, msgKey: activeKey });
      await reloadList(0);
      setOffset(0);
      setMessage('템플릿을 삭제했습니다.');
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
      return next >= total ? value : next;
    });
  }

  return (
    <>
      <div className="m-tab messageTemplateLvTabs">
        <ul>
          <li className={activeKey === '00' ? 'active' : ''}>
            <a href="/admin/cubici/supportMember/manageSms" onClick={(event) => { event.preventDefault(); switchKey('00'); }}>
              문자 공지
            </a>
          </li>
          <li className={activeKey === '01' ? 'active' : ''}>
            <a href="/admin/cubici/supportMember/manageEmail" onClick={(event) => { event.preventDefault(); switchKey('01'); }}>
              이메일
            </a>
          </li>
        </ul>
      </div>

      <section className="messageTemplateLvPage">
        {message ? <p className={message.includes('실패') || message.includes('입력') || message.includes('코드') ? 'formMessage error' : 'formMessage'}>{message}</p> : null}

        {!isEditorOpen ? (
          <>
            <div className="messageTemplateLvToolbar">
              <button className="sBtn sColorLB" type="button" onClick={handleNew}>글쓰기</button>
              <form className="messageTemplateLvSearch" onSubmit={handleSearch}>
                <input id="templateKeyword" type="search" aria-label="검색어" placeholder="검색" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                <button className="oiBtn search" type="submit" aria-label="검색">검색</button>
              </form>
            </div>
            <div className="messageTemplateLvList">
              <div className="table-scroll">
                <table className="m-shadowTable messageTemplateTable">
                  <caption className="caption">문자/이메일 템플릿 목록</caption>
                  <thead>
                    <tr>
                      <th scope="col">메뉴</th>
                      <th scope="col">구분</th>
                      <th scope="col">항목</th>
                      <th scope="col">{activeKey === '00' ? '요약' : '제목'}</th>
                      <th scope="col">코드</th>
                      <th scope="col">보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? <tr><td colSpan="6">조회 중입니다.</td></tr> : null}
                    {!isLoading && items.length === 0 ? <tr><td colSpan="6">조회된 결과가 없습니다.</td></tr> : null}
                    {!isLoading && items.map((item) => (
                      <tr key={item.message_no}>
                        <td>{item.msg_menu_label}</td>
                        <td>{item.msg_division_label}</td>
                        <td>{item.msg_item}</td>
                        <td className="subject">{item.msg_title ?? '-'}</td>
                        <td>{item.msg_code}</td>
                        <td className="messageTemplateLvManage">
                          <button className="sBtn sColorLB rBtn" type="button" onClick={() => loadDetail(item.message_no)}>보기</button>
                          {activeKey === '01' ? (
                            <button className="sBtn sColorLB rBtn" type="button" onClick={() => showEmailPreview(item.message_no)}>상세 화면</button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagingControls" aria-label={`전체 ${total}건`}>
                <button type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
                <span>{currentPage}</span>
                <button type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
              </div>
            </div>
          </>
        ) : (
          <section className="messageTemplateEditor isOpen">
            <h3>{selected ? '템플릿 수정' : '템플릿 등록'}</h3>
        <form className="messageTemplateForm" onSubmit={handleSave}>
          <label>
            작성자
            <input name="regUser" type="text" value={templateForm.regUser} onChange={updateTemplateValue} />
          </label>
          <label>
            분류
            <select name="msgKey" value={templateForm.msgKey} onChange={updateTemplateValue} disabled={Boolean(selected)}>
              <option value="00">문자</option>
              <option value="01">이메일</option>
            </select>
          </label>
          <label>
            메뉴
            <select name="msgMenu" value={templateForm.msgMenu} onChange={updateTemplateValue}>
              <option value="CB">큐빅아이</option>
              <option value="MB">머니뱅크</option>
              <option value="TH">기타</option>
            </select>
          </label>
          <label>
            구분
            <select name="msgDivision" value={templateForm.msgDivision} onChange={updateTemplateValue}>
              <option value="SU">회원가입</option>
              <option value="MP">머니플러스</option>
              <option value="ETC">기타</option>
            </select>
          </label>
          <label>
            코드
            <input name="msgCode" type="text" value={templateForm.msgCode} onChange={updateTemplateValue} maxLength={2} />
          </label>
          <label>
            항목
            <input name="msgItem" type="text" value={templateForm.msgItem} onChange={updateTemplateValue} />
          </label>
          <label>
            제목
            <input name="msgTitle" type="text" value={templateForm.msgTitle} onChange={updateTemplateValue} />
          </label>
          <label className="messageTemplateContent">
            내용
            <textarea name="msgContent" value={templateForm.msgContent} onChange={updateTemplateValue} rows={8} />
          </label>
          <div className="messageTemplateActions">
            <button className="sBtn sColorLB" type="submit" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
            {selected ? <button className="sBtn sColorR" type="button" onClick={handleDelete} disabled={isSaving}>삭제</button> : null}
            <button className="sBtn sColorLG" type="button" onClick={() => { setIsEditorOpen(false); setSelected(null); }}>목록</button>
          </div>
        </form>
        <div className="messageTemplatePreview">
          <h4>내용 미리보기</h4>
          <p>{stripHtml(templateForm.msgContent)}</p>
        </div>
          </section>
        )}
      </section>

      {previewTemplate ? (
        <div className="messageTemplateLvModal" role="dialog" aria-modal="true" aria-labelledby="messageTemplatePreviewTitle">
          <div className="messageTemplateLvModalPanel">
            <header>
              <h3 id="messageTemplatePreviewTitle">상세화면</h3>
              <button type="button" onClick={() => setPreviewTemplate(null)} aria-label="닫기">×</button>
            </header>
            <iframe title="이메일 템플릿 상세화면" sandbox="" srcDoc={previewTemplate.msg_content ?? ''} />
            <div className="messageTemplateLvModalActions">
              <button className="sBtn sColorLG" type="button" onClick={() => setPreviewTemplate(null)}>취소</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
