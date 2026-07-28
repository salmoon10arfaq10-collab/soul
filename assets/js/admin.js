const SUPABASE_URL = 'https://pffsqwmfsontphxqmtkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZnNxd21mc29udHBoeHFtdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjYyMDgsImV4cCI6MjEwMDgwMjIwOH0.Vvs0t33xiXszdsOyLK_ce9FE7e2Eyo33G_mtR_Y_Uzc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSession = null;

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmailEl = document.getElementById('adminEmail');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginError.textContent = 'Logging in...';
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        loginError.textContent = error.message;
        console.error('Login error:', error);
    } else {
        currentSession = data.session;
        showDashboard();
    }
});

logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    currentSession = null;
    loginSection.style.display = 'flex';
    adminDashboard.style.display = 'none';
});

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentSession = session;
        showDashboard();
    }
}

function showDashboard() {
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'flex';
    adminEmailEl.textContent = currentSession?.user?.email || '';
    loadDashboardStats();
}

const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        contentSections.forEach(s => s.classList.remove('active'));
        document.getElementById('section-' + section).classList.add('active');
        pageTitle.textContent = item.textContent.trim();
        loadSectionData(section);
        sidebar.classList.remove('active');
    });
});

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.close).style.display = 'none';
    });
});

async function uploadImage(file, folder) {
    if (!file) return '';
    const { data, error } = await supabaseClient.storage.from('uploads').upload(folder + '/' + Date.now() + '_' + file.name, file);
    if (error) { console.error(error); return ''; }
    const { data: urlData } = supabaseClient.storage.from('uploads').getPublicUrl(data.path);
    return urlData.publicUrl;
}

async function loadDashboardStats() {
    const [blog, events, team, messages] = await Promise.all([
        supabaseClient.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabaseClient.from('events').select('id', { count: 'exact', head: true }),
        supabaseClient.from('team_members').select('id', { count: 'exact', head: true }),
        supabaseClient.from('contact_messages').select('id', { count: 'exact', head: true })
    ]);
    document.getElementById('statBlog').textContent = blog.count || 0;
    document.getElementById('statEvents').textContent = events.count || 0;
    document.getElementById('statTeam').textContent = team.count || 0;
    document.getElementById('statMessages').textContent = messages.count || 0;
    loadRecentMessages();
}

async function loadRecentMessages() {
    const { data } = await supabaseClient.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5);
    const container = document.getElementById('recentMessages');
    if (!data || data.length === 0) { container.innerHTML = '<p style="padding:20px;color:#999;">No messages yet.</p>'; return; }
    let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr></thead><tbody>';
    data.forEach(m => {
        html += '<tr><td>' + m.name + '</td><td>' + m.email + '</td><td>' + (m.message || '').substring(0, 50) + '...</td><td>' + new Date(m.created_at).toLocaleDateString() + '</td></tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function loadSectionData(section) {
    switch(section) {
        case 'causes': loadCauses(); break;
        case 'blog': loadBlog(); break;
        case 'events': loadEvents(); break;
        case 'testimonials': loadTestimonials(); break;
        case 'gallery': loadGallery(); break;
        case 'contact': loadMessages(); break;
        case 'donations': loadDonations(); break;
    }
}

// CAUSES
document.getElementById('addCauseBtn').addEventListener('click', () => {
    document.getElementById('causeId').value = '';
    document.getElementById('causeTitle').value = '';
    document.getElementById('causeDesc').value = '';
    document.getElementById('causeGoal').value = '';
    document.getElementById('causeRaised').value = '0';
    document.getElementById('causeModalTitle').textContent = 'Add Cause';
    document.getElementById('causeModal').style.display = 'flex';
});

document.getElementById('causeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('causeId').value;
    const file = document.getElementById('causeImage').files[0];
    const image_url = await uploadImage(file, 'causes');
    const obj = { title: document.getElementById('causeTitle').value, description: document.getElementById('causeDesc').value, goal: document.getElementById('causeGoal').value, raised: document.getElementById('causeRaised').value };
    if (image_url) obj.image_url = image_url;
    if (id) { await supabaseClient.from('causes').update(obj).eq('id', id); }
    else { await supabaseClient.from('causes').insert([obj]); }
    document.getElementById('causeModal').style.display = 'none';
    loadCauses();
});

