const routeRows = [
  {
    id: 'implemented',
    label: '구현 산정',
    status: '제외',
    message: '이 route는 관리자단 구현 완료율에 포함하지 않습니다.',
  },
  {
    id: 'fallback',
    label: 'Fallback 정책',
    status: '오판 방지',
    message: '다른 구현 메뉴로 자동 대체하지 않고 미구현 경로로 표시합니다.',
  },
  {
    id: 'next',
    label: '다음 조치',
    status: '확인 필요',
    message: 'legacy route alias 또는 2차/후순위 범위 여부를 문서에서 확정합니다.',
  },
];

export function MigrationRouteStatusPage({ categoryTitle, pageTitle, legacyPath, currentPath }) {
  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="#route-fallback-status">{pageTitle}</a>
          </li>
        </ul>
      </div>

      <section className="migrationStatusPanel" id="route-fallback-status">
        <table className="detailInfoTable">
          <caption className="caption">관리자 메뉴 연결 상태</caption>
          <tbody>
            <tr>
              <th scope="row">메뉴그룹</th>
              <td>{categoryTitle}</td>
              <th scope="row">메뉴명</th>
              <td>{pageTitle}</td>
            </tr>
            <tr>
              <th scope="row">Legacy 경로</th>
              <td>{legacyPath}</td>
              <th scope="row">현재 경로</th>
              <td>{currentPath}</td>
            </tr>
            <tr>
              <th scope="row">구현 상태</th>
              <td>미구현 또는 route alias 미매핑</td>
              <th scope="row">진행률 산정</th>
              <td>제외</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="detailSection">
        <h3>Route Fallback 점검</h3>
        <div className="table-scroll">
          <table className="m-shadowTable routeStatusTable">
            <caption className="caption">미구현 route 표시 정책</caption>
            <thead>
              <tr>
                <th scope="col">항목</th>
                <th scope="col">상태</th>
                <th scope="col">확인</th>
              </tr>
            </thead>
            <tbody>
              {routeRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>{row.status}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
