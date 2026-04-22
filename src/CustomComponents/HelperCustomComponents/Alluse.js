export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[1].charAt(0);
};
export const stripHtmls = (html) => {
  if (html === null || html === undefined) return '';
  const normalized = String(html);
  
  // First, remove HTML tags
  let text = normalized.replace(/<[^>]*>/g, '');
  
  // Then decode HTML entities (like &quot;, &#39;, &amp;, etc.)
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  text = textarea.value;
  
  return text;
};

export const stripHtml = (html) => {
  if (html === null || html === undefined) return '';
  const normalized = String(html);
  
  // First, remove HTML tags
  let text = normalized.replace(/<[^>]*>/g, '');
  
  // Then decode HTML entities (like &quot;, &#39;, &amp;, etc.)
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  text = textarea.value;
  
  return text;
};