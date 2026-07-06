document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Data
    const usersDB = JSON.parse(localStorage.getItem('erp_users')) || [];
    const attendanceDB = JSON.parse(localStorage.getItem('erp_attendance')) || [];
    
    // Format Tanggal Hari Ini
    const todayStr = new Date().toISOString().split('T')[0];

    // ==========================================
    // 1. UPDATE TOP METRICS
    // ==========================================
    const totalStaff = usersDB.length;
    
    // Hitung Hadir Hari Ini
    const presentToday = attendanceDB.filter(a => a.date === todayStr && a.timeIn).length;
    const absentToday = totalStaff - presentToday;
    
    document.getElementById('valTotalStaff').textContent = totalStaff;
    document.getElementById('valHadir').textContent = presentToday;
    document.getElementById('valBelumHadir').textContent = absentToday;

    // ==========================================
    // 2. RENDER CHARTS
    // ==========================================
    // Hitung Sebaran per Departemen
    const deptCount = {};
    const genderCount = { 'Laki-laki': 0, 'Perempuan': 0 };

    usersDB.forEach(user => {
        // Department
        const dept = user.department || user.role;
        deptCount[dept] = (deptCount[dept] || 0) + 1;
        
        // Gender
        if (user.gender === 'Laki-laki' || user.gender === 'Perempuan') {
            genderCount[user.gender]++;
        } else {
            // Defaulting if missing
            genderCount['Laki-laki']++; 
        }
    });

    const ctxDept = document.getElementById('deptChart');
    if (ctxDept) {
        new Chart(ctxDept, {
            type: 'bar',
            data: {
                labels: Object.keys(deptCount).map(k => k.toUpperCase()),
                datasets: [{
                    label: 'Jumlah Karyawan',
                    data: Object.values(deptCount),
                    backgroundColor: '#3B82F6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    const ctxGender = document.getElementById('genderChart');
    if (ctxGender) {
        new Chart(ctxGender, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [genderCount['Laki-laki'], genderCount['Perempuan']],
                    backgroundColor: ['#2563EB', '#EC4899']
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

    // ==========================================
    // 3. RENDER TABEL ABSENSI HARI INI
    // ==========================================
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    if (attendanceTableBody) {
        const todayAttendance = attendanceDB.filter(a => a.date === todayStr);
        let html = '';
        if (todayAttendance.length === 0) {
            html = `<tr><td colspan="5" style="text-align: center; color: #6B7280;">Belum ada data absensi hari ini.</td></tr>`;
        } else {
            todayAttendance.forEach((att, index) => {
                const timeOutText = att.timeOut ? att.timeOut : '<span style="color:#F59E0B">Belum Keluar</span>';
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td style="font-weight: 600;">${att.name}</td>
                        <td style="color: #10B981; font-weight: 600;">${att.timeIn}</td>
                        <td style="font-weight: 600;">${timeOutText}</td>
                        <td><span style="background: #D1FAE5; color: #065F46; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">Hadir</span></td>
                    </tr>
                `;
            });
        }
        attendanceTableBody.innerHTML = html;
    }

    // ==========================================
    // 4. RENDER TABEL MANAJEMEN STAF
    // ==========================================
    function renderStaffTable() {
        const staffTableBody = document.getElementById('staffTableBody');
        if (!staffTableBody) return;
        
        let html = '';
        usersDB.forEach((user, idx) => {
            html += `
                <tr>
                    <td style="font-weight: 600; color: #111827;">${user.name}</td>
                    <td style="color: #6B7280;">${user.email}</td>
                    <td><span style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; color: #374151;">${user.role.toUpperCase()}</span></td>
                    <td>${user.gender || '-'}</td>
                    <td>
                        <button onclick="deleteUser('${user.email}')" style="background: #FEE2E2; color: #DC2626; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">Hapus</button>
                    </td>
                </tr>
            `;
        });
        staffTableBody.innerHTML = html;
    }
    
    renderStaffTable();

    // Fungsi Hapus User (Global Scope)
    window.deleteUser = function(email) {
        if(confirm(`Yakin ingin menghapus akun dengan email ${email}?`)) {
            const index = usersDB.findIndex(u => u.email === email);
            if (index > -1) {
                usersDB.splice(index, 1);
                localStorage.setItem('erp_users', JSON.stringify(usersDB));
                window.dispatchEvent(new Event('storage'));
                location.reload();
            }
        }
    };

    // ==========================================
    // 5. MODAL TAMBAH AKUN
    // ==========================================
    const btnTambahAkun = document.getElementById('btnTambahAkun');
    const modal = document.getElementById('addAccountModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const formAddAccount = document.getElementById('formAddAccount');

    if (btnTambahAkun && modal) {
        btnTambahAkun.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (formAddAccount) {
        formAddAccount.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newAccount = {
                name: document.getElementById('addName').value,
                email: document.getElementById('addEmail').value,
                password: document.getElementById('addPassword').value,
                role: document.getElementById('addRole').value,
                department: document.getElementById('addRole').options[document.getElementById('addRole').selectedIndex].text,
                gender: document.getElementById('addGender').value
            };

            // Validasi email
            if (usersDB.some(u => u.email === newAccount.email)) {
                alert("Email sudah digunakan! Silakan gunakan email lain.");
                return;
            }

            usersDB.push(newAccount);
            localStorage.setItem('erp_users', JSON.stringify(usersDB));
            window.dispatchEvent(new Event('storage')); // Trigger firebase-sync
            
            alert("Akun berhasil dibuat!");
            location.reload(); // Muat ulang untuk render ulang chart & tabel
        });
    }
});
