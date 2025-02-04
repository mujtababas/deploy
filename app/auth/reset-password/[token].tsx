import { useState } from 'react';
import { toast } from 'sonner';

export default function NewPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Assuming token is passed as a query parameter
        const token = window.location.pathname.split('/').pop();

        const response = await fetch(`/api/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();
        if (response.ok) {
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
            />
            <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
    );
}
