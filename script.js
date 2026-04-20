// State Management
let problems = JSON.parse(localStorage.getItem('reportedProblems')) || [];
let myChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderProblems();
});

// Navigation Function
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'view') renderProblems();
    if (sectionId === 'dashboard') updateDashboard();
}

// Dark Mode Toggle
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Handle Form Submission
document.getElementById('problemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageFile = document.getElementById('imageInput').files[0];
    let imageData = 'https://via.placeholder.com/300?text=No+Image';

    if (imageFile) {
        imageData = await convertToBase64(imageFile);
    }

    const newProblem = {
        id: Date.now(),
        name: document.getElementById('userName').value,
        location: document.getElementById('location').value,
        type: document.getElementById('problemType').value,
        description: document.getElementById('description').value,
        image: imageData,
        status: 'Pending',
        date: new Date().toLocaleDateString()
    };

    problems.push(newProblem);
    localStorage.setItem('reportedProblems', JSON.stringify(problems));
    
    alert('Thank you! Problem reported successfully.');
    document.getElementById('problemForm').reset();
    showSection('view');
});

// Helper: Convert Image to Base64
function convertToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// Render Problems to Grid
function renderProblems(filteredData = problems) {
    const grid = document.getElementById('problemsGrid');
    grid.innerHTML = '';

    filteredData.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${p.image}" class="card-img" alt="problem">
            <div class="card-content">
                <span class="status-badge ${p.status.toLowerCase()}">${p.status}</span>
                <h4 style="color: var(--primary)">${p.type}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
                <p style="margin: 10px 0; font-size: 0.9rem;">${p.description}</p>
                <p><small>By: ${p.name} | ${p.date}</small></p>
                ${p.status === 'Pending' ? `<button onclick="markSolved(${p.id})" class="btn-primary" style="margin-top:10px; padding: 5px 15px; font-size: 0.8rem;">Mark as Solved</button>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter and Search
function filterProblems() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;

    const filtered = problems.filter(p => {
        const matchesSearch = p.location.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || p.type === typeFilter;
        return matchesSearch && matchesType;
    });

    renderProblems(filtered);
}

// Mark as Solved
function markSolved(id) {
    problems = problems.map(p => p.id === id ? {...p, status: 'Solved'} : p);
    localStorage.setItem('reportedProblems', JSON.stringify(problems));
    renderProblems();
    updateDashboard();
}

// Dashboard Logic
function updateDashboard() {
    const total = problems.length;
    const solved = problems.filter(p => p.status === 'Solved').length;
    const pending = total - solved;

    document.getElementById('totalCount').innerText = total;
    document.getElementById('solvedCount').innerText = solved;
    document.getElementById('pendingCount').innerText = pending;

    initChart(solved, pending);
}

function initChart(solved, pending) {
    const ctx = document.getElementById('problemsChart').getContext('2d');
    
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Solved', 'Pending'],
            datasets: [{
                data: [solved, pending],
                backgroundColor: ['#138808', '#ff9933'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}