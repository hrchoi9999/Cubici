import { useEffect, useState } from 'react';
import { fetchServerStatus } from '../api/monitoring.js';

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function statusClass(status) {
  if (!status) {
    return '';
  }
  if (status === '정상') {
    return 'sColorLS';
  }
  if (status === '주의') {
    return 'sColorY';
  }
  return 'sColorR';
}

export function ServerMonitorPage() {
  const [hours, setHours] = useState('24');
  const [status, setStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchServerStatus({ hours });
        if (!ignore) {
          setStatus(data);
        }
      } catch (error) {
        if (!ignore) {
          setStatus(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      ignore = true;
    };
  }, [hours, refreshKey]);

  return (
    <section className="adminPage monitoringPage serverMonitorPage">
      <form className="m-search searchArea monitoringFilterBar" onSubmit={(event) => event.preventDefault()}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="serverMonitorHours">조회범위</label>
            <select id="serverMonitorHours" name="hours" value={hours} onChange={(event) => setHours(event.target.value)}>
              <option value="1">최근 1시간</option>
              <option value="6">최근 6시간</option>
              <option value="24">최근 24시간</option>
              <option value="72">최근 72시간</option>
              <option value="168">최근 7일</option>
            </select>
          </div>
          <button type="button" className="sBtn sColorLB" onClick={() => setRefreshKey((value) => value + 1)}>새로고침</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="serverMonitorSummary" aria-label="서버 운영 요약">
        <div>
          <span>종합 상태</span>
          <strong className={statusClass(status?.overall_status)}>
            {status?.overall_status ?? (isLoading ? '조회 중' : '-')}
          </strong>
        </div>
        <div>
          <span>정상 처리</span>
          <strong>{status?.recent_success_count?.toLocaleString() ?? 0}건</strong>
        </div>
        <div>
          <span>실패 발생</span>
          <strong>{status?.recent_fail_count?.toLocaleString() ?? 0}건</strong>
        </div>
        <div>
          <span>최종 확인</span>
          <strong>{formatDateTime(status?.checked_at)}</strong>
        </div>
      </div>

      <div className="serverStatusGrid">
        {(status?.metrics ?? []).map((metric) => (
          <div className="serverStatusCard" key={metric.name}>
            <div className="serverStatusCardHeader">
              <h4>{metric.name}</h4>
              <span className={`sBtn ${statusClass(metric.status)} rBtn`}>{metric.status}</span>
            </div>
            <strong>{metric.value}</strong>
            <dl>
              <div>
                <dt>점검 기준</dt>
                <dd>{metric.note ?? '-'}</dd>
              </div>
              <div>
                <dt>조치 안내</dt>
                <dd>{metric.action_label ?? '-'}</dd>
              </div>
            </dl>
            <small>확인 {formatDateTime(metric.checked_at)}</small>
          </div>
        ))}
        {isLoading ? <div className="serverStatusEmpty">서버 상태를 조회 중입니다.</div> : null}
        {!isLoading && !message && !status ? <div className="serverStatusEmpty">조회된 서버 상태가 없습니다.</div> : null}
      </div>

      <div className="serverStatusPanel">
        <h4 className="monitoringSectionTitle" id="serverMonitorCriteriaTitle">점검 기준</h4>
        <div className="tableScroll">
          <table className="legacyTable serverStatusTable" aria-labelledby="serverMonitorCriteriaTitle">
            <thead>
              <tr>
                <th>점검 항목</th>
                <th>확인 기준</th>
                <th>데이터 원본</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>API 서버</td>
                <td>관리자 모니터링 API 응답 여부</td>
                <td>FastAPI 자체 점검</td>
              </tr>
              <tr>
                <td>PostgreSQL</td>
                <td>DB 연결 및 현재 시각 조회 여부</td>
                <td>PostgreSQL 연결</td>
              </tr>
              <tr>
                <td>배치 성공</td>
                <td>선택 조회범위 내 정상 실행 건수</td>
                <td>배치 실행 이력</td>
              </tr>
              <tr>
                <td>배치 실패</td>
                <td>선택 조회범위 내 오류 발생 건수</td>
                <td>Error Log</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
