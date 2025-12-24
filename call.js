    // Login-related variables and functions
    const loginModal = document.getElementById("loginModal");
    const appContent = document.getElementById("appContent");
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMeInput = document.getElementById("rememberMe");
    const errorMessage = document.getElementById("errorMessage");
    const togglePassword = document.getElementById("togglePassword");
    const userInfoInMenu = document.getElementById("userInfoInMenu");
    const displayUserNameInMenu = document.getElementById("displayUserNameInMenu");
    const displayUnit = document.getElementById("displayUnit");
    const displayPlant = document.getElementById("displayPlant");
    const quickSettingButton = document.getElementById("quickSettingButton");
    const quickSettingPopover = document.getElementById("quickSettingPopover");
    const quickSettingClose = document.getElementById("quickSettingClose");
    const quickUserName = document.getElementById("quickUserName");
    const quickUnit = document.getElementById("quickUnit");
    const quickPlant = document.getElementById("quickPlant");
    const quickEmp = document.getElementById("quickEmp");
    const quickTheme = document.getElementById("quickTheme");
    const quickLogout = document.getElementById("quickLogout");
    const logoutButtonInMenu = document.getElementById("logoutButtonInMenu");
    const themeButton = document.getElementById("themeButton");
    const hamburgerIcon = document.getElementById("hamburgerIcon");
    const settingsDropdown = document.getElementById("settingsDropdown");
    const employeeSheetID = '1eqVoLsZxGguEbRCC5rdI4iMVtQ7CK4T3uXRdx8zE3uw';
    const employeeSheetName = 'EmployeeWeb';
    const employeeUrl = `https://opensheet.elk.sh/${employeeSheetID}/${employeeSheetName}`;
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye');
      togglePassword.classList.toggle('fa-eye-slash');
    });
    // Hamburger Menu Toggle
    if (hamburgerIcon) {
      hamburgerIcon.addEventListener('click', () => {
        settingsDropdown.classList.toggle('show');
      });
    }
    // Quick Setting sheet
    function openQuickSetting() {
      if (!quickSettingPopover) return;
      if (quickSettingPopover.classList.contains('show')) { closeQuickSetting(); return; }
      const username = localStorage.getItem('userName') || '-';
      const unit = localStorage.getItem('userUnit') || '-';
      const plant = localStorage.getItem('userPlant') || '-';
      const emp = localStorage.getItem('username') || '-';
      quickUserName.textContent = username;
      quickUnit.textContent = unit;
      quickPlant.textContent = plant;
      quickEmp.textContent = emp;
      quickSettingPopover.classList.add('show');
    }
    function closeQuickSetting() {
      if (quickSettingPopover) quickSettingPopover.classList.remove('show');
    }
    quickSettingButton.addEventListener('click', openQuickSetting);
    quickSettingClose.addEventListener('click', closeQuickSetting);
    quickTheme.addEventListener('click', () => {
      closeQuickSetting();
      settingModal.style.display = 'block';
    });
    quickLogout.addEventListener('click', () => {
      closeQuickSetting();
      handleLogout();
    });
    // Close dropdown / popover when clicking outside
    document.addEventListener('click', (e) => {
      if (settingsDropdown && hamburgerIcon) {
        if (!settingsDropdown.contains(e.target) && !hamburgerIcon.contains(e.target)) {
          settingsDropdown.classList.remove('show');
        }
      }
      if (quickSettingPopover && quickSettingButton) {
        if (!quickSettingPopover.contains(e.target) && !quickSettingButton.contains(e.target)) {
          closeQuickSetting();
        }
      }
    });
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      errorMessage.style.display = 'none';
      // Basic input validation
      if (!username || username.length !== 7 || !username.startsWith('7')) {
        showError('รหัสพนักงานต้องเป็น 7 หลักและเริ่มต้นด้วย 7');
        return;
      }
      if (!password || password.length !== 4) {
        showError('รหัสผ่านต้องเป็น 4 หลัก');
        return;
      }
      const derivedPassword = username.slice(-4);
      if (password !== derivedPassword) {
        showError('รหัสผ่านไม่ถูกต้อง (ใช้ 4 หลักสุดท้ายของรหัสพนักงาน)');
        return;
      }
      // Show loading in modal
      showLoading();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        const response = await fetch(employeeUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(response.status === 403 ? 'CORS/Access Denied' : 'Fetch Failed');
        }
        const employees = await response.json();
        // Find user
        const user = employees.find(emp => emp.IDRec === username);
        if (!user || !user.Name) {
          throw new Error('User not found');
        }
        // Save session
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userName', user.Name);
        localStorage.setItem('userUnit', user.หน่วยงาน || '-');
        localStorage.setItem('userPlant', user.Plant || '-');
        if (rememberMeInput.checked) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedUsername', username);
        }
        // Success
        hideLoading();
        loginModal.classList.add('hidden');
        appContent.classList.add('logged-in');
        setUserInfoDisplays(user.Name, user.หน่วยงาน || '-', user.Plant || '-', username);
        if (userInfoInMenu) userInfoInMenu.style.display = 'block';
        document.getElementById('searchInput').focus(); // Auto-focus search
        // Load app data
        initApp();
      } catch (error) {
        hideLoading();
        if (error.name === 'AbortError') {
          Swal.fire('Timeout', 'การเชื่อมต่อช้าเกิน 30 วินาที กรุณาลองใหม่', 'error');
        } else if (error.message.includes('403') || error.message.includes('CORS')) {
          Swal.fire('Access Denied', 'ไม่สามารถเข้าถึงข้อมูลพนักงานได้ กรุณาติดต่อผู้ดูแล', 'error');
        } else if (error.message === 'User not found') {
          showError('ไม่พบข้อมูลพนักงานนี้');
        } else {
          Swal.fire('Network Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่', 'error');
        }
      }
    });
    // Show error in modal
    function showError(msg) {
      errorMessage.textContent = msg;
      errorMessage.style.display = 'block';
    }
    // Check login status on load
    function checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const username = localStorage.getItem('username');
        const userName = localStorage.getItem('userName');
        const userUnit = localStorage.getItem('userUnit');
        const userPlant = localStorage.getItem('userPlant');
        if (username && userName) {
          // Validate with derived password (quick check)
          const derivedPassword = username.slice(-4);
          // Assume valid if stored; in production, re-validate with fetch if needed
          loginModal.classList.add('hidden');
          appContent.classList.add('logged-in');
          setUserInfoDisplays(userName, userUnit || '-', userPlant || '-', username);
          if (userInfoInMenu) userInfoInMenu.style.display = 'block';
          if (localStorage.getItem('rememberMe') === 'true') {
            usernameInput.value = localStorage.getItem('savedUsername') || '';
          }
          document.getElementById('searchInput').focus();
          initApp();
          return true;
        }
      }
      // Show login modal
      loginModal.classList.remove('hidden');
      usernameInput.focus();
      return false;
    }
    // Handle logout
    if (logoutButtonInMenu) logoutButtonInMenu.addEventListener('click', handleLogout);
    function handleLogout() {
      localStorage.clear(); // Clear all keys
      settingsDropdown.classList.remove('show');
      location.reload(); // Reload to show login
    }
    // Theme button in menu
    if (themeButton) {
      themeButton.addEventListener('click', () => {
        settingModal.style.display = 'block';
        settingsDropdown.classList.remove('show');
      });
    }
    // Enter key support for login
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !appContent.classList.contains('logged-in')) {
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
    // App Initialization (original code wrapped)
    let allData = [];
    const selectedTickets = new Set();
    let requestQuantities = {};
    let currentPage = 1;
    let itemsPerPage = 20;
    let sortConfig = { column: 'DayRepair', direction: 'desc' };
    let teamChart = null;
    let dashboardFilter = null;
    let callTypeCards = {};
    let currentTicketNumber = null;
    let currentRowData = null;
    const sheetID = '1dzE4Xjc7H0OtNUmne62u0jFQT-CiGsG2eBo-1v6mrZk';
    const sheetName = 'Coll_Stock';
    const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;
    const updateSheetName = 'Update';
    const updateUrl = `https://opensheet.elk.sh/${sheetID}/${updateSheetName}`;
    const requestSheetID = '1xyy70cq2vAxGv4gPIGiL_xA5czDXqS2i6YYqW4yEVbE';
    const requestSheetName = 'Request';
    const requestUrl = `https://opensheet.elk.sh/${requestSheetID}/${encodeURIComponent(requestSheetName)}`;
    const modal = document.getElementById("detailModal");
    const graphModal = document.getElementById("graphModal");
    const summaryModal = document.getElementById("summaryModal");
    const spareSummaryModal = document.getElementById("spareSummaryModal");
    const settingModal = document.getElementById("settingModal");
    const modalContent = document.getElementById("modalContent");
    const closeModal = document.getElementById("closeModal");
    const closeGraphModal = document.getElementById("closeGraphModal");
    const closeSummaryModal = document.getElementById("closeSummaryModal");
    const closeSpareSummaryModal = document.getElementById("closeSpareSummaryModal");
    const closeSettingModal = document.getElementById("closeSettingModal");
    const employeeFilter = document.getElementById("employeeFilter");
    const pendingFilter = document.getElementById("pendingFilter");
    const stockFilter = document.getElementById("stockFilter");
    const statusCallFilter = document.getElementById("statusCallFilter");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const printTableButton = document.getElementById("printTableButton");
    const excelButton = document.getElementById("excelButton");
    const summaryButton = document.getElementById("summaryButton");
    const settingButton = document.getElementById("settingButton");
    const updateGuideButton = document.getElementById("updateGuideButton");
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const tableBody = document.querySelector("#data-table tbody");
    const pageNumbersContainer = document.getElementById("pageNumbers");
    const firstPageButton = document.getElementById("firstPage");
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");
    const lastPageButton = document.getElementById("lastPage");
    const itemsPerPageSelect = document.getElementById("itemsPerPage");
    const graphWarning = document.getElementById("graphWarning");
    const summaryContent = document.getElementById("summaryContent");
    const spareSummaryContent = document.getElementById("spareSummaryContent");
    const updateValueSpan = document.getElementById("updateValue");
    const updateValueHidden = document.getElementById("updateValueHidden");
    const loadingDiv = document.getElementById("loading");
    const callTypeDashboard = document.getElementById("callTypeDashboard");
    // Dashboard cards
    const totalCard = document.getElementById("totalCard");
    const pendingCard = document.getElementById("pendingCard");
    const successCard = document.getElementById("successCard");
    const waitingResponseCard = document.getElementById("waitingResponseCard");
    const over7Card = document.getElementById("over7Card");
    const requestCard = document.getElementById("requestCard");
    const nawaCard = document.getElementById("nawaCard");
    const maxCard = document.getElementById("maxCard");
    const graphCard = document.getElementById("graphCard");
    const spareSummaryCard = document.getElementById("spareSummaryCard");
    function showLoading() {
      loadingDiv.classList.add('show');
    }
    function hideLoading() {
      loadingDiv.classList.remove('show');
    }
    function getCleanTeamPlant(tp) {
      return (tp || "").replace(/Stock\s*/gi, '').trim();
    }
    function setUserInfoDisplays(name, unit, plant, emp) {
      if (displayUserNameInMenu) displayUserNameInMenu.textContent = name;
      if (displayUnit) displayUnit.textContent = unit || '-';
      if (displayPlant) displayPlant.textContent = plant || '-';
      if (quickUserName) quickUserName.textContent = name;
      if (quickUnit) quickUnit.textContent = unit || '-';
      if (quickPlant) quickPlant.textContent = plant || '-';
      if (quickEmp) quickEmp.textContent = emp || '-';
    }
    const normalizePendingUnit = (val) => (val || "").toString().toLowerCase().replace(/\s+/g, '');
    const REQUEST_PENDING_TARGETS = [
      "stockวิภาวดี62",
      "stockvibhavadi62",
      "สต๊อกวิภาวดี62",
      "วิภาวดี62",
      "vibhavadi62"
    ];
    function computeRequestQuantities(data) {
      const result = {};
      if (!Array.isArray(data)) return result;
      data.forEach(row => {
        const material = normalizeMaterial(
          row?.Material ??
          row?.material ??
          row?.MaterialCode ??
          row?.materialcode ??
          row?.Material_Code ??
          row?.Material_code ??
          row?.["Material Code"] ??
          row?.["material code"] ??
          row?.Mat ??
          row?.mat ??
          row?.Item ??
          row?.item ??
          ""
        );
        if (!material) return;
        const qtyRaw = row?.quantity ?? row?.Quantity ?? row?.Qty ?? row?.qty ?? row?.จำนวน ?? row?.จำนวนเบิก ?? row?.["จำนวนเบิก"] ?? row?.["Quantity Order"] ?? row?.["QtyOrder"];
        const qty = parseFloat((qtyRaw ?? "").toString().replace(/,/g, ''));
        if (Number.isNaN(qty)) return;
        result[material] = (result[material] || 0) + qty;
      });
      return result;
    }
    function normalizeMaterial(mat) {
      return (mat || "").toString().trim().replace(/\s+/g, '').toUpperCase();
    }
    async function loadRequestQuantities() {
      console.log("[request] fetch start", requestUrl);
      const response = await fetch(requestUrl, { cache: 'no-store' });
      if (!response.ok) {
        let body = "";
        try { body = await response.text(); } catch (_) { body = ""; }
        console.warn("[request] fetch fail", response.status, body);
        throw new Error(`Request sheet fetch failed (${response.status}) ${body ? `- ${body}` : ""}`.trim());
      }
      const data = await response.json();
      requestQuantities = computeRequestQuantities(data);
      console.log("[request] fetch ok, rows:", Array.isArray(data) ? data.length : 0, "materials:", Object.keys(requestQuantities).length);
      return requestQuantities;
    }
    async function refreshRequestColumn() {
      try {
        await loadRequestQuantities();
      } catch (err) {
        console.warn('Request sheet refresh failed:', err);
      }
      updateRequestCells();
    }
    function updateRequestCells() {
      const cells = document.querySelectorAll("td.request-cell");
      console.log("[request] updateRequestCells start, cells:", cells.length);
      cells.forEach(td => {
        const mat = td.dataset.material || "";
        const pending = td.dataset.pending || "";
        const val = getRequestValue(mat, pending);
        td.innerHTML = "";
        const numericVal = parseFloat(val);
        const shouldShowPill = !isNaN(numericVal) && numericVal > 0;
        if (shouldShowPill) {
          const pill = document.createElement("span");
          pill.className = "request-pill";
          pill.textContent = val;
          td.appendChild(pill);
        } else {
          td.textContent = "-";
        }
      });
      console.log("[request] updateRequestCells done");
    }
    function getRequestValue(material, pendingUnit) {
      const pending = normalizePendingUnit(pendingUnit);
      if (pending && !REQUEST_PENDING_TARGETS.some(t => pending.includes(t))) return "-";
      const key = normalizeMaterial(material);
      if (!key) return "-";
      const qty = requestQuantities[key] ?? null;
      if (qty == null) return "-";
      return Number.isInteger(qty) ? qty.toString() : qty.toFixed(2);
    }
    /** ฟังก์ชันจัดการธีม */
    function setTheme(theme) {
      document.body.className = theme === 'dark' ? 'dark-theme' : '';
      localStorage.setItem('theme', theme);
    }
    function initTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.querySelector(`input[value="${savedTheme}"]`).checked = true;
    }
    // Event listeners สำหรับ setting modal
    if (settingButton) {
      settingButton.addEventListener('click', () => { settingModal.style.display = 'block'; });
    }
    if (updateGuideButton) {
      updateGuideButton.addEventListener('click', () => {
        Swal.fire({
          title: 'วิธีอัพข้อมูล',
          html: `
            <ol style="text-align:left; padding-left:18px; line-height:1.6;">
              <li>ดึงข้อมูล Call ค้างทั้งหมด (หัวข้อที่ 3: รายการงานสำหรับติดตาม Call ค้าง และ OverP)</li>
              <li>ไม่ต้องใส่อะไร แล้วกดปุ่ม "ค้นหา"</li>
              <li>หน้า Call แสดงข้อมูลทั้งหมด กดปุ่ม "Excel" เพื่อดาวน์โหลด</li>
              <li>กลับมาที่หน้าคลังสินค้า Dashboard Call แล้วกดปุ่ม "Data"</li>
              <li>เปิดไฟล์ปลายทาง แล้ว Import ข้อมูลจาก Excel ที่ดาวน์โหลด</li>
              <li>เลือก Import &gt; Upload &gt; เลือกไฟล์ Excel &gt; แทนที่สเปรดชีต &gt; ตกลง</li>
              <li>รอระบบรีเฟรชประมาณ 15 วินาที จากนั้นปิดไฟล์ เป็นอันเสร็จ</li>
            </ol>
          `,
          confirmButtonText: 'รับทราบ',
          width: 600
        });
      });
    }
    closeSettingModal.onclick = () => { settingModal.style.display = 'none'; };
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        setTheme(e.target.value);
      });
    });
    window.addEventListener('click', (e) => {
      if (e.target === settingModal) {
        settingModal.style.display = 'none';
      }
    });
    function updateActiveCard(cardId) {
      // Clear active from all dashboard cards
      document.querySelectorAll('.dashboard-card').forEach(card => card.classList.remove('active'));
      if (cardId) {
        const card = document.getElementById(cardId);
        if (card) card.classList.add('active');
      }
    }
    /** อ่าน Description รองรับสะกดหลายแบบ */
    function getDesc(row) {
      return (row["Description"] ?? row["Discription"] ?? row["Discrtiption"] ?? "-");
    }
    function extractDate(dateTimeStr) {
      if (!dateTimeStr || typeof dateTimeStr !== 'string') return dateTimeStr || "-";
      const match = dateTimeStr.match(/^(\d{2}\/\d{2}\/\d{4})/);
      return match ? match[1] : dateTimeStr;
    }
    function parseDate(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') return null;
      const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
      if (!parts) return null;
      const [, day, month, year, hour, minute, second] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
    }
    function getBaseFilteredData() {
      const selectedTeamPlant = employeeFilter.value;
      const selectedPending = pendingFilter.value;
      const selectedStock = stockFilter.value;
      const selectedStatusCall = statusCallFilter.value;
      const keyword = searchInput.value.toLowerCase().trim();
      return allData.filter(row => {
        if (!row) return false;
        const cleanRowTP = getCleanTeamPlant(row["TeamPlant"]);
        return (
          (!selectedTeamPlant || cleanRowTP === selectedTeamPlant) &&
          (!selectedPending || (row["ค้างหน่วยงาน"] || "") === selectedPending) &&
          (!selectedStock || (row["คลังตอบ"] || "") === selectedStock) &&
          (!selectedStatusCall || (row["StatusCall"] || "") === selectedStatusCall) &&
          (!keyword ||
            (row["DayRepair"] || "").toString().toLowerCase().includes(keyword) ||
            (row["DateTime"] || "").toLowerCase().includes(keyword) ||
            (row["Ticket Number"] || "").toLowerCase().includes(keyword) ||
            (row["Brand"] || "").toLowerCase().includes(keyword) ||
            (row["Call Type"] || "").toLowerCase().includes(keyword) ||
            (row["Team"] || "").toLowerCase().includes(keyword) ||
            cleanRowTP.toLowerCase().includes(keyword) ||
            (row["ค้างหน่วยงาน"] || "").toLowerCase().includes(keyword) ||
            (row["Material"] || "").toLowerCase().includes(keyword) ||
            (getDesc(row) || "").toLowerCase().includes(keyword) ||
            (getRequestValue(row["Material"], row["ค้างหน่วยงาน"]) || "").toString().toLowerCase().includes(keyword) ||
            (row["Nawa"] || "").toLowerCase().includes(keyword) ||
            (row["Vipa"] || "").toLowerCase().includes(keyword) ||
            (row["QtyPlant"] || "").toLowerCase().includes(keyword) ||
            (row["คลังตอบ"] || "").toLowerCase().includes(keyword) ||
            (row["UserAns"] || "").toLowerCase().includes(keyword) ||
            (row["วันที่ตอบ"] || "").toLowerCase().includes(keyword) ||
            (row["StatusCall"] || "").toLowerCase().includes(keyword)
          )
        );
      });
    }
    /** คำนวณเมตริก Dashboard - เปลี่ยนอ้างอิงเป็นค้างหน่วยงาน */
    function calculateDashboardMetrics(data) {
      const ticketSet = new Set();
      const waitingResponseTickets = new Set();
      const pendingTickets = new Set();
      const successTickets = new Set();
      const nawaVipaTickets = new Set();
      const over7Tickets = new Set();
      const requestTickets = new Set();
      const pendingUnitTicketCounts = {};
      data.forEach(row => {
        const ticket = row["Ticket Number"];
        if (!ticket || ticketSet.has(ticket)) return;
        ticketSet.add(ticket);
        if ((row["คลังตอบ"] || "") === "รอตรวจสอบ") {
          waitingResponseTickets.add(ticket);
        }
        const dayRepair = parseFloat(row["DayRepair"]) || 0;
        if (dayRepair > 7) {
          over7Tickets.add(ticket);
        }
        const status = row["StatusCall"];
        if (status === "รอของเข้า") {
          pendingTickets.add(ticket);
        } else if (status === "สำเร็จ") {
          successTickets.add(ticket);
        } else if (status === "เบิกนวนคร" || status === "เบิกวิภาวดี") {
          nawaVipaTickets.add(ticket);
        }
        if (!row["Material"] || row["Material"] === "" || row["Material"] === "-") {
          requestTickets.add(ticket);
        }
        const pendingUnit = row["ค้างหน่วยงาน"] || "ไม่ระบุ";
        if (!pendingUnitTicketCounts[pendingUnit]) pendingUnitTicketCounts[pendingUnit] = new Set();
        pendingUnitTicketCounts[pendingUnit].add(ticket);
      });
      const totalCalls = ticketSet.size;
      const callsPending = pendingTickets.size;
      const callsSuccess = successTickets.size;
      const callsNawaVipa = nawaVipaTickets.size;
      const callsWaitingResponse = waitingResponseTickets.size;
      const callsOver7 = over7Tickets.size;
      const callsRequest = requestTickets.size;
      const pendingUnitCounts = Object.fromEntries(Object.entries(pendingUnitTicketCounts).map(([pendingUnit, set]) => [pendingUnit, set.size]));
      const maxPendingUnitEntry = Object.entries(pendingUnitCounts).length > 0 ? Object.entries(pendingUnitCounts).reduce((a, b) => a[1] > b[1] ? a : b) : null;
      const maxPendingUnit = maxPendingUnitEntry ? maxPendingUnitEntry[0] : '-';
      return {
        totalCalls,
        callsPending,
        callsSuccess,
        callsNawaVipa,
        callsWaitingResponse,
        callsOver7,
        callsRequest,
        maxPendingUnit
      };
    }
    function calculateCallTypeMetrics(data) {
      const ticketSet = new Set();
      const callTypeCounts = {};
      data.forEach(row => {
        const ticket = row["Ticket Number"];
        if (!ticket || ticketSet.has(ticket)) return;
        ticketSet.add(ticket);
        const ct = row["Call Type"] || 'อื่นๆ';
        if (!callTypeCounts[ct]) callTypeCounts[ct] = 0;
        callTypeCounts[ct]++;
      });
      return { callTypeCounts, total: ticketSet.size };
    }
    function updateCallTypeDashboard(data) {
      const metrics = calculateCallTypeMetrics(data);
      const { callTypeCounts, total } = metrics;
      callTypeDashboard.innerHTML = '';
      callTypeCards = {};
      Object.entries(callTypeCounts).forEach(([type, count]) => {
        const card = document.createElement('div');
        card.id = `calltype_${type}Card`;
        card.className = 'dashboard-card';
        let colorClass = 'calltype-other-card';
        if (type === 'P') colorClass = 'calltype-p-card';
        else if (type === 'C') colorClass = 'calltype-c-card';
        else if (type === 'B') colorClass = 'calltype-b-card';
        else if (type === 'U') colorClass = 'calltype-u-card';
        card.classList.add(colorClass);
        const percent = total > 0 ? (count / total * 100).toFixed(0) : 0;
        card.innerHTML = `
          <h3>${type}</h3>
          <div class="value">${count}</div>
          <div class="progress-container"><div class="progress-bar" style="width: ${percent}%;"></div></div>
          <div class="progress-text">${percent}%</div>
        `;
        card.addEventListener('click', () => {
          dashboardFilter = `calltype_${type}`;
          filterAndRenderTable();
        });
        callTypeDashboard.appendChild(card);
        callTypeCards[type] = card;
      });
      // Set active state for the current call type filter if applicable
      if (dashboardFilter && dashboardFilter.startsWith('calltype_')) {
        const activeType = dashboardFilter.split('_')[1];
        const activeCard = callTypeCards[activeType];
        if (activeCard) {
          activeCard.classList.add('active');
        }
      }
    }
    function fetchUpdateDate() {
      fetch(updateUrl)
        .then(r => r.json())
        .then(updateData => {
          if (!updateData || updateData.length === 0) { updateValueSpan.textContent = '-'; return; }
          let maxDate = null, maxDateStr = '';
          updateData.forEach(row => {
            const dateStr = row['Date'];
            const parsedDate = parseDate(dateStr);
            if (parsedDate && (!maxDate || parsedDate > maxDate)) { maxDate = parsedDate; maxDateStr = dateStr; }
          });
          updateValueSpan.textContent = maxDateStr || '-';
          if (updateValueHidden) updateValueHidden.textContent = maxDateStr || '-';
        })
        .catch(() => { updateValueSpan.textContent = '-'; if (updateValueHidden) updateValueHidden.textContent = '-'; });
    }
    function escapeCSVValue(value) {
      if (value == null) return '""';
      const stringValue = value.toString();
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }
    function exportToCSV() {
      if (!allData || allData.length === 0) { alert("ไม่มีข้อมูลในระบบสำหรับการส่งออก CSV"); return; }
      const baseFilteredData = getBaseFilteredData();
      let filteredData = [...baseFilteredData];
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
              break;
            case 'success':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = filteredData.filter(row => {
                const status = row["StatusCall"] || "";
                return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
              });
              break;
          }
        }
      }
      if (filteredData.length === 0) { alert("ไม่มีข้อมูลที่ตรงกับเงื่อนไขการกรอง"); return; }
      filteredData.sort((a, b) => {
        let dayA = parseFloat(a["DayRepair"]) || 0;
        let dayB = parseFloat(b["DayRepair"]) || 0;
        let ticketA = a["Ticket Number"] || "";
        let ticketB = b["Ticket Number"] || "";
        if (dayA !== dayB) return dayB - dayA;
        return ticketA.localeCompare(ticketB);
      });
      const columns = ["DayRepair","DateTime","Ticket Number","Brand","Call Type","Team","TeamPlant","ค้างหน่วยงาน","Material","Description","วันที่ตอบ","UserAns"];
      const displayColumns = { "DayRepair":"ผ่านมา","DateTime":"วันที่แจ้ง","Ticket Number":"Ticket Number","Brand":"Brand","Call Type":"Call Type","Team":"Team","TeamPlant":"ศูนย์พื้นที่","ค้างหน่วยงาน":"ค้างหน่วยงาน","Material":"Material","Description":"Description","วันที่ตอบ":"วันที่ตอบ","UserAns":"ผู้แจ้ง" };
      const csvRows = [];
      csvRows.push(columns.map(col => `"${displayColumns[col]}"`).join(','));
      filteredData.forEach(row => {
        const rowData = columns.map(col => {
          let value;
          if (col === "Description") value = getDesc(row);
          else if (col === "DateTime") value = extractDate(row[col] || "-");
          else value = row[col] || "-";
          if (col === "DayRepair") value = isNaN(parseFloat(value)) ? "-" : parseFloat(value).toFixed(0);
          return escapeCSVValue(value);
        });
        csvRows.push(rowData.join(','));
      });
      const csvContent = csvRows.join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `report_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    /** พิมพ์จากโมดัล: ใช้ currentRowData ให้ตรงกับรายละเอียดที่เห็น */
    function printModalContent() {
      if (!currentRowData) { alert("ไม่พบข้อมูลสำหรับการพิมพ์"); return; }
      const modalData = currentRowData;
      const desc = getDesc(modalData);
      const stickerContent = `
        <div><span class="label">Team:</span> <span class="value team-brand">${modalData["Team"] || "-"}</span></div>
        <div><span class="label">Brand:</span> <span class="value team-brand">${modalData["Brand"] || "-"}</span></div>
        <div><span class="label">Call Type:</span> <span class="value">${modalData["Call Type"] || "-"}</span></div>
        <div><span class="label">วันที่แจ้ง:</span> <span class="value">${extractDate(modalData["DateTime"] || "-")}</span></div>
        <div><span class="label">Ticket Number:</span> <span class="value">${modalData["Ticket Number"] || "-"}</span></div>
        <div><span class="label">ศูนย์พื้นที่:</span> <span class="value">${getCleanTeamPlant(modalData["TeamPlant"]) || "-"}</span></div>
        <div><span class="label">Material:</span> <span class="value">${modalData["Material"] || "-"}</span></div>
        <div class="description"><span class="label">Description:</span> <span class="value">${desc || "-"}</span></div>
      `;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์รายละเอียด</title>
            <style>
              body { font-family: 'Prompt', sans-serif; margin: 0; padding: 0; }
              .sticker { width: 80mm; height: 100mm; border: 1px solid #000; padding: 2mm; box-sizing: border-box; font-size: 13pt; line-height: 1.3; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
              .sticker div { margin-bottom: 1.5mm; overflow-wrap: break-word; }
              .sticker div.description { flex: 1; }
              .sticker .label { font-weight: bold; color: #000; font-size: 14pt; }
              .sticker .value { color: #000; }
              .sticker .value.team-brand { font-size: 20pt; font-weight: bold; }
              h2 { font-size: 14pt; color: #000; margin: 1.5mm 0; }
              @media print {
                body { margin: 0; }
                @page { size: 80mm 100mm; margin: 0; }
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="sticker">
              <h2>รายละเอียด</h2>
              ${stickerContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    /** Order จากโมดัล: แสดง Popup ด้วย SweetAlert2 */
    function orderModalContent() {
  if (!currentRowData) {
    Swal.fire('ผิดพลาด', 'ไม่พบข้อมูลสำหรับการ Order', 'error');
    return;
  }

  // ตรวจสอบสิทธิ์
  if (!canUserOrder()) {
    Swal.fire({
      icon: 'warning',
      title: 'คุณมิอาจก้าวร่วงสิทธินี้ได้ ',
      text: 'สิทธินี้มีไว้สำหรับ แผนกคลัง Spare part วิภาวดี 62 และ แผนกคลังวัตถุดิบ เท่านั้น',
      confirmButtonText: 'OK นะ'
    });
    return;
  }

  const modalData     = currentRowData;
  const desc           = getDesc(modalData);
  const userName       = localStorage.getItem('userName') || 'ไม่ระบุ';
  const userPlant      = localStorage.getItem('userPlant') || '-';
  const employeeCode   = localStorage.getItem('username') || '-'; // รหัสพนักงาน 7 หลัก
  const customer       = `${modalData["Team"] || "-"} (${modalData["Brand"] || "-"})`;
  const defaultPhone   = "0909082850";
// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // URL ของ Google Apps Script Web App (เปลี่ยนเป็นของคุณจริง ๆ)
  const gasUrl = 'https://script.google.com/macros/s/AKfycbycEiGdjEFmLSPSqgBUBBntG0OnaatLTkNozlZTn0RRgZHiuL9HCWisIsmMqth9Dzrv/exec';
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
      Swal.fire({
        title: 'เบิกอะไหล่นอกรอบ',
        html: `
          <div style="text-align: left; font-family: 'Prompt', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; text-align: center; color: #fff; font-size: 18px;"><i class="fas fa-shopping-cart"></i> รายละเอียดการเบิก</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Material:</strong>
                  <span style="text-align: right; flex: 1;">${modalData["Material"] || "-"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Description:</strong>
                  <span style="text-align: right; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${desc || "-"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Ticket Number:</strong>
                  <span style="text-align: right; flex: 1;">${modalData["Ticket Number"] || "-"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Call Type:</strong>
                  <span style="text-align: right; flex: 1;">${modalData["Call Type"] || "-"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">User:</strong>
                  <span style="text-align: right; flex: 1;">${userName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Plant:</strong>
                  <span style="text-align: right; flex: 1;">${userPlant}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">Customer:</strong>
                  <span style="text-align: right; flex: 1; font-weight: bold; color: #fff;">${customer}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                  <strong style="color: #ffd700;">เบอร์ติดต่อ:</strong>
                  <span style="text-align: right; flex: 1; font-weight: bold; color: #fff;">${defaultPhone}</span>
                </div>
              </div>
            </div>
            <label for="quantity" style="display: block; margin-top: 10px; font-weight: bold; color: #fff; font-size: 14px;">จำนวน:</label>
            <input type="number" id="quantity" value="1" min="1" style="width: 100%; padding: 10px; margin-bottom: 10px; border: none; border-radius: 8px; background: rgba(255,255,255,0.9); font-size: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
          </div>
        `,
      showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#dc3545',
    preConfirm: () => {
      const quantity = document.getElementById('quantity').value.trim();
      if (!quantity || parseInt(quantity) < 1) {
        Swal.showValidationMessage('กรุณากรอกจำนวนที่ถูกต้อง (อย่างน้อย 1)');
        return false;
      }
      return { quantity };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { quantity } = result.value;
Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        html: '<div class="spinner" style="width:50px;height:50px;margin:20px auto;"></div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          // แสดง spinner เดียว (ไม่เรียก showLoading)
        }
      });

      // ข้อมูลที่จะส่งไป Google Sheet
      const jsonPayload = {
        material      : modalData["Material"] || "-",
        description   : desc || "-",
        quantity      : quantity,
        contact       : defaultPhone,                 // เบอร์ติดต่อ
        employeeCode  : employeeCode,                 // รหัสพนักงาน
        team          : customer,                     // Team (Brand)
        employeeName  : userName,                     // ชื่อผู้สั่ง
        callNumber    : modalData["Ticket Number"] || "-", 
        callType      : modalData["Call Type"] || "-",
        remark        : "",                           // ถ้ามี remark เพิ่มเติมให้ใส่ตรงนี้
        status        : "รอเบิก"                   // ค่าคงที่ตามที่คุณต้องการ
      };

      try {
        // ส่งข้อมูลไป GAS
        const response = await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `action=insertRequest&payload=${encodeURIComponent(JSON.stringify(jsonPayload))}`
        });

        let responseText = '';
        try {
          responseText = await response.text();
        } catch (readError) {
          responseText = '';
        }

        let result = null;
        try {
          result = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          result = null;
        }

        const statusValue = result && (result.status || result.result || result.ok || result.success);
        const looksSuccess = typeof responseText === "string" && /success/i.test(responseText);
        const looksError = typeof responseText === "string" && /error|ข้อผิดพลาด|ล้มเหลว/i.test(responseText);

        const isExplicitError =
          (result && result.status === "error") ||
          (result && result.error) ||
          looksError;

        const isSuccess =
          statusValue === true ||
          statusValue === "success" ||
          statusValue === "ok" ||
          statusValue === "OK" ||
          statusValue === "Success" ||
          looksSuccess ||
          responseText.trim() === "" ||
          response.type === "opaque" ||
          response.status === 0;

        console.log('GAS response:', result || responseText);

        if (!isExplicitError && isSuccess) {
          const localKey = normalizeMaterial(jsonPayload.material);
          const localQty = parseFloat(quantity);
          if (localKey && !Number.isNaN(localQty)) {
            requestQuantities[localKey] = (requestQuantities[localKey] || 0) + localQty;
            updateRequestCells(); // แสดงผลทันทีโดยไม่ต้องรีเฟรชหน้า
          }
          await refreshRequestColumn();
          if (modal) modal.style.display = "none";
          Swal.fire({
            icon: 'success',
            title: 'สั่งซื้อสำเร็จ!',
            html: `<p>บันทึกข้อมูลเรียบร้อยแล้ว<br>Material: ${jsonPayload.material}<br>จำนวน: ${quantity}</p>`,
            timer: 3000,
            timerProgressBar: true
          }).then(() => {
            // เผื่อเวลาให้ข้อมูลถูกเขียนลงชีตแล้วดึงอีกรอบ โดยไม่ต้องรีเฟรชหน้า
            setTimeout(() => { refreshRequestColumn(); }, 5000);
          });
        } else {
          const errorMessage =
            (result && (result.data || result.error || result.message)) ||
            responseText ||
            `HTTP ${response.status}`;
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ'
        });
      }
    }
  });
}
    /** พิมพ์สติ๊กเกอร์จากหน้าหลัก */
    function printTable() {
      const baseFilteredData = getBaseFilteredData();
      let filteredData = [...baseFilteredData];
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
              break;
            case 'success':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = filteredData.filter(row => {
                const status = row["StatusCall"] || "";
                return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
              });
              break;
          }
        }
      }
      // If user selected tickets via checkbox, narrow to those
      if (selectedTickets.size > 0) {
        filteredData = filteredData.filter(row => selectedTickets.has(row["Ticket Number"]));
      }
      if (filteredData.length === 0) { alert("ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา"); return; }
      filteredData.sort((a, b) => {
        let dayA = parseFloat(a["DayRepair"]) || 0;
        let dayB = parseFloat(b["DayRepair"]) || 0;
        let ticketA = a["Ticket Number"] || "";
        let ticketB = b["Ticket Number"] || "";
        if (dayA !== dayB) return dayB - dayA;
        return ticketA.localeCompare(ticketB);
      });
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedData = selectedTickets.size > 0 ? filteredData : filteredData.slice(startIdx, endIdx);
      const stickersHtml = paginatedData.map(row => {
        const desc = getDesc(row);
        return `
          <div class="sticker">
            <div><span class="label">Team:</span> <span class="value team-brand">${row["Team"] || "-"}</span></div>
            <div><span class="label">Brand:</span> <span class="value team-brand">${row["Brand"] || "-"}</span></div>
            <div><span class="label">Call Type:</span> <span class="value">${row["Call Type"] || "-"}</span></div>
            <div><span class="label">วันที่แจ้ง:</span> <span class="value">${extractDate(row["DateTime"] || "-")}</span></div>
            <div><span class="label">Ticket Number:</span> <span class="value">${row["Ticket Number"] || "-"}</span></div>
            <div><span class="label">ศูนย์พื้นที่:</span> <span class="value">${getCleanTeamPlant(row["TeamPlant"]) || "-"}</span></div>
            <div><span class="label">Material:</span> <span class="value">${row["Material"] || "-"}</span></div>
            <div class="description"><span class="label">Description:</span> <span class="value">${desc || "-"}</span></div>
          </div>
        `;
      }).join('');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์สติ๊กเกอร์</title>
            <style>
              body { font-family: 'Prompt', sans-serif; margin: 0; padding: 0; }
              .sticker { width: 80mm; height: 100mm; border: 1px solid #000; padding: 2mm; box-sizing: border-box; font-size: 13pt; line-height: 1.3; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
              .sticker div { margin-bottom: 1.5mm; overflow-wrap: break-word; }
              .sticker div.description { flex: 1; }
              .sticker .label { font-weight: bold; color: #000; font-size: 14pt; }
              .sticker .value { color: #000; }
              .sticker .value.team-brand { font-size: 16pt; font-weight: bold; }
              @media print {
                body { margin: 0; }
                @page { size: 80mm 100mm; margin: 0; }
              }
            </style>
          </head>
          <body onload="window.print()">
            ${stickersHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
    const totalPlugin = {
      id: 'totalLabel',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        chart.data.labels.forEach((label, index) => {
          let total = 0;
          let topY = chart.chartArea.bottom;
          chart.data.datasets.forEach((dataset) => {
            const value = dataset.data[index] || 0;
            total += value;
            if (value > 0) {
              const dsIndex = chart.data.datasets.findIndex(d => d === dataset);
              const meta = chart.getDatasetMeta(dsIndex);
              const bar = meta.data[index];
              topY = Math.min(topY, bar.y);
            }
          });
          if (total > 0) {
            const x = chart.scales.x.getPixelForValue(index);
            ctx.fillText(total.toString(), x, topY - 10);
          }
        });
        ctx.restore();
      }
    };
    function showGraph() {
      const baseFilteredData = getBaseFilteredData();
      let filteredData = [...baseFilteredData];
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
              break;
            case 'success':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = filteredData.filter(row => {
                const status = row["StatusCall"] || "";
                return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
              });
              break;
          }
        }
      }
      if (filteredData.length === 0) {
        graphWarning.textContent = "ไม่มีข้อมูลสำหรับแสดงกราฟ";
        graphModal.style.display = "block";
        return;
      }
      const pivotData = {};
      const pendingUnitsRaw = filteredData.map(row => row["ค้างหน่วยงาน"] || "ไม่ระบุ");
      let pendingUnits = [...new Set(pendingUnitsRaw)].sort();
      const statusCalls = [...new Set(filteredData.map(row => row["StatusCall"] || "ไม่ระบุ"))].sort();
      pendingUnits.forEach(pendingUnit => {
        pivotData[pendingUnit] = {};
        statusCalls.forEach(status => { pivotData[pendingUnit][status] = 0; });
      });
      const ticketCounts = {};
      filteredData.forEach(row => {
        const ticket = row["Ticket Number"];
        if (!ticketCounts[ticket]) {
          const pendingUnit = row["ค้างหน่วยงาน"] || "ไม่ระบุ";
          const status = row["StatusCall"] || "ไม่ระบุ";
          pivotData[pendingUnit][status]++;
          ticketCounts[ticket] = true;
        }
      });
      // ✅ คำนวณผลรวมสำหรับแต่ละค้างหน่วยงานและเรียงลำดับจากมากไปน้อย
      const pendingUnitTotals = {};
      pendingUnits.forEach(pendingUnit => {
        pendingUnitTotals[pendingUnit] = statusCalls.reduce((sum, status) => sum + (pivotData[pendingUnit][status] || 0), 0);
      });
      pendingUnits.sort((a, b) => pendingUnitTotals[b] - pendingUnitTotals[a]);
      const colors = {
        "รอของเข้า": '#e74c3c',
        "ระหว่างขนส่ง": '#27ae60',
        "เบิกนวนคร": '#3498db',
        "เบิกวิภาวดี": '#f39c12',
        "ไม่ระบุ": '#95a5a6'
      };
      const datasets = statusCalls.filter(status => status !== "ไม่ระบุ" && Object.values(pivotData).some(pu => pu[status] > 0)).map(status => {
        const colorKey = status === "สำเร็จ" ? "ระหว่างขนส่ง" : status;
        const rgb = hexToRgb(colors[colorKey] || '#6c757d');
        return {
          label: status === "สำเร็จ" ? "ระหว่างขนส่ง" : status,
          data: pendingUnits.map(pendingUnit => pivotData[pendingUnit][status] || 0),
          borderColor: colors[colorKey] || '#6c757d',
          backgroundColor: rgb ? `rgba(${rgb}, 0.8)` : '#6c757d',
          borderWidth: 2,
          borderRadius: 4,
          stack: 'CallStack'
        };
      });
      let limitedUnits = pendingUnits;
      let warningMessage = "";
      if (pendingUnits.length > 50) {
        limitedUnits = pendingUnits.slice(0, 50);
        warningMessage = `แสดงเฉพาะ 50 ค้างหน่วยงานแรกจากทั้งหมด ${pendingUnits.length} เนื่องจากข้อจำกัดด้านการแสดงผล`;
      }
      const limitedDatasets = datasets.map(ds => ({
        ...ds,
        data: limitedUnits.map(pendingUnit => pivotData[pendingUnit][ds.label === "ระหว่างขนส่ง" ? "สำเร็จ" : ds.label] || 0)
      }));
      graphWarning.textContent = warningMessage;
      if (limitedUnits.length === 0) { graphWarning.textContent = "ไม่มีข้อมูลสำหรับแสดงกราฟ"; graphModal.style.display = "block"; return; }
      if (teamChart) teamChart.destroy();
      const ctx = document.getElementById('teamChart').getContext('2d');
      teamChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: limitedUnits,
          datasets: limitedDatasets
        },
        options: {
          responsive: true,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                display: false
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          onClick: (event, elements, chart) => {
            if (elements.length > 0) {
              const element = elements[0];
              const index = element.index;
              const pendingUnit = chart.data.labels[index];
              pendingFilter.value = pendingUnit;
              // Reset other filters to show all data for this pendingUnit
              employeeFilter.value = "";
              stockFilter.value = "";
              statusCallFilter.value = "";
              searchInput.value = "";
              dashboardFilter = null;
              updateActiveCard(null);
              filterAndRenderTable();
              // graphModal.style.display = "none"; // ลบการปิด modal เพื่อให้กราฟยังคงแสดงข้อมูลทั้งหมด
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function(context) {
                  return `ค้างหน่วยงาน: ${context[0].label}`;
                },
                label: function(context) {
                  // ✅ แสดงเฉพาะสถานะที่มีข้อมูล (> 0) เท่านั้น
                  if (context.parsed.y > 0) {
                    return `${context.dataset.label}: ${context.parsed.y} Call`;
                  }
                  return null; // ข้ามการแสดงถ้า = 0
                },
                footer: function(context) {
                  // ✅ คำนวณผลรวมเฉพาะสถานะที่มีข้อมูล (> 0)
                  let total = 0;
                  context.forEach(function(ctx) {
                    if (ctx.parsed.y > 0) {
                      total += ctx.parsed.y;
                    }
                  });
                  return `รวม: ${total} Call`;
                }
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          }
        },
        plugins: [totalPlugin]
      });
      graphModal.style.display = "block";
    }
    function showSummary() {
      const baseFilteredData = getBaseFilteredData();
      let filteredData = [...baseFilteredData];
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
              break;
            case 'success':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = filteredData.filter(row => {
                const status = row["StatusCall"] || "";
                return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
              });
              break;
          }
        }
      }
      const uniqueTickets = [...new Set(filteredData.map(row => row["Ticket Number"]).filter(Boolean))].length;
      const totalCalls = uniqueTickets;
      const pivotData = {};
      const teamPlants = [...new Set(filteredData.map(row => getCleanTeamPlant(row["TeamPlant"] || "ไม่ระบุ")) )].sort();
      const statusCalls = [...new Set(filteredData.map(row => row["StatusCall"] || "ไม่ระบุ"))].sort();
      const pendingUnits = [...new Set(filteredData.map(row => row["ค้างหน่วยงาน"] || "ไม่ระบุ"))].sort();
      const orderedPendingUnits = ["NEC_ยกเลิกผลิต"].filter(unit => pendingUnits.includes(unit));
      teamPlants.forEach(teamPlant => {
        pivotData[teamPlant] = {};
        statusCalls.forEach(status => { pivotData[teamPlant][status] = 0; });
        pendingUnits.forEach(pending => { pivotData[teamPlant][pending] = 0; });
      });
      const ticketCounts = {};
      filteredData.forEach(row => {
        const ticket = row["Ticket Number"];
        if (!ticketCounts[ticket]) {
          const teamPlant = getCleanTeamPlant(row["TeamPlant"] || "ไม่ระบุ");
          const status = row["StatusCall"] || "ไม่ระบุ";
          const pending = row["ค้างหน่วยงาน"] || "ไม่ระบุ";
          pivotData[teamPlant][status]++;
          pivotData[teamPlant][pending]++;
          ticketCounts[ticket] = true;
        }
      });
      const teamPlantTotals = teamPlants.map(teamPlant => {
        const total = Object.keys(pivotData[teamPlant]).reduce((sum, key) => {
          if (statusCalls.includes(key)) return sum + pivotData[teamPlant][key];
          return sum;
        }, 0);
        return { teamPlant, total, ...pivotData[teamPlant] };
      }).sort((a, b) => b.total - a.total);
      // ✅ ใส่คลาส summary-table เพื่อให้คอลัมน์ "รวม" จัดกึ่งกลาง
      let pivotTableHtml = `
        <table class='detail-table summary-table'>
          <thead>
            <tr>
              <th>ศูนย์พื้นที่</th>
              <th class='fixed-width'>รวม</th>
              ${statusCalls.map(status => `<th class='fixed-width'>${status}</th>`).join('')}
              ${orderedPendingUnits.map(pending => `<th class='fixed-width'>${pending}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${teamPlantTotals.map(({ teamPlant, total }) => `
              <tr>
                <td>${teamPlant}</td>
                <td class='fixed-width'>${total === 0 ? '-' : total}</td>
                ${statusCalls.map(status => `<td class='fixed-width'>${pivotData[teamPlant][status] === 0 ? '-' : pivotData[teamPlant][status]}</td>`).join('')}
                ${orderedPendingUnits.map(pending => `<td class='fixed-width'>${pivotData[teamPlant][pending] === 0 ? '-' : pivotData[teamPlant][pending]}</td>`).join('')}
              </tr>
            `).join('')}
            <tr>
              <td><strong>รวม</strong></td>
              <td class='fixed-width'><strong>${totalCalls === 0 ? '-' : totalCalls}</strong></td>
              ${statusCalls.map(status => {
                const totalStatus = teamPlants.reduce((sum, teamPlant) => sum + pivotData[teamPlant][status], 0);
                return `<td class='fixed-width'><strong>${totalStatus === 0 ? '-' : totalStatus}</strong></td>`;
              }).join('')}
              ${orderedPendingUnits.map(pending => {
                const totalPending = teamPlants.reduce((sum, teamPlant) => sum + pivotData[teamPlant][pending], 0);
                return `<td class='fixed-width'><strong>${totalPending === 0 ? '-' : totalPending}</strong></td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
      `;
      let summaryHtml = `
        <div><span class='label'>จำนวน Call ทั้งหมด:</span> <span class='value'>${totalCalls} Call</span></div>
        <h3>จำนวน Call ค้างตามศูนย์พื้นที่และสถานะ Call</h3>
        ${pivotTableHtml}
      `;
      summaryContent.innerHTML = summaryHtml;
      summaryModal.style.display = "block";
    }
    function showSpareSummary() {
      const baseFilteredData = getBaseFilteredData();
      let filteredData = baseFilteredData.filter(row => (row["StatusCall"] || "").trim() === "รอของเข้า");
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              // already filtered to pending
              break;
            case 'success':
              filteredData = [];
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = [];
              break;
          }
        }
      }
      if (filteredData.length === 0) {
        spareSummaryContent.innerHTML = '<p>ไม่มีข้อมูลสำหรับ StatusCall = "รอของเข้า"</p>';
        spareSummaryModal.style.display = "block";
        return;
      }
      const pivotData = {};
      const materials = [...new Set(filteredData.map(row => (row["Material"] + '|' + getDesc(row))))];
      const pendingUnits = [...new Set(filteredData.map(row => row["ค้างหน่วยงาน"] || "ไม่ระบุ"))]
        .map(unit => unit.replace(/Stock\s*/gi, '').trim())
        .filter(unit => unit)
        .sort();
      materials.forEach(matDesc => {
        pivotData[matDesc] = { total: 0 };
        pendingUnits.forEach(pending => { pivotData[matDesc][pending] = 0; });
      });
      filteredData.forEach(row => {
        const matDesc = row["Material"] + '|' + getDesc(row);
        const pending = (row["ค้างหน่วยงาน"] || "ไม่ระบุ").replace(/Stock\s*/gi, '').trim();
        if (pivotData[matDesc] && pending) { pivotData[matDesc].total++; pivotData[matDesc][pending]++; }
      });
      const sortedMaterials = materials.sort((a, b) => pivotData[b].total - pivotData[a].total);
      let pivotTableHtml = `
        <table class='detail-table'>
          <thead>
            <tr>
              <th>Material</th>
              <th>Description</th>
              <th class='fixed-width'>จำนวนรวม</th>
              ${pendingUnits.map(pending => `<th class='fixed-width'>${pending}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${sortedMaterials.map(matDesc => {
              const [material, description] = matDesc.split('|');
              const data = pivotData[matDesc];
              return `
                <tr>
                  <td title="${material}">${material}</td>
                  <td title="${description}">${description}</td>
                  <td class='fixed-width'>${data.total === 0 ? '-' : data.total}</td>
                  ${pendingUnits.map(pending => `<td class='fixed-width'>${data[pending] === 0 ? '-' : data[pending]}</td>`).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      spareSummaryContent.innerHTML = pivotTableHtml;
      spareSummaryModal.style.display = "block";
    }
    function printSummaryContent() {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์สรุปข้อมูล</title>
            <style>
              body { font-family: 'Prompt', sans-serif; margin: 10mm; padding: 0; }
              h2, h3 { color: #000; margin: 10px 0; }
              .detail-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .detail-table th, .detail-table td { padding: 8px; border: 1px solid #ccc; text-align: center; }
              .detail-table th { background-color: #007bff; color: white; }
              .detail-table tr:nth-child(even) { background-color: #f9f9f9; }
              .detail-table th:not(:first-child), .detail-table td:not(:first-child) { width: 80px; min-width: 80px; max-width: 80px; }
              .detail-table th:first-child, .detail-table td:first-child { width: auto; min-width: 120px; }
              .label { font-weight: bold; color: #007bff; }
              .value { color: #000; }
              /* ✅ กึ่งกลางคอลัมน์ "รวม" ในหน้าพิมพ์ด้วย */
              .summary-table th:nth-child(2), .summary-table td:nth-child(2){ text-align:center !important; }
              @media print { body { margin: 0; } @page { margin: 10mm; } }
            </style>
          </head>
          <body onload="window.print()">
            <h2>สรุปข้อมูล Call ค้าง</h2>
            ${summaryContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    function printSpareSummaryContent() {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์สรุปอะไหล่</title>
            <style>
              body { font-family: 'Prompt', sans-serif; margin: 10mm; padding: 0; }
              h2, h3 { color: #000; margin: 10px 0; }
              .detail-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; }
              .detail-table th, .detail-table td {
                padding: 4px 6px;
                border: 1px solid #ccc;
                text-align: center;
                font-size: 11px;
                word-break: break-word;
              }
              .detail-table th { background-color: #007bff; color: white; }
              .detail-table tr:nth-child(even) { background-color: #f9f9f9; }
              .detail-table th:first-child, .detail-table td:first-child { min-width: 80px; text-align: left; }
              .detail-table th:nth-child(2), .detail-table td:nth-child(2) { text-align: left; }
              @media print { body { margin: 0; } @page { margin: 10mm; } }
            </style>
          </head>
          <body onload="window.print()">
            <h2>สรุปอะไหล่ (รอของเข้า)</h2>
            ${spareSummaryContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    // Dashboard click events
    totalCard.addEventListener('click', () => {
      dashboardFilter = null;
      updateActiveCard('totalCard');
      // ✅ เพิ่ม: Reset filters กลับไปค่าตั้งต้นเพื่อแสดง Call ทั้งหมด
      employeeFilter.value = "";
      pendingFilter.value = "";
      stockFilter.value = "";
      statusCallFilter.value = "";
      searchInput.value = "";
      filterAndRenderTable();
    });
    pendingCard.addEventListener('click', () => {
      dashboardFilter = 'pending';
      updateActiveCard('pendingCard');
      filterAndRenderTable();
    });
    successCard.addEventListener('click', () => {
      dashboardFilter = 'success';
      updateActiveCard('successCard');
      filterAndRenderTable();
    });
    waitingResponseCard.addEventListener('click', () => {
      dashboardFilter = 'waitingResponse';
      updateActiveCard('waitingResponseCard');
      filterAndRenderTable();
    });
    over7Card.addEventListener('click', () => {
      dashboardFilter = 'over7';
      updateActiveCard('over7Card');
      filterAndRenderTable();
    });
    requestCard.addEventListener('click', () => {
      dashboardFilter = 'request';
      updateActiveCard('requestCard');
      filterAndRenderTable();
    });
    nawaCard.addEventListener('click', () => {
      dashboardFilter = 'nawaVipa';
      updateActiveCard('nawaCard');
      filterAndRenderTable();
    });
    maxCard.addEventListener('click', () => {
      const base = getBaseFilteredData();
      if (base.length === 0) return;
      const metrics = calculateDashboardMetrics(base);
      const maxPU = metrics.maxPendingUnit;
      if (maxPU !== '-') {
        pendingFilter.value = maxPU;
        dashboardFilter = null;
        updateActiveCard('maxCard');
        filterAndRenderTable();
      }
    });
    graphCard.addEventListener('click', showGraph);
    spareSummaryCard.addEventListener('click', showSpareSummary);
    // ปิดโมดัล
    closeModal.onclick = () => { modal.style.display = "none"; currentTicketNumber = null; currentRowData = null; };
    closeGraphModal.onclick = () => graphModal.style.display = "none";
    closeSummaryModal.onclick = () => summaryModal.style.display = "none";
    closeSpareSummaryModal.onclick = () => spareSummaryModal.style.display = "none";
    window.onclick = e => {
      if (e.target == modal) { modal.style.display = "none"; currentTicketNumber = null; currentRowData = null; }
      if (e.target == graphModal) graphModal.style.display = "none";
      if (e.target == summaryModal) summaryModal.style.display = "none";
      if (e.target == spareSummaryModal) spareSummaryModal.style.display = "none";
    };
    // ปุ่มต่าง ๆ
    excelButton.addEventListener("click", exportToCSV);
    summaryButton.addEventListener("click", showSummary);
    itemsPerPageSelect.addEventListener("change", e => { itemsPerPage = parseInt(e.target.value); currentPage = 1; filterAndRenderTable(); });
    searchInput.addEventListener("keypress", e => { if (e.key === "Enter") filterAndRenderTable(); });
    searchButton.addEventListener("click", filterAndRenderTable);
    printTableButton.addEventListener("click", printTable);
    function populateTeamPlantFilter(data) {
      if (!data || data.length === 0) return;
      const teamPlants = [...new Set(data.map(row => getCleanTeamPlant(row["TeamPlant"])).filter(Boolean))].sort();
      employeeFilter.innerHTML = '<option value="">ทั้งหมด</option>';
      teamPlants.forEach(teamPlant => {
        const option = document.createElement("option");
        option.value = teamPlant;
        option.textContent = teamPlant;
        employeeFilter.appendChild(option);
      });
    }
    function updatePendingFilter(data, selectedTeamPlant) {
      if (!data || data.length === 0) return;
      const currentPendingValue = pendingFilter.value;
      const filteredData = selectedTeamPlant ? data.filter(row => getCleanTeamPlant(row["TeamPlant"] || "") === selectedTeamPlant) : data;
      const pendingUnits = [...new Set(filteredData.map(row => row["ค้างหน่วยงาน"]).filter(Boolean))].sort();
      pendingFilter.innerHTML = '<option value="">ทั้งหมด</option>';
      pendingUnits.forEach(pending => {
        const option = document.createElement("option");
        option.value = pending;
        option.textContent = pending;
        pendingFilter.appendChild(option);
      });
      if (currentPendingValue && pendingUnits.includes(currentPendingValue)) pendingFilter.value = currentPendingValue;
      else pendingFilter.value = "";
      updateStockFilter(data, selectedTeamPlant, pendingFilter.value);
      updateStatusCallFilter(data, selectedTeamPlant, pendingFilter.value);
    }
    function updateStockFilter(data, selectedTeamPlant, selectedPending) {
      if (!data || data.length === 0) return;
      const currentStockValue = stockFilter.value;
      let filteredData = data;
      if (selectedTeamPlant) filteredData = filteredData.filter(row => getCleanTeamPlant(row["TeamPlant"] || "") === selectedTeamPlant);
      if (selectedPending) filteredData = filteredData.filter(row => (row["ค้างหน่วยงาน"] || "") === selectedPending);
      const stockResponses = [...new Set(filteredData.map(row => row["คลังตอบ"]).filter(Boolean))].sort();
      stockFilter.innerHTML = '<option value="">ทั้งหมด</option>';
      stockResponses.forEach(stock => {
        const option = document.createElement("option");
        option.value = stock;
        option.textContent = stock;
        stockFilter.appendChild(option);
      });
      if (currentStockValue && stockResponses.includes(currentStockValue)) stockFilter.value = currentStockValue;
      else stockFilter.value = "";
    }
    function updateStatusCallFilter(data, selectedTeamPlant, selectedPending) {
      if (!data || data.length === 0) return;
      const currentStatusCallValue = statusCallFilter.value;
      let filteredData = data;
      if (selectedTeamPlant) filteredData = filteredData.filter(row => getCleanTeamPlant(row["TeamPlant"] || "") === selectedTeamPlant);
      if (selectedPending) filteredData = filteredData.filter(row => (row["ค้างหน่วยงาน"] || "") === selectedPending);
      const statusCalls = [...new Set(filteredData.map(row => row["StatusCall"]).filter(Boolean))].sort();
      statusCallFilter.innerHTML = '<option value="">ทั้งหมด</option>';
      statusCalls.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusCallFilter.appendChild(option);
      });
      if (currentStatusCallValue && statusCalls.includes(currentStatusCallValue)) statusCallFilter.value = currentStatusCallValue;
      else statusCallFilter.value = "";
    }
    function addSortListeners() {
      const sortableHeaders = document.querySelectorAll("th.sortable");
      sortableHeaders.forEach(header => {
        header.addEventListener("click", () => {
          const column = header.getAttribute("data-column");
          if (sortConfig.column === column) sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
          else { sortConfig.column = column; sortConfig.direction = 'asc'; }
          updateSortArrows();
          filterAndRenderTable();
        });
      });
    }
    function updateSortArrows() {
      const sortableHeaders = document.querySelectorAll("th.sortable");
      sortableHeaders.forEach(header => {
        const arrow = header.querySelector(".arrow");
        const column = header.getAttribute("data-column");
        arrow.textContent = (column === sortConfig.column) ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '';
      });
    }
    function filterAndRenderTable() {
      const baseFilteredData = getBaseFilteredData();
      let filteredData = [...baseFilteredData];
      if (dashboardFilter) {
        if (dashboardFilter.startsWith('calltype_')) {
          const type = dashboardFilter.split('_')[1];
          filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
        } else {
          switch(dashboardFilter) {
            case 'pending':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
              break;
            case 'success':
              filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
              break;
            case 'waitingResponse':
              filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
              break;
            case 'over7':
              filteredData = filteredData.filter(row => {
                const day = parseFloat(row["DayRepair"] || 0);
                return day > 7;
              });
              break;
            case 'request':
              filteredData = filteredData.filter(row => {
                const mat = row["Material"] || "";
                return mat === "" || mat === "-" || !mat.trim();
              });
              break;
            case 'nawaVipa':
              filteredData = filteredData.filter(row => {
                const status = row["StatusCall"] || "";
                return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
              });
              break;
          }
        }
      }
      const selectedTeamPlant = employeeFilter.value;
      updatePendingFilter(allData, selectedTeamPlant);
      updateStockFilter(allData, selectedTeamPlant, pendingFilter.value);
      updateStatusCallFilter(allData, selectedTeamPlant, pendingFilter.value);
      // Update Dashboard Metrics
      const metrics = calculateDashboardMetrics(filteredData);
      document.getElementById("totalCalls").textContent = metrics.totalCalls;
      document.getElementById("callsPending").textContent = metrics.callsPending;
      document.getElementById("callsSuccess").textContent = metrics.callsSuccess;
      document.getElementById("callsNawaVipa").textContent = metrics.callsNawaVipa;
      document.getElementById("callsWaitingResponse").textContent = metrics.callsWaitingResponse;
      document.getElementById("callsOver7").textContent = metrics.callsOver7;
      document.getElementById("callsRequest").textContent = metrics.callsRequest;
      document.getElementById("maxPendingUnit").textContent = metrics.maxPendingUnit;
      // Update Progress Bars and Percent Texts
      const total = metrics.totalCalls || 0;
      const calculatePercent = (value) => total > 0 ? ((value / total) * 100).toFixed(0) : 0;
      document.getElementById("totalProgress").style.width = "100%";
      document.getElementById("totalPercent").textContent = "100%";
      document.getElementById("pendingProgress").style.width = `${calculatePercent(metrics.callsPending)}%`;
      document.getElementById("pendingPercent").textContent = `${calculatePercent(metrics.callsPending)}%`;
      document.getElementById("successProgress").style.width = `${calculatePercent(metrics.callsSuccess)}%`;
      document.getElementById("successPercent").textContent = `${calculatePercent(metrics.callsSuccess)}%`;
      document.getElementById("nawaProgress").style.width = `${calculatePercent(metrics.callsNawaVipa)}%`;
      document.getElementById("nawaPercent").textContent = `${calculatePercent(metrics.callsNawaVipa)}%`;
      document.getElementById("requestProgress").style.width = `${calculatePercent(metrics.callsRequest)}%`;
      document.getElementById("requestPercent").textContent = `${calculatePercent(metrics.callsRequest)}%`;
      document.getElementById("over7Progress").style.width = `${calculatePercent(metrics.callsOver7)}%`;
      document.getElementById("over7Percent").textContent = `${calculatePercent(metrics.callsOver7)}%`;
      document.getElementById("waitingResponseProgress").style.width = `${calculatePercent(metrics.callsWaitingResponse)}%`;
      document.getElementById("waitingResponsePercent").textContent = `${calculatePercent(metrics.callsWaitingResponse)}%`;
      // Update Call Type Dashboard (ใช้ baseFilteredData เพื่อแสดงการ์ดทั้งหมด ไม่หายเมื่อกรอง)
      updateCallTypeDashboard(baseFilteredData);
      const uniqueTickets = [...new Set(filteredData.map(row => row["Ticket Number"]).filter(Boolean))].length;
      document.getElementById("ticketCountValue").textContent = uniqueTickets;
      if (sortConfig.column) {
        filteredData.sort((a, b) => {
          let valueA = a[sortConfig.column] ?? (sortConfig.column === "Description" ? getDesc(a) : "");
          let valueB = b[sortConfig.column] ?? (sortConfig.column === "Description" ? getDesc(b) : "");
          if (sortConfig.column === 'DayRepair') {
            let dayA = parseFloat(valueA) || 0, dayB = parseFloat(valueB) || 0;
            let ticketA = a["Ticket Number"] || "", ticketB = b["Ticket Number"] || "";
            if (dayA !== dayB) return sortConfig.direction === 'asc' ? dayA - dayB : dayB - dayA;
            return ticketA.localeCompare(ticketB);
          } else if (sortConfig.column === 'Request') {
            const reqA = parseFloat(getRequestValue(a["Material"], a["ค้างหน่วยงาน"])) || 0;
            const reqB = parseFloat(getRequestValue(b["Material"], b["ค้างหน่วยงาน"])) || 0;
            if (reqA !== reqB) return sortConfig.direction === 'asc' ? reqA - reqB : reqB - reqA;
            return (a["Ticket Number"] || "").localeCompare(b["Ticket Number"] || "");
          } else {
            valueA = valueA.toString().toLowerCase(); valueB = valueB.toString().toLowerCase();
            return sortConfig.direction === 'asc'
              ? (valueA > valueB ? 1 : valueA < valueB ? -1 : 0)
              : (valueA < valueB ? 1 : valueA > valueB ? -1 : 0);
          }
        });
      } else {
        filteredData.sort((a, b) => {
          let dayA = parseFloat(a["DayRepair"]) || 0;
          let dayB = parseFloat(b["DayRepair"]) || 0;
          let ticketA = a["Ticket Number"] || "";
          let ticketB = b["Ticket Number"] || "";
          if (dayA !== dayB) return dayB - dayA;
          return ticketA.localeCompare(ticketB);
        });
      }
      renderTable(filteredData);
      updateCallCount(filteredData);
    }
    employeeFilter.addEventListener("change", filterAndRenderTable);
    pendingFilter.addEventListener("change", filterAndRenderTable);
    stockFilter.addEventListener("change", filterAndRenderTable);
    statusCallFilter.addEventListener("change", filterAndRenderTable);
    function updateCallCount(data) {
      const count = [...new Set(data.map(row => row["Ticket Number"]).filter(Boolean))].length;
      document.getElementById("callCountValue").textContent = count;
    }
    function renderTable(data) {
      tableBody.innerHTML = '';
      if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="20">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</td></tr>';
        return;
      }
      const frag = document.createDocumentFragment();
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedData = data.slice(startIdx, endIdx);
      const ticketGroups = {};
      data.forEach(row => {
        const ticket = row["Ticket Number"];
        if (!ticketGroups[ticket]) ticketGroups[ticket] = [];
        ticketGroups[ticket].push(row);
      });
      const uniqueTickets = Object.keys(ticketGroups).sort();
      const colorMap = {};
      uniqueTickets.forEach((ticket, index) => { colorMap[ticket] = index % 2 === 0 ? "yellow-light" : "pink-pastel"; });
      paginatedData.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.style.animationDelay = `${i * 0.05}s`;
        const ticket = row["Ticket Number"];
        tr.className = colorMap[ticket] || "yellow-light";
        const columns = ["Select","DayRepair","DateTime","Ticket Number","Brand","Call Type","Team","TeamPlant","ค้างหน่วยงาน","Material","Description","Nawa","Vipa","Request","QtyPlant","คลังตอบ","StatusCall","วันที่ตอบ","UserAns","Answer1"];
        columns.forEach(col => {
          const td = document.createElement("td");
          let cellValue;
          if (col === "Select") {
            td.style.textAlign = "center";
            td.style.width = "40px";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = selectedTickets.has(ticket);
            cb.addEventListener("change", () => {
              if (cb.checked) selectedTickets.add(ticket);
              else selectedTickets.delete(ticket);
              updateSelectAllState(paginatedData);
            });
            td.appendChild(cb);
            tr.appendChild(td);
            return;
          }
          if (col === "Description") cellValue = getDesc(row);
          else if (col === "Request") cellValue = getRequestValue(row["Material"], row["ค้างหน่วยงาน"]);
          else cellValue = row[col] || "-";
          if (col === "TeamPlant") {
            cellValue = getCleanTeamPlant(cellValue);
          }
          let displayValue = cellValue;
          if (col === "DateTime") {
            displayValue = extractDate(cellValue);
          }
          if (col === "DayRepair") {
            displayValue = isNaN(parseFloat(displayValue)) ? "-" : parseFloat(displayValue).toFixed(0);
          } else if (col === "คลังตอบ") {
            if (cellValue === "ดำเนินการแล้ว") { displayValue = "ดำเนินการแล้ว"; td.style.color = "var(--success-color)"; td.style.fontWeight = "bold"; }
            else if (cellValue === "รอตรวจสอบ") { displayValue = "รอตรวจสอบ"; td.style.color = "var(--danger-color)"; td.style.fontWeight = "bold"; }
          } else if (col === "StatusCall") {
            if (cellValue === "รอของเข้า") { td.style.color = "var(--danger-color)"; td.style.fontWeight = "bold"; }
            else if (cellValue === "สำเร็จ") { td.style.color = "var(--success-color)"; td.style.fontWeight = "bold"; }
            else if (cellValue === "เบิกนวนคร") { td.style.color = "var(--info-color)"; td.style.fontWeight = "bold"; }
            else if (cellValue === "เบิกวิภาวดี") { td.style.color = "var(--warning-color)"; td.style.fontWeight = "bold"; }
            else { td.style.color = "var(--text-secondary)"; }
          }
          if (col === "Request") {
            td.classList.add("request-cell");
            td.dataset.material = normalizeMaterial(row["Material"]);
            td.dataset.pending = row["ค้างหน่วยงาน"] || "";
            const numericVal = parseFloat(displayValue);
            const shouldShowPill = !isNaN(numericVal) && numericVal > 0;
            if (shouldShowPill) {
              const pill = document.createElement("span");
              pill.className = "request-pill";
              pill.textContent = displayValue;
              td.appendChild(pill);
            } else {
              td.textContent = "-";
            }
          } else {
            td.textContent = displayValue;
          }
          td.classList.add("text-left");
          tr.appendChild(td);
        });
        const detailTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "ดูรายละเอียด";
        btn.className = "detail-button";
        btn.onclick = () => {
          currentTicketNumber = row["Ticket Number"];
          currentRowData = row; // เก็บแถวปัจจุบันสำหรับพิมพ์จากโมดัล
          const timeline = row["TimeLine"] || "";
          let timelineHtml = '<table class="timeline-table"><thead><tr><th>วันที่</th><th>ผู้แจ้ง</th><th>สถานะ</th><th>รายละเอียด</th></tr></thead><tbody>';
          if (timeline) {
            const events = timeline.split('|');
            events.forEach(event => {
              let eventTrim = event.trim();
              if (eventTrim) {
                let date = ''; let person = ''; let status = ''; let details = '';
                const dateMatch = eventTrim.match(/^(\d{2}\.\d{2})\s/);
                if (dateMatch) { date = dateMatch[1]; eventTrim = eventTrim.slice(dateMatch[0].length); }
                if (eventTrim.startsWith('Backlog ')) { person = 'Backlog'; eventTrim = eventTrim.slice(8); }
                else if (eventTrim.startsWith('คุณ')) {
                  const personEnd = eventTrim.indexOf(' ', 3);
                  if (personEnd > -1) { person = eventTrim.slice(0, personEnd); eventTrim = eventTrim.slice(personEnd + 1); }
                  else { person = eventTrim; eventTrim = ''; }
                }
                if (eventTrim.startsWith('แจ้งค้าง_')) {
                  const statusEnd = eventTrim.indexOf(' ', 9);
                  if (statusEnd > -1) { status = eventTrim.slice(0, statusEnd); details = eventTrim.slice(statusEnd + 1); }
                  else { status = eventTrim; details = ''; }
                } else { status = eventTrim; details = ''; }
                timelineHtml += `<tr><td>${date || '-'}</td><td>${person || '-'}</td><td>${status || '-'}</td><td>${details || '-'}</td></tr>`;
              }
            });
          }
          timelineHtml += '</tbody></table>';
          modalContent.innerHTML = `
            <div><span class="label">ผ่านมา:</span> <span class="value">${row["DayRepair"] || "-"}</span></div>
            <div><span class="label">วันที่แจ้ง:</span> <span class="value">${extractDate(row["DateTime"] || "-")}</span></div>
            <div><span class="label">Ticket Number:</span> <span class="value">${row["Ticket Number"] || "-"}</span></div>
            <div><span class="label">Brand:</span> <span class="value">${row["Brand"] || "-"}</span></div>
            <div><span class="label">Call Type:</span> <span class="value">${row["Call Type"] || "-"}</span></div>
            <div><span class="label">Team:</span> <span class="value">${row["Team"] || "-"}</span></div>
            <div><span class="label">ศูนย์พื้นที่:</span> <span class="value">${getCleanTeamPlant(row["TeamPlant"]) || "-"}</span></div>
            <div><span class="label">ค้างหน่วยงาน:</span> <span class="value">${row["ค้างหน่วยงาน"] || "-"}</span></div>
            <div><span class="label">Material:</span> <span class="value">${row["Material"] || "-"}</span></div>
            <div><span class="label">Description:</span> <span class="value">${getDesc(row) || "-"}</span></div>
            <div><span class="label">นวนคร:</span> <span class="value">${row["Nawa"] || "-"}</span></div>
            <div><span class="label">วิภาวดี:</span> <span class="value">${row["Vipa"] || "-"}</span></div>
            <div><span class="label">นอกรอบ:</span> <span class="value">${getRequestValue(row["Material"], row["ค้างหน่วยงาน"])}</span></div>
            <div><span class="label">ศูนย์พื้นที่:</span> <span class="value">${row["QtyPlant"] || "-"}</span></div>
            <div><span class="label">คลังตอบ:</span> <span class="value">${row["คลังตอบ"] || "-"}</span></div>
            <div><span class="label">สถานะ Call:</span> <span class="value">${row["StatusCall"] || "-"}</span></div>
            <div><span class="label">วันที่ตอบ:</span> <span class="value">${row["วันที่ตอบ"] || "-"}</span></div>
            <div><span class="label">ผู้แจ้ง:</span> <span class="value">${row["UserAns"] || "-"}</span></div>
            <div><span class="label">แจ้งผล:</span> <span class="value">${row["Answer1"] || "-"}</span></div>
            <h3>ประวัติ Timeline</h3>
            ${timelineHtml}
          `;
          modal.style.display = "block";
        };
        detailTd.appendChild(btn);
        tr.appendChild(detailTd);
        frag.appendChild(tr);
      });
      tableBody.appendChild(frag);
      updatePagination(data.length);
      updateSelectAllState(paginatedData);
    }
    function updatePagination(totalItems) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      currentPage = Math.min(currentPage, totalPages);
      if (currentPage < 1) currentPage = 1;
      pageNumbersContainer.innerHTML = '';
      const maxPageButtons = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
      if (endPage - startPage + 1 < maxPageButtons) startPage = Math.max(1, endPage - maxPageButtons + 1);
      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-number";
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => { currentPage = i; filterAndRenderTable(); });
        pageNumbersContainer.appendChild(btn);
      }
      firstPageButton.disabled = currentPage === 1;
      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage === totalPages;
      lastPageButton.disabled = currentPage === totalPages;
      firstPageButton.onclick = () => { currentPage = 1; filterAndRenderTable(); };
      prevPageButton.onclick = () => { if (currentPage > 1) { currentPage--; filterAndRenderTable(); } };
      nextPageButton.onclick = () => { if (currentPage < totalPages) { currentPage++; filterAndRenderTable(); } };
      lastPageButton.onclick = () => { currentPage = totalPages; filterAndRenderTable(); };
    }
    function updateSelectAllState(currentPageData) {
      if (!selectAllCheckbox) return;
      if (!currentPageData || currentPageData.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
      }
      const tickets = currentPageData.map(r => r["Ticket Number"]);
      const allSelected = tickets.every(t => selectedTickets.has(t));
      const someSelected = tickets.some(t => selectedTickets.has(t));
      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = !allSelected && someSelected;
    }
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        const baseFilteredData = getBaseFilteredData();
        let filteredData = [...baseFilteredData];
        if (dashboardFilter) {
          if (dashboardFilter.startsWith('calltype_')) {
            const type = dashboardFilter.split('_')[1];
            filteredData = filteredData.filter(row => (row["Call Type"] || "") === type);
          } else {
            switch(dashboardFilter) {
              case 'pending':
                filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "รอของเข้า");
                break;
              case 'success':
                filteredData = filteredData.filter(row => (row["StatusCall"] || "") === "สำเร็จ");
                break;
              case 'waitingResponse':
                filteredData = filteredData.filter(row => (row["คลังตอบ"] || "") === "รอตรวจสอบ");
                break;
              case 'over7':
                filteredData = filteredData.filter(row => {
                  const day = parseFloat(row["DayRepair"] || 0);
                  return day > 7;
                });
                break;
              case 'request':
                filteredData = filteredData.filter(row => {
                  const mat = row["Material"] || "";
                  return mat === "" || mat === "-" || !mat.trim();
                });
                break;
              case 'nawaVipa':
                filteredData = filteredData.filter(row => {
                  const status = row["StatusCall"] || "";
                  return status === "เบิกนวนคร" || status === "เบิกวิภาวดี";
                });
                break;
            }
          }
        }
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const paginatedData = filteredData.slice(startIdx, endIdx);
        paginatedData.forEach(row => {
          const ticket = row["Ticket Number"];
          if (!ticket) return;
          if (selectAllCheckbox.checked) selectedTickets.add(ticket);
          else selectedTickets.delete(ticket);
        });
        updateSelectAllState(paginatedData);
        renderTable(filteredData);
      });
    }
    // Initialize App (load data after login)
    function initApp() {
      showLoading();
      const mainDataPromise = fetch(url)
        .then(r => {
          if (!r.ok) throw new Error(`Main sheet fetch failed (${r.status})`);
          return r.json();
        });
      const requestPromise = loadRequestQuantities();
      Promise.allSettled([mainDataPromise, requestPromise])
        .then(results => {
          const [mainRes, reqRes] = results;
          if (mainRes.status !== 'fulfilled') {
            console.error('Error fetching main data:', mainRes.reason);
            hideLoading();
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลหลัก');
            return;
          }
          if (reqRes.status !== 'fulfilled') {
            console.warn('Request sheet load failed:', reqRes.reason);
            requestQuantities = {};
            // แจ้งผู้ใช้แบบไม่ขัดจังหวะ
            Swal.fire('คำเตือน', 'ไม่สามารถโหลดข้อมูลนอกรอบได้ (Request sheet)', 'warning');
          }
          const rawData = mainRes.value || [];
          const normalizedData = rawData.map(row => {
            const material =
              row?.Material ??
              row?.material ??
              row?.MaterialCode ??
              row?.materialcode ??
              row?.Material_Code ??
              row?.Material_code ??
              row?.Mat ??
              row?.mat ??
              row?.Item ??
              row?.item ??
              "";
            if (material) return { ...row, Material: material };
            return row;
          });
          allData = normalizedData;
          populateTeamPlantFilter(normalizedData);
          updatePendingFilter(normalizedData, employeeFilter.value);
          updateStockFilter(normalizedData, employeeFilter.value, pendingFilter.value);
          updateStatusCallFilter(normalizedData, employeeFilter.value, pendingFilter.value);
          filterAndRenderTable();
          addSortListeners();
          hideLoading();
        })
        .catch(err => {
          console.error('Unexpected error loading app:', err);
          hideLoading();
          alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        });
      fetchUpdateDate();
      initTheme();
    }
    // Initial check on page load
    checkLoginStatus();
   function canUserOrder() {
  const userUnit = localStorage.getItem('userUnit') || '';
  const allowedUnits = [
    'แผนกคลัง Spare part วิภาวดี 62',
    'แผนกคลังวัตถุดิบ'
  ];
  return allowedUnits.includes(userUnit.trim());
}
  
