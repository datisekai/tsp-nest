export const getSecretKey = (description: string) => {
  const regex = /KEY\w+/;
  const match = description.match(regex);
  // Extract the key if it matches the pattern
  if (match && match[0]) {
    const key = match[0];
    return key.slice(3);
  }
  return '';
};
