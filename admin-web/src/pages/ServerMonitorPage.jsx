import { useEffect, useState } from 'react';
import { fetchServerStatus } from '../api/monitoring.js';

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function statusClass(status) {
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
    <section className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h2>모니터링</h2>
          <p>API, PostgreSQL, 배치 실행 상태를 점검합니다.</p>
        </div>
        <div className="summaryPills">
          <span>상태 {status?.overall_status ?? (isLoading ? '조회 중' : '-')}</span>
          <span>{status?.metric_source_label ?? 'FastAPI/DB/배치 로그 기반'}</span>
          <span>{status?.metric_source_status_label ?? '외부 서버 metric 미연동'}</span>
          <span>{status?.follow_up_action_label ?? '-'}</span>
          <span>성공 {status?.recent_success_count?.toLocaleString() ?? 0}건</span>
          <span>실패 {status?.recent_fail_count?.toLocaleString() ?? 0}건</span>
          <span>확인 {formatDateTime(status?.checked_at)}</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a href="/admin/cubici/adminMonitor/error_report">Error Log</a>
        <a className="active" href="/admin/cubici/adminMonitor/server_monitor">서버 관리</a>
        <a href="/admin/cubici/adminMonitor/fintech_trade">펌뱅킹 전문</a>
      </div>

      <form className="legacySearchBox" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>조회범위</span>
          <select name="hours" value={hours} onChange={(event) => setHours(event.target.value)}>
            <option value="1">최근 1시간</option>
            <option value="6">최근 6시간</option>
            <option value="24">최근 24시간</option>
            <option value="72">최근 72시간</option>
            <option value="168">최근 7일</option>
          </select>
        </label>
        <button type="button" className="primaryButton" onClick={() => setRefreshKey((value) => value + 1)}>새로고침</button>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="serverStatusGrid">
        {(status?.metrics ?? []).map((metric) => (
          <div className="serverStatusCard" key={metric.name}>
            <div className="serverStatusCardHeader">
              <h4>{metric.name}</h4>
              <span className={`sBtn ${statusClass(metric.status)} rBtn`}>{metric.status}</span>
            </div>
            <strong>{metric.value}</strong>
            <p>{metric.note ?? '-'}</p>
            <p>{metric.source_label ?? '-'}</p>
            <p>{metric.action_label ?? '-'}</p>
            <small>{formatDateTime(metric.checked_at)}</small>
          </div>
        ))}
        {isLoading ? <div className="serverStatusEmpty">서버 상태를 조회 중입니다.</div> : null}
        {!isLoading && !message && !status ? <div className="serverStatusEmpty">조회된 서버 상태가 없습니다.</div> : null}
      </div>

      <div className="serverStatusPanel">
        <h4>점검 기준</h4>
        <table className="legacyTable serverStatusTable">
          <tbody>
            <tr>
              <th>Metric Source</th>
              <td>현재는 FastAPI self-check, PostgreSQL 연결, `cbci_scheduled_report`, `cbci_err_report` 기준이다. 외부 서버 metric은 2차 연동 범위다.</td>
            </tr>
            <tr>
              <th>API 서버</th>
              <td>FastAPI `/v1/api/monitoring/server-status` 응답 기준</td>
            </tr>
            <tr>
              <th>PostgreSQL</th>
              <td>DB 연결 후 `select now()` 실행 기준</td>
            </tr>
            <tr>
              <th>배치 성공</th>
              <td>`cbci_scheduled_report`의 최근 실행 건수 기준</td>
            </tr>
            <tr>
              <th>배치 실패</th>
              <td>`cbci_err_report`의 최근 실패 건수 기준</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
