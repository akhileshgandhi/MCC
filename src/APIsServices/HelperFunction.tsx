export const stripHtml = (html) => {
  if (typeof html !== 'string') return html || '';
  
  // First, remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Then decode HTML entities (like &quot;, &#39;, &amp;, etc.)
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  text = textarea.value;
  
  return text;
};