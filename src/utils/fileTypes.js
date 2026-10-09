// Light helpers (no three.js) so the main bundle stays small.
export const ACCEPTED_EXTENSIONS = ['stl', '3mf', 'obj', 'step', 'stp'];
export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',');
export const getExtension = (name) => (name.split('.').pop() || '').toLowerCase();
