export const fetchWithTime = async (...args: Parameters<typeof fetch>) => {
  return fetch(args[0], {
    ...args[1],
    headers: {
      ...args[1]?.headers,
      "x-fetch-time": new Date().toISOString(),
      "x-fetch-local-date": new Date().toLocaleDateString(),
    },
  });
};