async function loadCauses() {
    const { data } = await supabaseClient.from('causes').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('causesList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No causes yet.</p>'; return; }
    c.innerHTML = data.map(item => '<div class="item-card">' + (item.image_url ? '<img src="' + item.image_url + '" alt="">' : '') + '<div class="item-card-body"><h4>' + item.title + '</h4><p>' + (item.description || '').substring(0, 80) + '</p><p><strong>Goal:</strong> $' + item.goal + ' | <strong>Raised:</strong> $' + item.raised + '</p><div class="item-actions"><button class="btn-edit" onclick="editCause(\'' + item.id + '\')">Edit</button><button class="btn-delete" onclick="deleteCause(\'' + item.id + '\')">Delete</button></div></div></div>').join('');
}

window.editCause = async function(id) {
    const { data } = await supabaseClient.from('causes').select('*').eq('id', id).single();
    document.getElementById('causeId').value = data.id;
    document.getElementById('causeTitle').value = data.title;
    document.getElementById('causeDesc').value = data.description;
    document.getElementById('causeGoal').value = data.goal;
    document.getElementById('causeRaised').value = data.raised;
    document.getElementById('causeModalTitle').textContent = 'Edit Cause';
    document.getElementById('causeModal').style.display = 'flex';
};

window.deleteCause = async function(id) {
    if (confirm('Delete this cause?')) { await supabaseClient.from('causes').delete().eq('id', id); loadCauses(); }
};

// BLOG
document.getElementById('addBlogBtn').addEventListener('click', () => {
    document.getElementById('blogId').value = '';
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogAuthor').value = 'Admin';
    document.getElementById('blogCategory').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogModalTitle').textContent = 'Add Blog Post';
    document.getElementById('blogModal').style.display = 'flex';
});

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('blogId').value;
    const file = document.getElementById('blogImage').files[0];
    const image_url = await uploadImage(file, 'blog');
    const obj = { title: document.getElementById('blogTitle').value, author: document.getElementById('blogAuthor').value, category: document.getElementById('blogCategory').value, content: document.getElementById('blogContent').value };
    if (image_url) obj.image_url = image_url;
    if (id) { await supabaseClient.from('blog_posts').update(obj).eq('id', id); }
    else { await supabaseClient.from('blog_posts').insert([obj]); }
    document.getElementById('blogModal').style.display = 'none';
    loadBlog();
});

async function loadBlog() {
    const { data } = await supabaseClient.from('blog_posts').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('blogList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No blog posts yet.</p>'; return; }
    c.innerHTML = data.map(b => '<div class="item-card">' + (b.image_url ? '<img src="' + b.image_url + '" alt="">' : '') + '<div class="item-card-body"><h4>' + b.title + '</h4><p>' + (b.content || '').substring(0, 80) + '</p><p><small>' + b.category + ' | ' + b.author + '</small></p><div class="item-actions"><button class="btn-edit" onclick="editBlog(\'' + b.id + '\')">Edit</button><button class="btn-delete" onclick="deleteBlog(\'' + b.id + '\')">Delete</button></div></div></div>').join('');
}

window.editBlog = async function(id) {
    const { data } = await supabaseClient.from('blog_posts').select('*').eq('id', id).single();
    document.getElementById('blogId').value = data.id;
    document.getElementById('blogTitle').value = data.title;
    document.getElementById('blogAuthor').value = data.author;
    document.getElementById('blogCategory').value = data.category;
    document.getElementById('blogContent').value = data.content;
    document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
    document.getElementById('blogModal').style.display = 'flex';
};

