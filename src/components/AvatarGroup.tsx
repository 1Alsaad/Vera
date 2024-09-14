// src/components/AvatarGroup.tsx

 import React from 'react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

 interface AvatarGroupProps {
   users: { id: string; firstname: string; lastname: string }[];
 }

 const AvatarGroup: React.FC<AvatarGroupProps> = ({ users }) => {
   return (
     <div className="flex -space-x-2">
       {users.map((user) => (
         <Avatar key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
           <AvatarImage src={`https://avatar.vercel.sh/${user.id}.png`} alt={`${user.firstname} ${user.lastname}`} />
           <AvatarFallback>{user.firstname[0]}{user.lastname[0]}</AvatarFallback>
         </Avatar>
       ))}
     </div>
   );
 };

 export default AvatarGroup;