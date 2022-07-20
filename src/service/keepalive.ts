import type { User } from "firebase/auth";

export const setKeepAliveInterval = async (
  user: User,
  endpoints: string[],
  _fetch = fetch
) => {
  const query = new URLSearchParams({ keepAlive: "true" });
  const sendKeepAlive = async () => {
    const idToken = await user.getIdToken();
    await Promise.all(
      endpoints.map((endpoint) =>
        _fetch(`${endpoint}?${query}`, {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        })
      )
    );
  };
  await sendKeepAlive();
  return setInterval(sendKeepAlive, 60000);
};