window.deleteBlog = async function(id) {
    if (confirm('Delete this post?')) { await supabaseClient.from('blog_posts').delete().eq('id', id); loadBlog(); }
};

// EVENTS
document.getElementById('addEventBtn').addEventListener('click', () => {
    document.getElementById('eventId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventDesc').value = '';
    document.getElementById('eventModalTitle').textContent = 'Add Event';
    document.getElementById('eventModal').style.display = 'flex';
});

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('eventId').value;
    const file = document.getElementById('eventImage').files[0];
    const image_url = await uploadImage(file, 'events');
    const obj = { title: document.getElementById('eventTitle').value, event_date: document.getElementById('eventDate').value, location: document.getElementById('eventLocation').value, description: document.getElementById('eventDesc').value };
    if (image_url) obj.image_url = image_url;
    if (id) { await supabaseClient.from('events').update(obj).eq('id', id); }
    else { await supabaseClient.from('events').insert([obj]); }
    document.getElementById('eventModal').style.display = 'none';
    loadEvents();
});

async function loadEvents() {
    const { data } = await supabaseClient.from('events').select('*').order('event_date', { ascending: false });
    const c = document.getElementById('eventsList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No events yet.</p>'; return; }
    c.innerHTML = data.map(ev => '<div class="item-card">' + (ev.image_url ? '<img src="' + ev.image_url + '" alt="">' : '') + '<div class="item-card-body"><h4>' + ev.title + '</h4><p>' + (ev.description || '').substring(0, 80) + '</p><p><small>' + ev.event_date + ' | ' + ev.location + '</small></p><div class="item-actions"><button class="btn-edit" onclick="editEvent(\'' + ev.id + '\')">Edit</button><button class="btn-delete" onclick="deleteEvent(\'' + ev.id + '\')">Delete</button></div></div></div>').join('');
}

window.editEvent = async function(id) {
    const { data } = await supabaseClient.from('events').select('*').eq('id', id).single();
    document.getElementById('eventId').value = data.id;
    document.getElementById('eventTitle').value = data.title;
    document.getElementById('eventDate').value = data.event_date;
    document.getElementById('eventLocation').value = data.location;
    document.getElementById('eventDesc').value = data.description;
    document.getElementById('eventModalTitle').textContent = 'Edit Event';
    document.getElementById('eventModal').style.display = 'flex';
};

window.deleteEvent = async function(id) {
    if (confirm('Delete this event?')) { await supabaseClient.from('events').delete().eq('id', id); loadEvents(); }
};

// TESTIMONIALS
document.getElementById('addTestimonialBtn').addEventListener('click', () => {
    document.getElementById('testimonialId').value = '';
    document.getElementById('testimonialName').value = '';
    document.getElementById('testimonialDesignation').value = '';
    document.getElementById('testimonialQuote').value = '';
    document.getElementById('testimonialModalTitle').textContent = 'Add Testimonial';
    document.getElementById('testimonialModal').style.display = 'flex';
});

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('testimonialId').value;
    const file = document.getElementById('testimonialPhoto').files[0];
    const photo_url = await uploadImage(file, 'testimonials');
    const obj = { name: document.getElementById('testimonialName').value, designation: document.getElementById('testimonialDesignation').value, quote: document.getElementById('testimonialQuote').value };
    if (photo_url) obj.photo_url = photo_url;
    if (id) { await supabaseClient.from('testimonials').update(obj).eq('id', id); }
    else { await supabaseClient.from('testimonials').insert([obj]); }
    document.getElementById('testimonialModal').style.display = 'none';
    loadTestimonials();
});

