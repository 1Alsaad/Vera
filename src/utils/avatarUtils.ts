 // src/utils/avatarUtils.ts

 import { createClient } from '@supabase/supabase-js';

 const supabaseUrl = 'https://tmmmdyykqbowfywwrwvg.supabase.co';
 const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const supabase = createClient(supabaseUrl, supabaseKey!);

 export const getUserIds = async (taskId: number) => {
   try {
     const { data, error } = await supabase
       .from('task_owners')
       .select('user_id')
       .eq('task_id', taskId);

     if (error) {
       console.error('Error fetching user IDs:', error.message);
       throw new Error(`Error fetching user IDs: ${error.message}`);
     }

     return data.map(item => item.user_id);
   } catch (error) {
     console.error('Error:', error.message);
     throw error;
   }
 };

 export const getUserProfile = async (userId: string) => {
   try {
     const { data, error } = await supabase
       .from('profiles')
       .select('firstname, lastname, company')
       .eq('id', userId)
       .single();

     if (error) {
       console.error('Error fetching user profile:', error.message);
       throw new Error(`Error fetching user profile: ${error.message}`);
     }

     return data;
   } catch (error) {
     console.error('Error:', error.message);
     throw error;
   }
 };

 export const generateAvatarSignedURLs = async (bucketName: string, filePaths: string[], expiresIn: number) => {
   try {
     const { data, error } = await supabase
       .storage
       .from(bucketName)
       .createSignedUrls(filePaths, expiresIn);

     if (error) {
       console.error('Error generating signed URLs:', error.message);
       throw new Error(`Error generating signed URLs: ${error.message}`);
     }

     return data.map(item => item.signedUrl);
   } catch (error) {
     console.error('Error generating signed URLs:', error.message);
     throw error;
   }
 };

 export const getAvatarURLs = async (taskId: number) => {
   try {
     const userIds = await getUserIds(taskId);
     if (!userIds || userIds.length === 0) return [];

     const userProfiles = await Promise.all(userIds.map(userId => getUserProfile(userId)));
     if (!userProfiles || userProfiles.length === 0) return [];

     const filePaths = userProfiles.map(profile => {
       const { firstname, lastname, company } = profile;
       const fullName = `${firstname} ${lastname}`;
       return `avatars/${fullName}.png`;
     });

     const expiresIn = 60; // URLs expire in 60 seconds
     const avatarSignedURLs = await generateAvatarSignedURLs(userProfiles[0].company, filePaths, expiresIn);

     return avatarSignedURLs;
   } catch (error) {
     console.error('Error:', error.message);
     throw error;
   }
 };