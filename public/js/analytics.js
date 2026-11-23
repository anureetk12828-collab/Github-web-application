async function loadAnalytics() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token not found");
            return;
        }

        const response = await fetch("/api/tasks", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();

        const total = tasks.length;

        const completed = tasks.filter(
            task => task.completed === true
        ).length;

        const pending = tasks.filter(
            task => task.completed === false
        ).length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.completed) {
                return false;
            }

            const due = new Date(task.dueDate);
            due.setHours(0, 0, 0, 0);

            return due < today;
        }).length;

        const high = tasks.filter(
            task => task.priority === "High"
        ).length;

        const medium = tasks.filter(
            task => task.priority === "Medium"
        ).length;

        const low = tasks.filter(
            task => task.priority === "Low"
        ).length;

        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        // Update statistics
        document.getElementById("analyticsTotal").textContent = total;

        document.getElementById("analyticsCompleted").textContent =
            completed;

        document.getElementById("analyticsPending").textContent =
            pending;

        document.getElementById("analyticsOverdue").textContent =
            overdue;

        // Progress
        document.getElementById("analyticsProgressBar")
            .style.width = percentage + "%";

        document.getElementById("analyticsPercentage")
            .textContent = percentage + "% Completed";

        // Priority
        document.getElementById("analyticsHigh").textContent = high;

        document.getElementById("analyticsMedium").textContent = medium;

        document.getElementById("analyticsLow").textContent = low;

    } catch (error) {
        console.error("Analytics error:", error);
    }
}

loadAnalytics();