// AOS.js - Animate on Scroll
AOS.init({
  delay: 200,
  duration: 1500,
  once: false,
  mirror: false,
});

const STORAGE_KEY = 'baagii-ticket-system-v1';

const ticketForm = document.getElementById('ticketForm');
const ticketList = document.getElementById('ticketList');
const ticketEmptyState = document.getElementById('ticketEmptyState');
const ticketStats = document.getElementById('ticketStats');
const clearTicketsBtn = document.getElementById('clearTicketsBtn');

let tickets = loadTickets();

function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Ticket load алдаа:', error);
    return [];
  }
}

function saveTickets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function getPriorityLabel(priority) {
  if (priority === 'high') return 'Өндөр';
  if (priority === 'medium') return 'Дунд';
  return 'Бага';
}

function getPriorityClass(priority) {
  if (priority === 'high') return 'bg-red-100 text-red-700';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function getStatusLabel(status) {
  if (status === 'in_progress') return 'Ажиллаж байна';
  if (status === 'done') return 'Дууссан';
  return 'Шинэ';
}

function getStatusClass(status) {
  if (status === 'in_progress') return 'bg-blue-100 text-blue-700';
  if (status === 'done') return 'bg-gray-200 text-gray-700';
  return 'bg-purple-100 text-purple-700';
}

function renderStats() {
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const doneCount = tickets.filter((t) => t.status === 'done').length;

  ticketStats.textContent = `Нийт: ${total} | Шинэ: ${openCount} | Ажиллаж байгаа: ${inProgressCount} | Дууссан: ${doneCount}`;
}

function renderTickets() {
  ticketList.innerHTML = '';

  if (tickets.length === 0) {
    ticketEmptyState.classList.remove('hidden');
    renderStats();
    return;
  }

  ticketEmptyState.classList.add('hidden');

  tickets
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((ticket) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'border border-gray-200 rounded-lg p-4';

      wrapper.innerHTML = `
        <div class="flex flex-wrap justify-between items-start gap-3">
          <div>
            <h4 class="text-lg font-semibold text-gray-800">${ticket.title}</h4>
            <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${ticket.description}</p>
            <p class="text-xs text-gray-500 mt-2">Үүсгэсэн: ${new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
          <div class="flex gap-2">
            <span class="text-xs font-semibold px-2 py-1 rounded ${getPriorityClass(ticket.priority)}">${getPriorityLabel(ticket.priority)}</span>
            <span class="text-xs font-semibold px-2 py-1 rounded ${getStatusClass(ticket.status)}">${getStatusLabel(ticket.status)}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-action="next-status" data-id="${ticket.id}" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100">Төлөв солих</button>
          <button data-action="delete" data-id="${ticket.id}" class="text-xs bg-red-50 text-red-700 px-3 py-1 rounded hover:bg-red-100">Устгах</button>
        </div>
      `;

      ticketList.appendChild(wrapper);
    });

  renderStats();
}

function createTicket(event) {
  event.preventDefault();

  const formData = new FormData(ticketForm);
  const title = (formData.get('title') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim();
  const priority = (formData.get('priority') || 'medium').toString();

  if (!title || !description) {
    return;
  }

  tickets.push({
    id: Date.now().toString(),
    title,
    description,
    priority,
    status: 'open',
    createdAt: Date.now(),
  });

  saveTickets();
  ticketForm.reset();
  renderTickets();
}

function moveStatus(status) {
  if (status === 'open') return 'in_progress';
  if (status === 'in_progress') return 'done';
  return 'open';
}

function handleTicketActions(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;

  if (action === 'delete') {
    tickets = tickets.filter((ticket) => ticket.id !== id);
  }

  if (action === 'next-status') {
    tickets = tickets.map((ticket) => {
      if (ticket.id !== id) return ticket;
      return { ...ticket, status: moveStatus(ticket.status) };
    });
  }

  saveTickets();
  renderTickets();
}

function clearAllTickets() {
  tickets = [];
  saveTickets();
  renderTickets();
}

if (ticketForm && ticketList && ticketStats && clearTicketsBtn) {
  ticketForm.addEventListener('submit', createTicket);
  ticketList.addEventListener('click', handleTicketActions);
  clearTicketsBtn.addEventListener('click', clearAllTickets);
  renderTickets();
}
