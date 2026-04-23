export function initDashboard() {
    const ctx = document.getElementById('eloChart');
    if (!ctx) return;

    // Check if the chart already exists so we don't draw it twice by accident
    if (window.eloChartInstance) {
        window.eloChartInstance.destroy();
    }

    // Initialize Chart.js
    window.eloChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Standard Elo Rating',
                data: [1200, 1250, 1240, 1380, 1450, 1542], // Mock progression data
                borderColor: '#0284c7', // Your accent color
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#0284c7',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0284c7',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true, // Fills the area under the line
                tension: 0.4 // Gives the line a smooth curve
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false } // Hides the top legend for a cleaner look
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(100, 116, 139, 0.2)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}