'use client';

import { useState } from 'react';
import { SampleWork } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SampleWorksList } from './sample-works-list';
import { SampleWorkModal } from './sample-work-modal';

interface SampleWorksListWithModalProps {
  samples: SampleWork[];
}

export function SampleWorksListWithModal({ samples }: SampleWorksListWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<SampleWork | undefined>();

  const handleOpenModal = (sample?: SampleWork) => {
    setEditingSample(sample);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSample(undefined);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => handleOpenModal()} className="font-nunito">
          <Plus className="w-4 h-4 mr-2" />
          Add Sample
        </Button>
      </div>

      <SampleWorksList samples={samples} onEdit={handleOpenModal} />

      {isModalOpen && (
        <SampleWorkModal sampleWork={editingSample} onClose={handleCloseModal} />
      )}
    </>
  );
}