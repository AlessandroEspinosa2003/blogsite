import PostListPublic from '@/components/PostListPublic';
import HeaderPublic from '@/components/HeaderPublic';

// --- src/pages/index.tsx ---
const Home = () => {
  return (
    <>
      <main>
        <HeaderPublic />
        <PostListPublic />
      </main>
    </>
  );
};

export default Home;
