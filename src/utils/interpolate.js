export function fill(template, values = {}) {
  if (!template) return '';
  return Object.entries(values).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), val ?? ''),
    template
  );
}
