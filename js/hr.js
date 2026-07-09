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
    
    if (document.getElementById('valTotalStaff')) document.getElementById('valTotalStaff').textContent = totalStaff;
    if (document.getElementById('valHadir')) document.getElementById('valHadir').textContent = presentToday;
    if (document.getElementById('valBelumHadir')) document.getElementById('valBelumHadir').textContent = absentToday;

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
            html = `<tr><td colspan="6" style="text-align: center; color: #6B7280;">Belum ada data absensi hari ini.</td></tr>`;
        } else {
            todayAttendance.forEach((att, index) => {
                const timeOutText = att.timeOut ? att.timeOut : '<span style="color:#F59E0B">Belum Logout</span>';
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td style="font-weight: 600;">${att.name}</td>
                        <td style="color: #10B981; font-weight: 600;">${att.timeIn}</td>
                        <td style="font-weight: 600;">${timeOutText}</td>
                        <td><span style="background: #D1FAE5; color: #065F46; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">${att.status || 'Hadir'}</span></td>
                        <td>
                            <button onclick="deleteAttendance('${att.email}', '${att.date}')" style="background: #FEE2E2; color: #DC2626; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">Hapus</button>
                        </td>
                    </tr>
                `;
            });
        }
        attendanceTableBody.innerHTML = html;
    }

    // Fungsi Hapus Absensi (Global Scope)
    window.deleteAttendance = function(email, date) {
        if(confirm(`Are you sure you want to delete this attendance record?\nThis employee will need to Check In again.`)) {
            const index = attendanceDB.findIndex(a => a.email === email && a.date === date);
            if (index > -1) {
                attendanceDB.splice(index, 1);
                localStorage.setItem('erp_attendance', JSON.stringify(attendanceDB));
                window.dispatchEvent(new Event('storage'));
                location.reload();
            }
        }
    };

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
    // ==========================================
    // 6. MONTHLY RECAP LOGIC
    // ==========================================
    const recapTableBody = document.getElementById('recapTableBody');
    if (recapTableBody) {
        const filterMonth = document.getElementById('filterMonth');
        const filterYear = document.getElementById('filterYear');
        const btnFilterRecap = document.getElementById('btnFilterRecap');
        const btnExportCSV = document.getElementById('btnExportCSV');

        // Populate Years
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 5; i--) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            filterYear.appendChild(opt);
        }

        // Set Default Month & Year
        filterMonth.value = String(new Date().getMonth() + 1).padStart(2, '0');
        filterYear.value = currentYear;

        function renderRecap() {
            const month = filterMonth.value;
            const year = filterYear.value;
            const prefix = `${year}-${month}`;

            let totalPresent = 0;
            let totalLeave = 0;
            let totalSick = 0;
            let totalAbsent = 0;

            let html = '';
            
            usersDB.forEach((user, index) => {
                const userAtt = attendanceDB.filter(a => a.email === user.email && a.date.startsWith(prefix));
                const present = userAtt.filter(a => a.status === 'Hadir').length;
                const leave = userAtt.filter(a => a.status === 'Cuti').length;
                const sick = userAtt.filter(a => a.status === 'Sakit').length;
                const absent = userAtt.filter(a => a.status === 'Alpa').length;

                totalPresent += present;
                totalLeave += leave;
                totalSick += sick;
                totalAbsent += absent;

                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td style="font-weight: 600;">${user.name}</td>
                        <td>${present}</td>
                        <td>${leave}</td>
                        <td>${sick}</td>
                        <td>${absent}</td>
                    </tr>
                `;
            });

            recapTableBody.innerHTML = html;
            
            if (document.getElementById('valRecapPresent')) document.getElementById('valRecapPresent').textContent = totalPresent;
            if (document.getElementById('valRecapLeave')) document.getElementById('valRecapLeave').textContent = totalLeave;
            if (document.getElementById('valRecapSick')) document.getElementById('valRecapSick').textContent = totalSick;
            if (document.getElementById('valRecapAbsent')) document.getElementById('valRecapAbsent').textContent = totalAbsent;
        }

        renderRecap();

        if (btnFilterRecap) {
            btnFilterRecap.addEventListener('click', renderRecap);
        }

        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', () => {
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "No,Nama Karyawan,Hadir,Cuti,Sakit,Alpa\n";
                
                const rows = recapTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length > 0) {
                        const rowData = Array.from(cols).map(col => col.textContent).join(",");
                        csvContent += rowData + "\n";
                    }
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Recap_${filterYear.value}_${filterMonth.value}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    }
});
