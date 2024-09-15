// src/components/AvatarGroup.tsx

 import React, { useState } from 'react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

 interface AvatarGroupProps {
   users: { id: string; firstname: string; lastname: string }[];
   onAddOwner?: (userId: string) => void;
   onRemoveOwner?: (userId: string) => void;
 }

 const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, onAddOwner, onRemoveOwner }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);

   const toggleModal = () => setIsModalOpen(!isModalOpen);

   return (
     <>
       <div className="flex -space-x-2 cursor-pointer" onClick={toggleModal}>
         {users.map((user) => (
           <div key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white mr-2">
             <Avatar>
               <AvatarImage src={`https://avatar.vercel.sh/${user.id}.png`} alt={`${user.firstname} ${user.lastname}`} />
               <AvatarFallback>{user.firstname[0]}{user.lastname[0]}</AvatarFallback>
             </Avatar>
           </div>
         ))}
       </div>
       {isModalOpen && (
         <div className="fixed inset-0 flex items-center justify-center z-50">
           <Card className="bg-white p-6 rounded-lg shadow-lg">
             <CardHeader>
               <CardTitle className="text-xl font-bold mb-4">People from the Same Company</CardTitle>
             </CardHeader>
             <CardContent>
               <ul>
                 {users.map((user) => (
                   <li key={user.id} className="flex items-center justify-between mb-2">
                     <span>{user.firstname} {user.lastname}</span>
                     <div>
                       {onAddOwner && (
                         <button onClick={() => onAddOwner(user.id)} className="px-2 py-1 bg-green-500 text-white rounded mr-2">
                           Add
                         </button>
                       )}
                       {onRemoveOwner && (
                         <button onClick={() => onRemoveOwner(user.id)} className="px-2 py-1 bg-red-500 text-white rounded">
                           Remove
                         </button>
                       )}
                     </div>
                   </li>
                 ))}
               </ul>
               <button onClick={toggleModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                 Close
               </button>
             </CardContent>
           </Card>
         </div>
       )}
     </>
   );
 };

 export default AvatarGroup;
