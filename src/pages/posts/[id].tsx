import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import Header from '@/components/Header';
import PostEditForm from '@/components/PostEditForm';
import usePosts from '@/hooks/usePosts';
import { Post } from '@/types/Post';

// ✅ SSR client (Pages Router compatible)
import { createServerClient } from '@supabase/ssr';
import { parseCookies, setCookie } from 'nookies';

type Props = {
  post: Post;
};

const PostPage = ({ post }: Props) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { updatePost } = usePosts();

  const handleSubmit = async (title: string, body: string) => {
    await updatePost(post.id, title, body);
    setIsEditing(false);
    router.reload();
  };

  // NOTE: this assumes your Header handles session UI.
  // If you need "only author can edit", you can re-add session logic here later.
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content="Blog post" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <Header />
        <Container>
          <Link href="/" legacyBehavior>
            <Button variant="link">{'<'}Back to all posts</Button>
          </Link>

          {isEditing ? (
            <PostEditForm post={post} saveForm={handleSubmit} />
          ) : (
            <>
              <h1>{post.title}</h1>
              <div>{post.body}</div>

              {/* temporary: show edit button unconditionally
                  Add auth check back once you have session in place */}
              <Button onClick={() => setIsEditing(true)}>Edit post</Button>
            </>
          )}
        </Container>
      </main>
    </>
  );
};

export default PostPage;

// ✅ Required by Next.js Pages Router
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const cookies = parseCookies(ctx);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookies[name];
        },
        set(name, value, options) {
          setCookie(ctx, name, value, options);
        },
        remove(name, options) {
          setCookie(ctx, name, '', { ...options, maxAge: -1 });
        },
      },
    }
  );

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('id', ctx.params?.id)
    .single();

  if (!data) return { notFound: true };

  return { props: { post: data } };
};
