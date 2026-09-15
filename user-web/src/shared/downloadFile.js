export async function downloadFile(url, headers, fileName) {
  if (!headers.Authorization) {
    throw new Error('로그인이 필요합니다.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  let objectUrl;
  let anchor;
  try {
    const response = await fetch(url, { headers, cache: 'no-store', signal: controller.signal });
    if (!response.ok) {
      if (response.status === 401) throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      if (response.status === 403) throw new Error('파일 다운로드 권한이 없습니다.');
      throw new Error(`파일 다운로드 실패: ${response.status}`);
    }
    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = String(fileName || 'document').replace(/[\\/\x00-\x1f]/g, '_');
    document.body.appendChild(anchor);
    anchor.click();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('다운로드 응답 시간이 초과되었습니다. 다시 시도해 주세요.');
    if (error instanceof TypeError) throw new Error('API 서버에 연결할 수 없습니다. 다시 시도해 주세요.');
    throw error;
  } finally {
    clearTimeout(timeout);
    anchor?.remove();
    // Allow the browser to start consuming the Blob before releasing its URL.
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
  }
}
