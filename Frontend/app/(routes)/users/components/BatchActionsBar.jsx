import { useEffect } from 'react';

export default function BatchActionsBar({ selectedCount, onChangePassword, onDelete }) {
    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = e.target.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
            
            if (e.key.toLowerCase() === "c") {
                e.preventDefault();
                onChangePassword();
            } else if (e.key.toLowerCase() === "d") {
                e.preventDefault();
                onDelete();
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onChangePassword, onDelete]);

    return (
        <div className="fixed bottom-0 left-0 right-0 mx-auto flex w-fit items-center space-x-3 rounded-full border bg-gray-800 px-4 py-2 text-white font-medium shadow z-50">
            <p className="select-none">
                {selectedCount} usuarios seleccionados
            </p>
            <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
            <button
                type="button"
                className="inline-flex items-center gap-2 hover:text-gray-300"
                onClick={onChangePassword}
            >
                Cambiar contraseña
                <span className="flex items-center space-x-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                        ⌘
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                        C
                    </span>
                </span>
            </button>

            <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
            <button
                type="button"
                className="inline-flex items-center gap-2 hover:text-gray-300"
                onClick={onDelete}
            >
                Eliminar
                <span className="flex items-center space-x-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                        ⌘
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                        D
                    </span>
                </span>
            </button>
        </div>
    );
}
