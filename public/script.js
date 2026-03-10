// Supabase Configuration
const supabaseUrl = 'https://bdltkniuphchosgvpafd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbHRrbml1cGhjaG9zZ3ZwYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDU2MjAsImV4cCI6MjA4ODcyMTYyMH0.0SiANJDPuOQsngA2KSZ9RgEKrfE-HwEipvBSHh1wPhU';

let supabaseClient;

try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const userDisplay = document.getElementById('user-display');
    const addTaskBtn = document.getElementById('add-task-btn');
    
    console.log('User role from localStorage:', userRole);
    console.log('User email from localStorage:', userEmail);
    
    if (userRole) {
        userDisplay.innerText = userRole === 'Siswa' ? '👤 Siswa Aktif' : '👨‍🏫 Guru Aktif';
        
        // Show add task button for teachers only
        if (userRole === 'Guru' && addTaskBtn) {
            addTaskBtn.classList.remove('hidden');
            console.log('Teacher mode: Add task button shown');
        }
    } else {
        console.log('No role found, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    // Fetch tasks if on dashboard
    if (document.getElementById('tasks-container')) {
        console.log('Fetching tasks...');
        await fetchTasks();
    }
});

// Fetch tasks from Supabase
async function fetchTasks() {
    const container = document.getElementById('tasks-container');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('Current user role:', userRole);
    
    try {
        console.log('Querying Supabase for tasks...');
        const { data: tasks, error } = await supabaseClient
            .from('tasks')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Tasks fetched:', tasks);
        container.innerHTML = ''; // Clear loading skeleton

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<p class="text-blue-300 col-span-full text-center text-lg">📭 Tidak ada tugas saat ini.</p>';
            return;
        }

        tasks.forEach((task, index) => {
            const taskId = task.id;
            console.log(`Rendering task ${index + 1}:`, taskId);
            
            const dateCreated = new Date(task.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            const deadlineDate = new Date(task.deadline).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Status colors
            const statusColor = task.is_submitted ? 'bg-blue-600 text-white' : 'bg-blue-800 text-blue-200';
            const statusText = task.is_submitted ? '✅ Sudah Dikumpulkan' : '⏳ Belum Mengumpulkan';
            
            // Check if deadline is passed
            const now = new Date();
            const deadline = new Date(task.deadline);
            const isOverdue = deadline < now && !task.is_submitted;
            const deadlineClass = isOverdue ? 'text-red-400 font-bold' : 'text-blue-300';

            // Build buttons based on role
            let actionButtons = '';
            let submittedInfo = '';
            
            if (userRole === 'Siswa') {
                if (!task.is_submitted) {
                    actionButtons = `
                        <button onclick="submitTask('${taskId}')" class="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-bold">
                            📤 Kumpulkan Tugas
                        </button>
                    `;
                } else {
                    actionButtons = `
                        <div class="w-full mt-6 py-3 bg-blue-800 text-blue-300 rounded-lg text-center text-sm font-medium">
                            ✓ Tugas sudah dikumpulkan
                        </div>
                    `;
                }
            } else if (userRole === 'Guru') {
                // Tampilkan siapa yang sudah mengumpulkan tugas
                if (task.submitted_by && task.submitted_by.length > 0) {
                    const submittedList = task.submitted_by.map(email => `
                        <div class="flex items-center justify-between bg-blue-800 px-3 py-2 rounded-lg text-sm">
                            <span class="text-blue-200">👤 ${email}</span>
                            <span class="text-green-400 text-xs">✓ Mengumpulkan</span>
                        </div>
                    `).join('');
                    
                    submittedInfo = `
                        <div class="mt-4 p-3 bg-blue-950 rounded-lg border border-blue-700">
                            <p class="text-xs font-bold text-blue-400 mb-2">📋 Siswa yang Mengumpulkan:</p>
                            <div class="space-y-2 max-h-32 overflow-y-auto">
                                ${submittedList}
                            </div>
                            <p class="text-xs text-blue-500 mt-2">Total: ${task.submitted_by.length} siswa</p>
                        </div>
                    `;
                } else {
                    submittedInfo = `
                        <div class="mt-4 p-3 bg-blue-950 rounded-lg border border-blue-700">
                            <p class="text-xs font-bold text-blue-400 mb-2">📋 Siswa yang Mengumpulkan:</p>
                            <p class="text-blue-500 text-sm italic">Belum ada siswa yang mengumpulkan</p>
                        </div>
                    `;
                }
                
                actionButtons = `
                    <div class="flex gap-2 mt-4">
                        <button onclick="deleteTask('${taskId}')" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium">
                            🗑️ Hapus Tugas
                        </button>
                    </div>
                `;
            }

            const card = `
                <div class="bg-blue-900 p-6 rounded-2xl shadow-lg border border-blue-700 hover:shadow-xl transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-xs font-bold uppercase tracking-wider text-blue-300">👨‍🏫 ${task.teacher_name}</span>
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}">${statusText}</span>
                    </div>
                    <h3 class="text-lg font-bold text-blue-100 mb-2">${task.description}</h3>
                    <div class="text-sm text-blue-400 space-y-1 mt-4">
                        <p class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            📅 Dibuat: ${dateCreated}
                        </p>
                        <p class="flex items-center gap-2 ${deadlineClass}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ⏰ Deadline: ${deadlineDate}
                        </p>
                    </div>
                    ${submittedInfo}
                    ${actionButtons}
                </div>
            `;
            container.innerHTML += card;
        });
        
        console.log('Tasks rendered successfully');
    } catch (error) {
        console.error('Error fetching tasks:', error);
        container.innerHTML = `<p class="text-red-400 col-span-full text-center p-4">❌ Gagal mengambil data: ${error.message}</p>`;
    }
}

