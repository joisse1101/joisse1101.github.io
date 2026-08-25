import { Modal } from '@/components/Modal';
import React, { useRef, useEffect } from 'react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export const DeleteGoalModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onDelete
}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);


    return (
        <Modal
            isOpen={isOpen}
            onSubmit={onDelete}
            onClose={onClose}
            title={'Delete Goal'}
            modalType="destructive"
            buttonText={{ primary: 'Delete', secondary: 'Cancel' }}
        >
            <div className='form-container'>
                <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
            </div>
        </Modal>
    );
};