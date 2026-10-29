
'use server';

export async function checkNote(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const tagsInput = String(formData.get('tags') ?? '');

  if (!title || !body) {
    return {
      error: 'Please enter both a title and note content.',
    };
  }

  const tags = [...new Set(
    tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )];

  return {
    note: {
      id: crypto.randomUUID(),
      title,
      body,
      tags,
    },
  };
}
