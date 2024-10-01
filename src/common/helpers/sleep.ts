export const sleep = (ms: number) => {
  return new Promise((rs, rj) => {
    setTimeout(rs, ms);
  });
};
