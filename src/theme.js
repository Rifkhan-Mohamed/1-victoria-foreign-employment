// Apply the stored theme before first paint; storage may be unavailable.
try {
  var theme = localStorage.getItem('vt');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (error) { /* The default light theme remains usable. */ }
