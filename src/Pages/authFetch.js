// Simple fetch wrapper – 401 → login page
export const authFetch = async (url, init = {}) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ?? "",
      ...init.headers,
    },
  });

  if (res.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorised");
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res;
};