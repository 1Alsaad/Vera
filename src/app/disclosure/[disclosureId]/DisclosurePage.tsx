import * as DisclosureDetailsPage from './page';
import { Avatar, AvatarGroup } from '@chakra-ui/react';

export default function DisclosurePage() {
  return (
    <div>
      <button>Assign Owner</button>
      <AvatarGroup size="md" max={3}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
      </AvatarGroup>
    </div>
  );
}
