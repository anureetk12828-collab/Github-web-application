const token = sessionStorage.getItem("token");

const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskMessage = document.querySelector("#taskMessage");

// Check login
if (!token) {
    window.location.href = "login.html";
}

// API helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (response.status === 401) {
        sessionStorage.removeItem("token");

        window.location.href = "login.html";

        return null;
    }

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

// LOAD TASKS
async function loadTasks() {
    try {
        const tasks = await apiRequest("/api/tasks");

        if (!tasks) return;

        taskList.replaceChildren();

        tasks.forEach((task) => {
            const item = document.createElement("li");

            const title = document.createElement("span");

            title.textContent = task.title;

            if (task.completed) {
                title.style.textDecoration = "line-through";
            }

            // COMPLETE / UNDO
            const completeButton = document.createElement("button");

            completeButton.textContent = task.completed
                ? "Undo"
                : "Complete";

            completeButton.addEventListener("click", async () => {
                await apiRequest(`/api/tasks/${task._id}`, {
                    method: "PATCH",

                    body: JSON.stringify({
                        completed: !task.completed
                    })
                });

                loadTasks();
            });

            // DELETE
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                await apiRequest(`/api/tasks/${task._id}`, {
                    method: "DELETE"
                });

                loadTasks();
            });

            item.append(title, completeButton, deleteButton);

            taskList.append(item);
        });

    } catch (error) {
        taskMessage.textContent = error.message;
    }
}

// ADD TASK
taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const title = document.querySelector("#taskTitle").value.trim();

        await apiRequest("/api/tasks", {
            method: "POST",

            body: JSON.stringify({ title })
        });

        taskForm.reset();

        taskMessage.textContent = "Task added successfully ♡";

        loadTasks();

    } catch (error) {
        taskMessage.textContent = error.message;
    }
});

// LOGOUT
document.querySelector("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("token");

    window.location.href = "login.html";
});

// Initial load
loadTasks();