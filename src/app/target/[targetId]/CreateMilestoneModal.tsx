interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  targetId: number;
  currentUser: any;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetId,
  currentUser,
}) => {
  const handleSubmit = async (formData: any) => {
    const {
      owner,
      periodEnd,
      required,
      impactOnTarget,
      status = 'In Progress',
      notes
    } = formData;

    const createdBy = currentUser?.profile?.id;

    if (!owner || !periodEnd || required === undefined || !impactOnTarget || !targetId || !notes || !createdBy) {
      console.error('Missing required inputs');
      // Handle error (e.g., set error state)
      return;
    }

    const milestoneData = {
      owner,
      period_end: periodEnd,
      required,
      impact_on_target: impactOnTarget,
      target_id: targetId,
      status,
      notes,
      created_by: createdBy
    };

    onSubmit(milestoneData);
  };

  return (
    // Your JSX here
    <div>
      {/* Add your modal content */}
    </div>
  );
};