export const truncateText = (text: string) => {
  return text.length > 200 ? `${text.slice(0, 200).trimEnd()}…` : text;
};
