export const getUidFromBase64 = (idTokenBase64: string): string => {
  const idToken = Buffer.from(idTokenBase64, "base64").toString();
  const decodedToken = JSON.parse(idToken);
  if (typeof decodedToken.sub !== "string") {
    console.error(idToken);
    throw new Error("Invalid idToken");
  }
  return decodedToken.sub;
};
