import React, { useRef, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title = '',
    children,
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

    // Prevent closing on ESC key press to keep modal strictly modal
    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
        e.preventDefault();
    };

    return (
        <dialog
            ref={dialogRef}
            onCancel={handleCancel}
            className="modal"
        >
            <div className="modal-container">
                {/* Header */}
                <header className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </header>

                {/* Body */}
                <div className="modal-body">
                    {children || (
                        <p>Set up your targets and parameters for this goal.</p>
                    )}
                </div>

                {/* Footer */}
                <footer className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            // Custom action here
                            onClose();
                        }}
                    >
                        Save Changes
                    </button>
                </footer>
            </div>
        </dialog>
    );
};