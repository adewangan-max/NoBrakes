import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const rawId = resolvedParams.id as string;
  const uuidMatch = rawId ? rawId.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/) : null;
  const id = uuidMatch ? uuidMatch[0] : null;

  if (!id) return { title: 'Post Not Found' };

  const { data: post } = await supabase.from('posts').select('title, content, tags').eq('id', id).single();

  if (!post) {
    return { title: 'Post Not Found' };
  }

  // Extract keywords from content and tags
  const contentWords = (post.content || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const stopWords = new Set(["the","and","a","to","of","in","i","is","that","it","on","you","this","for","but","with","are","have","be","at","or","as","was","so","if","out","not"]);
  const keywordSet = new Set(contentWords.filter((w: string) => w.length > 3 && !stopWords.has(w)).slice(0, 15));
  
  if (post.tags) {
    post.tags.forEach((t: string) => keywordSet.add(t.toLowerCase()));
  }

  const keywords = Array.from(keywordSet).join(', ');
  const description = post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '');

  return {
    title: post.title,
    description: description,
    keywords: keywords,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
    },
  };
}

export default async function PostLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id as string;
  const uuidMatch = rawId ? rawId.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/) : null;
  const id = uuidMatch ? uuidMatch[0] : null;

  let post = null;
  let keywords = '';

  if (id) {
    const { data } = await supabase.from('posts').select('title, content, tags').eq('id', id).single();
    post = data;
    
    if (post) {
      const contentWords = (post.content || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      const stopWords = new Set(["the","and","a","to","of","in","i","is","that","it","on","you","this","for","but","with","are","have","be","at","or","as","was","so","if","out","not"]);
      const keywordSet = new Set(contentWords.filter((w: string) => w.length > 3 && !stopWords.has(w)).slice(0, 15));
      if (post.tags) {
        post.tags.forEach((t: string) => keywordSet.add(t.toLowerCase()));
      }
      keywords = Array.from(keywordSet).join(', ');
    }
  }

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "articleBody": post.content,
              "keywords": keywords,
            })
          }}
        />
      )}
      {children}
    </>
  );
}
