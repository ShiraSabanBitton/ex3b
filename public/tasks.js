// Authors: Shira Saban Bitton - 316511658, Fida Rabah - 204647911
// Date: 2024-07-02
// Description: JavaScript for handling task operations in the task manager application, including adding, deleting, and reordering tasks.

document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const logoutButton = document.getElementById('logout');

    // Check if user is logged in
    fetch('/checkAuth', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (!data.isAuthenticated) {
                window.location.href = 'login.html';
            } else {
                loadTasks();
            }
        });

    // Handle form submission to add a new task
    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        const task = document.getElementById('task-input').value;

        if (!task) return;

        fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addTaskToList(data.task);
                    document.getElementById('task-input').value = '';
                } else {
                    alert('Failed to add task');
                }
            });
    });

    // Handle logout
    logoutButton.addEventListener('click', () => {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'login.html';
                }
            });
    });

    // Load tasks from the server
    const loadTasks = () => {
        fetch('/tasks', { credentials: 'include' })
            .then(response => response.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => addTaskToList(task));
            });
    };

    // Add a task to the task list in the UI
    const addTaskToList = (task) => {
        const li = document.createElement('li');
        li.textContent = task.text;
        li.setAttribute('draggable', 'true');
        li.dataset.id = task.id;

        // Create and add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            fetch(`/tasks/${task.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        taskList.removeChild(li);
                    } else {
                        alert('Failed to delete task');
                    }
                });
        });

        li.appendChild(deleteButton);

        // Handle drag and drop events
        li.addEventListener('dragstart', () => {
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            const taskIds = [...taskList.querySelectorAll('li')].map(li => li.dataset.id);
            fetch('/tasks/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskIds }),
                credentials: 'include'
            });
        });

        taskList.appendChild(li);
    };

    // Handle drag over event for reordering tasks
    taskList.addEventListener('dragover', event => {
        event.preventDefault();
        const draggingElement = taskList.querySelector('.dragging');
        const afterElement = getDragAfterElement(taskList, event.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggingElement);
        } else {
            taskList.insertBefore(draggingElement, afterElement);
        }
    });

    // Get the element after which the dragging element should be placed
    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };
});
