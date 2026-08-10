import { useEffect, useState } from 'react';
import {
  createBoardPost,
  deleteBoardPost,
  fetchBoardPost,
  fetchBoardPosts,
  updateBoardPost,
} from '../api/support.js';

const PAGE_SIZE = 20;

const emptyForm = {
  type: 'CUBICI',
  title: '',
  content: '',
  userId: 2,
  operatedBy: 'admin',
};

function initialKindFromPath() {
  return window.location.pathname.includes('/manageBoard_tab2') ? 'faq' : 'notice';
}

function formatDate(value) {
  if (!value) {
    return '-';
  }
  return value.slice(0, 10);
}

export function CustomerBoardPage() {
  const initialKind = initialKindFromPath();
  const [activeKind, setActiveKind] = useState(initialKind);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ order_by: 'reg_date_desc' });
  const [keyword, setKeyword] = useState('');
  const [postForm, setPostForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchBoardPosts(activeKind, { limit: PAGE_SIZE, offset, ...filters });
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

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [activeKind, offset, filters]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  async function reloadList(nextOffset = offset) {
    const data = await fetchBoardPosts(activeKind, { limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }

  function switchKind(nextKind) {
    setActiveKind(nextKind);
    setOffset(0);
    setSelected(null);
    setIsEditorOpen(false);
    setPostForm(emptyForm);
    setFilters({ keyword, order_by: 'reg_date_desc' });
    const nextPath = nextKind === 'faq'
      ? '/admin/cubici/supportMember/manageBoard_tab2'
      : '/admin/cubici/supportMember/manageBoard_tab1';
    window.history.replaceState({}, '', nextPath);
  }

  function updatePostValue(event) {
    const { name, value } = event.target;
    setPostForm((current) => ({ ...current, [name]: name === 'userId' ? Number(value) : value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setIsEditorOpen(false);
    setFilters({
      keyword,
      order_by: 'reg_date_desc',
    });
  }

  function handleNew() {
    setSelected(null);
    setIsEditorOpen(true);
    setPostForm(emptyForm);
    setMessage('');
  }

  async function loadDetail(postId) {
    setMessage('');
    try {
      const data = await fetchBoardPost(activeKind, postId);
      setSelected(data);
      setIsEditorOpen(true);
      setPostForm({
        type: data.type,
        title: data.title,
        content: data.content,
        userId: data.user_id,
        operatedBy: data.last_modified_by ?? data.created_by ?? 'admin',
      });
    } catch (error) {
      setSelected(null);
      setIsEditorOpen(false);
      setMessage(error.message);
    }
  }

  function validateForm() {
    if (!postForm.type || !postForm.title.trim() || !postForm.content.trim()) {
      return '구분, 제목, 내용을 입력하세요.';
    }
    if (postForm.title.length > 50) {
      return '제목은 50자 이내로 입력하세요.';
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
      type: postForm.type,
      title: postForm.title,
      content: postForm.content,
      user_id: postForm.userId,
      operated_by: postForm.operatedBy || 'admin',
    };

    setIsSaving(true);
    setMessage('');
    try {
      const result = selected
        ? await updateBoardPost(activeKind, selected.post_id, payload)
        : await createBoardPost(activeKind, payload);
      setSelected(null);
      setIsEditorOpen(false);
      const data = await fetchBoardPosts(activeKind, { limit: PAGE_SIZE, offset: 0, ...filters });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setOffset(0);
      setMessage(result.action === 'created' ? '게시글을 등록했습니다.' : '게시글을 수정했습니다.');
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
      await deleteBoardPost(activeKind, selected.post_id);
      setSelected(null);
      setIsEditorOpen(false);
      setPostForm(emptyForm);
      setOffset(0);
      await reloadList(0);
      setMessage('게시글을 삭제했습니다.');
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
      <div className="m-tab customerBoardLvTabs">
        <ul>
          <li className={activeKind === 'notice' ? 'active' : ''}>
            <a href="/admin/cubici/supportMember/manageBoard_tab1" onClick={(event) => { event.preventDefault(); switchKind('notice'); }}>
              서비스 공지
            </a>
          </li>
          <li className={activeKind === 'faq' ? 'active' : ''}>
            <a href="/admin/cubici/supportMember/manageBoard_tab2" onClick={(event) => { event.preventDefault(); switchKind('faq'); }}>
              FAQ
            </a>
          </li>
        </ul>
      </div>

      <section className="customerBoardLvPage">
        {message ? <p className={message.includes('실패') || message.includes('입력') ? 'formMessage error' : 'formMessage'}>{message}</p> : null}

        {!isEditorOpen ? (
          <>
            <div className="customerBoardLvToolbar">
              <button className="sBtn sColorLB" type="button" onClick={handleNew}>글쓰기</button>
              <form className="customerBoardLvSearch" onSubmit={handleSearch}>
                <input id="boardKeyword" type="search" aria-label="검색어" placeholder="검색" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                <button className="oiBtn search" type="submit" aria-label="검색">검색</button>
              </form>
            </div>
            <div className="customerBoardLvList">
              <div className="table-scroll">
                <table className={`m-shadowTable customerBoardLvTable ${activeKind === 'notice' ? 'noticeTable' : 'faqTable'}`}>
                  <caption className="caption">{activeKind === 'notice' ? '서비스공지 목록' : 'FAQ 목록'}</caption>
                  <thead>
                    {activeKind === 'notice' ? (
                      <tr><th scope="col">No</th><th scope="col">제목</th><th scope="col">등록일</th><th scope="col">공지사항</th></tr>
                    ) : (
                      <tr><th scope="col">No</th><th scope="col">제목</th><th scope="col">답변</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {isLoading ? <tr><td colSpan={activeKind === 'notice' ? 4 : 3}>조회 중입니다.</td></tr> : null}
                    {!isLoading && items.length === 0 ? <tr><td colSpan={activeKind === 'notice' ? 4 : 3}>조회된 결과가 없습니다.</td></tr> : null}
                    {!isLoading && items.map((item, index) => (
                      <tr key={item.post_id}>
                        <td>{Math.max(total - offset - index, 1)}</td>
                        <td className="subject">
                          <button className="linkButton" type="button" onClick={() => loadDetail(item.post_id)}>{item.title}</button>
                        </td>
                        {activeKind === 'notice' ? <td>{formatDate(item.reg_date)}</td> : null}
                        <td className="customerBoardLvManage">
                          <button className="sBtn sColorLB rBtn" type="button" onClick={() => loadDetail(item.post_id)}>
                            {activeKind === 'notice' ? '공지보기' : '상세보기'}
                          </button>
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
          <section className="customerBoardEditor isOpen messageTemplateEditor">
            <h3>{activeKind === 'notice' ? '서비스 공지' : 'FAQ'} {selected ? '수정' : '등록'}</h3>
            <form className="messageTemplateForm customerBoardLvForm" onSubmit={handleSave}>
          <label>
            작성자
            <input name="operatedBy" type="text" value={postForm.operatedBy} readOnly />
          </label>
          <label>
            구분
            <select name="type" value={postForm.type} onChange={updatePostValue}>
              <option value="CUBICI">큐빅아이</option>
              <option value="MONEY_BANK">머니뱅크</option>
              <option value="SERVICE_USE">서비스 이용</option>
              <option value="OTHER">기타</option>
            </select>
          </label>
          <label>
            제목
            <input name="title" type="text" value={postForm.title} onChange={updatePostValue} />
          </label>
          <label className="messageTemplateContent">
            내용
            <textarea name="content" value={postForm.content} onChange={updatePostValue} rows={8} />
          </label>
          <div className="messageTemplateActions">
            <button className="sBtn sColorLB" type="submit" disabled={isSaving}>{selected ? '수정' : '등록'}</button>
            {selected ? <button className="sBtn sColorR" type="button" onClick={handleDelete} disabled={isSaving}>삭제</button> : null}
            <button className="sBtn sColorLG" type="button" onClick={() => { setIsEditorOpen(false); setSelected(null); }}>목록</button>
          </div>
        </form>
          </section>
        )}
      </section>
    </>
  );
}
