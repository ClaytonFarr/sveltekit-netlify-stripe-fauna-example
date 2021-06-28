export default function autoFocusFirstChildInput(node, delay = 100) {
  const input = node.querySelector('input, textarea, select');
  input.classList.add('autofocused');
  setTimeout(() => input.focus(), delay);
}
