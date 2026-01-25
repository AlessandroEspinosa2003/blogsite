import { useState, useEffect } from 'react';
import { Database } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { Post } from '@/types/Post';
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const useGetPosts = () => {
  // Retrieve Supabase client
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const id: string = uuidv4();

  // Initialize posts state
  const [posts, setPosts] = useState<Post[]>([]);

  // Retrieve posts from the database
  const getPosts = async (limit?: number) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(limit || 50);
    if (error) throw error;
    setPosts(data || []);
  };

  // Create a new post in the database
  const createPost = async (title: string, body: string) => {
    if (!user) throw new Error('User not found');
    const { data, error } = await supabase
      .from('posts')
      .insert({
        id,
        title,
        body,
        author: user.id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // Update an existing post in the database
  const updatePost = async (id: string, title: string, body: string) => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        body,
      })
      .match({ id })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  return {
    getPosts,
    updatePost,
    createPost,
    posts,
  };
};

export default useGetPosts;
