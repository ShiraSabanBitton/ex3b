// Authors: Shira Saban Bitton - 316511658, Fida Rabah - 204647911
// Date: 2024-07-02
// Description: JavaScript for handling login and registration for the task manager application.

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');

    // Handle form submission for login/registration
    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'tasks.html';
                } else {
                    alert('Login failed');
                }
            });
    });
});
