function truncate(str, maxlength) {
if (str.length > maxlength) {
  return str.slice(0, maxlength - 1) + '…';
}
if (str.length < maxlength) {
  return str;
}
}