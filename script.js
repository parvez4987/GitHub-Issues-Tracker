// all Elements
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const spinner = document.getElementById('spinner');
const issuesContainer = document.getElementById('issues-container');
const issueCount = document.getElementById('issue-count');
const tabBtns = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const issueModal = document.getElementById('issue-modal');
const modalContent = document.getElementById('modal-content');


let allIssues = [];
let currentFilter = 'All';

//API
const URL = 'https://phi-lab-server.vercel.app/api/v1/lab';

//Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        fetchIssues(); 
    } else {
        loginError.classList.remove('hidden');
    }
});

//fetching all issuees
async function fetchIssues() {
    toggleSpinner(true);
    try {
        const response = await fetch(`${URL}/issues`);
        const data = await response.json();
        allIssues = Array.isArray(data) ? data : (data.data || []);
        applyFiltersAndRender();
    } catch (error) {
        console.error("ERROR FETCHING/RENDERING:", error);
        issuesContainer.innerHTML = `<div class="col-span-full bg-red-50 text-red-500 p-4 rounded border border-red-200">Failed to load issues. Check browser console.</div>`;
    } finally {
        toggleSpinner(false);
    }
}


//searching function
async function searchIssues(query) {
    if(!query) return fetchIssues();
    toggleSpinner(true);
    try {
        const response = awaitfetch(`${URL}/issues/search?q=${query}}`);
        const data = await response.json();
        allIssues = Array.isArray(data) ? data : (data.data || []);
        applyFiltersAndRender();
    } catch (error) {
        console.error("Search error:", error);
    } finally {
        toggleSpinner(false);
    }
}

async function fetchSingleIssue(id) {
    toggleSpinner(true);
    try {
        const response = await fetch(`${URL}/issue/${id}`);
        const data = await response.json();
        renderModal(data.data || data);
    } catch (error) {
        console.error("Single issue fetch error:", error);
    } finally {
        toggleSpinner(false);
    }
}


function getPriorityBadge(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return '<span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500">HIGH</span>';
    if (p === 'medium') return '<span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">MEDIUM</span>';
    if (p === 'low') return '<span class="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">LOW</span>';
    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">${priority || 'NONE'}</span>`;
}

function getLabelBadge(labelData) {
    if (!labelData) return '';

    if (Array.isArray(labelData)) {
        return labelData.map(label => getLabelBadge(label)).join(' ');
    }

    let l = typeof labelData === 'object' ? (labelData.name || labelData.label || '') : String(labelData);
    l = l.toLowerCase();

    if (l.includes('bug')) return '<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-200 uppercase tracking-wide"><i class="fas fa-bug mr-1"></i> BUG</span>';
    if (l.includes('help')) return '<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200 uppercase tracking-wide"><i class="fas fa-life-ring mr-1"></i> HELP WANTED</span>';
    if (l.includes('enhancement')) return '<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 uppercase tracking-wide"><i class="fas fa-magic mr-1"></i> ENHANCEMENT</span>';
    
    if (!l) return '';
    
    const displayText = typeof labelData === 'object' ? l : labelData;
    return `<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 uppercase tracking-wide">${displayText}</span>`;
}


