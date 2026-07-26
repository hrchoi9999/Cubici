import { useEffect, useMemo, useState } from 'react';
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

function stripHtml(value) {
  if (!value) {
    return '-';
  }
  return value.replace(/<[^>]*>/g, '').trim() || '-';
}

export function CustomerBoardPage() {
  const initialKind = initialKindFromPath();
  const [activeKind, setActiveKind] = useState(initialKind);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [boardPolicy, setBoardPolicy] = useState({ attachment: '첨부 미연동', exposure: '노출정책 확인' });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ order_by: 'reg_date_desc' });
  const [formValues, setFormValues] = useState({ keyword: '', postType: '', orderBy: 'reg_date_desc' });
  const [postForm, setPostForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
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
          setBoardPolicy({
            attachment: data.attachment_status_label ?? '첨부 미연동',
            exposure: data.exposure_policy_status_label ?? '노출정책 확인',
          });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setBoardPolicy({ attachment: '첨부 미연동', exposure: '노출정책 확인' });
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

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function reloadList(nextOffset = offset) {
    const data = await fetchBoardPosts(activeKind, { limit: PAGE_SIZE, offset: nextOffset, ...filters });
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setBoardPolicy({
      attachment: data.attachment_status_label ?? '첨부 미연동',
      exposure: data.exposure_policy_status_label ?? '노출정책 확인',
    });
  }

  function switchKind(nextKind) {
    setActiveKind(nextKind);
    setOffset(0);
    setSelected(null);
    setPostForm(emptyForm);
    setFilters({ keyword: formValues.keyword, post_type: formValues.postType, order_by: formValues.orderBy });
  }

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updatePostValue(event) {
    const { name, value } = event.target;
    setPostForm((current) => ({ ...current, [name]: name === 'userId' ? Number(value) : value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      keyword: formValues.keyword,
      post_type: formValues.postType,
      order_by: formValues.orderBy,
    });
  }

  function handleNew() {
    setSelected(null);
    setPostForm(emptyForm);
    setMessage('');
  }

  async function loadDetail(postId) {
    setMessage('');
    try {
      const data = await fetchBoardPost(activeKind, postId);
      setSelected(data);
      setPostForm({
        type: data.type,
        title: data.title,
        content: data.content,
        userId: data.user_id,
        operatedBy: data.last_modified_by ?? data.created_by ?? 'admin',
      });
    } catch (error) {
      setSelected(null);
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
      setSelected(result.post);
      await reloadList();
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
      <div className="m-tab">
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

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="boardKeyword">검색</label>
            <input id="boardKeyword" name="keyword" type="text" value={formValues.keyword} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="boardPostType">구분</label>
            <select id="boardPostType" name="postType" value={formValues.postType} onChange={updateSearchValue}>
              <option value="">전체</option>
              <option value="CUBICI">큐빅아이</option>
              <option value="MONEY_BANK">머니뱅크</option>
              <option value="SERVICE_USE">서비스 이용</option>
              <option value="OTHER">기타</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="boardOrderBy">정렬</label>
            <select id="boardOrderBy" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
              <option value="reg_date_desc">최근 순</option>
              <option value="reg_date_asc">과거 순</option>
            </select>
          </div>
          <button className="sBtn sColorLB" type="submit">검색</button>
          <button className="sBtn sColorLG" type="button" onClick={handleNew}>글쓰기</button>
        </div>
      </form>

      {message ? <p className={message.includes('실패') || message.includes('입력') ? 'formMessage error' : 'formMessage'}>{message}</p> : null}

      <section className="detailSection">
        <div className="summaryStrip inquirySummary">
          <span>{activeKind === 'notice' ? '서비스 공지' : 'FAQ'} {total.toLocaleString('ko-KR')}건</span>
          <span>{boardPolicy.attachment}</span>
          <span>{boardPolicy.exposure}</span>
        </div>
        <div className="table-scroll">
          <table className="m-shadowTable customerBoardTable">
            <caption className="caption">고객 공지 관리 목록</caption>
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">구분</th>
                <th scope="col">제목</th>
                <th scope="col">노출</th>
                <th scope="col">첨부</th>
                <th scope="col">등록일</th>
                <th scope="col">보기</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="7">조회 중입니다.</td></tr> : null}
              {!isLoading && rows.length === 0 ? <tr><td colSpan="7">조회된 결과가 없습니다.</td></tr> : null}
              {!isLoading && rows.map((item, index) => (
                <tr key={item.post_id}>
                  <td>{offset + index + 1}</td>
                  <td>{item.type_label}</td>
                  <td className="subject">
                    <button className="linkButton" type="button" onClick={() => loadDetail(item.post_id)}>
                      {item.title}
                    </button>
                  </td>
                  <td>{item.exposure_status_label ?? '상시노출'}</td>
                  <td>{item.attachment_status_label ?? '첨부 미연동'}</td>
                  <td>{formatDate(item.reg_date)}</td>
                  <td>
                    <button className="sBtn sColorLB rBtn" type="button" onClick={() => loadDetail(item.post_id)}>
                      {activeKind === 'notice' ? '공지보기' : '상세보기'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagingControls">
          <button className="sBtn sColorN" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
          <span>{currentPage} / {pageCount}</span>
          <button className="sBtn sColorN" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
        </div>
      </section>

      <section className="detailSection customerBoardEditor">
        <h3>{selected ? '게시글 수정' : '게시글 등록'}</h3>
        <form className="messageTemplateForm" onSubmit={handleSave}>
          <label>
            작성자
            <input name="operatedBy" type="text" value={postForm.operatedBy} onChange={updatePostValue} />
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
          </div>
        </form>
        <div className="messageTemplatePreview">
          <h4>내용 미리보기</h4>
          <div className="summaryPills">
            <span>{selected?.exposure_status_label ?? '상시노출'}</span>
            <span>{selected?.attachment_status_label ?? '첨부 미연동'}</span>
            <span>{selected?.policy_status_label ?? '노출정책 확인'}</span>
          </div>
          <p>{stripHtml(postForm.content)}</p>
        </div>
      </section>
    </>
  );
}
