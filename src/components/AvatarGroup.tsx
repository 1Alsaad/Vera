// src/components/AvatarGroup.tsx

 import React, { useState } from 'react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import Modal from '@/components/ui/modal';

 interface AvatarGroupProps {
   users: { id: string; firstname: string; lastname: string }[];
 }

 const AvatarGroup: React.FC<AvatarGroupProps> = ({ users }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);

   const toggleModal = () => setIsModalOpen(!isModalOpen);

   return (
     <>
       <div className="flex -space-x-2" onClick={toggleModal}>
         {users.map((user) => (
           <Avatar key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
             <AvatarImage src={`https://avatar.vercel.sh/${user.id}.png`} alt={`${user.firstname} ${user.lastname}`} />
             <AvatarFallback>{user.firstname[0]}{user.lastname[0]}</AvatarFallback>
           </Avatar>
         ))}
       </div>
       <Modal isOpen={isModalOpen} onClose={toggleModal} users={users} />
     </>
   );
 };

 export default AvatarGroup;