function applyFiltersAndRender() {
    let filteredIssues = allIssues;
    if (currentFilter !== 'All') {
        filteredIssues = allIssues.filter(issue => issue.status?.toLowerCase() === currentFilter.toLowerCase());
    }
    
    issueCount.textContent = filteredIssues.length;
    issuesContainer.innerHTML = '';

    if(filteredIssues.length === 0) {
        issuesContainer.innerHTML = `<div class="col-span-full text-center text-gray-500 py-8 font-semibold">No issues found.</div>`;
        return;
    }

    filteredIssues.forEach((issue, index) => {
        const isClosed = issue.status?.toLowerCase() === 'closed';
        const borderClass = isClosed ? 'border-t-[#A855F7]' : 'border-t-[#22C55E]';
        
       
        const statusIcon = isClosed 
            ? '<img src="assets/Closed- Status .png" alt="Closed" class="w-5 h-5">' 
            : '<img src="assets/Open-Status.png" alt="Open" class="w-5 h-5">';

        const card = document.createElement('div');
        card.className = `bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 border-t-4 ${borderClass} flex flex-col h-full overflow-hidden`;
        card.onclick = () => fetchSingleIssue(issue.id || issue._id);

        const labelHtml = getLabelBadge(issue.label || issue.labels);
        const categoryHtml = getLabelBadge(issue.category);
        const combinedLabels = [labelHtml, categoryHtml].filter(Boolean).join('');

        card.innerHTML = `
            <div class="p-5 flex flex-col h-full">
                <div class="flex justify-between items-start mb-3">
                    ${statusIcon}
                    ${getPriorityBadge(issue.priority)}
                </div>
                
                <h3 class="font-bold text-gray-800 text-[16px] leading-tight mb-2 hover:text-[#5832FA] line-clamp-2">${issue.title || 'Untitled'}</h3>
                <p class="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-grow">${issue.description || 'No description provided.'}</p>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    ${combinedLabels}
                </div>
                
                <div class="pt-4 border-t border-gray-100 mt-auto">
                    <p class="text-[12px] text-gray-500 mb-1">#${index + 1} by ${issue.author || 'Unknown'}</p>
                    <p class="text-[12px] text-gray-400">${new Date(issue.createdAt).toLocaleDateString('en-US')}</p>
                </div>
            </div>
        `;
        issuesContainer.appendChild(card);
    });
}

function renderModal(issue) {
    const isClosed = issue.status?.toLowerCase() === 'closed';
    const statusBg = isClosed ? 'bg-[#A855F7]' : 'bg-[#00A96E]';
    const statusText = isClosed ? 'Closed' : 'Opened';

    const labelHtml = getLabelBadge(issue.label || issue.labels);
    const categoryHtml = getLabelBadge(issue.category);
    const combinedLabels = [labelHtml, categoryHtml].filter(Boolean).join('');

    modalContent.innerHTML = `
        <h2 class="font-bold text-[28px] text-[#1F2937] mb-3 leading-tight">${issue.title}</h2>
        
        <div class="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-6 font-medium">
            <span class="px-3 py-1 rounded-full text-white font-bold text-xs ${statusBg}">${statusText}</span>
            <span>•</span>
            <span>${statusText} by <span class="text-gray-700 font-semibold">${issue.author || 'Unknown'}</span></span>
            <span>•</span>
            <span>${new Date(issue.createdAt).toLocaleDateString('en-GB')}</span>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
            ${combinedLabels}
        </div>

        <p class="text-gray-600 text-[15px] whitespace-pre-wrap desc-scroll max-h-48 overflow-y-auto leading-relaxed mb-8">${issue.description}</p>
        
        <div class="bg-[#F8FAFC] rounded-xl p-5 flex justify-between items-center mb-6 border border-gray-100">
            <div>
                <p class="text-gray-500 text-[13px] mb-1 font-medium">Assignee:</p>
                <p class="font-bold text-gray-900">${issue.author || 'Unassigned'}</p>
            </div>
            <div class="text-right">
                <p class="text-gray-500 text-[13px] mb-1 font-medium text-left">Priority:</p>
                ${getPriorityBadge(issue.priority)}
            </div>
        </div>

        <div class="flex justify-end mt-2">
            <form method="dialog">
                <button class="bg-[#5832FA] hover:bg-purple-700 text-white px-8 py-2.5 rounded-lg font-bold transition">Close</button>
            </form>
        </div>
    `;
    
    issueModal.showModal();
}


tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => {
            b.classList.remove('bg-[#5832FA]', 'text-white', 'border-[#5832FA]');
            b.classList.add('bg-white', 'text-gray-500');
        });
        
        const target = e.target;
        target.classList.remove('bg-white', 'text-gray-500');
        target.classList.add('bg-[#5832FA]', 'text-white', 'border-[#5832FA]');

        currentFilter = target.getAttribute('data-filter');
        applyFiltersAndRender();
    });
});

searchBtn.addEventListener('click', () => searchIssues(searchInput.value.trim()));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchIssues(searchInput.value.trim());
});


function toggleSpinner(show) {
    if (show) {
        spinner.classList.remove('hidden');
        spinner.classList.add('flex');
    } else {
        spinner.classList.add('hidden');
        spinner.classList.remove('flex');
    }
}