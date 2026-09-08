import React, { useEffect, useState } from 'react';

export default function StudentsTable() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/students')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                return response.json();
            })
            .then((data) => {
                setStudents(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load students');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading students...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Students from Database</h2>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.course}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}