// Submit task (for students)
async function submitTask(taskId) {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        alert('⚠️ Email tidak ditemukan. Silakan login ulang!');
        return;
    }
    
    console.log('Submitting task:', taskId, 'by:', userEmail);
    
    try {
        // Ambil data tugas terlebih dahulu
        const { data: taskData, error: fetchError } = await supabaseClient
            .from('tasks')
            .select('submitted_by')
            .eq('id', taskId)
            .single();

        if (fetchError) throw fetchError;

        // Update array submitted_by
        let submittedBy = taskData.submitted_by || [];
        if (!submittedBy.includes(userEmail)) {
            submittedBy.push(userEmail);
        }

        const { data, error } = await supabaseClient
            .from('tasks')
            .update({ 
                is_submitted: true,
                submitted_by: submittedBy
            })
            .eq('id', taskId)
            .select();

        if (error) {
            console.error('Submit error:', error);
            throw error;
        }

        console.log('Task submitted successfully:', data);
        alert('✅ Tugas berhasil dikumpulkan!');
        await fetchTasks();
    } catch (error) {
        console.error('Submit task error:', error);
        alert('❌ Gagal mengumpulkan tugas: ' + error.message);
    }
}

// Delete task (for teachers)
async function deleteTask(taskId) {
    console.log('Deleting task:', taskId);
    if (!confirm('⚠️ Apakah Anda yakin ingin menghapus tugas ini?')) {
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .select();

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }

        console.log('Task deleted successfully:', data);
        alert('✅ Tugas berhasil dihapus!');
        await fetchTasks();
    } catch (error) {
        console.error('Delete task error:', error);
        alert('❌ Gagal menghapus tugas: ' + error.message);
    }
}

// Show add task modal (for teachers)
function showAddTaskModal() {
    console.log('Showing add task modal');
    const modal = document.getElementById('add-task-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Hide add task modal
function hideAddTaskModal() {
    console.log('Hiding add task modal');
    const modal = document.getElementById('add-task-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    const form = document.getElementById('add-task-form');
    if (form) {
        form.reset();
    }
}

// Handle add task form submission
async function handleAddTask(e) {
    e.preventDefault();
    console.log('Adding new task...');
    
    const teacherName = document.getElementById('teacher-name').value;
    const description = document.getElementById('task-description').value;
    const deadline = document.getElementById('task-deadline').value;

    console.log('Task data:', { teacherName, description, deadline });

    if (!teacherName || !description || !deadline) {
        alert('❌ Mohon lengkapi semua field!');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('tasks')
            .insert([
                {
                    teacher_name: teacherName,
                    description: description,
                    deadline: deadline,
                    is_submitted: false,
                    submitted_by: []
                }
            ])
            .select();

        if (error) {
            console.error('Add task error:', error);
            throw error;
        }

        console.log('Task added successfully:', data);
        alert('✅ Tugas berhasil ditambahkan!');
        hideAddTaskModal();
        await fetchTasks();
    } catch (error) {
        console.error('Add task error:', error);
        alert('❌ Gagal menambahkan tugas: ' + error.message);
    }
}

// Logout function
function logout() {
    console.log('Logging out...');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

