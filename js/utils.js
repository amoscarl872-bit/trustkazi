// Create an element with optional text and class.
// Uses textContent, so any text is treated as plain text (never as HTML).
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}