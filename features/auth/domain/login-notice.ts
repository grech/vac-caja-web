const LOGIN_NOTICES: Record<string, string> = {
  "session-expired": "Tu sesión terminó. Inicia sesión nuevamente.",
};

export function getLoginNotice(requestedNotice?: string | string[]) {
  const noticeKey = Array.isArray(requestedNotice)
    ? requestedNotice[0]
    : requestedNotice;

  return noticeKey ? LOGIN_NOTICES[noticeKey] : undefined;
}