async function loadTestimonials() {
    const { data } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('testimonialsList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No testimonials yet.</p>'; return; }
    c.innerHTML = data.map(t => '<div class="item-card">' + (t.photo_url ? '<img src="' + t.photo_url + '" alt="">' : '') + '<div class="item-card-body"><h4>' + t.name + '</h4><p>' + t.designation + '</p><p>' + (t.quote || '').substring(0, 80) + '</p><div class="item-actions"><button class="btn-edit" onclick="editTestimonial(\'' + t.id + '\')">Edit</button><button class="btn-delete" onclick="deleteTestimonial(\'' + t.id + '\')">Delete</button></div></div></div>').join('');
}

window.editTestimonial = async function(id) {
    const { data } = await supabaseClient.from('testimonials').select('*').eq('id', id).single();
    document.getElementById('testimonialId').value = data.id;
    document.getElementById('testimonialName').value = data.name;
    document.getElementById('testimonialDesignation').value = data.designation;
    document.getElementById('testimonialQuote').value = data.quote;
    document.getElementById('testimonialModalTitle').textContent = 'Edit Testimonial';
    document.getElementById('testimonialModal').style.display = 'flex';
};

window.deleteTestimonial = async function(id) {
    if (confirm('Delete this testimonial?')) { await supabaseClient.from('testimonials').delete().eq('id', id); loadTestimonials(); }
};

// GALLERY
document.getElementById('addGalleryBtn').addEventListener('click', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
        for (const file of input.files) {
            const url = await uploadImage(file, 'gallery');
            if (url) await supabaseClient.from('gallery').insert([{ image_url: url }]);
        }
        loadGallery();
    };
    input.click();
});

async function loadGallery() {
    const { data } = await supabaseClient.from('gallery').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('galleryList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No gallery images yet.</p>'; return; }
    c.innerHTML = data.map(g => '<div class="item-card"><img src="' + g.image_url + '" alt=""><div class="item-card-body"><div class="item-actions"><button class="btn-delete" onclick="deleteGallery(\'' + g.id + '\')">Delete</button></div></div></div>').join('');
}

window.deleteGallery = async function(id) {
    if (confirm('Delete this image?')) { await supabaseClient.from('gallery').delete().eq('id', id); loadGallery(); }
};

// CONTACT MESSAGES
async function loadMessages() {
    const { data } = await supabaseClient.from('contact_messages').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('messagesList');
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No messages yet.</p>'; return; }
    let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Action</th></tr></thead><tbody>';
    data.forEach(m => {
        html += '<tr><td>' + m.name + '</td><td>' + m.email + '</td><td>' + (m.subject || '-') + '</td><td>' + (m.message || '').substring(0, 50) + '...</td><td>' + new Date(m.created_at).toLocaleDateString() + '</td><td><button class="btn-delete" onclick="deleteMessage(\'' + m.id + '\')">Delete</button></td></tr>';
    });
    html += '</tbody></table>';
    c.innerHTML = html;
}

window.deleteMessage = async function(id) {
    if (confirm('Delete this message?')) { await supabaseClient.from('contact_messages').delete().eq('id', id); loadMessages(); }
};

// DONATIONS
async function loadDonations() {
    const { data } = await supabaseClient.from('donations').select('*').order('created_at', { ascending: false });
    const c = document.getElementById('donationsList');
    let total = 0;
    if (data) data.forEach(d => total += parseFloat(d.amount || 0));
    document.getElementById('totalDonations').textContent = '$' + total.toLocaleString();
    document.getElementById('donorCount').textContent = data ? data.length : 0;
    if (!data || !data.length) { c.innerHTML = '<p style="padding:20px;color:#999;">No donations yet.</p>'; return; }
    let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Amount</th><th>Date</th></tr></thead><tbody>';
    data.forEach(d => {
        html += '<tr><td>' + (d.name || 'Anonymous') + '</td><td>' + (d.email || '-') + '</td><td>$' + d.amount + '</td><td>' + new Date(d.created_at).toLocaleDateString() + '</td></tr>';
    });
    html += '</tbody></table>';
    c.innerHTML = html;
}

checkSession();
